import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'CRITICAL ERROR: Missing Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY). Please ensure these are set in your .env file locally or in the Vercel dashboard for production.';
  console.error(errorMsg);
  // Throwing an error here prevents the app from initializing with a null client
  throw new Error(errorMsg);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
