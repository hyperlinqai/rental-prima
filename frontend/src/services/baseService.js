import supabase from '../utils/supabaseClient';

class BaseService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  // Get all records
  async getAll() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      throw error;
    }
  }

  // Get a single record by ID
  async getById(id) {
    try {
      // All tables use 'id' as the primary key
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching ${this.tableName} by ID:`, error);
      throw error;
    }
  }

  // Create a new record
  async create(record) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([record])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
  }

  // Update an existing record
  async update(id, updates) {
    try {
      // All tables use 'id' as the primary key
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }
  }

  // Delete a record
  async delete(id) {
    try {
      // All tables use 'id' as the primary key
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw error;
    }
  }
}

export default BaseService;
