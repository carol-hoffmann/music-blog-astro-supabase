import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const url = window.PUBLIC_SUPABASE_URL;
const key = window.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(url, key);
