import { useState, useEffect, useRef } from "react";
import {
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiPlus,
  FiChevronDown,
  FiInfo,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiCopy,
  FiCheck,
  FiX,
  FiExternalLink
} from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { getAdminOrders, getAdminOrderCounts } from "../../../apis/adminApis/adminFuntionsApi";
import { Link } from "react-router-dom";
import { updateOrderStatus } from "../../../apis/adminApis/orderApi";
import socket, {
  connectSocket,
  disconnectSocket,
} from "../../../services/socket";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrdersTable = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [sortConfig, setSortConfig] = useState({
    key: "orderTime",
    direction: "desc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [updatingOrders, setUpdatingOrders] = useState({});
  const [hoveredOrderId, setHoveredOrderId] = useState(null);
  
  // Tab counts state
  const [tabCounts, setTabCounts] = useState({
    All: 0,
    pending: 0,
    accepted_by_restaurant: 0,
    rejected_by_restaurant: 0,
    preparing: 0,
    ready: 0,
    picked_up: 0,
    on_the_way: 0,
    delivered: 0,
    cancelled_by_customer: 0,
  });
 
  // Sequential order counter
  const [orderSequence, setOrderSequence] = useState(1);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [limit] = useState(30);
  const tableContainerRef = useRef(null);
  
  const tabs = [
    "All",
    "pending",
    "accepted_by_restaurant",
    "rejected_by_restaurant",
    "preparing",
    "ready",
    "picked_up",
    "on_the_way",
    "delivered",
    "cancelled_by_customer",
  ];
  
  const adminStatusOptions = [
    "pending",
    "accepted_by_restaurant",
    "rejected_by_restaurant",
    "preparing",
    "ready",
    "picked_up",
    "on_the_way",
    "delivered",
    "cancelled_by_customer",
  ];
  
  const statusDisplayNames = {
    pending: "Pending",
    pending_agent_acceptance: "Pending Agent",
    accepted_by_restaurant: "Accepted",
    rejected_by_restaurant: "Rejected",
    preparing: "Preparing",
    ready: "Ready",
    assigned_to_agent: "Assigned",
    picked_up: "Picked Up",
    on_the_way: "On The Way",
    out_for_delivery: "Out for Delivery",
    reached_customer: "Reached Customer",
    in_progress: "In Progress",
    arrived: "Arrived",
    completed: "Completed",
    delivered: "Delivered",
    cancelled_by_customer: "Cancelled",
    awaiting_agent_assignment: "Awaiting Agent",
    rejected_by_agent: "Agent Rejected",
  };
  
  const paymentStatusDisplayNames = {
    pending: "Pending",
    completed: "Completed",
    failed: "Failed",
    refunded: "Refunded",
    cancelled: "Cancelled",
  };
  
  const paymentMethodDisplayNames = {
    cash: "Cash",
    card: "Card",
    online:"Online",
    upi: "UPI",
    wallet: "Wallet",
    netbanking: "Net Banking",
  };
  
  const deliveryModeDisplayNames = {
    delivery: "Delivery",
    pickup: "Pickup",
    dine_in: "Dine In",
  };
  
  const deliveryTypeDisplayNames = {
    standard: "Standard",
    express: "Express",
    scheduled: "Scheduled",
  };
  
  const deviceTypeDisplayNames = {
    android: "Android",
    ios: "iOS",
    web: "Web",
    unknown: "Unknown"
  };

  // Fetch tab counts from backend
  const fetchTabCounts = async () => {
    try {
      const response = await getAdminOrderCounts();
      setTabCounts(response.data);
    } catch (error) {
      console.error("Error fetching tab counts:", error);
    }
  };

  // Get current page count for All tab
  const getAllTabDisplayCount = () => {
    if (activeTab === "All") {
      const startIndex = (currentPage - 1) * limit + 1;
      const endIndex = Math.min(currentPage * limit, totalOrders);
      return `${startIndex}-${endIndex}`;
    }
    return formatCount(tabCounts["All"] || 0);
  };
  
  const isNewOrder = (order) => {
    return order.orderStatus === "pending";
  };
  
  const getRowBackgroundColor = (order) => {
    if (isNewOrder(order)) {
      return 'bg-[#fedad3] hover:bg-[#fec9ba]';
    }
    return 'bg-white hover:bg-gray-50';
  };
  
  // Sequential order ID formatting
  const formatOrderId = (order, index) => {
    if (!order) return "N/A";
   
    // Calculate sequential number based on current page and index
    const sequentialNumber = (currentPage - 1) * limit + index + 1;
    return `ORDO-${sequentialNumber}`;
  };
  
  const getFullOrderId = (order) => {
    if (!order) return "N/A";
    return order.orderId || order.billId || order.id || "N/A";
  };
  
  const getPaymentMethodColor = (method) => {
    switch (method) {
      case "cod":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "cash":
        return "bg-green-100 text-green-800 border border-green-200";
      case "credit_card":
        return "bg-indigo-100 text-indigo-800 border border-indigo-200";
      case "debit_card":
      case "card":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "upi":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "wallet":
        return "bg-pink-100 text-pink-800 border border-pink-200";
      case "net_banking":
        return "bg-teal-100 text-teal-800 border border-teal-200";
      case "online":
        return "bg-cyan-100 text-cyan-800 border border-cyan-200";
      case "credit":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "corporate":
      case "meal_card":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Copied to clipboard!');
    });
  };
  
  const enableAudio = async () => {
    try {
      const audio = new Audio('/sound/bell.wav');
      audio.preload = 'auto';
      await audio.load();
      audio.muted = true;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
      setAudioEnabled(true);
      localStorage.setItem('audioNotificationsEnabled', 'true');
      toast.success('Sound notifications enabled');
    } catch (e) {
      console.error('Audio initialization failed:', e);
      toast.error('Sound notifications failed to enable. Please interact with page first.');
    }
  };
  
  const disableAudio = () => {
    setAudioEnabled(false);
    localStorage.removeItem('audioNotificationsEnabled');
  };
  
  const fetchData = async (page = 1, status = activeTab) => {
    setIsLoading(true);
    try {
      let apiStatus = status === "All" ? null : status;
      
      const response = await getAdminOrders(page, limit, apiStatus);
      setOrders(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalOrders(response.pagination.totalOrders);
      setCurrentPage(response.pagination.currentPage);
    
      // Calculate starting sequence number for the page
      const startSequence = (page - 1) * limit + 1;
      setOrderSequence(startSequence);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrders(prev => ({ ...prev, [orderId]: true }));
    try {
      await updateOrderStatus(orderId, newStatus);
      // Refresh data after status change
      fetchData(currentPage, activeTab);
      // Refresh tab counts
      fetchTabCounts();
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingOrders(prev => ({ ...prev, [orderId]: false }));
    }
  };
  
  const handleQuickAccept = (orderId) => {
    handleStatusChange(orderId, "accepted_by_restaurant");
  };
  
  const handleQuickReject = (orderId) => {
    handleStatusChange(orderId, "rejected_by_restaurant");
  };
  
  const handleNewOrder = (orderData) => {
    console.log('New order received:', orderData);
    
    // Refresh both data and counts
    fetchData(currentPage, activeTab);
    fetchTabCounts();
   
    toast.success(`New Order #${orderData.orderId} Received!`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
   
    if (audioEnabled) {
      const audio = new Audio('/sound/bell.wav');
      audio.play().catch(e => {
        console.log('Audio play failed:', e);
        disableAudio();
        toast.info('Sound notifications disabled due to browser restrictions. Please enable again.');
      });
    }
   
    if (Notification.permission === 'granted') {
      new Notification('New Order', {
        body: `New order #${orderData.orderId} received`,
        icon: '/path/to/icon.png'
      });
    }
  };
  
  useEffect(() => {
    const adminId = localStorage.getItem('userId');
    if (!adminId) {
      console.error('No admin ID found');
      return;
    }

    if (localStorage.getItem('audioNotificationsEnabled') === 'true') {
      enableAudio();
    }
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    connectSocket();
    const handleConnect = () => {
      console.log('Socket connected - joining admin rooms');
      socket.emit('join-room', {
        userId: adminId,
        userType: 'admin'
      });
      // Fetch initial data and counts
      fetchData().catch(console.error);
      fetchTabCounts().catch(console.error);
    };
    
    const handleOrderStatusUpdate = (data) => {
      console.log('Order status update received:', data);
      // Refresh data when order status changes
      fetchData(currentPage, activeTab);
      fetchTabCounts();
      
      toast.info(
        `Order #${data.orderId} status updated to: ${statusDisplayNames[data.newStatus] || data.newStatus}`,
        { position: "top-right", autoClose: 3000 }
      );
    };
    
    const handleDisconnect = () => {
      console.log('Socket disconnected');
    };
    
    const handleConnectError = (error) => {
      console.error('Socket connection error:', error);
    };
    
    socket.on('connect', handleConnect);
    socket.on('new_order', handleNewOrder);
    socket.on('order_status_update_admin', handleOrderStatusUpdate);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    
    if (socket.connected) {
      handleConnect();
    } else {
      fetchData().catch(console.error);
      fetchTabCounts().catch(console.error);
    }
    
    return () => {
      socket.off('connect', handleConnect);
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_update_admin', handleOrderStatusUpdate);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      disconnectSocket();
    };
  }, []);
  
  const handleSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    } else {
      if (key === "orderTime" || key === "scheduledDeliveryTime") {
        direction = "desc";
      } else if (key === "amount") {
        direction = "desc";
      } else {
        direction = "asc";
      }
    }
    setSortConfig({ key, direction });
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchData(newPage, activeTab);
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery(""); // Clear search when changing tabs
    fetchData(1, tab);
  };
  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };
  
  // Filter orders based on search query only (backend handles status filtering)
  const filteredOrders = orders.filter((order) => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const fullOrderId = getFullOrderId(order).toLowerCase();
      return (
        fullOrderId.includes(searchLower) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchLower)) ||
        (order.restaurantName && order.restaurantName.toLowerCase().includes(searchLower)) ||
        (order.address && order.address.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  // Use filtered orders for search, otherwise use all orders from current tab
  const sortedOrders = [...(searchQuery ? filteredOrders : orders)].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    switch (sortConfig.key) {
      case "orderTime":
      case "scheduledDeliveryTime":
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
        break;
      case "amount":
        const aAmount = String(aValue || "0").replace(/[^0-9.-]+/g, "");
        const bAmount = String(bValue || "0").replace(/[^0-9.-]+/g, "");
        aValue = parseFloat(aAmount) || 0;
        bValue = parseFloat(bAmount) || 0;
        break;
      case "preparationTime":
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
        break;
      case "orderStatus":
        aValue = statusDisplayNames[aValue] || aValue;
        bValue = statusDisplayNames[bValue] || bValue;
        break;
      case "paymentStatus":
        aValue = paymentStatusDisplayNames[aValue] || aValue;
        bValue = paymentStatusDisplayNames[bValue] || bValue;
        break;
      case "paymentMethod":
        aValue = paymentMethodDisplayNames[aValue] || aValue;
        bValue = paymentMethodDisplayNames[bValue] || bValue;
        break;
      case "deliveryMode":
        aValue = deliveryModeDisplayNames[aValue] || aValue;
        bValue = deliveryModeDisplayNames[bValue] || bValue;
        break;
      case "deliveryType":
        aValue = deliveryTypeDisplayNames[aValue] || aValue;
        bValue = deliveryTypeDisplayNames[bValue] || bValue;
        break;
      case "deviceType":
        aValue = deviceTypeDisplayNames[aValue] || aValue;
        bValue = deviceTypeDisplayNames[bValue] || bValue;
        break;
      case "orderId":
        aValue = getFullOrderId(a);
        bValue = getFullOrderId(b);
        break;
      case "restaurantName":
        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
        break;
      case "customerName":
        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
        break;
      case "address":
        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
        break;
      default:
        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
    }
    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });
  
  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, totalOrders);
  
  const getStatusColor = (status) => {
    let displayStatus = status;
    switch (status) {
      case "out_for_delivery":
      case "reached_customer":
        displayStatus = "on_the_way";
        break;
      default:
        displayStatus = status;
    }
   
    switch (displayStatus) {
      case "pending":
      case "pending_agent_acceptance":
      case "awaiting_agent_assignment":
        return "bg-yellow-100 text-yellow-800";
      case "accepted_by_restaurant":
      case "preparing":
      case "ready":
      case "assigned_to_agent":
      case "picked_up":
      case "on_the_way":
      case "in_progress":
      case "arrived":
        return "bg-blue-100 text-blue-800";
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "rejected_by_restaurant":
      case "cancelled_by_customer":
      case "rejected_by_agent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return "ASAP";
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timePart = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return (
      <div className="flex flex-col">
        <span className="text-sm">{datePart}</span>
        <span className="text-xs text-gray-500">{timePart}</span>
      </div>
    );
  };
  
  const formatPreparationTime = (minutes) => {
    if (!minutes) return "N/A";
    return `${minutes} min`;
  };
  
  const truncateText = (text, maxLength = 25) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  const renderAudioControl = () => (
    <button
      onClick={audioEnabled ? disableAudio : enableAudio}
      className={`p-2 rounded-lg flex items-center ${audioEnabled ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
      title={audioEnabled ? "Disable sound notifications" : "Enable sound notifications"}
    >
      {audioEnabled ? (
        <>
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          <span className="text-xs">Sound On</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
          <span className="text-xs">Sound Off</span>
        </>
      )}
    </button>
  );
  
  const renderSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return (
        <FiChevronDown
          className={`ml-1 transform transition-transform ${
            sortConfig.direction === "asc" ? "rotate-180" : ""
          }`}
          size={14}
        />
      );
    }
    return <FiChevronDown className="ml-1 text-gray-300" size={14} />;
  };
  
  const formatCount = (count) => {
    return count < 10 ? `0${count}` : count;
  };

  const testNotification = () => {
    if (audioEnabled) {
      const audio = new Audio('/sound/bell.wav');
      audio.play().catch(e => {
        console.log('Audio play failed:', e);
        disableAudio();
      });
    }
    if (Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from the admin panel',
        icon: '/path/to/icon.png'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Test Notification', {
            body: 'This is a test notification from the admin panel',
            icon: '/path/to/icon.png'
          });
        }
      });
    }
  };

  // Render order items tooltip
  const renderOrderItemsTooltip = (order) => {
    if (!order.orderItems || order.orderItems.length === 0) return null;
    
    return (
      <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3">
        <div className="text-xs font-semibold text-gray-700 mb-2">Order Items:</div>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {order.orderItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-xs">
              <span className="text-gray-600 flex-1 truncate mr-2">{item.name}</span>
              <span className="text-gray-500 whitespace-nowrap">- {item.quantity} -</span>
              <span className="text-green-600 font-medium whitespace-nowrap ml-1">₹{item.totalPrice}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-2 pt-2">
          <div className="flex justify-between text-xs font-semibold">
            <span>Total:</span>
            <span className="text-blue-600">
              ₹{order.orderItems.reduce((sum, item) => sum + item.totalPrice, 0)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Fixed Header Section - COMPACT */}
      <div className="flex-shrink-0 bg-white shadow-sm">
        {/* Main Header - COMPACT */}
        <div className="p-3 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-1.5 mr-3 text-blue-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold text-gray-800">Orders</h1>
                <a
                  href="https://orado.online/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs"
                >
                  <span>orado.online</span>
                  <FiExternalLink size={12} />
                </a>
              </div>
              <p className="text-xs text-gray-500">
                Manage and track all customer orders
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
            <div className="relative w-full md:w-56">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" size={14} />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex space-x-1">
              {renderAudioControl()}
              <button
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  fetchData(currentPage, activeTab);
                  fetchTabCounts();
                }}
                title="Refresh"
              >
                <FiRefreshCw size={16} />
              </button>
              <button
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Filter"
              >
                <FiFilter size={16} />
              </button>
              <button
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Export"
              >
                <FiDownload size={16} />
              </button>
              <button
                onClick={testNotification}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg flex items-center"
                title="Test notifications"
              >
                <FiInfo size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Status Tabs - ULTRA COMPACT */}
        <div className="border-b p-2 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-1 md:space-y-0">
            {/* Tabs on the left */}
            <div className="flex-1">
              <div className="grid grid-cols-5 md:grid-cols-10 gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`flex flex-col items-center justify-center p-1 rounded border transition-all min-w-[45px] shadow-sm ${
                      activeTab === tab
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                    }`}
                    onClick={() => handleTabChange(tab)}
                  >
                    <span className={`text-[12px] font-bold ${
                      activeTab === tab ? "text-blue-600" : "text-gray-600"
                    }`}>
                      {tab === "All" && activeTab === "All"
                        ? getAllTabDisplayCount()
                        : formatCount(tabCounts[tab] || 0)
                      }
                    </span>
                    <span className={`text-[10px] font-bold mt-0.5 ${
                      activeTab === tab ? "text-blue-600" : "text-gray-500"
                    }`}>
                      {tab === "All" ? "All" : statusDisplayNames[tab]}
                    </span>
                    {tab === "All" && activeTab === "All" && (
                      <span className="text-[8px] text-gray-400 mt-0.5">
                        of {totalOrders}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
           
            {/* Create Order button on the right */}
            {/* <div className="md:ml-3 mt-1 md:mt-0">
              <Link
                to="/admin/dashboard/order/create"
                className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg transition-colors text-xs shadow-md hover:shadow-lg"
              >
                <FiPlus size={12} />
                <span>Create Order</span>
              </Link>
            </div> */}
            {/* Create Order button on the right */}
            <div className="md:ml-3 mt-1 md:mt-0">
              <Link
                to="/admin/dashboard/order/create"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors text-sm font-medium shadow-md hover:shadow-lg"
              >
                <FiPlus size={14} />
                <span>Create Order</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Table Container with Scrollable Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Fixed Table Container */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Scrollable Table Area */}
          <div ref={tableContainerRef} className="flex-1 overflow-auto custom-scrollbar relative">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("orderId")}
                  >
                    <div className="flex items-center">
                      Order ID
                      {renderSortIndicator("orderId")}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-40 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("orderStatus")}
                  >
                    <div className="flex items-center">
                      Status / Actions
                      {renderSortIndicator("orderStatus")}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("restaurantName")}
                  >
                    <div className="flex items-center">
                      Merchant
                      {renderSortIndicator("restaurantName")}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-40 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("orderTime")}
                  >
                    <div className="flex items-center">
                      Order Time
                      {renderSortIndicator("orderTime")}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-40 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("scheduledDeliveryTime")}
                  >
                    <div className="flex items-center">
                      Schedule
                      {renderSortIndicator("scheduledDeliveryTime")}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("customerName")}
                  >
                    <div className="flex items-center">
                      Customer
                      {renderSortIndicator("customerName")}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center">
                      Amount
                      {renderSortIndicator("amount")}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-48 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("address")}
                  >
                    <div className="flex items-center">
                      Address
                      {renderSortIndicator("address")}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("deliveryMode")}
                  >
                    <div className="flex items-center">
                      Delivery Mode
                      {renderSortIndicator("deliveryMode")}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("paymentStatus")}
                  >
                    <div className="flex items-center">
                      Payment Status
                      {renderSortIndicator("paymentStatus")}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("paymentMethod")}
                  >
                    <div className="flex items-center">
                      Payment Method
                      {renderSortIndicator("paymentMethod")}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("preparationTime")}
                  >
                    <div className="flex items-center">
                      Prep Time
                      {renderSortIndicator("preparationTime")}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("deliveryType")}
                  >
                    <div className="flex items-center">
                      Delivery Type
                      {renderSortIndicator("deliveryType")}
                    </div>
                  </th>
                  <th
                    className="px-2 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-28 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("deviceType")}
                  >
                    <div className="flex items-center">
                      Device Type
                      {renderSortIndicator("deviceType")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="14" className="px-4 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : sortedOrders.length > 0 ? (
                  sortedOrders.map((order, index) => {
                    const fullOrderId = getFullOrderId(order);
                    return (
                    <tr
                      key={order.orderId}
                      className={getRowBackgroundColor(order)}
                    >
                      {/* Order ID */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm font-medium relative">
                        <div className="flex items-center">
                          {isNewOrder(order) && (
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-pulse" title="New Order"></span>
                          )}
                          <div 
                            className="group relative"
                            onMouseEnter={() => setHoveredOrderId(order.orderId)}
                            onMouseLeave={() => setHoveredOrderId(null)}
                          >
                            <Link
                              to={`/admin/dashboard/order/table/details/${order.orderId}`}
                              className="text-blue-600 hover:underline text-xs"
                              title={fullOrderId}
                            >
                              {formatOrderId(order, index)}
                            </Link>
                            <button
                              onClick={() => copyToClipboard(fullOrderId)}
                              className="absolute -right-5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-gray-600"
                              title="Copy Order ID"
                            >
                              <FiCopy size={10} />
                            </button>
                            
                            {/* Order Items Tooltip */}
                            {hoveredOrderId === order.orderId && order.orderItems && order.orderItems.length > 0 && (
                              renderOrderItemsTooltip(order)
                            )}
                          </div>
                        </div>
                      </td>
                     
                      {/* Order Status */}
                      {/* <td className="px-2 py-2 whitespace-nowrap">
                       <div className="flex flex-col space-y-1 min-w-[120px]">
                        {["pending", "awaiting_agent_assignment"].includes(order.orderStatus) ? (
                          <>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleQuickAccept(order.orderId)}
                                disabled={updatingOrders[order.orderId]}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-2 rounded flex items-center justify-center transition-colors disabled:opacity-50"
                                title="Accept Order"
                              >
                                {updatingOrders[order.orderId] ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-1 border-white"></div>
                                ) : (
                                  <FiCheck size={12} />
                                )}
                              </button>
                              <button
                                onClick={() => handleQuickReject(order.orderId)}
                                disabled={updatingOrders[order.orderId]}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-2 rounded flex items-center justify-center transition-colors disabled:opacity-50"
                                title="Reject Order"
                              >
                                {updatingOrders[order.orderId] ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-1 border-white"></div>
                                ) : (
                                  <FiX size={12} />
                                )}
                              </button>
                            </div>
                            <span className={`text-[10px] px-0.5 py-0.5 rounded-full text-center ${getStatusColor(order.orderStatus)}`}>
                              Pending
                            </span>
                          </>
                        ) : (
                          <div className="relative">
                            {updatingOrders[order.orderId] ? (
                              <div className="flex items-center justify-center py-0.5">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                              </div>
                            ) : (
                              <select
                                value={order.orderStatus}
                                onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                                className={`text-[10px] px-1 py-0.5 rounded-full border ${getStatusColor(order.orderStatus)} cursor-pointer w-full`}
                                disabled={updatingOrders[order.orderId]}
                                title={statusDisplayNames[order.orderStatus] || order.orderStatus}
                              >
                                {adminStatusOptions.map((status) => (
                                  <option key={status} value={status}>
                                    {statusDisplayNames[status] || status}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        )}
                      </div>

                      </td> */}

                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="flex flex-col space-y-1 min-w-[140px]">
                          {["pending", "awaiting_agent_assignment"].includes(order.orderStatus) ? (
                            <>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleQuickAccept(order.orderId)}
                                  disabled={updatingOrders[order.orderId]}
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-3 rounded flex items-center justify-center transition-colors disabled:opacity-50 shadow-sm hover:shadow-md"
                                  title="Accept Order"
                                >
                                  {updatingOrders[order.orderId] ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-1 border-white"></div>
                                  ) : (
                                    <FiCheck size={14} />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleQuickReject(order.orderId)}
                                  disabled={updatingOrders[order.orderId]}
                                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded flex items-center justify-center transition-colors disabled:opacity-50 shadow-sm hover:shadow-md"
                                  title="Reject Order"
                                >
                                  {updatingOrders[order.orderId] ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-1 border-white"></div>
                                  ) : (
                                    <FiX size={14} />
                                  )}
                                </button>
                              </div>
                              {/* <span className={`text-[9px] px-1 py-0.5 rounded-full text-center ${getStatusColor(order.orderStatus)}`}>
                                Pending
                              </span> */}
                            </>
                          ) : (
                            <div className="relative">
                              {updatingOrders[order.orderId] ? (
                                <div className="flex items-center justify-center py-1">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                </div>
                              ) : (
                                <select
                                  value={order.orderStatus}
                                  onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                                  className={`text-[10px] px-1 py-1 rounded-full border ${getStatusColor(order.orderStatus)} cursor-pointer w-full`}
                                  disabled={updatingOrders[order.orderId]}
                                  title={statusDisplayNames[order.orderStatus] || order.orderStatus}
                                >
                                  {adminStatusOptions.map((status) => (
                                    <option key={status} value={status}>
                                      {statusDisplayNames[status] || status}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                     
                      {/* Merchant Name */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                        <div className="group relative">
                          {order.restaurantId ? (
                            <Link
                              to={`/admin/dashboard/merchants/merchant-details/${order.restaurantId}`}
                              className="text-blue-600 hover:underline text-xs"
                              title={order.restaurantName}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {truncateText(order.restaurantName, 20)}
                            </Link>
                          ) : (
                            <span title={order.restaurantName} className="text-xs">
                              {truncateText(order.restaurantName, 20)}
                            </span>
                          )}
                          <button
                            onClick={() => copyToClipboard(order.restaurantName)}
                            className="absolute -right-5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-gray-600"
                            title="Copy Merchant Name"
                          >
                            <FiCopy size={10} />
                          </button>
                        </div>
                      </td>
                     
                      {/* Order Time */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                        <div className="text-xs">
                          {formatDateTime(order.orderTime)}
                        </div>
                      </td>
                     
                      {/* Schedule Delivery */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                        <div className="text-xs">
                          {order.scheduledDeliveryTime ? (
                            formatDateTime(order.scheduledDeliveryTime)
                          ) : (
                            <span>ASAP</span>
                          )}
                        </div>
                      </td>
                     
                      {/* Customer */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col group relative">
                          <span className="font-medium text-gray-900 text-xs">
                            {order.customerId ? (
                              <Link
                                to={`/admin/dashboard/customer/${order.customerId}/details`}
                                className="font-medium text-blue-600 hover:underline"
                                title={order.customerName}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {truncateText(order.customerName, 15)}
                              </Link>
                            ) : (
                              <span title={order.customerName}>
                                {truncateText(order.customerName, 15)}
                              </span>
                            )}
                          </span>
                          <button
                            onClick={() => copyToClipboard(order.customerName)}
                            className="absolute -right-5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-gray-600"
                            title="Copy Customer Name"
                          >
                            <FiCopy size={10} />
                          </button>
                        </div>
                      </td>
                     
                      {/* Amount */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-xs">
                        ₹{typeof order.amount === 'string' ? order.amount.replace('₹', '') : order.amount}
                      </td>
                     
                      {/* Address */}
                      <td className="px-2 py-2 text-sm text-gray-500">
                        <div className="group relative">
                          <span className="text-xs block cursor-help" title={order.address}>
                            {truncateText(order.address, 35)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(order.address)}
                            className="absolute -right-5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-gray-600"
                            title="Copy Address"
                          >
                            <FiCopy size={10} />
                          </button>
                        </div>
                      </td>
                     
                      {/* Delivery Mode - FULL TEXT */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                          order.deliveryMode === 'delivery'
                            ? 'bg-blue-100 text-blue-800'
                            : order.deliveryMode === 'pickup'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {deliveryModeDisplayNames[order.deliveryMode] || "Delivery"}
                        </span>
                      </td>
                     
                      {/* Payment Status - FULL TEXT */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm">
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {paymentStatusDisplayNames[order.paymentStatus] || order.paymentStatus}
                        </span>
                      </td>
                     
                      {/* Payment Method - FULL TEXT */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm">
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${getPaymentMethodColor(order.paymentMethod)}`}>
                          {paymentMethodDisplayNames[order.paymentMethod] || order.paymentMethod}
                        </span>
                      </td>
                     
                      {/* Preparation Time */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-xs">
                        {formatPreparationTime(order.preparationTime)}
                      </td>
                     
                      {/* Delivery Type - FULL TEXT */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                          order.deliveryType === 'express'
                            ? 'bg-orange-100 text-orange-800'
                            : order.deliveryType === 'scheduled'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {deliveryTypeDisplayNames[order.deliveryType] || order.deliveryType}
                        </span>
                      </td>
                      {/* Device Type - FULL TEXT */}
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                          order.deviceType === 'android'
                            ? 'bg-green-100 text-green-800'
                            : order.deviceType === 'ios'
                            ? 'bg-blue-100 text-blue-800'
                            : order.deviceType === 'web'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {deviceTypeDisplayNames[order.deviceType] || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  )})
                ) : (
                  <tr>
                    <td colSpan="14" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-400 mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                        <p className="text-gray-500 text-sm mb-1">
                          No orders found
                        </p>
                        {searchQuery && (
                          <button
                            className="text-xs text-blue-600 hover:text-blue-800"
                            onClick={() => setSearchQuery("")}
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* COMPACT Pagination */}
        {sortedOrders.length > 0 && (
          <div className="flex-shrink-0 bg-white px-3 py-2 border-t border-gray-200 mt-3 rounded-lg">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-2 relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-gray-700">
                  Showing <span className="font-medium">{startIndex}</span> to{" "}
                  <span className="font-medium">{endIndex}</span> of{" "}
                  <span className="font-medium">{totalOrders}</span> results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-1.5 py-1.5 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <FiChevronLeft className="h-4 w-4" />
                  </button>
                 
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-3 py-1.5 border text-xs font-medium
                        ${currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                 
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-1.5 py-1.5 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <FiChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default OrdersTable;