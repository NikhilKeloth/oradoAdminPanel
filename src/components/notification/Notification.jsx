import React, { useState, useEffect } from 'react';
import { Bell, Package, Gift, Wallet, Sparkles, AlertTriangle, Filter, Check, CheckCheck, X } from 'lucide-react';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../../apis/notificationApi'; 

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await getNotifications();
        setNotifications(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const notificationTypes = [
    { key: 'all', label: 'All', icon: Bell, count: notifications.length },
    { key: 'orderUpdates', label: 'Order Updates', icon: Package, count: notifications.filter(n => n.type === 'orderUpdates').length },
    { key: 'promotions', label: 'Promotions', icon: Gift, count: notifications.filter(n => n.type === 'promotions').length },
    { key: 'walletCredits', label: 'Wallet Credits', icon: Wallet, count: notifications.filter(n => n.type === 'walletCredits').length },
    { key: 'newFeatures', label: 'New Features', icon: Sparkles, count: notifications.filter(n => n.type === 'newFeatures').length },
    { key: 'serviceAlerts', label: 'Service Alerts', icon: AlertTriangle, count: notifications.filter(n => n.type === 'serviceAlerts').length },
  ];

  const filteredNotifications = activeFilter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === activeFilter);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      orderUpdates: Package,
      promotions: Gift,
      walletCredits: Wallet,
      newFeatures: Sparkles,
      serviceAlerts: AlertTriangle,
    };
    const IconComponent = iconMap[type] || Bell;
    return <IconComponent className="h-5 w-5" />;
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      orderUpdates: 'text-blue-600 bg-blue-50',
      promotions: 'text-orange-600 bg-orange-50',
      walletCredits: 'text-green-600 bg-green-50',
      newFeatures: 'text-purple-600 bg-purple-50',
      serviceAlerts: 'text-red-600 bg-red-50',
    };
    return colorMap[type] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 mt-20 flex items-center justify-center">
        <div className="text-center">
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 mt-20 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center space-x-2 px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Mark all as read</span>
                  <span className="sm:hidden">Mark all</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-medium text-gray-900 mb-4">Filter by type</h3>
              <div className="space-y-2">
                {notificationTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.key}
                      onClick={() => setActiveFilter(type.key)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        activeFilter === type.key
                          ? 'bg-orange-50 text-orange-600 border border-orange-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activeFilter === type.key
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {type.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Filter Overlay */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowFilters(false)}>
              <div className="bg-white w-80 h-full p-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Filter notifications</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="space-y-2">
                  {notificationTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <button
                        key={type.key}
                        onClick={() => {
                          setActiveFilter(type.key);
                          setShowFilters(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                          activeFilter === type.key
                            ? 'bg-orange-50 text-orange-600 border border-orange-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-4 w-4" />
                          <span className="text-sm font-medium">{type.label}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          activeFilter === type.key
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {type.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1">
            {filteredNotifications.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">You're all caught up! No new notifications at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-lg shadow-sm border p-4 transition-all hover:shadow-md ${
                      !notification.isRead ? 'border-l-4 border-l-orange-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                              {notification.isNew && (
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">NEW</span>
                              )}
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            
                            {/* Special badges */}
                            <div className="flex items-center space-x-2 mb-2">
                              {notification.orderId && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {notification.orderId}
                                </span>
                              )}
                              {notification.discount && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">
                                  {notification.discount}
                                </span>
                              )}
                              {notification.amount && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">
                                  {notification.amount}
                                </span>
                              )}
                              {notification.freeDelivery && (
                                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-medium">
                                  FREE DELIVERY
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-400">{notification.time}</p>
                          </div>
                          
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="ml-4 p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;