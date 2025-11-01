import React, { useState, useEffect } from 'react';
import { Eye, TrendingUp, Calendar, ChevronDown } from 'lucide-react';
import apiClient from '../../apis/apiClient/apiClient';
import { Link, useNavigate } from 'react-router-dom';
const RestaurantEarningsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [earningsData, setEarningsData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [showTimeFilterDropdown, setShowTimeFilterDropdown] = useState(false);
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const [ordersData, setOrdersData] = useState([]);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const itemsPerPage = 10;
  const token = localStorage.getItem('adminToken');

  const timeFilterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        
        let startDate, endDate;
        const today = new Date();
        
        if (timeFilter === 'today') {
          startDate = endDate = today.toISOString().split('T')[0];
        } else if (timeFilter === 'week') {
          const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
          startDate = firstDay.toISOString().split('T')[0];
          endDate = new Date().toISOString().split('T')[0];
        } else if (timeFilter === 'month') {
          startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
          endDate = new Date().toISOString().split('T')[0];
        }
        
        const response = await apiClient.get('/restaurants/684435721d5a2650f0ef033e/earnings-list', {
          params: {
            startDate: timeFilter !== 'all' ? startDate : undefined,
            endDate: timeFilter !== 'all' ? endDate : undefined,
            page: currentPage,
            limit: itemsPerPage
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setEarningsData(response.data.data);
        setTotalRestaurants(response.data.totalRestaurants);
      } catch (err) {
        console.error("Error fetching earnings:", err.response ? err.response.data : err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEarnings();
  }, [currentPage, timeFilter, token]);

  const handleViewSummary = async (restaurantId, restaurantName) => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/restaurants/${restaurantId}/earnigsv2`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const orders = response.data.orders.docs || [];
      const monthlyData = {};
      
      orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const month = orderDate.getMonth();
        const year = orderDate.getFullYear();
        const monthYear = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            orderCount: 0,
            totalAmount: 0,
            totalCommission: 0,
            netRevenue: 0,
            orders: []
          };
        }
        
        const orderAmount = Number(order.totalAmount) || 0;
        const commission = Number(order.commissionAmount) || 0;
        const net = orderAmount - commission;
        
        monthlyData[monthYear].orderCount += 1;
        monthlyData[monthYear].totalAmount += orderAmount;
        monthlyData[monthYear].totalCommission += commission;
        monthlyData[monthYear].netRevenue += net;
        monthlyData[monthYear].orders.push(order);
      });
    
      const monthlyBreakdown = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          ...data,
          totalAmount: Number(data.totalAmount.toFixed(2)),
          totalCommission: Number(data.totalCommission.toFixed(2)),
          netRevenue: Number(data.netRevenue.toFixed(2))
        }))
        .sort((a, b) => {
          const [aMonth, aYear] = a.month.split(' ');
          const [bMonth, bYear] = b.month.split(' ');
          const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
          
          if (aYear !== bYear) return bYear - aYear;
          return months.indexOf(bMonth) - months.indexOf(aMonth);
        });
      
      setSummaryData({
        ...response.data.summary,
        restaurantName: restaurantName,
        totalNetEarnings: response.data.summary.totalNetRevenue,
        totalCommission: response.data.summary.totalCommission,
        totalOrderAmount: response.data.summary.totalOrderAmount,
        count: response.data.summary.orderCount,
        monthlyBreakdown
      });
      
      setOrdersData(orders);
      setMonthlyBreakdown(monthlyBreakdown);
      setSelectedRestaurant(restaurantId);
    } catch (err) {
      console.error("Error fetching summary:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleDateString('en-IN', options);
    } catch {
      return 'Invalid Date';
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    setShowTimeFilterDropdown(false);
    setCurrentPage(1);
  };

  if (loading && !earningsData.length) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <p className="text-red-600 font-medium">Error: {error}</p>
    </div>
  );

  if (selectedRestaurant && summaryData) {
    return (
      <div className="mt-8">
        <button
          onClick={() => {
            setSelectedRestaurant(null);
            setSummaryData(null);
            setOrdersData([]);
            setMonthlyBreakdown([]);
          }}
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium mb-6 transition-colors duration-200 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
          Back to Table
        </button>
        
        <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-8">
            <h2 className="text-2xl font-light flex items-center gap-3 tracking-wide">
              <TrendingUp className="w-7 h-7" />
              {summaryData.restaurantName} - Earnings Summary
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 border-b border-orange-100">
            <div className="bg-orange-50 rounded-xl p-6">
              <h3 className="text-orange-800 font-medium mb-2">Total Orders</h3>
              <p className="text-3xl font-bold text-orange-600">{summaryData.count}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-6">
              <h3 className="text-orange-800 font-medium mb-2">Total Order Amount</h3>
              <p className="text-3xl font-bold text-orange-600">{formatCurrency(summaryData.totalOrderAmount)}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-6">
              <h3 className="text-orange-800 font-medium mb-2">Total Commission</h3>
              <p className="text-3xl font-bold text-orange-600">{formatCurrency(summaryData.totalCommission)}</p>
            </div>
          </div>
          
          <div className="p-8">
            <h3 className="text-xl font-medium text-gray-800 mb-6">Monthly Breakdown</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-orange-50 border-b border-orange-100">
                  <tr>
                    <th className="text-left p-4 font-medium text-orange-900">Month</th>
                    <th className="text-right p-4 font-medium text-orange-900">Orders</th>
                    <th className="text-right p-4 font-medium text-orange-900">Order Amount</th>
                    <th className="text-right p-4 font-medium text-orange-900">Commission</th>
                    <th className="text-right p-4 font-medium text-orange-900">Net Revenue</th>
                    <th className="text-center p-4 font-medium text-orange-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.monthlyBreakdown.map((monthData, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-orange-25">
                      <td className="p-4 font-medium text-gray-900">{monthData.month}</td>
                      <td className="p-4 text-right text-gray-700">{monthData.orderCount}</td>
                      <td className="p-4 text-right text-gray-700">{formatCurrency(monthData.totalAmount)}</td>
                      <td className="p-4 text-right text-gray-700">{formatCurrency(monthData.totalCommission)}</td>
                      <td className="p-4 text-right font-medium text-green-600">{formatCurrency(monthData.netRevenue)}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setOrdersData(monthData.orders)}
                          className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600"
                        >
                          View Orders
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-8">
            <h2 className="text-xl font-light flex items-center gap-3 tracking-wide">
              Order Details ({ordersData.length} orders)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-orange-50 border-b border-orange-100">
                <tr>
                  <th className="text-left p-4 font-medium text-orange-900">Order ID</th>
                  <th className="text-left p-4 font-medium text-orange-900">Date & Time</th>
                  <th className="text-left p-4 font-medium text-orange-900">Customer</th>
                  <th className="text-right p-4 font-medium text-orange-900">Amount</th>
                  <th className="text-right p-4 font-medium text-orange-900">Commission</th>
                  <th className="text-right p-4 font-medium text-orange-900">Net Revenue</th>
                  <th className="text-left p-4 font-medium text-orange-900">Payment</th>
                  <th className="text-center p-4 font-medium text-orange-900">Details</th>
                </tr>
              </thead>
              <tbody>
                {ordersData.map((order) => {
                  const orderAmount = Number(order.totalAmount) || 0;
                  const commission = Number(order.commissionAmount) || 0;
                  const net = orderAmount - commission;
                  const isExpanded = expandedOrder === order._id;

                  return (
                    <React.Fragment key={order._id}>
                      <tr className="border-b border-gray-50 hover:bg-orange-25">
                        <td className="p-4 font-medium text-gray-900">#{order.orderId || 'N/A'}</td>
                        <td className="p-4 text-gray-700">{formatDate(order.createdAt)}</td>
                        <td className="p-4 text-gray-700">
                          {order.customerId?.name || 'Unknown'}
                          <div className="text-sm text-gray-500">{order.customerId?.phone || ''}</div>
                        </td>
                        <td className="p-4 text-right text-gray-700">{formatCurrency(orderAmount)}</td>
                        <td className="p-4 text-right text-gray-700">{formatCurrency(commission)}</td>
                        <td className="p-4 text-right font-medium text-green-600">
                          {formatCurrency(net)}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.paymentMethod === 'online' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.paymentMethod || 'unknown'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.orderStatus === 'delivered' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.orderStatus || 'unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => toggleOrderExpand(order._id)}
                            className="px-3 py-1 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600"
                          >
                            {isExpanded ? 'Hide' : 'Show'}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-orange-50">
                          <td colSpan="8" className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium text-orange-800 mb-2">Order Items</h4>
                                <ul className="space-y-2">
                                  {order.orderItems?.map((item, i) => (
                                    <li key={i} className="flex justify-between items-center border-b border-orange-100 pb-2">
                                      <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                      </div>
                                      <div className="text-right">
                                        <p>{formatCurrency(item.price)} each</p>
                                        <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium text-orange-800 mb-2">Delivery Details</h4>
                                <div className="space-y-2">
                                  <p>
                                    <span className="font-medium">Address:</span> {order.deliveryAddress?.street || 'N/A'}
                                  </p>
                                  <p>
                                    <span className="font-medium">City:</span> {order.deliveryAddress?.city || 'N/A'}
                                  </p>
                                  <p>
                                    <span className="font-medium">Pincode:</span> {order.deliveryAddress?.pincode || 'N/A'}
                                  </p>
                                  {order.assignedAgent && (
                                    <p>
                                      <span className="font-medium">Delivery Agent:</span> {order.assignedAgent._id}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalRestaurants / itemsPerPage);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-light flex items-center gap-3 tracking-wide">
            <TrendingUp className="w-7 h-7" />
            Restaurant Earnings Overview
          </h2>
          
          <div className="relative">
            <button
              onClick={() => setShowTimeFilterDropdown(!showTimeFilterDropdown)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all duration-200"
            >
              <Calendar className="w-5 h-5" />
              <span>
                {timeFilterOptions.find(opt => opt.value === timeFilter)?.label || 'Filter'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showTimeFilterDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showTimeFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-10 border border-gray-100 overflow-hidden">
                {timeFilterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleTimeFilterChange(option.value)}
                    className={`w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors duration-200 flex items-center gap-2 ${
                      timeFilter === option.value ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-orange-50 border-b border-orange-100">
            <tr>
              <th className="text-left p-6 font-medium text-orange-900 tracking-wide">Restaurant Name</th>
              <th className="text-right p-6 font-medium text-orange-900 tracking-wide">Order Amount</th>
              <th className="text-right p-6 font-medium text-orange-900 tracking-wide">Commission</th>
              <th className="text-right p-6 font-medium text-orange-900 tracking-wide">Net Revenue</th>
              <th className="text-right p-6 font-medium text-orange-900 tracking-wide">Orders</th>
              <th className="text-center p-6 font-medium text-orange-900 tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            {earningsData.map((restaurant, index) => (
              <tr 
                key={index} 
                className="border-b border-gray-50 hover:bg-orange-25 transition-all duration-200 hover:shadow-sm"
              >
                <td className="p-6 font-medium text-gray-900">{restaurant.restaurantName}</td>
                <td className="p-6 text-right text-gray-700 font-light">{formatCurrency(restaurant.totalOrderAmount)}</td>
                <td className="p-6 text-right text-gray-700 font-light">{formatCurrency(restaurant.totalCommission)}</td>
                <td className="p-6 text-right font-medium text-green-600">{formatCurrency(restaurant.totalNetRevenue)}</td>
                <td className="p-6 text-right text-gray-700 font-light">{restaurant.orderCount}</td>
                <td className="p-6 text-center">
                <Link
               
  to={`/admin/dashboard/restaurant-earnings-summary/${restaurant.restaurantId}`}
  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white text-sm font-medium rounded-2xl hover:bg-orange-600 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-30 hover:shadow-lg hover:-translate-y-0.5"
>
  <Eye className="w-4 h-4" />
  View Summary
</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="bg-orange-25 px-8 py-6 border-t border-orange-100 flex items-center justify-between">
          <div className="text-sm text-gray-600 font-medium tracking-wide">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalRestaurants)} of {totalRestaurants} restaurants
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-6 py-2 border border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium hover:shadow-sm"
            >
              Previous
            </button>
            <span className="px-6 py-2 text-sm text-gray-600 bg-white rounded-xl border border-gray-200 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-6 py-2 border border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium hover:shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantEarningsTable;