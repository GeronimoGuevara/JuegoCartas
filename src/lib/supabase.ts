import { createClient } from '@supabase/supabase-js';

// Las variables viven en `.env` (ver `.env.example`). Si no están seteadas,
// el cliente se crea igual para no romper el build, pero cualquier llamada
// de red va a fallar en silencio y useOfflineSync la va a reintentar después.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
      'La app sigue funcionando offline, pero no va a poder sincronizar.'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
