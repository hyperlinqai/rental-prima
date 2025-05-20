import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import userService from '../../services/userService';
import roleService from '../../services/roleService';
import supabase from '../../utils/supabaseClient';
import { 
  RiUserAddLine, 
  RiEdit2Line, 
  RiDeleteBinLine, 
  RiSearchLine,
  RiFilterLine,
  RiCloseLine
} from 'react-icons/ri';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    status: 'active',
    user_type: 'vendor', // Default user type for portal users
    role_id: '' // Will be populated with the appropriate role ID
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Define fetchUsers and fetchRoles functions outside useEffect
  const fetchUsers = async () => {
    try {
      // Use the Supabase service to fetch users
      const filters = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      const userData = await userService.getUsers(filters);
      console.log('Fetched users:', userData);
      
      // No need for mapping anymore
      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRoles = async () => {
    try {
      // Directly fetch all roles from Supabase without filtering
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      console.log('Fetched roles:', data);
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to fetch roles');
    } finally {
      setRolesLoading(false);
    }
  };
  
  // Fetch users and roles on component mount
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [searchTerm, statusFilter]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If user_type changes, try to find a matching role
    if (name === 'user_type' && roles.length > 0) {
      // Look for a matching role with the same name as the user type
      const matchingRole = roles.find(role => role.name.toLowerCase() === value.toLowerCase());
      
      setFormData({
        ...formData,
        [name]: value,
        // If we find a matching role, update the role_id as well
        ...(matchingRole && { role_id: matchingRole.id })
      });
      
      console.log(`Changed user_type to ${value}, matching role:`, matchingRole);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Open modal for adding a new user
  const openAddModal = () => {
    setModalMode('add');
    // Find the default customer role ID
    const customerRole = roles.find(role => role.name === 'customer');
    
    setFormData({
      name: '',
      email: '',
      password: '',
      status: 'active',
      user_type: 'vendor', // Default user type for portal users
      role_id: customerRole ? customerRole.id : ''
    });
    setShowModal(true);
  };

  // Open modal for editing a user
  const openEditModal = (user) => {
    console.log('Opening edit modal for user:', user);
    setModalMode('edit');
    setCurrentUser(user);
    
    // Make sure we have the latest roles data
    fetchRoles().then(() => {
      // Set form data from user object
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Don't populate password for security
        status: user.status || 'active',
        user_type: user.user_type || 'vendor',
        role_id: user.role_id || ''
      });
      
      console.log('Set form data for editing:', {
        name: user.name,
        email: user.email,
        status: user.status || 'active',
        user_type: user.user_type || 'vendor',
        role_id: user.role_id || ''
      });
      
      setShowModal(true);
    });
  };

  // Direct method to update user role
  const updateUserRole = async (userId, roleId) => {
    try {
      console.log(`Directly updating user ${userId} with role ${roleId}`);
      
      // Make a direct API call to the backend
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role_id: roleId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user role');
      }
      
      const result = await response.json();
      console.log('Role update result:', result);
      return result.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  // No need for mapping functions anymore since database accepts 'vendor' and 'customer' directly
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalMode === 'add') {
        // Create a new user using Supabase
        const userData = {
          name: formData.name,
          email: formData.email,
          status: formData.status,
          user_type: formData.user_type,
          role_id: formData.role_id,
          // In a real app, you'd handle password separately with proper hashing
          password: formData.password
        };
        
        console.log('Creating new user with data:', userData);
        const newUser = await userService.create(userData);
        
        setUsers([newUser, ...users]);
        toast.success('User added successfully');
      } else if (modalMode === 'edit' && currentUser) {
        // First update basic user info
        const userData = {
          name: formData.name,
          email: formData.email,
          status: formData.status,
          user_type: formData.user_type
        };
        
        console.log('Updating user with ID:', currentUser.id);
        console.log('Update data:', userData);
        
        // Update basic user info
        await supabase
          .from('users')
          .update(userData)
          .eq('id', currentUser.id);
        
        // Then update role separately if it has changed
        if (formData.role_id !== currentUser.role_id) {
          console.log(`Updating role from ${currentUser.role_id} to ${formData.role_id}`);
          
          // Direct update of role_id in the database
          await supabase
            .from('users')
            .update({ role_id: formData.role_id })
            .eq('id', currentUser.id);
        }
        
        // Refresh the user list to show the updated data
        await fetchUsers();
        toast.success('User updated successfully');
        
        console.log('Updated user with type:', formData.user_type);
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error submitting user form:', error);
      toast.error(error.message || 'Operation failed. Please try again.');
    }
  };

  // Handle user deletion
  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Delete user using Supabase
        await userService.delete(userId);
        setUsers(users.filter(user => user.id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(error.message || 'Failed to delete user. Please try again.');
      }
    }
  };

  // Filter users based on search term and status filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button 
          className="btn-primary flex items-center" 
          onClick={openAddModal}
        >
          <RiUserAddLine className="mr-2" />
          Add New User
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sm:w-64">
          <div className="relative">
            <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="input pl-10 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found matching your criteria
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={`https://ui-avatars.com/api/?name=${user.first_name}&background=0D8ABC&color=fff`}
                            alt={user.first_name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.first_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.status === 'active' ? 'bg-green-100 text-green-800' : 
                          user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <RiEdit2Line className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <RiDeleteBinLine className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {modalMode === 'add' ? 'Add New User' : 'Edit User'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <RiCloseLine className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                  {/* Phone field removed as it doesn't exist in the database schema */}
                  {modalMode === 'add' && (
                    <div className="mb-4">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="input"
                        required={modalMode === 'add'}
                        minLength={6}
                      />
                    </div>
                  )}
                  <div className="mb-4">
                    <label htmlFor="user_type" className="block text-sm font-medium text-gray-700 mb-1">
                      User Type
                    </label>
                    <select
                      id="user_type"
                      name="user_type"
                      value={formData.user_type}
                      onChange={handleChange}
                      className="input"
                    >
                      {/* Portal user types */}
                      <option value="vendor">Vendor</option>
                      <option value="customer">Customer</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Select the appropriate user type for portal access</p>
                  </div>
                  
                  {/* Only show Role field for Admin user types */}
                  {(formData.user_type === 'admin' || formData.user_type === 'super_admin') && (
                    <div className="mb-4">
                      <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        id="role_id"
                        name="role_id"
                        value={formData.role_id}
                        onChange={handleChange}
                        className="input"
                        disabled={rolesLoading}
                        required
                      >
                        <option value="">Select a role</option>
                        {roles.map(role => (
                          <option key={role.id} value={role.id}>
                            {role.name} {role.description ? `- ${role.description}` : ''}
                          </option>
                        ))}
                      </select>
                      {!formData.role_id && (
                        <p className="mt-1 text-xs text-red-500">Please select a role for this admin user</p>
                      )}
                    </div>
                  )}
                  <div className="mb-4">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {modalMode === 'add' ? 'Add User' : 'Update User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
