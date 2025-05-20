/**
 * Configuration file for Rental Prima Backend
 */

module.exports = {
  // Supabase configuration
  supabaseUrl: process.env.SUPABASE_URL || 'https://iqctarumnxsxyqkzxfkz.supabase.co',
  supabaseKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'rental-prima-super-secret-jwt-key',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  
  // Server configuration
  port: process.env.PORT || 5001,
  env: process.env.NODE_ENV || 'development',
  
  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
};
