import React, { useEffect, useState } from "react";
import OrderHistory from "./OrderHistory";
import { useParams } from "react-router-dom";
import { getAdminOrderDetails } from "../../../apis/adminApis/adminFuntionsApi";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    try {
      const response = await getAdminOrderDetails(orderId);
      console.log("API Response:", response); // Debug log
      setOrder(response); // Access the data property
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <div className="p-4 text-gray-600">Loading order details…</div>;
  }

  if (!order) {
    return <div className="p-4 text-red-600">Order not found.</div>;
  }

  // Helper functions
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getStatusDisplay = (status) => {
    if (!status) return "N/A";
    return status.replace(/_/g, " ");
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    switch (status.toLowerCase()) {
      case "cancelled":
      case "cancelled_by_customer":
        return "bg-red-100 text-red-800";
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "accepted_by_restaurant":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate subtotal from order items
  const calculateItemsSubtotal = () => {
    if (!order.orderItems || order.orderItems.length === 0) return 0;
    return order.orderItems.reduce((total, item) => total + (item.totalPrice || 0), 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <button className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <i className="yf yf-arrow-back text-gray-600"></i>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Order Information
            <span className="ml-2 text-gray-500 font-normal">
              #{order._id ? order._id.substring(order._id.length - 8) : "N/A"}
            </span>
          </h1>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <span className="text-gray-600">Total Amount:</span>
          <span className="ml-2 text-2xl font-bold text-blue-600">
            ₹{order.pricing?.grandTotal?.toFixed(2) || calculateItemsSubtotal().toFixed(2)}
          </span>
        </div>
      </div>

      {/* Add Remark Button */}
      <div className="mb-6">
        <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Remark
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-8">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Bill Summary</h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              order.orderStatus
            )}`}
          >
            {getStatusDisplay(order.orderStatus)}
          </span>
        </div>

        {/* Card Content */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Section - Customer Details */}
            <div className="lg:w-2/3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mobile-only total amount */}
                <div className="col-span-1 sm:hidden bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-600 mb-1">Total Amount</div>
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{order.pricing?.grandTotal?.toFixed(2) || calculateItemsSubtotal().toFixed(2)}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-500 text-sm mb-1">
                    Customer{" "}
                    {order.customer?._id
                      ? `#${order.customer._id.substring(order.customer._id.length - 6)}`
                      : ""}
                  </div>
                  <div className="text-blue-600 hover:text-blue-800 font-medium">
                    {order.customer?.name || "N/A"}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-500 text-sm mb-1">Store Name</div>
                  <div className="text-blue-600 hover:text-blue-800 font-medium">
                    {order.restaurant?.name || "N/A"}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-500 text-sm mb-1">Store Phone No.</div>
                  <div>{order.restaurant?.phone || "N/A"}</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-500 text-sm mb-1">Payment Method</div>
                  <div>
                    {order.paymentMethod === "cash" ? "Cash on Delivery" : 
                     order.paymentMethod === "online" ? "Online Payment" : 
                     order.paymentMethod || "N/A"}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-500 text-sm mb-1">Email</div>
                  <div>{order.customer?.email || "N/A"}</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-500 text-sm mb-1">Order Time</div>
                  <div>{formatDateTime(order.orderTime)}</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-500 text-sm mb-1">Pickup Address</div>
                  <div className="text-sm">
                    {order.restaurant?.address
                      ? `${order.restaurant.address.street}, ${order.restaurant.address.city}, ${order.restaurant.address.state}, ${order.restaurant.address.zip}`
                      : "N/A"}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-500 text-sm mb-1">Phone No.</div>
                  <div>{order.customer?.phone || "N/A"}</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-500 text-sm mb-1">Admin Commission</div>
                  <div className="font-medium">
                    ₹{order.earningsInfo?.commissionAmount?.toFixed(2) || "0.00"}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-500 text-sm mb-1">Restaurants Earning</div>
                  <div className="font-medium">
                    ₹{order.earningsInfo?.merchantEarning?.toFixed(2) || "0.00"}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-500 text-sm mb-1">Order Preparation Time</div>
                  <div>{order.preparationTime || "0"} minutes</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-500 text-sm mb-1">Instructions</div>
                  <div className="text-gray-400">
                    {order.instructions || "No instructions"}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-500 text-sm mb-1">Cooking Instructions</div>
                  <div className="text-gray-400">
                    {order.cookingInstructions || "No cooking instructions"}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Pricing Summary */}
          {/* Right Section - Pricing Summary */}
<div className="lg:w-1/3">
  <div className="bg-gray-50 p-6 rounded-xl sticky top-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4">Pricing Summary</h3>

    <div className="space-y-3 text-sm">
      {/* Items Total */}
      <div className="flex justify-between">
        <span className="text-gray-600">Items Total:</span>
        <span>₹{calculateItemsSubtotal().toFixed(2)}</span>
      </div>

      {/* Subtotal */}
      <div className="flex justify-between">
        <span className="text-gray-600">Subtotal:</span>
        <span>₹{order.pricing?.subtotal?.toFixed(2) || calculateItemsSubtotal().toFixed(2)}</span>
      </div>

      {/* Discount */}
      {(order.pricing?.discountAmount > 0 || order.offerDetails?.couponDiscount > 0 || order.offerDetails?.offerDiscount > 0) && (
        <div className="flex justify-between">
          <span className="text-gray-600">Discount:</span>
          <span className="text-red-500">
            -₹{(
              (order.pricing?.discountAmount || 0) + 
              (order.offerDetails?.couponDiscount || 0) +
              (order.offerDetails?.offerDiscount || 0)
            ).toFixed(2)}
          </span>
        </div>
      )}

      {/* Packing Charges */}
      {order.pricing?.totalPackingCharge > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-600">Packing Charges:</span>
          <span>₹{order.pricing.totalPackingCharge.toFixed(2)}</span>
        </div>
      )}

      {/* Delivery Charges */}
      {order.pricing?.deliveryCharge > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Charges:</span>
          <span>₹{order.pricing.deliveryCharge.toFixed(2)}</span>
        </div>
      )}

      {/* 🔥 Surge Charges - Add this section */}
      {order?.surgeInfo?.isSurgeApplied && order.surgeInfo.surgeAmount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-orange-700 font-medium">Surge Charges</span>
            <span className="text-orange-700 font-medium">₹{order.surgeInfo.surgeAmount.toFixed(2)}</span>
          </div>
          {order.surgeInfo.surgeReason && (
            <div className="text-xs text-orange-600 mt-1">
              Reason: {order.surgeInfo.surgeReason}
            </div>
          )}
          {order.surgeInfo.surgeAppliedAt && (
            <div className="text-xs text-orange-500 mt-1">
              Applied: {formatDateTime(order.surgeInfo.surgeAppliedAt)}
            </div>
          )}
        </div>
      )}

      {/* Additional Charges */}
      {order.pricing?.totalAdditionalCharges > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-600">Additional Charges:</span>
          <span>₹{order.pricing.totalAdditionalCharges.toFixed(2)}</span>
        </div>
      )}

      {/* Tax */}
      {order.pricing?.totalTaxAmount > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-600">Tax:</span>
          <span>₹{order.pricing.totalTaxAmount.toFixed(2)}</span>
        </div>
      )}

      {/* Tax Breakdown */}
      {order.taxDetails && order.taxDetails.length > 0 && (
        <div className="ml-4 border-l-2 border-gray-200 pl-2">
          {order.taxDetails.map((tax, index) => (
            <div key={index} className="flex justify-between text-xs text-gray-500">
              <span>{tax.name}:</span>
              <span>₹{tax.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tip */}
      {order.pricing?.tipAmount > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-600">Tip:</span>
          <span>₹{order.pricing.tipAmount.toFixed(2)}</span>
        </div>
      )}

      {/* Grand Total */}
      <div className="border-t border-gray-200 pt-3 mt-3">
        <div className="flex justify-between font-bold text-base">
          <span>Grand Total:</span>
          <span className="text-blue-600">
            ₹{order.pricing?.grandTotal?.toFixed(2) || "0.00"}
          </span>
        </div>
      </div>


   
    </div>
  </div>
</div>
          </div>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Order Details</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {order.orderItems?.length > 0 ? (
              order.orderItems.map((item) => (
                <div
                  key={item._id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-3">
                      {item.name || "Product"}
                    </h3>

                    <div className="flex items-center mb-4">
                      <img
                        src={item.image || "/assets/images/placeholder_3.png"}
                        alt={item.name || "Product"}
                        className="w-16 h-16 object-cover rounded-md border border-gray-200"
                      />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="text-blue-600 font-medium">
                          {item.quantity || 0}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit Price:</span>
                        <span>
                          {item.totalPrice && item.quantity
                            ? `₹${(item.totalPrice / item.quantity).toFixed(2)}`
                            : "₹0.00"}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 mt-4 pt-4">
                      <div className="flex justify-between font-bold">
                        <span>Total Price:</span>
                        <span>₹{item.totalPrice?.toFixed(2) || "0.00"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                No order items found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order History Section */}
      <div className="space-y-6">
        <OrderHistory />
      </div>
    </div>
  );
};

export default OrderDetails;