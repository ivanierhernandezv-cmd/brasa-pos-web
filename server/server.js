// ============================================================================
// Full Track POS — Web Backend (Node.js/Express + Supabase)
// Base de datos en la nube - Datos sincronizados en tiempo real
// ============================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase Configuration - REQUIRED
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('\n╔════════════════════════════════════════╗');
  console.error('║         ⚠️  CONFIGURATION ERROR        ║');
  console.error('╚════════════════════════════════════════╝\n');
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY environment variables');
  console.error('\n📋 Required environment variables:');
  console.error('   - SUPABASE_URL: Your Supabase project URL');
  console.error('   - SUPABASE_KEY: Your Supabase public API key');
  console.error('\n🔧 How to fix:');
  console.error('   1. Go to https://supabase.com/dashboard');
  console.error('   2. Select your project');
  console.error('   3. Go to Settings > API');
  console.error('   4. Copy the "Project URL" and "anon public" key');
  console.error('   5. On Render Dashboard, go to your service Environment');
  console.error('   6. Add these as environment variables');
  console.error('   7. Redeploy (git push)\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// Database Initialization (Supabase)
// ============================================================================

async function initDb() {
  try {
    console.log('✓ Conectando a Supabase...');

    // Test connection
    const { data, error } = await supabase
      .from('storage')
      .select('count', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    console.log('✓ Supabase conectado correctamente');
    console.log(`✓ Conectado a: ${SUPABASE_URL}`);
  } catch (err) {
    console.error('✗ Error conectando a Supabase:', err.message);
    console.error('\n📋 Verifica:');
    console.error('   1. SUPABASE_URL es válida');
    console.error('   2. SUPABASE_KEY es correcta');
    console.error('   3. La tabla "storage" existe en tu proyecto Supabase');
    console.error('   4. Hay conexión a internet\n');
    process.exit(1);
  }
}

// ============================================================================
// Middleware
// ============================================================================

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ============================================================================
// API Routes: Storage
// ============================================================================

// GET /api/storage/:key?shared=true
app.get('/api/storage/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const shared = req.query.shared === 'true';
    const scope = shared ? 'shared' : 'personal';

    const { data, error } = await supabase
      .from('storage')
      .select('value')
      .eq('scope', scope)
      .eq('key', key)
      .single();

    if (error) {
      return res.status(404).json({ key, value: null, shared, error: 'Key not found' });
    }

    res.json({ key, value: JSON.parse(data.value), shared });
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
    const valueJson = JSON.stringify(value);

    // DEBUG: Log data being saved
    const dataSize = valueJson.length;
    console.log(`📝 Saving data: key="${key}", scope="${scope}", size=${dataSize} bytes`);

    const { error, data } = await supabase
      .from('storage')
      .upsert({
        scope,
        key,
        value: valueJson,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'scope,key'
      })
      .select();

    if (error) {
      console.error(`❌ Supabase save error for key "${key}":`, error.message);
      return res.status(500).json({ error: error.message, details: error });
    }

    console.log(`✓ Data saved successfully: key="${key}"`);
    res.json({ key, value, shared, saved: true });
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

    const { error } = await supabase
      .from('storage')
      .delete()
      .eq('scope', scope)
      .eq('key', key);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ key, deleted: true, shared });
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

    let query = supabase
      .from('storage')
      .select('key')
      .eq('scope', scope)
      .order('key', { ascending: true });

    if (prefix) {
      query = query.ilike('key', `${prefix}%`);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const keys = data.map(r => r.key);
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

    const { data, error } = await supabase
      .from('storage')
      .select('key')
      .eq('scope', scope)
      .order('key', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const keys = data.map(r => r.key);
    res.json({ keys, shared });
  } catch (err) {
    console.error('Storage LIST ALL error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// API Routes: Backup
// ============================================================================

app.get('/api/backup', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('storage')
      .select('*');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const backup = data.map(r => ({
      scope: r.scope,
      key: r.key,
      value: JSON.parse(r.value),
      updated_at: r.updated_at
    }));

    const timestamp = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="brasa-pos_${timestamp}.json"`);
    res.json(backup);
  } catch (err) {
    console.error('Backup error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Health Check & Diagnostic
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    backend: 'Supabase PostgreSQL',
    database_url: SUPABASE_URL,
    timestamp: new Date().toISOString()
  });
});

// Diagnostic endpoint to test Supabase connection and functionality
app.get('/api/diagnostic', async (req, res) => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    backend: 'Supabase PostgreSQL',
    tests: {},
    errors: []
  };

  try {
    // Test 1: Database connection
    console.log('\n🔍 Running diagnostics...');
    try {
      const { error } = await supabase
        .from('storage')
        .select('count', { count: 'exact', head: true });

      if (error) {
        throw error;
      }
      diagnostics.tests.database_connection = 'OK';
      console.log('✓ Database connection OK');
    } catch (err) {
      diagnostics.tests.database_connection = `FAILED: ${err.message}`;
      diagnostics.errors.push(`Database connection: ${err.message}`);
      console.error('✗ Database connection failed:', err.message);
    }

    // Test 2: Write test data
    try {
      const testKey = 'diagnostic_test_' + Date.now();
      const testValue = { test: true, timestamp: new Date().toISOString() };

      const { error: writeError } = await supabase
        .from('storage')
        .upsert({
          scope: 'personal',
          key: testKey,
          value: JSON.stringify(testValue),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'scope,key'
        });

      if (writeError) {
        throw writeError;
      }
      diagnostics.tests.write_data = 'OK';
      console.log('✓ Write data OK');

      // Test 3: Read test data
      try {
        const { data, error: readError } = await supabase
          .from('storage')
          .select('value')
          .eq('scope', 'personal')
          .eq('key', testKey)
          .single();

        if (readError) {
          throw readError;
        }

        const readValue = JSON.parse(data.value);
        if (readValue.test === true) {
          diagnostics.tests.read_data = 'OK';
          console.log('✓ Read data OK');
        } else {
          throw new Error('Read data does not match written data');
        }

        // Clean up test data
        await supabase
          .from('storage')
          .delete()
          .eq('scope', 'personal')
          .eq('key', testKey);
      } catch (err) {
        diagnostics.tests.read_data = `FAILED: ${err.message}`;
        diagnostics.errors.push(`Read data: ${err.message}`);
        console.error('✗ Read data failed:', err.message);
      }
    } catch (err) {
      diagnostics.tests.write_data = `FAILED: ${err.message}`;
      diagnostics.errors.push(`Write data: ${err.message}`);
      console.error('✗ Write data failed:', err.message);
    }

    // Test 4: Check environment variables
    diagnostics.tests.env_variables = {
      SUPABASE_URL: SUPABASE_URL ? '✓ Set' : '✗ Missing',
      SUPABASE_KEY: SUPABASE_KEY ? '✓ Set' : '✗ Missing'
    };

  } catch (err) {
    diagnostics.errors.push(`Unexpected error: ${err.message}`);
    console.error('✗ Diagnostic error:', err);
  }

  console.log('✓ Diagnostics complete\n');

  if (diagnostics.errors.length > 0) {
    res.status(500);
  }

  res.json(diagnostics);
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
  try {
    await initDb();

    app.listen(PORT, () => {
      console.log(`\n╔════════════════════════════════════════╗`);
      console.log(`║     Full Track POS - Web Backend      ║`);
      console.log(`║     Supabase Cloud Edition            ║`);
      console.log(`║     Running on http://localhost:${PORT.toString().padEnd(8, ' ')}║`);
      console.log(`╚════════════════════════════════════════╝\n`);
      console.log(`Almacenamiento: Supabase PostgreSQL (Nube)`);
      console.log(`Datos: Sincronizados en tiempo real`);
      console.log(`Acceso: Múltiples dispositivos simultáneamente`);
      console.log(`\nAbre tu navegador en: http://localhost:${PORT}\n`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n✓ Cerrando servidor...');
      process.exit(0);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
})();