import React, { useEffect, useState, useRef } from 'react';
import { restaurantTableList, updateRestaurantActiveStatus, duplicateRestaurant, blockRestaurant, unblockRestaurant} from '../../../apis/adminApis/adminFuntionsApi';
import { Link } from 'react-router-dom';

import apiClient from '../../../apis/apiClient/apiClient';
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiCopy,
  FiRefreshCw,
  FiDownload,
  FiExternalLink,
  FiMoreVertical,
  FiEye,
  FiEdit,
  FiCheckCircle,
  FiXCircle,
  FiCopy as FiDuplicate,
  FiMessageSquare,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RestaurantTables = () => {
  const [restaurantList, setRestaurantsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'registeredOn',
    direction: 'desc'
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const [limit] = useState(30);

  // Dropdown state for each restaurant
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  const tableContainerRef = useRef(null);
  const dropdownRefs = useRef({});

  // Status display names
  const statusDisplayNames = {
    OPEN: 'Open',
    CLOSED: 'Closed',
    MAINTENANCE: 'Maintenance'
  };

  // Toggle status
  const toggleRestaurantStatus = async (restaurantId, currentStatus) => {
  const newStatus = !currentStatus;
  
  try {
    // Call the API to update status
    const response = await updateRestaurantActiveStatus(restaurantId, newStatus);
    
    if (response.success) {
      // Update local state
      setRestaurantsList(prev => prev.map(restaurant => {
        if (restaurant.id === restaurantId) {
          return {
            ...restaurant,
            active: newStatus
          };
        }
        return restaurant;
      }));
      
      toast.success(`Restaurant ${newStatus ? 'activated' : 'deactivated'} successfully!`);
    }
  } catch (error) {
    console.error(error);
    toast.error('Failed to update status');
  }
};

  

  // Block restaurant
  const handleBlock = async (restaurantId, restaurantName) => {
    const reason = prompt(`Enter reason for blocking "${restaurantName}":`, "Violation of terms");
    
    if (!reason || reason.trim() === "") {
      toast.info("Block cancelled - reason required");
      return;
    }

    if (!window.confirm(`Are you sure you want to block "${restaurantName}"?\nReason: ${reason}`)) {
      return;
    }

    try {
      const response = await blockRestaurant(restaurantId, reason.trim());
      
      if (response.success) {
        toast.success(`"${restaurantName}" has been blocked`);
        
        // Update local state
        setRestaurantsList(prev => prev.map(restaurant => {
          if (restaurant.id === restaurantId) {
            return {
              ...restaurant,
              isBlocked: true,
              active: false,
              servicable: "CLOSED"
            };
          }
          return restaurant;
        }));
      } else {
        toast.error(response.message || "Failed to block restaurant");
      }
    } catch (error) {
      console.error("Error blocking restaurant:", error);
      toast.error(error.response?.data?.message || "Failed to block restaurant");
    }
  };

  // Add unblock function
  const handleUnblock = async (restaurantId, restaurantName) => {
    const reason = prompt(`Enter reason for unblocking "${restaurantName}" (optional):`, "Issue resolved");
    
    if (!window.confirm(`Are you sure you want to unblock "${restaurantName}"?`)) {
      return;
    }

    try {
      const response = await unblockRestaurant(restaurantId, reason || "");
      
      if (response.success) {
        toast.success(`"${restaurantName}" has been unblocked`);
        
        // Update local state
        setRestaurantsList(prev => prev.map(restaurant => {
          if (restaurant.id === restaurantId) {
            return {
              ...restaurant,
              isBlocked: false,
              active: true,
              servicable: "OPEN"
            };
          }
          return restaurant;
        }));
      } else {
        toast.error(response.message || "Failed to unblock restaurant");
      }
    } catch (error) {
      console.error("Error unblocking restaurant:", error);
      toast.error(error.response?.data?.message || "Failed to unblock restaurant");
    }
  };

  // Verify restaurant
  const handleVerify = (restaurantId, restaurantName) => {
    // API call to verify restaurant
    toast.success(`${restaurantName} has been verified`);
  };

  // Delete restaurant
  const handleDelete = async (restaurantId, restaurantName) => {
    if (!window.confirm(`Are you sure you want to delete "${restaurantName}"? This will mark the restaurant as deleted but keep the data.`)) {
      return;
    }

    const reason = prompt("Enter deletion reason (optional):", "Deleted by admin");
    
    try {
      // Call soft delete API
      const response = await apiClient.patch(`/admin/restaurants/${restaurantId}/soft-delete`, {
        reason: reason || "Deleted by admin"
      });

      if (response.data.success) {
        toast.success(`"${restaurantName}" has been deleted`);
        
        // Remove from local state
        setRestaurantsList(prev => prev.filter(restaurant => restaurant.id !== restaurantId));
      } else {
        toast.error(response.data.message || "Failed to delete restaurant");
      }
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      toast.error(error.response?.data?.message || "Failed to delete restaurant");
    }
  };

  // Duplicate restaurant
  // Duplicate restaurant
  const handleDuplicate = async (restaurantId, restaurantName) => {
    if (!window.confirm(`Duplicate "${restaurantName}"? This will create a copy with all the same settings.`)) {
      return;
    }

    try {
      // 1. Get the original restaurant data
      const originalRestaurant = restaurantList.find(r => r.id === restaurantId);
      if (!originalRestaurant) {
        toast.error("Restaurant not found");
        return;
      }

      // 2. Ask for new name
      const newName = prompt(`Enter new name for "${restaurantName}":`, `${restaurantName} - Copy`);
      
      if (!newName || newName.trim() === "") {
        toast.info("Duplication cancelled");
        return;
      }

      toast.info("Creating duplicate...");

      // 3. Call API to duplicate restaurant
      const response = await apiClient.post(`/admin/restaurants/${restaurantId}/duplicate`, {
        newName: newName.trim()
      });

      if (response.data.success) {
        toast.success(`Restaurant duplicated as "${newName}"`);
        
        // 4. Refresh the list to show the new duplicate
        fetchRestaurantList(currentPage);
      } else {
        toast.error(response.data.message || "Failed to duplicate restaurant");
      }
    } catch (error) {
      console.error("Error duplicating restaurant:", error);
      toast.error(error.response?.data?.message || "Failed to duplicate restaurant");
    }
  };

  // Chat with restaurant
  const handleChat = (restaurantId, restaurantName) => {
    // Open chat window or redirect to chat page
    toast.info(`Opening chat with ${restaurantName}`);
  };

  // Fetch restaurant data
  const fetchRestaurantList = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await restaurantTableList();
      // Simulate pagination on frontend since API might not support it
      const allRestaurants = response.data || [];
      
      // Add active status if not present
      const restaurantsWithStatus = allRestaurants.map(restaurant => ({
        ...restaurant,
        active: restaurant.active !== undefined ? restaurant.active : true
      }));
      
      setTotalRestaurants(restaurantsWithStatus.length);
      setTotalPages(Math.ceil(restaurantsWithStatus.length / limit));
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedRestaurants = restaurantsWithStatus.slice(startIndex, endIndex);
      
      setRestaurantsList(paginatedRestaurants);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantList(currentPage);
  }, [currentPage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && dropdownRefs.current[openDropdownId]) {
        if (!dropdownRefs.current[openDropdownId].contains(event.target)) {
          setOpenDropdownId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  // Handle dropdown toggle
  const toggleDropdown = (restaurantId) => {
    setOpenDropdownId(openDropdownId === restaurantId ? null : restaurantId);
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // Default sort directions for different columns
      if (key === 'registeredOn' || key === 'id') {
        direction = 'desc';
      } else if (key === 'name' || key === 'city') {
        direction = 'asc';
      } else {
        direction = 'asc';
      }
    }
    setSortConfig({ key, direction });
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top when page changes
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Copied to clipboard!');
    });
  };

  // Download CSV function
  const downloadCSV = () => {
    try {
      // Get all restaurants for CSV (not just current page)
      const allRestaurants = [...restaurantList];
      
      if (allRestaurants.length === 0) {
        toast.warning('No data to export');
        return;
      }

      // Define CSV headers
      const headers = [
        'ID',
        'Restaurant Name',
        'Address',
        'Phone',
        'Email',
        'Rating',
        'Status',
        'Active',
        'Stripe Status',
        'City',
        'Registered On'
      ];

      // Convert data to CSV format
      const csvData = allRestaurants.map(restaurant => [
        restaurant.id || '',
        restaurant.name || '',
        restaurant.address || '',
        restaurant.phone || '',
        restaurant.email || '',
        restaurant.rating || '',
        statusDisplayNames[restaurant.servicable] || restaurant.servicable || '',
        restaurant.active ? 'Yes' : 'No',
        restaurant.stripeStatus || '',
        restaurant.city || '',
        formatDateForCSV(restaurant.registeredOn)
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `restaurants_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV downloaded successfully!');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast.error('Failed to download CSV');
    }
  };

  // Format date for CSV
  const formatDateForCSV = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Filter restaurants based on search query
  const filteredRestaurants = restaurantList.filter((restaurant) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      (restaurant.name && restaurant.name.toLowerCase().includes(searchLower)) ||
      (restaurant.email && restaurant.email.toLowerCase().includes(searchLower)) ||
      (restaurant.phone && restaurant.phone.includes(searchQuery)) ||
      (restaurant.city && restaurant.city.toLowerCase().includes(searchLower)) ||
      (restaurant.address && restaurant.address.toLowerCase().includes(searchLower))
    );
  });

  // Sort restaurants
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    switch (sortConfig.key) {
      case 'id':
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
        break;
      case 'registeredOn':
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
        break;
      case 'rating':
        // Handle "NA" ratings
        if (aValue === 'NA' || aValue === 'N/A') aValue = 0;
        if (bValue === 'NA' || bValue === 'N/A') bValue = 0;
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
        break;
      case 'servicable':
        aValue = statusDisplayNames[aValue] || aValue;
        bValue = statusDisplayNames[bValue] || bValue;
        break;
      case 'active':
        // Sort by boolean (true comes first)
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
        break;
      default:
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Get page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Render sort indicator
  const renderSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return (
        <FiChevronDown
          className={`ml-1 transform transition-transform ${
            sortConfig.direction === 'asc' ? 'rotate-180' : ''
          }`}
          size={14}
        />
      );
    }
    return <FiChevronDown className="ml-1 text-gray-300" size={14} />;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Truncate text
  const truncateText = (text, maxLength = 25) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Calculate display range
  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, totalRestaurants);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header Section */}
      <div className="flex-shrink-0 bg-white shadow-sm">
        <div className="p-3 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
          <div className="flex items-center">
            <div className="bg-pink-100 rounded-lg p-1.5 mr-3 text-pink-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 1.5a1.5 1.5 0 0 0-1.5 1.5v1.5H5a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7.5a3 3 0 0 0-3-3h-1.5V3A1.5 1.5 0 0 0 16 1.5H8ZM7 3v1.5h10V3a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5ZM5 6h14a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5V7.5A1.5 1.5 0 0 1 5 6Zm1.5 3a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-11Z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold text-gray-800">Restaurants</h1>
                <a
                  href="https://orado.online/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-pink-600 hover:text-pink-800 text-xs"
                >
                  <span>orado.online</span>
                  <FiExternalLink size={12} />
                </a>
              </div>
              <p className="text-xs text-gray-500">
                Manage and track all restaurant partners
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
            <div className="relative w-full md:w-56">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" size={14} />
              </div>
              <input
                type="text"
                placeholder="Search restaurants..."
                className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex space-x-1">
              <button
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => fetchRestaurantList(currentPage)}
                title="Refresh"
              >
                <FiRefreshCw size={16} />
              </button>
              <button
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={downloadCSV}
                title="Download CSV"
              >
                <FiDownload size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Scrollable Table Area */}
          <div ref={tableContainerRef} className="flex-1 overflow-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-20 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center">
                      ID
                      {renderSortIndicator('id')}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-40 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Restaurant Name
                      {renderSortIndicator('name')}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-48 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('address')}
                  >
                    <div className="flex items-center">
                      Address
                      {renderSortIndicator('address')}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-28 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('phone')}
                  >
                    <div className="flex items-center">
                      Phone
                      {renderSortIndicator('phone')}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-48 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      Email
                      {renderSortIndicator('email')}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-20 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('rating')}
                  >
                    <div className="flex items-center">
                      Rating
                      {renderSortIndicator('rating')}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('servicable')}
                  >
                    <div className="flex items-center">
                      Status
                      {renderSortIndicator('servicable')}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-20 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('active')}
                  >
                    <div className="flex items-center">
                      Active
                      {renderSortIndicator('active')}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-28 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('stripeStatus')}
                  >
                    <div className="flex items-center">
                      Stripe Status
                      {renderSortIndicator('stripeStatus')}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-20 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('city')}
                  >
                    <div className="flex items-center">
                      City
                      {renderSortIndicator('city')}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-36 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('registeredOn')}
                  >
                    <div className="flex items-center">
                      Registered On
                      {renderSortIndicator('registeredOn')}
                    </div>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="12" className="px-4 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : sortedRestaurants.length > 0 ? (
                  sortedRestaurants.map((restaurant) => (
                    <tr key={restaurant.id} className="hover:bg-gray-50">
                      {/* ID */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">
                        <div className="group relative">
                          <Link 
                            to={`/admin/dashboard/merchants/merchant-details/${restaurant.id}`}
                            className="text-pink-600 hover:text-pink-800 hover:underline text-xs font-bold"
                            title={restaurant.id}
                          >
                            {restaurant.id ? restaurant.id.substring(0, 8) : 'N/A'}
                          </Link>
                          <button
                            onClick={() => copyToClipboard(restaurant.id)}
                            className="absolute -right-5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-gray-600"
                            title="Copy ID"
                          >
                            <FiCopy size={10} />
                          </button>
                        </div>
                      </td>
                      
                      {/* Restaurant Name */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-xs">
                        <div className="group relative">
                          <span title={restaurant.name}>
                            {truncateText(restaurant.name, 20)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(restaurant.name)}
                            className="absolute -right-5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-gray-600"
                            title="Copy Name"
                          >
                            <FiCopy size={10} />
                          </button>
                        </div>
                      </td>
                      
                      {/* Address */}
                      <td className="px-2 py-2 text-sm text-gray-500">
                        <div className="group relative">
                          <span className="text-xs block cursor-help" title={restaurant.address}>
                            {truncateText(restaurant.address, 35)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(restaurant.address)}
                            className="absolute -right-5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-gray-600"
                            title="Copy Address"
                          >
                            <FiCopy size={10} />
                          </button>
                        </div>
                      </td>
                      
                      {/* Phone */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700 text-xs">
                        <div className="group relative">
                          <span title={restaurant.phone}>
                            {truncateText(restaurant.phone, 15)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(restaurant.phone)}
                            className="absolute -right-5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-gray-600"
                            title="Copy Phone"
                          >
                            <FiCopy size={10} />
                          </button>
                        </div>
                      </td>
                      
                      {/* Email */}
                      <td className="px-2 py-2 text-sm text-gray-700 text-xs">
                        <div className="group relative">
                          <span className="block cursor-help" title={restaurant.email}>
                            {truncateText(restaurant.email, 25)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(restaurant.email)}
                            className="absolute -right-5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-gray-600"
                            title="Copy Email"
                          >
                            <FiCopy size={10} />
                          </button>
                        </div>
                      </td>
                      
                      {/* Rating */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700 text-xs">
                        {restaurant.rating === 'NA' || restaurant.rating === 'N/A' ? (
                          <span className="text-gray-400">N/A</span>
                        ) : (
                          <span className="font-medium">{restaurant.rating}</span>
                        )}
                      </td>
                      
                      {/* Status */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${restaurant.servicable === "OPEN" 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : restaurant.servicable === "CLOSED"
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            }`}
                        >
                          {statusDisplayNames[restaurant.servicable] || restaurant.servicable}
                        </span>
                      </td>
                      
                      {/* Active Status Toggle */}
                      {/* <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">
                        <button
                          onClick={() => toggleRestaurantStatus(restaurant.id, restaurant.active)}
                          className={`relative inline-flex items-center focus:outline-none ${
                            restaurant.active ? 'text-green-600' : 'text-gray-400'
                          }`}
                          title={restaurant.active ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                        >
                          {restaurant.active ? (
                            <FiToggleRight size={24} className="hover:text-green-700" />
                          ) : (
                            <FiToggleLeft size={24} className="hover:text-gray-600" />
                          )}
                          <span className="ml-1 text-xs">
                            {restaurant.active ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td> */}

                      {/* Active Status Toggle - UPDATED COLORS */}
<td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">
  <button
    onClick={() => toggleRestaurantStatus(restaurant.id, restaurant.active)}
    className={`relative inline-flex items-center focus:outline-none ${
      restaurant.active ? 'text-green-600' : 'text-red-600'
    }`}
    title={restaurant.active ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
  >
    {restaurant.active ? (
      <FiToggleRight size={24} className="hover:text-green-800" />
    ) : (
      <FiToggleLeft size={24} className="hover:text-red-800" />
    )}
    <span className={`ml-1 text-xs font-medium ${
      restaurant.active ? 'text-green-700' : 'text-red-700'
    }`}>
      {restaurant.active ? 'Active' : 'Inactive'}
    </span>
  </button>
</td>
                      
                      {/* Stripe Status */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700 text-xs">
                        {restaurant.stripeStatus || "-"}
                      </td>
                      
                      {/* City */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700 text-xs">
                        {restaurant.city || "-"}
                      </td>
                      
                      {/* Registered On */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700 text-xs">
                        {formatDate(restaurant.registeredOn)}
                      </td>
                      
                      {/* Actions Dropdown */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">
                        <div className="relative" ref={el => dropdownRefs.current[restaurant.id] = el}>
                          <button
                            onClick={() => toggleDropdown(restaurant.id)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="More actions"
                          >
                            <FiMoreVertical size={16} />
                          </button>
                          
                          {openDropdownId === restaurant.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                              <Link
                                to={`/admin/dashboard/merchants/merchant-details/${restaurant.id}`}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setOpenDropdownId(null)}
                              >
                                <FiEye className="mr-2" size={14} />
                                View/Edit
                              </Link>
                              
                              {/* <Link
                                to={`/admin/dashboard/merchants/edit/${restaurant.id}`}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setOpenDropdownId(null)}
                              >
                                <FiEdit className="mr-2" size={14} />
                                Edit
                              </Link> */}
                              
                                  {restaurant.isBlocked ? (
                                  <button
                                    onClick={() => {
                                      handleUnblock(restaurant.id, restaurant.name);
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center w-full px-3 py-2 text-sm text-green-600 hover:bg-green-50"
                                  >
                                    <FiCheckCircle className="mr-2" size={14} />
                                    Unblock
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      handleBlock(restaurant.id, restaurant.name);
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center w-full px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                                  >
                                    <FiXCircle className="mr-2" size={14} />
                                    Block
                                  </button>
                                )}
                              
                              <button
                                onClick={() => {
                                  handleVerify(restaurant.id, restaurant.name);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <FiCheckCircle className="mr-2" size={14} />
                                Verify
                              </button>
                              
                              <button
                                onClick={() => {
                                  handleDuplicate(restaurant.id, restaurant.name);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <FiDuplicate className="mr-2" size={14} />
                                Duplicate
                              </button>
                              
                              <button
                                onClick={() => {
                                  handleChat(restaurant.id, restaurant.name);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <FiMessageSquare className="mr-2" size={14} />
                                Chat
                              </button>
                              
                              <div className="border-t border-gray-100 my-1"></div>
                              
                              <button
                                onClick={() => {
                                  handleDelete(restaurant.id, restaurant.name);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <FiTrash2 className="mr-2" size={14} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-400 mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <p className="text-gray-500 text-sm mb-1">
                          No restaurants found
                        </p>
                        {searchQuery && (
                          <button
                            className="text-xs text-pink-600 hover:text-pink-800"
                            onClick={() => setSearchQuery("")}
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {sortedRestaurants.length > 0 && (
          <div className="flex-shrink-0 bg-white px-3 py-2 border-t border-gray-200 mt-3 rounded-lg">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-2 relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-gray-700">
                  Showing <span className="font-medium">{startIndex}</span> to{' '}
                  <span className="font-medium">{endIndex}</span> of{' '}
                  <span className="font-medium">{totalRestaurants}</span> restaurants
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-1.5 py-1.5 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <FiChevronLeft className="h-4 w-4" />
                  </button>
                 
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-3 py-1.5 border text-xs font-medium
                        ${currentPage === page
                          ? 'z-10 bg-pink-50 border-pink-500 text-pink-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                 
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-1.5 py-1.5 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <FiChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default RestaurantTables;