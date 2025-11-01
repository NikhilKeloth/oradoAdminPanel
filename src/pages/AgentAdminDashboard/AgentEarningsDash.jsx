import React, { useState, useEffect } from 'react';
import { 
  FaRupeeSign, FaWallet, FaCalendarDay, FaCalendarWeek, 
  FaCalendarAlt, FaHistory, FaArrowUp, FaMotorcycle, 
  FaMedal, FaMoneyBillWave, FaBolt, FaClipboardList,
  FaChevronLeft, FaChevronRight, FaExclamationTriangle
} from 'react-icons/fa';
import { Calendar, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAgentEarningsSummary } from '../../apis/adminApis/agentApi'; // Adjust path as needed
import { useParams } from 'react-router-dom';

const AgentEarningsDash = () => {
  const { agentId } = useParams();
  
  // State for API data
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date picker state
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7))
  });
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // Fetch earnings data
  const fetchEarningsData = async (from = null, to = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAgentEarningsSummary(agentId, from, to);
      console.log('Earnings Data:', response);
      setEarningsData(response);
    } catch (err) {
      console.error('Failed to fetch earnings data:', err);
      setError('Failed to load earnings data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchEarningsData();
  }, [agentId]);

  // Fetch data when date range changes
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchEarningsData(dateRange.from, dateRange.to);
    }
  }, [dateRange.from, dateRange.to]);

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Earnings cards data
  const earningsCards = [
    {
      title: "Today's Earnings",
      amount: earningsData?.summary?.today || 0,
      icon: FaCalendarDay,
      gradient: "from-orange-400 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      trend: "+12%",
      trendColor: "text-green-600"
    },
    {
      title: "This Week",
      amount: earningsData?.summary?.thisWeek || 0,
      icon: FaCalendarWeek,
      gradient: "from-blue-400 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: "+8%",
      trendColor: "text-green-600"
    },
    {
      title: "This Month",
      amount: earningsData?.summary?.thisMonth || 0,
      icon: FaCalendarAlt,
      gradient: "from-purple-400 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: "+15%",
      trendColor: "text-green-600"
    },
    {
      title: "Lifetime",
      amount: earningsData?.summary?.lifetime || 0,
      icon: FaHistory,
      gradient: "from-green-400 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trend: "+25%",
      trendColor: "text-green-600"
    }
  ];

  // Pagination calculations
  const tableData = earningsData?.detailed || [];
  const totalPages = Math.ceil(tableData.length / recordsPerPage);
  const currentRecords = tableData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // DatePicker component (same as before)
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
      <div className="absolute z-50 top-full left-0 mt-1 bg-white shadow-lg rounded-lg border border-gray-200 p-2 w-full max-w-[280px]">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronDown className="w-3 h-3 rotate-90" />
          </button>
          <span className="text-xs font-semibold text-gray-700">
            {months[currentMonth]} {currentYear}
          </span>
          <button 
            onClick={() => changeMonth(1)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronDown className="w-3 h-3 -rotate-90" />
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

  // Loading state
  if (loading && !earningsData) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 pt-6 pb-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 pt-6 pb-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchEarningsData()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 pt-6 pb-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-orange-600/10 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-blue-600/10 rounded-full transform -translate-x-12 translate-y-12"></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <FaWallet className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Earnings</h1>
                  <p className="text-gray-600 text-lg">Track Earnings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {earningsCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div
                key={index}
                className={`group relative bg-gradient-to-br ${card.bgGradient} rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 cursor-pointer border border-white/50 overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${card.iconBg} p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`${card.iconColor} text-lg`} />
                    </div>
                    <div className={`flex items-center space-x-1 ${card.trendColor} bg-white/80 px-2 py-1 rounded-full text-xs font-semibold`}>
                      <FaArrowUp className="text-xs" />
                      <span>{card.trend}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-gray-700 font-medium text-sm mb-3 group-hover:text-gray-800 transition-colors duration-300">
                    {card.title}
                  </h3>
                  
                  <div className="flex items-center space-x-1">
                    <FaRupeeSign className="text-gray-700 text-lg group-hover:text-gray-800 transition-colors duration-300" />
                    <span className="text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
                      {formatCurrency(card.amount)}
                    </span>
                  </div>
                  
                  <div className="mt-4 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${card.gradient} rounded-full transform translate-x-0 group-hover:translate-x-full transition-transform duration-1000`}
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Earnings Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">Earnings Breakdown</h2>
            
            {/* Date Range Picker */}
            <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <span className="text-gray-600 font-medium text-sm sm:text-base mr-2">From:</span>
                <input
                  type="text"
                  value={formatDate(dateRange.from)}
                  onClick={() => setShowDatePicker(showDatePicker === 'from' ? null : 'from')}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-full sm:w-32 cursor-pointer hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                  readOnly
                />
                {showDatePicker === 'from' && <DatePicker type="from" />}
              </div>
              <div className="relative w-full sm:w-auto">
                <span className="text-gray-600 font-medium text-sm sm:text-base mr-2">To:</span>
                <input
                  type="text"
                  value={formatDate(dateRange.to)}
                  onClick={() => setShowDatePicker(showDatePicker === 'to' ? null : 'to')}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-full sm:w-32 cursor-pointer hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                  readOnly
                />
                {showDatePicker === 'to' && <DatePicker type="to" />}
              </div>
            </div>
          </div>

          {/* Earnings Summary */}
          {earningsData?.breakdown && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FaMotorcycle className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Delivery Fee</p>
                    <p className="text-gray-800 font-semibold flex items-center">
                      <FaRupeeSign className="mr-1" />
                      {formatCurrency(earningsData.breakdown.deliveryFee)}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <FaMedal className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Incentives</p>
                    <p className="text-gray-800 font-semibold flex items-center">
                      <FaRupeeSign className="mr-1" />
                      {formatCurrency(earningsData.breakdown.incentives)}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <FaMoneyBillWave className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Tips Received</p>
                    <p className="text-gray-800 font-semibold flex items-center">
                      <FaRupeeSign className="mr-1" />
                      {formatCurrency(earningsData.breakdown.tips)}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <FaBolt className="text-yellow-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Surge Fee</p>
                    <p className="text-gray-800 font-semibold flex items-center">
                      <FaRupeeSign className="mr-1" />
                      {formatCurrency(earningsData.breakdown.surge)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Earnings */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 mb-8 flex justify-between items-center border border-orange-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <FaWallet className="text-orange-600 text-xl" />
                  </div>
                  <p className="text-gray-700 font-medium">Total Earnings</p>
                </div>
                <p className="text-orange-600 font-bold text-xl flex items-center">
                  <FaRupeeSign className="mr-1" />
                  {formatCurrency(earningsData.breakdown.total)}
                </p>
              </div>
            </>
          )}

          {/* Detailed Breakdown */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <FaClipboardList className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Detailed Breakdown</h3>
            </div>
            
            {tableData.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Fee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incentive</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surge</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentRecords.map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {row.orderId?._id || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <FaRupeeSign className="mr-1 text-xs" />
                              {formatCurrency(row.deliveryFee)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <FaRupeeSign className="mr-1 text-xs" />
                              {formatCurrency(row.tip)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <FaRupeeSign className="mr-1 text-xs" />
                              {formatCurrency(row.incentive)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <FaRupeeSign className="mr-1 text-xs" />
                              {formatCurrency(row.surge)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center">
                              <FaRupeeSign className="mr-1 text-xs" />
                              {formatCurrency(row.total)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(row.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, tableData.length)} of {tableData.length} entries
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}
                      >
                        <FaChevronLeft />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No earnings data available for the selected period.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentEarningsDash;