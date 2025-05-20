// Simple script to create an admin user in Supabase
import supabase from './utils/supabaseClient';

const createAdmin = async () => {
  const email = 'admin@gmail.com';
  const password = 'password123';
  
  try {
    // 1. Create the user in Supabase Auth
    console.log(`Creating admin user with email: ${email}...`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) throw authError;
    
    console.log('User created in Auth:', authData);
    
    // 2. Create the user profile in the users table
    if (authData.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: email,
          name: 'Admin User',
          role: 'superadmin',
          status: 'active',
          created_at: new Date().toISOString()
        }])
        .select();
      
      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return;
      }
      
      console.log('Admin user created successfully!');
      console.log('User Profile:', profileData[0]);
    }
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }
};

// Execute the function
createAdmin();
