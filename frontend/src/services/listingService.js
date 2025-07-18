import BaseService from './baseService';
import supabase from '../utils/supabaseClient';

class ListingService extends BaseService {
  constructor() {
    super('listings');
  }

  /**
   * Get listings with advanced filters
   * @param {Object} filters - Filter options
   * @param {string} filters.status - Filter by status
   * @param {string} filters.category - Filter by category ID
   * @param {string} filters.subcategory - Filter by subcategory ID
   * @param {boolean} filters.featured - Filter by featured status
   * @param {string} filters.search - Search in title, description, or location
   * @param {string} filters.orderBy - Field to order by
   * @param {string} filters.orderDirection - Order direction (asc/desc)
   * @param {number} filters.limit - Limit number of results
   * @param {number} filters.offset - Offset for pagination
   * @returns {Promise<Array>} Array of listings
   */
  async getListings(filters = {}) {
    try {
      console.log('Fetching listings with filters:', filters);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Add all filters to query params
      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      
      if (filters.category && filters.category !== 'all') {
        queryParams.append('category', filters.category);
      }
      
      if (filters.subcategory && filters.subcategory !== 'all') {
        queryParams.append('subcategory', filters.subcategory);
      }
      
      if (filters.is_featured === true) {
        queryParams.append('featured', 'true');
      }
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      
      if (filters.minPrice) {
        queryParams.append('minPrice', filters.minPrice);
      }
      
      if (filters.maxPrice) {
        queryParams.append('maxPrice', filters.maxPrice);
      }
      
      // Pagination
      if (filters.limit) {
        queryParams.append('limit', filters.limit);
      }
      
      if (filters.offset) {
        queryParams.append('offset', filters.offset);
      }
      
      // Ordering
      if (filters.orderBy) {
        queryParams.append('orderBy', filters.orderBy);
      }
      
      if (filters.orderDirection) {
        queryParams.append('orderDirection', filters.orderDirection);
      }
      
      // Use the API endpoint instead of direct Supabase access
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const fullUrl = `${apiUrl}/api/listings?${queryParams.toString()}`;
      console.log('Fetching listings from URL:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error fetching listings:', errorData);
        return [];
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      return data.data || data || [];
    } catch (error) {
      console.error('Error fetching listings with filters:', error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  }

  /**
   * Get a single listing by ID with full details
   * @param {string} id - Listing ID
   * @returns {Promise<Object>} Listing object with related data
   */
  async getListing(id) {
    try {
      console.log('Fetching listing details for ID:', id);
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const fullUrl = `${apiUrl}/api/listings/${id}`;
      console.log('Fetching listing from URL:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch listing ${id}`);
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      return data.data || data;
    } catch (error) {
      console.error('Error getting listing by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new listing
   * @param {Object} listing - Listing data
   * @returns {Promise<Object>} Created listing
   */
  async createListing(listing) {
    try {
      console.log('Creating new listing with data:', listing);
      
      // Validate required fields
      if (!listing.title) throw new Error('Listing title is required');
      if (!listing.price) throw new Error('Listing price is required');
      if (!listing.category_id) throw new Error('Category is required');
      if (!listing.user_id) throw new Error('User ID is required');
      
      // Ensure price is a number
      const price = parseFloat(listing.price);
      if (isNaN(price)) throw new Error('Price must be a valid number');
      
      // Prepare the listing data
      const listingData = {
        ...listing,
        price,
        status: listing.status || 'active',
        is_featured: listing.is_featured || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Use the API endpoint instead of direct Supabase access
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const fullUrl = `${apiUrl}/api/listings`;
      console.log('Creating listing at URL:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(listingData)
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create listing');
      }
      
      const data = await response.json();
      console.log('Listing created successfully:', data);
      return data.data || data;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  }

  /**
   * Update an existing listing
   * @param {string} id - Listing ID 
   * @param {Object} updates - Updated listing data
   * @returns {Promise<Object>} Updated listing
   */
  async updateListing(id, updates) {
    try {
      console.log(`Updating listing ${id} with data:`, updates);
      
      if (!id) throw new Error('Listing ID is required');
      
      // Ensure price is a number if provided
      let updatedData = { ...updates };
      if (updates.price !== undefined) {
        const price = parseFloat(updates.price);
        if (isNaN(price)) throw new Error('Price must be a valid number');
        updatedData.price = price;
      }
      
      // Add updated_at timestamp
      updatedData.updated_at = new Date().toISOString();
      
      // Use the API endpoint instead of direct Supabase access
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const fullUrl = `${apiUrl}/api/listings/${id}`;
      console.log('Updating listing at URL:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedData)
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update listing ${id}`);
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      return data.data || data;
    } catch (error) {
      console.error('Error updating listing:', error);
      throw error;
    }
  }

  /**
   * Delete a listing by ID
   * @param {string} id - Listing ID
   * @returns {Promise<void>}
   */
  async deleteListing(id) {
    try {
      console.log(`Deleting listing with ID ${id}`);
      
      if (!id) {
        throw new Error('Listing ID is required');
      }
      
      // Use the API endpoint instead of direct Supabase access
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const fullUrl = `${apiUrl}/api/listings/${id}`;
      console.log('Deleting listing at URL:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete listing ${id}`);
      }
      
      console.log('Listing deleted successfully');
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw error;
    }
  }
  
  /**
   * Get listings by category (including all subcategories)
   * @param {string} categoryId - Parent category ID
   * @param {Object} options - Additional options like limit, status
   * @returns {Promise<Array>} Array of listings
   */
  async getListingsByCategory(categoryId, options = {}) {
    try {
      console.log(`Fetching listings for category ID ${categoryId} with options:`, options);
      
      const queryParams = new URLSearchParams();
      
      // Add options to query params
      if (options.status && options.status !== 'all') {
        queryParams.append('status', options.status);
      }
      
      if (options.is_featured === true) {
        queryParams.append('featured', 'true');
      }
      
      if (options.limit) {
        queryParams.append('limit', options.limit);
      }
      
      if (options.orderBy) {
        queryParams.append('orderBy', options.orderBy);
      }
      
      if (options.orderDirection) {
        queryParams.append('orderDirection', options.orderDirection);
      }
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const fullUrl = `${apiUrl}/api/listings/category/${categoryId}?${queryParams.toString()}`;
      console.log('Fetching category listings from URL:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error fetching listings by category:', errorData);
        return [];
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      return data.data || data || [];
    } catch (error) {
      console.error('Error getting listings by category:', error);
      return [];
    }
  }
  
  /**
   * Get featured listings
   * @param {number} limit - Maximum number of listings to return
   * @returns {Promise<Array>} Array of featured listings
   */
  async getFeaturedListings(limit = 8) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit);
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const fullUrl = `${apiUrl}/api/listings/featured?${queryParams.toString()}`;
      console.log('Fetching featured listings from URL:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error fetching featured listings:', errorData);
        return [];
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      return data.data || data || [];
    } catch (error) {
      console.error('Error getting featured listings:', error);
      return [];
    }
  }
  
  /**
   * Count listings by category ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<number>} Number of listings
   */
  async countListingsByCategory(categoryId) {
    try {
      const { count, error } = await supabase
        .from(this.tableName)
        .select('id', { count: 'exact' })
        .eq('category_id', categoryId);
      
      if (error) {
        console.error('Error counting listings by category:', error);
        throw error;
      }
      
      return count;
    } catch (error) {
      console.error('Error counting listings by category:', error);
      return 0;
    }
  }
}

export default new ListingService();
