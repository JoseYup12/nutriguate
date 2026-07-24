# NutriGuate — Configuración de Google Sheets

Este documento explica cómo conectar NutriGuate con Google Sheets para guardar usuarios y datos de forma gratuita usando Google Apps Script.

---

## ¿Qué hace esto?

Cada vez que un usuario se registra o inicia sesión en NutriGuate, sus datos se guardan automáticamente en una hoja de cálculo de Google Sheets que vos controlás. También se guardan los planes nutricionales generados y los check-ins diarios.

Las contraseñas **nunca** se guardan en texto plano — se almacena únicamente el hash SHA-256, que es irreversible.

---

## Paso 1 — Crear la hoja de cálculo

1. Abrí [sheets.google.com](https://sheets.google.com)
2. Creá una nueva hoja de cálculo y ponle un nombre, por ejemplo: **NutriGuate DB**
3. Dejá la hoja abierta (la necesitarás en el paso 3)

---

## Paso 2 — Crear el Apps Script

**Opción A (recomendada) — Script vinculado a la hoja:**
1. En la hoja de cálculo, andá a **Extensiones → Apps Script**
2. Se abrirá el editor de Scripts vinculado a esa hoja
3. Borrá el contenido del archivo `Code.gs`
4. Pegá todo el contenido del archivo `Code.gs` de esta carpeta
5. Guardá el proyecto (Ctrl+S) y ponle un nombre, ej: **NutriGuate API**

**Opción B — Script independiente:**
1. Abrí [script.google.com](https://script.google.com)
2. Creá un nuevo proyecto
3. Pegá el contenido de `Code.gs`
4. En el script, andá a **Recursos → Proyecto de Google Cloud** y vincúlalo a tu hoja

---

## Paso 3 — Implementar como aplicación web

1. En el editor de Apps Script, hacé clic en **Implementar → Nueva implementación**
2. En "Seleccionar tipo", elegí **Aplicación web**
3. Configurá así:
   - **Descripción:** NutriGuate API v1
   - **Ejecutar como:** Yo (tu-correo@gmail.com)
   - **Quién tiene acceso:** Cualquier persona
4. Hacé clic en **Implementar**
5. Si te pide permisos, autorizá el acceso (es tu propio script accediendo a tu propia hoja)
6. **Copia la URL** que aparece — se verá así:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

---

## Paso 4 — Configurar NutriGuate

1. En la carpeta raíz del proyecto, copiá `.env.example` como `.env.local`:
   ```
   copy .env.example .env.local
   ```
2. Abrí `.env.local` y pegá tu URL:
   ```
   VITE_GOOGLE_SHEETS_SCRIPT_URL=https://script.google.com/macros/s/TU_ID_AQUI/exec
   ```
3. Reiniciá el servidor de desarrollo:
   ```
   npm run dev
   ```

---

## Estructura de la hoja

El script crea automáticamente estas hojas cuando se usa por primera vez:

### Hoja "Usuarios"
| id | nombre | email | passwordHash | createdAt |
|----|--------|-------|--------------|-----------|
| uuid | Juan Pérez | juan@... | abc123... (SHA-256) | 2026-01-15T... |

### Hoja "Planes"
| id | userId | formDataJson | planDataJson | createdAt | updatedAt |
|----|--------|-------------|-------------|-----------|-----------|
| uuid | user-id | {...} | {...} | 2026-01-15T... | 2026-01-15T... |

### Hoja "Checkins"
| id | userId | date | rawMessage | adherenceScore | exerciseDone | moodScore | agentResponse | createdAt |
|----|--------|------|------------|---------------|--------------|-----------|---------------|-----------|
| web-123 | user-id | 2026-01-15 | Comí bien... | 8 | TRUE | 4 | Nutri dice... | 2026-01-15T... |

---

## Acciones disponibles (API)

El script acepta POST requests con cuerpo JSON:

| Acción | Parámetros | Respuesta |
|--------|------------|-----------|
| `register` | nombre, email, passwordHash | `{ user: {...} }` |
| `login` | email, passwordHash | `{ user: {...} }` |
| `savePlan` | userId, formDataJson, planDataJson | `{ ok: true }` |
| `getPlan` | userId | `{ plan: {...} \| null }` |
| `saveCheckin` | userId, date, rawMessage, adherenceScore, exerciseDone, moodScore, agentResponse | `{ ok: true }` |
| `getCheckins` | userId | `{ checkins: [...] }` |

---

## Solución de problemas

### Error CORS
Si el navegador muestra un error de CORS al intentar hacer login:
- Verificá que implementaste el script con **"Quién tiene acceso: Cualquier persona"** (no "Solo yo")
- Re-implementá el script: **Implementar → Administrar implementaciones → editar → Nueva versión**

### Error "Script no encontrado"
- La URL debe terminar en `/exec`, no en `/dev`
- La URL `/dev` es solo para pruebas dentro del editor de Apps Script

### Las hojas no se crean
- Asegurate de que el script esté vinculado a la hoja de cálculo correcta (Opción A del Paso 2)
- Si usaste Opción B, vincula manualmente el script a la hoja

### Límites gratuitos de Google Apps Script
- 6 minutos de ejecución por día (más que suficiente para una app pequeña)
- 20,000 lecturas de hoja por día
- 2,000 escrituras de hoja por día
- Estos límites se resetean cada 24 horas

---

## Actualizar el script

Si actualizás el código de `Code.gs`, debés crear una **nueva implementación**:
1. **Implementar → Administrar implementaciones**
2. Clic en el ícono de edición (lápiz)
3. En "Versión", seleccioná **Nueva versión**
4. Guardá — la URL de implementación **no cambia**

---

## Seguridad

- Las contraseñas se hashean con SHA-256 en el **navegador del usuario** antes de enviarse
- El hash nunca se puede revertir a la contraseña original
- La URL del script es "secreta" por seguridad a través de oscuridad — no es un sistema bancario, pero es suficiente para una app de nutrición
- Para mayor seguridad en producción, considera agregar un token secreto en las solicitudes y verificarlo en el script
