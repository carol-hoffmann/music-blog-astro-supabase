import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = import.meta.env?.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.PUBLIC_SUPABASE_ANON_KEY;

// Fallback: Netlify injects env at build, but browser won't have import.meta.env.
// So we read from window.__ENV (we’ll set it in the page) or global vars.
const url = supabaseUrl || window.PUBLIC_SUPABASE_URL;
const key = supabaseAnonKey || window.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(url, key);
