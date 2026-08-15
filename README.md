# Full Track POS - Web Version

Sistema de Gestión para Food Trucks — Versión Web con acceso desde Internet.

Basado en Node.js/Express + SQLite. Funciona completamente sin necesidad de software adicional.

## 🚀 Inicio Rápido

### 1. Instalación Local

```bash
cd brasa-pos-web

# Instalar dependencias del backend
npm install

# Copiar configuración de ejemplo
cp .env.example .env

# Iniciar el servidor (en http://localhost:3000)
npm start
```

Luego abre tu navegador en: **http://localhost:3000**

### 2. Datos Persistentes

La base de datos SQLite se crea automáticamente en:
- **Windows**: `./data/brasa-pos.db`
- **Mac/Linux**: `./data/brasa-pos.db`

Los datos se guardan localmente en el servidor. Si quieres hacer un respaldo:
1. Copia el archivo `data/brasa-pos.db`
2. Guárdalo en un lugar seguro

## 🌐 Desplegar en Internet (GRATIS)

### Opción 1: Render (Recomendado - Simple)

1. Crea una cuenta gratuita en [render.com](https://render.com)

2. En Render, crea un nuevo **Web Service**:
   - Repositorio: Tu fork/copia del proyecto
   - Build command: `npm install`
   - Start command: `npm start`
   - Plan: Free (tier gratuito)

3. Variables de entorno (en Render):
   ```
   PORT=3000
   NODE_ENV=production
   ```

4. En 5 minutos tu app estará en internet con una URL como:
   ```
   https://brasa-pos-xxxxxx.onrender.com
   ```

**Importante:** El tier gratuito de Render suspende inactividad de 15 minutos. Para evitar esto, elige el plan de pago mínimo (~$7/mes).

### Opción 2: Railway

1. Crea cuenta en [railway.app](https://railway.app)

2. Conecta tu repositorio GitHub

3. Railway detectará automáticamente `package.json`

4. Deploy automático (gratis primeros 30 minutos mensuales después de eso ~$5)

### Opción 3: Replit

1. Crea cuenta en [replit.com](https://replit.com)

2. Crea un nuevo Repl > Import from GitHub

3. Selecciona tu repositorio del proyecto

4. Replit ejecuta automáticamente `npm start`

5. Tendrás una URL pública (compartible):
   ```
   https://tu-replit-username.repl.co
   ```

### Opción 4: Vercel (Avanzado)

Si solo quieres servir la interfaz HTML estática, Vercel es gratis.
Pero como necesitas un backend Node.js/Express, necesitarías usar Vercel Functions (serverless), que requiere restructuración.

## 📱 Cómo Usarla

1. **Desde tu PC**: Abre el navegador en `http://localhost:3000` (si corre localmente)

2. **Desde otro dispositivo en la misma red**:
   - Averigua la IP de tu PC: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
   - Accede desde otro dispositivo: `http://<IP>:3000`

3. **Desde Internet** (si deployaste online):
   - Usa la URL que te proporciona Render/Railway/Replit
   - Funciona desde cualquier dispositivo con navegador

## ⚙️ Configuración Avanzada

### Cambiar Puerto

En tu `.env`:
```
PORT=8080
```

### Cambiar Ubicación de Datos

En tu `.env`:
```
DATA_DIR=/ruta/a/datos
```

### Backup Automático

Para hacer backup diariamente:

**Windows (Task Scheduler)**:
```batch
@echo off
set BACKUP_DIR=C:\Backups\BrasaPOS
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
copy "C:\tu\ruta\brasa-pos-web\data\brasa-pos.db" "%BACKUP_DIR%\brasa-pos_%date:~-10%.db"
```

**Mac/Linux (crontab)**:
```bash
# Abre: crontab -e
# Agrega esta línea para backup diario a las 2 AM:
0 2 * * * cp /tu/ruta/brasa-pos-web/data/brasa-pos.db /backups/brasa-pos_$(date +\%Y\%m\%d).db
```

## 🖨️ Impresión

### En Desktop Local
- Usa la opción **Imprimir** en tu navegador (Ctrl+P / Cmd+P)
- Selecciona tu impresora térmica/de tickets
- Funciona igual que en la versión Electron

### Desde Dispositivo Remoto
- Si impres está compartida en red: configura en tu PC impresoras en red
- O exporta a PDF y imprime desde donde tengas una impresora

## 🔒 Seguridad

**ADVERTENCIA**: Esta versión está diseñada para uso en **red local segura** o **detrás de firewall corporativo**. 

Si la expones públicamente, considera:

1. **Agregar autenticación** (usuario/contraseña):
   - Modifica `server/server.js` para verificar credenciales
   
2. **HTTPS obligatorio**:
   - Render/Railway/Replit lo hacen automáticamente
   - Para local: usa un reverse proxy con SSL

3. **Limitar acceso por IP**:
   - En tu firewall/router corporativo

Ejemplo básico de autenticación en `server.js`:
```javascript
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'cambiar123';

app.use((req, res, next) => {
  const token = req.headers['x-auth'];
  if (token !== AUTH_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

Luego en el frontend (`api-adapter.js`), agrega a cada fetch:
```javascript
headers: { 
  'Content-Type': 'application/json',
  'x-auth': prompt('Contraseña:')
}
```

## 🆘 Solución de Problemas

### "Cannot find module 'better-sqlite3'"

```bash
npm rebuild
```

### La app se ralentiza con datos antiguos

SQLite es local; conforme crece el .db, ralentiza. Considera:
- Archivar datos viejos (2 años atrás)
- Pasar a PostgreSQL cloud (ej. Supabase)

### No puedo acceder desde otro dispositivo

1. Verifica que el servidor esté corriendo: `http://localhost:3000`
2. Obtén tu IP local: 
   - Windows: `ipconfig` → busca "IPv4 Address"
   - Mac/Linux: `ifconfig` → busca "inet"
3. Intenta: `http://<IP>:3000` desde otro dispositivo

### El navegador dice "sin conexión"

Si deployaste online:
- Verifica que el servicio (Render/Railway) esté activo
- Recarga la página
- Revisa los logs en tu plataforma de hosting

## 📞 Soporte

Para preguntas técnicas sobre:
- **Node.js/Express**: [nodejs.org/docs](https://nodejs.org/docs)
- **SQLite**: [sqlite.org](https://sqlite.org)
- **Render/Railway**: Ver su documentación oficial

---

**Versión**: 1.0.0  
**Última actualización**: Agosto 2026
