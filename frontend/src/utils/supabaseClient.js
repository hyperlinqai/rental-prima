import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with credentials from environment variables
// Use window._env_ as a fallback for runtime environment variables in production
const getEnvVariable = (key, defaultValue) => {
  if (window._env_ && window._env_[key]) {
    return window._env_[key];
  }
  return process.env[key] || defaultValue;
};

const supabaseUrl = getEnvVariable('REACT_APP_SUPABASE_URL', 'https://iqctarumnxsxyqkzxfkz.supabase.co');
const supabaseAnonKey = getEnvVariable('REACT_APP_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc');

console.log('Supabase URL:', supabaseUrl);
console.log('Using Supabase client with URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
