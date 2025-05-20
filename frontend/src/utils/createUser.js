import supabase from './supabaseClient';

/**
 * Creates a new user in Supabase
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {object} userData - Additional user data
 * @returns {Promise} - Promise with the result
 */
const createUser = async (email, password, userData = {}) => {
  try {
    // 1. Create the user in Supabase Auth
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
          name: userData.name || 'Admin User',
          role: userData.role || 'superadmin',
          status: userData.status || 'active',
          created_at: new Date().toISOString()
        }])
        .select();
      
      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return {
          success: false,
          error: profileError,
          message: 'User created in Auth but profile creation failed'
        };
      }
      
      console.log('User profile created:', profileData);
      
      return {
        success: true,
        user: authData.user,
        profile: profileData[0]
      };
    }
    
    return {
      success: false,
      message: 'No user data returned from Auth'
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      error,
      message: error.message
    };
  }
};

export default createUser;
