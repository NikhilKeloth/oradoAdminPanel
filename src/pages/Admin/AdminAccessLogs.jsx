import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Clock, 
  User, 
  Globe, 
  Monitor, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  Loader2,
  Shield,
  Lock,
  RefreshCw,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

const AccessLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedLog, setExpandedLog] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('my-logs');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    totalCount: 0
  });

  useEffect(() => {
    // Check user role from localStorage
    const userType = localStorage.getItem('userRole');
    setIsSuperAdmin(userType === 'superAdmin');
    
    // Fetch logs based on user role
    fetchLogs();
  }, [activeTab, pagination.page]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLogs(logs);
    } else {
      const filtered = logs.filter(log => {
        const adminName = log.userId?.name || log.userId?._id || log.userId || '';
        return adminName.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredLogs(filtered);
    }
  }, [searchQuery, logs]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      setSearchQuery('');
      
      const endpoint = activeTab === 'all-logs' 
        ? `https://orado.work.gd/api/admin/access-logs?page=${pagination.page}&limit=${pagination.limit}`
        : `https://orado.work.gd/api/admin/access-logs/me?page=${pagination.page}&limit=${pagination.limit}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch logs');
      }

      const { data, page, limit, totalPages, totalCount } = await response.json();
      setLogs(data);
      setFilteredLogs(data);
      setPagination(prev => ({
        ...prev,
        page,
        limit,
        totalPages,
        totalCount
      }));
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const getActionColor = (action) => {
    const colors = {
      'LOGIN': 'bg-green-100 text-green-800',
      'LOGOUT': 'bg-gray-100 text-gray-800',
      'USER_CREATE': 'bg-blue-100 text-blue-800',
      'USER_UPDATE': 'bg-indigo-100 text-indigo-800',
      'USER_DELETE': 'bg-red-100 text-red-800',
      'CONFIG_UPDATE': 'bg-orange-100 text-orange-800',
      'DATA_EXPORT': 'bg-purple-100 text-purple-800',
      'PERMISSION_CHANGE': 'bg-yellow-100 text-yellow-800',
      'PASSWORD_CHANGE': 'bg-cyan-100 text-cyan-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getUniqueAdminCount = () => {
    if (activeTab === 'all-logs') {
      return pagination.totalCount ? `~${pagination.totalCount}` : 'N/A';
    }
    const adminIds = new Set(logs.map(log => log.userId?._id || log.userId));
    return adminIds.size;
  };

  const getUniqueIpCount = () => {
    const ips = new Set(logs.map(log => log.ipAddress));
    return ips.size;
  };

  const getTodaysLogCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return logs.filter(log => new Date(log.createdAt) >= today).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading access logs...</p>
        </div>
      </div>
    );
  }

  const toggleExpanded = (logId) => {
    setExpandedLog(prev => (prev === logId ? null : logId));
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-orange-500" />
            Admin Access Logs
          </h1>
          <p className="text-gray-600">Monitor and track administrative activities</p>
        </div>

        {/* Tabs */}
        {isSuperAdmin && (
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'my-logs' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => {
                setActiveTab('my-logs');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              My Activity
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'all-logs' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => {
                setActiveTab('all-logs');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              All Admin Activity
            </button>
          </div>
        )}

        {/* Search Bar for All Admin Activity */}
        {isSuperAdmin && activeTab === 'all-logs' && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Search admins by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium">Error loading logs</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button 
                onClick={fetchLogs}
                className="mt-2 text-sm text-red-500 hover:text-red-700 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards - Horizontal Scroll */}
        <div className="mb-8 overflow-x-auto">
          <div className="inline-flex space-x-4 pb-2" style={{ minWidth: '100%' }}>
            <div className="bg-orange-500 text-white p-4 rounded-lg shadow min-w-[250px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Current Page Logs</p>
                  <p className="text-2xl font-bold">{filteredLogs.length}</p>
                </div>
                <Eye className="w-8 h-8 text-orange-200" />
              </div>
            </div>
            <div className="bg-white border border-orange-200 p-4 rounded-lg shadow-sm min-w-[250px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Admins</p>
                  <p className="text-2xl font-bold text-orange-500">{getUniqueAdminCount()}</p>
                </div>
                <User className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white border border-orange-200 p-4 rounded-lg shadow-sm min-w-[250px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Today's Actions</p>
                  <p className="text-2xl font-bold text-orange-500">{getTodaysLogCount()}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white border border-orange-200 p-4 rounded-lg shadow-sm min-w-[250px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Unique IPs</p>
                  <p className="text-2xl font-bold text-orange-500">{getUniqueIpCount()}</p>
                </div>
                <Globe className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-orange-500 text-white px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              {activeTab === 'all-logs' ? 'All Admin Activity' : 'My Activity'}
              {searchQuery && activeTab === 'all-logs' && (
                <span className="ml-2 text-orange-200 text-sm font-normal">
                  (Filtered: {filteredLogs.length} logs)
                </span>
              )}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-orange-100 text-sm hidden sm:block">
                Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)
              </div>
              <button
                onClick={fetchLogs}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
          
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchQuery ? 'No matching logs found' : 'No access logs found'}
              </h3>
              <p className="text-gray-500">
                {activeTab === 'all-logs' 
                  ? searchQuery 
                    ? 'Try a different search term'
                    : 'No admin activities have been logged yet'
                  : 'Your activities will appear here once logged'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-orange-500 hover:text-orange-700 text-sm flex items-center justify-center mx-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((log) => (
                      <React.Fragment key={log._id}>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-gray-400 mr-2" />
                              {formatDate(log.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <User className="w-4 h-4 text-orange-500 mr-2" />
                              {log.userId?.name || log.userId?._id || log.userId || 'N/A'}
                              {log.userId?.email && (
                                <span className="text-gray-500 ml-2">({log.userId.email})</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                            <div className="line-clamp-2">{log.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <Globe className="w-4 h-4 text-gray-400 mr-2" />
                              {log.ipAddress || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => toggleExpanded(log._id)}
                              className="flex items-center text-orange-500 hover:text-orange-700 transition-colors"
                            >
                              {expandedLog === log._id ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-1" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-1" />
                                  Show
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                        {expandedLog === log._id && (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 bg-gray-50">
                              <div className="space-y-3">
                                <div className="flex items-start">
                                  <Monitor className="w-4 h-4 text-gray-400 mr-2 mt-1" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">User Agent:</p>
                                    <p className="text-sm text-gray-600 break-all font-mono bg-gray-100 p-2 rounded">
                                      {log.userAgent || 'Not available'}
                                    </p>
                                  </div>
                                </div>
                                {log.metadata && Object.keys(log.metadata).length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Metadata:</p>
                                    <div className="bg-white p-3 rounded border">
                                      <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
                                        {JSON.stringify(log.metadata, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${pagination.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${pagination.page === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.totalCount)}</span> of{' '}
                      <span className="font-medium">{pagination.totalCount}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.page === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${pagination.page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        <span className="sr-only">First</span>
                        <ChevronsLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${pagination.page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <div className="flex items-center px-4">
                        <span className="text-sm text-gray-700">
                          Page {pagination.page} of {pagination.totalPages}
                        </span>
                      </div>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${pagination.page === pagination.totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={pagination.page === pagination.totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${pagination.page === pagination.totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        <span className="sr-only">Last</span>
                        <ChevronsRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessLogs;