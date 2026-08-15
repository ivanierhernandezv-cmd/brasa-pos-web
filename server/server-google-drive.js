// ============================================================================
// Full Track POS — Web Backend (Node.js/Express + Google Drive)
// API endpoints usando Google Drive como almacenamiento
// Más seguro: datos en Google, Google se encarga del backup
// ============================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Google Drive API
const { google } = require('googleapis');
const fs = require('fs').promises;
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// Google Drive Setup
// ============================================================================

let drive;
let folderId;
let cachedData = {}; // Cache en memoria para evitar llamadas constantes

async function initGoogleDrive() {
  try {
    // Si existe GOOGLE_KEY_FILE_CONTENT (variable de entorno), crear el archivo
    if (process.env.GOOGLE_KEY_FILE_CONTENT) {
      const keyPath = './google-key.json';
      try {
        await fs.writeFile(keyPath, process.env.GOOGLE_KEY_FILE_CONTENT);
      } catch (err) {
        console.error('Error escribiendo google-key.json:', err.message);
      }
    }

    // Crear cliente de Google con credentials
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_KEY_FILE || './google-key.json',
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    const authClient = await auth.getClient();
    drive = google.drive({ version: 'v3', auth: authClient });

    // Obtener o crear carpeta en Google Drive
    folderId = await getOrCreateFolder();

    console.log('✓ Google Drive conectado');
    console.log('✓ Carpeta:', folderId);

    // Cargar datos en cache
    await loadAllData();
  } catch (err) {
    console.error('✗ Error conectando Google Drive:', err.message);
    console.error('Solución: Ve a SETUP_GOOGLE_DRIVE.md para configurar credentials');
    process.exit(1);
  }
}

async function getOrCreateFolder() {
  try {
    // Buscar carpeta existente
    const response = await drive.files.list({
      q: "name='FullTrackPOS_Data' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      spaces: 'drive',
      fields: 'files(id, name)',
      pageSize: 1
    });

    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Crear nueva carpeta
    const folder = await drive.files.create({
      resource: {
        name: 'FullTrackPOS_Data',
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Datos de Full Track POS - Backup automático'
      },
      fields: 'id'
    });

    return folder.data.id;
  } catch (err) {
    console.error('Error en getOrCreateFolder:', err);
    throw err;
  }
}

async function loadAllData() {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)',
      pageSize: 100
    });

    for (const file of response.data.files || []) {
      try {
        const content = await readFileFromDrive(file.id);
        cachedData[file.name] = content;
      } catch (err) {
        console.warn(`No se pudo cargar ${file.name}:`, err.message);
      }
    }

    console.log('✓ Datos cargados en cache');
  } catch (err) {
    console.error('Error cargando datos:', err);
  }
}

async function readFileFromDrive(fileId) {
  try {
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    let data = '';
    await new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        data += chunk.toString();
      });
      response.data.on('end', () => resolve());
      response.data.on('error', reject);
    });

    return data;
  } catch (err) {
    throw err;
  }
}

async function writeFileToDrive(filename, content) {
  try {
    // Buscar si archivo existe
    const response = await drive.files.list({
      q: `'${folderId}' in parents and name='${filename}' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id)',
      pageSize: 1
    });

    const fileContent = JSON.stringify(content, null, 2);

    if (response.data.files.length > 0) {
      // Actualizar archivo existente
      await drive.files.update({
        fileId: response.data.files[0].id,
        media: {
          mimeType: 'application/json',
          body: Readable.from([fileContent])
        }
      });
    } else {
      // Crear nuevo archivo
      await drive.files.create({
        resource: {
          name: filename,
          mimeType: 'application/json',
          parents: [folderId]
        },
        media: {
          mimeType: 'application/json',
          body: Readable.from([fileContent])
        },
        fields: 'id'
      });
    }

    // Actualizar cache
    cachedData[filename] = content;
  } catch (err) {
    console.error(`Error escribiendo ${filename}:`, err);
    throw err;
  }
}

// ============================================================================
// Middleware
// ============================================================================

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ============================================================================
// API Routes: Storage (key-value store backed by Google Drive)
// ============================================================================

// Archivo de almacenamiento en Google Drive
const STORE_FILE = 'kv_store.json';

// GET /api/storage/:key?shared=true
app.get('/api/storage/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const shared = req.query.shared === 'true';
    const scope = shared ? 'shared' : 'personal';

    const store = await getStore();
    const row = store.find(r => r.scope === scope && r.key === key);

    if (!row) {
      return res.status(404).json({ key, value: null, shared, error: 'Key not found' });
    }

    res.json({ key, value: row.value, shared });
  } catch (err) {
    console.error('Storage GET error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/storage - Set a key
app.post('/api/storage', async (req, res) => {
  try {
    const { key, value, shared } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Missing key or value' });
    }

    const scope = shared ? 'shared' : 'personal';
    const store = await getStore();

    // Buscar y actualizar o crear
    const index = store.findIndex(r => r.scope === scope && r.key === key);
    if (index >= 0) {
      store[index].value = value;
      store[index].updated_at = new Date().toISOString();
    } else {
      store.push({
        scope,
        key,
        value,
        updated_at: new Date().toISOString()
      });
    }

    await saveStore(store);
    res.json({ key, value, shared });
  } catch (err) {
    console.error('Storage SET error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/storage/:key?shared=true
app.delete('/api/storage/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const shared = req.query.shared === 'true';
    const scope = shared ? 'shared' : 'personal';

    const store = await getStore();
    const newStore = store.filter(r => !(r.scope === scope && r.key === key));
    const deleted = store.length !== newStore.length;

    if (deleted) {
      await saveStore(newStore);
    }

    res.json({ key, deleted, shared });
  } catch (err) {
    console.error('Storage DELETE error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/storage/list/:prefix?shared=true
app.get('/api/storage/list/:prefix?', async (req, res) => {
  try {
    const prefix = req.params.prefix || '';
    const shared = req.query.shared === 'true';
    const scope = shared ? 'shared' : 'personal';

    const store = await getStore();
    let keys;

    if (prefix) {
      keys = store
        .filter(r => r.scope === scope && r.key.startsWith(prefix))
        .map(r => r.key)
        .sort();
    } else {
      keys = store
        .filter(r => r.scope === scope)
        .map(r => r.key)
        .sort();
    }

    res.json({ keys, prefix: prefix || null, shared });
  } catch (err) {
    console.error('Storage LIST error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/storage/all-keys?shared=true
app.get('/api/storage/all-keys', async (req, res) => {
  try {
    const shared = req.query.shared === 'true';
    const scope = shared ? 'shared' : 'personal';

    const store = await getStore();
    const keys = store
      .filter(r => r.scope === scope)
      .map(r => r.key)
      .sort();

    res.json({ keys, shared });
  } catch (err) {
    console.error('Storage LIST ALL error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Helper Functions
// ============================================================================

async function getStore() {
  if (!cachedData[STORE_FILE]) {
    cachedData[STORE_FILE] = [];
  }
  return cachedData[STORE_FILE];
}

async function saveStore(data) {
  await writeFileToDrive(STORE_FILE, data);
}

// ============================================================================
// API Routes: Database export/backup
// ============================================================================

app.get('/api/backup', async (req, res) => {
  try {
    const store = await getStore();
    const timestamp = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="brasa-pos_${timestamp}.json"`);
    res.json(store);
  } catch (err) {
    console.error('Backup error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Health check
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    backend: 'Google Drive',
    folderId: folderId,
    cachedItems: Object.keys(cachedData).length
  });
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
  await initGoogleDrive();

  app.listen(PORT, () => {
    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║     Full Track POS - Web Backend      ║`);
    console.log(`║     Google Drive Edition              ║`);
    console.log(`║     Running on http://localhost:${PORT.toString().padEnd(8, ' ')}║`);
    console.log(`╚════════════════════════════════════════╝\n`);
    console.log(`Almacenamiento: Google Drive (Seguro & Sincronizado)`);
    console.log(`Datos: Backup automático en Google`);
    console.log(`\nAbre tu navegador en: http://localhost:${PORT}\n`);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n✓ Guardando datos y cerrando...');
    process.exit(0);
  });
})();