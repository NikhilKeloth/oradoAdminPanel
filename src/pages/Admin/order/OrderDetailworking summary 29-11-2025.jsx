import React, { useEffect, useState, useCallback } from "react";
import OrderHistory from "./OrderHistory";
import { useParams, useNavigate } from "react-router-dom";
import { getAdminOrderDetails, updateOrderDetails } from "../../../apis/adminApis/adminFuntionsApi";
import { updateOrderStatus } from "../../../apis/adminApis/orderApi";
import { toast } from 'react-toastify';
import { FiEdit2, FiSave, FiX, FiMapPin } from 'react-icons/fi';
import axios from 'axios';

// Import the split components
import OrderItemsSection from "./OrderItemsSection";
import MapLocationPicker from "./MapLocationPicker";
import OrderSummaryCards from "./OrderSummaryCards";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://orado.online/backend';

// Real-time Pricing Summary Component
// Real-time Pricing Summary Component
const RealTimePricingSummary = ({ order, pricingData, loading, editedItems }) => {
  const calculateItemsSubtotal = () => {
    if (!editedItems?.length) return 0;
    return editedItems.reduce((total, item) => total + (item.totalPrice || 0), 0);
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/50 overflow-hidden">
        <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50">
          <h2 className="text-sm font-bold text-gray-900 flex items-center">
            <div className="w-1.5 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full mr-2"></div>
            Updated Pricing Summary
          </h2>
        </div>
        <div className="p-3">
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto"></div>
            <p className="text-gray-600 text-sm mt-2">Updating prices...</p>
          </div>
        </div>
      </div>
    );
  }

  const displayPricing = pricingData || order.pricing;
  const itemsSubtotal = calculateItemsSubtotal();
  const totalDiscount = Math.abs(displayPricing?.discountAmount || 0);
  const hasCoupon = order.onlinePaymentDetails?.couponCode;
  const hasDiscount = totalDiscount > 0;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/50 overflow-hidden">
      <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50">
        <h2 className="text-sm font-bold text-gray-900 flex items-center">
          <div className="w-1.5 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full mr-2"></div>
          Updated Pricing Summary
        </h2>
      </div>

      <div className="p-3">
        <div className="space-y-1.5 text-xs">
          {/* Items Total */}
          <div className="flex justify-between items-center py-0.5">
            <span className="text-gray-600">Items Total:</span>
            <span className="font-semibold text-gray-900">
              ₹{itemsSubtotal.toFixed(2)}
            </span>
          </div>

          {/* Subtotal */}
          <div className="flex justify-between items-center py-0.5">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold text-gray-900">
              ₹{displayPricing?.subtotal?.toFixed(2) || itemsSubtotal.toFixed(2)}
            </span>
          </div>

          {/* Discount */}
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

          {/* Packing Charges */}
          {displayPricing?.totalPackingCharge > 0 && (
            <div className="flex justify-between items-center py-0.5">
              <span className="text-gray-600">Packing Charges:</span>
              <span className="font-semibold text-gray-900">
                ₹{displayPricing.totalPackingCharge.toFixed(2)}
              </span>
            </div>
          )}

          {/* Delivery Charges - ADDED */}
          <div className="flex justify-between items-center py-0.5">
            <span className="text-gray-600">Delivery Charges:</span>
            <span className="font-semibold text-gray-900">
              ₹{displayPricing?.deliveryFee?.toFixed(2) || displayPricing?.deliveryCharge?.toFixed(2) || "0.00"}
            </span>
          </div>

          {/* Surge Charges */}
          {order?.surgeInfo?.isSurgeApplied && order.surgeInfo.surgeAmount > 0 && (
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-2">
              <div className="flex justify-between items-center">
                <span className="text-pink-700 font-semibold text-xs">Surge Charges</span>
                <span className="text-pink-700 font-semibold text-xs">
                  ₹{order.surgeInfo.surgeAmount.toFixed(2)}
                </span>
              </div>
              {order.surgeInfo.surgeReason && (
                <div className="text-xs text-pink-600 mt-1">
                  Reason: {order.surgeInfo.surgeReason}
                </div>
              )}
            </div>
          )}

          {/* Additional Charges */}
          {displayPricing?.totalAdditionalCharges > 0 && (
            <div className="flex justify-between items-center py-0.5">
              <span className="text-gray-600">Additional Charges:</span>
              <span className="font-semibold text-gray-900">
                ₹{displayPricing.totalAdditionalCharges.toFixed(2)}
              </span>
            </div>
          )}

          {/* Tax */}
          {displayPricing?.totalTaxAmount > 0 && (
            <div className="flex justify-between items-center py-0.5">
              <span className="text-gray-600">Tax:</span>
              <span className="font-semibold text-gray-900">
                ₹{displayPricing.totalTaxAmount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Tip */}
          {displayPricing?.tipAmount > 0 && (
            <div className="flex justify-between items-center py-0.5">
              <span className="text-gray-600">Tip:</span>
              <span className="font-semibold text-gray-900">
                ₹{displayPricing.tipAmount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Grand Total */}
          <div className="border-t border-pink-200 pt-2 mt-1.5">
            <div className="flex justify-between items-center font-bold">
              <span className="text-gray-900 text-sm">Grand Total</span>
              <span className="text-pink-600 text-base">
                ₹{displayPricing?.finalAmount?.toFixed(2) || displayPricing?.grandTotal?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>

          {/* Distance Info - ADDED */}
          {displayPricing?.distanceKm && (
            <div className="text-xs text-gray-500 text-center mt-2">
              Delivery distance: {displayPricing.distanceKm} km
            </div>
          )}

          {pricingData && (
            <div className="text-xs text-green-600 text-center mt-2">
              Prices updated in real-time
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// Original Bill Summary Component (Shows when editing)
const OriginalBillSummary = ({ order, calculateItemsSubtotal }) => {
  const totalDiscount = Math.abs(order.pricing?.discountAmount || 0);
  const hasCoupon = order.onlinePaymentDetails?.couponCode;
  const hasDiscount = totalDiscount > 0;
  
  return (
    <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-200 bg-gradient-to-r from-gray-100 to-gray-200">
        <h2 className="text-sm font-bold text-gray-700 flex items-center">
          <div className="w-1.5 h-4 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full mr-2"></div>
          Original Bill Summary
        </h2>
      </div>

      <div className="p-3">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center py-0.5">
            <span className="text-gray-600">Items Total:</span>
            <span className="font-semibold text-gray-900">
              ₹{calculateItemsSubtotal().toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold text-gray-900">
              ₹{order.pricing?.subtotal?.toFixed(2) || calculateItemsSubtotal().toFixed(2)}
            </span>
          </div>

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
            <div className="flex justify-between items-center py-0.5">
              <span className="text-gray-600">Packing Charges:</span>
              <span className="font-semibold text-gray-900">
                ₹{order.pricing.totalPackingCharge.toFixed(2)}
              </span>
            </div>
          )}

          {order.pricing?.deliveryCharge > 0 && (
            <div className="flex justify-between items-center py-0.5">
              <span className="text-gray-600">Delivery Charges:</span>
              <span className="font-semibold text-gray-900">
                ₹{order.pricing.deliveryCharge.toFixed(2)}
              </span>
            </div>
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
            <div className="flex justify-between items-center py-0.5">
              <span className="text-gray-600">Additional Charges:</span>
              <span className="font-semibold text-gray-900">
                ₹{order.pricing.totalAdditionalCharges.toFixed(2)}
              </span>
            </div>
          )}

          {order.pricing?.totalTaxAmount > 0 && (
            <div className="flex justify-between items-center py-0.5">
              <span className="text-gray-600">Tax:</span>
              <span className="font-semibold text-gray-900">
                ₹{order.pricing.totalTaxAmount.toFixed(2)}
              </span>
            </div>
          )}

          {order.pricing?.tipAmount > 0 && (
            <div className="flex justify-between items-center py-0.5">
              <span className="text-gray-600">Tip:</span>
              <span className="font-semibold text-gray-900">
                ₹{order.pricing.tipAmount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="border-t border-gray-300 pt-2 mt-1.5">
            <div className="flex justify-between items-center font-bold">
              <span className="text-gray-900 text-sm">Grand Total</span>
              <span className="text-gray-700 text-base">
                ₹{order.pricing?.grandTotal?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showAddressMap, setShowAddressMap] = useState(false);

  // Real-time pricing states
  const [realTimePricing, setRealTimePricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Form states for editing
  const [editedDeliveryAddress, setEditedDeliveryAddress] = useState({});
  const [editedAdditionalInfo, setEditedAdditionalInfo] = useState({});
  const [editedItems, setEditedItems] = useState([]);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminOrderDetails(orderId);
      setOrder(response);
      if (response) {
        setEditedAdditionalInfo(response.additionalInfo || {});
        setEditedItems(response.orderItems || []);
        setEditedDeliveryAddress(response.deliveryAddress || {});
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Fetch real-time pricing when items or address change during editing
  const fetchRealTimePricing = useCallback(async () => {
    if (!order?.cartId || !isEditing) return;
    
    try {
      setPricingLoading(true);
      const requestData = {
        cartId: order.cartId,
        userId: order.customer?._id,
        tipAmount: 0,
        couponCode: "",
        flatDiscount: 0,
        latitude: order.deliveryLocation?.coordinates[1],
        longitude: order.deliveryLocation?.coordinates[0],
        loyaltyPointsToRedeem: 0,
        useLoyaltyPoints: false,
        useWallet: false,
        walletAmount: 0
      };

      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `${API_BASE_URL}/order/pricesummary`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setRealTimePricing(response.data.data);
    } catch (error) {
      console.error('Error fetching real-time pricing:', error);
    } finally {
      setPricingLoading(false);
    }
  }, [order, isEditing]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Fetch real-time pricing when editing starts or items/address change
  useEffect(() => {
    if (isEditing && editingSection === 'items') {
      // Initial fetch when editing starts
      fetchRealTimePricing();
    }
  }, [isEditing, editingSection, fetchRealTimePricing]);

  const handleStatusChange = async (newStatus) => {
    if (!orderId) return;

    setUpdatingStatus(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrder(prev => ({
        ...prev,
        orderStatus: newStatus
      }));
      toast.success(`Order ${newStatus === "accepted_by_restaurant" ? "accepted" : "rejected"} successfully`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleQuickAccept = () => {
    handleStatusChange("accepted_by_restaurant");
  };

  const handleQuickReject = () => {
    handleStatusChange("rejected_by_restaurant");
  };

  // Edit handlers
  const startEditing = (section) => {
    setIsEditing(true);
    setEditingSection(section);
    // Reset real-time pricing when starting to edit
    setRealTimePricing(null);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingSection(null);
    // Reset edited data
    setEditedAdditionalInfo(order.additionalInfo || {});
    setEditedItems([...order.orderItems]);
    setEditedDeliveryAddress(order.deliveryAddress || {});
    // Clear real-time pricing
    setRealTimePricing(null);
  };

  const saveEditing = async () => {
    try {
      const updatedData = {};

      if (editingSection === 'additionalInfo') {
        updatedData.additionalInfo = editedAdditionalInfo;
      } else if (editingSection === 'items') {
        updatedData.orderItems = editedItems;
      } else if (editingSection === 'address') {
        updatedData.deliveryAddress = editedDeliveryAddress;
        if (order.deliveryLocation) {
          updatedData.deliveryLocation = order.deliveryLocation;
        }
      }

      await updateOrderDetails(orderId, updatedData);

      // Update local state
      setOrder(prev => ({
        ...prev,
        ...(editingSection === 'additionalInfo' && { additionalInfo: editedAdditionalInfo }),
        ...(editingSection === 'items' && { orderItems: editedItems }),
        ...(editingSection === 'address' && {
          deliveryAddress: editedDeliveryAddress
        })
      }));
      
      setIsEditing(false);
      setEditingSection(null);
      setRealTimePricing(null);
      toast.success('Order updated successfully');

    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Failed to update order');
    }
  };

  // Handle items update from OrderItemsSection
  const handleItemsUpdate = (updatedItems) => {
    setEditedItems(updatedItems);
    // Trigger real-time pricing update when items change
    if (isEditing && editingSection === 'items') {
      fetchRealTimePricing();
    }
  };

  // Handle address selection - trigger pricing update
  const handleAddressSelect = async (addressData) => {
    try {
      const updatedAddress = {
        ...editedDeliveryAddress,
        ...addressData,
        _id: editedDeliveryAddress._id,
        type: "Other",
        street: addressData.street || editedDeliveryAddress.street,
        area: addressData.area || editedDeliveryAddress.area,
        landmark: addressData.landmark || editedDeliveryAddress.landmark,
        city: addressData.city || editedDeliveryAddress.city,
        state: addressData.state || editedDeliveryAddress.state,
        zip: addressData.zip || editedDeliveryAddress.zip,
        pincode: addressData.zip || editedDeliveryAddress.pincode,
        country: addressData.country || editedDeliveryAddress.country
      };
      
      setEditedDeliveryAddress(updatedAddress);
      setShowAddressMap(false);
      
      const updatedOrder = {
        ...order,
        deliveryAddress: updatedAddress,
        deliveryLocation: addressData.location || order.deliveryLocation
      };
      setOrder(updatedOrder);
      
      // Trigger real-time pricing update when address changes
      if (isEditing) {
        fetchRealTimePricing();
      }
      
      toast.success('Delivery address updated');

    } catch (error) {
      console.error('Error in handleAddressSelect:', error);
      toast.error('Failed to update delivery address');
    }
  };

  // Additional info handlers
  const handleAdditionalInfoChange = (field, value) => {
    setEditedAdditionalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-700 border border-gray-200";
    switch (status.toLowerCase()) {
      case "cancelled":
      case "cancelled_by_customer":
        return "bg-red-100 text-red-700 border border-red-200";
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-700 border border-green-200";
      case "accepted_by_restaurant":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "pending":
        return "bg-pink-100 text-pink-700 border border-pink-200";
      case "preparing":
        return "bg-purple-100 text-purple-700 border border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const calculateItemsSubtotal = () => {
    if (!order?.orderItems?.length) return 0;
    return order.orderItems.reduce((total, item) => total + (item.totalPrice || 0), 0);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const canAcceptReject = order?.orderStatus === "pending" || order?.orderStatus === "awaiting_agent_assignment";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-lg border border-pink-100 p-4">
            <div className="text-red-600 text-sm font-semibold mb-3">{error}</div>
            <button
              onClick={fetchOrderDetails}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-lg hover:shadow-md transition-all duration-200 font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg border border-pink-100 p-4">
            <div className="text-pink-800 text-sm font-semibold">Order not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header Section */}
        <div className="mb-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/50 p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-1 text-gray-600 hover:text-pink-600 transition-all duration-200 p-2 rounded-lg hover:bg-pink-50 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="font-medium">Back</span>
                </button>
                <div className="h-4 w-px bg-gradient-to-b from-pink-200 to-rose-200"></div>
                <div>
                  <h1 className="text-base font-bold text-gray-900">Order Details</h1>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Order ID: #{order._id ? order._id.substring(order._id.length - 8).toUpperCase() : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Edit Button */}
                <button
                  onClick={() => !isEditing ? startEditing('items') : saveEditing()}
                  disabled={updatingStatus}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md ${
                    isEditing
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-pink-500 hover:bg-pink-600 text-white'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <FiSave className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  ) : (
                    <>
                      <FiEdit2 className="w-4 h-4" />
                      <span>Edit Order</span>
                    </>
                  )}
                </button>
                {isEditing && (
                  <button
                    onClick={cancelEditing}
                    className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                  >
                    <FiX className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                )}

                <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-lg text-center min-w-[120px]">
                  <div className="text-pink-100 text-xs font-medium">Total Amount</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    ₹{order.pricing?.grandTotal?.toFixed(2) || calculateItemsSubtotal().toFixed(2)}
                  </div>
                </div>

                <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Save Button */}
        {isEditing && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex items-center space-x-3">
              <button
                onClick={saveEditing}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
              >
                <FiSave className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
              <button
                onClick={cancelEditing}
                className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
              >
                <FiX className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
          {/* Left Column - Order Information */}
          <div className="xl:col-span-2 space-y-3">
            {/* Customer & Store Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/50 overflow-hidden">
              <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50">
                <h2 className="text-sm font-bold text-gray-900 flex items-center">
                  <div className="w-1.5 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full mr-2"></div>
                  Customer & Store Information
                </h2>
              </div>

              <div className="p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <CompactInfoCard
                    label="Customer"
                    value={order.customer?.name || "N/A"}
                    subValue={order.customer?._id ? `ID: ${order.customer._id.substring(order.customer._id.length - 6)}` : ""}
                    highlight
                  />

                  <CompactInfoCard
                    label="Store Name"
                    value={order.restaurant?.name || "N/A"}
                    highlight
                  />

                  <CompactInfoCard
                    label="Store Phone"
                    value={order.restaurant?.phone || "N/A"}
                  />

                  <CompactInfoCard
                    label="Payment Method"
                    value={order.paymentMethod === "cash" ? "Cash on Delivery" :
                           order.paymentMethod === "online" ? "Online Payment" :
                           order.paymentMethod || "N/A"}
                  />

                  <CompactInfoCard
                    label="Email"
                    value={order.customer?.email || "N/A"}
                  />

                  <CompactInfoCard
                    label="Customer Phone"
                    value={order.customer?.phone || "N/A"}
                  />

                  <CompactInfoCard
                    label="Order Time"
                    value={formatDateTime(order.orderTime)}
                  />

                  <CompactInfoCard
                    label="Preparation Time"
                    value={`${order.preparationTime || "0"} minutes`}
                  />
                </div>

                {/* Address & Instructions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                  {/* Customer Delivery Address - Editable */}
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-2 rounded-lg border border-pink-100 relative">
                    <div className="text-gray-700 text-xs font-semibold mb-1 flex justify-between items-center">
                      <span>Delivery Address</span>
                      {isEditing && (
                        <button
                          onClick={() => {
                            startEditing('address');
                            setShowAddressMap(true);
                          }}
                          className="flex items-center space-x-1 text-pink-600 hover:text-pink-700 text-xs font-medium"
                        >
                          <FiMapPin className="w-3 h-3" />
                          <span>Change Location</span>
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-gray-800">
                      {order.deliveryAddress ? (
                        <>
                          <div className="font-medium text-gray-900 text-sm">{order.deliveryAddress.street}</div>
                          <div className="text-gray-600 mt-0.5">
                            {order.deliveryAddress.area && `${order.deliveryAddress.area}, `}
                            {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zip || order.deliveryAddress.pincode}
                          </div>
                          {order.deliveryLocation?.coordinates && (
                            <div className="text-gray-500 text-xs mt-1">
                              Coordinates: {order.deliveryLocation.coordinates[0].toFixed(6)}, {order.deliveryLocation.coordinates[1].toFixed(6)}
                            </div>
                          )}
                        </>
                      ) : "N/A"}
                    </div>
                  </div>

                  {/* Store Address - Read-only */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-2 rounded-lg border border-blue-100">
                    <div className="text-gray-700 text-xs font-semibold mb-1">
                      Store Address
                    </div>
                    <div className="text-xs text-gray-800">
                      {order.restaurant?.address ? (
                        <>
                          <div className="font-medium text-gray-900 text-sm">{order.restaurant.address.street}</div>
                          <div className="text-gray-600 mt-0.5">
                            {order.restaurant.address.city}, {order.restaurant.address.state} {order.restaurant.address.zip}
                          </div>
                        </>
                      ) : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information - EDITABLE */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/50 overflow-hidden">
              <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 flex justify-between items-center">
                <h2 className="text-sm font-bold text-gray-900 flex items-center">
                  <div className="w-1.5 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full mr-2"></div>
                  Additional Information
                </h2>
                {isEditing && (
                  <button
                    onClick={() => startEditing('additionalInfo')}
                    className="flex items-center space-x-1 text-pink-600 hover:text-pink-700 text-xs font-medium"
                  >
                    <FiEdit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              <div className="p-3">
                {isEditing && editingSection === 'additionalInfo' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Delivery Address</label>
                        <input
                          type="text"
                          value={editedAdditionalInfo.address || ''}
                          onChange={(e) => handleAdditionalInfoChange('address', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Enter delivery address"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Landmark</label>
                        <input
                          type="text"
                          value={editedAdditionalInfo.landmark || ''}
                          onChange={(e) => handleAdditionalInfoChange('landmark', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Enter landmark"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Secondary Contact</label>
                        <input
                          type="text"
                          value={editedAdditionalInfo.secondaryContact || ''}
                          onChange={(e) => handleAdditionalInfoChange('secondaryContact', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Enter secondary contact"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <CompactInfoCard
                      label="Delivery Address"
                      value={order.additionalInfo?.address || "Not provided"}
                      highlight={!!order.additionalInfo?.address}
                    />

                    <CompactInfoCard
                      label="Landmark"
                      value={order.additionalInfo?.landmark || "Not provided"}
                      highlight={!!order.additionalInfo?.landmark}
                    />

                    <CompactInfoCard
                      label="Secondary Contact"
                      value={order.additionalInfo?.secondaryContact || "Not provided"}
                      highlight={!!order.additionalInfo?.secondaryContact}
                    />
                  </div>
                )}

                {(!order.additionalInfo?.address && !order.additionalInfo?.landmark && !order.additionalInfo?.secondaryContact) && (
                  <div className="text-center py-3 text-gray-500 text-sm">
                    No additional information provided
                  </div>
                )}
              </div>
            </div>

            {/* Order Items Section */}
            <OrderItemsSection
              order={order}
              isEditing={isEditing}
              editingSection={editingSection}
              editedItems={editedItems}
              setEditedItems={handleItemsUpdate}
              startEditing={startEditing}
            />

            {/* Order History */}
            <OrderHistory orderId={orderId} orderData={order} />
          </div>

          {/* Right Column - Pricing & Earnings */}
          <div className="space-y-3">
            {/* When NOT editing, show the regular OrderSummaryCards */}
            {!isEditing ? (
              <OrderSummaryCards
                order={order}
                canAcceptReject={canAcceptReject}
                handleQuickAccept={handleQuickAccept}
                handleQuickReject={handleQuickReject}
                updatingStatus={updatingStatus}
                calculateItemsSubtotal={calculateItemsSubtotal}
              />
            ) : (
              /* When editing, show Real-time Pricing Summary and Original Bill Summary below */
              <>
                {/* Real-time Pricing Summary */}
                <RealTimePricingSummary
                  order={order}
                  pricingData={realTimePricing}
                  loading={pricingLoading}
                  editedItems={editedItems}
                />

                {/* Original Bill Summary (moved down) */}
                <OriginalBillSummary
                  order={order}
                  calculateItemsSubtotal={calculateItemsSubtotal}
                />

                {/* Keep Earnings Summary */}
                <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center">
                      <div className="w-1.5 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full mr-2"></div>
                      Earnings Summary
                    </h2>
                  </div>

                  <div className="p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-100">
                        <span className="text-gray-700 font-semibold text-sm">Admin Commission</span>
                        <span className="font-bold text-sm text-pink-600">
                          ₹{order.earningsInfo?.commissionAmount?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-100">
                        <span className="text-gray-700 font-semibold text-sm">Restaurant Earning</span>
                        <span className="font-bold text-sm text-rose-600">
                          ₹{order.earningsInfo?.merchantEarning?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Address Map Modal */}
      {showAddressMap && (
        <MapLocationPicker
          onSave={handleAddressSelect}
          onClose={() => setShowAddressMap(false)}
          selectedCustomer={order.customer}
          existingAddress={order.deliveryAddress}
          existingLocation={order.deliveryLocation}
          editMode={true}
        />
      )}
    </div>
  );
};

// Keep small helper components in main file
const CompactInfoCard = ({ label, value, subValue, highlight = false }) => (
  <div className="bg-white p-2 rounded-lg border border-pink-100 hover:shadow-sm transition-all duration-200">
    <div className="text-gray-600 text-xs font-medium mb-0.5">
      {label}
    </div>
    <div className={`text-sm font-semibold ${highlight ? "text-pink-600" : "text-gray-900"}`}>
      {value}
    </div>
    {subValue && <div className="text-xs text-gray-500 mt-0.5">{subValue}</div>}
  </div>
);

export default OrderDetails;