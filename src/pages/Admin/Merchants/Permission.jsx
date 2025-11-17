import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Permission = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('mobile');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMerchants, setTotalMerchants] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [permissions, setPermissions] = useState({});
  const [expandedMerchants, setExpandedMerchants] = useState(new Set());
  const itemsPerPage = 8;

  // Permission groups for better organization
  const permissionGroups = [
    {
      title: "Product Management",
      permissions: [
        { key: 'view', label: 'View Products', icon: '👁️' },
        { key: 'create', label: 'Create Products', icon: '➕' },
        { key: 'edit', label: 'Edit Products', icon: '✏️' },
        { key: 'delete', label: 'Delete Products', icon: '🗑️' },
      ]
    },
    {
      title: "Order Management",
      permissions: [
        { key: 'view_orders', label: 'View Orders', icon: '📦' },
        { key: 'process_orders', label: 'Process Orders', icon: '⚡' },
        { key: 'cancel_orders', label: 'Cancel Orders', icon: '❌' },
      ]
    },
    {
      title: "Analytics",
      permissions: [
        { key: 'view_analytics', label: 'View Analytics', icon: '📊' },
        { key: 'export_data', label: 'Export Data', icon: '📥' },
      ]
    }
  ];

  // API Base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://orado.online/backend';

  // Fetch merchants from API with pagination and search
  const fetchMerchants = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adminToken');
      
      const response = await axios.get(`${API_BASE_URL}/admin/merchant/getallmerchants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          page: page,
          limit: itemsPerPage,
          search: search || undefined
        }
      });

      // Check if response has data and data array exists
      if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid API response format');
      }

      // Transform API data to match your component structure
      const transformedMerchants = response.data.data.map(merchant => ({
        id: merchant._id || merchant.id,
        name: merchant.name || 'Unknown Merchant',
        email: merchant.email || 'No email',
        phone: merchant.phone || 'No phone',
        status: 'active',
        revenue: 0,
        platform: 'both',
        avatar: getAvatarForMerchant(merchant),
        products: 0,
        userType: merchant.userType || 'merchant',
        hasMultiStore: false,
        storeCount: 1,
        originalData: merchant
      }));

      setMerchants(transformedMerchants);
      setTotalPages(response.data.pages);
      setTotalMerchants(response.data.total);
      
      // Initialize permissions for each merchant
      initializePermissions(transformedMerchants);
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch merchants');
      console.error('Error fetching merchants:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize permissions based on merchant data
  const initializePermissions = (merchantsList) => {
    const initialPermissions = {};
    
    merchantsList.forEach(merchant => {
      initialPermissions[merchant.id] = {
        web: {
          view: true,
          create: true,
          edit: true,
          delete: false,
          view_orders: true,
          process_orders: true,
          cancel_orders: false,
          view_analytics: true,
          export_data: false,
          multi_store: false
        },
        mobile: {
          view: true,
          create: true,
          edit: true,
          delete: false,
          view_orders: true,
          process_orders: true,
          cancel_orders: false,
          view_analytics: true,
          export_data: false,
          multi_store: false
        }
      };
    });
    
    setPermissions(initialPermissions);
  };

  // Update permissions via API
  const updatePermissionsAPI = async (merchantId, platform, permissionData) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      await axios.put(`${API_BASE_URL}/admin/permissions/${merchantId}`, {
        platform,
        permissions: permissionData
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`Permissions updated for merchant ${merchantId}`);
    } catch (error) {
      console.error('Error updating permissions:', error);
      throw new Error('Failed to update permissions');
    }
  };

  // Enable multi-store for merchant
  const enableMultiStore = async (merchantId) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Call your new API endpoint for enabling multi-store
      const response = await axios.post(`${API_BASE_URL}/admin/merchant/${merchantId}/enable-multi-store`, 
        {
          enabled: true,
          maxStores: 5
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update local state
      setMerchants(prev => prev.map(merchant => 
        merchant.id === merchantId 
          ? { ...merchant, hasMultiStore: true, storeCount: 5 }
          : merchant
      ));

      // Update permissions for both platforms
      setPermissions(prev => ({
        ...prev,
        [merchantId]: {
          ...prev[merchantId],
          web: {
            ...prev[merchantId].web,
            multi_store: true
          },
          mobile: {
            ...prev[merchantId].mobile,
            multi_store: true
          }
        }
      }));

      alert('Multi-store enabled successfully!');
      
    } catch (error) {
      console.error('Error enabling multi-store:', error);
      alert('Failed to enable multi-store. Please try again.');
    }
  };

  // Disable multi-store for merchant
  const disableMultiStore = async (merchantId) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Call your new API endpoint for disabling multi-store
      const response = await axios.post(`${API_BASE_URL}/admin/merchant/${merchantId}/enable-multi-store`, 
        {
          enabled: false,
          maxStores: 1
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update local state
      setMerchants(prev => prev.map(merchant => 
        merchant.id === merchantId 
          ? { ...merchant, hasMultiStore: false, storeCount: 1 }
          : merchant
      ));

      // Update permissions for both platforms
      setPermissions(prev => ({
        ...prev,
        [merchantId]: {
          ...prev[merchantId],
          web: {
            ...prev[merchantId].web,
            multi_store: false
          },
          mobile: {
            ...prev[merchantId].mobile,
            multi_store: false
          }
        }
      }));

      alert('Multi-store disabled successfully!');
      
    } catch (error) {
      console.error('Error disabling multi-store:', error);
      alert('Failed to disable multi-store. Please try again.');
    }
  };

  // Helper function to get avatar based on merchant data
  const getAvatarForMerchant = (merchant) => {
    const avatars = ['🛍️', '👗', '🍕', '📱', '📚', '🏪', '🍔', '☕', '🎂', '🍜'];
    const name = merchant.name || 'Unknown';
    const index = name.charCodeAt(0) % avatars.length;
    return avatars[index];
  };

  // Initialize data
  useEffect(() => {
    fetchMerchants(currentPage, searchTerm);
  }, []);

  // Handle page changes
  useEffect(() => {
    fetchMerchants(currentPage, searchTerm);
  }, [currentPage]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchMerchants(1, searchTerm);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Refresh merchants function
  const refreshMerchants = () => {
    fetchMerchants(currentPage, searchTerm);
  };

  // Stats data - now based on real merchants from backend
  const stats = [
    { 
      label: 'Total', 
      value: totalMerchants, 
      color: '#1f2937', 
      icon: '👨‍💼'
    },
    { 
      label: 'Multi-Store', 
      value: merchants.filter(m => m.hasMultiStore).length, 
      color: '#10b981', 
      icon: '🏪'
    },
    { 
      label: 'Single Store', 
      value: merchants.filter(m => !m.hasMultiStore).length, 
      color: '#3b82f6', 
      icon: '🏬'
    },
    { 
      label: 'Active', 
      value: merchants.length, 
      color: '#f59e0b', 
      icon: '✅'
    },
  ];

  const handlePermissionToggle = async (merchantId, platform, permissionType) => {
    const newValue = !permissions[merchantId]?.[platform]?.[permissionType];
    
    // Update local state immediately for better UX
    setPermissions(prev => ({
      ...prev,
      [merchantId]: {
        ...prev[merchantId],
        [platform]: {
          ...prev[merchantId][platform],
          [permissionType]: newValue
        }
      }
    }));

    // Update via API
    try {
      await updatePermissionsAPI(merchantId, platform, {
        ...permissions[merchantId][platform],
        [permissionType]: newValue
      });
    } catch (error) {
      // Revert local state if API call fails
      setPermissions(prev => ({
        ...prev,
        [merchantId]: {
          ...prev[merchantId],
          [platform]: {
            ...prev[merchantId][platform],
            [permissionType]: !newValue
          }
        }
      }));
      alert('Failed to update permission. Please try again.');
    }
  };

  // Bulk permission actions
  const setAllPermissions = async (merchantId, platform, value) => {
    const newPermissions = { ...permissions[merchantId][platform] };
    Object.keys(newPermissions).forEach(key => {
      newPermissions[key] = value;
    });

    // Update local state immediately
    setPermissions(prev => ({
      ...prev,
      [merchantId]: {
        ...prev[merchantId],
        [platform]: newPermissions
      }
    }));

    // Update via API
    try {
      await updatePermissionsAPI(merchantId, platform, newPermissions);
    } catch (error) {
      // Revert local state if API call fails
      setPermissions(prev => ({
        ...prev,
        [merchantId]: {
          ...prev[merchantId],
          [platform]: permissions[merchantId][platform]
        }
      }));
      alert('Failed to update permissions. Please try again.');
    }
  };

  // Toggle merchant expansion
  const toggleMerchantExpansion = (merchantId) => {
    setExpandedMerchants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(merchantId)) {
        newSet.delete(merchantId);
      } else {
        newSet.add(merchantId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#10b981',
      pending: '#f59e0b',
      suspended: '#ef4444',
      approved: '#10b981',
      rejected: '#ef4444'
    };
    return colors[status] || '#718096';
  };

  const getStatusBackground = (status) => {
    const backgrounds = {
      active: 'rgba(16, 185, 129, 0.1)',
      pending: 'rgba(245, 158, 11, 0.1)',
      suspended: 'rgba(239, 68, 68, 0.1)',
      approved: 'rgba(16, 185, 129, 0.1)',
      rejected: 'rgba(239, 68, 68, 0.1)'
    };
    return backgrounds[status] || 'rgba(113, 128, 150, 0.1)';
  };

  const getStoreTypeColor = (hasMultiStore) => {
    return hasMultiStore ? '#10b981' : '#3b82f6';
  };

  const getStoreTypeBackground = (hasMultiStore) => {
    return hasMultiStore ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)';
  };

  // Enhanced Styles with compact design
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      maxWidth: '1400px',
      margin: '0 auto',
      marginBottom: '24px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '800',
      color: '#1a202c',
      margin: 0,
      marginBottom: '8px',
      background: 'linear-gradient(135deg, #FC8019 0%, #ff9a3d 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: {
      fontSize: '16px',
      color: '#718096',
      margin: 0,
      fontWeight: '500'
    },
    // Compact stats row
    statsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '12px',
      marginBottom: '24px'
    },
    statItem: {
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    statIcon: {
      fontSize: '20px',
      padding: '10px',
      borderRadius: '10px',
      backgroundColor: '#f7fafc',
      flexShrink: 0
    },
    statContent: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    },
    statLabel: {
      fontSize: '12px',
      color: '#718096',
      margin: 0,
      marginBottom: '2px',
      fontWeight: '600'
    },
    statValue: {
      fontSize: '20px',
      fontWeight: '800',
      margin: 0
    },
    mainCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    },
    searchSection: {
      padding: '18px 24px',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#fafbfc'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s ease',
      backgroundColor: 'white'
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#fafbfc'
    },
    tab: {
      flex: 1,
      padding: '16px 24px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: 'transparent',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    activeTab: {
      borderBottom: '3px solid #FC8019',
      color: '#FC8019',
      backgroundColor: 'white',
      fontWeight: '700'
    },
    inactiveTab: {
      color: '#718096'
    },
    content: {
      padding: '0'
    },
    noResults: {
      textAlign: 'center',
      padding: '60px 20px'
    },
    noResultsIcon: {
      fontSize: '64px',
      marginBottom: '20px',
      opacity: 0.6
    },
    noResultsTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '12px'
    },
    noResultsText: {
      fontSize: '15px',
      color: '#718096'
    },
    // Compact merchant card
    merchantCard: {
      borderBottom: '1px solid #e2e8f0',
      transition: 'all 0.3s ease',
      backgroundColor: 'white'
    },
    merchantHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      gap: '16px'
    },
    merchantInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      flex: 1
    },
    avatar: {
      width: '44px',
      height: '44px',
      backgroundColor: '#fed7aa',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: '600',
      flexShrink: 0
    },
    merchantDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      flex: 1,
      minWidth: 0
    },
    merchantName: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#2d3748',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    merchantEmail: {
      fontSize: '13px',
      color: '#718096',
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    merchantMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '12px',
      color: '#718096',
      marginTop: '2px',
      flexWrap: 'wrap'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase'
    },
    storeTypeBadge: {
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase'
    },
    expandIcon: {
      fontSize: '16px',
      color: '#718096',
      transition: 'transform 0.3s ease',
      flexShrink: 0
    },
    expandedContent: {
      padding: '0 20px 20px 20px',
      backgroundColor: '#fafbfc',
      borderTop: '1px solid #e2e8f0'
    },
    // Enhanced bulk actions
    bulkActions: {
      padding: '16px 0',
      display: 'flex',
      gap: '10px',
      marginBottom: '16px',
      flexWrap: 'wrap'
    },
    bulkButton: {
      padding: '8px 14px',
      border: '2px solid #cbd5e0',
      borderRadius: '8px',
      backgroundColor: 'white',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: '#4a5568',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    primaryBulkButton: {
      backgroundColor: '#FC8019',
      color: 'white',
      borderColor: '#FC8019'
    },
    successBulkButton: {
      backgroundColor: '#10b981',
      color: 'white',
      borderColor: '#10b981'
    },
    dangerBulkButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      borderColor: '#ef4444'
    },
    permissionGroups: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    permissionGroup: {
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: 'white',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
    },
    groupHeader: {
      backgroundColor: '#f7fafc',
      padding: '14px 18px',
      borderBottom: '1px solid #e2e8f0'
    },
    groupTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#2d3748',
      margin: 0
    },
    permissionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '10px',
      padding: '18px'
    },
    permissionItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 14px',
      borderRadius: '8px',
      backgroundColor: '#fafafa',
      border: '1px solid #edf2f7',
      transition: 'all 0.2s ease'
    },
    permissionInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    permissionIcon: {
      fontSize: '14px'
    },
    permissionLabel: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#2d3748'
    },
    toggle: {
      position: 'relative',
      display: 'inline-block',
      width: '44px',
      height: '24px'
    },
    toggleInput: {
      opacity: 0,
      width: 0,
      height: 0
    },
    toggleSlider: {
      position: 'absolute',
      cursor: 'pointer',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#cbd5e0',
      transition: '0.4s',
      borderRadius: '24px'
    },
    toggleSliderBefore: {
      position: 'absolute',
      content: '""',
      height: '18px',
      width: '18px',
      left: '3px',
      bottom: '3px',
      backgroundColor: 'white',
      transition: '0.4s',
      borderRadius: '50%',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    },
    toggleChecked: {
      backgroundColor: '#FC8019'
    },
    toggleCheckedBefore: {
      transform: 'translateX(20px)'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '18px 24px',
      borderTop: '1px solid #e2e8f0',
      backgroundColor: '#fafbfc'
    },
    paginationInfo: {
      fontSize: '14px',
      color: '#718096',
      fontWeight: '600'
    },
    paginationButtons: {
      display: 'flex',
      gap: '8px'
    },
    paginationButton: {
      padding: '8px 12px',
      border: '2px solid #cbd5e0',
      borderRadius: '8px',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      minWidth: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    activePage: {
      backgroundColor: '#FC8019',
      color: 'white',
      borderColor: '#FC8019'
    }
  };

  // Add loading and error states
  if (loading && merchants.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
            <h3 style={{ color: '#2d3748', marginBottom: '12px' }}>Loading Merchants...</h3>
            <p style={{ color: '#718096' }}>Please wait while we fetch merchant data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && merchants.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
            <h3 style={{ color: '#e53e3e', marginBottom: '12px' }}>Error Loading Merchants</h3>
            <p style={{ color: '#718096', marginBottom: '20px' }}>{error}</p>
            <button 
              onClick={refreshMerchants}
              style={{
                padding: '12px 24px',
                backgroundColor: '#FC8019',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '14px'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {/* Header */}
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={styles.title}>Merchant Permissions</h1>
            <p style={styles.subtitle}>Manage merchant access, permissions and multi-store settings</p>
          </div>
          <button 
            onClick={refreshMerchants}
            style={{
              padding: '12px 18px',
              backgroundColor: '#f7fafc',
              border: '2px solid #cbd5e0',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f7fafc';
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Compact Stats Row */}
        <div style={styles.statsRow}>
          {stats.map((stat, index) => (
            <div 
              key={index} 
              style={styles.statItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)';
              }}
            >
              <div style={styles.statIcon}>{stat.icon}</div>
              <div style={styles.statContent}>
                <p style={styles.statLabel}>{stat.label}</p>
                <p style={{ ...styles.statValue, color: stat.color }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div style={styles.mainCard}>
          {/* Search */}
          <div style={styles.searchSection}>
            <input
              type="text"
              placeholder="🔍 Search merchants by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => {
                e.target.style.borderColor = '#FC8019';
                e.target.style.boxShadow = '0 0 0 3px rgba(252, 128, 25, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Tabs - Both Web and Mobile */}
          <div style={styles.tabs}>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'mobile' ? styles.activeTab : styles.inactiveTab)
              }}
              onClick={() => setActiveTab('mobile')}
            >
              📱 Mobile Permissions
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'web' ? styles.activeTab : styles.inactiveTab)
              }}
              onClick={() => setActiveTab('web')}
            >
              🌐 Web Permissions
            </button>
          </div>

          {/* Content */}
          <div style={styles.content}>
            {merchants.length === 0 ? (
              <div style={styles.noResults}>
                <div style={styles.noResultsIcon}>🔍</div>
                <h3 style={styles.noResultsTitle}>No merchants found</h3>
                <p style={styles.noResultsText}>Try adjusting your search terms or check for typos</p>
              </div>
            ) : (
              <div>
                {merchants.map((merchant) => (
                  <div key={merchant.id} style={styles.merchantCard}>
                    {/* Merchant Header - Clickable for expansion */}
                    <div 
                      style={styles.merchantHeader}
                      onClick={() => toggleMerchantExpansion(merchant.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fafbfc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      <div style={styles.merchantInfo}>
                        <div style={styles.avatar}>
                          {merchant.avatar}
                        </div>
                        <div style={styles.merchantDetails}>
                          <div style={styles.merchantName}>
                            {merchant.name}
                            <span style={{
                              ...styles.statusBadge,
                              color: getStatusColor(merchant.status),
                              backgroundColor: getStatusBackground(merchant.status)
                            }}>
                              {merchant.status}
                            </span>
                            <span style={{
                              ...styles.storeTypeBadge,
                              color: getStoreTypeColor(merchant.hasMultiStore),
                              backgroundColor: getStoreTypeBackground(merchant.hasMultiStore)
                            }}>
                              {merchant.hasMultiStore ? '🏪 Multi-Store' : '🏬 Single Store'}
                            </span>
                          </div>
                          <p style={styles.merchantEmail}>{merchant.email}</p>
                          <div style={styles.merchantMeta}>
                            <span>📞 {merchant.phone}</span>
                            <span>•</span>
                            <span>Stores: {merchant.storeCount}</span>
                            <span>•</span>
                            <span style={{ fontWeight: '600', color: '#2d3748' }}>{merchant.userType}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{
                        ...styles.expandIcon,
                        transform: expandedMerchants.has(merchant.id) ? 'rotate(180deg)' : 'rotate(0)'
                      }}>
                        ▼
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {expandedMerchants.has(merchant.id) && (
                      <div style={styles.expandedContent}>
                        {/* Enhanced Bulk Actions */}
                        <div style={styles.bulkActions}>
                          <button 
                            style={{
                              ...styles.bulkButton,
                              ...styles.primaryBulkButton
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setAllPermissions(merchant.id, activeTab, true);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(252, 128, 25, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            ✅ Enable All Permissions
                          </button>
                          <button 
                            style={{
                              ...styles.bulkButton,
                              ...styles.dangerBulkButton
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setAllPermissions(merchant.id, activeTab, false);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            ❌ Disable All Permissions
                          </button>
                          {!merchant.hasMultiStore ? (
                            <button 
                              style={{
                                ...styles.bulkButton,
                                ...styles.successBulkButton
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                enableMultiStore(merchant.id);
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              🏪 Enable Multi-Store
                            </button>
                          ) : (
                            <button 
                              style={{
                                ...styles.bulkButton,
                                ...styles.dangerBulkButton
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                disableMultiStore(merchant.id);
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              🏬 Disable Multi-Store
                            </button>
                          )}
                        </div>

                        {/* Permission Groups */}
                        <div style={styles.permissionGroups}>
                          {permissionGroups.map((group) => (
                            <div key={group.title} style={styles.permissionGroup}>
                              <div style={styles.groupHeader}>
                                <h4 style={styles.groupTitle}>{group.title}</h4>
                              </div>
                              <div style={styles.permissionsGrid}>
                                {group.permissions.map((permission) => (
                                  <div 
                                    key={permission.key} 
                                    style={styles.permissionItem}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#f7fafc';
                                      e.currentTarget.style.borderColor = '#e2e8f0';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '#fafafa';
                                      e.currentTarget.style.borderColor = '#edf2f7';
                                    }}
                                  >
                                    <div style={styles.permissionInfo}>
                                      <span style={styles.permissionIcon}>{permission.icon}</span>
                                      <span style={styles.permissionLabel}>{permission.label}</span>
                                    </div>
                                    <label style={styles.toggle}>
                                      <input
                                        type="checkbox"
                                        style={styles.toggleInput}
                                        checked={permissions[merchant.id]?.[activeTab]?.[permission.key] || false}
                                        onChange={() => handlePermissionToggle(merchant.id, activeTab, permission.key)}
                                      />
                                      <span style={{
                                        ...styles.toggleSlider,
                                        ...(permissions[merchant.id]?.[activeTab]?.[permission.key] ? styles.toggleChecked : {})
                                      }}>
                                        <span style={{
                                          ...styles.toggleSliderBefore,
                                          ...(permissions[merchant.id]?.[activeTab]?.[permission.key] ? styles.toggleCheckedBefore : {})
                                        }}></span>
                                      </span>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <div style={styles.paginationInfo}>
                  Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalMerchants)} of {totalMerchants} merchants
                </div>
                <div style={styles.paginationButtons}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{
                      ...styles.paginationButton,
                      ...(currentPage === 1 ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.backgroundColor = '#f7fafc';
                        e.currentTarget.style.borderColor = '#a0aec0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#cbd5e0';
                      }
                    }}
                  >
                    ← Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        ...styles.paginationButton,
                        ...(currentPage === page ? styles.activePage : {})
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== page) {
                          e.currentTarget.style.backgroundColor = '#f7fafc';
                          e.currentTarget.style.borderColor = '#a0aec0';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== page) {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = '#cbd5e0';
                        }
                      }}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{
                      ...styles.paginationButton,
                      ...(currentPage === totalPages ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.backgroundColor = '#f7fafc';
                        e.currentTarget.style.borderColor = '#a0aec0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#cbd5e0';
                      }
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Permission;