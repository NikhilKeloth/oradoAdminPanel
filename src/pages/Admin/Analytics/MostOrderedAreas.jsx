import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Calendar, Filter, Building2 } from 'lucide-react';
import { getMostOrderedAreas } from '../../../apis/adminApis/orderApi';

const MostOrderedAreas = () => {
  const [areaData, setAreaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [limit, setLimit] = useState(5);
  const [groupBy, setGroupBy] = useState('city');

  // Color palette for different areas
  const colorPalette = [
    'from-orange-500 to-red-500',
    'from-blue-500 to-purple-500',
    'from-green-500 to-teal-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-blue-500',
    'from-yellow-500 to-orange-500',
    'from-purple-500 to-pink-500',
    'from-teal-500 to-green-500'
  ];

  useEffect(() => {
    fetchMostOrderedAreas(selectedPeriod, limit, groupBy);
  }, [selectedPeriod, limit, groupBy]);

  const fetchMostOrderedAreas = async (period, limitCount, groupByField) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMostOrderedAreas(period, limitCount, groupByField);
      
      if (response && response.success) {
        setAreaData(response.data || []);
      } else {
        setError(response?.message || 'Failed to load area data');
      }
    } catch (err) {
      console.error('Error fetching ordered areas:', err);
      setError(err.response?.data?.message || 'Failed to load area data');
    } finally {
      setLoading(false);
    }
  };

  const getPeriodDisplayName = (period) => {
    const periodMap = {
      'today': 'Today',
      'yesterday': 'Yesterday',
      'week': 'This Week',
      'lastWeek': 'Last Week',
      'month': 'This Month',
      'lastMonth': 'Last Month',
      'year': 'This Year',
      'all': 'All Time'
    };
    return periodMap[period] || period;
  };

  const getGroupByDisplayName = (groupBy) => {
    const groupByMap = {
      'city': 'City',
      'state': 'State',
      'pincode': 'Pincode'
    };
    return groupByMap[groupBy] || groupBy;
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Most Ordered Areas</h3>
          <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center gap-4 p-4">
              <div className="animate-pulse bg-gray-200 w-12 h-12 rounded-xl"></div>
              <div className="flex-1">
                <div className="animate-pulse bg-gray-200 h-4 w-32 mb-2 rounded"></div>
                <div className="animate-pulse bg-gray-200 h-3 w-24 rounded"></div>
              </div>
              <div className="text-right">
                <div className="animate-pulse bg-gray-200 h-6 w-12 mb-1 rounded"></div>
                <div className="animate-pulse bg-gray-200 h-3 w-8 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="text-center py-8">
          <div className="text-red-500 text-lg mb-2">⚠️ {error}</div>
          <button
            onClick={() => fetchMostOrderedAreas(selectedPeriod, limit, groupBy)}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300"
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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Most Ordered Areas</h3>
            <p className="text-sm text-gray-500">
              Top {getGroupByDisplayName(groupBy).toLowerCase()} by order volume
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Group By Filter */}
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          >
            <option value="city">🏙️ By City</option>
            <option value="state">🗺️ By State</option>
            <option value="pincode">📮 By Pincode</option>
          </select>

          {/* Period Filter */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          >
            <option value="today">📅 Today</option>
            <option value="week">📊 Week</option>
            <option value="month">📈 Month</option>
            <option value="year">🎯 Year</option>
            <option value="all">⏳ All Time</option>
          </select>

          {/* Limit Filter */}
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          >
            <option value={3}>Top 3</option>
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
          </select>
        </div>
      </div>

      {/* Active Filters Info */}
      <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
        <div className="flex flex-wrap items-center gap-4 text-sm text-orange-800">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span><strong>Period:</strong> {getPeriodDisplayName(selectedPeriod)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Filter className="w-4 h-4" />
            <span><strong>Grouped by:</strong> {getGroupByDisplayName(groupBy)}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span><strong>Showing:</strong> Top {limit}</span>
          </div>
        </div>
      </div>

      {/* Areas List */}
      <div className="space-y-3">
        {areaData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🏢</div>
            <p>No area data available</p>
            <p className="text-sm">No orders delivered in this period</p>
          </div>
        ) : (
          areaData.map((area, index) => {
            const gradientClass = colorPalette[index % colorPalette.length];
            
            return (
              <div 
                key={area.area || index} 
                className="group hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 rounded-xl p-4 transition-all duration-200 border border-transparent hover:border-orange-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Location Icon with Gradient */}
                    <div className="relative">
                      <div className={`p-3 bg-gradient-to-r ${gradientClass} rounded-xl shadow-lg transition-transform group-hover:scale-105 flex items-center justify-center`}>
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      {/* Rank Badge */}
                      <div className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                        #{index + 1}
                      </div>
                    </div>

                    {/* Area Info */}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 text-base truncate group-hover:text-orange-600 transition-colors">
                        {area.area || 'Unknown Location'}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm text-gray-500">
                          📊 Total Orders: <span className="font-medium text-gray-700">{area.orders?.toLocaleString()}</span>
                        </p>
                        {area.popular && (
                          <p className="text-sm text-gray-500">
                            🏆 Popular: <span className="font-medium text-orange-600">{area.popular}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Orders Count */}
                  <div className="text-right ml-4">
                    <p className="font-bold text-gray-900 text-2xl">{area.orders?.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">orders</p>
                    {/* Growth Indicator */}
                    {index < 3 && (
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Top Area</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar - Visual representation */}
                {areaData[0]?.orders > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Order Volume</span>
                      <span>{((area.orders / areaData[0]?.orders) * 100).toFixed(1)}% of #1</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-1000 ease-out`}
                        style={{ 
                          width: `${(area.orders / areaData[0]?.orders) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Summary Footer */}
      {areaData.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-500" />
              <span>
                Showing <strong>{areaData.length}</strong> top {getGroupByDisplayName(groupBy).toLowerCase()}{areaData.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-right">
              Total Orders: <strong>{areaData.reduce((sum, area) => sum + (area.orders || 0), 0).toLocaleString()}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MostOrderedAreas;