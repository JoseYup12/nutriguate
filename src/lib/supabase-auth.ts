import { supabase } from "./supabase";
import type { SheetUser } from "./googleSheets";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

async function callEdgeFunction(name: string, body: Record<string, unknown>, jwt?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
  return data;
}

export async function registerSupabaseUser(
  nombre: string,
  email: string,
  password: string,
  phone: string,
): Promise<SheetUser> {
  // Llama register-user (crea auth + whatsapp_profiles + user_streaks)
  const data = await callEdgeFunction("register-user", {
    email: email.toLowerCase().trim(),
    password,
    nombre: nombre.trim(),
    phone: phone.trim(),
  });

  // Ahora hace login para obtener el JWT y la sesión
  const { data: session, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  });
  if (error) throw new Error(error.message);

  const user = session.user;
  return {
    id:        user.id,
    nombre:    nombre.trim(),
    email:     user.email ?? email,
    createdAt: user.created_at,
  };
}

export async function loginSupabaseUser(email: string, password: string): Promise<SheetUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  });
  if (error) {
    if (error.message.toLowerCase().includes("invalid login")) {
      throw new Error("Correo o contraseña incorrectos.");
    }
    throw new Error(error.message);
  }

  const user = data.user;
  const jwt  = data.session?.access_token;

  // Obtiene el nombre del perfil via verify-session
  let nombre = user.email?.split("@")[0] ?? "Usuario";
  try {
    const profile = await callEdgeFunction("verify-session", {}, jwt);
    if (profile?.profile?.display_name) nombre = profile.profile.display_name;
  } catch {
    // no bloquea el login si falla verify-session
  }

  return {
    id:        user.id,
    nombre,
    email:     user.email ?? email,
    createdAt: user.created_at,
  };
}

export async function logoutSupabaseUser(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSupabaseSession(): Promise<SheetUser | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;
  const user = data.session.user;
  return {
    id:        user.id,
    nombre:    user.email?.split("@")[0] ?? "Usuario",
    email:     user.email ?? "",
    createdAt: user.created_at,
  };
}
