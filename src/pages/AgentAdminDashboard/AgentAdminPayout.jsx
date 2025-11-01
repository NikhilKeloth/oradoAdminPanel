import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiDownload, FiCalendar, FiExternalLink, FiRefreshCw, FiArrowRight, FiFilter, FiSearch } from 'react-icons/fi';
import { FaRupeeSign, FaInfoCircle } from 'react-icons/fa';
import { getAgentPayouts, exportAgentPayoutsToExcel } from '../../apis/adminApis/agentApi';

const AgentAdminPayout = () => {
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [period, setPeriod] = useState('daily');
  const [showTips, setShowTips] = useState(true);
  const [showSurge, setShowSurge] = useState(true);
  
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

  // Data
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch payouts with custom range support
  const fetchPayouts = async () => {
    setLoading(true);
    try {
      let fromDate = null;
      let toDate = null;

      // Only pass dates for custom range
      if (period === 'custom') {
        fromDate = dateRange.from;
        toDate = dateRange.to;
      }

      const data = await getAgentPayouts(period, fromDate, toDate);
      console.log('API Response:', data);
      setPayouts(data.payouts || []);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching agent payouts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when period changes
  useEffect(() => {
    fetchPayouts();
  }, [period]);

  // Handle custom date range changes
  useEffect(() => {
    if (period === 'custom') {
      const timer = setTimeout(() => {
        fetchPayouts();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dateRange.from, dateRange.to]);

  // Excel Export Function
  const handleExportToExcel = async () => {
    if (payouts.length === 0) {
      alert('No data available to export.');
      return;
    }

    setExportLoading(true);
    try {
      let fromDate = null;
      let toDate = null;

      // Only pass dates for custom range
      if (period === 'custom') {
        fromDate = dateRange.from;
        toDate = dateRange.to;
      }

      const blob = await exportAgentPayoutsToExcel(period, fromDate, toDate);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename based on period and dates
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      let filename = `Agent_Payouts_${period.charAt(0).toUpperCase() + period.slice(1)}_${timestamp}.xlsx`;
      
      if (period === 'custom' && fromDate && toDate) {
        const fromStr = fromDate.toISOString().split('T')[0].replace(/-/g, '');
        const toStr = toDate.toISOString().split('T')[0].replace(/-/g, '');
        filename = `Agent_Payouts_Custom_${fromStr}_to_${toStr}.xlsx`;
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      alert('Failed to export to Excel. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0).replace('₹', '₹ ');
  };

  // Enhanced DatePicker Component
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
          setDateRange(prev => ({...prev, from: selectedDate}));
        } else {
          setDateRange(prev => ({...prev, to: selectedDate}));
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

    const isDisabled = (day) => {
      if (!day) return false;
      const date = new Date(currentYear, currentMonth, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date > today;
    };

    return (
      <div className="absolute z-50 top-full left-0 mt-1 bg-white shadow-lg rounded-lg border border-gray-200 p-4 w-full max-w-[280px] sm:w-[280px]">
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {months[currentMonth]} {currentYear}
          </span>
          <button 
            onClick={() => changeMonth(1)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              disabled={isDisabled(day)}
              className={`text-center text-sm p-2 rounded transition-all duration-200 ${
                isSelected(day) 
                  ? 'bg-orange-500 text-white font-semibold' 
                  : isInRange(day) 
                  ? 'bg-orange-100 text-orange-600' 
                  : isDisabled(day)
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {day || ''}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button 
            onClick={() => {
              const today = new Date();
              if (type === 'from') {
                setDateRange(prev => ({...prev, from: today}));
              } else {
                setDateRange(prev => ({...prev, to: today}));
              }
            }}
            className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
          >
            Today
          </button>
          <button 
            onClick={() => setShowDatePicker(null)}
            className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-medium transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    );
  };

  // Filter data based on search and filters
  const filteredData = payouts.filter(agent => {
    const matchesSearch = 
      agent.agentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.agentId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = status === 'All' || agent.status === status;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate totals for summary
  const totals = {
    earnings: filteredData.reduce((sum, agent) => sum + (agent.totalBaseEarnings || 0), 0),
    tips: filteredData.reduce((sum, agent) => sum + (agent.totalTips || 0), 0),
    surge: filteredData.reduce((sum, agent) => sum + (agent.totalSurge || 0), 0),
    dailyIncentive: filteredData.reduce((sum, agent) => sum + (agent.dailyIncentive || 0), 0),
    weeklyIncentive: filteredData.reduce((sum, agent) => sum + (agent.weeklyIncentive || 0), 0),
    monthlyIncentive: filteredData.reduce((sum, agent) => sum + (agent.monthlyIncentive || 0), 0),
    pending: filteredData.filter(agent => agent.status === 'pending').reduce((sum, agent) => 
      sum + (agent.totalBaseEarnings || 0) + (agent.totalTips || 0) + (agent.totalSurge || 0) + 
      (agent.dailyIncentive || 0) + (agent.weeklyIncentive || 0) + (agent.monthlyIncentive || 0), 0)
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Status badge color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Action button
  const getActionButton = (status) => {
    const statusLower = status?.toLowerCase();
    switch(statusLower) {
      case 'pending': 
        return (
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-all shadow-sm hover:shadow-md">
            <span>Pay</span> <FiArrowRight className="text-xs" />
          </button>
        );
      case 'paid':
        return (
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-all shadow-sm hover:shadow-md">
            <span>View</span> <FiExternalLink className="text-xs" />
          </button>
        );
      case 'failed':
        return (
          <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-all shadow-sm hover:shadow-md">
            <span>Retry</span> <FiRefreshCw className="text-xs" />
          </button>
        );
      default:
        return (
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-all shadow-sm hover:shadow-md">
            <span>Pay</span> <FiArrowRight className="text-xs" />
          </button>
        );
    }
  };

  // Calculate total payout for each agent
  const calculateTotalPayout = (agent) => {
    return (agent.totalBaseEarnings || 0) + 
           (showTips ? (agent.totalTips || 0) : 0) + 
           (showSurge ? (agent.totalSurge || 0) : 0) + 
           (agent.dailyIncentive || 0) + 
           (agent.weeklyIncentive || 0) +
           (agent.monthlyIncentive || 0);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-6xl mx-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <FaRupeeSign className="text-white" />
                <span>Agent Payout Management</span>
              </h1>
              <p className="text-sm text-orange-100 mt-1">Admin panel for managing agent payouts and settlements</p>
            </div>
            <div className="bg-orange-100/20 px-3 py-2 rounded-lg border border-orange-200/50 text-sm text-white flex items-center gap-2">
              <FaInfoCircle />
              <span>Pending payouts: {formatCurrency(totals.pending)}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            {/* Period Selector */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom Range</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            {/* Status Selector */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            {/* Toggle switches */}
            <div className="flex items-center gap-4 ml-auto">
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={showTips}
                  onChange={() => setShowTips(!showTips)}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                <span className="ms-3 text-sm font-medium text-gray-700">Show Tips</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={showSurge}
                  onChange={() => setShowSurge(!showSurge)}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                <span className="ms-3 text-sm font-medium text-gray-700">Show Surge</span>
              </label>
            </div>
          </div>

          {/* Search and Date Range */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by Agent Name or ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Date Range (only shown when Custom is selected) */}
            {period === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiCalendar className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm cursor-pointer bg-white"
                    value={formatDate(dateRange.from)}
                    onClick={() => setShowDatePicker(showDatePicker === 'from' ? null : 'from')}
                    readOnly
                    placeholder="From date"
                  />
                  {showDatePicker === 'from' && <DatePicker type="from" />}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiCalendar className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm cursor-pointer bg-white"
                    value={formatDate(dateRange.to)}
                    onClick={() => setShowDatePicker(showDatePicker === 'to' ? null : 'to')}
                    readOnly
                    placeholder="To date"
                  />
                  {showDatePicker === 'to' && <DatePicker type="to" />}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white border-b">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-800">Total Agents</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{filteredData.length}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <FaRupeeSign className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-green-800">Total Earnings</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(totals.earnings)}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <FaRupeeSign className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-orange-800">Total Incentives</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{formatCurrency(totals.dailyIncentive + totals.weeklyIncentive + totals.monthlyIncentive)}</p>
              </div>
              <div className="bg-orange-100 p-2 rounded-full">
                <FaRupeeSign className="text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-purple-800">Total Payout</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {formatCurrency(totals.earnings + totals.tips + totals.surge + totals.dailyIncentive + totals.weeklyIncentive + totals.monthlyIncentive)}
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <FaRupeeSign className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                {showTips && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tips</th>}
                {showSurge && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surge</th>}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Inc.</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weekly Inc.</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Inc.</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payout</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="11" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      <span className="ml-2">Loading payouts...</span>
                    </div>
                  </td>
                </tr>
              ) : currentRecords.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                    No payouts found
                  </td>
                </tr>
              ) : (
                currentRecords.map((agent) => (
                  <tr key={agent.agentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium">
                          {agent.agentName?.charAt(0) || 'A'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{agent.agentName || 'Unknown Agent'}</div>
                          <div className="text-sm text-gray-500">{agent.agentId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{agent.totalOrders || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(agent.totalBaseEarnings)}</div>
                    </td>
                    {showTips && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(agent.totalTips)}</div>
                      </td>
                    )}
                    {showSurge && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(agent.totalSurge)}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(agent.dailyIncentive)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(agent.weeklyIncentive)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(agent.monthlyIncentive)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(calculateTotalPayout(agent))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                        {formatStatus(agent.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {getActionButton(agent.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Actions and Pagination */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Export to Excel Button */}
              <button 
                onClick={handleExportToExcel}
                disabled={exportLoading || payouts.length === 0}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exportLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <FiDownload /> Export to Excel
                  </>
                )}
              </button>
            
              <button 
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md text-sm"
                onClick={fetchPayouts}
              >
                <FiRefreshCw /> Refresh Data
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredData.length)} of {filteredData.length} agents
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md text-sm ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'} transition-all`}
                >
                  <FiChevronLeft className="inline" /> Previous
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
                  Next <FiChevronRight className="inline" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentAdminPayout;