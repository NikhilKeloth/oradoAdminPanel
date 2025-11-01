import { Eye, X, RefreshCw } from 'lucide-react';

export default function OrderTable({ orders, onViewOrder }) {
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-amber-100 text-amber-800',
      'preparing': 'bg-blue-100 text-blue-800',
      'on_the_way': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'rejected_by_restaurant': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentColor = (method) => {
    const colors = {
      'cash': 'bg-emerald-100 text-emerald-800',
      'online': 'bg-blue-100 text-blue-800',
      'wallet': 'bg-orange-100 text-orange-800',
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'preparing': 'Preparing',
      'on_the_way': 'On the Way',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'rejected_by_restaurant': 'Rejected'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Store</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Items</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Subtotal</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Tax</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Discount</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Surge</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Delivery</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Packing</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Additional</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Agent</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider sticky right-0 bg-gray-50">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onViewOrder(order)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {order.id}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{order.customer_name}</div>
                    <div className="text-gray-500">{order.customer_phone}</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{order.store_name}</div>
                    <div className="text-gray-500 text-xs">{order.store_location}</div>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                    {order.items.length}
                  </span>
                </td>
                <td className="px-4 py-4 text-right text-sm text-gray-900">{formatCurrency(order.subtotal)}</td>
                <td className="px-4 py-4 text-right text-sm text-gray-900">{formatCurrency(order.tax)}</td>
                <td className="px-4 py-4 text-right text-sm text-green-600">
                  {order.discount > 0 ? `-${formatCurrency(order.discount)}` : '₹0'}
                </td>
                <td className="px-4 py-4 text-right text-sm text-gray-900">
                  {order.surge > 0 ? formatCurrency(order.surge) : '₹0'}
                </td>
                <td className="px-4 py-4 text-right text-sm text-gray-900">{formatCurrency(order.delivery_charge)}</td>
                <td className="px-4 py-4 text-right text-sm text-gray-900">{formatCurrency(order.packing_charge)}</td>
                <td className="px-4 py-4 text-right text-sm text-gray-900">{formatCurrency(order.additional_charge)}</td>
                <td className="px-4 py-4 text-right">
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentColor(order.payment_method)}`}>
                    {order.payment_method}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {formatStatus(order.status)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {order.agent_name ? (
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{order.agent_name}</div>
                      <div className="text-gray-500 text-xs">{order.agent_phone}</div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-4 text-center sticky right-0 bg-white">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onViewOrder(order)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'rejected_by_restaurant' && (
                      <>
                        <button
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Cancel Order"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                          title="Reassign Agent"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders found matching your filters.</p>
        </div>
      )}
    </div>
  );
}