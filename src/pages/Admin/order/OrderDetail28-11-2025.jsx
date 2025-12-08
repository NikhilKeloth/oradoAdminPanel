import React, { useEffect, useState, useCallback, useRef } from "react";
import OrderHistory from "./OrderHistory";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import { useParams, useNavigate } from "react-router-dom";
import { getAdminOrderDetails, updateOrderDetails } from "../../../apis/adminApis/adminFuntionsApi";
import { updateOrderStatus } from "../../../apis/adminApis/orderApi";
import { addressService } from '../../../services/addressService';  
import { toast } from 'react-toastify';
import { FiEdit2, FiSave, FiX, FiMapPin, FiPlus, FiMinus, FiTrash2, FiSearch, FiNavigation, FiMap, FiShoppingCart, FiHome, FiPackage, FiChevronUp, FiChevronDown } from 'react-icons/fi';

mapboxgl.accessToken = 'pk.eyJ1IjoiYW1hcm5hZGg2NSIsImEiOiJjbWJ3NmlhcXgwdTh1MmlzMWNuNnNvYmZ3In0.kXrgLZhaz0cmbuCvyxOd6w';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://orado.online/backend';

// Add state for expanded categories


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

  // Merchant menu states for adding items
  const [showMerchantMenu, setShowMerchantMenu] = useState(false);
  const [merchantProducts, setMerchantProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Form states for editing
  const [editedDeliveryAddress, setEditedDeliveryAddress] = useState({});
  const [editedAdditionalInfo, setEditedAdditionalInfo] = useState({});
  const [editedItems, setEditedItems] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());


const fetchRestaurantMenu = async (restaurantId) => {
  if (!restaurantId) return;
  try {
    setLoadingProducts(true);
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/restaurants/${restaurantId}/menu`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (response.data.messageType === "success") {
      setMerchantProducts(response.data.data || []);
      const categoryIds = new Set(response.data.data.map(cat => cat.categoryId));
      setExpandedCategories(categoryIds);
    } else {
      setMerchantProducts([]);
    }
  } catch (error) {
    console.error('Error fetching restaurant menu:', error);
    setMerchantProducts([]);
  } finally {
    setLoadingProducts(false);
  }
};

// Add toggle function for categories
const toggleCategory = (categoryId) => {
  setExpandedCategories(prev => {
    const newSet = new Set(prev);
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId);
    } else {
      newSet.add(categoryId);
    }
    return newSet;
  });
};
  

  // const fetchOrderDetails = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const response = await getAdminOrderDetails(orderId);
  //     setOrder(response);
  //     if (response) {
  //       setEditedAdditionalInfo(response.additionalInfo || {});
  //       setEditedItems(response.orderItems || []);
  //       setEditedDeliveryAddress(response.deliveryAddress || {});
        
  //       // Load merchant products if restaurant exists
  //       if (response.restaurant?._id) {
  //         loadMerchantProducts(response.restaurant._id);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error fetching order details:", error);
  //     setError("Failed to load order details");
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [orderId]);

  // Load merchant products
  // const loadMerchantProducts = async (merchantId) => {
  //   try {
  //     setLoadingProducts(true);
  //     // Replace with your actual API call to get merchant products
  //     const response = await axios.get(`/api/merchants/${merchantId}/products`);
  //     setMerchantProducts(response.data);
  //   } catch (error) {
  //     console.error("Error loading merchant products:", error);
  //     toast.error("Failed to load merchant menu");
  //   } finally {
  //     setLoadingProducts(false);
  //   }
  // };
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
        
        // Load merchant products if restaurant exists - CALL THE WORKING FUNCTION
        if (response.restaurant?._id) {
          fetchRestaurantMenu(response.restaurant._id);
        }
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  }, [orderId]);
  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

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
    
    // Show merchant menu when editing items
    if (section === 'items' && order?.restaurant?._id) {
      setShowMerchantMenu(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingSection(null);
    setShowMerchantMenu(false);
    // Reset edited data
    setEditedAdditionalInfo(order.additionalInfo || {});
    setEditedItems([...order.orderItems]);
    setEditedDeliveryAddress(order.deliveryAddress || {});
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
      setShowMerchantMenu(false);
      toast.success('Order updated successfully');

    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Failed to update order');
    }
  };

  // Product search functionality
 // Product search functionality - FIXED
const handleProductSearch = (e) => {
  const value = e.target.value;
  setProductSearchTerm(value);
  
  if (!value.trim()) {
    setSearchResults([]);
    return;
  }

  const searchTerm = value.toLowerCase().trim();
  
  // Flatten all products from categories for search
  const allProducts = merchantProducts.flatMap(category => 
    category.items ? category.items.map(item => ({
      ...item,
      categoryName: category.categoryName
    })) : []
  );
  
  const filtered = allProducts.filter(product => 
    product.name?.toLowerCase().includes(searchTerm) ||
    product.description?.toLowerCase().includes(searchTerm) ||
    product.categoryName?.toLowerCase().includes(searchTerm)
  );
  
  setSearchResults(filtered);
};

  // Add product from merchant menu
  const addProductFromMerchant = (product) => {
    const existingItemIndex = editedItems.findIndex(item => 
      item.productId === product._id || item._id === product._id
    );

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      setEditedItems(prev =>
        prev.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                quantity: (item.quantity || 1) + 1,
                totalPrice: ((item.quantity || 1) + 1) * (item.price || product.price || 0)
              }
            : item
        )
      );
    } else {
      // Add new item
      const newItem = {
        _id: product._id,
        productId: product._id,
        name: product.name,
        quantity: 1,
        price: product.price,
        totalPrice: product.price,
        image: product.images?.[0],
        description: product.description
      };
      
      setEditedItems(prev => [...prev, newItem]);
    }
    
    toast.success(`${product.name} added to order`);
  };

  // Item quantity handlers
  const updateItemQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;

    setEditedItems(prev =>
      prev.map((item, i) =>
        i === index ? {
          ...item,
          quantity: newQuantity,
          totalPrice: newQuantity * (item.price || 0)
        } : item
      )
    );
  };

  const updateItemPrice = (index, newPrice) => {
    setEditedItems(prev =>
      prev.map((item, i) =>
        i === index ? {
          ...item,
          price: newPrice,
          totalPrice: (item.quantity || 1) * newPrice
        } : item
      )
    );
  };

  const removeItem = (index) => {
    setEditedItems(prev => prev.filter((_, i) => i !== index));
  };

  const addCustomItem = () => {
    const newItem = {
      _id: `custom-${Date.now()}`,
      name: "New Item",
      quantity: 1,
      price: 0,
      totalPrice: 0,
      isCustom: true
    };
    setEditedItems(prev => [...prev, newItem]);
  };

  const updateItemName = (index, newName) => {
    setEditedItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, name: newName } : item
      )
    );
  };

  // Add this component inside your OrderDetails component file
const CategorySection = ({ category, isExpanded, toggleCategory, onAddProduct, existingItems }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => toggleCategory(category.categoryId)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-all"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {category.categoryName?.charAt(0)}
            </span>
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-800 text-sm">
              {category.categoryName}
            </h3>
            <p className="text-gray-600 text-xs">
              {category.items?.length || 0} items
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {isExpanded ? (
            <FiChevronUp className="text-gray-500" />
          ) : (
            <FiChevronDown className="text-gray-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {category.items?.map((product) => (
              <MerchantProductCard
                key={product._id}
                product={product}
                onAdd={onAddProduct}
                existingQuantity={existingItems.find(item => item.productId === product._id)?.quantity || 0}
              />
            ))}
          </div>
          {(!category.items || category.items.length === 0) && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No products in this category
            </div>
          )}
        </div>
      )}
    </div>
  );
};

  // Address selection handler
  const handleAddressSelect = async (addressData) => {
    try {
      console.log('📍 handleAddressSelect called with:', addressData);
      
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
      toast.success('Delivery address updated successfully');

      // Update customer's address
      const userId = order.customer?._id;
      const addressId = updatedAddress._id;
      
      if (userId && addressId) {
        const updatePayload = {
          type: updatedAddress.type,
          street: updatedAddress.street,
          area: updatedAddress.area,
          landmark: updatedAddress.landmark,
          city: updatedAddress.city,
          state: updatedAddress.state,
          zip: updatedAddress.zip || updatedAddress.pincode,
          country: updatedAddress.country,
          longitude: addressData.location?.coordinates[0] || order.deliveryLocation?.coordinates[0],
          latitude: addressData.location?.coordinates[1] || order.deliveryLocation?.coordinates[1]
        };
        
        await addressService.updateCustomerAddress(userId, addressId, updatePayload);
        toast.success('Customer address updated in database');
      }

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

  const getStatusDisplay = (status) => {
    if (!status) return "N/A";
    return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
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
                  {getStatusDisplay(order.orderStatus)}
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

            {/* Merchant Menu Section - Only show when editing items */}
            {/* Merchant Menu Section - Only show when editing items */}
{isEditing && editingSection === 'items' && showMerchantMenu && (
  <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/50 overflow-hidden">
    <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 flex justify-between items-center">
      <h2 className="text-sm font-bold text-gray-900 flex items-center">
        <div className="w-1.5 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full mr-2"></div>
        Add Items from {order.restaurant?.name} Menu
      </h2>
      <button
        onClick={() => setShowMerchantMenu(false)}
        className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-xs font-medium"
      >
        <FiX className="w-3 h-3" />
        <span>Close Menu</span>
      </button>
    </div>

    <div className="p-3">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
          <input
            type="text"
            value={productSearchTerm}
            onChange={handleProductSearch}
            placeholder="Search menu items..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
          />
        </div>
      </div>

      {/* Products Grid with Categories */}
      {loadingProducts ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-gray-600 text-sm mt-2">Loading menu...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {merchantProducts.map((category) => (
            <CategorySection 
              key={category.categoryId} 
              category={category}
              isExpanded={expandedCategories.has(category.categoryId)}
              toggleCategory={toggleCategory}
              onAddProduct={addProductFromMerchant}
              existingItems={editedItems}
            />
          ))}
        </div>
      )}

      {merchantProducts.length === 0 && !loadingProducts && (
        <div className="text-center py-8">
          <FiPackage className="text-3xl text-gray-400 mx-auto mb-3" />
          <h3 className="text-gray-600 font-medium">No Menu Available</h3>
          <p className="text-gray-500 text-sm mt-1">
            This restaurant doesn't have any products in their menu yet.
          </p>
        </div>
      )}
    </div>
  </div>
)}

            {/* Order Items - EDITABLE */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/50 overflow-hidden">
              <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 flex justify-between items-center">
                <h2 className="text-sm font-bold text-gray-900 flex items-center">
                  <div className="w-1.5 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full mr-2"></div>
                  Order Items
                </h2>
                {isEditing && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={addCustomItem}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-xs font-medium"
                    >
                      <FiPlus className="w-3 h-3" />
                      <span>Add Custom Item</span>
                    </button>
                    {!showMerchantMenu && (
                      <button
                        onClick={() => setShowMerchantMenu(true)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                      >
                        <FiShoppingCart className="w-3 h-3" />
                        <span>Browse Menu</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="p-3">
                {isEditing && editingSection === 'items' ? (
                  <div className="space-y-3">
                    {editedItems.map((item, index) => (
                      <EditableOrderItemCard
                        key={item._id || item.id}
                        item={item}
                        index={index}
                        onUpdateQuantity={updateItemQuantity}
                        onUpdatePrice={updateItemPrice}
                        onUpdateName={updateItemName}
                        onRemove={removeItem}
                        isEditing={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {order.orderItems?.length > 0 ? (
                      order.orderItems.map((item) => (
                        <CompactOrderItemCard key={item._id} item={item} />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-4">
                        <div className="text-gray-500 text-sm font-medium">No order items found</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Order History */}
            <OrderHistory orderId={orderId} orderData={order} />
          </div>

          {/* Right Column - Pricing & Earnings */}
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

// Merchant Product Card Component
const MerchantProductCard = ({ product, onAdd, existingQuantity }) => {
  const isInStock = product.enableInventory ? product.stock > 0 : true;

  return (
    <div className={`bg-white rounded-lg border p-3 transition-all duration-200 ${
      existingQuantity > 0 
        ? 'border-green-300 bg-green-50' 
        : 'border-gray-200 hover:border-pink-200 hover:shadow-sm'
    }`}>
      <div className="flex space-x-3">
        {/* Product Image */}
        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <FiPackage className="text-gray-400 text-sm" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-gray-800 text-sm leading-tight pr-2">
              {product.name}
            </h3>
            {!isInStock && (
              <span className="flex-shrink-0 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          <p className="text-gray-600 text-xs mb-2 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-pink-600">
                ₹{product.price}
              </span>
              
              {existingQuantity > 0 && (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {existingQuantity} in cart
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => onAdd(product)}
              disabled={!isInStock}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isInStock
                  ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-sm'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isInStock ? 'Add to Order' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Your existing components (MapLocationPicker, CompactInfoCard, CompactOrderItemCard, EditableOrderItemCard, CompactPricingSummary, CompactEarningsSummary) remain the same...
// [Include all your existing components here - they remain unchanged]

// Compact Reusable Components (unchanged)
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

const CompactOrderItemCard = ({ item }) => (
  <div className="bg-white border border-pink-100 rounded-lg p-2 hover:shadow-sm transition-all duration-200 group">
    <div className="flex justify-between items-start mb-1">
      <h3 className="font-semibold text-gray-900 text-sm group-hover:text-pink-600 transition-colors">
        {item.name || "Product"}
      </h3>
      <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
        Qty: {item.quantity || 0}
      </span>
    </div>

    <div className="flex items-center gap-2 mb-2">
      <img
        src={item.image || "/assets/images/placeholder_3.png"}
        alt={item.name || "Product"}
        className="w-10 h-10 object-cover rounded-lg border border-pink-100"
      />
      <div className="flex-1">
        <div className="text-xs text-gray-600">
          Unit Price: ₹{item.totalPrice && item.quantity ? (item.totalPrice / item.quantity).toFixed(2) : "0.00"}
        </div>
      </div>
    </div>

    <div className="border-t border-pink-100 pt-1.5">
      <div className="flex justify-between items-center font-semibold">
        <span className="text-gray-700 text-sm">Total Price:</span>
        <span className="text-pink-600 text-sm">₹{item.totalPrice?.toFixed(2) || "0.00"}</span>
      </div>
    </div>
  </div>
);

const EditableOrderItemCard = ({ item, index, onUpdateQuantity, onUpdatePrice, onUpdateName, onRemove, isEditing }) => (
  <div className="bg-white border border-pink-200 rounded-lg p-3 transition-all duration-200">
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1">
        <input
          type="text"
          value={item.name}
          onChange={(e) => onUpdateName(index, e.target.value)}
          className="w-full p-1 border border-gray-300 rounded text-sm font-semibold focus:ring-2 focus:ring-pink-500"
          placeholder="Item name"
        />
      </div>
      <button
        onClick={() => onRemove(index)}
        className="p-1 text-red-500 hover:text-red-700 transition-colors ml-2"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </div>

    <div className="flex items-center gap-2 mb-2">
      <img
        src={item.image || "/assets/images/placeholder_3.png"}
        alt={item.name || "Product"}
        className="w-10 h-10 object-cover rounded-lg border border-pink-100"
      />
      <div className="flex-1 grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Quantity</label>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onUpdateQuantity(index, (item.quantity || 1) - 1)}
              className="p-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              <FiMinus className="w-3 h-3" />
            </button>
            <input
              type="number"
              value={item.quantity || 1}
              onChange={(e) => onUpdateQuantity(index, parseInt(e.target.value) || 1)}
              className="w-12 p-1 border border-gray-300 rounded text-center text-sm"
              min="1"
            />
            <button
              onClick={() => onUpdateQuantity(index, (item.quantity || 1) + 1)}
              className="p-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              <FiPlus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 block">Unit Price (₹)</label>
          <input
            type="number"
            value={item.price || 0}
            onChange={(e) => onUpdatePrice(index, parseFloat(e.target.value) || 0)}
            className="w-full p-1 border border-gray-300 rounded text-sm"
            step="0.01"
            min="0"
          />
        </div>
      </div>
    </div>

    <div className="border-t border-pink-100 pt-2">
      <div className="flex justify-between items-center font-semibold">
        <span className="text-gray-700 text-sm">Total Price:</span>
        <span className="text-pink-600 text-sm">
          ₹{((item.quantity || 1) * (item.price || 0)).toFixed(2)}
        </span>
      </div>
    </div>
  </div>
);

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

// Your existing MapLocationPicker component goes here...
// [Include the complete MapLocationPicker component from your original code]
const MapLocationPicker = ({
  onSave,
  onClose,
  selectedCustomer,
  editMode = false,
  existingAddress = null,
  existingLocation = null
}) => {
  const mapContainer = React.useRef(null);
  const mapRef = React.useRef(null);
  const markerRef = React.useRef(null);
  const [selectedLocation, setSelectedLocation] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [showSearchResults, setShowSearchResults] = React.useState(false);

  // Initialize with existing address data or empty values
  const [addressData, setAddressData] = React.useState({
    type: existingAddress?.type || 'Other',
    street: existingAddress?.street || '',
    area: existingAddress?.area || '',
    landmark: existingAddress?.landmark || '',
    city: existingAddress?.city || '',
    state: existingAddress?.state || '',
    zip: existingAddress?.zip || existingAddress?.pincode || '',
    country: existingAddress?.country || 'India',
    longitude: existingAddress?.location?.coordinates?.[0] || existingLocation?.coordinates?.[0] || '',
    latitude: existingAddress?.location?.coordinates?.[1] || existingLocation?.coordinates?.[1] || '',
    displayName: existingAddress?.displayName || '',
    _id: existingAddress?._id // Preserve the original ID
  });

  React.useEffect(() => {
    if (!mapRef.current && mapContainer.current) {
      console.log('Initializing map with existing customer address:', existingAddress);
      console.log('Existing location:', existingLocation);

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: existingLocation?.coordinates || existingAddress?.location?.coordinates ?
          [existingLocation.coordinates[0] || existingAddress.location.coordinates[0], 
           existingLocation.coordinates[1] || existingAddress.location.coordinates[1]] :
          [76.3000, 10.0000],
        zoom: existingLocation || existingAddress?.location ? 15 : 12,
      });
      map.addControl(new mapboxgl.NavigationControl());
      mapRef.current = map;

      // Add geolocate control
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserLocation: true,
      });
      map.addControl(geolocate);

      map.on("click", async (e) => {
        const { lng, lat } = e.lngLat;
        await handleLocationSelect(lng, lat);
      });

      // If editing existing customer address, add marker at existing location
      if (existingLocation?.coordinates || existingAddress?.location?.coordinates) {
        const [lng, lat] = existingLocation?.coordinates || existingAddress.location.coordinates;
        console.log('Adding marker at customer location:', lng, lat);

        // Add marker to map
        addMarker([lng, lat]);
        setSelectedLocation([lng, lat]);

        // Update all address fields with existing data
        setAddressData({
          type: existingAddress.type || 'Other',
          street: existingAddress.street || '',
          area: existingAddress.area || '',
          landmark: existingAddress.landmark || '',
          city: existingAddress.city || '',
          state: existingAddress.state || '',
          zip: existingAddress.zip || existingAddress.pincode || '',
          country: existingAddress.country || 'India',
          longitude: lng,
          latitude: lat,
          displayName: existingAddress.displayName || '',
          _id: existingAddress._id
        });

        // Set search query to existing address
        setSearchQuery(existingAddress.street || '');
      } else {
        // Only auto-trigger geolocate if no existing address
        setTimeout(() => {
          geolocate.trigger();
        }, 1000);
      }

      geolocate.on('geolocate', async (e) => {
        const { longitude, latitude } = e.coords;
        await handleLocationSelect(longitude, latitude);
      });
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [existingAddress, existingLocation]); // Depend on customer address/location

  // Search for locations based on address query
  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&country=IN&limit=5`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        setSearchResults(data.features);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error("Error searching location:", error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (value) => {
    setSearchQuery(value);

    // Clear results if query is empty
    if (!value.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      searchLocation(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Handle selection from search results
  const handleSearchSelect = async (feature) => {
    const [lng, lat] = feature.center;

    // Update map view
    addMarker([lng, lat]);
    setSelectedLocation([lng, lat]);

    // Get detailed address information
    const locationData = await getAddressFromCoordinates(lng, lat);

    // Update address fields
    setAddressData(prev => ({
      ...prev,
      street: feature.place_name || locationData.fullAddress,
      area: locationData.components.area || prev.area,
      city: locationData.components.city || prev.city,
      state: locationData.components.state || prev.state,
      zip: locationData.components.zip || prev.zip,
      landmark: locationData.components.landmark || prev.landmark,
      longitude: lng,
      latitude: lat
    }));

    // Update search query and hide results
    setSearchQuery(feature.place_name || locationData.fullAddress);
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const addMarker = (coordinates) => {
    if (markerRef.current) {
      markerRef.current.remove();
    }
    const el = document.createElement("div");
    el.className = "location-marker";
    el.style.backgroundColor = "#f97316";
    el.style.width = "24px";
    el.style.height = "24px";
    el.style.borderRadius = "50%";
    el.style.border = "3px solid white";
    el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
    el.style.cursor = "pointer";
    markerRef.current = new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .addTo(mapRef.current);
    mapRef.current.flyTo({
      center: coordinates,
      zoom: 15,
      duration: 1000
    });
  };

  // Improved address parsing function
  const parseAddressComponents = (features) => {
    const address = {
      street: '',
      area: '',
      city: '',
      state: '',
      zip: '',
      landmark: ''
    };
    features.forEach(feature => {
      const placeType = feature.place_type[0];
      const text = feature.text;
      const context = feature.context;
      switch (placeType) {
        case 'address':
          address.street = feature.place_name || feature.text;
          break;
        case 'poi':
          if (!address.landmark) address.landmark = text;
          break;
        case 'neighborhood':
        case 'locality':
          address.area = text;
          break;
        case 'place':
          address.city = text;
          break;
        case 'region':
          address.state = text;
          break;
        case 'postcode':
          address.zip = text;
          break;
        default:
          break;
      }
    });
    // Extract additional info from context
    if (features[0]?.context) {
      features[0].context.forEach(ctx => {
        if (ctx.id.includes('place') && !address.city) {
          address.city = ctx.text;
        }
        if (ctx.id.includes('region') && !address.state) {
          address.state = ctx.text;
        }
        if (ctx.id.includes('postcode') && !address.zip) {
          address.zip = ctx.text;
        }
        if (ctx.id.includes('locality') && !address.area) {
          address.area = ctx.text;
        }
      });
    }
    return address;
  };

  const getAddressFromCoordinates = async (lng, lat) => {
    try {
      setIsLoading(true);

      // Make multiple API calls for different result types
      const addressTypes = ['address', 'poi', 'place'];
      let bestResult = null;

      for (const type of addressTypes) {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&types=${type}&limit=1`
          );

          const data = await response.json();

          if (data.features && data.features.length > 0) {
            bestResult = data.features[0];
            break; // Use the first successful result
          }
        } catch (error) {
          console.warn(`Failed to fetch ${type} data:`, error);
          continue;
        }
      }

      if (bestResult) {
        const addressComponents = parseAddressComponents([bestResult]);
        return {
          fullAddress: bestResult.place_name,
          components: addressComponents
        };
      }

      // Fallback: try without types parameter
      const fallbackResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&limit=1`
      );

      const fallbackData = await fallbackResponse.json();

      if (fallbackData.features && fallbackData.features.length > 0) {
        const addressComponents = parseAddressComponents(fallbackData.features);
        return {
          fullAddress: fallbackData.features[0].place_name,
          components: addressComponents
        };
      }

      return {
        fullAddress: "Address not found",
        components: {}
      };
    } catch (error) {
      console.error("Error fetching address:", error);
      return {
        fullAddress: "Could not fetch address",
        components: {}
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = async (lng, lat) => {
    const coordinates = [lng, lat];
    addMarker(coordinates);

    const locationData = await getAddressFromCoordinates(lng, lat);
    setSelectedLocation(coordinates);

    // Auto-fill address fields with proper mapping
    setAddressData(prev => ({
      ...prev,
      street: locationData.fullAddress,
      area: locationData.components.area || prev.area,
      city: locationData.components.city || prev.city,
      state: locationData.components.state || prev.state,
      zip: locationData.components.zip || prev.zip,
      landmark: locationData.components.landmark || prev.landmark,
      longitude: lng,
      latitude: lat
    }));
    // Update search query with the found address
    setSearchQuery(locationData.fullAddress);
  };

  const handleSave = () => {
    if (!addressData.street.trim()) {
      alert('Please select a location on the map or enter an address');
      return;
    }

    if (!selectedLocation && !editMode) {
      alert('Please select a location on the map');
      return;
    }
    
    // Prepare data for API - match backend expectations
    const apiData = {
      _id: addressData._id, // Preserve the original ID
      // type: addressData.displayName || addressData.type,
      type: "Other",
      street: addressData.street,
      area: addressData.area,
      landmark: addressData.landmark,
      city: addressData.city,
      state: addressData.state,
      zip: addressData.zip, // Use zip instead of pincode
      pincode: addressData.zip,
      country: addressData.country,
      location: {
        type: "Point",
        coordinates: selectedLocation || [parseFloat(addressData.longitude), parseFloat(addressData.latitude)]
      },
      // Add these for the backend
      longitude: selectedLocation ? selectedLocation[0] : parseFloat(addressData.longitude),
      latitude: selectedLocation ? selectedLocation[1] : parseFloat(addressData.latitude)
    };
    
    onSave(apiData);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setAddressData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                {editMode ? <FiEdit2 className="text-orange-500 text-xl" /> : <FiMap className="text-orange-500 text-xl" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {editMode ? 'Edit Delivery Address' : 'Add Delivery Address'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {editMode ? 'Update the address details and location' : 'Search for address or click on the map to select location'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <FiX className="text-lg text-gray-600" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Side - Address Form */}
          <div className="w-full lg:w-2/5 p-6 overflow-y-auto border-r border-gray-200">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Search Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 pl-10 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Search for address, place, or landmark..."
                    onKeyPress={handleKeyPress}
                  />
                  {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                    </div>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((feature, index) => (
                      <div
                        key={feature.id || index}
                        onClick={() => handleSearchSelect(feature)}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-sm text-gray-800">
                          {feature.text}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {feature.place_name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Address Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addressData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Home, Office, etc."
                  onKeyPress={handleKeyPress}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={addressData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Search above or click on map to auto-fill address"
                  required
                />
                {selectedLocation && (
                  <p className="text-xs text-green-600 mt-1 flex items-center space-x-1">
                    <FiMapPin className="text-xs" />
                    <span>Location selected - coordinates: {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}</span>
                  </p>
                )}
                {editMode && existingAddress?.location && !selectedLocation && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center space-x-1">
                    <FiMapPin className="text-xs" />
                    <span>Current location: {existingAddress.location.coordinates[0].toFixed(6)}, {existingAddress.location.coordinates[1].toFixed(6)}</span>
                  </p>
                )}
                {isLoading && (
                  <p className="text-xs text-blue-600 mt-1">Loading address details...</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Area/Locality</label>
                  <input
                    type="text"
                    value={addressData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Area/Locality"
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Landmark</label>
                  <input
                    type="text"
                    value={addressData.landmark}
                    onChange={(e) => handleInputChange('landmark', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Nearby landmark"
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
                  <input
                    type="text"
                    value={addressData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="City"
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">State</label>
                  <input
                    type="text"
                    value={addressData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="State"
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ZIP Code</label>
                  <input
                    type="text"
                    value={addressData.zip}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="ZIP Code"
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Country</label>
                  <input
                    type="text"
                    value={addressData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Country"
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>
            </div>
            {/* Save Button */}
            <div className="flex space-x-3 pt-6 mt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || (!selectedLocation && !editMode)}
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editMode ? 'Update Address' : 'Save Address'}</span>
                )}
              </button>
            </div>
          </div>
          {/* Right Side - Map */}
          <div className="w-full lg:w-3/5 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FiNavigation className="text-orange-500" />
                <span>
                  {editMode
                    ? 'Search for address or click anywhere on the map to update location'
                    : 'Search for address or click anywhere on the map to select delivery location'
                  }
                </span>
                {isLoading && (
                  <span className="ml-auto text-orange-600 flex items-center space-x-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-600"></div>
                    <span>Searching...</span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 relative">
              <div
                ref={mapContainer}
                style={{ height: "100%", width: "100%" }}
                className="rounded-r-lg"
              />

              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-r-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading address details...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;