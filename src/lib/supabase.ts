/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseSyncEnabled =
  import.meta.env.VITE_ENABLE_SUPABASE_SYNC === 'true' &&
  Boolean(supabaseUrl && supabaseAnonKey);

// The client needs syntactically valid values even when remote sync is disabled.
// No request is sent unless VITE_ENABLE_SUPABASE_SYNC=true and credentials exist.
export const supabase = createClient(
  supabaseUrl || 'https://disabled.supabase.co',
  supabaseAnonKey || 'disabled-anon-key'
);
