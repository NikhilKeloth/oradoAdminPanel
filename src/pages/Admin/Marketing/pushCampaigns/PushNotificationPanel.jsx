import React, { useState, useMemo, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Users, Truck, Store, Bell,
  Image as ImageIcon, Link as LinkIcon,
  Calendar, Clock, Repeat,
  XCircle, CheckCircle, AlertTriangle, Info, Rocket, Trash2, Search,
  ChevronDown, ChevronUp, Check, X, Send, Eye, Filter, History
} from "lucide-react";
import apiClient from "../../../../apis/apiClient/apiClient";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Dummy sent/scheduled notifications
const SENT_HISTORY = [
  { id: 1, title: "50% Off Deal", type: "Offer", audience: "Customers", status: "sent", sentOn: "12:10 PM" },
  { id: 2, title: "Service Down", type: "Alert", audience: "Agents", status: "failed", sentOn: "09:30 AM" },
  { id: 3, title: "Daily Tip", type: "Info", audience: "Customers", status: "pending", sentOn: "Tomorrow" },
  { id: 4, title: "Big Wednesday", type: "Offer", audience: "Customers", status: "sent", sentOn: "09:01 AM" },
  { id: 5, title: "Free Delivery", type: "Offer", audience: "Agents", status: "sent", sentOn: "Yesterday" },
  { id: 6, title: "Insider Update", type: "Info", audience: "Restaurants", status: "sent", sentOn: "Today 8:38" },
  { id: 7, title: "KYC Alert", type: "Alert", audience: "Restaurants", status: "failed", sentOn: "Yesterday 22:00" },
  { id: 8, title: "Happy Lunch", type: "Offer", audience: "Customers", status: "pending", sentOn: "Tomorrow" },
  { id: 9, title: "Order Surge", type: "Info", audience: "Agents", status: "sent", sentOn: "Today 10:45" },
  { id: 10, title: "HOLIDAY CLOSURE", type: "Alert", audience: "Restaurants", status: "pending", sentOn: "Aug 12, 14:00" },
  { id: 11, title: "Refer & Earn", type: "Offer", audience: "Customers", status: "sent", sentOn: "Jul 24, 15:20" },
  { id: 12, title: "Onboarding Steps", type: "Info", audience: "Agents", status: "sent", sentOn: "Mon 17:30" },
  { id: 13, title: "Payment Issue", type: "Alert", audience: "Restaurants", status: "failed", sentOn: "Sun 18:44" },
  { id: 14, title: "Festival Bonus", type: "Offer", audience: "Customers", status: "sent", sentOn: "Aug 10, 11:59" },
  { id: 15, title: "Push Demo", type: "Info", audience: "Customers", status: "pending", sentOn: "Tonight" },
];

// Status badge component with improved styling
const StatusBadge = ({ status }) => {
  const map = {
    sent: { 
      label: "Sent", 
      bg: "bg-emerald-50", 
      fg: "text-emerald-700", 
      border: "border-emerald-200",
      icon: CheckCircle 
    },
    failed: { 
      label: "Failed", 
      bg: "bg-red-50", 
      fg: "text-red-700", 
      border: "border-red-200",
      icon: XCircle 
    },
    pending: { 
      label: "Pending", 
      bg: "bg-amber-50", 
      fg: "text-amber-700", 
      border: "border-amber-200",
      icon: AlertTriangle 
    },
    scheduled: {
      label: "Scheduled",
      bg: "bg-blue-50",
      fg: "text-blue-700",
      border: "border-blue-200",
      icon: Calendar
    }
  };
  const { label, bg, fg, border, icon: Icon } = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${fg} ${border} border`}>
      <Icon size={12} className="mr-1.5" />
      {label}
    </span>
  );
};

// Type badge component with improved styling
const TypeBadge = ({ type }) => {
  const map = {
    Offer: { 
      icon: Bell, 
      bg: "bg-orange-50",
      fg: "text-orange-700",
      border: "border-orange-200"
    },
    Alert: { 
      icon: AlertTriangle, 
      bg: "bg-red-50",
      fg: "text-red-700",
      border: "border-red-200"
    },
    Info: { 
      icon: Info, 
      bg: "bg-blue-50",
      fg: "text-blue-700",
      border: "border-blue-200"
    }
  };
  const { icon: Icon, bg, fg, border } = map[type] || { 
    icon: Bell, 
    bg: "bg-gray-50",
    fg: "text-gray-700",
    border: "border-gray-200"
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${bg} ${fg} ${border}`}>
      <Icon size={12} className="mr-1.5" />
      {type}
    </span>
  );
};

// MultiSelectDropdown component with improved styling
const MultiSelectDropdown = ({ 
  options, 
  selected, 
  setSelected, 
  placeholder, 
  loading,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleItem = (id) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === options.length) {
      setSelected([]);
    } else {
      setSelected(options.map(item => item._id || item.id || item.userId));
    }
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || disabled}
        className={`w-full px-4 py-3 text-left border-2 rounded-xl flex items-center justify-between transition-all duration-200 ${
          loading ? "bg-gray-50 text-gray-400 border-gray-200" : "bg-white text-gray-700 hover:border-orange-300"
        } ${isOpen ? "border-orange-500 ring-4 ring-orange-100 shadow-lg" : "border-gray-200 shadow-sm"}`}
      >
        <span className="truncate font-medium">
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent mr-2"></div>
              Loading...
            </div>
          ) : 
           selected.length === 0 ? placeholder :
           selected.length === options.length ? `All ${placeholder}` :
           `${selected.length} selected`}
        </span>
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={18} className="text-gray-400" />
        </div>
      </button>

      {isOpen && !loading && (
        <div className="absolute z-20 mt-2 w-full bg-white shadow-xl rounded-xl border-2 border-gray-100 max-h-64 overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <label className="flex items-center px-3 py-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={selected.length === options.length}
                onChange={selectAll}
                className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 focus:ring-2 mr-3"
              />
              <span className="text-sm font-semibold text-gray-700">Select All</span>
            </label>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {options.map(item => (
              <label 
                key={item._id || item.id || item.userId} 
                className="flex items-center px-6 py-3 hover:bg-orange-50 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(item._id || item.id || item.userId)}
                  onChange={() => toggleItem(item._id || item.id || item.userId)}
                  className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 focus:ring-2 mr-3"
                />
                <span className="text-sm text-gray-700 font-medium">
                  {item.name || item.email || item.phone}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PushNotificationPanel = () => {
  // Form state
  const [audience, setAudience] = useState("customer");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [deepLink, setDeepLink] = useState("");
  const [scheduleType, setScheduleType] = useState("now");
  const [scheduledDate, setScheduledDate] = useState(null);
  const [recurrence, setRecurrence] = useState({ 
    frequency: "Daily", 
    time: "", 
    endsOn: null 
  });
  const [showPreview, setShowPreview] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [history, setHistory] = useState(SENT_HISTORY);

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [agentsList, setAgentsList] = useState([]);
  const [restaurantsList, setRestaurantsList] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Audience options
  const audiences = [
    { key: "customer", icon: Users, label: "Customers", color: "bg-blue-500", hoverColor: "hover:bg-blue-600" },
    { key: "agent", icon: Truck, label: "Agents", color: "bg-green-500", hoverColor: "hover:bg-green-600" },
    { key: "restaurant", icon: Store, label: "Restaurants", color: "bg-purple-500", hoverColor: "hover:bg-purple-600" }
  ];

  // Get current list based on selected audience
  const currentList = useMemo(() => {
    switch (audience) {
      case "customer": return customersList;
      case "agent": return agentsList;
      case "restaurant": return restaurantsList;
      default: return [];
    }
  }, [audience, customersList, agentsList, restaurantsList]);

  // Fetch lists when audience changes
  useEffect(() => {
    const fetchLists = async () => {
      try {
        setLoadingLists(true);
        setSelectedIds([]);
        
        if (audience === "customer") {
          const res = await apiClient.get('/admin/customer-list');
          setCustomersList(res.data.data?.customers?.map(customer => ({
            _id: customer.userId,
            name: customer.name,
            email: customer.email,
            phone: customer.phone
          })) || []);
        }
        
        if (audience === "agent") {
          const res = await apiClient.get('/admin/agent/list');
          setAgentsList(res.data.data?.map(agent => ({
            _id: agent.id,
            name: agent.name,
            phone: agent.phone
          })) || []);
        }
        
        if (audience === "restaurant") {
          const res = await apiClient.get('/admin/restaurants/dropdown-list');
          setRestaurantsList(res.data.data?.map(restaurant => ({
            _id: restaurant._id,
            name: restaurant.name
          })) || []);
        }
      } catch (err) {
        console.error('Error fetching lists:', err);
        toast.error('Failed to load recipient lists');
      } finally {
        setLoadingLists(false);
      }
    };
    
    fetchLists();
  }, [audience]);

  // Handle audience selection
  const handleAudience = (key) => {
    setAudience(key);
  };

  // Handle image upload
  const handleImage = (e) => setImage(e.target.files[0] || null);

  // Handle recurrence changes
  const handleRecurrenceChange = (field, val) => {
    setRecurrence((prev) => ({ ...prev, [field]: val }));
  };

  // Handle form submission
 const handleSend = async (e) => {
  e.preventDefault();
  setIsSending(true);
  
  try {
    const formData = new FormData();
    formData.append('userType', audience);
    formData.append('title', title);
    formData.append('body', message);
    if (deepLink) formData.append('deepLinkUrl', deepLink);
    selectedIds.forEach(id => formData.append('userIds[]', id));
    
    if (image) {
      formData.append('image', image);
    }

    // Add scheduling data if needed
    if (scheduleType === "once" && scheduledDate) {
      formData.append('scheduledAt', scheduledDate.toISOString());
    } else if (scheduleType === "recurring") {
      formData.append('recurrence', JSON.stringify({
        frequency: recurrence.frequency,
        time: recurrence.time,
        endsOn: recurrence.endsOn?.toISOString()
      }));
    }

    const response = await apiClient.post('/admin/send-push-notification', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      let notificationStatus = "sent";
      let sentOnText = new Date().toLocaleTimeString();
      
      if (scheduleType === "once" && scheduledDate) {
        notificationStatus = "scheduled";
        sentOnText = scheduledDate.toLocaleString();
      } else if (scheduleType === "recurring") {
        notificationStatus = "scheduled";
        sentOnText = `Recurring (${recurrence.frequency}) starting ${new Date().toLocaleString()}`;
      }

      toast.success(
        scheduleType === "now" 
          ? `Notification sent successfully! ${response.data.sentCount} delivered`
          : `Notification scheduled successfully!`
      );
      
      setHistory(prev => [{
        id: Date.now(),
        title,
        type: "Info",
        audience: audience === 'customer' ? 'Customers' :
                audience === 'agent' ? 'Agents' : 'Restaurants',
        status: notificationStatus,
        sentOn: sentOnText,
        scheduledAt: scheduledDate?.toISOString()
      }, ...prev]);
      
      clearForm();
    } else {
      toast.error(response.data.message || "Failed to send notification");
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    toast.error(
      error.response?.data?.message || "Failed to send notification"
    );
  } finally {
    setIsSending(false);
    setShowPreview(false);
  }
};

  // Clear form
  const clearForm = () => {
    setAudience("customer");
    setTitle("");
    setMessage("");
    setImage(null);
    setDeepLink("");
    setScheduleType("now");
    setScheduledDate(null);
    setRecurrence({ frequency: "Daily", time: "", endsOn: null });
    setSelectedIds([]);
    setShowPreview(false);
  };

  // Get preview image URL
  const previewImageURL =
    image && typeof image !== "string" ? URL.createObjectURL(image) : null;

  // Filter history based on status
  const filteredHistory = useMemo(() => {
    return statusFilter === "all"
      ? history
      : history.filter((item) => item.status === statusFilter);
  }, [statusFilter, history]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-orange-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Bell size={28} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Push Notification Center
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mt-1">
                Engage your audience with targeted notifications across all platforms
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Enhanced Notification Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-orange-100">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Send className="w-5 h-5 mr-2" />
              Create New Notification
            </h2>
          </div>
          
          <form onSubmit={handleSend} className="p-8 space-y-8">
            {/* Enhanced Audience Selection */}
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-gray-800 flex items-center">
                <Users className="w-5 h-5 mr-2 text-orange-500" />
                Target Audience
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {audiences.map((aud) => (
                  <button
                    key={aud.key}
                    type="button"
                    onClick={() => handleAudience(aud.key)}
                    className={`group relative p-6 rounded-xl border-2 transition-all duration-300 ${
                      audience === aud.key
                        ? "border-orange-500 bg-orange-50 shadow-lg scale-105"
                        : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        audience === aud.key ? aud.color : "bg-gray-100 group-hover:bg-gray-200"
                      }`}>
                        <aud.icon className={`w-6 h-6 ${
                          audience === aud.key ? "text-white" : "text-gray-600"
                        }`} />
                      </div>
                      <span className={`font-semibold ${
                        audience === aud.key ? "text-orange-700" : "text-gray-700"
                      }`}>
                        {aud.label}
                      </span>
                    </div>
                    {audience === aud.key && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-5 h-5 text-orange-500" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Enhanced Recipient Selection */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Recipients
                </label>
                <MultiSelectDropdown
                  options={currentList}
                  selected={selectedIds}
                  setSelected={setSelectedIds}
                  placeholder={`${audience}s`}
                  loading={loadingLists}
                />
              </div>
            </div>

            {/* Enhanced Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                  <span className="text-lg mr-2">📝</span>
                  Notification Title
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a compelling title..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 text-lg font-medium"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Keep it short and engaging</span>
                  <span>{title.length}/50</span>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                  <span className="text-lg mr-2">💬</span>
                  Message Content
                </label>
                <textarea
                  rows={4}
                  required
                  maxLength={140}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 resize-none"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Clear and actionable message</span>
                  <span>{message.length}/140</span>
                </div>
              </div>
            </div>

            

            {/* Enhanced Schedule Section */}
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-gray-800 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-500" />
                Delivery Schedule
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: "now", label: "Send Now", icon: Rocket, desc: "Immediate delivery" },
                  { key: "once", label: "Schedule Once", icon: Calendar, desc: "Set specific time" },
                  { key: "recurring", label: "Recurring", icon: Repeat, desc: "Repeat delivery" }
                ].map((type) => (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => setScheduleType(type.key)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      scheduleType === type.key
                        ? "border-orange-500 bg-orange-50 shadow-lg"
                        : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <type.icon className={`w-6 h-6 ${
                        scheduleType === type.key ? "text-orange-500" : "text-gray-400"
                      }`} />
                      <span className={`font-semibold ${
                        scheduleType === type.key ? "text-orange-700" : "text-gray-700"
                      }`}>
                        {type.label}
                      </span>
                      <span className="text-xs text-gray-500">{type.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Schedule Options */}
              {scheduleType === "once" && (
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-4">
                    <Calendar className="w-6 h-6 text-orange-500" />
                    <DatePicker
                      selected={scheduledDate}
                      onChange={(date) => setScheduledDate(date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      placeholderText="Select date and time"
                      className="flex-1 px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200"
                    />
                  </div>
                </div>
              )}

           {scheduleType === "recurring" && (
  <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Frequency Selector */}
      <div className="flex items-center gap-3">
        <Repeat className="w-5 h-5 text-orange-500" />
        <select
          value={recurrence.frequency}
          onChange={(e) => handleRecurrenceChange("frequency", e.target.value)}
          className="flex-1 px-3 py-2 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        >
          <option>Daily</option>
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      </div>

      {/* Enhanced Time Picker (only one instance) */}
      <div className="flex items-center gap-3 bg-orange-50 rounded-lg p-2">
        <Clock className="w-5 h-5 text-orange-500" />
        <div className="relative flex-1">
          <input
            type="time"
            value={recurrence.time}
            onChange={(e) => handleRecurrenceChange("time", e.target.value)}
            className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg 
                      focus:border-orange-500 focus:ring-2 focus:ring-orange-100
                      appearance-none bg-white"
            step="300" // 5-minute increments
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <ChevronDown className="w-4 h-4 text-orange-400" />
          </div>
        </div>
      </div>

      {/* End Date Picker */}
      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5 text-orange-500" />
        <DatePicker
          selected={recurrence.endsOn}
          onChange={(date) => handleRecurrenceChange("endsOn", date)}
          placeholderText="No end date"
          minDate={new Date()}
          className="flex-1 px-3 py-2 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
      </div>
    </div>
  </div>
)}
            </div>

            {/* Enhanced Form Actions */}
            <div className="flex flex-wrap justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                disabled={!title || !message}
                className="inline-flex items-center px-6 py-3 border-2 border-orange-500 text-orange-600 font-semibold rounded-xl hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>

              <button
                type="button"
                onClick={clearForm}
                className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Form
              </button>

              <button
                type="submit"
                disabled={!title || !message || isSending}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Enhanced Notification History */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-orange-100">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <History className="w-5 h-5 mr-2" />
              Notification History
            </h2>
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-gray-300" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all" className="text-gray-900">All Status</option>
                <option value="sent" className="text-gray-900">Sent</option>
                <option value="pending" className="text-gray-900">Pending</option>
                <option value="failed" className="text-gray-900">Failed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Notification
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Audience
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sent On
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No notifications found</p>
                      <p className="text-gray-400 text-sm">Your notification history will appear here</p>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((notification) => (
    <tr key={notification.id} className="hover:bg-orange-50 transition-colors">
      <td className="px-6 py-4">
        <div className="font-semibold text-gray-900">{notification.title}</div>
      </td>
      <td className="px-6 py-4">
        <TypeBadge type={notification.type} />
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-gray-700">{notification.audience}</span>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={notification.status} />
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-600">
          {notification.status === 'scheduled' && notification.scheduledAt ? (
            <>
              <div>Scheduled for:</div>
              <div className="font-medium">
                {new Date(notification.scheduledAt).toLocaleString()}
              </div>
            </>
          ) : (
            notification.sentOn
          )}
        </div>
      </td>
    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enhanced Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Preview Notification
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-orange-100 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8">
              {/* Phone Mockup */}
              <div className="bg-gray-900 rounded-2xl p-4 mx-auto max-w-sm">
                <div className="bg-white rounded-xl p-4 shadow-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {title || "Notification Title"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {message || "Your notification message will appear here."}
                      </p>
                      {previewImageURL && (
                        <img
                          src={previewImageURL}
                          alt="Notification preview"
                          className="w-full rounded-lg mt-3 max-h-32 object-cover"
                        />
                      )}
                      {deepLink && (
                        <div className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium mt-2">
                          <LinkIcon className="w-3 h-3 mr-1" />
                          Link attached
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Info */}
             <div className="mt-6 p-4 bg-gray-50 rounded-xl">
  <h4 className="font-semibold text-gray-800 mb-2">Delivery Details</h4>
  {scheduleType === "now" && (
    <p className="text-sm text-gray-600">
      This notification will be sent immediately to {selectedIds.length || 'all'} recipients.
    </p>
  )}
  {scheduleType === "once" && scheduledDate && (
    <p className="text-sm text-gray-600">
      <span className="font-semibold">Scheduled Delivery:</span>{' '}
      {scheduledDate.toLocaleString()}
    </p>
  )}
  {scheduleType === "recurring" && (
    <div className="space-y-1">
      <p className="text-sm text-gray-600">
        <span className="font-semibold">Recurrence:</span>{' '}
        {recurrence.frequency} at {recurrence.time || 'no time set'}
      </p>
      {recurrence.endsOn && (
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Ends On:</span>{' '}
          {recurrence.endsOn.toLocaleDateString()}
        </p>
      )}
    </div>
  )}
</div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
              >
                Close Preview
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-sm hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all"
              >
                {isSending ? "Sending..." : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PushNotificationPanel;