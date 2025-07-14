// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// These variables are provided by the Canvas environment.
// __firebase_config is a generic platform configuration object.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
let platformConfig = {};
try {
  if (typeof __firebase_config !== 'undefined') {
    platformConfig = JSON.parse(__firebase_config);
  }
} catch (e) {
  console.error("Error parsing __firebase_config:", e.message ? String(e.message) : String(e));
  // Fallback to empty config if parsing fails
}

// Supabase URL and Anon Key are extracted from the platformConfig
// IMPORTANT: Replace with your actual Supabase URL and Anon Key if they are not provided via __firebase_config
const supabaseUrl = platformConfig.supabaseUrl || 'YOUR_SUPABASE_URL'; 
const supabaseAnonKey = platformConfig.supabaseAnonKey || 'YOUR_SUPABASE_ANON_KEY'; 

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.error("Supabase URL is not configured. Please update lib/supabase.js with your Supabase URL.");
  throw new Error("Supabase URL not configured.");
}
if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.error("Supabase Anon Key is not configured. Please update lib/supabase.js with your Supabase Anon Key.");
  throw new Error("Supabase Anon Key not configured.");
}

// Create and export the Supabase client instance directly.
// This ensures it's initialized synchronously when the module is loaded.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// You can optionally export the platformConfig if other parts of your app need it.
export { platformConfig, appId };
