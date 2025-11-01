import React from 'react';
import { Percent, DollarSign, Calendar, Tag, Minus, X } from 'lucide-react';

const OfferDetailPage = () => {
  const offer = {
    title: 'Summer Sale 20% Off',
    description: 'Get 20% off on all orders above ₹500',
    usageCount: 124,
    totalDiscount: 12500,
    usageLimit: 200,
    startDate: '2023-06-01',
    endDate: '2023-08-31',
    minOrder: 500,
    applicableItems: ['All items'],
    orders: [
      {
        orderId: 'ORD-1001',
        customerName: 'John Doe',
        orderDate: '2023-06-15',
        totalAmount: 1200,
        discount: 240,
        finalAmount: 960,
        items: [
          { name: 'Pizza Margherita', quantity: 2 },
          { name: 'Garlic Bread', quantity: 1 }
        ]
      },
      {
        orderId: 'ORD-1002',
        customerName: 'Jane Smith',
        orderDate: '2023-06-18',
        totalAmount: 800,
        discount: 160,
        finalAmount: 640,
        items: [
          { name: 'Pasta Alfredo', quantity: 1 },
          { name: 'Caesar Salad', quantity: 1 }
        ]
      }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Offer Details</h1>
              <p className="text-orange-100 mt-1">{offer.title}</p>
            </div>
            <button className="text-orange-100 hover:text-white p-1 rounded-full">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Stats and Conditions Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Offer Statistics */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Percent className="h-5 w-5 mr-2 text-orange-500" />
                Offer Statistics
              </h2>
              <div className="space-y-5">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                      <Percent className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Times Used</p>
                      <p className="text-lg font-semibold">{offer.usageCount}</p>
                    </div>
                  </div>
                  {offer.usageLimit && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Usage Limit</p>
                      <p className="text-lg font-semibold">
                        {offer.usageLimit} <span className="text-gray-500">({offer.usageLimit - offer.usageCount} remaining)</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Discount Given</p>
                    <p className="text-lg font-semibold">₹{offer.totalDiscount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Dates</p>
                    <p className="text-sm font-medium">
                      {offer.startDate} to {offer.endDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Offer Conditions */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2 text-orange-500" />
                Offer Conditions
              </h2>
              <div className="space-y-5">
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="p-2 rounded-full bg-orange-100 text-orange-600 mr-3">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Minimum Order</p>
                    <p className="text-lg font-semibold">
                      {offer.minOrder > 0 ? `₹${offer.minOrder}` : 'No minimum'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-start mb-2">
                    <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                      <Tag className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Applicable Items</p>
                    </div>
                  </div>
                  <div className="ml-14 flex flex-wrap gap-2">
                    {offer.applicableItems.map((item, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
                      <Percent className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Offer Description</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {offer.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Usage Section - Now placed below */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Tag className="h-5 w-5 mr-2 text-orange-500" />
              Order Usage History
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">Final Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {offer.orders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {order.orderId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.orderDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ₹{order.totalAmount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 text-right">
                          <div className="flex items-center justify-end">
                            <Minus className="h-4 w-4 mr-1" />
                            ₹{order.discount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 text-right">
                          ₹{order.finalAmount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailPage;