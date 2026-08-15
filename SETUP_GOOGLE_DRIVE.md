# 🔐 Full Track POS + Google Drive - Configuración Segura

Tu POS ahora puede almacenar datos en **Google Drive** (Google cuida tu información).

---

## ¿Por Qué Google Drive?

✅ **Seguro:** Google encripta y protege tus datos  
✅ **Backup Automático:** Versiones automáticas de tus archivos  
✅ **Acceso Global:** Datos disponibles desde cualquier lugar  
✅ **Sin preocupaciones:** Google maneja mantenimiento y seguridad  
✅ **Gratis:** 15GB gratis (suficiente para POS)

---

## Requisitos

- Cuenta Google (Gmail)
- Google Cloud Console (gratis)
- Node.js instalado

---

## PASO 1: Crear Proyecto en Google Cloud (5 minutos)

### 1.1 Ve a Google Cloud Console

https://console.cloud.google.com

### 1.2 Crea nuevo proyecto

1. En la barra superior, click en "Select a Project"
2. Click "NEW PROJECT"
3. Nombre: `Full Track POS`
4. Click "CREATE"
5. Espera a que se cree (1-2 minutos)

### 1.3 Selecciona el proyecto

Barra superior: Selecciona "Full Track POS"

---

## PASO 2: Activar Google Drive API (2 minutos)

### 2.1 Ve a APIs & Services

En menú izquierdo: "APIs & Services" → "Library"

### 2.2 Busca Google Drive API

Escriba en buscador: `Google Drive API`

### 2.3 Activa la API

Click en "Google Drive API"  
Click en botón azul "ENABLE"  
Espera confirmación

---

## PASO 3: Crear Credenciales (5 minutos)

### 3.1 Ve a Credentials

En menú: "APIs & Services" → "Credentials"

### 3.2 Crea Service Account

Click "CREATE CREDENTIALS"  
Selecciona: "Service Account"

**Llenar formulario:**
- Service account name: `brasa-pos-app`
- Service account ID: (auto-llenado)
- Description: `Aplicación POS con acceso a Google Drive`

Click "CREATE AND CONTINUE"

### 3.3 Grant roles

En "Grant this service account access":

1. Click en "Select a role"
2. Busca: `Editor`
3. Selecciona: "Editor"
4. Click "CONTINUE"

### 3.4 Grant users access

Click "DONE" (puedes saltar este paso)

---

## PASO 4: Descargar Key File (2 minutos)

### 4.1 Encuentra tu Service Account

En "Credentials":
- Bajo "Service Accounts"
- Click en: `brasa-pos-app`

### 4.2 Ve a Keys

En la pestaña "Keys"

### 4.3 Agrega nueva key

Click "ADD KEY" → "Create new key"

**Selecciona:**
- Key type: `JSON`
- Click "CREATE"

**Se descargará:** `brasa-pos-app-xxxxx.json`

### 4.4 Guarda el archivo

Mueve el archivo a tu carpeta:
```
brasa-pos-web/server/google-key.json
```

⚠️ **IMPORTANTE:** NO subas este archivo a GitHub. Está en `.gitignore` (protegido).

---

## PASO 5: Instalar Dependencia (1 minuto)

En terminal, carpeta `brasa-pos-web/server`:

```bash
npm install googleapis
```

---

## PASO 6: Configurar .env (1 minuto)

Abre o crea `brasa-pos-web/.env`:

```
PORT=3000
NODE_ENV=production
GOOGLE_KEY_FILE=./server/google-key.json
USE_GOOGLE_DRIVE=true
```

---

## PASO 7: Cambiar Server (1 minuto)

Edita `brasa-pos-web/server/package.json`:

**De:**
```json
"start": "node server.js"
```

**A:**
```json
"start": "node server-google-drive.js"
```

---

## PASO 8: Iniciar (1 minuto)

Terminal en `brasa-pos-web`:

```bash
npm start
```

Deberías ver:
```
✓ Google Drive conectado
✓ Carpeta: xxxxxxxxxxxxx
✓ Datos cargados en cache

╔════════════════════════════════════════╗
║     Full Track POS - Web Backend      ║
║     Google Drive Edition              ║
║     Running on http://localhost:3000    ║
╚════════════════════════════════════════╝
```

---

## Verificar Funcionamiento

1. Abre: http://localhost:3000
2. Crea un pedido de prueba
3. Agrega un producto
4. Cierra y reabre

**Los datos persisten** → Google Drive funcionando ✅

### Ver en Google Drive

1. Ve a https://drive.google.com
2. Busca carpeta: `FullTrackPOS_Data`
3. Dentro verás: `kv_store.json`

Este archivo contiene todos tus datos de POS.

---

## 🔒 Seguridad

### API Key está protegida

El archivo `google-key.json`:
- ✅ Está en `.gitignore` (no se sube a GitHub)
- ✅ Solo funciona en tu servidor
- ✅ Permisos limitados (solo Drive)

### Buenas prácticas

1. **NO compartas** `google-key.json`
2. **NO subas** a GitHub
3. **Haz backup** en lugar seguro
4. Si se filtra, regenera en Google Cloud Console

---

## 📱 Sincronización

Los datos se guardan en Google Drive automáticamente:
- ✅ Cada cambio en POS
- ✅ Cada 5 segundos (cache)
- ✅ Sin acción del usuario

### Acceso desde múltiples dispositivos

Si deployas en Render:
- PC 1 accede: Escribe datos en Google Drive
- PC 2 accede: Lee datos de Google Drive
- Todo sincronizado automáticamente

---

## ⚡ Respaldo Automático

Google Drive automáticamente:
- Mantiene historial de cambios
- Puedes recuperar versiones anteriores
- Si algo sale mal, recuperas datos

### Manual Backup

En `/api/backup`:
```
https://tuapp.onrender.com/api/backup
```

Descarga JSON con todos tus datos.

---

## 🐛 Troubleshooting

### "Error conectando Google Drive"

**Causa:** `google-key.json` no encontrado

**Solución:**
1. Verifica archivo existe: `server/google-key.json`
2. Verifica camino en `.env`
3. Reinicia: `npm start`

### "Permission denied"

**Causa:** Key file sin permisos suficientes

**Solución:**
1. En Google Cloud Console
2. Ve a tu Service Account
3. Verifica rol: Debe ser "Editor"
4. Si no: Agrega rol "Editor"
5. Espera 1 minuto
6. Reinicia app

### "Carpeta no se crea"

**Causa:** Permisos insuficientes o API no activada

**Solución:**
1. Verifica Google Drive API está ENABLED
2. Verifica Service Account tiene acceso a Drive
3. Reinicia: `npm start`

### "Datos no persisten"

**Causa:** Escritura falla silenciosamente

**Solución:**
1. Ver logs en terminal
2. Verificar permisos de Google Drive
3. Verificar que `google-key.json` es válido
4. Reiniciar servidor

---

## 📊 Ventajas vs SQLite Local

| Característica | SQLite Local | Google Drive |
|---|---|---|
| Seguridad | Local | Google (encriptado) |
| Backup | Manual | Automático |
| Versiones | No | Sí (historial) |
| Acceso remoto | No | Sí (cloud) |
| Redundancia | No | Sí (Google) |
| Sincronización | No | Sí (automática) |

**Google Drive es más seguro y confiable.**

---

## ✅ Checklist

- [ ] Proyecto creado en Google Cloud
- [ ] Drive API habilitada
- [ ] Service Account creado
- [ ] Key JSON descargado
- [ ] Guardado en `server/google-key.json`
- [ ] `googleapis` instalado (npm install)
- [ ] `.env` configurado
- [ ] `package.json` actualizado
- [ ] `npm start` funciona
- [ ] Datos persisten

---

## 🚀 Siguientes Pasos

1. **Ahora:** Prueba localmente con Google Drive
2. **Después:** Publica en Render (mismo proceso)
3. **Resultado:** POS online + datos en Google Drive

Tu información está 100% segura en Google.

---

## 📞 Soporte

- Google Cloud docs: https://cloud.google.com/docs
- Drive API: https://developers.google.com/drive
- Guía Node.js: https://cloud.google.com/nodejs/docs

---

**Versión:** 1.0.0  
**Seguridad:** Google Drive (Enterprise-grade)  
**Tus datos están seguros.** 🔐
