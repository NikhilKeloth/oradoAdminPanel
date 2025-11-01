import React, { useState, useEffect } from 'react';
import { Eye, Phone, Mail, Wallet, Star, X, Shield, UserCheck, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../apis/apiClient/apiClient';

const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });

  // API client function to fetch customers with search and pagination
 const fetchCustomers = async (page = 1, limit = 20, search = '') => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/customer-list', {
        params: {
          page,
          limit,
          search
        }
      });
      
      if (response.data.success) {
        const transformedUsers = response.data.data.customers.map(customer => ({
          _id: customer.userId,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          userType: 'customer',
          profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=random`,
          walletBalance: customer.walletBalance,
          loyaltyPoints: customer.loyaltyPoints,
          totalSpending: 0,
          active: true,
          verification: {
            emailVerified: true,
            phoneVerified: true
          },
          addresses: [],
          lastActivity: new Date(customer.createdAt),
          createdAt: new Date(customer.createdAt)
        }));
        
        setUsers(transformedUsers);
        setPagination(response.data.data.pagination);
      } else {
        throw new Error(response.data.message || 'Failed to fetch customers');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCustomers(pagination.page, pagination.limit, searchQuery);
  }, [pagination.page, pagination.limit, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to page 1 when searching
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCustomers(1, pagination.limit, searchQuery);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const getUserTypeColor = (userType) => {
    const colors = {
      customer: 'bg-blue-100 text-blue-800',
      merchant: 'bg-green-100 text-green-800',
      agent: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800'
    };
    return colors[userType] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-orange-500 text-xl">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-orange-500 text-white p-6">
        <h1 className="text-3xl font-bold">User Management Dashboard</h1>
        <p className="text-orange-100 mt-2">Manage and monitor all platform users</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="p-6">
        <div className="bg-white border border-orange-200 rounded-lg p-4 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-orange-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-orange-600">{pagination.total}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <UserCheck className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-orange-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-orange-600">{users.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-orange-200 rounded-lg p-4 shadow-sm">
          <div>
            <p className="text-sm text-gray-600">Page</p>
            <p className="text-lg font-bold text-orange-600">
              {pagination.page} of {pagination.totalPages}
            </p>
          </div>
        </div>

        <div className="bg-white border border-orange-200 rounded-lg p-4 shadow-sm">
          <div>
            <p className="text-sm text-gray-600">Showing</p>
            <p className="text-lg font-bold text-orange-600">
              {users.length} of {pagination.total} users
            </p>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-lg shadow-sm border border-orange-200 overflow-hidden">
          <div className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Customers</h2>
            <div className="flex items-center space-x-2">
              <select
                className="bg-orange-600 border border-orange-300 text-white text-sm rounded-md px-2 py-1"
                value={pagination.limit}
                onChange={(e) => setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Wallet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Loyalty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-orange-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-orange-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link 
                        to={`/admin/dashboard/customer/${user._id}/details`}
                        className="hover:underline"
                      >
                        {user._id.substring(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={user.profilePicture} 
                          alt={user.name}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUserTypeColor(user.userType)}`}>
                              {user.userType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(user.walletBalance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.loyaltyPoints}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal(user)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-orange-50 px-6 py-4 flex items-center justify-between border-t border-orange-200">
            <div className="flex-1 flex justify-between items-center">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  pagination.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
                Previous
              </button>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.page === pageNum
                              ? 'z-10 bg-orange-500 border-orange-500 text-white'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  pagination.page === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bgOp flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">User Details</h3>
              <button
                onClick={closeModal}
                className="hover:bg-orange-600 p-2 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Profile Section */}
              <div className="flex items-center mb-6">
                <img 
                  className="h-20 w-20 rounded-full object-cover" 
                  src={selectedUser.profilePicture} 
                  alt={selectedUser.name}
                />
                <div className="ml-6">
                  <h4 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h4>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getUserTypeColor(selectedUser.userType)} mt-2`}>
                    {selectedUser.userType}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg">
                {/* Contact Information */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h5 className="font-semibold text-orange-800 mb-3">Contact Information</h5>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-orange-600 mr-3" />
                      <span className="text-sm">{selectedUser.email}</span>
                      {selectedUser.verification.emailVerified && 
                        <span className="ml-2 text-green-600 text-xs">✓ Verified</span>
                      }
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-orange-600 mr-3" />
                      <span className="text-sm">{selectedUser.phone}</span>
                      {selectedUser.verification.phoneVerified && 
                        <span className="ml-2 text-green-600 text-xs">✓ Verified</span>
                      }
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h5 className="font-semibold text-orange-800 mb-3">Financial Information</h5>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Wallet className="w-4 h-4 text-orange-600 mr-3" />
                      <span className="text-sm">Wallet: {formatCurrency(selectedUser.walletBalance)}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-orange-600 mr-3" />
                      <span className="text-sm">Loyalty Points: {selectedUser.loyaltyPoints.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h5 className="font-semibold text-orange-800 mb-3">Account Information</h5>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs bg-green-100 text-green-800`}>
                        Active
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Joined:</span> {formatDate(selectedUser.createdAt)}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Last Activity:</span> {formatDate(selectedUser.lastActivity)}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">User ID:</span> {selectedUser._id}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;