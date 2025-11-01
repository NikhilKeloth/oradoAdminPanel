import React, { useState } from 'react';

const CommissionDetails = () => {
  // Sample data for the table
  const [data, setData] = useState([
    {
      id: 1,
      orderId: '25511785',
      storeName: 'G.Y.M',
      paymentMode: '',
      restaurantName: '',
      totalAmount: 525.00,
      payableToRestaurant: 515.00,
      payableToAdmin: 10.00,
      status: 'Unpaid',
      commissionTransfer: 'Online',
      stripeStatus: '-'
    },
    {
      id: 2,
      orderId: '25433256',
      storeName: 'Green Treat',
      paymentMode: '',
      restaurantName: 'Green Treat',
      totalAmount: 113.40,
      payableToRestaurant: 103.40,
      payableToAdmin: 10.00,
      status: 'Unpaid',
      commissionTransfer: 'Online',
      stripeStatus: '-'
    },
    // Add more sample data as needed
  ]);

  // State for filters
  const [restaurantFilter, setRestaurantFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedColumns, setSelectedColumns] = useState([]);

  // Column options for the multiselect
  const columnOptions = [
    { label: 'Order ID', value: 'orderId' },
    { label: 'Store Name', value: 'storeName' },
    { label: 'Payment Mode', value: 'paymentMode' },
    { label: 'Restaurants Name', value: 'restaurantName' },
    { label: 'Total Amount', value: 'totalAmount' },
    { label: 'Payable to Restaurant', value: 'payableToRestaurant' },
    { label: 'Payable to Admin', value: 'payableToAdmin' },
    { label: 'Status', value: 'status' },
    { label: 'Commission Transfer', value: 'commissionTransfer' },
    { label: 'Stripe Status', value: 'stripeStatus' },
    { label: 'Actions', value: 'actions' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Commission Details</h2>
        <button className="p-2 text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Restaurants</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={restaurantFilter}
            onChange={(e) => setRestaurantFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="G.Y.M">G.Y.M</option>
            <option value="Green Treat">Green Treat</option>
          </select>
        </div>

        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Select Date Range"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={dateRange.start && dateRange.end ? `${dateRange.start} - ${dateRange.end}` : ''}
              readOnly
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={selectedColumns}
            onChange={(e) => setSelectedColumns(Array.from(e.target.selectedOptions, option => option.value))}
            multiple
          >
            {columnOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Mode</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurants Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payable to Restaurant</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payable to Admin</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission Transfer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stripe Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  <a href={`/dashboard/orders/details/${item.orderId}`} className="hover:underline">{item.orderId}</a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  <a href={`/dashboard/merchants/merchant-details/${item.id}`} className="hover:underline">{item.storeName}</a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.paymentMode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.restaurantName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.payableToRestaurant.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.payableToAdmin.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${item.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.commissionTransfer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.stripeStatus}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="relative group">
                    <button className="text-gray-500 hover:text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                      <div className="py-1">
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Set as paid</a>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Showing 1 to {data.length} of {data.length} entries
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border rounded-md text-gray-500 bg-white disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1 border rounded-md bg-blue-500 text-white">
            1
          </button>
          <button className="px-3 py-1 border rounded-md text-gray-500 bg-white disabled:opacity-50" disabled>
            Next
          </button>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Rows per page:</span>
          <select className="p-1 border rounded-md text-sm">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CommissionDetails;