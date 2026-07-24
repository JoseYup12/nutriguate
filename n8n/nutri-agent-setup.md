# Nutri — Configuración del Agente WhatsApp (n8n)

## Descripción General

**Nutri** es el asistente de WhatsApp de NutriGuate. Recibe check-ins diarios de los usuarios, analiza su adherencia al plan nutricional usando Claude AI, actualiza rachas y logros en Supabase, y envía respuestas motivacionales personalizadas al contexto guatemalteco.

---

## Variables de Entorno (n8n)

Configurar en **Settings → Variables** de tu instancia n8n:

| Variable                  | Descripción                                           |
|---------------------------|-------------------------------------------------------|
| `ANTHROPIC_API_KEY`       | Tu clave de Anthropic (sk-ant-...)                    |
| `SUPABASE_URL`            | URL de tu proyecto Supabase                           |
| `SUPABASE_SERVICE_KEY`    | Service Role Key de Supabase (no la anon key)         |
| `WHATSAPP_TOKEN`          | Token de la API de WhatsApp Business (Meta Cloud API) |
| `WHATSAPP_PHONE_ID`       | Phone Number ID del número de WhatsApp Business       |
| `WHATSAPP_VERIFY_TOKEN`   | Token secreto para verificar el webhook de Meta       |
| `CLAUDE_MODEL`            | Modelo a usar, ej: `claude-opus-4-5`                  |

---

## Flujo 1 — Webhook Receiver (Entrada de mensajes)

**Trigger:** Webhook POST de Meta en `/whatsapp/incoming`

### Pasos:
1. **Webhook Node** — Recibe el payload de Meta, responde `200 OK` inmediatamente.
2. **Function Node** — Extrae `from` (número), `body` (texto), `timestamp` del payload.
3. **Switch Node** — Bifurca según tipo: mensaje de texto → Flujo 2 (Check-in), imagen → Flujo 3 (Foto), comando especial (`/stats`, `/racha`) → Flujo 4 (Consultas).

### Ejemplo de extracción (JavaScript):
```javascript
const entry = $input.item.json.entry?.[0];
const change = entry?.changes?.[0]?.value;
const message = change?.messages?.[0];

return {
  from: message?.from ?? "",
  body: message?.text?.body ?? "",
  timestamp: message?.timestamp ?? "",
  type: message?.type ?? "text",
  messageId: message?.id ?? "",
};
```

---

## Flujo 2 — Daily Check-in Processor

**Trigger:** Salida del Flujo 1 (mensajes de texto que no son comandos)

### Pasos:
1. **Supabase Node** — `SELECT * FROM whatsapp_profiles WHERE phone = '{{$json.from}}'`
2. **Supabase Node** — `SELECT * FROM user_streaks WHERE user_id = '{{$json.user_id}}'`
3. **Supabase Node** — `SELECT * FROM daily_checkins WHERE user_id = '{{$json.user_id}}' AND date = CURRENT_DATE`
4. **IF Node** — ¿Ya hizo check-in hoy? → Si sí, enviar mensaje "Ya registraste tu check-in hoy 😊"
5. **HTTP Request Node** — Llama a la API de Claude con el prompt de análisis (ver abajo).
6. **Function Node** — Parsea la respuesta de Claude, extrae `<data>...</data>` JSON.
7. **Supabase Node** — `INSERT INTO daily_checkins (...)` con los datos extraídos.
8. **Supabase Node** — Actualizar `user_streaks` (incrementar racha, actualizar `last_checkin_date`).
9. **Function Node** — Verificar si se ganó un nuevo badge (7/14/30/60/90 días de racha).
10. **IF Node** — ¿Nuevo badge? → `INSERT INTO user_badges` + mensaje de felicitación especial.
11. **WhatsApp Node** — Enviar respuesta de Nutri al usuario.

### Prompt para Claude (Flujo 2):
```
Sos Nutri, el asistente personal de NutriGuate para Guatemala.
Hablás en segunda persona guatemalteca ("vos", "comés", "tenés").
Sos motivacional, conciso y amigable. Máximo 3 párrafos cortos. Máximo 2-3 emojis. Nunca regañás.

━━━ CHECK-IN DEL USUARIO ━━━
Mensaje: "{{$json.body}}"
Racha actual: {{$json.current_streak}} días

{{$json.plan_data ? `Plan: ${$json.plan_data.caso.nombre} | ${$json.plan_data.macros.kcal} kcal/día` : ""}}

━━━ INSTRUCCIONES ━━━
Primero devolvé SOLO este JSON entre tags <data>...</data>:
<data>
{
  "foods_reported": ["alimentos mencionados"],
  "adherence_score": <1-10>,
  "mood_score": <1-5>,
  "summary": "<resumen de 1 línea>"
}
</data>

Luego escribí tu respuesta como Nutri (máx 3 párrafos):
1. Reconocé algo que hizo bien
2. Si algo estuvo fuera del plan, mencionalo brevemente sin regañar
3. Dá 1 tip concreto para mañana (proteína primero)
```

---

## Flujo 3 — Foto de Comida (Análisis Visual)

**Trigger:** Salida del Flujo 1 (mensajes tipo `image`)

### Pasos:
1. **HTTP Request Node** — Descarga la imagen del servidor de Meta con el token de WhatsApp.
2. **HTTP Request Node** — Sube la imagen a Supabase Storage (`/checkin-photos/{user_id}/{date}.jpg`).
3. **HTTP Request Node** — Llama a Claude con `vision` para analizar la comida.
4. **Function Node** — Extrae macros estimados y lista de alimentos.
5. **Supabase Node** — `INSERT INTO daily_checkins` con `photo_url` y datos extraídos.
6. **WhatsApp Node** — Envía feedback con análisis de la foto.

### Prompt para análisis de foto:
```
Sos Nutri. Analizá esta foto de comida guatemalteca.
Identificá los alimentos visibles y estimá:
- Lista de alimentos
- Calorías aproximadas totales
- Si es compatible con un plan de proteína moderada

Respondé en máximo 2 párrafos, estilo motivacional guatemalteco.
```

---

## Flujo 4 — Consultas de Usuario (/stats, /racha, /plan)

**Trigger:** Salida del Flujo 1 (comandos especiales)

### Comandos:
- `/racha` — Muestra racha actual, escudos disponibles, próximo badge.
- `/stats` — Resumen de la semana: adherencia promedio, días entrenados, mejor día.
- `/plan` — Envía el resumen del plan nutricional activo.
- `/escudo` — Usa un escudo de racha si hay disponible (previene perder la racha).
- `/ayuda` — Lista de comandos disponibles.

### Pasos (para `/racha`):
1. **Supabase Node** — Consultar `user_streaks` y `user_badges`.
2. **Function Node** — Calcular próximo milestone de badge.
3. **WhatsApp Node** — Enviar mensaje formateado con la información.

### Ejemplo de respuesta `/racha`:
```
🔥 *Tu racha: 12 días*

Récord personal: 18 días
Escudos disponibles: 2/3

Próximo logro: Mes de Constancia 💪 en 18 días más

¡Seguí así! Cada día cuenta.
```

---

## Flujo 5 — Desafío Semanal (Lunes 9:00 AM)

**Trigger:** Cron `0 9 * * 1` (cada lunes a las 9 AM, hora de Guatemala UTC-6)

### Pasos:
1. **Supabase Node** — Obtener todos los usuarios activos (check-in en los últimos 7 días).
2. **Function Node** — Para cada usuario, generar un desafío personalizado basado en su historial.
3. **HTTP Request Node** — Llamar a Claude para personalizar el texto del desafío.
4. **Supabase Node** — `INSERT INTO weekly_challenges` para cada usuario.
5. **WhatsApp Node** — Enviar el desafío a cada usuario.

### Tipos de desafío disponibles:
| Tipo        | Descripción                                    |
|-------------|------------------------------------------------|
| `protein`   | Llegar a X gramos de proteína 5 días           |
| `exercise`  | Entrenar al menos 3 veces esta semana          |
| `water`     | Tomar 8 vasos de agua cada día                 |
| `vegetables`| Incluir verduras en almuerzo y cena            |
| `budget`    | Cocinar en casa 5 días (no comer fuera)        |
| `sleep`     | Dormir 7-8 horas para mejor recuperación       |

---

## Flujo 6 — Re-engagement (Usuarios Inactivos)

**Trigger:** Cron `0 18 * * *` (cada día a las 6 PM)

### Pasos:
1. **Supabase Node** — `SELECT users WHERE last_checkin_date < NOW() - INTERVAL '2 days'`
2. **Function Node** — Filtrar usuarios con racha en riesgo (racha > 3 y sin check-in hoy).
3. **IF Node** — ¿Tiene escudos disponibles? → Ofrecer usar escudo automaticamente.
4. **WhatsApp Node** — Enviar recordatorio personalizado según días inactivos:
   - 2 días: Recordatorio suave con motivación
   - 3 días: Oferta de usar escudo de racha
   - 5+ días: Mensaje de re-enganche con resumen del progreso logrado

### Ejemplo de mensaje re-engagement (2 días):
```
¡Hola! 👋 Nutri por acá.

Llevas 2 días sin check-in. Tu racha de 12 días está esperando.

¿Cómo estuvo tu día de hoy? Mandame un mensaje con lo que comiste y seguimos. 💪
```

---

## Configuración del Webhook en Meta

1. Ir a **Meta for Developers → Tu App → WhatsApp → Configuración**
2. En **Webhook**, agregar la URL: `https://TU_N8N.com/webhook/whatsapp/incoming`
3. **Verify Token**: el mismo valor que `WHATSAPP_VERIFY_TOKEN`
4. Suscribirse a: `messages`

### Nodo de Verificación (GET del webhook):
```javascript
// n8n — Responder al challenge de verificación de Meta
const mode = $input.params["hub.mode"];
const token = $input.params["hub.verify_token"];
const challenge = $input.params["hub.challenge"];

if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
  return { statusCode: 200, body: challenge };
}
return { statusCode: 403, body: "Forbidden" };
```

---

## Tablas Supabase Utilizadas

Ver `supabase/migrations/001_retention_tables.sql` para el esquema completo.

| Tabla                | Flujo Principal     | Operación          |
|----------------------|---------------------|--------------------|
| `whatsapp_profiles`  | Flujo 2             | SELECT (lookup)    |
| `daily_checkins`     | Flujos 2, 3         | INSERT / SELECT    |
| `user_streaks`       | Flujos 2, 4, 6      | SELECT / UPDATE    |
| `weekly_challenges`  | Flujos 4, 5         | INSERT / SELECT    |
| `user_badges`        | Flujos 2, 4         | INSERT / SELECT    |

---

## Notas de Implementación

- **Rate limiting**: Meta permite ~1000 mensajes/día en la versión gratuita. Usar cola (Queue node) para mensajes masivos del Flujo 5 y 6.
- **Manejo de errores**: Cada flujo debe tener un nodo de error que notifique al admin y no deje al usuario sin respuesta.
- **Timezone**: Guatemala es UTC-6. Ajustar todos los crons con `TZ=America/Guatemala`.
- **Idempotencia**: Siempre verificar si ya existe un check-in para la fecha antes de insertar.
- **Privacidad**: No almacenar el número de teléfono en texto plano si es posible; considerar hash SHA-256 para el índice.
