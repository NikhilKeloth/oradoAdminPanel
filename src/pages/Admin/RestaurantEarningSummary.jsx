import React from 'react';
import { DollarSign, Users, CreditCard, TrendingUp, CheckCircle, Clock, PieChart, BarChart3, Calendar } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const RestaurantEarningSummary = ({ summary = {}, currency = 'INR', timeFilter = 'all' }) => {
  // Destructure only the properties we need from summary
  const {
    totalOrders = 0,
    totalAmount = 0,
    totalCommission = 0,
    totalNetEarnings = 0,
    averageCommissionRate = "0",
    percentageCommissionOrders = 0,
    fixedCommissionOrders = 0,
    payoutStatusCounts = {}
  } = summary;

  const formatCurrency = (amount) => {
    const numericAmount = Number(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  };
  
  const formatPercentage = (value) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : Number(value);
    return `${(isNaN(numericValue) ? 0 : numericValue).toFixed(1)}%`;
  };
  
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Chart data preparation
  const commissionData = [
    { name: 'Percentage Based', value: percentageCommissionOrders, color: '#f97316' },
    { name: 'Fixed Amount', value: fixedCommissionOrders, color: '#fb923c' }
  ];

  const payoutData = Object.entries(payoutStatusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: status === 'paid' ? '#22c55e' : '#eab308' // Only pending in your data
  }));

  const revenueData = [
    { name: 'Total Amount', value: totalAmount, color: '#3b82f6' },
    { name: 'Commission', value: totalCommission, color: '#f97316' },
    { name: 'Net Revenue', value: totalNetEarnings, color: '#22c55e' }
  ];

  const CustomTooltipCurrency = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white p-4 border border-orange-100 rounded-2xl shadow-xl backdrop-blur-sm">
          <p className="font-medium text-gray-700">{`${label || payload[0].name}: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  const getTimeFilterLabel = () => {
    switch(timeFilter) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'All Time';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-light flex items-center gap-3 tracking-wide">
            <DollarSign className="w-7 h-7" />
            Restaurant Earning Summary
          </h3>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">{getTimeFilterLabel()}</span>
          </div>
        </div>
      </div>
      
      <div className="p-10">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-orange-50 rounded-3xl p-8 border border-orange-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800 mb-2 tracking-wide">Total Orders</p>
                <p className="text-4xl font-light text-orange-700">{totalOrders}</p>
              </div>
              <div className="p-4 bg-orange-100 rounded-2xl">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-3xl p-8 border border-orange-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800 mb-2 tracking-wide">Total Amount</p>
                <p className="text-4xl font-light text-orange-700">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="p-4 bg-orange-100 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-3xl p-8 border border-orange-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800 mb-2 tracking-wide">Commission</p>
                <p className="text-4xl font-light text-orange-700">{formatCurrency(totalCommission)}</p>
              </div>
              <div className="p-4 bg-orange-100 rounded-2xl">
                <CreditCard className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-3xl p-8 border border-green-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800 mb-2 tracking-wide">Net Revenue</p>
                <p className="text-4xl font-light text-green-700">{formatCurrency(totalNetEarnings)}</p>
              </div>
              <div className="p-4 bg-green-100 rounded-2xl">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10 mb-16">
          {/* Revenue Breakdown Chart */}
          <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <h4 className="text-2xl font-light text-gray-800 mb-8 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-orange-500" />
              Revenue Breakdown
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltipCurrency />} />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Commission Types Chart */}
          <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <h4 className="text-2xl font-light text-gray-800 mb-8 flex items-center gap-3">
              <PieChart className="w-6 h-6 text-orange-500" />
              Commission Types
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={commissionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {commissionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '14px', color: '#6b7280' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 text-center">
              <span className="text-sm text-gray-500 tracking-wide">Avg. Commission Rate: </span>
              <span className="font-medium text-orange-600 text-lg">
                {formatPercentage(averageCommissionRate)}
              </span>
            </div>
          </div>
          
          {/* Payout Status Chart */}
          <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <h4 className="text-2xl font-light text-gray-800 mb-8 flex items-center gap-3">
              <PieChart className="w-6 h-6 text-orange-500" />
              Payout Status
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={payoutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {payoutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '14px', color: '#6b7280' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Commission Types Summary */}
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
            <h4 className="text-2xl font-light text-gray-800 mb-6">Commission Summary</h4>
            <div className="space-y-6">
              <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600 font-medium tracking-wide">Percentage Based:</span>
                </div>
                <span className="font-medium text-gray-900 text-lg">{percentageCommissionOrders}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
                  <span className="text-gray-600 font-medium tracking-wide">Fixed Amount:</span>
                </div>
                <span className="font-medium text-gray-900 text-lg">{fixedCommissionOrders}</span>
              </div>
            </div>
          </div>
          
          {/* Payout Status Summary */}
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
            <h4 className="text-2xl font-light text-gray-800 mb-6">Payout Details</h4>
            <div className="space-y-6">
              {Object.entries(payoutStatusCounts).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(status)}
                    <span className="text-gray-600 font-medium capitalize tracking-wide">{status}:</span>
                  </div>
                  <span className="font-medium text-gray-900 text-lg">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantEarningSummary;