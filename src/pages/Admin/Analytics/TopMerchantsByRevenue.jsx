
import React, { useState, useEffect } from 'react';
import { getTopMerchantsByRevenue } from '../../../apis/adminApis/orderApi';

const TopMerchantsByRevenue = () => {
  const [merchantData, setMerchantData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [limit, setLimit] = useState(5);

  // Color palette for merchants
  const colorPalette = [
    '#FF6B35', '#FF8C42', '#FFA726', '#66BB6A', '#42A5F5', 
    '#AB47BC', '#26C6DA', '#FFCA28', '#EF5350', '#5C6BC0'
  ];

  useEffect(() => {
    fetchTopMerchants(selectedPeriod, limit);
  }, [selectedPeriod, limit]);

  const fetchTopMerchants = async (period, limitCount) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTopMerchantsByRevenue(period, limitCount);
       console.log('Top Merchants Response:', response);
      if (response) {
        setMerchantData(response.data || []);
      } else {
        setError('Failed to load merchant data');
      }
    } catch (err) {
      console.error('Error fetching top merchants:', err);
      setError('Failed to load merchant data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate max revenue for progress bars
  const maxRevenue = merchantData.length > 0 
    ? Math.max(...merchantData.map(merchant => merchant.totalRevenue))
    : 1;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Top Merchants by Revenue</h3>
          <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center gap-4 p-3">
              <div className="animate-pulse bg-gray-200 w-12 h-12 rounded-full"></div>
              <div className="flex-1">
                <div className="animate-pulse bg-gray-200 h-4 w-32 mb-2 rounded"></div>
                <div className="animate-pulse bg-gray-200 h-3 w-24 rounded"></div>
              </div>
              <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="text-center py-8">
          <div className="text-red-500 text-lg mb-2">⚠️ {error}</div>
          <button
            onClick={() => fetchTopMerchants(selectedPeriod, limit)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Top Merchants by Revenue</h3>
          <p className="text-sm text-gray-500 mt-1">
            Highest earning restaurants in {selectedPeriod} period
          </p>
        </div>

        <div className="flex gap-3">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">📅 Today</option>
            <option value="weekly">📊 This Week</option>
            <option value="monthly">📈 This Month</option>
            <option value="yearly">🎯 This Year</option>
          </select>

          {/* Limit Selector */}
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={3}>Top 3</option>
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
          </select>
        </div>
      </div>

      {/* Merchants List */}
      <div className="space-y-4">
        {merchantData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>No merchant data available</p>
            <p className="text-sm">No orders delivered in this period</p>
          </div>
        ) : (
          merchantData.map((merchant, index) => {
            const merchantColor = colorPalette[index % colorPalette.length];
            const progressPercentage = (merchant.totalRevenue / maxRevenue) * 100;
            
            return (
              <div 
                key={merchant.restaurantId || merchant.name} 
                className="group hover:bg-gray-50 rounded-xl p-4 transition-all duration-200 border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Rank Badge */}
                    <div className="relative">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg transition-transform group-hover:scale-110"
                        style={{ backgroundColor: merchantColor }}
                      >
                        #{index + 1}
                      </div>
                      {/* Online Indicator */}
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>

                    {/* Merchant Info */}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 text-base truncate group-hover:text-blue-600 transition-colors">
                        {merchant.name || 'Unknown Restaurant'}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm text-gray-500">
                          📦 {merchant.totalOrders} orders
                        </p>
                        <p className="text-sm text-gray-500">
                          🏆 Rank {index + 1}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Revenue & Progress */}
                  <div className="text-right ml-4 min-w-0">
                    <p className="font-bold text-gray-900 text-lg">
                      ₹{merchant.totalRevenue?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">Total Revenue</p>
                    
                    {/* Progress Bar */}
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${progressPercentage}%`,
                          backgroundColor: merchantColor 
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {progressPercentage.toFixed(1)}% of top performer
                    </p>
                  </div>
                </div>

                {/* Additional Stats on Hover */}
                <div className="mt-3 pt-3 border-t border-gray-100 hidden group-hover:block">
                  <div className="grid grid-cols-3 gap-4 text-xs text-center">
                    <div>
                      <p className="text-gray-600">Avg. Order</p>
                      <p className="font-semibold text-green-600">
                        ₹{merchant.totalOrders > 0 ? Math.round(merchant.totalRevenue / merchant.totalOrders) : 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Performance</p>
                      <p className={`font-semibold ${
                        index === 0 ? 'text-yellow-600' : 
                        index < 3 ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {index === 0 ? '🏆 Top' : index < 3 ? '⭐ Great' : '📈 Good'}
                      </p>
                    </div>
                    <div>
                      {/* <p className="text-gray-600">Market Share</p> */}
                      <p className="font-semibold text-purple-600">
                        {progressPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Footer */}
      {merchantData.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Showing <strong>{merchantData.length}</strong> of top merchants
            </div>
            <div className="text-right">
              Total Revenue: <strong>₹{merchantData.reduce((sum, merchant) => sum + merchant.totalRevenue, 0).toLocaleString()}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopMerchantsByRevenue;