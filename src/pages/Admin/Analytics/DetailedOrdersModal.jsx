import { X, Phone, MapPin, Store, User, CreditCard, Package, Plus } from 'lucide-react';

export default function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-amber-100 text-amber-800 border-amber-300',
      'preparing': 'bg-blue-100 text-blue-800 border-blue-300',
      'on_the_way': 'bg-purple-100 text-purple-800 border-purple-300',
      'delivered': 'bg-green-100 text-green-800 border-green-300',
      'cancelled': 'bg-red-100 text-red-800 border-red-300',
      'rejected_by_restaurant': 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'preparing': 'Preparing',
      'on_the_way': 'On the Way',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'rejected_by_restaurant': 'Rejected by Restaurant'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500 mt-0.5">Order ID: {order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">{order.customer_name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-sm text-gray-600">{order.customer_phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Store className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">{order.store_name}</p>
                  <p className="text-sm text-gray-600 mt-1">{order.store_location}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Address</p>
                  <p className="text-sm text-gray-900 mt-1">{order.delivery_address}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Agent</p>
                  {order.agent_name ? (
                    <>
                      <p className="text-base font-semibold text-gray-900 mt-1">{order.agent_name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-sm text-gray-600">{order.agent_phone}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">Not assigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items && order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                      {item.quantity || 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{item.name || `Item ${index + 1}`}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.price || 0)}
                  </span>
                </div>
              ))}
              {(!order.items || order.items.length === 0) && (
                <div className="text-center py-4 text-gray-500">
                  No items information available
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Breakdown</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax & Service Charges</span>
                <span className="font-medium text-gray-900">{formatCurrency(order.tax)}</span>
              </div>
              
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              
              {order.surge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Surge Charge</span>
                  <span className="font-medium text-gray-900">{formatCurrency(order.surge)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Charge</span>
                <span className="font-medium text-gray-900">{formatCurrency(order.delivery_charge)}</span>
              </div>

              {/* Packing Charge */}
              {order.packing_charge > 0 && (
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Package className="w-4 h-4" />
                    <span>Packing Charge</span>
                  </div>
                  <span className="font-medium text-gray-900">{formatCurrency(order.packing_charge)}</span>
                </div>
              )}

              {/* Additional Charge */}
              {order.additional_charge > 0 && (
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Plus className="w-4 h-4" />
                    <span>Additional Charge</span>
                  </div>
                  <span className="font-medium text-gray-900">{formatCurrency(order.additional_charge)}</span>
                </div>
              )}

              <div className="border-t border-gray-300 pt-3 flex justify-between">
                <span className="text-base font-semibold text-gray-900">Total Payable</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5 capitalize">{order.payment_method}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Order Status</p>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                  {formatStatus(order.status)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 flex gap-3">
            <button className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              Change Status
            </button>
            <button className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium">
              Reassign Agent
            </button>
            {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'rejected_by_restaurant' && (
              <button className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">
                Cancel Order
              </button>
            )}
          </div>

          {/* Order Timeline */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Order Created</span>
                <span className="text-gray-400 ml-auto">{new Date(order.created_at).toLocaleString()}</span>
              </div>
              {order.status === 'delivered' && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Order Delivered</span>
                </div>
              )}
              {order.status === 'cancelled' && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Order Cancelled</span>
                </div>
              )}
              {order.status === 'rejected_by_restaurant' && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Rejected by Restaurant</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}