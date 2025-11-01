import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { getSalesGraphData } from '../../../apis/adminApis/orderApi';

const SalesGraph = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, year, custom

  useEffect(() => {
    fetchSalesData();
  }, [selectedPeriod]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getSalesGraphData(selectedPeriod);
      
      // Transform API data to match chart format
      const transformedData = response.data.analytics.map(item => ({
        // For day period: "2025-10-01" -> "01 Oct"
        // For month period: "2025-10" -> "Oct 2025"
        day: formatDateLabel(item.date, response.data.period),
        sales: item.totalAmount,
        orders: item.orderCount,
        average: item.averageOrderValue,
        originalDate: item.date,
        period: item.period
      }));
      
      setSalesData(transformedData);
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  // Format date labels based on period
  const formatDateLabel = (dateString, period) => {
    const date = new Date(dateString);
    
    switch (period) {
      case 'day':
        return date.toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: 'short' 
        }); // "02 Oct"
      
      case 'month':
        return date.toLocaleDateString('en-IN', { 
          month: 'short', 
          year: 'numeric' 
        }); // "Oct 2025"
      
      case 'year':
        return date.getFullYear().toString(); // "2025"
      
      default:
        return date.toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: 'short' 
        });
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-green-600">
            Sales: ₹{payload[0].value.toLocaleString()}
          </p>
          <p className="text-sm text-blue-600">
            Orders: {payload[0].payload.orders}
          </p>
          <p className="text-sm text-purple-600">
            Avg: ₹{payload[0].payload.average?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-gray-600">Loading sales data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        {error}
        <button 
          onClick={fetchSalesData}
          className="ml-4 bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      {/* Header with period selector */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Sales Overview</h3>
        
        <div className="flex gap-2">
          {['week', 'month', 'year'].map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-all ${
                selectedPeriod === period
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="day" 
            stroke="#6b7280" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="sales" 
            stroke="url(#salesGradient)" 
            strokeWidth={3}
            dot={{ 
              fill: '#f97316', 
              strokeWidth: 2, 
              r: 4,
              stroke: '#fff'
            }}
            activeDot={{ 
              r: 6, 
              fill: '#f97316',
              stroke: '#fff',
              strokeWidth: 2
            }}
          />
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      {salesData.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-lg font-bold text-green-600">
              ₹{salesData.reduce((sum, item) => sum + item.sales, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-lg font-bold text-blue-600">
              {salesData.reduce((sum, item) => sum + item.orders, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg Order</p>
            <p className="text-lg font-bold text-purple-600">
              ₹{Math.round(salesData.reduce((sum, item) => sum + item.sales, 0) / salesData.reduce((sum, item) => sum + item.orders, 1)).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesGraph;