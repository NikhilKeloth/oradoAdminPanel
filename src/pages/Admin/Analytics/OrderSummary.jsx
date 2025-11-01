import { useState, useEffect } from 'react';
import { TrendingUp, Clock, Store, DollarSign } from 'lucide-react';
import apiClient from '../../../apis/apiClient/apiClient';

const OrderSummary = ({ TimePeriodSelector }) => {
  const [summaryPeriod, setSummaryPeriod] = useState('today');
  const [statsData, setStatsData] = useState({
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders summary data
  const fetchOrdersSummary = async (period) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrdersSummary({ period });
      console.log('API Response:', response);
      
      // Extract data from the nested structure
      const statistics = response?.data?.statistics || {};
      
      setStatsData({
        totalOrders: statistics.totalOrders?.value || 0,
        completedOrders: statistics.completedOrders?.value || 0,
        cancelledOrders: statistics.cancelledOrders?.value || 0,
        totalRevenue: statistics.totalRevenue?.rawValue || 0
      });
    } catch (err) {
      console.error('Error fetching orders summary:', err);
      setError('Failed to load order statistics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when period changes
  useEffect(() => {
    fetchOrdersSummary(summaryPeriod);
  }, [summaryPeriod]);

  // StatCard Component
  const StatCard = ({ title, value, change, icon: Icon, bgColor, iconBg, prefix = "" }) => (
    <div className={`${bgColor} rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <div className={`flex items-center mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${change < 0 ? 'transform rotate-180' : ''}`} />
            <span className="text-sm font-medium">
              {change >= 0 ? '+' : ''}{change}%
            </span>
          </div>
        </div>
        <div className={`${iconBg} w-12 h-12 rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <TimePeriodSelector 
          period={summaryPeriod} 
          setPeriod={setSummaryPeriod} 
          title="Order Summary" 
          section="summary"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-gray-100 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <TimePeriodSelector 
          period={summaryPeriod} 
          setPeriod={setSummaryPeriod} 
          title="Order Summary" 
          section="summary"
        />
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => fetchOrdersSummary(summaryPeriod)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Summary Time Period Selector */}
      <TimePeriodSelector 
        period={summaryPeriod} 
        setPeriod={setSummaryPeriod} 
        title="Order Summary" 
        section="summary"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Orders"
          value={statsData.totalOrders}
          change={parseFloat(statsData.totalOrders?.percentage || -66.7)}
          icon={Store}
          bgColor="bg-green-50"
          iconBg="bg-green-500"
        />
        <StatCard
          title="Completed Orders"
          value={statsData.completedOrders}
          change={parseFloat(statsData.completedOrders?.percentage || 1000.0)}
          icon={TrendingUp}
          bgColor="bg-blue-50"
          iconBg="bg-blue-500"
        />
        <StatCard
          title="Cancelled Orders"
          value={statsData.cancelledOrders}
          change={parseFloat(statsData.cancelledOrders?.percentage || 0)}
          icon={Clock}
          bgColor="bg-red-50"
          iconBg="bg-red-500"
        />
        <StatCard
          title="Total Revenue"
          value={statsData.totalRevenue}
          change={parseFloat(statsData.totalRevenue?.percentage || -52.3)}
          icon={DollarSign}
          bgColor="bg-orange-50"
          iconBg="bg-orange-500"
          prefix="₹"
        />
      </div>
    </div>
  );
};

// API function
export const getOrdersSummary = async ({ period = "today" }) => {
  try {
    const response = await apiClient.get(`/admin/order/summary`, {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching orders summary:", error);
    throw error.response?.data || error;
  }
};

export default OrderSummary;