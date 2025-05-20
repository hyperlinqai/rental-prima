import BaseService from './baseService';
import supabase from '../utils/supabaseClient';

class SupportService extends BaseService {
  constructor() {
    super('support_tickets');
  }

  // Get tickets with filters
  async getTickets(filters = {}) {
    try {
      let query = supabase.from(this.tableName).select(`
        *,
        replies:support_replies(*)
      `);
      
      // Apply filters if provided
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      
      if (filters.search) {
        query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching support tickets with filters:', error);
      throw error;
    }
  }
  
  // Add reply to a ticket
  async addReply(ticketId, replyData) {
    try {
      const { data, error } = await supabase
        .from('support_replies')
        .insert([{
          ticket_id: ticketId,
          ...replyData
        }])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error adding reply to ticket:', error);
      throw error;
    }
  }
  
  // Update ticket status
  async updateStatus(ticketId, status, priority = null) {
    try {
      const updates = { status };
      if (priority) updates.priority = priority;
      
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', ticketId)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  }
}

export default new SupportService();
