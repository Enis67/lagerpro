// Supabase Client – Verbindung zur Cloud-Datenbank + Auth
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[LagerPro] Supabase-Konfiguration fehlt – Offline-Modus aktiv');
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Prüft ob Supabase-Verbindung verfügbar ist
 */
export function isSupabaseAvailable() {
  return supabase !== null;
}

// ── Auth-Methoden ───────────────────────────────────────

export async function signUp(email, password, name, role = 'monteur') {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role } },
  });
  if (authError) throw authError;
  // Benutzer-Profil in users-Tabelle anlegen
  if (authData.user) {
    await supabase.from('users').insert({
      id: authData.user.id,
      email,
      name,
      role,
      active: true,
    });
  }
  return authData;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Holt aktuellen Benutzer direkt aus Auth (keine users-Tabelle nötig).
 * Name und Rolle werden aus user_metadata gelesen.
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.email,
    role: user.user_metadata?.role || 'monteur',
    active: true,
  };
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
}

/*
  HINWEIS: Die users-Tabelle in supabase/schema.sql ist optional.
  Für erweiterte Features (Admin sieht alle User, User-Verwaltung)
  kann sie später über den Supabase SQL Editor eingespielt werden.
  Der Auth-Trigger (handle_new_user) macht dann automatisch Einträge.
*/
