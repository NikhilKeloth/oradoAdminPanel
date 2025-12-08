import React, { useState } from 'react';
import { FiClock, FiDollarSign, FiPackage, FiMapPin, FiInfo, FiChevronDown, FiChevronUp, FiEye,FiX } from 'react-icons/fi';

const OrderEditHistory = ({ snapshots = [], currentOrder }) => {
  console.log("Snapshots:", snapshots);
  console.log("Current Order:", currentOrder);
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [detailedView, setDetailedView] = useState(null);

  if (!snapshots || snapshots.length === 0) {
    return null;
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getEditTypeIcon = (changes) => {
    if (changes.includes('orderItems')) return <FiPackage className="w-4 h-4" />;
    if (changes.includes('deliveryAddress') || changes.includes('deliveryLocation')) return <FiMapPin className="w-4 h-4" />;
    if (changes.includes('additionalInfo')) return <FiInfo className="w-4 h-4" />;
    return <FiDollarSign className="w-4 h-4" />;
  };

  const getEditTypeLabel = (changes) => {
    if (changes.includes('orderItems')) return "Items Updated";
    if (changes.includes('deliveryAddress') || changes.includes('deliveryLocation')) return "Address Changed";
    if (changes.includes('additionalInfo')) return "Info Updated";
    return "Pricing Updated";
  };

  // Function to extract pricing data from different structures
  const getPricingData = (orderData) => {
    if (!orderData) return {};
    
    // Check if it's a snapshot (has data directly) or current order (has pricing object)
    const isSnapshot = orderData.data && orderData.changes; // This identifies snapshot structure
    
    let pricingData = {};
    
    if (isSnapshot) {
      // For snapshots, data is directly in the object
      pricingData = {
        itemsTotal: orderData.data.subtotal || 0, // Snapshots don't have itemsTotal, use subtotal
        subtotal: orderData.data.subtotal || 0,
        packingCharges: orderData.data.chargesBreakdown?.totalPackingCharge || 0,
        deliveryCharge: orderData.data.deliveryCharge || 0,
        additionalCharges: orderData.data.chargesBreakdown?.totalAdditionalCharges || 0,
        tax: orderData.data.tax || orderData.data.totalTaxAmount || 0,
        totalDiscount: orderData.data.totalDiscount || 0,
        grandTotal: orderData.data.totalAmount || 0
      };
    } else {
      // For current order, data is in pricing object
      const pricing = orderData.pricing || {};
      pricingData = {
        itemsTotal: pricing.itemsTotal || 0,
        subtotal: pricing.subtotal || 0,
        packingCharges: pricing.totalPackingCharge || 0,
        deliveryCharge: pricing.deliveryCharge || 0,
        additionalCharges: pricing.totalAdditionalCharges || 0,
        tax: pricing.tax || pricing.totalTaxAmount || 0,
        totalDiscount: pricing.discountAmount || 0,
        grandTotal: pricing.grandTotal || 0
      };
    }
    
    return pricingData;
  };

  // const BillCard = ({ data, title, isCurrent = false, showDetailsButton = false, onViewDetails }) => {
  //   const pricing = getPricingData(data);
    
  //   return (
  //     <div className={`bg-gradient-to-br ${isCurrent ? 'from-green-50 to-emerald-50 border-green-200' : 'from-blue-50 to-indigo-50 border-blue-200'} rounded-lg border p-4 flex-1 min-w-[280px]`}>
  //       <div className="flex justify-between items-start mb-3">
  //         <div>
  //           <h3 className={`font-bold ${isCurrent ? 'text-green-800' : 'text-blue-800'} text-sm`}>
  //             {title}
  //           </h3>
  //           {data?.timestamp && !isCurrent && (
  //             <p className="text-xs text-gray-600 mt-1">
  //               {formatDateTime(data.timestamp)}
  //             </p>
  //           )}
  //         </div>
  //         <div className="flex items-center gap-2">
  //           {isCurrent && (
  //             <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
  //               Current
  //             </span>
  //           )}
  //           {showDetailsButton && onViewDetails && (
  //             <button
  //               onClick={onViewDetails}
  //               className="bg-blue-100 text-blue-800 p-1 rounded-full hover:bg-blue-200 transition-colors"
  //               title="View Details"
  //             >
  //               <FiEye className="w-3 h-3" />
  //             </button>
  //           )}
  //         </div>
  //       </div>

  //       <div className="space-y-2 text-sm">
  //         {/* Items Total */}
  //         <div className="flex justify-between">
  //           <span className="text-gray-600">Items Total:</span>
  //           <span className="font-semibold">₹{pricing.itemsTotal.toFixed(2)}</span>
  //         </div>

  //         {/* Subtotal */}
  //         <div className="flex justify-between">
  //           <span className="text-gray-600">Subtotal:</span>
  //           <span className="font-semibold">₹{pricing.subtotal.toFixed(2)}</span>
  //         </div>

  //         {/* Packing Charges */}
  //         {pricing.packingCharges > 0 && (
  //           <div className="flex justify-between">
  //             <span className="text-gray-600">Packing Charges:</span>
  //             <span className="font-semibold">₹{pricing.packingCharges.toFixed(2)}</span>
  //           </div>
  //         )}

  //         {/* Delivery Charges */}
  //         {pricing.deliveryCharge > 0 && (
  //           <div className="flex justify-between">
  //             <span className="text-gray-600">Delivery Charges:</span>
  //             <span className="font-semibold">₹{pricing.deliveryCharge.toFixed(2)}</span>
  //           </div>
  //         )}

  //         {/* Additional Charges */}
  //         {pricing.additionalCharges > 0 && (
  //           <div className="flex justify-between">
  //             <span className="text-gray-600">Additional Charges:</span>
  //             <span className="font-semibold">₹{pricing.additionalCharges.toFixed(2)}</span>
  //           </div>
  //         )}

  //         {/* Tax */}
  //         {pricing.tax > 0 && (
  //           <div className="flex justify-between">
  //             <span className="text-gray-600">Tax:</span>
  //             <span className="font-semibold">₹{pricing.tax.toFixed(2)}</span>
  //           </div>
  //         )}

  //         {/* Discount */}
  //         {pricing.totalDiscount > 0 && (
  //           <div className="flex justify-between bg-green-50 p-2 rounded border border-green-200">
  //             <span className="text-green-700">Discount:</span>
  //             <span className="font-semibold text-green-700">-₹{pricing.totalDiscount.toFixed(2)}</span>
  //           </div>
  //         )}

  //         {/* Tip Amount (for snapshots) */}
  //         {data?.data?.tipAmount > 0 && (
  //           <div className="flex justify-between bg-yellow-50 p-2 rounded border border-yellow-200">
  //             <span className="text-yellow-700">Tip:</span>
  //             <span className="font-semibold text-yellow-700">₹{data.data.tipAmount.toFixed(2)}</span>
  //           </div>
  //         )}

  //         {/* Grand Total */}
  //         <div className="border-t border-gray-300 pt-2 mt-2">
  //           <div className="flex justify-between font-bold">
  //             <span className={isCurrent ? 'text-green-800' : 'text-blue-800'}>Grand Total</span>
  //             <span className={isCurrent ? 'text-green-800' : 'text-blue-800'}>₹{pricing.grandTotal.toFixed(2)}</span>
  //           </div>
  //         </div>

  //         {/* Items Count */}
  //         {(data?.orderItems || data?.data?.orderItems) && (
  //           <div className="text-xs text-gray-500 text-center mt-2">
  //             {(data.orderItems || data.data.orderItems).length} item{(data.orderItems || data.data.orderItems).length !== 1 ? 's' : ''}
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // };
  const BillCard = ({ data, title, isCurrent = false, showDetailsButton = false, onViewDetails }) => {
    const pricing = getPricingData(data);
    
    // Function to get the appropriate timestamp
    const getDisplayTimestamp = () => {
      if (isCurrent) {
        // For current order, show updatedAt (when last edited) or createdAt
        if (data?.updatedAt) return formatDateTime(data.updatedAt);
        if (data?.createdAt) return formatDateTime(data.createdAt);
        if (data?.orderTime) return formatDateTime(data.orderTime);
      } else {
        // For snapshots, use orderTime from INSIDE data.data (original creation time)
        if (data?.data?.orderTime) return formatDateTime(data.data.orderTime);
        if (data?.data?.createdAt) formatDateTime(data.data.createdAt);
        // Fallback to snapshot timestamp if nothing else
        if (data?.timestamp) return formatDateTime(data.timestamp);
      }
      return "N/A";
    };

    return (
      <div className={`bg-gradient-to-br ${isCurrent ? 'from-green-50 to-emerald-50 border-green-200' : 'from-blue-50 to-indigo-50 border-blue-200'} rounded-lg border p-4 flex-1 min-w-[280px]`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className={`font-bold ${isCurrent ? 'text-green-800' : 'text-blue-800'} text-sm`}>
              {title}
            </h3>
            {/* Show timestamp for ALL bills */}
            <p className="text-xs text-gray-600 mt-1">
              {getDisplayTimestamp()}
              {isCurrent && data?.updatedAt && (
                <span className="text-green-600 ml-1">(Last Edited)</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isCurrent && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Current
              </span>
            )}
            {showDetailsButton && onViewDetails && (
              <button
                onClick={onViewDetails}
                className="bg-blue-100 text-blue-800 p-1 rounded-full hover:bg-blue-200 transition-colors"
                title="View Details"
              >
                <FiEye className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {/* Items Total */}
          <div className="flex justify-between">
            <span className="text-gray-600">Items Total:</span>
            <span className="font-semibold">₹{pricing.itemsTotal.toFixed(2)}</span>
          </div>

          {/* Subtotal */}
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold">₹{pricing.subtotal.toFixed(2)}</span>
          </div>

          {/* Packing Charges */}
          {pricing.packingCharges > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Packing Charges:</span>
              <span className="font-semibold">₹{pricing.packingCharges.toFixed(2)}</span>
            </div>
          )}

          {/* Delivery Charges */}
          {pricing.deliveryCharge > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Charges:</span>
              <span className="font-semibold">₹{pricing.deliveryCharge.toFixed(2)}</span>
            </div>
          )}

          {/* Additional Charges */}
          {pricing.additionalCharges > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Additional Charges:</span>
              <span className="font-semibold">₹{pricing.additionalCharges.toFixed(2)}</span>
            </div>
          )}

          {/* Tax */}
          {pricing.tax > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tax:</span>
              <span className="font-semibold">₹{pricing.tax.toFixed(2)}</span>
            </div>
          )}

          {/* Discount */}
          {pricing.totalDiscount > 0 && (
            <div className="flex justify-between bg-green-50 p-2 rounded border border-green-200">
              <span className="text-green-700">Discount:</span>
              <span className="font-semibold text-green-700">-₹{pricing.totalDiscount.toFixed(2)}</span>
            </div>
          )}

          {/* Tip Amount (for snapshots) */}
          {data?.data?.tipAmount > 0 && (
            <div className="flex justify-between bg-yellow-50 p-2 rounded border border-yellow-200">
              <span className="text-yellow-700">Tip:</span>
              <span className="font-semibold text-yellow-700">₹{data.data.tipAmount.toFixed(2)}</span>
            </div>
          )}

          {/* Tip Amount (for current order) */}
          {isCurrent && data?.pricing?.tipAmount > 0 && (
            <div className="flex justify-between bg-yellow-50 p-2 rounded border border-yellow-200">
              <span className="text-yellow-700">Tip:</span>
              <span className="font-semibold text-yellow-700">₹{data.pricing.tipAmount.toFixed(2)}</span>
            </div>
          )}

          {/* Grand Total */}
          <div className="border-t border-gray-300 pt-2 mt-2">
            <div className="flex justify-between font-bold">
              <span className={isCurrent ? 'text-green-800' : 'text-blue-800'}>Grand Total</span>
              <span className={isCurrent ? 'text-green-800' : 'text-blue-800'}>₹{pricing.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Items Count */}
          {(data?.orderItems || data?.data?.orderItems) && (
            <div className="text-xs text-gray-500 text-center mt-2">
              {(data.orderItems || data.data.orderItems).length} item{(data.orderItems || data.data.orderItems).length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    );
  };
  const DetailedView = ({ snapshot, onClose }) => {
    const isSnapshot = snapshot.data && snapshot.changes;
    const data = isSnapshot ? snapshot.data : snapshot;
    const pricing = getPricingData(snapshot);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-t-xl text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">
                  {isSnapshot ? 'Previous Order Details' : 'Current Order Details'}
                </h2>
                <p className="text-purple-100 text-sm mt-1">
                  {isSnapshot ? formatDateTime(snapshot.timestamp) : 'Latest Version'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-purple-200 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Bill Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-800 text-sm mb-3">Bill Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items Total:</span>
                    <span className="font-semibold">₹{pricing.itemsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">₹{pricing.subtotal.toFixed(2)}</span>
                  </div>
                  {pricing.packingCharges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Packing Charges:</span>
                      <span className="font-semibold">₹{pricing.packingCharges.toFixed(2)}</span>
                    </div>
                  )}
                  {pricing.deliveryCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Charges:</span>
                      <span className="font-semibold">₹{pricing.deliveryCharge.toFixed(2)}</span>
                    </div>
                  )}
                  {pricing.additionalCharges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Additional Charges:</span>
                      <span className="font-semibold">₹{pricing.additionalCharges.toFixed(2)}</span>
                    </div>
                  )}
                  {pricing.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-semibold">₹{pricing.tax.toFixed(2)}</span>
                    </div>
                  )}
                  {pricing.totalDiscount > 0 && (
                    <div className="flex justify-between bg-green-50 p-2 rounded border border-green-200">
                      <span className="text-green-700">Discount:</span>
                      <span className="font-semibold text-green-700">-₹{pricing.totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {isSnapshot && data.tipAmount > 0 && (
                    <div className="flex justify-between bg-yellow-50 p-2 rounded border border-yellow-200">
                      <span className="text-yellow-700">Tip:</span>
                      <span className="font-semibold text-yellow-700">₹{data.tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-blue-800">Grand Total</span>
                      <span className="text-blue-800">₹{pricing.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Edit Info for snapshots */}
              {isSnapshot && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    {getEditTypeIcon(snapshot.changes || [])}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getEditTypeLabel(snapshot.changes || [])}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Edited by: {snapshot.editedBy || 'Admin'}
                      </p>
                    </div>
                  </div>
                  
                  {snapshot.changes && snapshot.changes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Changed Fields:</p>
                      <div className="flex flex-wrap gap-1">
                        {snapshot.changes.map((change, index) => (
                          <span
                            key={index}
                            className="bg-white px-2 py-1 rounded-full text-xs font-medium text-purple-700 border border-purple-200"
                          >
                            {change}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Items List */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-2">
                {data?.orderItems?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        {item.variation && (
                          <p className="text-sm text-gray-500">{item.variation}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{item.totalPrice?.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address Info */}
            {data?.deliveryAddress && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{data.deliveryAddress.street}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {data.deliveryAddress.area && `${data.deliveryAddress.area}, `}
                    {data.deliveryAddress.city}, {data.deliveryAddress.state} {data.deliveryAddress.zip || data.deliveryAddress.pincode}
                  </p>
                  {data.deliveryAddress.landmark && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Landmark:</span> {data.deliveryAddress.landmark}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Additional Info */}
            {data?.additionalInfo && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Additional Information</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  {data.additionalInfo.address && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Address:</span> {data.additionalInfo.address}
                    </p>
                  )}
                  {data.additionalInfo.landmark && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Landmark:</span> {data.additionalInfo.landmark}
                    </p>
                  )}
                  {data.additionalInfo.secondaryContact && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Secondary Contact:</span> {data.additionalInfo.secondaryContact}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Edit History Badge */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/50 overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 text-left hover:bg-pink-50 transition-colors duration-200"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <FiClock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Order Edit History</h3>
                <p className="text-gray-600 text-xs mt-0.5">
                  {snapshots.length} edit{snapshots.length !== 1 ? 's' : ''} made to this order
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Edited Order
              </span>
              {isOpen ? <FiChevronUp className="w-5 h-5 text-gray-500" /> : <FiChevronDown className="w-5 h-5 text-gray-500" />}
            </div>
          </div>
        </button>

        {/* Expanded History */}
        {isOpen && (
          <div className="border-t border-pink-100">
            <div className="p-4 space-y-6">
              {/* Current Bill Row */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Current Bill</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  <BillCard 
                    data={currentOrder} 
                    title="Current Bill" 
                    isCurrent={true}
                    showDetailsButton={true}
                    onViewDetails={() => setDetailedView(currentOrder)}
                  />
                </div>
              </div>

              {/* Previous Bills */}
              {snapshots.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Previous Bills</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {snapshots.map((snapshot, index) => (
                      <BillCard
                        key={snapshot._id || index}
                        data={snapshot}
                        title={`Version ${snapshots.length - index}`}
                        showDetailsButton={true}
                        onViewDetails={() => setDetailedView(snapshot)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Edit History List */}
              {/* <div>
                <h3 className="font-semibold text-gray-900 mb-3">Edit History</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {snapshots.map((snapshot, index) => (
                    <div
                      key={snapshot._id || index}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => setDetailedView(snapshot)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getEditTypeIcon(snapshot.changes || [])}
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {getEditTypeLabel(snapshot.changes || [])}
                            </p>
                            <p className="text-gray-600 text-xs">
                              {formatDateTime(snapshot.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600 text-sm">
                            ₹{getPricingData(snapshot).grandTotal.toFixed(2)}
                          </p>
                          <p className="text-gray-500 text-xs">Previous Total</p>
                        </div>
                      </div>
                      
                      {snapshot.changes && snapshot.changes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {snapshot.changes.slice(0, 3).map((change, changeIndex) => (
                            <span
                              key={changeIndex}
                              className="bg-white px-2 py-1 rounded-full text-xs font-medium text-purple-700 border border-purple-200"
                            >
                              {change}
                            </span>
                          ))}
                          {snapshot.changes.length > 3 && (
                            <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-500 border border-gray-200">
                              +{snapshot.changes.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        )}
      </div>

      {/* Detailed View Modal */}
      {detailedView && (
        <DetailedView 
          snapshot={detailedView} 
          onClose={() => setDetailedView(null)} 
        />
      )}
    </>
  );
};

export default OrderEditHistory;