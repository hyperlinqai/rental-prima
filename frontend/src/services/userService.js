import BaseService from './baseService';
import supabase from '../utils/supabaseClient';

class UserService extends BaseService {
  constructor() {
    super('users');
  }

  // Get users with filters
  async getUsers(filters = {}) {
    try {
      let query = supabase.from(this.tableName).select('*, roles(*)');
      
      // Apply filters if provided
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching users with filters:', error);
      throw error;
    }
  }

  // Get active roles
  async getActiveRoles() {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching active roles:', error);
      throw error;
    }
  }

  // Create a new user
  async create(userData) {
    try {
      console.log('Creating user with data:', userData);
      
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select('*, roles(*)');
      
      if (error) {
        console.error('Create error:', error);
        throw error;
      }
      
      console.log('Create result:', data);
      return data[0];
    } catch (error) {
      console.error(`Error creating user:`, error);
      throw error;
    }
  }

  // Update a user
  async update(id, updates) {
    try {
      console.log('Updating user with ID:', id);
      console.log('Update data:', updates);
      
      // Make a direct API call to update the user
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }
      
      const result = await response.json();
      console.log('Update result:', result);
      return result.data;
    } catch (error) {
      console.error(`Error updating user:`, error);
      throw error;
    }
  }
}

export default new UserService();
