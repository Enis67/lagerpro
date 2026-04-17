// Supabase Client – Verbindung zur Cloud-Datenbank
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
