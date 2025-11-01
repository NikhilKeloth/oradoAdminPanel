import { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, CheckCircle, XCircle, Clock, Hourglass as HourglassIcon, DollarSign, Wallet, CreditCard, TrendingUp } from 'lucide-react';
import StatsCard from './StatsCard';
import FilterBar from './FilterBar';
import OrderTable from './OrderTable';
import { getOrdersDetailsTable, exportOrdersToExcel } from '../../../apis/adminApis/orderApi';
import OrderDetailModal from './DetailedOrdersModal';

// Mock data as fallback
export const mockStats = {
  total_orders: 1284,
  completed: 980,
  cancelled: 120,
  in_progress: 95,
  pending: 89,
  total_revenue: 847000,
  cash_orders: 410,
  online_orders: 720,
  wallet_orders: 154,
  avg_order_value: 667,
};

export const mockOrders = [
  {
    id: '#OR12345',
    customer_name: 'Rahul Mehta',
    customer_phone: '98765 43210',
    store_name: 'Pizza Hut',
    store_location: 'MG Road',
    items: [
      { name: 'Margherita Pizza', quantity: 2, price: 499 },
      { name: 'Garlic Bread', quantity: 1, price: 199 },
    ],
    subtotal: 740,
    tax: 35,
    discount: 50,
    surge: 25,
    delivery_charge: 40,
    packing_charge: 20,
    additional_charge: 15,
    total: 790,
    payment_method: 'Online',
    status: 'preparing',
    agent_name: 'Ankit Sharma',
    agent_phone: '90012 34567',
    delivery_address: '22, Green Street, Bangalore',
    created_at: '2025-10-05T10:30:00Z',
  },
];

// Function to transform API response to match your component expectations
const transformApiResponse = (apiResponse) => {
  if (!apiResponse) return { orders: [], stats: mockStats };

  // Transform stats
  const transformedStats = {
    total_orders: apiResponse.summary?.totalOrders || 0,
    completed: apiResponse.summary?.completedOrders || 0,
    cancelled: apiResponse.summary?.cancelledOrders || 0,
    in_progress: apiResponse.summary?.inProgress || 0,
    pending: apiResponse.summary?.pendingOrders || 0,
    total_revenue: apiResponse.summary?.totalRevenue || 0,
    cash_orders: apiResponse.summary?.cashOrders || 0,
    online_orders: apiResponse.summary?.onlineOrders || 0,
    wallet_orders: apiResponse.summary?.walletOrders || 0,
    avg_order_value: apiResponse.summary?.totalRevenue > 0 ? 
      Math.round(apiResponse.summary.totalRevenue / apiResponse.summary.totalOrders) : 0
  };

  // Transform orders
  const transformedOrders = (apiResponse.orders || []).map(order => ({
    id: order.orderId,
    customer_name: order.customer,
    customer_phone: order.customerPhone,
    store_name: order.store,
    store_location: order.address.city,
    items: Array.isArray(order.items) ? order.items : [],
    subtotal: order.subtotal || 0,
    tax: order.tax || 0,
    discount: order.discount || 0,
    surge: order.surge || 0,
    delivery_charge: order.delivery || 0,
    packing_charge: order.packingCharge || 0,
    additional_charge: order.additionalCharge || 0,
    total: order.total || 0,
    payment_method: order.payment || 'cash',
    status: order.status || 'pending',
    agent_name: order.agent?.name || null,
    agent_phone: order.agent?.phone || null,
    delivery_address: order.deliveryAddress || `${order.area}, Bangalore`,
    created_at: order.createdAt
  }));

  return {
    stats: transformedStats,
    orders: transformedOrders
  };
};

function DetailedOrderTable() {
  const [filters, setFilters] = useState({
    search: '',
    date_from: '',
    date_to: '',
    status: '',
    payment_method: '',
    sort_by: 'newest',
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(mockStats);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch orders from API when filters change
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // Convert your filter format to API expected format
        const apiFilters = {
          search: filters.search,
          status: filters.status || 'all',
          paymentMethod: filters.payment_method || 'all',
          fromDate: filters.date_from,
          toDate: filters.date_to,
          sort: filters.sort_by === 'newest' ? 'desc' : 'asc'
        };

        const response = await getOrdersDetailsTable(apiFilters);
        
        // Transform API response to match your component structure
        const transformedData = transformApiResponse(response);
        
        setOrders(transformedData.orders);
        setStats(transformedData.stats);
        
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to fetch orders. Using mock data instead.');
        // Fallback to mock data
        setOrders(mockOrders);
        setStats(mockStats);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filters]);

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Client-side filtering
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchLower) ||
          order.customer_name.toLowerCase().includes(searchLower) ||
          order.store_name.toLowerCase().includes(searchLower) ||
          (order.agent_name && order.agent_name.toLowerCase().includes(searchLower))
      );
    }

    if (filters.status) {
      filtered = filtered.filter((order) => order.status === filters.status);
    }

    if (filters.payment_method) {
      filtered = filtered.filter((order) => order.payment_method === filters.payment_method);
    }

    if (filters.date_from) {
      filtered = filtered.filter((order) => order.created_at >= filters.date_from);
    }

    if (filters.date_to) {
      filtered = filtered.filter((order) => order.created_at <= filters.date_to);
    }

    filtered.sort((a, b) => {
      switch (filters.sort_by) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'revenue_high':
          return (b.total || 0) - (a.total || 0);
        case 'revenue_low':
          return (a.total || 0) - (b.total || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [orders, filters]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      date_from: '',
      date_to: '',
      status: '',
      payment_method: '',
      sort_by: 'newest',
    });
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Convert your filter format to API expected format for export
      const exportFilters = {
        search: filters.search,
        paymentMethod: filters.payment_method || 'all',
        status: filters.status || 'all',
        fromDate: filters.date_from,
        toDate: filters.date_to,
        sort: filters.sort_by === 'newest' ? 'desc' : 'asc'
      };

      await exportOrdersToExcel(exportFilters);
      
      // Success message (you can replace this with a toast notification)
      console.log('Orders exported successfully!');
      
    } catch (err) {
      console.error('Export failed:', err);
      setError('Export failed. Please try again.');
      
      // Fallback: Show alert if export fails
      alert('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Order Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage and track all orders in real-time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-6">
        {/* Loading and Error States */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-700">Loading orders...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700">{error}</p>
          </div>
        )}

        {/* Export Loading State */}
        {exportLoading && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700">Preparing Excel export... This may take a moment.</p>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <StatsCard
              title="Total Orders"
              value={stats.total_orders?.toLocaleString() || '0'}
              icon={ShoppingBag}
              color="blue"
            />
            <StatsCard
              title="Completed Orders"
              value={stats.completed?.toLocaleString() || '0'}
              icon={CheckCircle}
              color="green"
            />
            <StatsCard
              title="Cancelled Orders"
              value={stats.cancelled?.toLocaleString() || '0'}
              icon={XCircle}
              color="red"
            />
            <StatsCard
              title="In Progress"
              value={stats.in_progress?.toLocaleString() || '0'}
              icon={Clock}
              color="orange"
            />
            <StatsCard
              title="Pending Orders"
              value={stats.pending?.toLocaleString() || '0'}
              icon={HourglassIcon}
              color="amber"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(stats.total_revenue)}
              icon={DollarSign}
              color="green"
            />
            <StatsCard
              title="Cash Orders"
              value={stats.cash_orders?.toLocaleString() || '0'}
              icon={Wallet}
              color="teal"
              subtitle="Payment method"
            />
            <StatsCard
              title="Online Orders"
              value={stats.online_orders?.toLocaleString() || '0'}
              icon={CreditCard}
              color="cyan"
              subtitle="Payment method"
            />
            <StatsCard
              title="Avg Order Value"
              value={formatCurrency(stats.avg_order_value)}
              icon={TrendingUp}
              color="purple"
            />
          </div>
        </div>

        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
          onExport={handleExport}
          exportLoading={exportLoading}
        />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Order List
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredOrders.length} orders)
              </span>
            </h2>
          </div>
          <OrderTable orders={filteredOrders} onViewOrder={setSelectedOrder} />
        </div>
      </div>

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}

export default DetailedOrderTable;