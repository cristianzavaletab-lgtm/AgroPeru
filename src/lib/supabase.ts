/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xgyhortndkhnknbvtoyj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneWhvcnRuZGtobmtuYnZ0b3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODQyOTcsImV4cCI6MjEwNDU2MDI5N30.UofqU2PQ6E2oTUDb2RDR_h7GCYsEvguuG3j4MPGpZJw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
