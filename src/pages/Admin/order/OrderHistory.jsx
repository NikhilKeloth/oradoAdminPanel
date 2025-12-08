import React, { useEffect, useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const OrderHistory = ({ orderData }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed when loading

  useEffect(() => {
    if (orderData) {
      const orderHistory = [];
      
      // 1. Order creation
      orderHistory.push({
        id: 1,
        timestamp: orderData.createdAt,
        action: 'Order Created',
        by: 'System',
        notes: `Order placed successfully`
      });

      // 2. Payment method (only show as note in creation if cash)
      if (orderData.paymentMethod === 'cash') {
        orderHistory[0].notes = `Order placed successfully • Payment method: ${orderData.paymentMethod}`;
      }

      // 3. Order status changes from orderHistory array
      if (orderData.orderHistory && orderData.orderHistory.length > 0) {
        orderData.orderHistory.forEach((historyItem, index) => {
          let action = '';
          let notes = historyItem.reason || '';
          
          switch (historyItem.status) {
            case 'created':
              action = 'Order Created';
              break;
            case 'accepted_by_restaurant':
              action = 'Order Accepted';
              notes = 'Restaurant has accepted your order';
              break;
            case 'preparing':
              action = 'Preparing Order';
              notes = 'Restaurant is preparing your order';
              break;
            case 'ready_for_pickup':
              action = 'Ready for Pickup';
              notes = 'Order is ready for delivery agent pickup';
              break;
            case 'assigned_to_agent':
              action = 'Agent Assigned';
              notes = 'Delivery agent is on the way to restaurant';
              break;
            case 'picked_up':
              action = 'Order Picked Up';
              notes = 'Delivery agent has picked up your order';
              break;
            case 'on_the_way':
              action = 'On the Way';
              notes = 'Delivery agent is on the way to you';
              break;
            case 'arrived':
              action = 'Agent Arrived';
              notes = 'Delivery agent has arrived at your location';
              break;
            case 'delivered':
              action = 'Order Delivered';
              notes = 'Order has been successfully delivered';
              break;
            case 'cancelled':
              action = 'Order Cancelled';
              notes = historyItem.reason || 'Order was cancelled';
              break;
            default:
              action = historyItem.status ? historyItem.status.replace(/_/g, ' ') : 'Status Update';
          }

          if (action) {
            orderHistory.push({
              id: orderHistory.length + 1,
              timestamp: historyItem.timestamp,
              action: action,
              by: 'System',
              notes: notes
            });
          }
        });
      }

      // 4. Current order status if not already in history
      const currentStatus = orderData.orderStatus;
      const statusExists = orderHistory.some(item => 
        item.action.toLowerCase().includes(currentStatus.replace(/_/g, ' ').toLowerCase())
      );
      
      if (!statusExists && currentStatus !== 'created') {
        let action = '';
        let notes = 'Current order status';
        
        switch (currentStatus) {
          case 'accepted_by_restaurant':
            action = 'Order Accepted';
            notes = 'Restaurant has accepted your order';
            break;
          case 'preparing':
            action = 'Preparing Order';
            notes = 'Restaurant is preparing your order';
            break;
          case 'ready_for_pickup':
            action = 'Ready for Pickup';
            notes = 'Order is ready for delivery agent pickup';
            break;
          default:
            action = currentStatus.replace(/_/g, ' ');
        }

        orderHistory.push({
          id: orderHistory.length + 1,
          timestamp: orderData.updatedAt,
          action: action,
          by: 'System',
          notes: notes
        });
      }

      // 5. Agent assignment (only show if assigned)
      if (orderData.assignedAgent && orderData.agentAssignmentStatus !== 'unassigned') {
        orderHistory.push({
          id: orderHistory.length + 1,
          timestamp: orderData.updatedAt,
          action: 'Agent Assigned',
          by: 'System',
          notes: 'Delivery agent has been assigned to your order'
        });
      }

      // 6. Delivery status (only show meaningful statuses)
      if (orderData.agentDeliveryStatus && 
          !['awaiting_start', 'unassigned'].includes(orderData.agentDeliveryStatus)) {
        
        let action = '';
        let notes = '';
        
        switch (orderData.agentDeliveryStatus) {
          case 'picked_up':
            action = 'Order Picked Up';
            notes = 'Delivery agent has picked up your order';
            break;
          case 'on_the_way':
            action = 'On the Way';
            notes = 'Delivery agent is on the way to you';
            break;
          case 'arrived':
            action = 'Agent Arrived';
            notes = 'Delivery agent has arrived at your location';
            break;
          case 'delivered':
            action = 'Order Delivered';
            notes = 'Order has been successfully delivered';
            break;
          default:
            action = orderData.agentDeliveryStatus ? 
              `Delivery ${orderData.agentDeliveryStatus.replace(/_/g, ' ')}` : 
              'Delivery Status Update';
        }

        orderHistory.push({
          id: orderHistory.length + 1,
          timestamp: orderData.updatedAt,
          action: action,
          by: 'System',
          notes: notes
        });
      }

      // 7. Handle order edits - simplified message
      if (orderData.orderEdited && orderData.editedBy) {
        orderHistory.push({
          id: orderHistory.length + 1,
          timestamp: orderData.updatedAt,
          action: 'Order Edited',
          by: orderData.editedBy,
          notes: 'New bill generated • Edited by admin'
        });
      }

      // Remove duplicates and sort by timestamp
      const uniqueHistory = orderHistory.filter((item, index, self) =>
        index === self.findIndex(t => 
          t.action === item.action && 
          t.timestamp === item.timestamp
        )
      );

      const sortedHistory = uniqueHistory.sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );

      setHistory(sortedHistory);
      setLoading(false);
    }
  }, [orderData]);

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getActionColor = (action) => {
    const actionLower = action?.toLowerCase();
    if (actionLower.includes('rejected') || actionLower.includes('cancelled') || actionLower.includes('failed')) {
      return 'text-red-600 bg-red-50';
    }
    if (actionLower.includes('delivered') || actionLower.includes('completed') || actionLower.includes('success')) {
      return 'text-green-600 bg-green-50';
    }
    if (actionLower.includes('assigned') || actionLower.includes('picked') || actionLower.includes('arrived')) {
      return 'text-blue-600 bg-blue-50';
    }
    if (actionLower.includes('preparing') || actionLower.includes('ready')) {
      return 'text-purple-600 bg-purple-50';
    }
    if (actionLower.includes('edited')) {
      return 'text-orange-600 bg-orange-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusIcon = (action) => {
    const actionLower = action?.toLowerCase();
    if (actionLower.includes('created')) return '📝';
    if (actionLower.includes('accepted')) return '✅';
    if (actionLower.includes('preparing')) return '👨‍🍳';
    if (actionLower.includes('ready')) return '📦';
    if (actionLower.includes('assigned')) return '🚗';
    if (actionLower.includes('picked')) return '🎯';
    if (actionLower.includes('way')) return '🛵';
    if (actionLower.includes('arrived')) return '📍';
    if (actionLower.includes('delivered')) return '🎉';
    if (actionLower.includes('cancelled')) return '❌';
    if (actionLower.includes('edited')) return '✏️';
    return '📋';
  };

  const getLatestStatus = () => {
    if (history.length === 0) return null;
    return history[history.length - 1];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header - Always Visible even when loading */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Order Timeline</h3>
              <p className="text-sm text-gray-600 mt-1">Track your order progress</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="animate-pulse bg-gray-200 h-6 w-24 rounded-full"></div>
              <FiChevronDown className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Loading state - collapsed by default */}
        {!isCollapsed && (
          <div className="p-6">
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header - Always Visible */}
        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex justify-between items-center text-left hover:bg-gray-50 -mx-3 px-3 py-2 rounded-lg transition-colors"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Order Timeline</h3>
              <p className="text-sm text-gray-600 mt-1">Track your order progress</p>
            </div>
            <div className="flex items-center gap-3">
              <FiChevronDown className="w-5 h-5 text-gray-500" />
            </div>
          </button>
        </div>
        
        {/* Empty state - only show when expanded */}
        {!isCollapsed && (
          <div className="p-6">
            <div className="text-center text-gray-500 py-8">
              No timeline available for this order
            </div>
          </div>
        )}
      </div>
    );
  }

  const latestStatus = getLatestStatus();

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header - Always Visible */}
      <div className="px-6 py-4 border-b border-gray-200">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex justify-between items-center text-left hover:bg-gray-50 -mx-3 px-3 py-2 rounded-lg transition-colors"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Order Timeline</h3>
            <p className="text-sm text-gray-600 mt-1">Track your order progress</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Current Status Badge */}
            {latestStatus && (
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getActionColor(latestStatus.action)}`}>
                  <span className="mr-2">{getStatusIcon(latestStatus.action)}</span>
                  {latestStatus.action}
                </span>
              </div>
            )}
            {isCollapsed ? (
              <FiChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <FiChevronUp className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </button>
      </div>
      
      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="p-6">
          {/* Scrollable Timeline Container */}
          <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
            {[...history].reverse().map((item, index) => (  
              <div key={item.id || index} className="flex items-start group">
                {/* Timeline line and dot */}
                <div className="flex-shrink-0 relative mr-4">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-blue-500 bg-white">
                    <span className="text-sm">{getStatusIcon(item.action)}</span>
                  </div>
                  {index !== history.length - 1 && (
                    <div className="absolute top-8 left-3.5 w-0.5 h-8 bg-gray-200 group-last:hidden"></div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(item.action)}`}>
                          {item.action}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(item.timestamp)}
                        </span>
                      </div>
                      
                      {item.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Payment method badge for creation event */}
                  {item.action === 'Order Created' && orderData.paymentMethod && (
                    <div className="inline-flex items-center px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-xs font-medium mt-2">
                      💳 Payment: {orderData.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Current status summary */}
          {latestStatus && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Current Status</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {latestStatus.action}
                  </p>
                  {latestStatus.notes && (
                    <p className="text-sm text-blue-600 mt-1">
                      {latestStatus.notes}
                    </p>
                  )}
                </div>
                <div className="text-2xl">
                  {getStatusIcon(latestStatus.action)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;