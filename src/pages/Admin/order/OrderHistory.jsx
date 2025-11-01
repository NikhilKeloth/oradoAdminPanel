import React from 'react';

const OrderHistory = () => {
  const historyItems = [
    {
      id: 1,
      date: 'June 26 2025 1:12 PM',
      action: 'Rejected',
      by: 'Admin',
      type: 'Order'
    },
    {
      id: 2,
      date: 'June 26 2025 1:11 PM',
      action: 'Placed by',
      by: 'Customer',
      type: 'Order'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-lg font-bold mb-4 border-b pb-2">Order History</h3>
      
      <div className="space-y-4">
        {historyItems.map((item) => (
          <div key={item.id} className="flex items-start">
            <div className="flex-shrink-0 h-2 w-2 mt-2 rounded-full bg-gray-400 mr-3"></div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <span className="text-gray-600 text-sm sm:mr-1">{item.date} -</span>
                <div className="flex flex-wrap items-baseline">
                  <span className="text-gray-800 mr-1">{item.type}</span>
                  <span className={`font-medium mr-1 ${
                    item.action === 'Rejected' ? 'text-red-600' : 
                    item.action === 'Placed by' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {item.action}
                  </span>
                  {item.by && (
                    <>
                      <span className="text-gray-500 mr-1">by</span>
                      <span className="font-medium text-gray-700">{item.by}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;