import { createClient } from '@supabase/supabase-js';
import BaseService from './baseService';

// Initialize the Supabase client
const supabaseUrl = 'https://iqctarumnxsxyqkzxfkz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3RhcnVtbnhzeHlxa3p4Zmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDc4MTAsImV4cCI6MjA2MjUyMzgxMH0.QvlZGTAHi1T3DThSbgkWIHvj_w7l6wqW25xIPdXZ8xc';
const supabase = createClient(supabaseUrl, supabaseKey);

// Table name for roles
const ROLE_TABLE = 'roles';

class RoleService extends BaseService {
  constructor() {
    super(ROLE_TABLE);
  }

  /**
   * Get all roles
   * @returns {Promise<Array>} Array of roles
   */
  async getAllRoles() {
    try {
      console.log('Fetching all roles from table:', this.tableName);
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Supabase error fetching roles:', error);
        throw new Error(error.message);
      }
      
      // If no data comes back, check if we need to initialize default roles
      if (!data || data.length === 0) {
        console.log('No roles found, creating default roles');
        await this.initializeDefaultRoles();
        
        // Fetch again after initialization
        const { data: newData, error: newError } = await supabase
          .from(this.tableName)
          .select('*')
          .order('name', { ascending: true });
          
        if (newError) {
          throw new Error(newError.message);
        }
        
        return newData || [];
      }
      
      console.log('Successfully fetched roles:', data);
      return data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }
  
  /**
   * Initialize default roles if none exist
   * @private
   * @returns {Promise<void>}
   */
  async initializeDefaultRoles() {
    try {
      const defaultRoles = [
        {
          name: 'super_admin',
          description: 'Oversees entire platform',
          status: 'active',
          is_system_role: true,
          permissions: ['users', 'admins', 'listings', 'categories', 'payments', 'plans', 'settings', 'support'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          name: 'admin',
          description: 'Manages portal operations',
          status: 'active',
          is_system_role: true,
          permissions: ['users', 'listings', 'categories', 'support'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          name: 'support',
          description: 'Provides customer/vendor assistance',
          status: 'active',
          is_system_role: true,
          permissions: ['support'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          name: 'customer',
          description: 'Browses and rents items',
          status: 'active',
          is_system_role: true,
          permissions: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          name: 'vendor',
          description: 'Lists and manages own rental items',
          status: 'active',
          is_system_role: true,
          permissions: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          name: 'accountant',
          description: 'Handles financial reconciliations',
          status: 'active',
          is_system_role: true,
          permissions: ['payments'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          name: 'manager',
          description: 'Manager with moderate access',
          status: 'active',
          is_system_role: false,
          permissions: ['users', 'listings', 'categories'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      const { error } = await supabase
        .from(this.tableName)
        .insert(defaultRoles);
        
      if (error) {
        console.error('Error creating default roles:', error);
        throw new Error(error.message);
      }
      
      console.log('Default roles created successfully');
    } catch (error) {
      console.error('Error initializing default roles:', error);
      throw error;
    }
  }

  /**
   * Get active roles (for dropdowns)
   * @returns {Promise<Array>} Array of active roles
   */
  async getActiveRoles() {
    try {
      console.log('Fetching active roles from table:', this.tableName);
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Supabase error fetching active roles:', error);
        throw new Error(error.message);
      }
      
      console.log('Successfully fetched active roles:', data);
      return data || [];
    } catch (error) {
      console.error('Error fetching active roles:', error);
      throw error;
    }
  }

  /**
   * Create a new role
   * @param {Object} role - Role data
   * @returns {Promise<Object>} Created role
   */
  async createRole(role) {
    try {
      console.log('Creating new role in table:', this.tableName, role);
      
      // Ensure permissions is an array
      const roleData = {
        ...role,
        permissions: Array.isArray(role.permissions) ? role.permissions : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Check if role with same name already exists
      const { data: existingRoles, error: checkError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('name', roleData.name.toLowerCase().trim());
        
      if (checkError) {
        console.error('Error checking for existing role:', checkError);
        throw new Error(checkError.message);
      }
      
      if (existingRoles && existingRoles.length > 0) {
        throw new Error(`A role with name '${roleData.name}' already exists`);
      }
      
      // Create new role
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([roleData])
        .select();
      
      if (error) {
        console.error('Supabase error creating role:', error);
        throw new Error(error.message);
      }
      
      if (!data || data.length === 0) {
        throw new Error('Role created but no data returned');
      }
      
      console.log('Role created successfully:', data[0]);
      return data[0];
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  /**
   * Update an existing role
   * @param {string} id - Role ID
   * @param {Object} role - Updated role data
   * @returns {Promise<Object>} Updated role
   */
  async updateRole(id, role) {
    try {
      console.log('Updating role in table:', this.tableName, 'ID:', id, 'Data:', role);
      
      // First check if role exists
      const { data: existingData, error: checkError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
        
      if (checkError) {
        console.error('Error checking for existing role:', checkError);
        throw new Error(`Role with ID ${id} not found`);
      }
      
      if (!existingData) {
        throw new Error(`Role with ID ${id} not found`);
      }
      
      // If this is a system role, restrict what can be updated
      if (existingData.is_system_role) {
        console.log('Updating system role - restricted fields');
        // For system roles, only allow updating the description
        role = {
          description: role.description,
          updated_at: new Date().toISOString()
        };
      } else {
        // For non-system roles, allow updating everything except is_system_role
        role = {
          ...role,
          // Ensure permissions is an array
          permissions: Array.isArray(role.permissions) ? role.permissions : [],
          is_system_role: existingData.is_system_role, // Keep original system role flag
          updated_at: new Date().toISOString()
        };
      }
      
      const { data, error } = await supabase
        .from(this.tableName)
        .update(role)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Supabase error updating role:', error);
        throw new Error(error.message);
      }
      
      if (!data || data.length === 0) {
        throw new Error('No data returned after update');
      }
      
      console.log('Role updated successfully:', data[0]);
      return data[0];
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  /**
   * Delete a role
   * @param {string} id - Role ID
   * @returns {Promise<void>}
   */
  async deleteRole(id) {
    try {
      console.log('Deleting role from table:', this.tableName, 'ID:', id);
      
      // First check if role exists and is not a system role
      const { data: existingData, error: checkError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
        
      if (checkError) {
        console.error('Error checking for existing role:', checkError);
        throw new Error(`Role with ID ${id} not found`);
      }
      
      if (!existingData) {
        throw new Error(`Role with ID ${id} not found`);
      }
      
      // Prevent deletion of system roles
      if (existingData.is_system_role) {
        throw new Error('System roles cannot be deleted');
      }
      
      // TODO: Add check for role being used by users (not implemented yet)
      
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Supabase error deleting role:', error);
        throw new Error(error.message);
      }
      
      console.log('Role deleted successfully');
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }
  
  /**
   * Get role by ID
   * @param {string} id - Role ID
   * @returns {Promise<Object>} Role object
   */
  async getRoleById(id) {
    try {
      console.log('Fetching role by ID from table:', this.tableName, 'ID:', id);
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Supabase error fetching role by ID:', error);
        throw new Error(error.message);
      }
      
      if (!data) {
        throw new Error(`Role with ID ${id} not found`);
      }
      
      console.log('Successfully fetched role by ID:', data);
      return data;
    } catch (error) {
      console.error('Error fetching role by ID:', error);
      throw error;
    }
  }
}

export default new RoleService();
