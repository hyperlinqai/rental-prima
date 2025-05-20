import supabase from '../utils/supabaseClient';
import apiClient from '../utils/apiClient';
import API_CONFIG from '../config/apiConfig';

class AuthService {
  // Sign up a new user
  async signUp(email, password, userData) {
    try {
      // Try Supabase first
      try {
        // Register with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (authError) throw authError;
        
        // Create user profile in the users table
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert([{
              id: authData.user.id,
              email: email,
              ...userData,
              created_at: new Date().toISOString()
            }]);
          
          if (profileError) throw profileError;
        }
        
        return authData;
      } catch (supabaseError) {
        console.warn('Supabase signup failed, trying backend API:', supabaseError);
        
        // If Supabase fails, try the backend API
        const response = await apiClient.post(API_CONFIG.endpoints.auth.register, {
          email,
          password,
          ...userData
        });
        
        if (response.success) {
          return response.data;
        }
        
        throw new Error('Signup failed');
      }
    } catch (error) {
      console.error('Error during sign up:', error);
      throw error;
    }
  }
  
  // Sign in a user
  async signIn(email, password) {
    try {
      // First try Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.warn('Supabase auth failed, trying backend API:', error);
        
        // If Supabase fails, try the backend API
        try {
          const response = await apiClient.post(API_CONFIG.endpoints.auth.login, {
            email,
            password
          });
          
          console.log('Backend API response:', response);
          
          // Handle the new response format from our updated backend
          if (response.success && response.data) {
            // Store the token in localStorage if available
            if (response.data.session?.access_token) {
              localStorage.setItem('token', response.data.session.access_token);
            }
            
            // Return a compatible data structure
            return {
              session: response.data.session,
              user: response.data.user
            };
          }
          
          throw new Error('Login failed');
        } catch (apiError) {
          console.error('Backend API login failed:', apiError);
          throw apiError;
        }
      }
      
      // If Supabase succeeds, store the token
      if (data.session?.access_token) {
        localStorage.setItem('token', data.session.access_token);
      }
      
      return data;
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error;
    }
  }
  
  // Sign out a user
  async signOut() {
    try {
      // First try to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase logout error:', error);
      }
      
      try {
        // Try to call our backend API to logout, but don't wait for it
        // This prevents blocking if the backend is down
        apiClient.get('/auth/logout').catch(err => {
          console.warn('Backend logout API error (non-critical):', err);
        });
      } catch (backendError) {
        console.warn('Backend logout attempt failed (non-critical):', backendError);
      }
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return { success: true, warning: 'Logged out locally, but server logout failed' };
    }
  }
  
  // Get the current user
  async getCurrentUser() {
    try {
      // First try to get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No token found in localStorage');
        return null;
      }
      
      // Try Supabase first
      try {
        const { data, error } = await supabase.auth.getUser();
        const user = data?.user;
        
        console.log('Supabase getUser result:', { user, error });
        
        if (!error && user) {
          try {
            // Get user profile from the users table with role information
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single();
            
            console.log('User profile:', profile);
            
            if (profileError) {
              console.warn('Profile error, returning basic user:', profileError);
              // Return basic user info if profile fetch fails
              return {
                id: user.id,
                email: user.email,
                user_type: 'customer',
                role: 'customer',
                name: 'User',
                status: 'active'
              };
            }
            
            // Get role information separately if needed
            let roleInfo = null;
            if (profile.role_id) {
              try {
                const { data: role } = await supabase
                  .from('roles')
                  .select('*')
                  .eq('id', profile.role_id)
                  .single();
                  
                roleInfo = role;
                console.log('User role info:', roleInfo);
              } catch (roleError) {
                console.warn('Error fetching role info:', roleError);
              }
            }
            
            // Ensure we have proper role information
            const userData = {
              ...user,
              ...profile,
              // Make sure we have user_type for compatibility
              user_type: profile.user_type || 'customer',
              // Add role information if available
              role: profile.role || 'customer',
              roles: roleInfo
            };
            
            console.log('Returning user data with role info:', userData);
            return userData;
          } catch (profileError) {
            console.warn('Error fetching profile, returning basic user:', profileError);
            // Return basic user info if profile fetch fails
            return {
              id: user.id,
              email: user.email,
              user_type: 'customer',
              role: 'customer',
              name: 'User',
              status: 'active'
            };
          }
        } else {
          console.warn('No valid user found in Supabase session');
          return null;
        }
      } catch (supabaseError) {
        console.warn('Supabase getUser failed:', supabaseError);
        // Return null instead of throwing to prevent white screen
        return null;
      }
      
      // If we reach here, we couldn't get the user from Supabase
      // Try the backend API as a fallback
      try {
        const response = await apiClient.get(API_CONFIG.endpoints.auth.me);
        
        if (response.success && response.data) {
          return response.data;
        }
      } catch (apiError) {
        console.error('Backend API getCurrentUser failed:', apiError);
      }
      
      // If both methods fail, return null
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      // Instead of throwing, return null to prevent app from crashing
      return null;
    }
  }
  
  // Reset password
  async resetPassword(email) {
    try {
      // Try Supabase first
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (error) throw error;
        return true;
      } catch (supabaseError) {
        console.warn('Supabase password reset failed, trying backend API:', supabaseError);
        
        // If Supabase fails, try the backend API
        const response = await apiClient.post('/api/auth/reset-password', { email });
        
        if (response.success) {
          return true;
        }
        
        throw new Error('Password reset failed');
      }
    } catch (error) {
      console.error('Error during password reset:', error);
      throw error;
    }
  }
  
  // Update user password
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
  
  // Update user profile
  async updateProfile(userId, userData) {
    try {
      // Try Supabase first
      try {
        const { data, error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', userId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (supabaseError) {
        console.warn('Supabase profile update failed, trying backend API:', supabaseError);
        
        // If Supabase fails, try the backend API
        const response = await apiClient.put(`/api/users/${userId}`, userData);
        
        if (response.success && response.data) {
          return response.data;
        }
        
        throw new Error('Profile update failed');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}

export default new AuthService();
