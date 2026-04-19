import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'CRITICAL ERROR: Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and VITE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) are set in your deployment dashboard.';
  console.error(errorMsg);
  // We throw a non-breaking error or log it, but the app should attempt to mount
  // However, without a client, most features will fail, so we still want a clear indicator.
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
