import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { AlarmClock } from 'lucide-react';

const RestaurantsPrepDelay = () => {
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurant, setRestaurant] = useState('All');
  const [delayFilter, setDelayFilter] = useState('All');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Date picker state
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date()
  });
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // DatePicker component (same as previous)
  const DatePicker = ({ type }) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const generateCalendar = (month, year) => {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
      const days = [];
      
      for (let i = 0; i < firstDay; i++) {
        days.push(null);
      }
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
      }
      return days;
    };

    const days = generateCalendar(currentMonth, currentYear);

    const handleDateClick = (day) => {
      if (day) {
        const selectedDate = new Date(currentYear, currentMonth, day);
        if (type === 'from') {
          setDateRange({...dateRange, from: selectedDate});
        } else {
          setDateRange({...dateRange, to: selectedDate});
        }
        setShowDatePicker(null);
      }
    };

    const changeMonth = (increment) => {
      let newMonth = currentMonth + increment;
      let newYear = currentYear;
      
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
    };

    const isSelected = (day) => {
      if (!day) return false;
      const date = new Date(currentYear, currentMonth, day);
      if (type === 'from') {
        return date.getTime() === dateRange.from.getTime();
      } else {
        return date.getTime() === dateRange.to.getTime();
      }
    };

    const isInRange = (day) => {
      if (!day) return false;
      const date = new Date(currentYear, currentMonth, day);
      return date >= dateRange.from && date <= dateRange.to;
    };

    return (
      <div className="absolute z-50 top-full left-0 mt-1 bg-white shadow-lg rounded-lg border border-gray-200 p-2 w-full max-w-[280px] sm:w-[280px]">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-gray-700">
            {months[currentMonth]} {currentYear}
          </span>
          <button 
            onClick={() => changeMonth(1)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-[10px] font-medium text-gray-500 p-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDateClick(day)}
              className={`text-center text-xs p-1 cursor-pointer rounded transition-all duration-200 ${
                isSelected(day) ? 'bg-orange-500 text-white font-semibold' : 
                isInRange(day) ? 'bg-orange-100 text-orange-600' :
                day ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300'
              }`}
            >
              {day || ''}
            </div>
          ))}
        </div>
        <button 
          onClick={() => setShowDatePicker(null)}
          className="mt-2 w-full py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
        >
          Close
        </button>
      </div>
    );
  };

  // Dummy data
  const dummyData = [
    { id: 1, orderId: 'ORD1234', restaurant: 'Pizza World', orderTime: new Date(2023, 5, 15, 12, 20), expectedTime: 20, actualTime: 35, delayReason: 'High order volume' },
    { id: 2, orderId: 'ORD1235', restaurant: 'McBurger', orderTime: new Date(2023, 5, 15, 13, 10), expectedTime: 25, actualTime: 22, delayReason: '' },
    { id: 3, orderId: 'ORD1236', restaurant: 'Sushi House', orderTime: new Date(2023, 5, 15, 13, 45), expectedTime: 30, actualTime: 45, delayReason: 'Staff shortage' },
    { id: 4, orderId: 'ORD1237', restaurant: 'Curry Express', orderTime: new Date(2023, 5, 15, 14, 30), expectedTime: 20, actualTime: 20, delayReason: '' },
    { id: 5, orderId: 'ORD1238', restaurant: 'Tandoori Hub', orderTime: new Date(2023, 5, 15, 15, 0), expectedTime: 25, actualTime: 33, delayReason: 'Ingredient shortage' },
    { id: 6, orderId: 'ORD1239', restaurant: 'Pizza World', orderTime: new Date(2023, 5, 15, 15, 30), expectedTime: 20, actualTime: 45, delayReason: 'Equipment failure' },
    { id: 7, orderId: 'ORD1240', restaurant: 'McBurger', orderTime: new Date(2023, 5, 15, 16, 15), expectedTime: 25, actualTime: 25, delayReason: '' },
    { id: 8, orderId: 'ORD1241', restaurant: 'Sushi House', orderTime: new Date(2023, 5, 15, 17, 0), expectedTime: 30, actualTime: 42, delayReason: 'Complex order' },
    { id: 9, orderId: 'ORD1242', restaurant: 'Curry Express', orderTime: new Date(2023, 5, 15, 17, 45), expectedTime: 20, actualTime: 18, delayReason: '' },
    { id: 10, orderId: 'ORD1243', restaurant: 'Tandoori Hub', orderTime: new Date(2023, 5, 15, 18, 30), expectedTime: 25, actualTime: 40, delayReason: 'Delivery delay' },
    { id: 11, orderId: 'ORD1244', restaurant: 'Pizza World', orderTime: new Date(2023, 5, 15, 19, 15), expectedTime: 20, actualTime: 22, delayReason: '' },
    { id: 12, orderId: 'ORD1245', restaurant: 'McBurger', orderTime: new Date(2023, 5, 15, 20, 0), expectedTime: 25, actualTime: 30, delayReason: 'Rush hour' },
  ];

  // Calculate delay and status for each order
  const processedData = dummyData.map(order => {
    const delay = order.actualTime - order.expectedTime;
    let status = '';
    if (delay <= 0) {
      status = 'On-time';
    } else if (delay <= 5) {
      status = 'Warning';
    } else {
      status = 'Delayed';
    }
    return { ...order, delay, status };
  });

  // Filter data based on search and filters
  const filteredData = processedData.filter(order => {
    const matchesSearch = 
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.restaurant.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRestaurant = restaurant === 'All' || order.restaurant === restaurant;
    
    const matchesDelayFilter = 
      delayFilter === 'All' || 
      (delayFilter === 'Delayed' && order.status === 'Delayed') ||
      (delayFilter === 'Warning' && order.status === 'Warning') ||
      (delayFilter === 'On-time' && order.status === 'On-time');
    
    return matchesSearch && matchesRestaurant && matchesDelayFilter;
  });

  // Calculate summary stats
  const totalOrders = filteredData.length;
  const delayedOrders = filteredData.filter(o => o.status === 'Delayed').length;
  const avgDelay = filteredData.reduce((sum, order) => sum + (order.delay > 0 ? order.delay : 0), 0) / 
                  (filteredData.filter(o => o.delay > 0).length || 1);
  
  // Find worst performer
  const restaurantDelays = filteredData.reduce((acc, order) => {
    if (!acc[order.restaurant]) {
      acc[order.restaurant] = { total: 0, count: 0 };
    }
    if (order.delay > 0) {
      acc[order.restaurant].total += order.delay;
      acc[order.restaurant].count++;
    }
    return acc;
  }, {});

  let worstPerformer = 'None';
  let worstAvgDelay = 0;
  for (const [restaurant, data] of Object.entries(restaurantDelays)) {
    const avg = data.total / data.count;
    if (avg > worstAvgDelay) {
      worstPerformer = restaurant;
      worstAvgDelay = avg;
    }
  }

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Delayed': return 'bg-red-100 text-red-800';
      case 'Warning': return 'bg-yellow-100 text-yellow-800';
      case 'On-time': return 'bg-green-100 text-green-800';
      default: return '';
    }
  };

  // Status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Delayed': return '🔴';
      case 'Warning': return '🟡';
      case 'On-time': return '🟢';
      default: return '';
    }
  };

  return (
    <div className="bg-orange-50 min-h-screen p-4 md:p-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-6xl mx-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-orange-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
  <h1 className="text-4xl font-bold text-white flex items-center gap-2">
    <span className="text-white">
      <AlarmClock className="
      mt-2
      w-6 h-6 md:w-7 md:h-7 lg:w-10 lg:h-10 
      text-white 
      stroke-[1.5] 
      transition-all duration-300
      hover:scale-110 hover:text-orange-200" /> {/* Responsive icon sizing */}
    </span>
    Restaurant Preparation Delay Report
  </h1>
  <p className="text-sm text-white mt-1 ml-3 md:ml-12"> {/* Added responsive margin */}
    Monitor and analyze restaurant preparation times and delays
  </p>
</div>
            {/* <div className="bg-orange-50 px-3 py-2 rounded-lg border border-orange-100 text-sm text-orange-700 flex items-center gap-2">
              <i className="fas fa-info-circle"></i>
              <span>Total delayed orders: {dummyData.filter(d => d.status === 'Delayed').length}</span>
            </div> */}
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-orange-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Start Date */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm cursor-pointer"
                  value={formatDate(dateRange.from)}
                  onClick={() => setShowDatePicker(showDatePicker === 'from' ? null : 'from')}
                  readOnly
                />
                <i className="fas fa-calendar-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                {showDatePicker === 'from' && <DatePicker type="from" />}
              </div>
            </div>

            {/* End Date */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm cursor-pointer"
                  value={formatDate(dateRange.to)}
                  onClick={() => setShowDatePicker(showDatePicker === 'to' ? null : 'to')}
                  readOnly
                />
                <i className="fas fa-calendar-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                {showDatePicker === 'to' && <DatePicker type="to" />}
              </div>
            </div>

           {/* Restaurant Dropdown */}
<div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant</label>
  <select
    className="w-[150px] md:w-[200px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')] bg-no-repeat bg-right-2 bg-center bg-[length:15px_15px]"
    value={restaurant}
    onChange={(e) => setRestaurant(e.target.value)}
  >
    <option value="All">All</option>
    <option value="Pizza World">Pizza World</option>
    <option value="McBurger">McBurger</option>
    <option value="Sushi House">Sushi House</option>
    <option value="Curry Express">Curry Express</option>
    <option value="Tandoori Hub">Tandoori Hub</option>
  </select>
</div>

{/* Delay Filter Dropdown */}
<div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
  <select
    className="w-[150px] md:w-[200px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')] bg-no-repeat bg-right-2 bg-center bg-[length:15px_15px]"
    value={delayFilter}
    onChange={(e) => setDelayFilter(e.target.value)}
  >
    <option value="All">All</option>
    <option value="Delayed">Delayed</option>
    <option value="Warning">Warning</option>
    <option value="On-time">On-time</option>
  </select>
</div>

            {/* Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Order ID</label>
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Order ID"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Restaurant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Order Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Expected</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actual</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Delay</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Delay Reason</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRecords.map((order) => (
                <tr key={order.id} className="hover:bg-orange-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      #{order.orderId}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{order.restaurant}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(order.orderTime)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.expectedTime} min</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.actualTime} min</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {order.delay > 0 ? `+${order.delay}m` : order.delay < 0 ? `${order.delay}m` : '0m'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.delayReason || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-all shadow-sm hover:shadow-md">
                      <span>View</span> <i className="fas fa-external-link-alt text-xs"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Orders</h3>
              <p className="text-2xl font-semibold text-gray-900">{totalOrders}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Delayed Orders</h3>
              <p className="text-2xl font-semibold text-red-600">{delayedOrders}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Avg Delay Time</h3>
              <p className="text-2xl font-semibold text-gray-900">{avgDelay.toFixed(1)} min</p>
            </div>
          </div>
          {worstPerformer !== 'None' && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Worst Performer</h3>
              <p className="text-lg font-semibold text-gray-900">
                {worstPerformer} (+{worstAvgDelay.toFixed(1)} min avg delay)
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions and Pagination */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button className="bg-orange-500 hover:bg-red-600 border border-gray-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md text-sm">
                <i className="fas fa-download"></i> Export CSV
              </button>
              <button className="border border-gray-300 hover:bg-blue-600 text-black hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md text-sm">
                <i className="fas fa-chart-bar"></i> View Charts
              </button>
              <button className="border border-gray-300 hover:bg-green-600 text-black hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md text-sm">
                <i className="fas fa-list-alt"></i> Delay Reason Breakdown
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredData.length)} of {filteredData.length} entries
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md text-sm ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'} transition-all`}
                >
                  <i className="fas fa-chevron-left">Previous</i>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded-md text-sm ${currentPage === number ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} transition-all`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'} transition-all`}
                >
                  <i className="fas fa-chevron-right">Next</i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantsPrepDelay;