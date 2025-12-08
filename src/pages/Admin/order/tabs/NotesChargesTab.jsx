import React, { useState, useEffect } from 'react';
import { FiEdit3, FiTag, FiChevronDown, FiFileText, FiRefreshCw, FiDollarSign, FiGift } from 'react-icons/fi';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://orado.online/backend';

const NotesChargesTab = ({
  form,
  setForm,
  subtotal,
  priceSummary,
  loadingSummary,
  summaryError,
  onCalculateSummary,
  invoiceGenerated,
  selectedCustomer,
  cartId,
  selectedMerchant
}) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCouponDropdown, setShowCouponDropdown] = useState(false);

  // Fetch coupons on component mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  // Auto-calculate summary when relevant fields change
  useEffect(() => {
    if (selectedCustomer && cartId && selectedMerchant && (form.tip > 0 || form.discount > 0 || form.coupon || form.loyalty > 0)) {
      const timer = setTimeout(() => {
        onCalculateSummary();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [form.tip, form.discount, form.coupon, form.loyalty]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/promo-code`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setCoupons(response.data.data || []);
      } else {
        setCoupons([]);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError('Failed to load coupons');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateCouponDiscount = (coupon, currentSubtotal) => {
    if (!coupon || !coupon.isActive || currentSubtotal < coupon.minOrderValue) {
      return 0;
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (currentSubtotal * coupon.discountValue) / 100;
    } else if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue;
    }

    return discount;
  };

  const handleCouponSelect = (coupon) => {
    const couponDiscount = calculateCouponDiscount(coupon, subtotal);
    
    setForm((prev) => ({
      ...prev,
      coupon: coupon.code,
      couponId: coupon._id,
      couponData: coupon,
      couponDiscount: couponDiscount
    }));
    setShowCouponDropdown(false);
  };

  const removeCoupon = () => {
    setForm((prev) => ({
      ...prev,
      coupon: '',
      couponId: null,
      couponData: null,
      couponDiscount: 0
    }));
  };

  const isCouponApplicable = (coupon) => {
    if (!coupon.isActive) {
      return false;
    }
    
    if (subtotal < coupon.minOrderValue) {
      return false;
    }

    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validTill = new Date(coupon.validTill);
    
    if (now < validFrom) {
      return false;
    }
    
    if (now > validTill) {
      return false;
    }

    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <FiTag className="text-orange-600 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Payment & Notes</h2>
          <p className="text-gray-600 text-sm">Add notes, discounts, and finalize order</p>
        </div>
      </div>

      {/* Compact Charges Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-4 flex items-center space-x-2">
          <FiDollarSign className="text-orange-500" />
          <span>Charges & Discounts</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tip Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tip Amount (₹)</label>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-3 text-orange-400 text-sm" />
              <input
                type="number"
                value={form.tip}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    tip: Number(e.target.value) || 0,
                  }))
                }
                className="pl-8 w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="Enter tip amount"
                min="0"
              />
            </div>
          </div>

          {/* Flat Discount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Flat Discount (₹)</label>
            <div className="relative">
              <FiGift className="absolute left-3 top-3 text-green-400 text-sm" />
              <input
                type="number"
                value={form.discount}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    discount: Number(e.target.value) || 0,
                  }))
                }
                className="pl-8 w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="Enter flat discount"
                min="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center space-x-2">
          <FiEdit3 className="text-orange-500" />
          <span>Order Notes</span>
        </h3>
        <textarea
          value={form.note}
          onChange={(e) =>
            setForm((s) => ({ ...s, note: e.target.value }))
          }
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          placeholder="Add order notes, special instructions, or delivery notes..."
        />
      </div>

      {/* Loyalty Points Section */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-4">Loyalty Points</h3>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Loyalty Points to Use</label>
          <div className="relative">
            <FiTag className="absolute left-3 top-3 text-orange-400 text-sm" />
            <input
              type="number"
              value={form.loyalty}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  loyalty: Math.max(0, Number(e.target.value)), // Ensure non-negative
                }))
              }
              className="pl-8 w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              placeholder="Enter loyalty points to redeem"
              min="0"
            />
          </div>
          <p className="text-xs text-gray-500">
            Enter the number of loyalty points you want to redeem for this order
          </p>
        </div>
      </div>

      {/* Coupon Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-4">Apply Coupon</h3>
        
        <div className="relative">
          {form.coupon ? (
            <div className="flex items-center justify-between p-3 border border-green-300 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <FiTag className="text-green-500" />
                <div>
                  <div className="text-sm font-medium text-green-800">{form.coupon}</div>
                  <div className="text-xs text-green-600">
                    {form.couponData?.discountType === 'percentage' 
                      ? `${form.couponData?.discountValue}% off`
                      : `₹${form.couponData?.discountValue} off`
                    }
                  </div>
                  {form.couponDiscount > 0 && (
                    <div className="text-xs text-green-700 font-medium">
                      Discount: ₹{form.couponDiscount.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={removeCoupon}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowCouponDropdown(!showCouponDropdown)}
                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              >
                <span className="text-gray-500">
                  {loading ? 'Loading coupons...' : 'Select a coupon'}
                </span>
                <FiChevronDown className={`text-gray-400 transition-transform ${showCouponDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCouponDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {loading ? (
                    <div className="p-3 text-center text-sm text-gray-500">Loading coupons...</div>
                  ) : error ? (
                    <div className="p-3 text-center text-sm text-red-500">
                      {error}
                      <button
                        onClick={fetchCoupons}
                        className="ml-2 text-orange-500 hover:text-orange-700"
                      >
                        Retry
                      </button>
                    </div>
                  ) : coupons.length === 0 ? (
                    <div className="p-3 text-center text-sm text-gray-500">No coupons available</div>
                  ) : (
                    coupons.map((coupon) => {
                      const isApplicable = isCouponApplicable(coupon);
                      const calculatedDiscount = calculateCouponDiscount(coupon, subtotal);
                      
                      return (
                        <button
                          key={coupon._id}
                          type="button"
                          onClick={() => isApplicable && handleCouponSelect(coupon)}
                          disabled={!isApplicable}
                          className={`w-full text-left p-3 border-b border-gray-100 last:border-b-0 transition-all ${
                            isApplicable 
                              ? 'hover:bg-orange-50 cursor-pointer' 
                              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="font-medium text-gray-800">{coupon.code}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {coupon.description}
                          </div>
                          <div className="text-xs mt-1">
                            <span className="font-medium">
                              {coupon.discountType === 'percentage' 
                                ? `${coupon.discountValue}% off` 
                                : `₹${coupon.discountValue} off`
                              }
                            </span>
                            {coupon.minOrderValue > 0 && (
                              <span className="ml-2">Min order: ₹{coupon.minOrderValue}</span>
                            )}
                          </div>
                          {!isApplicable && (
                            <div className="text-xs text-red-500 mt-1">
                              {!coupon.isActive 
                                ? 'Coupon not active'
                                : subtotal < coupon.minOrderValue 
                                  ? `Add ₹${(coupon.minOrderValue - subtotal).toFixed(2)} more` 
                                  : new Date() < new Date(coupon.validFrom)
                                    ? 'Coupon not yet valid'
                                    : new Date() > new Date(coupon.validTill)
                                      ? 'Coupon expired'
                                      : 'Not applicable'
                              }
                            </div>
                          )}
                          {isApplicable && calculatedDiscount > 0 && (
                            <div className="text-xs text-green-600 font-medium mt-1">
                              You save: ₹{calculatedDiscount.toFixed(2)}
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-4">Payment Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Payment Method</label>
            <select
              value={form.paymentMethod}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  paymentMethod: e.target.value,
                }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
              <option value="upi">UPI</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Payment Status</label>
            <select
              value={form.paymentStatus}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  paymentStatus: e.target.value,
                }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Generate Invoice Button */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
        <div className="text-center">
          <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center justify-center space-x-2">
            <FiFileText className="text-blue-500" />
            <span>Generate Final Invoice</span>
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Review all charges and discounts above, then generate the final invoice
          </p>
          
          <button
            type="button"
            onClick={onCalculateSummary}
            disabled={loadingSummary || !selectedCustomer || !cartId || !selectedMerchant}
            className="flex items-center justify-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-all mx-auto"
          >
            {loadingSummary ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Calculating Invoice...</span>
              </>
            ) : (
              <>
                <FiFileText className="text-sm" />
                <span>Calculate Final Amount</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Invoice Results */}
      {(priceSummary || loadingSummary || summaryError) && (
        <div className="space-y-4">
          {loadingSummary && (
            <div className="text-center py-4 bg-blue-100 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-blue-600 text-sm mt-2">Calculating invoice...</p>
            </div>
          )}

          {summaryError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{summaryError}</p>
            </div>
          )}

          {priceSummary && !loadingSummary && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">Final Invoice Summary</h3>
              
              <div className="space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Items Total</span>
                  <span className="font-semibold">₹ {priceSummary.subtotal?.toFixed(2)}</span>
                </div>

                {/* Delivery Fee */}
                {priceSummary.deliveryFee > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-semibold">₹ {priceSummary.deliveryFee?.toFixed(2)}</span>
                  </div>
                )}

                {/* Packing Charges */}
                {priceSummary.totalPackingCharge > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Packing Charges</span>
                    <span className="font-semibold">₹ {priceSummary.totalPackingCharge?.toFixed(2)}</span>
                  </div>
                )}

                {/* Additional Charges */}
                {priceSummary.totalAdditionalCharges > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Additional Charges</span>
                    <span className="font-semibold">₹ {priceSummary.totalAdditionalCharges?.toFixed(2)}</span>
                  </div>
                )}

                {/* Tax */}
                {priceSummary.tax > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tax & Charges</span>
                    <span className="font-semibold">₹ {priceSummary.tax?.toFixed(2)}</span>
                  </div>
                )}

                {/* Flat Discount */}
                {form.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Flat Discount</span>
                    <span className="font-semibold text-red-500">- ₹ {form.discount?.toFixed(2)}</span>
                  </div>
                )}

                {/* Coupon Discount */}
                {priceSummary.couponDiscount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Coupon Discount</span>
                    <span className="font-semibold text-red-500">- ₹ {priceSummary.couponDiscount?.toFixed(2)}</span>
                  </div>
                )}

                {/* Loyalty Points Discount */}
                {form.loyalty > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Loyalty Points</span>
                    <span className="font-semibold text-red-500">- ₹ {form.loyalty?.toFixed(2)}</span>
                  </div>
                )}

                {/* Tip */}
                {form.tip > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tip Amount</span>
                    <span className="font-semibold text-green-500">+ ₹ {form.tip?.toFixed(2)}</span>
                  </div>
                )}

                {/* Final Total */}
                <div className="flex justify-between items-center pt-3 border-t-2 border-green-300">
                  <span className="font-bold text-gray-800 text-lg">Final Amount</span>
                  <span className="text-xl font-bold text-green-600">₹ {priceSummary.finalAmount?.toFixed(2)}</span>
                </div>
              </div>

              {/* Loyalty Points Info */}
              {priceSummary.loyaltyPoints && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-gray-800 text-sm mb-2">Loyalty Points</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Available: {priceSummary.loyaltyPoints.available}</div>
                    <div>Used: {priceSummary.loyaltyPoints.used}</div>
                    <div>Potential Earned: {priceSummary.loyaltyPoints.potentialEarned}</div>
                    {priceSummary.loyaltyPoints.messages?.map((message, index) => (
                      <div key={index} className="text-green-600">{message}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotesChargesTab;