import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend 
} from 'recharts';
import { getPeakHoursData } from '../../../apis/adminApis/orderApi';

export default function PeakHoursChart() {
  const [chartData, setChartData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [selectedView, setSelectedView] = useState('all'); // all, peak, weak
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPeakHoursData(selectedPeriod);
  }, [selectedPeriod]);

  // Transform API data to make it more understandable
  const transformChartData = (apiData) => {
    if (!apiData.data) return [];

    const periodKey = Object.keys(apiData.data)[0]; // 'Today', 'Monday', etc.
    const hoursData = apiData.data[periodKey];
    
    // Get peak and weak hours for this period
    const periodPeakData = apiData.peakHours?.find(p => p.period === periodKey);
    const peakHours = periodPeakData?.peak || [];
    const weakHours = periodPeakData?.weak || [];

    return hoursData.map(hourData => {
      const hour = hourData.hour;
      const isPeakHour = peakHours.includes(hour);
      const isWeakHour = weakHours.includes(hour);
      
      return {
        hour: hour,
        hourLabel: getHourLabel(hour),
        orders: hourData.totalOrders,
        revenue: hourData.totalRevenue,
        type: isPeakHour ? 'peak' : isWeakHour ? 'weak' : 'normal',
        isPeak: isPeakHour,
        isWeak: isWeakHour
      };
    });
  };

  // Convert "14" to "2 PM", "9" to "9 AM"
  const getHourLabel = (hourStr) => {
    const hour = parseInt(hourStr);
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  const fetchPeakHoursData = async (period) => {
    try {
      setLoading(true);
      const response = await getPeakHoursData(period);
      const transformedData = transformChartData(response);
      setChartData(transformedData);
    } catch (error) {
      console.error('Error fetching peak hours data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on selected view
  const getFilteredData = () => {
    if (selectedView === 'peak') {
      return chartData.filter(item => item.isPeak);
    } else if (selectedView === 'weak') {
      return chartData.filter(item => item.isWeak);
    }
    return chartData;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.hourLabel}</p>
          <p className="text-sm text-blue-600">
            📊 Orders: <strong>{data.orders}</strong>
          </p>
          <p className="text-sm text-green-600">
            💰 Revenue: <strong>₹{data.revenue?.toLocaleString()}</strong>
          </p>
          <p className={`text-xs font-medium mt-1 ${
            data.isPeak ? 'text-red-500' : data.isWeak ? 'text-gray-500' : 'text-blue-500'
          }`}>
            {data.isPeak ? '🚀 PEAK HOUR' : data.isWeak ? '🐢 SLOW HOUR' : '📈 NORMAL HOUR'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Get bar color based on hour type
  const getBarColor = (data) => {
    if (data?.isPeak) return '#ef4444'; // red for peak
    if (data?.isWeak) return '#9ca3af'; // gray for weak
    return '#0d3069ff'; // blue for normal
  };

  // Custom bar shape to show different colors
  const CustomBar = (props) => {
    const { fill, x, y, width, height, data } = props;
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={getBarColor(data)}
        rx={4} // rounded corners
      />
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading peak hours data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Peak Hours Analysis</h3>
          <p className="text-sm text-gray-500 mt-1">
            Identify busiest and slowest hours to optimize operations
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
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

          {/* View Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'All Hours', emoji: '👀' },
              { key: 'peak', label: 'Peak Only', emoji: '🚀' },
              { key: 'weak', label: 'Weak Only', emoji: '🐢' }
            ].map(view => (
              <button
                key={view.key}
                onClick={() => setSelectedView(view.key)}
                className={`px-3 py-1 text-xs rounded-md transition-all flex items-center gap-1 ${
                  selectedView === view.key
                    ? 'bg-white text-blue-600 shadow-sm font-medium'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span>{view.emoji}</span>
                <span className="hidden sm:inline">{view.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={getFilteredData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis 
            dataKey="hourLabel" 
            stroke="#6b7280" 
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={12}
            label={{ 
              value: 'Number of Orders', 
              angle: -90, 
              position: 'insideLeft',
              offset: -10,
              style: { textAnchor: 'middle' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="orders" 
            name="Orders"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            shape={<CustomBar />}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend & Insights */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-red-600 font-medium">🚀 Peak Hours</span>
            <span className="text-gray-500">- Highest order volume</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-blue-600 font-medium">📈 Normal Hours</span>
            <span className="text-gray-500">- Regular activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span className="text-gray-600 font-medium">🐢 Weak Hours</span>
            <span className="text-gray-500">- Low order volume</span>
          </div>
        </div>

        {/* Quick Stats */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-red-600 font-bold text-lg">
                {chartData.filter(item => item.isPeak).length}
              </div>
              <div className="text-red-500 text-sm">Peak Hours</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-blue-600 font-bold text-lg">
                {chartData.reduce((sum, item) => sum + item.orders, 0)}
              </div>
              <div className="text-blue-500 text-sm">Total Orders</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-green-600 font-bold text-lg">
                ₹{chartData.reduce((sum, item) => sum + (item.revenue || 0), 0).toLocaleString()}
              </div>
              <div className="text-green-500 text-sm">Total Revenue</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}