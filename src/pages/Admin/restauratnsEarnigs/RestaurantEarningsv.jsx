import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../../apis/apiClient/apiClient';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const RestaurantEarningsv = () => {
  const { restaurantId } = useParams();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRestaurantIndex, setSelectedRestaurantIndex] = useState(0);
  const [selectedRestaurant, setSelectedRestaurant] = useState({ _id: restaurantId });
  
  // Time filter states
  const [timeFilter, setTimeFilter] = useState('today');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Set default dates based on filter
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch(timeFilter) {
      case 'today':
        setStartDate(new Date(today));
        setEndDate(new Date(today));
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        setStartDate(weekStart);
        setEndDate(new Date(today));
        break;
      case 'month':
        const monthStart = new Date(today);
        monthStart.setDate(1);
        setStartDate(monthStart);
        setEndDate(new Date(today));
        break;
      default:
        // For custom, we keep whatever dates were selected
        break;
    }
  }, [timeFilter]);

  // Fetch earnings data when selected restaurant or dates change
  useEffect(() => {
    const fetchEarningsData = async (restaurantId) => {
      try {
        setEarningsLoading(true);
        setError(null);
        
        // Format dates to ISO strings
        const formattedStartDate = startDate.toISOString();
        const formattedEndDate = new Date(endDate);
        formattedEndDate.setHours(23, 59, 59, 999); // Include entire end day
        
        const response = await apiClient.get(`/restaurants/${restaurantId}/earningsv2`, {
          params: {
            startDate: formattedStartDate,
            endDate: formattedEndDate.toISOString()
          }
        });
        
        setData(response.data);
        console.log(response.data,"earnings")
      } catch (err) {
        console.error("Error fetching earnings data:", err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch earnings data');
      } finally {
        setEarningsLoading(false);
        setLoading(false);
      }
    };

    if (restaurantId) {
      console.log("Fetching data for restaurant:", restaurantId);
      fetchEarningsData(restaurantId);
    }
  }, [restaurantId, startDate, endDate]);


  const handleRestaurantSelect = (restaurant, index) => {
    if (!restaurant?.id) {
      console.error("Invalid restaurant selection:", restaurant);
      return;
    }
    console.log("Selected restaurant ID:", restaurant.id);
    setSelectedRestaurant(restaurant);
    setSelectedRestaurantIndex(index);
  };

  const handleRestaurantsLoad = (loadedRestaurants) => {
    if (loadedRestaurants.length > 0 && !selectedRestaurant) {
      // Set the first restaurant as default if none is selected
      console.log("Setting default restaurant:", loadedRestaurants[0].id);
      setSelectedRestaurant(loadedRestaurants[0]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    if (filter !== 'custom') {
      setShowCustomDatePicker(false);
    } else {
      setShowCustomDatePicker(true);
    }
  };

  const formatDateRange = () => {
    if (timeFilter === 'today') {
      return startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } else if (timeFilter === 'week') {
      return `${startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
    } else if (timeFilter === 'month') {
      return startDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    } else {
      return `${startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
    }
  };

  // Use the fetched data or fallback to empty data if not available
  const actualData = data || {
    summary: {
      totalOrderAmount: 0,
      totalNetRevenue: 0,
      totalCommission: 0,
      orderCount: 0
    },
    orders: {
      docs: []
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    
    
      <div className="container mx-auto p-6">
        {/* Header with Time Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Restaurant Earnings</h1>
              <p className="text-gray-600">Track your revenue, orders, and performance metrics</p>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Time Period:</span>
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    onClick={() => handleTimeFilterChange('today')}
                    className={`px-3 py-1 text-sm font-medium rounded-l-lg border ${
                      timeFilter === 'today'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleTimeFilterChange('week')}
                    className={`px-3 py-1 text-sm font-medium border-t border-b ${
                      timeFilter === 'week'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Last Week
                  </button>
                  <button
                    onClick={() => handleTimeFilterChange('month')}
                    className={`px-3 py-1 text-sm font-medium border-t border-b ${
                      timeFilter === 'month'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => handleTimeFilterChange('custom')}
                    className={`px-3 py-1 text-sm font-medium rounded-r-lg border ${
                      timeFilter === 'custom'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>
              
              {showCustomDatePicker && (
                <div className="flex items-center space-x-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <label className="mr-2 text-sm font-medium text-gray-600">From:</label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="mr-2 text-sm font-medium text-gray-600">To:</label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>
              )}
              
              <div className="text-sm font-medium text-gray-700 mt-1">
                Showing data for: <span className="font-semibold">{formatDateRange()}</span>
              </div>
            </div>
          </div>
        </div>

        {earningsLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-gray-700">Loading earnings data...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Total Revenue</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">₹{actualData.summary?.totalCartTotal?.toLocaleString() ?? '0'}</p>
                <p className="text-sm text-green-600 font-medium">+12.5% from last month</p>
              </div>

              <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Net Earnings</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">₹{actualData.summary.totalNetRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-blue-600 font-medium">+8.2% from last month</p>
              </div>

              <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Total Commission</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">₹{actualData.summary.totalCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-orange-600 font-medium">15.6% of revenue</p>
              </div>

              <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Total Orders</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">{actualData.summary.orderCount.toLocaleString('en-IN')}</p>
                <p className="text-sm text-purple-600 font-medium">+23 from yesterday</p>
              </div>
            </div>







            {/* Payment Method Summary Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
  {/* Cash on Delivery Card */}
  <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
    </div>
    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Cash on Delivery</h3>
    <p className="text-3xl font-bold text-gray-900 mb-1">
      {data?.paymentSummary?.find(p => p._id === 'cash')?.count || 0}
    </p>
    <p className="text-sm text-green-600 font-medium">
      {data?.paymentSummary?.find(p => p._id === 'cash')?.count || 0} orders
    </p>
  </div>

  {/* Online Payments Card */}
  <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
    </div>
    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Online Payments</h3>
    <p className="text-3xl font-bold text-gray-900 mb-1">
      {data?.paymentSummary?.find(p => p._id === 'online')?.count || 0}
    </p>
    <p className="text-sm text-blue-600 font-medium">
      {data?.paymentSummary?.find(p => p._id === 'online')?.count || 0} orders
    </p>
  </div>
</div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {actualData.orders.docs.filter(order => order.orderStatus === 'delivered').length} Delivered
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      {actualData.orders.docs.filter(order => order.orderStatus !== 'delivered').length} Pending
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order Time</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {actualData.orders.docs.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                            <span className="text-sm font-mono text-gray-600">#{order._id.substring(0, 8)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {order.customerId.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{order.customerId.name}</div>
                              <div className="text-sm text-gray-500">{order.customerId.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {order.orderItems.slice(0, 2).map((item, itemIndex) => (
                              <span key={itemIndex} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {item.quantity}× {item.name}
                              </span>
                            ))}
                            {order.orderItems.length > 2 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                                +{order.orderItems.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(order.orderTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            order.orderStatus === 'delivered' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : order.orderStatus === 'preparing'
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                              order.orderStatus === 'delivered' ? 'bg-green-500' : 
                              order.orderStatus === 'preparing' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}></div>
                            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">Net: ₹{order.restaurantNetEarning?.toFixed(2) || (order.totalAmount * 0.9).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Details Modal */}
            {showModal && selectedOrder && (
              <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={handleCloseModal}></div>
                <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">Order Details</h2>
                        <p className="text-gray-600 mt-1">#{selectedOrder._id.substring(0, 8)}...</p>
                      </div>
                      <button
                        onClick={handleCloseModal}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Customer Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <span className="text-gray-600 font-medium w-20">Name:</span>
                            <span className="text-gray-900 font-semibold">{selectedOrder.customerId.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600 font-medium w-20">Phone:</span>
                            <span className="text-gray-900 font-semibold">{selectedOrder.customerId.phone}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Delivery Address
                        </h3>
                        <div className="text-gray-700 leading-relaxed">
                          <p className="font-medium">{selectedOrder.deliveryAddress.street}</p>
                          <p>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state}</p>
                          <p>{selectedOrder.deliveryAddress.country} - {selectedOrder.deliveryAddress.pincode}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-6 text-gray-900 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Order Items
                      </h3>
                      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Item</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {selectedOrder.orderItems.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-12 w-12">
                                        <img className="h-12 w-12 rounded-xl object-cover border-2 border-gray-200" src={item.image} alt={item.name} />
                                      </div>
                                      <div className="ml-4">
                                        <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                      {item.quantity}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{item.price}</td>
                                  <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{item.totalPrice}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-8 rounded-2xl border border-gray-200">
                      <h3 className="text-xl font-semibold mb-6 text-gray-900 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Financial Summary
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <p className="text-gray-600 text-sm font-medium mb-1">Order Status</p>
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              selectedOrder.orderStatus === 'delivered' ? 'bg-green-500' : 
                              selectedOrder.orderStatus === 'preparing' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}></div>
                            <p className="text-lg font-bold text-gray-900 capitalize">{selectedOrder.orderStatus}</p>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <p className="text-gray-600 text-sm font-medium mb-1">Subtotal</p>
                          <p className="text-2xl font-bold text-gray-900">₹{selectedOrder?.cartTotal?.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <p className="text-gray-600 text-sm font-medium mb-1">Discount Amount</p>
                          <p className="text-2xl font-bold text-blue-600">₹{(selectedOrder.discountAmount || 0).toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <p className="text-gray-600 text-sm font-medium mb-1">Total Amount</p>
                          <p className="text-2xl font-bold text-indigo-600">₹{selectedOrder.totalAmount.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <p className="text-gray-600 text-sm font-medium mb-1">Offer Discount</p>
                          <p className="text-2xl font-bold text-red-600">₹{selectedOrder.offerDiscount.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <p className="text-gray-600 text-sm font-medium mb-1">Payment Method</p>
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {selectedOrder.paymentMethod === 'cash' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              )}
                            </svg>
                            <p className="text-lg font-semibold text-gray-900 capitalize">{selectedOrder.paymentMethod}</p>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <p className="text-gray-600 text-sm font-medium mb-1">Wallet Used</p>
                          <p className="text-2xl font-bold text-purple-600">₹{(selectedOrder.walletUsed || 0).toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <p className="text-gray-600 text-sm font-medium mb-1">Commission</p>
                          <p className="text-2xl font-bold text-orange-600">₹{selectedOrder.commissionAmount.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <p className="text-gray-600 text-sm font-medium mb-1">Net Earnings</p>
                          <p className="text-2xl font-bold text-green-600">₹{selectedOrder.restaurantNetEarning.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-medium">Order Time</p>
                          <p className="text-lg font-semibold text-gray-900">{formatDate(selectedOrder.orderTime)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantEarningsv;