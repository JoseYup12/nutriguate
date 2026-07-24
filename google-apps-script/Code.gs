// ══════════════════════════════════════════════════════════════════════════════
//  NutriGuate — Google Apps Script Web App
//  Versión: 1.0.0
//
//  DESPLIEGUE:
//    1. Abre script.google.com → Nuevo proyecto
//    2. Pega este código en Code.gs
//    3. Implementar → Nueva implementación → Aplicación web
//       - Ejecutar como:  YO (tu cuenta)
//       - Quién tiene acceso:  Cualquier persona
//    4. Copia la URL de implementación → pégala en .env.local como
//       VITE_GOOGLE_SHEETS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
//    5. Crea una hoja de cálculo y vincula el script:
//       Recursos → Proyecto de Apps Script del script del servicio de Hojas de cálculo
//       ── O ── abre la hoja, ve a Extensiones → Apps Script, pega el código ahí.
//
//  HOJAS CREADAS AUTOMÁTICAMENTE:
//    • Usuarios  — id | nombre | email | passwordHash | createdAt
//    • Planes    — id | userId | formDataJson | planDataJson | createdAt | updatedAt
//    • Checkins  — id | userId | date | rawMessage | adherenceScore | exerciseDone | moodScore | agentResponse | createdAt
// ══════════════════════════════════════════════════════════════════════════════

var SHEET_USERS         = "Usuarios";
var SHEET_PLANS         = "Planes";
var SHEET_CHECKINS      = "Checkins";
var SHEET_GROUP_MEMBERS = "GrupoMiembros";

/* ── Cabeceras de cada hoja ── */
var HEADERS = {
  Usuarios:      ["id", "nombre", "email", "passwordHash", "createdAt"],
  Planes:        ["id", "userId", "formDataJson", "planDataJson", "createdAt", "updatedAt"],
  Checkins:      ["id", "userId", "date", "rawMessage", "adherenceScore", "exerciseDone", "moodScore", "agentResponse", "createdAt"],
  GrupoMiembros: ["group_id", "titular_user_id", "plan_type", "nombre", "categoria", "edad", "sexo", "peso_lbs", "altura_cm", "objetivo", "diet_type", "restricciones", "es_titular", "createdAt"],
};

/* ════════════════════════════════════════════════════════════════════════════
   Punto de entrada HTTP
   ════════════════════════════════════════════════════════════════════════════ */
function doPost(e) {
  try {
    var body    = JSON.parse(e.postData.contents);
    var action  = body.action;
    var ss      = SpreadsheetApp.getActiveSpreadsheet();

    switch (action) {
      case "register":          return jsonOk(handleRegister(ss, body));
      case "login":             return jsonOk(handleLogin(ss, body));
      case "savePlan":          return jsonOk(handleSavePlan(ss, body));
      case "getPlan":           return jsonOk(handleGetPlan(ss, body));
      case "saveCheckin":       return jsonOk(handleSaveCheckin(ss, body));
      case "getCheckins":       return jsonOk(handleGetCheckins(ss, body));
      case "saveGroupMembers":  return jsonOk(handleSaveGroupMembers(ss, body));
      default:                  return jsonOk({ error: "Acción no válida: " + action });
    }
  } catch (err) {
    return jsonOk({ error: err.message });
  }
}

/* ── Respuesta JSON ── */
function jsonOk(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ── Obtener o crear hoja con cabeceras ── */
function getSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, HEADERS[name].length)
         .setValues([HEADERS[name]])
         .setFontWeight("bold")
         .setBackground("#1a2e1a")
         .setFontColor("#b5f06e");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/* ── Leer todas las filas como array de objetos ── */
function getRows(sheet, headers) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
}

/* ════════════════════════════════════════════════════════════════════════════
   REGISTER
   ════════════════════════════════════════════════════════════════════════════ */
function handleRegister(ss, body) {
  var nombre       = (body.nombre       || "").trim();
  var email        = (body.email        || "").toLowerCase().trim();
  var passwordHash = (body.passwordHash || "").trim();

  if (!nombre || !email || !passwordHash) {
    return { error: "Faltan campos requeridos." };
  }

  var sheet = getSheet(ss, SHEET_USERS);
  var rows  = getRows(sheet, HEADERS.Usuarios);

  var exists = rows.some(function(r) {
    return String(r.email).toLowerCase() === email;
  });
  if (exists) {
    return { error: "Este correo ya tiene una cuenta registrada." };
  }

  var id        = Utilities.getUuid();
  var createdAt = new Date().toISOString();

  sheet.appendRow([id, nombre, email, passwordHash, createdAt]);

  return {
    user: { id: id, nombre: nombre, email: email, createdAt: createdAt }
  };
}

/* ════════════════════════════════════════════════════════════════════════════
   LOGIN
   ════════════════════════════════════════════════════════════════════════════ */
function handleLogin(ss, body) {
  var email        = (body.email        || "").toLowerCase().trim();
  var passwordHash = (body.passwordHash || "").trim();

  if (!email || !passwordHash) {
    return { error: "Correo y contraseña son requeridos." };
  }

  var sheet = getSheet(ss, SHEET_USERS);
  var rows  = getRows(sheet, HEADERS.Usuarios);

  var found = null;
  rows.forEach(function(r) {
    if (String(r.email).toLowerCase() === email && r.passwordHash === passwordHash) {
      found = r;
    }
  });

  if (!found) {
    return { error: "Correo o contraseña incorrectos." };
  }

  return {
    user: {
      id:        found.id,
      nombre:    found.nombre,
      email:     found.email,
      createdAt: found.createdAt,
    }
  };
}

/* ════════════════════════════════════════════════════════════════════════════
   SAVE PLAN
   ════════════════════════════════════════════════════════════════════════════ */
function handleSavePlan(ss, body) {
  var userId       = (body.userId       || "").trim();
  var formDataJson = (body.formDataJson || "{}");
  var planDataJson = (body.planDataJson || "{}");

  if (!userId) return { error: "userId requerido." };

  var sheet = getSheet(ss, SHEET_PLANS);
  var data  = sheet.getDataRange().getValues();
  var now   = new Date().toISOString();

  // Buscar fila existente del usuario
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === userId) {
      // Actualizar: formDataJson (col 3), planDataJson (col 4), updatedAt (col 6)
      sheet.getRange(i + 1, 3).setValue(formDataJson);
      sheet.getRange(i + 1, 4).setValue(planDataJson);
      sheet.getRange(i + 1, 6).setValue(now);
      return { ok: true, updated: true };
    }
  }

  // Insertar nueva fila
  var id = Utilities.getUuid();
  sheet.appendRow([id, userId, formDataJson, planDataJson, now, now]);
  return { ok: true, created: true };
}

/* ════════════════════════════════════════════════════════════════════════════
   GET PLAN
   ════════════════════════════════════════════════════════════════════════════ */
function handleGetPlan(ss, body) {
  var userId = (body.userId || "").trim();
  if (!userId) return { plan: null };

  var sheetObj = ss.getSheetByName(SHEET_PLANS);
  if (!sheetObj) return { plan: null };

  var data = sheetObj.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === userId) {
      return {
        plan: {
          formDataJson: data[i][2],
          planDataJson: data[i][3],
        }
      };
    }
  }

  return { plan: null };
}

/* ════════════════════════════════════════════════════════════════════════════
   SAVE CHECKIN
   ════════════════════════════════════════════════════════════════════════════ */
function handleSaveCheckin(ss, body) {
  var userId        = (body.userId        || "").trim();
  var date          = (body.date          || "").trim();
  var rawMessage    = (body.rawMessage    || "");
  var adherenceScore = Number(body.adherenceScore || 5);
  var exerciseDone  = body.exerciseDone === true || body.exerciseDone === "true";
  var moodScore     = Number(body.moodScore     || 3);
  var agentResponse = (body.agentResponse || "");
  var createdAt     = new Date().toISOString();
  var id            = body.id || ("web-" + Date.now());

  if (!userId || !date) return { error: "userId y date son requeridos." };

  var sheet = getSheet(ss, SHEET_CHECKINS);
  var data  = sheet.getDataRange().getValues();

  // Si ya existe un check-in para este usuario+fecha, actualizar
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === userId && data[i][2] === date) {
      sheet.getRange(i + 1, 4).setValue(rawMessage);
      sheet.getRange(i + 1, 5).setValue(adherenceScore);
      sheet.getRange(i + 1, 6).setValue(exerciseDone);
      sheet.getRange(i + 1, 7).setValue(moodScore);
      sheet.getRange(i + 1, 8).setValue(agentResponse);
      return { ok: true, updated: true };
    }
  }

  // Nuevo check-in
  sheet.appendRow([id, userId, date, rawMessage, adherenceScore, exerciseDone, moodScore, agentResponse, createdAt]);
  return { ok: true, created: true };
}

/* ════════════════════════════════════════════════════════════════════════════
   SAVE GROUP MEMBERS
   ════════════════════════════════════════════════════════════════════════════ */
function handleSaveGroupMembers(ss, body) {
  var groupId   = (body.groupId   || "").trim();
  var userId    = (body.userId    || "").trim();
  var planType  = (body.planType  || "").trim();
  var membersJson = body.membersJson || "[]";

  if (!groupId || !userId) return { error: "groupId y userId son requeridos." };

  var members;
  try { members = JSON.parse(membersJson); } catch (e) { return { error: "membersJson inválido." }; }

  var sheet     = getSheet(ss, SHEET_GROUP_MEMBERS);
  var createdAt = new Date().toISOString();

  for (var i = 0; i < members.length; i++) {
    var m = members[i];
    sheet.appendRow([
      groupId,
      userId,
      planType,
      m.nombre        || "",
      m.categoria     || "adulto",
      m.edad          || "",
      m.sexo          || "",
      m.peso_lbs      || "",
      m.altura_cm     || "",
      m.objetivo      || "",
      m.diet_type     || "balanceada",
      m.restricciones || "",
      m.es_titular === true ? "TRUE" : "FALSE",
      createdAt,
    ]);
  }

  return { ok: true, saved: members.length };
}

/* ════════════════════════════════════════════════════════════════════════════
   GET CHECKINS
   ════════════════════════════════════════════════════════════════════════════ */
function handleGetCheckins(ss, body) {
  var userId = (body.userId || "").trim();
  if (!userId) return { checkins: [] };

  var sheetObj = ss.getSheetByName(SHEET_CHECKINS);
  if (!sheetObj) return { checkins: [] };

  var rows   = getRows(sheetObj, HEADERS.Checkins);
  var result = rows
    .filter(function(r) { return r.userId === userId; })
    .map(function(r) {
      return {
        id:              r.id,
        user_id:         r.userId,
        date:            r.date,
        raw_message:     r.rawMessage,
        adherence_score: Number(r.adherenceScore),
        exercise_done:   r.exerciseDone === true || r.exerciseDone === "TRUE",
        mood_score:      Number(r.moodScore),
        agent_response:  r.agentResponse,
        created_at:      r.createdAt,
      };
    });

  return { checkins: result };
}
