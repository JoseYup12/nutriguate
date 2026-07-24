/* ══════════════════════════════════════════════════════════════════════════════
   NutriGuate — Google Sheets Service (via Apps Script Web App)
   ══════════════════════════════════════════════════════════════════════════════
   Configura VITE_GOOGLE_SHEETS_SCRIPT_URL en .env.local
   Instrucciones de despliegue: google-apps-script/README.md
   ══════════════════════════════════════════════════════════════════════════════ */

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SHEETS_SCRIPT_URL as string | undefined;
const LS_USER_KEY  = "nutriguate_user";
const LS_USERS_KEY = "nutriguate_local_users";

export const isSheetsConfigured = !!(SCRIPT_URL?.startsWith("https://"));

/* ── Tipos ────────────────────────────────────────────────────────────────── */
export interface SheetUser {
  id:        string;
  nombre:    string;
  email:     string;
  createdAt: string;
}

/* ── Hash SHA-256 (la contraseña NUNCA viaja en texto plano) ─────────────── */
async function hashPassword(pwd: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(pwd),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ── Llamada al Apps Script via JSON POST ────────────────────────────────── */
async function callScript<T = Record<string, unknown>>(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  if (!isSheetsConfigured) {
    throw new Error("SHEETS_NOT_CONFIGURED");
  }

  const res = await fetch(SCRIPT_URL!, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ action, ...payload }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = (await res.json()) as { error?: string } & T;
  if ("error" in json && json.error) throw new Error(json.error as string);
  return json;
}

/* ══════════════════════════════════════════════════════════════════════════════
   Auth — Google Sheets
   ══════════════════════════════════════════════════════════════════════════════ */
export async function registerUser(
  nombre: string,
  email:  string,
  password: string,
): Promise<SheetUser> {
  const passwordHash = await hashPassword(password);
  const { user } = await callScript<{ user: SheetUser }>("register", {
    nombre,
    email: email.toLowerCase().trim(),
    passwordHash,
  });
  persistUser(user);
  return user;
}

export async function loginUser(email: string, password: string): Promise<SheetUser> {
  const passwordHash = await hashPassword(password);
  const { user } = await callScript<{ user: SheetUser }>("login", {
    email: email.toLowerCase().trim(),
    passwordHash,
  });
  persistUser(user);
  return user;
}

/* ══════════════════════════════════════════════════════════════════════════════
   Auth — Modo local (sin Sheets) — útil para demo / desarrollo
   ══════════════════════════════════════════════════════════════════════════════ */
export async function registerLocalUser(
  nombre: string,
  email:  string,
  password: string,
): Promise<SheetUser> {
  const users = getLocalUsers();
  const exists = users.find((u) => u.email === email.toLowerCase().trim());
  if (exists) throw new Error("Este correo ya tiene una cuenta en este dispositivo.");

  const passwordHash = await hashPassword(password);
  const user: SheetUser & { passwordHash: string } = {
    id:           `local-${Date.now()}`,
    nombre,
    email:        email.toLowerCase().trim(),
    createdAt:    new Date().toISOString(),
    passwordHash,
  };
  users.push(user);
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
  const { passwordHash: _ph, ...safe } = user;
  void _ph;
  persistUser(safe);
  return safe;
}

export async function loginLocalUser(email: string, password: string): Promise<SheetUser> {
  const passwordHash = await hashPassword(password);
  const users = getLocalUsers();
  const user = users.find(
    (u) => u.email === email.toLowerCase().trim() && u.passwordHash === passwordHash,
  );
  if (!user) throw new Error("Correo o contraseña incorrectos.");
  const { passwordHash: _ph, ...safe } = user;
  void _ph;
  persistUser(safe);
  return safe;
}

/* ══════════════════════════════════════════════════════════════════════════════
   Plan — guardar / cargar
   ══════════════════════════════════════════════════════════════════════════════ */
export async function savePlanToSheet(
  userId:   string,
  formData: Record<string, unknown>,
  planData: Record<string, unknown>,
): Promise<void> {
  if (isSheetsConfigured) {
    await callScript("savePlan", {
      userId,
      formDataJson: JSON.stringify(formData),
      planDataJson: JSON.stringify(planData),
    });
  }
  // Siempre guardar local como caché
  localStorage.setItem(`ng_plan_${userId}`, JSON.stringify({ formData, planData }));
}

export async function getUserPlanFromSheet(
  userId: string,
): Promise<{ formData: Record<string, unknown>; planData: Record<string, unknown> } | null> {
  // Intentar Sheets primero
  if (isSheetsConfigured) {
    try {
      const { plan } = await callScript<{
        plan: { formDataJson: string; planDataJson: string } | null;
      }>("getPlan", { userId });
      if (plan) {
        return {
          formData: JSON.parse(plan.formDataJson),
          planData: JSON.parse(plan.planDataJson),
        };
      }
    } catch {/* caer al local */}
  }
  // Fallback: localStorage
  const raw = localStorage.getItem(`ng_plan_${userId}`);
  if (!raw) return null;
  try { return JSON.parse(raw) as { formData: Record<string, unknown>; planData: Record<string, unknown> }; }
  catch { return null; }
}

/* ══════════════════════════════════════════════════════════════════════════════
   Sesión persistida en localStorage
   ══════════════════════════════════════════════════════════════════════════════ */
export function persistUser(user: SheetUser): void {
  localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
}

export function getPersistedUser(): SheetUser | null {
  const raw = localStorage.getItem(LS_USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as SheetUser; } catch { return null; }
}

export function clearSession(): void {
  localStorage.removeItem(LS_USER_KEY);
}

/* ══════════════════════════════════════════════════════════════════════════════
   Perfiles grupales — guardar en "GrupoMiembros"
   ══════════════════════════════════════════════════════════════════════════════ */
export interface GroupMemberRecord {
  id: string;
  nombre: string;
  sexo: string;
  edad: string;
  peso_lbs: string;
  altura_cm: string;
  objetivo: string;
  diet_type: string;
  restricciones: string;
  categoria: string;
  es_titular: boolean;
}

export async function saveGroupMembers(
  userId: string,
  planType: string,
  members: GroupMemberRecord[],
): Promise<void> {
  const groupId = `${userId}_${Date.now()}`;
  if (isSheetsConfigured) {
    try {
      await callScript("saveGroupMembers", {
        groupId,
        userId,
        planType,
        membersJson: JSON.stringify(members),
      });
    } catch {/* ignorar error de Sheets, siempre guardar local */}
  }
  // Siempre guardar local como caché
  localStorage.setItem(`ng_group_${userId}`, JSON.stringify({ groupId, planType, members }));
}

export function getLocalGroupMembers(userId: string): { groupId: string; planType: string; members: GroupMemberRecord[] } | null {
  const raw = localStorage.getItem(`ng_group_${userId}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

/* ── helpers internos ── */
type LocalUserRecord = SheetUser & { passwordHash: string };

function getLocalUsers(): LocalUserRecord[] {
  const raw = localStorage.getItem(LS_USERS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as LocalUserRecord[]; } catch { return []; }
}
