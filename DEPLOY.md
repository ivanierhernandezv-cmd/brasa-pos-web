# Guía de Despliegue - Full Track POS Web

## ⚡ Despliegue Rápido (30 segundos)

### 1️⃣ Render (MÁS FÁCIL)

```bash
# Instala Render CLI
npm install -g render-cli

# Autentica
render login

# Deploy
render deploy
```

O vía web:
1. Ve a [render.com](https://render.com)
2. Sign up → Connect GitHub
3. New Web Service → Selecciona tu repositorio
4. Settings automáticos (detecta Procfile)
5. Deploy

**Tu app estará en**: `https://brasa-pos-xxxxx.onrender.com`

---

### 2️⃣ Railway (30 segundos)

1. Ve a [railway.app](https://railway.app)
2. Login con GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Selecciona `brasa-pos-web`
5. Railway automáticamente:
   - Detecta `package.json`
   - Instala dependencias
   - Inicia con `npm start`

Listo! URL: `https://xxxxx.up.railway.app`

---

### 3️⃣ Replit (1 minuto)

1. Ve a [replit.com](https://replit.com)
2. "+ Create Repl"
3. "Import from GitHub"
4. Pega: `https://github.com/tu-usuario/brasa-pos-web.git`
5. Replit abre automáticamente el terminal y ejecuta `npm start`

URL Pública → compartible con tu equipo

---

## 🔧 Configuración Personalizada

### Cambiar Puerto en Render
En `render.yaml`:
```yaml
  envVars:
    - key: PORT
      value: 8080
```

### Base de Datos Persistente
Render persiste automáticamente el directorio `/app/data` definido en `render.yaml`.

Si necesitas **backup cloud automático**:
1. Agrega un cron job en Render:
```bash
# Cada día a las 2 AM
0 2 * * * curl -X POST https://tu-app.onrender.com/api/backup
```

2. En `server/server.js`, agrega endpoint:
```javascript
app.post('/api/backup', (req, res) => {
  // Sube data/brasa-pos.db a S3/Google Cloud Storage
});
```

---

## 🛡️ HTTPS + Dominio Propio

### Con Render
1. En Render Dashboard → Settings
2. "Custom Domain"
3. Apunta tu DNS (ejemplo.com) a Render
4. HTTPS automático con Let's Encrypt

### Ejemplo:
```
Tu dominio: mirestaurante.com
Apunta en tu registrador (GoDaddy, Namecheap, etc.):

CNAME record:
  mirestaurante.com.  →  brasa-pos-xxxxx.onrender.com
```

Tu POS en: `https://mirestaurante.com`

---

## 📊 Monitoreo

### Logs en Render
```bash
# Ver logs en tiempo real
render tail <service-id>

# O en Dashboard: Logs
```

### Alertas de Inactividad
El tier gratuito Render suspende después de 15 minutos sin uso.
Para evitar (plan pagado): ~$7/mes

---

## 🚀 CI/CD Automático

Cuando hagas push a GitHub:
- Railway/Render/Replit **automáticamente detectan cambios**
- Reinstalan dependencias
- Reinician el servidor
- **Cero downtime** (recargan en paralelo)

---

## 💾 Backup de Datos

### Manual
```bash
# Descarga data/brasa-pos.db desde tu servidor
# y guárdalo en tu PC como respaldo
```

### Automático (Recomendado)
En crontab (Mac/Linux) o Task Scheduler (Windows):
```bash
# Cada día a las 3 AM
0 3 * * * scp usuario@miserver.com:/app/data/brasa-pos.db ~/backups/brasa-pos_$(date +%Y%m%d).db
```

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| "App crashed" | Ver logs en Dashboard → revisa si node_modules se instaló |
| Datos no guardan | Verifica que `/app/data` tiene permisos de escritura |
| Lento con datos viejos | Considera pasar a PostgreSQL cloud (Supabase) |
| No se accede desde móvil | Verifica IP local o usa dominio HTTPS |

---

## 📞 Soporte Plataformas

- **Render**: [docs.render.com](https://docs.render.com)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Replit**: [docs.replit.com](https://docs.replit.com)

---

¡Tu POS ahora está en internet! 🎉
