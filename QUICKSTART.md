# 🚀 Guía de Inicio Rápido - Full Track POS Web

## En 5 minutos, tu POS estará funcionando en internet

### Opción 1: Ejecutar Localmente (Tu PC)

#### Paso 1: Instalar dependencias
```bash
cd brasa-pos-web
npm install
```

#### Paso 2: Iniciar el servidor
```bash
npm start
```

Verás:
```
✓ Base de datos creada
╔════════════════════════════════════════╗
║     Full Track POS - Web Backend      ║
║     Running on http://localhost:3000    ║
╚════════════════════════════════════════╝
```

#### Paso 3: Abrir en tu navegador
```
http://localhost:3000
```

**¡Listo!** Tu POS está funcionando.

---

### Opción 2: Publicar en Internet GRATIS (Render)

#### Paso 1: Preparar GitHub

```bash
# En la carpeta del proyecto
git init
git add .
git commit -m "Full Track POS Web"
git remote add origin https://github.com/tu-usuario/brasa-pos-web.git
git push -u origin main
```

#### Paso 2: Deploy a Render

1. Ve a [render.com](https://render.com)
2. Sign up con GitHub
3. Click "New +" → "Web Service"
4. Selecciona tu repositorio `brasa-pos-web`
5. Render automáticamente:
   - Detecta `Procfile` y `package.json`
   - Instala dependencias
   - Inicia el servidor
6. En 2 minutos, tu URL estará lista:

```
https://brasa-pos-xxxxx.onrender.com
```

**¡Accede desde cualquier dispositivo con internet!**

---

### Opción 3: Railway (30 segundos)

1. [railway.app](https://railway.app) → Login con GitHub
2. "New Project" → "Deploy from GitHub repo"
3. Selecciona `brasa-pos-web`
4. Railway hace todo automáticamente

Tu URL: `https://xxxxx.up.railway.app`

---

## 🎯 Usar tu POS

### Desde el mismo dispositivo
```
http://localhost:3000
```

### Desde otro dispositivo en la casa/oficina
1. Abre CMD/Terminal en tu PC:
   - **Windows**: `ipconfig` 
   - **Mac/Linux**: `ifconfig`
2. Busca: `IPv4 Address` (ej: `192.168.1.100`)
3. En otro dispositivo, accede a:
   ```
   http://192.168.1.100:3000
   ```

### Desde internet (si deployaste en Render/Railway)
```
https://brasa-pos-xxxxx.onrender.com
```

Abre desde tu teléfono, tablet, o cualquier PC con internet.

---

## 💾 Tus Datos

Los datos se guardan en:
```
brasa-pos-web/data/brasa-pos.db
```

**No se pierden** cuando cierras la app. Persisten para siempre.

### Hacer respaldo
```bash
# Descarga la base de datos
# Linux/Mac:
cp brasa-pos-web/data/brasa-pos.db ~/backup-pos.db

# Windows: Copia manualmente el archivo a un pendrive/cloud
```

---

## ⚙️ Cambios Comunes

### Cambiar puerto (si 3000 está en uso)

1. Abre `.env`:
```
PORT=8000
```

2. Reinicia:
```bash
npm start
```

### Ver logs del servidor

```bash
npm start
```

Verás en la terminal:
```
GET /api/storage/ventas
POST /api/storage → 200 OK
```

---

## 🐛 ¿No funciona?

| Problema | Solución |
|----------|----------|
| "npm: command not found" | Instala Node.js desde nodejs.org |
| "Cannot find module" | Ejecuta `npm install` |
| Puerto 3000 en uso | Cambia PORT en `.env` |
| No se accede desde otro PC | Verifica IP local (`ipconfig`) |
| Lento en internet | Usa Render (recomendado) |

---

## 📞 Próximos Pasos

1. **Configurar impresora**: 
   - En tu navegador (Ctrl+P / Cmd+P) selecciona tu impresora térmica

2. **Acceder desde múltiples ubicaciones**:
   - Si deployaste en Render → ya funciona globalmente
   - Si es local → usa dentro de tu red LAN

3. **Agregar productos**:
   - Vé a Ajustes → Productos
   - Agrega categorías y artículos

4. **Entrenar al equipo**:
   - La interfaz es igual a la versión desktop
   - Acceso online → cualquier dispositivo

---

## 🎉 ¡Disfruta!

Tu POS profesional ahora está disponible en internet.

Para dudas: revisa `README.md` o `DEPLOY.md` en esta carpeta.

---

**Versión**: 1.0.0 | Full Track POS Web  
**Agosto 2026**
