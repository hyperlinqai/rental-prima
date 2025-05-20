import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  RiUserAddLine, 
  RiEdit2Line, 
  RiDeleteBinLine, 
  RiSearchLine,
  RiFilterLine,
  RiCloseLine,
  RiShieldUserLine
} from 'react-icons/ri';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: 'active'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch admins on component mount
  useEffect(() => {
    // In a real application, this would fetch from the API
    // For demo purposes, we'll use mock data
    const mockAdmins = [
      {
        _id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '+1 234 567 8901',
        status: 'active',
        permissions: ['users', 'listings', 'categories'],
        lastLogin: '2023-05-15T10:30:00Z',
        createdAt: '2023-01-15T10:30:00Z'
      },
      {
        _id: '2',
        name: 'Support Admin',
        email: 'support@example.com',
        phone: '+1 234 567 8902',
        status: 'active',
        permissions: ['users', 'support'],
        lastLogin: '2023-05-14T14:45:00Z',
        createdAt: '2023-02-20T14:45:00Z'
      },
      {
        _id: '3',
        name: 'Content Manager',
        email: 'content@example.com',
        phone: '+1 234 567 8903',
        status: 'inactive',
        permissions: ['categories', 'listings'],
        lastLogin: '2023-05-10T09:15:00Z',
        createdAt: '2023-03-10T09:15:00Z'
      }
    ];

    setTimeout(() => {
      setAdmins(mockAdmins);
      setLoading(false);
    }, 1000);

    // In a real application, you would use:
    // const fetchAdmins = async () => {
    //   try {
    //     const res = await axios.get('/api/admins');
    //     setAdmins(res.data.data);
    //   } catch (error) {
    //     toast.error('Failed to fetch admins');
    //     console.error(error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchAdmins();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Open modal for adding a new admin
  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      status: 'active',
      permissions: []
    });
    setShowModal(true);
  };

  // Open modal for editing an admin
  const openEditModal = (admin) => {
    setModalMode('edit');
    setCurrentAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      password: '', // Don't populate password for security
      status: admin.status,
      permissions: admin.permissions
    });
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // In a real application, this would send to the API
    // For demo purposes, we'll simulate API calls
    
    if (modalMode === 'add') {
      // Simulate adding a new admin
      const newAdmin = {
        _id: Date.now().toString(),
        ...formData,
        lastLogin: null,
        createdAt: new Date().toISOString()
      };
      
      setAdmins([newAdmin, ...admins]);
      toast.success('Admin added successfully');
      
      // In a real application, you would use:
      // try {
      //   const res = await axios.post('/api/admins', formData);
      //   setAdmins([res.data.data, ...admins]);
      //   toast.success('Admin added successfully');
      // } catch (error) {
      //   toast.error(error.response?.data?.message || 'Failed to add admin');
      // }
    } else {
      // Simulate updating an admin
      const updatedAdmins = admins.map(admin => 
        admin._id === currentAdmin._id 
          ? { ...admin, ...formData } 
          : admin
      );
      
      setAdmins(updatedAdmins);
      toast.success('Admin updated successfully');
      
      // In a real application, you would use:
      // try {
      //   const res = await axios.put(`/api/admins/${currentAdmin._id}`, formData);
      //   const updatedAdmins = admins.map(admin => 
      //     admin._id === currentAdmin._id 
      //       ? res.data.data 
      //       : admin
      //   );
      //   setAdmins(updatedAdmins);
      //   toast.success('Admin updated successfully');
      // } catch (error) {
      //   toast.error(error.response?.data?.message || 'Failed to update admin');
      // }
    }
    
    setShowModal(false);
  };

  // Handle admin deletion
  const handleDelete = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      // Simulate deleting an admin
      const updatedAdmins = admins.filter(admin => admin._id !== adminId);
      setAdmins(updatedAdmins);
      toast.success('Admin deleted successfully');
      
      // In a real application, you would use:
      // try {
      //   await axios.delete(`/api/admins/${adminId}`);
      //   const updatedAdmins = admins.filter(admin => admin._id !== adminId);
      //   setAdmins(updatedAdmins);
      //   toast.success('Admin deleted successfully');
      // } catch (error) {
      //   toast.error(error.response?.data?.message || 'Failed to delete admin');
      // }
    }
  };

  // Filter admins based on search term and status filter
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = 
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>
        <button 
          className="btn-primary flex items-center" 
          onClick={openAddModal}
        >
          <RiUserAddLine className="mr-2" />
          Add New Admin
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search admins..."
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
            </select>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No admins found matching your criteria
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                            <RiShieldUserLine className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                          <div className="text-sm text-gray-500">Since {formatDate(admin.createdAt).split(',')[0]}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{admin.email}</div>
                      <div className="text-sm text-gray-500">{admin.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {admin.permissions.map((permission, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${admin.status === 'active' ? 'bg-green-100 text-green-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(admin.lastLogin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(admin)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <RiEdit2Line className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(admin._id)}
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

      {/* Add/Edit Admin Modal */}
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
                    {modalMode === 'add' ? 'Add New Admin' : 'Edit Admin'}
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
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
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
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Permissions
                    </label>
                    <div className="space-y-2">
                      {['users', 'listings', 'categories', 'payments', 'support'].map((permission) => (
                        <div key={permission} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`permission-${permission}`}
                            name={`permission-${permission}`}
                            checked={formData.permissions?.includes(permission)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  permissions: [...(formData.permissions || []), permission]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  permissions: (formData.permissions || []).filter(p => p !== permission)
                                });
                              }
                            }}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`permission-${permission}`} className="ml-2 block text-sm text-gray-700 capitalize">
                            {permission}
                          </label>
                        </div>
                      ))}
                    </div>
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
                      {modalMode === 'add' ? 'Add Admin' : 'Update Admin'}
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

export default AdminManagement;
