import React, { useEffect, useState, useCallback } from 'react';
import { 
  Trash2, EyeOff, Eye, TrendingUp, MapPin, Clock, 
  AlertCircle, Loader, PlusCircle, Search, ChevronLeft, 
  ChevronRight, Filter, Download, RefreshCw 
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from '../../../apis/apiClient/apiClient';
import { format, parseISO, differenceInHours, isAfter, isBefore } from 'date-fns';
import { Link } from 'react-router-dom';

// Constants for better maintainability
const SURGE_TYPES = {
  FIXED: 'Fixed',
  DYNAMIC: 'Dynamic'
};

const STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
};

const REASON_ICONS = {
  'High Demand': <TrendingUp className="w-4 h-4" />,
  'Flight Schedule': <Clock className="w-4 h-4" />,
  'Sports Event': <AlertCircle className="w-4 h-4" />,
  'default': <MapPin className="w-4 h-4" />
};

const deleteSurgeArea = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/surge-areas/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting surge area:", error);
    throw error;
  }
};

const toggleSurgeAreaStatus = async (id) => {
  try {
    const response = await apiClient.patch(`/admin/surge-areas/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error("Error toggling surge area status:", error);
    throw error;
  }
};

const SurgeAreaList = () => {
  const [surgeAreas, setSurgeAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10
  });

  const fetchSurgeAreas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction
      };

      const response = await apiClient.get('/admin/surge-list', { params });
      const { data, pagination: paginationData } = response.data;

      if (data && data.length > 0) {
        setSurgeAreas(data);
        setPagination(paginationData);
      } else {
        setError('No surge areas found');
        setSurgeAreas([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Server error while fetching surge areas');
      toast.error(err.response?.data?.message || 'Server error while fetching surge areas');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, searchTerm, statusFilter, typeFilter, sortConfig]);

  useEffect(() => {
    fetchSurgeAreas();
  }, [fetchSurgeAreas]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this surge area? This action cannot be undone.')) return;
    
    setActionLoading(prev => ({ ...prev, [`delete-${id}`]: true }));
    try {
      const { data, message } = await deleteSurgeArea(id);
      if (data) {
        setSurgeAreas(prev => prev.filter(item => item._id !== id));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        toast.success(message || 'Surge area deleted successfully');
      } else {
        toast.error(message || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete surge area');
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${id}`]: false }));
    }
  };

  const handleToggleStatus = async (id) => {
    setActionLoading(prev => ({ ...prev, [`toggle-${id}`]: true }));
    try {
      const { data, message } = await toggleSurgeAreaStatus(id);
      if (data) {
        setSurgeAreas(prev => 
          prev.map(item => 
            item._id === id ? { ...item, isActive: data.isActive } : item
          )
        );
        toast.success(message || `Surge area ${data.isActive ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(message || 'Failed to toggle status');
      }
    } catch (err) {
      console.error('Toggle error:', err);
      toast.error(err.response?.data?.message || 'Failed to toggle surge area status');
    } finally {
      setActionLoading(prev => ({ ...prev, [`toggle-${id}`]: false }));
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleRefresh = () => {
    fetchSurgeAreas();
  };

  const getSurgeTypeColor = (type) => {
    switch (type) {
      case SURGE_TYPES.FIXED: return 'bg-blue-100 text-blue-800';
      case SURGE_TYPES.DYNAMIC: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getSurgeReasonIcon = (reason) => {
    return REASON_ICONS[reason] || REASON_ICONS.default;
  };

  const getCurrentStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (isBefore(now, start)) return 'Scheduled';
    if (isAfter(now, end)) return 'Expired';
    return 'Active Now';
  };

  const formatDateRange = (startTime, endTime) => {
    if (!startTime || !endTime) return 'Not specified';
    
    const startDate = parseISO(startTime);
    const endDate = parseISO(endTime);
    
    const isSameDay = startDate.toDateString() === endDate.toDateString();
    const durationHours = differenceInHours(endDate, startDate);
    
    if (isSameDay) {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{format(startDate, 'MMM d, yyyy')}</span>
          <span className="text-gray-500 text-sm">
            {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
            {durationHours > 0 && ` (${durationHours} ${durationHours === 1 ? 'hour' : 'hours'})`}
          </span>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col">
        <span className="font-medium">
          {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
        </span>
        <span className="text-gray-500 text-sm">
          {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
        </span>
      </div>
    );
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading surge areas</h3>
      <p className="mt-1 text-sm text-gray-500">{error}</p>
      <div className="mt-6">
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </button>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
        <MapPin className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="mt-2 text-lg font-medium text-gray-900">No surge areas found</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by creating your first surge area.</p>
      <div className="mt-6">
        <Link
          to="/admin/dashboard/admin-surge"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Surge Area
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Surge Areas</h1>
              </div>
              <p className="text-gray-600">Manage and monitor surge pricing areas across your service regions</p>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/admin/dashboard/admin-surge"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Areas</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Areas</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {surgeAreas.filter(a => a.isActive).length}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Areas</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-500">
                  {surgeAreas.filter(a => !a.isActive).length}
                </p>
              </div>
              <div className="bg-gray-100 p-2 rounded-lg">
                <EyeOff className="w-5 h-5 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Now</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  {surgeAreas.filter(a => {
                    if (!a.isActive) return false;
                    const now = new Date();
                    const start = new Date(a.startTime);
                    const end = new Date(a.endTime);
                    return now >= start && now <= end;
                  }).length}
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchSurgeAreas()}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div>
                <label htmlFor="status-filter" className="sr-only">Status</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label htmlFor="type-filter" className="sr-only">Type</label>
                <select
                  id="type-filter"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Types</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Dynamic">Dynamic</option>
                </select>
              </div>

              <button
                onClick={fetchSurgeAreas}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Filter className="mr-2 h-4 w-4" />
                Apply
              </button>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setSortConfig({ key: 'createdAt', direction: 'desc' });
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            renderLoadingSkeleton()
          ) : error ? (
            renderErrorState()
          ) : surgeAreas.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Area
                          {sortConfig.key === 'name' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('surgeType')}
                      >
                        <div className="flex items-center">
                          Type
                          {sortConfig.key === 'surgeType' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('surgeValue')}
                      >
                        <div className="flex items-center">
                          Value
                          {sortConfig.key === 'surgeValue' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coverage
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('startTime')}
                      >
                        <div className="flex items-center">
                          Schedule
                          {sortConfig.key === 'startTime' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {surgeAreas.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getSurgeReasonIcon(item.surgeReason)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.surgeReason}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSurgeTypeColor(item.surgeType)}`}>
                            {item.surgeType}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-semibold text-gray-900">
                            {item.surgeValue}{item.surgeType === 'Fixed' ? 'x' : '%'}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {item.type === 'Polygon' ? 'Custom Polygon' : `Circle (${item.radius} km)`}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDateRange(item.startTime, item.endTime)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.isActive)}`}>
                              {item.isActive ? STATUS.ACTIVE : STATUS.INACTIVE}
                            </span>
                            {item.isActive && (
                              <span className="text-xs font-medium text-gray-500">
                                {getCurrentStatus(item.startTime, item.endTime)}
                              </span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                           
                            
                           <button
  onClick={() => handleToggleStatus(item._id)}
  disabled={actionLoading[`toggle-${item._id}`]}
  className={`relative inline-flex items-center h-8 rounded-full w-14 transition-colors duration-200 ease-in-out focus:outline-none ${
    item.isActive
      ? 'bg-green-500'
      : 'bg-gray-200'
  } ${actionLoading[`toggle-${item._id}`] ? 'opacity-50 cursor-not-allowed' : ''}`}
  aria-label={item.isActive ? 'Deactivate' : 'Activate'}
>
  {/* Toggle knob */}
  <span
    className={`absolute left-0 inline-flex items-center justify-center w-6 h-6 transition-all duration-200 ease-in-out transform rounded-full shadow-sm ${
      item.isActive
        ? 'translate-x-7 bg-white'
        : 'translate-x-1 bg-white'
    }`}
  >
    {actionLoading[`toggle-${item._id}`] ? (
      <Loader className="w-4 h-4 animate-spin" />
    ) : (
      item.isActive ? (
        <Eye className="w-4 h-4 text-green-500" />
      ) : (
        <EyeOff className="w-4 h-4 text-gray-400" />
      )
    )}
  </span>
  
  {/* Optional labels - you can remove these if you prefer just the knob */}
  <span className={`absolute left-1 text-xs font-medium ${
    item.isActive ? 'text-white' : 'text-gray-500'
  }`}>
    {item.isActive ? 'ON' : ''}
  </span>
  <span className={`absolute right-1 text-xs font-medium ${
    !item.isActive ? 'text-gray-500' : 'text-white'
  }`}>
    {!item.isActive ? 'OFF' : ''}
  </span>
</button>
                            
                            <button
                              onClick={() => handleDelete(item._id)}
                              disabled={actionLoading[`delete-${item._id}`]}
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors ${
                                actionLoading[`delete-${item._id}`] ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              aria-label="Delete"
                            >
                              {actionLoading[`delete-${item._id}`] ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
                      disabled={pagination.currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.total)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={pagination.currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <span className="sr-only">First</span>
                          <ChevronLeft className="h-5 w-5" />
                          <ChevronLeft className="h-5 w-5 -ml-2" />
                        </button>
                        <button
                          onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
                          disabled={pagination.currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.currentPage >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = pagination.currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pagination.currentPage === pageNum
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                          disabled={pagination.currentPage === pagination.totalPages}
                          className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handlePageChange(pagination.totalPages)}
                          disabled={pagination.currentPage === pagination.totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <span className="sr-only">Last</span>
                          <ChevronRight className="h-5 w-5" />
                          <ChevronRight className="h-5 w-5 -ml-2" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurgeAreaList;