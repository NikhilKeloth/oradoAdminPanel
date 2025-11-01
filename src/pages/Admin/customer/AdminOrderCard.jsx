import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderCard = ({ order, onViewDetails }) => {
  const navigate = useNavigate();

  const formatDateTime = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ', ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusDisplay = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return { text: 'Delivered', color: 'text-green-600' };
      case 'awaiting_agent_assignment':
        return { text: 'Processing', color: 'text-yellow-600' };
      case 'preparing':
        return { text: 'Preparing', color: 'text-blue-600' };
      case 'out_for_delivery':
        return { text: 'Out for Delivery', color: 'text-orange-600' };
      case 'cancelled':
        return { text: 'Cancelled', color: 'text-red-600' };
      default:
        return { text: status, color: 'text-gray-600' };
    }
  };

  const statusInfo = getStatusDisplay(order.orderStatus);
  const itemSummary = order.orderItems?.map(item => `${item.name} × ${item.quantity}`).join(', ') || "No items";
  const displayImage = order.orderItems?.[0]?.image;

  const handleRefundUser = () => {
    // Navigate to refund page with order details as state
    console.log('order', order)
    navigate('/admin/dashboard/order/refund', {
      state: {
        userId: order.customerId || order.userId, // handle both populated and non-populated
        orderId: order._id,
        amount: order.totalAmount,
        description: `Refund for Order #${order._id.toUpperCase()}`
      }
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mb-4">
      {/* Mobile Layout */}
      <div className="block sm:hidden">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {order.restaurantId?.name || 'Restaurant'}
            </h3>
            <p className="text-xs text-gray-500">
              {order.deliveryAddress?.city || 'Location'}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={`text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-2">
          {formatDateTime(order.updatedAt)}
        </p>

        <div className="flex gap-3 mb-3">
          <div className="flex-shrink-0">
            <img
              src={displayImage}
              alt="Order"
              className="w-16 h-16 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/80?text=Food';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1">
              ORDER #{order._id.slice(-8).toUpperCase()}
            </p>
            <button
              type="button"
              className="text-orange-500 text-xs font-semibold hover:text-orange-600 uppercase"
              onClick={onViewDetails}
            >
              VIEW DETAILS
            </button>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-xs text-gray-700 mb-1 line-clamp-2">
            {itemSummary}
          </p>
          <p className="text-sm font-semibold text-gray-900">
            Total Paid: ₹ {order.totalAmount.toFixed(0)}
          </p>
        </div>

        <button
          type="button"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-xs font-semibold uppercase"
          onClick={handleRefundUser}
        >
          REFUND USER
        </button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:block">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <img
              src={displayImage}
              alt="Order"
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/120x80?text=Food';
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
              <div className="mb-2 sm:mb-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {order.restaurantId?.name || 'Restaurant'}
                </h3>
                <p className="text-sm text-gray-500">
                  {order.deliveryAddress?.city || 'Location'}
                </p>
              </div>
              <div className="text-left sm:text-right sm:ml-4">
                <span className={`text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.text} on {formatDateTime(order.updatedAt)}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-2">
              ORDER #{order._id.slice(-12).toUpperCase()} | {formatDateTime(order.createdAt)}
            </p>

            <button
              type="button"
              className="text-orange-500 text-sm font-semibold mb-3 hover:text-orange-600 uppercase"
              onClick={onViewDetails}
            >
              VIEW DETAILS
            </button>
          </div>
        </div>

        <div className="border-t border-dotted border-gray-300 my-4"></div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <p className="text-sm text-gray-700 flex-1 mr-0 sm:mr-4">
            {itemSummary}
          </p>
          <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
            Total Paid: ₹ {order.totalAmount.toFixed(0)}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            type="button"
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded text-sm font-semibold uppercase"
            onClick={handleRefundUser}
          >
            REFUND USER
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
