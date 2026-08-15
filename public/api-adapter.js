// ============================================================================
// Full Track POS - Web API Adapter
// Provides window.storage and window.nativePrint APIs using fetch()
// instead of Electron IPC for the desktop version
// ============================================================================

const API_BASE = window.location.origin + '/api';

// ============================================================================
// Storage API - mirrors IPC interface but uses fetch()
// ============================================================================
window.storage = {
  /**
   * Get a value from storage
   * @param {string} key - Storage key
   * @param {boolean} shared - Whether to use shared storage (default: false)
   * @returns {Promise<{key, value, shared}>}
   */
  get: async function(key, shared = false) {
    try {
      const url = new URL(`${API_BASE}/storage/${encodeURIComponent(key)}`);
      if (shared) url.searchParams.set('shared', 'true');

      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Storage GET failed for "${key}":`, response.status);
        return { key, value: null, shared };
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`Storage GET error for "${key}":`, err);
      return { key, value: null, shared, error: err.message };
    }
  },

  /**
   * Set a value in storage
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   * @param {boolean} shared - Whether to use shared storage (default: false)
   * @returns {Promise<{key, value, shared}>}
   */
  set: async function(key, value, shared = false) {
    try {
      const response = await fetch(`${API_BASE}/storage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, shared })
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`Storage SET error for "${key}":`, err);
      return { key, value, shared, error: err.message };
    }
  },

  /**
   * Delete a value from storage
   * @param {string} key - Storage key
   * @param {boolean} shared - Whether to use shared storage (default: false)
   * @returns {Promise<{key, deleted, shared}>}
   */
  delete: async function(key, shared = false) {
    try {
      const url = new URL(`${API_BASE}/storage/${encodeURIComponent(key)}`);
      if (shared) url.searchParams.set('shared', 'true');

      const response = await fetch(url, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`Storage DELETE error for "${key}":`, err);
      return { key, deleted: false, shared, error: err.message };
    }
  },

  /**
   * List all keys matching a prefix
   * @param {string} prefix - Key prefix to search (empty for all keys)
   * @param {boolean} shared - Whether to use shared storage (default: false)
   * @returns {Promise<{keys, prefix, shared}>}
   */
  list: async function(prefix = '', shared = false) {
    try {
      let url;
      if (prefix) {
        url = new URL(`${API_BASE}/storage/list/${encodeURIComponent(prefix)}`);
      } else {
        url = new URL(`${API_BASE}/storage/all-keys`);
      }
      if (shared) url.searchParams.set('shared', 'true');

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`Storage LIST error for prefix "${prefix}":`, err);
      return { keys: [], prefix: prefix || null, shared, error: err.message };
    }
  }
};

// ============================================================================
// Printing API - uses browser's native print dialog for web version
// ============================================================================
window.nativePrint = {
  /**
   * List available printers (web version returns empty - uses browser print)
   * @returns {Promise<Array>}
   */
  list: async function() {
    // Web version doesn't have access to local printers
    // Return empty array; frontend will use browser print dialog
    return [];
  },

  /**
   * Silent print (web version uses browser print dialog)
   * For web, we open the browser's print dialog which lets user select printer
   * @param {Object} options - {html, printerName} (printerName ignored in web)
   * @returns {Promise<{success, reason}>}
   */
  silent: async function(options = {}) {
    return new Promise((resolve) => {
      try {
        const { html } = options;
        if (!html) {
          return resolve({ success: false, reason: 'No HTML provided' });
        }

        // Create an iframe to print
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        iframe.onload = () => {
          try {
            // Write HTML to iframe
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open();
            doc.write(html);
            doc.close();

            // Wait a moment for content to render, then print
            setTimeout(() => {
              try {
                iframe.contentWindow.print();
                // Print dialog is asynchronous; we can't know when it completes
                // so resolve immediately after opening dialog
                setTimeout(() => {
                  document.body.removeChild(iframe);
                  resolve({ success: true, reason: null });
                }, 1000);
              } catch (err) {
                document.body.removeChild(iframe);
                resolve({ success: false, reason: err.message });
              }
            }, 100);
          } catch (err) {
            document.body.removeChild(iframe);
            resolve({ success: false, reason: err.message });
          }
        };

        iframe.onerror = () => {
          document.body.removeChild(iframe);
          resolve({ success: false, reason: 'Iframe load failed' });
        };

        // Start iframe load
        iframe.src = 'about:blank';
      } catch (err) {
        resolve({ success: false, reason: err.message });
      }
    });
  }
};

// ============================================================================
// Utility: Log API availability
// ============================================================================
console.log(
  '%c✓ Full Track POS - Web Version',
  'color: #C81E2B; font-weight: bold; font-size: 14px;'
);
console.log(
  '%cStorage API ready (REST via /api/storage)',
  'color: #1F8E63; font-size: 12px;'
);
console.log(
  '%cPrinting via browser print dialog',
  'color: #1F8E63; font-size: 12px;'
);
