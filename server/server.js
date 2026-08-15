// ============================================================================
// Full Track POS — Web Backend (Node.js/Express + sql.js)
// API endpoints replacing Electron IPC communication
// Database: SQLite (via sql.js - pure JavaScript, no native compilation needed)
// ============================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'brasa-pos.db');

// ============================================================================
// Database Initialization (sql.js)
// ============================================================================

let SQL;
let db;
let saveInterval;

async function initDb() {
  try {
    // Initialize sql.js
    SQL = await initSqlJs();

    // Load existing database or create new one
    if (fs.existsSync(DB_PATH)) {
      const filebuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(filebuffer);
      console.log('✓ Base de datos cargada desde:', DB_PATH);
    } else {
      db = new SQL.Database();
      console.log('✓ Nueva base de datos creada');
    }

    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS kv_store (
        scope TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT,
        updated_at TEXT,
        PRIMARY KEY (scope, key)
      );
    `);

    // Save database to disk
    saveDb();

    // Auto-save every 5 seconds
    saveInterval = setInterval(saveDb, 5000);

    console.log('✓ Database initialized at:', DB_PATH);
  } catch (err) {
    console.error('✗ Database initialization failed:', err);
    process.exit(1);
  }
}

function saveDb() {
  try {
    if (!db) return;
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// ============================================================================
// Middleware
// ============================================================================

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ============================================================================
// API Routes: Storage (key-value store backed by SQLite)
// ============================================================================

// GET /api/storage/:key?shared=true
app.get('/api/storage/:key', (req, res) => {
  try {
    const { key } = req.params;
    const shared = req.query.shared === 'true';
    const scope = shared ? 'shared' : 'personal';

    const result = db.exec(
      'SELECT value FROM kv_store WHERE scope=? AND key=?',
      [scope, key]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ key, value: null, shared, error: 'Key not found' });
    }

    const value = result[0].values[0][0];
    res.json({ key, value, shared });
  } catch (err) {
    console.error('Storage GET error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/storage - Set a key
app.post('/api/storage', (req, res) => {
  try {
    const { key, value, shared } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Missing key or value' });
    }

    const scope = shared ? 'shared' : 'personal';
    db.run(
      `INSERT INTO kv_store (scope, key, value, updated_at) VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(scope, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [scope, key, value]
    );

    res.json({ key, value, shared });
  } catch (err) {
    console.error('Storage SET error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/storage/:key?shared=true
app.delete('/api/storage/:key', (req, res) => {
  try {
    const { key } = req.params;
    const shared = req.query.shared === 'true';
    const scope = shared ? 'shared' : 'personal';

    db.run('DELETE FROM kv_store WHERE scope=? AND key=?', [scope, key]);

    res.json({ key, deleted: true, shared });
  } catch (err) {
    console.error('Storage DELETE error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/storage/list/:prefix?shared=true
app.get('/api/storage/list/:prefix?', (req, res) => {
  try {
    const prefix = req.params.prefix || '';
    const shared = req.query.shared === 'true';
    const scope = shared ? 'shared' : 'personal';

    let result;
    if (prefix) {
      result = db.exec(
        'SELECT key FROM kv_store WHERE scope=? AND key LIKE ? ORDER BY key',
        [scope, prefix + '%']
      );
    } else {
      result = db.exec(
        'SELECT key FROM kv_store WHERE scope=? ORDER BY key',
        [scope]
      );
    }

    const keys = result.length > 0 ? result[0].values.map(row => row[0]) : [];

    res.json({ keys, prefix: prefix || null, shared });
  } catch (err) {
    console.error('Storage LIST error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/storage/all-keys?shared=true
app.get('/api/storage/all-keys', (req, res) => {
  try {
    const shared = req.query.shared === 'true';
    const scope = shared ? 'shared' : 'personal';

    const result = db.exec(
      'SELECT key FROM kv_store WHERE scope=? ORDER BY key',
      [scope]
    );

    const keys = result.length > 0 ? result[0].values.map(row => row[0]) : [];

    res.json({ keys, shared });
  } catch (err) {
    console.error('Storage LIST ALL error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// API Routes: Database path (for backups/info)
// ============================================================================

app.get('/api/storage/db-path', (req, res) => {
  res.json({ dbPath: DB_PATH });
});

// ============================================================================
// API Routes: Printers (web version note: actual printing is browser-based)
// ============================================================================

app.get('/api/printers', (req, res) => {
  // In web version, printers are handled by browser print dialog
  // Return empty list; frontend will use window.print()
  res.json({ printers: [] });
});

// ============================================================================
// API Routes: Database export/backup
// ============================================================================

app.get('/api/backup', (req, res) => {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="brasa-pos_${new Date().toISOString().split('T')[0]}.db"`);
    res.send(buffer);
  } catch (err) {
    console.error('Backup error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Health check
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: DB_PATH, type: 'sql.js' });
});

// ============================================================================
// 404 Handler - Serve index.html for SPA routing
// ============================================================================

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ============================================================================
// Startup
// ============================================================================

(async () => {
  await initDb();

  app.listen(PORT, () => {
    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║     Full Track POS - Web Backend      ║`);
    console.log(`║     Running on http://localhost:${PORT.toString().padEnd(8, ' ')}║`);
    console.log(`╚════════════════════════════════════════╝\n`);
    console.log(`Sistema: Node.js + Express + sql.js (SQLite puro JavaScript)`);
    console.log(`Base de datos: ${DB_PATH}`);
    console.log(`\nAbre tu navegador en: http://localhost:${PORT}\n`);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n✓ Guardando base de datos y cerrando...');
    if (saveInterval) clearInterval(saveInterval);
    if (db) saveDb();
    process.exit(0);
  });
})();
