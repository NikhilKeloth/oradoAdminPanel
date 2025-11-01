import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Check,
  X,
  AlertCircle,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  ArrowLeftCircle,
  IndianRupee,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";
import LoadingForAdmins from "./AdminUtils/LoadingForAdmins";
import apiClient from "../../apis/apiClient/apiClient";

const RestaurantOrderList = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all"); // New state for filter

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      const res = await apiClient.get(
        `/order/restaurant/${restaurantId}?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { orders, totalOrders, totalPages, currentPage } = res.data;

      setOrders(orders);
      setFilteredOrders(orders); // Initialize filtered orders
      setTotalOrders(totalOrders);
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
      setLoading(false);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to fetch restaurant orders");
      setLoading(false);
    }
  };

  // Handle filter change
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    if (status === "all") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(
        (order) => order.orderStatus.toLowerCase() === status.toLowerCase()
      );
      setFilteredOrders(filtered);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [restaurantId, currentPage]);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return {
          icon: <Check className="w-4 h-4" />,
          color: "bg-green-100 text-green-800",
          border: "border-green-200",
        };
      case "ready":
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: "bg-blue-100 text-blue-800",
          border: "border-blue-200",
        };
      case "pending":
        return {
          icon: <Clock className="w-4 h-4" />,
          color: "bg-amber-100 text-amber-800",
          border: "border-amber-200",
        };
      case "cancelled":
        return {
          icon: <X className="w-4 h-4" />,
          color: "bg-red-100 text-red-800",
          border: "border-red-200",
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          color: "bg-gray-100 text-gray-800",
          border: "border-gray-200",
        };
    }
  };

  if (loading) {
    return <LoadingForAdmins />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-center">
            <X className="w-10 h-10 text-red-500 mb-3" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Error Loading Orders</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/admin/dashboard/restaurant-order")}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/admin/dashboard/restaurant-order")}
          className="flex items-center text-orange-600 hover:text-orange-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span className="font-medium">Back to restaurants</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-orange-500 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Orders ({totalOrders})
            </h2>
          </div>

          {/* Filter UI */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-wrap gap-2">
              {["all", "delivered", "ready", "pending", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No orders found for this status</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const status = getStatusIcon(order.orderStatus);
                const hasDelayReason = order.preparationDelayReason;
                return (
                  <div
                    key={order._id}
                    className={`border ${status.border} rounded-lg overflow-hidden transition-all hover:shadow-md relative`}
                  >
                    {hasDelayReason && (
                      <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-bl-lg">
                        Delayed
                      </div>
                    )}
                    <div className="bg-white p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div>
                          <h3 className="text-gray-800 font-medium text-lg">
                            Order #{order._id.substring(order._id.length - 6).toUpperCase()}
                          </h3>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Customer:</span>{" "}
                              {order.customerId?.name} ({order.customerId?.email})
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Payment:</span>{" "}
                              <span className="capitalize">
                                {order.paymentMethod} • {order.paymentStatus}
                              </span>
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                        >
                          {status.icon}
                          {order.orderStatus}
                        </span>
                      </div>

                      {hasDelayReason && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h4 className="font-medium text-gray-700 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1.5 text-orange-500" />
                            Delay Information
                          </h4>
                          <div className="mt-2 bg-orange-50 p-3 rounded-md">
                            <p className="text-sm text-orange-800 font-medium">
                              Reason: {order.preparationDelayReason}
                            </p>
                            {order.additionalPreparationTime && (
                              <p className="text-sm text-orange-800 mt-1">
                                Additional time needed: {order.additionalPreparationTime} minutes
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="font-medium text-gray-700 flex items-center">
                          <ShoppingBag className="w-4 h-4 mr-1.5 text-orange-500" />
                          Order Items
                        </h4>
                        <ul className="mt-2 space-y-2">
                          {order.orderItems?.map((item) => (
                            <li key={item._id} className="flex justify-between text-sm">
                              <span className="text-gray-700">
                                {item.name} × {item.quantity}
                              </span>
                              <span className="font-medium text-gray-900">
                                ₹{item.price}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="font-medium text-gray-700 flex items-center">
                          <MapPin className="w-4 h-4 mr-1.5 text-orange-500" />
                          Delivery Address
                        </h4>
                        <p className="mt-2 text-sm text-gray-600">
                          {order.deliveryAddress?.street}, {order.deliveryAddress?.city},{" "}
                          {order.deliveryAddress?.state}, {order.deliveryAddress?.country},{" "}
                          {order.deliveryAddress?.pincode}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
                        <span className="text-gray-500">
                          Ordered on {new Date(order.createdAt).toLocaleString("en-IN")}
                        </span>
                        <span className="font-semibold text-orange-600 flex items-center">
                          <IndianRupee className="w-4 h-4 mr-0.5" />
                          {order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  } transition-colors`}
                >
                  <ArrowLeftCircle className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  } transition-colors`}
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantOrderList;