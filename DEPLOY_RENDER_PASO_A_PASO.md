# 🌍 Publicar tu POS Online con Render - Guía Completa

## Objetivo
Publicar tu POS en internet para que cualquiera pueda acceder desde cualquier parte del mundo usando un link.

**Resultado final:**
```
https://brasa-pos-xxxxx.onrender.com
```

---

## Requisitos
- ✅ Tu código en `brasa-pos-web/`
- ✅ Cuenta GitHub (gratis)
- ✅ Cuenta Render (gratis)

---

## PASO 1: Crear Repositorio en GitHub (5 minutos)

### 1.1 Abre terminal en tu carpeta `brasa-pos-web`

**Windows (CMD o PowerShell):**
```cmd
cd tu\ruta\brasa-pos-web
```

**Mac/Linux:**
```bash
cd /tu/ruta/brasa-pos-web
```

### 1.2 Inicializa Git

```bash
git init
```

Salida esperada:
```
Initialized empty Git repository in ...
```

### 1.3 Agrega todos los archivos

```bash
git add .
```

### 1.4 Crea primer commit

```bash
git commit -m "Full Track POS Web - Initial commit"
```

Salida esperada:
```
[main (root-commit) xxxxx] Full Track POS Web
 XX files changed, XX insertions(+)
```

### 1.5 Crea repositorio vacío en GitHub

1. Ve a **https://github.com/new**
2. En "Repository name" escribe: `brasa-pos-web`
3. Selecciona "Public" (para que Render pueda acceder)
4. **NO** marques "Add a README"
5. Click "Create repository"

Verás una pantalla con instrucciones. Necesitamos la URL de tu repositorio, será algo como:
```
https://github.com/TU-USUARIO/brasa-pos-web.git
```

### 1.6 Conecta tu repositorio local con GitHub

En terminal:

```bash
git remote add origin https://github.com/TU-USUARIO/brasa-pos-web.git
git branch -M main
git push -u origin main
```

**Puede pedir tu contraseña de GitHub.** Escribe tu contraseña (o usa token si tienes 2FA).

Salida esperada:
```
Enumerating objects: XX, done.
Counting objects: 100%
...
To https://github.com/TU-USUARIO/brasa-pos-web.git
 * [new branch]      main -> main
```

✅ **Tu código está en GitHub.**

---

## PASO 2: Configurar Render (10 minutos)

### 2.1 Abre Render

Ve a **https://render.com**

### 2.2 Crea cuenta (si no tienes)

1. Click "Sign up"
2. Selecciona "Sign up with GitHub"
3. Autoriza Render a acceder a GitHub

### 2.3 Crea Web Service

1. En Dashboard, click el símbolo **"+"**
2. Selecciona **"Web Service"**
3. Render buscará tus repos
4. Encuentra y selecciona **`brasa-pos-web`**
5. Click "Connect"

### 2.4 Configura el servicio

En la forma que aparece:

| Campo | Valor |
|-------|-------|
| Name | `brasa-pos-web` |
| Region | `Ohio` (u otra cercana) |
| Branch | `main` |
| Runtime | `Node` (automático) |
| Build Command | `npm install` |
| Start Command | `npm start` |

### 2.5 Variables de Entorno (Opcional)

Baja hasta "Environment Variables" y agrega:

| Key | Value |
|-----|-------|
| PORT | 3000 |
| NODE_ENV | production |

### 2.6 Tipo de Plan

Baja hasta "Plan" y selecciona **"Free"**

### 2.7 Deploy

Click el botón **"Create Web Service"** (botón azul abajo)

**ESPERA 2-3 MINUTOS...**

Verás en la pantalla:
```
Building your application...
Deploying...
Live ✓
```

Cuando esté listo verás:
```
https://brasa-pos-xxxxx.onrender.com
```

✅ **Tu POS está en internet.**

---

## PASO 3: Prueba tu Aplicación (2 minutos)

### 3.1 Abre la URL en tu navegador

```
https://brasa-pos-xxxxx.onrender.com
```

Reemplaza `xxxxx` con lo que Render te mostró.

### 3.2 Primera carga puede tardar

Si es la primera vez que accedes (después de horas sin uso), puede tardar 30 segundos. Después será normal.

### 3.3 Verifica que funciona

- [ ] Se carga la interfaz
- [ ] Puedes crear un pedido
- [ ] Puedes agregar productos
- [ ] Puedes seleccionar mesa
- [ ] Puedes imprimir (Ctrl+P)

✅ **Todo funciona.**

---

## PASO 4: Comparte el Link (Opcional)

Ahora puedes compartir tu URL con:
- Tu equipo
- Tu teléfono
- Clientes
- Cualquiera en el mundo

Ejemplo:
```
Mi POS online: https://brasa-pos-xxxxx.onrender.com
```

---

## 🔄 Actualizar tu Aplicación

Cada vez que hagas cambios en tu código local:

### Opción A: Desde terminal

```bash
git add .
git commit -m "Describir los cambios"
git push
```

Render **automáticamente**:
- Detecta el nuevo push
- Recompila
- Redeploya
- Actualiza la app en vivo

**No necesitas hacer nada más en Render.**

### Opción B: Si usas GitHub Desktop

1. Abre GitHub Desktop
2. Haz cambios en tu código
3. Escribe un "Summary"
4. Click "Commit to main"
5. Click "Push origin"

Render se encargará del resto.

---

## ⚠️ Sobre el Plan Gratuito

Render ofrece un plan **FREE** con limitaciones:

| Característica | Free | Pro |
|---|---|---|
| Aplicaciones | 1 | Ilimitadas |
| Duración | Pausado después 15 min sin usar | 24/7 |
| Precio | $0 | $7/mes |

### ¿Qué significa "pausado"?

- Primero acceso después de pausa: **demora ~30 segundos**
- Accesos siguientes: **normal**

**Es como si tu servidor durmiese y se despierta cuando lo llamas.**

### Si quieres 24/7 sin pausas:

En Render Dashboard:
1. Selecciona tu servicio
2. Settings
3. Plan
4. Selecciona "Starter" ($7/mes)

Recomendación: Comienza con Free, actualiza si lo necesitas.

---

## 🔐 Seguridad (Importante)

Tu aplicación **está abierta al mundo sin contraseña**.

### ¿Es un problema?

Depende de tu caso:
- ✅ Si solo tú/tu equipo accede → no es problema
- ❌ Si es público → considera agregar autenticación

### Agregar usuario/contraseña (Avanzado)

Si lo necesitas, puedo ayudarte a agregar un login. Por ahora: no necesario.

---

## 🐛 Solucionar Problemas

### "Error during deploy"

**Causa:** Problema en el código.

**Solución:**
1. Ve a "Logs" en Render Dashboard
2. Lee el error
3. Corrígelo en tu código
4. Haz `git push`
5. Render redeploya automáticamente

### "Application not found" o pantalla blanca

**Causa:** Servidor aún arrancando o error de inicialización.

**Solución:**
1. Espera 30 segundos
2. Recarga el navegador (Ctrl+F5 o Cmd+Shift+R)
3. Si sigue: ve a Logs en Render para ver qué pasó

### "Connection refused"

**Causa:** Servidor no respondiendo.

**Solución:**
1. En Render Dashboard, click "Restart instance"
2. Espera a que se reinicie
3. Intenta acceder de nuevo

### "Datos no se guardan"

**Causa:** Base de datos puede tener problemas.

**Solución:**
1. Comprueba que la carpeta `data/` existe
2. En `.env` verifica `DATA_DIR=./data`
3. Reinicia en Render Dashboard

---

## 📊 Monitorear tu Aplicación

En Render Dashboard de tu servicio:

### Logs (en tiempo real)
- Muestra lo que está haciendo el servidor
- Si alguien accede, lo ves aquí

### Metrics
- CPU usage
- Memory
- Requests

### Settings
- Cambiar puerto
- Variables de entorno
- Reiniciar servicio

---

## 💡 Tips Útiles

### Tip 1: Actualizar frecuentemente

```bash
git push  # Cada cambio importante
```

Render redeploya automáticamente. Cero downtime.

### Tip 2: Ver logs en tiempo real

En Render Dashboard, pestañita "Logs" muestra todo en vivo.

### Tip 3: Dominio personalizado (Avanzado)

Si tienes dominio (ej: mirestaurante.com):

En Render > Settings > Custom Domains:
```
Apunta tu DNS a Render
Render automáticamente configura HTTPS
```

### Tip 4: Backup de datos

Tu base de datos está en Render. Para backup:
1. Ve a `/api/backup` en tu URL
2. Descarga el archivo `.db`
3. Guarda en un lugar seguro

---

## ✅ Checklist Completo

- [ ] Git inicializado
- [ ] Código committed
- [ ] Repositorio en GitHub
- [ ] Cuenta Render creada
- [ ] Web Service conectado
- [ ] Deploy completado
- [ ] URL pública funcionando
- [ ] Probado desde navegador
- [ ] Compartido con equipo

---

## 🎉 ¡Listo!

Tu POS ahora está disponible online. Cualquiera con el link puede acceder desde cualquier parte del mundo.

```
https://brasa-pos-xxxxx.onrender.com
```

---

## 📞 Problemas?

Si algo no funciona:

1. Revisa los Logs en Render Dashboard
2. Intenta reiniciar: "Restart instance"
3. Verifica que tu código está en GitHub
4. Intenta hacer `git push` de nuevo (Render redeploya)

---

**Versión**: 1.0.0  
**Agosto 2026**  
**Full Track POS - Web Version**
