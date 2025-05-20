import BaseService from './baseService';
import supabase from '../utils/supabaseClient';

// Table name for categories
const CATEGORY_TABLE = 'categories';

class CategoryService extends BaseService {
  constructor() {
    super(CATEGORY_TABLE);
  }

  /**
   * Get all categories with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Array of categories
   */
  async getCategories(filters = {}) {
    try {
      console.log('Fetching categories with filters:', filters);
      let query = supabase.from(this.tableName).select('*');
      
      // Apply filters if provided
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.parent_id) {
        query = query.eq('parent_id', filters.parent_id);
      }
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      // Apply ordering
      const orderField = filters.orderBy || 'created_at';
      const orderDirection = filters.orderDirection || 'desc';
      query = query.order(orderField, { ascending: orderDirection === 'asc' });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Supabase error fetching categories:', error);
        throw new Error(error.message);
      }
      
      console.log(`Successfully fetched ${data?.length || 0} categories`);
      return data || [];
    } catch (error) {
      console.error('Error fetching categories with filters:', error);
      throw error;
    }
  }
  
  /**
   * Get a category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Category object
   */
  async getCategoryById(id) {
    try {
      console.log('Fetching category by ID:', id);
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Supabase error fetching category by ID:', error);
        throw new Error(error.message);
      }
      
      if (!data) {
        throw new Error(`Category with ID ${id} not found`);
      }
      
      console.log('Successfully fetched category:', data);
      return data;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      throw error;
    }
  }
  
  /**
   * Create a new category
   * @param {Object} category - Category data
   * @returns {Promise<Object>} Created category
   */
  async createCategory(category) {
    try {
      console.log('Creating new category:', category);
      
      // Validate required fields
      if (!category.name || !category.name.trim()) {
        throw new Error('Category name is required');
      }
      
      // Only use the fields that definitely exist in the database schema
      // Based on the errors, we know only certain fields exist
      const categoryData = {
        name: category.name.trim(),
        description: category.description || '',
        status: category.status || 'active',
        parent_id: category.parent_id || null
      };
      
      console.log('Creating category with data:', categoryData);
      
      // Check if category with same name already exists
      const { data: existingCategories, error: checkError } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('name', categoryData.name.trim())
        .limit(1);
      
      if (checkError) {
        console.error('Error checking for duplicate category:', checkError);
        throw new Error(checkError.message);
      }
      
      if (existingCategories && existingCategories.length > 0) {
        throw new Error(`A category with name '${categoryData.name}' already exists`);
      }
      
      // Create the category
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([categoryData])
        .select();
      
      if (error) {
        console.error('Supabase error creating category:', error);
        throw new Error(error.message);
      }
      
      if (!data || data.length === 0) {
        throw new Error('Category created but no data returned');
      }
      
      console.log('Category created successfully:', data[0]);
      return data[0];
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing category
   * @param {string} id - Category ID
   * @param {Object} category - Updated category data
   * @returns {Promise<Object>} Updated category
   */
  async updateCategory(id, category) {
    try {
      console.log('Updating category ID:', id, 'with data:', category);
      
      // Check if category exists
      const { data: existingData, error: checkError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (checkError) {
        console.error('Error checking for existing category:', checkError);
        throw new Error(`Category with ID ${id} not found`);
      }
      
      if (!existingData) {
        throw new Error(`Category with ID ${id} not found`);
      }
      
      // If name changed, check for duplicates
      if (category.name && category.name !== existingData.name) {
        const { data: nameCheck, error: nameError } = await supabase
          .from(this.tableName)
          .select('id')
          .eq('name', category.name.trim())
          .neq('id', id) // Exclude current category
          .limit(1);
        
        if (nameError) {
          console.error('Error checking for duplicate category name:', nameError);
          throw new Error(nameError.message);
        }
        
        if (nameCheck && nameCheck.length > 0) {
          throw new Error(`A category with name '${category.name}' already exists`);
        }
        
        // Update slug if name changed
        category.slug = this.generateSlug(category.name);
      }
      
      // Only use the fields that definitely exist in the database schema
      // Based on the errors, we know only certain fields exist
      const updateData = {
        name: category.name.trim(),
        description: category.description || '',
        status: category.status || 'active',
        parent_id: category.parent_id || null
      };
      
      console.log('Updating category with data:', updateData);
      
      // Update the category
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Supabase error updating category:', error);
        throw new Error(error.message);
      }
      
      if (!data || data.length === 0) {
        throw new Error('No data returned after update');
      }
      
      console.log('Category updated successfully:', data[0]);
      return data[0];
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }
  
  /**
   * Delete a category
   * @param {string} id - Category ID 
   * @returns {Promise<void>}
   */
  async deleteCategory(id) {
    try {
      console.log('Deleting category ID:', id);
      
      // Check if category exists
      const { data: existingData, error: checkError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (checkError) {
        console.error('Error checking for existing category:', checkError);
        throw new Error(`Category with ID ${id} not found`);
      }
      
      if (!existingData) {
        throw new Error(`Category with ID ${id} not found`);
      }
      
      // Note: We're skipping parent_id checks since that column doesn't exist
      // We would typically check for child categories here in a hierarchical setup
      
      // TODO: Check if category is used in listings or other entities
      
      // Delete the category
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Supabase error deleting category:', error);
        throw new Error(error.message);
      }
      
      console.log('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
  
  /**
   * Helper to generate a URL-friendly slug from a string
   * @private
   * @param {string} name - The string to slugify
   * @returns {string} - Slugified string
   * @deprecated Not used as the slug column doesn't exist in the database
   */
  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  /**
   * Get active categories for dropdown lists
   * @returns {Promise<Array>} Array of active categories
   */
  async getActiveCategories() {
    try {
      console.log('Fetching active categories');
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Supabase error fetching active categories:', error);
        throw new Error(error.message);
      }
      
      console.log(`Successfully fetched ${data?.length || 0} active categories`);
      return data || [];
    } catch (error) {
      console.error('Error fetching active categories:', error);
      throw error;
    }
  }

  /**
   * Get parent categories for dropdown lists
   * @returns {Promise<Array>} Array of parent categories
   */
  async getParentCategories() {
    try {
      console.log('Fetching parent categories');
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('status', 'active')
        .is('parent_id', null)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Supabase error fetching parent categories:', error);
        throw new Error(error.message);
      }
      
      console.log(`Successfully fetched ${data?.length || 0} parent categories`);
      return data || [];
    } catch (error) {
      console.error('Error fetching parent categories:', error);
      throw error;
    }
  }

  /**
   * Get subcategories for a specific parent
   * @param {string} parentId - Parent category ID
   * @returns {Promise<Array>} Array of subcategories
   */
  async getSubcategories(parentId) {
    try {
      console.log(`Fetching subcategories for parent ID: ${parentId}`);
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('parent_id', parentId)
        .eq('status', 'active')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Supabase error fetching subcategories:', error);
        throw new Error(error.message);
      }
      
      console.log(`Successfully fetched ${data?.length || 0} subcategories`);
      return data || [];
    } catch (error) {
      console.error(`Error fetching subcategories for parent ID: ${parentId}`, error);
      throw error;
    }
  }
  
  /**
   * Get hierarchical category tree
   * @returns {Promise<Array>} Array of categories with their children
   */
  async getCategoryTree() {
    try {
      console.log('Fetching category tree');
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Supabase error fetching category tree:', error);
        throw new Error(error.message);
      }
      
      // Build tree structure
      const categoryMap = {};
      const rootCategories = [];
      
      // Create map of categories
      data.forEach(category => {
        categoryMap[category.id] = { ...category, children: [] };
      });
      
      // Populate children
      data.forEach(category => {
        if (category.parent_id && categoryMap[category.parent_id]) {
          categoryMap[category.parent_id].children.push(categoryMap[category.id]);
        } else {
          rootCategories.push(categoryMap[category.id]);
        }
      });
      
      console.log(`Successfully built category tree with ${rootCategories.length} root categories`);
      return rootCategories;
    } catch (error) {
      console.error('Error fetching category tree:', error);
      throw error;
    }
  }
}

export default new CategoryService();
