import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  Search, Filter, Calendar, User, ChevronRight, X,
  Check, ChevronLeft, Clock, CheckCircle, XCircle,
  Tag, Gift, DollarSign, TrendingUp, Download
} from 'lucide-react';

const AdminPromoCodeUsage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const recordsPerPage = 10;

  // Dummy promo usage data
  const [allPromoUsage, setAllPromoUsage] = useState([
    {
      id: 1,
      promoCode: 'SAVE50',
      userName: 'Rahul Sharma',
      orderId: '#ORD1293',
      discount: 50,
      dateUsed: '2024-07-22',
      status: 'used'
    },
    {
      id: 2,
      promoCode: 'FREEMEAL',
      userName: 'Priya Kumari',
      orderId: '#ORD1275',
      discount: 100,
      dateUsed: '2024-07-21',
      status: 'used'
    },
    {
      id: 3,
      promoCode: 'SAVE30',
      userName: 'Anil Kapoor',
      orderId: '#ORD1260',
      discount: 30,
      dateUsed: '2024-07-20',
      status: 'used'
    },
    {
      id: 4,
      promoCode: 'NEWUSER20',
      userName: '--',
      orderId: '--',
      discount: 0,
      dateUsed: null,
      status: 'expired'
    },
    {
      id: 5,
      promoCode: 'WEEKEND25',
      userName: 'Sunita Verma',
      orderId: '#ORD1301',
      discount: 25,
      dateUsed: '2024-07-23',
      status: 'used'
    },
    {
      id: 6,
      promoCode: 'FIRST100',
      userName: 'Amit Singh',
      orderId: '#ORD1302',
      discount: 100,
      dateUsed: '2024-07-23',
      status: 'used'
    },
    {
      id: 7,
      promoCode: 'LUNCH15',
      userName: '--',
      orderId: '--',
      discount: 0,
      dateUsed: null,
      status: 'expired'
    },
    {
      id: 8,
      promoCode: 'DINNER20',
      userName: 'Kavya Reddy',
      orderId: '#ORD1305',
      discount: 20,
      dateUsed: '2024-07-24',
      status: 'used'
    },
    {
      id: 9,
      promoCode: 'MONSOON40',
      userName: 'Rajesh Kumar',
      orderId: '#ORD1308',
      discount: 40,
      dateUsed: '2024-07-25',
      status: 'used'
    },
    {
      id: 10,
      promoCode: 'FAMILY75',
      userName: 'Deepika Jain',
      orderId: '#ORD1310',
      discount: 75,
      dateUsed: '2024-07-25',
      status: 'used'
    },
    {
      id: 11,
      promoCode: 'SAVE500',
      userName: 'Kamal Sharma',
      orderId: '#ORD1656',
      discount: 500,
      dateUsed: '2024-07-26',
      status: 'used'
    },
    {
      id: 12,
      promoCode: 'FREEGEEK',
      userName: 'Riiya Sumai',
      orderId: '#ORD2346',
      discount: 150,
      dateUsed: '2024-07-26',
      status: 'used'
    }
  ]);

  const handleFilterChange = () => setCurrentPage(1);

  // Filtering
  const filtered = allPromoUsage.filter(promo => {
    const matchSearch = searchText === '' ||
      promo.promoCode.toLowerCase().includes(searchText.toLowerCase()) ||
      promo.userName.toLowerCase().includes(searchText.toLowerCase()) ||
      promo.orderId.toLowerCase().includes(searchText.toLowerCase());
    
    const matchStatus = selectedStatus === 'all' || promo.status === selectedStatus;
    
    let matchDate = true;
    if (fromDate && toDate && promo.dateUsed) {
      const usageDate = new Date(promo.dateUsed);
      matchDate = usageDate >= fromDate && usageDate <= toDate;
    }
    
    return matchSearch && matchStatus && matchDate;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / recordsPerPage);
  const start = (currentPage - 1) * recordsPerPage;
  const current = filtered.slice(start, start + recordsPerPage);

  useEffect(handleFilterChange, [searchText, selectedStatus, fromDate, toDate]);

  // Calculate stats
  const totalUsage = allPromoUsage.filter(p => p.status === 'used').length;
  const totalDiscount = allPromoUsage
    .filter(p => p.status === 'used')
    .reduce((sum, p) => sum + p.discount, 0);

  // Status badge
  const statusBadge = status => {
    const cfg = {
      used: { icon: CheckCircle, bg: 'bg-emerald-100', fg: 'text-emerald-800', label: 'Used' },
      expired: { icon: XCircle, bg: 'bg-rose-100', fg: 'text-rose-800', label: 'Expired' },
    }[status];
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.fg}`}>
        <Icon size={12} className="mr-1" />{cfg.label}
      </span>
    );
  };

  const promoCodeBadge = code => (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-700">
      <Tag size={12} className="mr-1" />{code}
    </span>
  );

  return (
    <>
      {/* Same calendar styles as AgentLeave component */}
      <style>
        {`
          /* Professional mobile calendar sizing */
          @media (max-width: 640px) {
            .react-datepicker {
              font-size: 0.875rem !important;
              transform: scale(0.9) !important;
              transform-origin: top center !important;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
            }
            
            .react-datepicker__header {
              padding: 8px !important;
              background: #f97316 !important;
              color: white !important;
            }
            
            .react-datepicker__day {
              width: 2rem !important;
              height: 2rem !important;
              line-height: 2rem !important;
              margin: 0.166rem !important;
              font-size: 0.875rem !important;
            }
            
            .react-datepicker__month-container {
              width: auto !important;
            }
            
            .react-datepicker__current-month {
              font-size: 1rem !important;
              font-weight: 600 !important;
            }
            
            .react-datepicker__day-name {
              width: 2rem !important;
              font-size: 0.75rem !important;
              font-weight: 600 !important;
              color: white !important;
            }
            
            .react-datepicker__navigation {
              top: 12px !important;
            }
          }
          
          /* Simplified calendar positioning - CENTERED */
          .react-datepicker-popper {
            z-index: 1000 !important;
          }
          
          .react-datepicker-popper[data-placement^="bottom"] {
            margin-top: 10px !important;
          }
          
          /* For smaller mobile screens */
          @media (max-width: 480px) {
            .react-datepicker {
              transform: scale(0.85) !important;
              transform-origin: top center !important;
            }
            
            .react-datepicker__day {
              width: 1.8rem !important;
              height: 1.8rem !important;
              line-height: 1.8rem !important;
            }
            
            .react-datepicker__day-name {
              width: 1.8rem !important;
            }
          }
          
          /* For very small screens */
          @media (max-width: 375px) {
            .react-datepicker {
              transform: scale(0.8) !important;
              transform-origin: top center !important;
            }
          }
          
          /* Enhanced orange theme */
          .react-datepicker__day--selected {
            background-color: #f97316 !important;
            color: white !important;
            font-weight: 600 !important;
          }
          
          .react-datepicker__day--keyboard-selected {
            background-color: #fb923c !important;
            color: white !important;
          }
          
          .react-datepicker__day:hover {
            background-color: #fed7aa !important;
            color: #9a3412 !important;
          }
          
          .react-datepicker__day--today {
            background-color: #ffedd5 !important;
            color: #ea580c !important;
            font-weight: 600 !important;
          }
          
          /* Better touch targets */
          @media (max-width: 640px) {
            .react-datepicker__day {
              border-radius: 6px !important;
              cursor: pointer !important;
            }
            
            .react-datepicker__navigation {
              width: 44px !important;
              height: 44px !important;
              border-radius: 8px !important;
            }
          }
        `}
      </style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
        {/* Header */}
        <div className="bg-white shadow-lg border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Gift size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Promo Code Usage</h1>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base font-medium">Track and monitor promo code usage statistics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-orange-100">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Usage</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalUsage}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-orange-100">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Discount Given</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{totalDiscount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-orange-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search - Full width on mobile */}
              <div className="sm:col-span-1">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search promo/user/order..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* From Date - Half width on mobile */}
              <div className="w-1/2 sm:w-auto">
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <DatePicker
                    selected={fromDate}
                    onChange={(date) => setFromDate(date)}
                    placeholderText="From Date"
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                    dateFormat="dd/MM/yyyy"
                    isClearable
                    popperPlacement="bottom"
                  />
                </div>
              </div>

              {/* To Date - Half width on mobile */}
              <div className="w-1/2 sm:w-auto">
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <DatePicker
                    selected={toDate}
                    onChange={(date) => setToDate(date)}
                    placeholderText="To Date"
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                    dateFormat="dd/MM/yyyy"
                    isClearable
                    popperPlacement="bottom"
                  />
                </div>
              </div>

              {/* Status - Half width on mobile */}
              <div className="w-1/2 sm:w-auto">
                <div className="relative">
                  <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-8 py-2 sm:py-2.5 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base bg-white appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="used">Used</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="mt-4 flex justify-end">
              <button className="px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center shadow-md">
                <Download size={14} className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-100">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-orange-50">
                  <tr>
                    <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Promo Code</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">User Name</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Order ID</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Discount</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Date Used</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {current.length ? current.map(promo => (
                    <tr key={promo.id} className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-all duration-200 hover:shadow-sm border-b border-gray-100 last:border-b-0">
                      <td className="px-3 sm:px-4 md:px-6 py-3 align-top">
                        {promoCodeBadge(promo.promoCode)}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 align-top">
                        {promo.userName !== '--' ? (
                          <div className="flex items-start">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                              <User size={14} className="text-white" />
                            </div>
                            <div className="ml-2 sm:ml-3 min-w-0">
                              <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{promo.userName}</div>
                              <div className="text-xs text-gray-600">Customer</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs sm:text-sm">--</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 align-top">
                        {promo.orderId !== '--' ? (
                          <span className="text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                            {promo.orderId}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs sm:text-sm">--</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 align-top">
                        {promo.discount > 0 ? (
                          <span className="text-xs sm:text-sm font-bold text-green-600">
                            ₹{promo.discount}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs sm:text-sm">₹0</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 align-top">
                        {promo.dateUsed ? (
                          <div className="text-xs sm:text-sm font-medium text-gray-800">
                            {new Date(promo.dateUsed).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: '2-digit'
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs sm:text-sm">--</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 align-top">
                        {statusBadge(promo.status)}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Gift size={48} className="text-gray-300 mb-4" />
                          <p className="text-lg font-medium">No promo usage found</p>
                          <p className="text-sm">Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gradient-to-r from-gray-50 to-orange-50 px-4 sm:px-6 py-4 border-t border-orange-100">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                  <div className="text-gray-800 font-medium text-xs sm:text-sm">
                    Showing <span className="text-orange-600 font-bold">{start + 1}</span> to{' '}
                    <span className="text-orange-600 font-bold">{Math.min(start + recordsPerPage, filtered.length)}</span> of{' '}
                    <span className="text-orange-600 font-bold">{filtered.length}</span> results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(p => p - 1)}
                      disabled={currentPage === 1}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center transition-all duration-200 ${currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg'
                        }`}
                    >
                      <ChevronLeft size={14} className="mr-0.5 sm:mr-1" />
                      Prev
                    </button>

                    <div className="hidden sm:flex items-center space-x-1">
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${currentPage === index + 1
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-orange-100 hover:text-orange-600 border border-gray-200'
                            }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>

                    <div className="sm:hidden text-xs font-semibold text-gray-700">
                      Page {currentPage} of {totalPages}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center transition-all duration-200 ${currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg'
                        }`}
                    >
                      Next
                      <ChevronRight size={14} className="ml-0.5 sm:ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPromoCodeUsage;
