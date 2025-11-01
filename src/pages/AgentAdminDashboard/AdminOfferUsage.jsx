import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  Search, 
  Filter, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Eye,
  Percent,
  DollarSign,
  TrendingUp

} from 'lucide-react';
const AdminOfferUsage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const recordsPerPage = 10;

  // Updated offer usage data with description and multiple merchants
  const [allOfferUsage, setAllOfferUsage] = useState([
    {
      id: 1,
      offerTitle: 'Flat ₹100 Off',
      offerDescription: 'Get flat ₹100 discount on orders above ₹300',
      merchants: ["Domino's Pizza", "Pizza Hut", "Burger King"],
      usageCount: 125,
      totalDiscount: 12500,
      firstUsed: '2025-07-01',
      lastUsed: '2025-07-25'
    },
    {
      id: 2,
      offerTitle: 'Buy 1 Get 50% Off',
      offerDescription: 'Buy one item and get 50% off on second item',
      merchants: ['KFC', 'McDonald\'s', 'Subway'],
      usageCount: 87,
      totalDiscount: 6350,
      firstUsed: '2025-06-15',
      lastUsed: '2025-07-22'
    },
    {
      id: 3,
      offerTitle: 'Summer Special 25% Off',
      offerDescription: 'Summer special discount on all menu items',
      merchants: ['Pizza Hut', 'Swiggy', 'Zomato'],
      usageCount: 42,
      totalDiscount: 3150,
      firstUsed: '2025-06-01',
      lastUsed: '2025-07-20'
    },
    {
      id: 4,
      offerTitle: 'Free Delivery',
      offerDescription: 'No delivery charges on orders above ₹199',
      merchants: ['Swiggy', 'Zomato', 'Uber Eats'],
      usageCount: 210,
      totalDiscount: 10500,
      firstUsed: '2025-05-10',
      lastUsed: '2025-07-24'
    },
    {
      id: 5,
      offerTitle: 'Weekend 50% Off',
      offerDescription: '50% discount on all orders placed on weekends',
      merchants: ['Zomato', 'Faasos', 'Box8'],
      usageCount: 78,
      totalDiscount: 7800,
      firstUsed: '2025-06-05',
      lastUsed: '2025-07-21'
    },
    {
      id: 6,
      offerTitle: '10% Off First Order',
      offerDescription: 'Special discount for first time customers',
      merchants: ['Uber Eats', 'Swiggy', 'Zomato'],
      usageCount: 156,
      totalDiscount: 4680,
      firstUsed: '2025-05-15',
      lastUsed: '2025-07-23'
    },
    {
      id: 7,
      offerTitle: 'Combo Meal ₹99',
      offerDescription: 'Special combo meal at just ₹99',
      merchants: ['McDonald\'s', 'KFC', 'Burger King'],
      usageCount: 93,
      totalDiscount: 4650,
      firstUsed: '2025-06-20',
      lastUsed: '2025-07-22'
    },
    {
      id: 8,
      offerTitle: 'Family Pack ₹200 Off',
      offerDescription: 'Discount on family meal packs',
      merchants: ['Burger King', 'KFC', 'Pizza Hut'],
      usageCount: 37,
      totalDiscount: 7400,
      firstUsed: '2025-07-01',
      lastUsed: '2025-07-25'
    },
    {
      id: 9,
      offerTitle: '30% Off Lunch Orders',
      offerDescription: 'Discount on orders placed between 12pm-3pm',
      merchants: ['Faasos', 'Box8', 'Swiggy'],
      usageCount: 64,
      totalDiscount: 3840,
      firstUsed: '2025-06-10',
      lastUsed: '2025-07-24'
    },
    {
      id: 10,
      offerTitle: '40% Off Dinner Orders',
      offerDescription: 'Discount on orders placed between 7pm-11pm',
      merchants: ['Box8', 'Faasos', 'Zomato'],
      usageCount: 52,
      totalDiscount: 4160,
      firstUsed: '2025-06-15',
      lastUsed: '2025-07-23'
    }
  ]);

  const handleFilterChange = () => setCurrentPage(1);

  // Filtering
  const filtered = allOfferUsage.filter(offer => {
    const matchSearch = searchText === '' ||
      offer.offerTitle.toLowerCase().includes(searchText.toLowerCase()) ||
      offer.offerDescription.toLowerCase().includes(searchText.toLowerCase()) ||
      offer.merchants.some(merchant => merchant.toLowerCase().includes(searchText.toLowerCase()));
    
    let matchDate = true;
    if (fromDate && toDate) {
      const firstUsedDate = new Date(offer.firstUsed);
      const lastUsedDate = new Date(offer.lastUsed);
      matchDate = (firstUsedDate >= fromDate && firstUsedDate <= toDate) || 
                 (lastUsedDate >= fromDate && lastUsedDate <= toDate);
    }
    
    return matchSearch && matchDate;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / recordsPerPage);
  const start = (currentPage - 1) * recordsPerPage;
  const current = filtered.slice(start, start + recordsPerPage);

  useEffect(handleFilterChange, [searchText, fromDate, toDate]);

  // Calculate stats
  const totalOffersUsed = allOfferUsage.reduce((sum, o) => sum + o.usageCount, 0);
  const totalDiscount = allOfferUsage.reduce((sum, o) => sum + o.totalDiscount, 0);

  return (
    <>
      {/* Calendar styles remain the same */}
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
                <Percent size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Offer Usage</h1>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base font-medium">Track and monitor offer usage statistics</p>
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
                  <Percent size={20} className="text-white" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Offers Used</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalOffersUsed.toLocaleString()}</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search - Full width on mobile */}
              <div className="sm:col-span-1">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search offer title/description/merchant..."
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
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-100 to-orange-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Offer Title</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Merchants</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-800 uppercase tracking-wider">Usage Count</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-800 uppercase tracking-wider">Total Discount</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">First Used</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Last Used</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {current.length ? current.map((offer, index) => (
                    <tr 
                      key={offer.id} 
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-orange-50 transition-colors duration-150`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {start + index + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-orange-600">
                        {offer.offerTitle}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                        {offer.offerDescription}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex flex-col space-y-1">
                          {offer.merchants.map((merchant, i) => (
                            <span key={i} className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs">
                              {merchant}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                        {offer.usageCount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600 text-right">
                        ₹{offer.totalDiscount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                        {offer.firstUsed}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                        {offer.lastUsed}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-center">
                        <button className="px-3 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-semibold hover:bg-orange-200 transition-colors duration-200 flex items-center mx-auto">
                          <Eye size={14} className="mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Percent size={48} className="text-gray-300 mb-4" />
                          <p className="text-lg font-medium">No offer usage found</p>
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

export default AdminOfferUsage;