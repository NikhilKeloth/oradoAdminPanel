import React from 'react';

const OrderSummaryCards = ({ 
  order, 
  canAcceptReject, 
  handleQuickAccept, 
  handleQuickReject, 
  updatingStatus,
  calculateItemsSubtotal 
}) => {
  return (
    <div className="space-y-3">
      {/* Status Management Card */}
      {canAcceptReject && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/50 overflow-hidden">
          <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50">
            <h2 className="text-sm font-bold text-gray-900 flex items-center">
              <div className="w-1.5 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full mr-2"></div>
              Quick Actions
            </h2>
          </div>

          <div className="p-3">
            <div className="space-y-2">
              <div className="text-xs text-gray-600 mb-2 text-center">
                This order is waiting for your action
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleQuickAccept}
                  disabled={updatingStatus}
                  className="flex items-center justify-center space-x-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md"
                >
                  {updatingStatus ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-1 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span>Accept Order</span>
                </button>

                <button
                  onClick={handleQuickReject}
                  disabled={updatingStatus}
                  className="flex items-center justify-center space-x-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md"
                >
                  {updatingStatus ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-1 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span>Reject Order</span>
                </button>
              </div>

              <div className="text-xs text-gray-500 text-center mt-2">
                Accepting will move the order to preparation stage
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Summary */}
      <CompactPricingSummary order={order} calculateItemsSubtotal={calculateItemsSubtotal} />

      {/* Earnings Summary */}
      <CompactEarningsSummary order={order} />
    </div>
  );
};

// Sub-components for OrderSummaryCards
const CompactPricingSummary = ({ order, calculateItemsSubtotal }) => {
  const totalDiscount = Math.abs(order.pricing?.discountAmount || 0);
  const hasCoupon = order.onlinePaymentDetails?.couponCode;
  const hasDiscount = totalDiscount > 0;
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/50 overflow-hidden sticky top-3">
      <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50">
        <h2 className="text-sm font-bold text-gray-900 flex items-center">
          <div className="w-1.5 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full mr-2"></div>
          Pricing Summary
        </h2>
      </div>

      <div className="p-3">
        <div className="space-y-1.5 text-xs">
          <CompactPricingRow label="Items Total" value={calculateItemsSubtotal()} />
          <CompactPricingRow label="Subtotal" value={order.pricing?.subtotal || calculateItemsSubtotal()} />

          {hasDiscount && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-green-700 font-semibold text-xs">
                    {hasCoupon ? 'Promo Code Discount' : 'Total Discount'}
                  </span>
                  {hasCoupon && (
                    <div className="text-green-600 text-xs mt-0.5">
                      Code: {order.onlinePaymentDetails.couponCode}
                    </div>
                  )}
                </div>
                <span className="text-green-700 font-semibold text-xs">
                  -₹{totalDiscount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {order.pricing?.totalPackingCharge > 0 && (
            <CompactPricingRow label="Packing Charges" value={order.pricing.totalPackingCharge} />
          )}

          {order.pricing?.deliveryCharge > 0 && (
            <CompactPricingRow label="Delivery Charges" value={order.pricing.deliveryCharge} />
          )}

          {order?.surgeInfo?.isSurgeApplied && order.surgeInfo.surgeAmount > 0 && (
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-2">
              <div className="flex justify-between items-center">
                <span className="text-pink-700 font-semibold text-xs">Surge Charges</span>
                <span className="text-pink-700 font-semibold text-xs">₹{order.surgeInfo.surgeAmount.toFixed(2)}</span>
              </div>
              {order.surgeInfo.surgeReason && (
                <div className="text-xs text-pink-600 mt-1">
                  Reason: {order.surgeInfo.surgeReason}
                </div>
              )}
            </div>
          )}

          {order.pricing?.totalAdditionalCharges > 0 && (
            <CompactPricingRow label="Additional Charges" value={order.pricing.totalAdditionalCharges} />
          )}

          {order.pricing?.totalTaxAmount > 0 && (
            <CompactPricingRow label="Tax" value={order.pricing.totalTaxAmount} />
          )}

          {order.pricing?.tipAmount > 0 && (
            <CompactPricingRow label="Tip" value={order.pricing.tipAmount} />
          )}

          <div className="border-t border-pink-200 pt-2 mt-1.5">
            <div className="flex justify-between items-center font-bold">
              <span className="text-gray-900 text-sm">Grand Total</span>
              <span className="text-pink-600 text-base">
                ₹{order.pricing?.grandTotal?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CompactPricingRow = ({ label, value, isDiscount = false }) => (
  <div className="flex justify-between items-center py-0.5">
    <span className="text-gray-600">{label}:</span>
    <span className={isDiscount ? "text-red-500 font-semibold" : "font-semibold text-gray-900"}>
      {isDiscount && value > 0 ? "-" : ""}₹{Math.abs(value).toFixed(2)}
    </span>
  </div>
);

const CompactEarningsSummary = ({ order }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/50 overflow-hidden sticky top-[280px]">
    <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50">
      <h2 className="text-sm font-bold text-gray-900 flex items-center">
        <div className="w-1.5 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full mr-2"></div>
        Earnings Summary
      </h2>
    </div>

    <div className="p-3">
      <div className="space-y-2">
        <CompactEarningItem
          label="Admin Commission"
          amount={order.earningsInfo?.commissionAmount}
          color="text-pink-600"
        />
        <CompactEarningItem
          label="Restaurant Earning"
          amount={order.earningsInfo?.merchantEarning}
          color="text-rose-600"
        />
      </div>
    </div>
  </div>
);

const CompactEarningItem = ({ label, amount, color }) => (
  <div className="flex justify-between items-center p-2 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-100">
    <span className="text-gray-700 font-semibold text-sm">{label}</span>
    <span className={`font-bold text-sm ${color}`}>
      ₹{amount?.toFixed(2) || "0.00"}
    </span>
  </div>
);

export default OrderSummaryCards;