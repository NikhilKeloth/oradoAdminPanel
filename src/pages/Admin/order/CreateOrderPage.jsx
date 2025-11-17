import React, { useState, useMemo, useEffect } from "react";
import {
  FiArrowLeft,
  FiUser,
  FiMapPin,
  FiPhone,
  FiShoppingCart,
  FiCheck,
  FiPlus,
  FiTrash2,
  FiClock,
  FiPercent,
  FiTag,
  FiEdit3,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiX,
  FiHome,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { restaurantTableList } from '../../../apis/adminApis/adminFuntionsApi';
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://orado.online/backend';

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInvoiceExtras, setShowInvoiceExtras] = useState(false);
  
  // Merchant/Restaurant states
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [products, setProducts] = useState([]);
  const [showMerchantDropdown, setShowMerchantDropdown] = useState(false);
  const [merchantSearchTerm, setMerchantSearchTerm] = useState("");
  const [loadingMerchants, setLoadingMerchants] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Customer data states
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerAddresses, setCustomerAddresses] = useState([]);
  const [expandedAddress, setExpandedAddress] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Delivery mode tabs with enhanced styling
  const deliveryModes = [
    { 
      id: "take_away", 
      name: "Take Away", 
      icon: "📦",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    { 
      id: "home_delivery", 
      name: "Home Delivery", 
      icon: "🚚",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    { 
      id: "pick_drop", 
      name: "Pick & Drop", 
      icon: "🚗",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
  ];

  // Delivery options
  const deliveryOptions = [
    { id: "on_demand", name: "On Demand", description: "Prepare and deliver immediately" },
    { id: "scheduled", name: "Scheduled", description: "Schedule for later delivery" }
  ];

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    address: "",
    restaurantId: "",
    deliveryMode: "take_away",
    deliveryOption: "on_demand",
    preparationTime: "",
    scheduledAt: "",
    paymentMethod: "cash",
    paymentStatus: "pending",
    items: [],
    deliveryCharge: 0,
    discount: 0,
    taxPercent: 0,
    note: "",
    tip: 0,
    loyalty: 0,
    promo: "",
    // Pickup details
    pickupName: "",
    pickupPhone: "",
    pickupEmail: "",
  });

  // Get current delivery mode config
  const currentDeliveryMode = deliveryModes.find(mode => mode.id === form.deliveryMode);

  // Fetch merchants and customers on component mount
  useEffect(() => {
    fetchMerchants();
    fetchCustomers();
  }, []);

  // Fetch merchants from API using your restaurantTableList function
  const fetchMerchants = async () => {
    try {
      setLoadingMerchants(true);
      const response = await restaurantTableList();
      if (response.success) {
        setMerchants(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching merchants:', error);
      setMerchants([]);
    } finally {
      setLoadingMerchants(false);
    }
  };

  // Fetch products by restaurant
  const fetchProductsByRestaurant = async (restaurantId) => {
    if (!restaurantId) return;
    
    try {
      setLoadingProducts(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/products/by-restaurant/${restaurantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (response.data.success) {
        setProducts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/admin/customer-list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (response.data.success) {
        setCustomers(response.data.data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    }
  };

  // Fetch customer details and addresses
  const fetchCustomerDetails = async (customerId) => {
    if (!customerId) return;
    
    setLoadingCustomer(true);
    setLoadingAddresses(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/admin/customer/${customerId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (response.data.success) {
        const customerData = response.data.data;
        setCustomerAddresses(customerData.addresses || []);
        
        // Auto-select the first address if available for delivery modes
        if (customerData.addresses && customerData.addresses.length > 0 && 
            form.deliveryMode !== "take_away") {
          const firstAddress = customerData.addresses[0];
          setForm(prev => ({
            ...prev,
            address: formatAddress(firstAddress)
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      setCustomerAddresses([]);
    } finally {
      setLoadingCustomer(false);
      setLoadingAddresses(false);
    }
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "";
    
    const parts = [
      address.displayName,
      address.street,
      address.area,
      address.city,
      address.state,
      address.zip
    ].filter(part => part && part.trim() !== "");
    
    return parts.join(", ");
  };

  // Handle merchant selection
  const handleMerchantSelect = (merchant) => {
    setSelectedMerchant(merchant);
    setForm(prev => ({
      ...prev,
      restaurantId: merchant._id
    }));
    setMerchantSearchTerm(merchant.restaurantName);
    setShowMerchantDropdown(false);
    
    // Fetch products for selected merchant
    fetchProductsByRestaurant(merchant._id);
  };

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setForm(prev => ({
      ...prev,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      // For take away, also set pickup details
      pickupName: customer.name,
      pickupPhone: customer.phone,
      pickupEmail: customer.email,
    }));
    setSearchTerm(customer.name);
    setShowCustomerDropdown(false);
    
    // Fetch customer details and addresses
    fetchCustomerDetails(customer.userId);
  };

  // Handle address selection
  const handleAddressSelect = (address) => {
    setForm(prev => ({
      ...prev,
      address: formatAddress(address)
    }));
    setExpandedAddress(false);
  };

  // Handle delivery mode change
  const handleDeliveryModeChange = (mode) => {
    setForm(prev => ({
      ...prev,
      deliveryMode: mode,
      // Reset address when switching to take away
      address: mode === "take_away" ? "" : prev.address
    }));
    setExpandedAddress(false);
  };

  // Handle delivery option change
  const handleDeliveryOptionChange = (option) => {
    setForm(prev => ({
      ...prev,
      deliveryOption: option,
      // Clear scheduled time when switching to on demand
      scheduledAt: option === "on_demand" ? "" : prev.scheduledAt
    }));
  };

  // Filter merchants based on search
  const filteredMerchants = useMemo(() => {
    if (!merchantSearchTerm.trim()) return merchants;
    
    return merchants.filter(merchant =>
      merchant.restaurantName?.toLowerCase().includes(merchantSearchTerm.toLowerCase()) ||
      merchant.address?.toLowerCase().includes(merchantSearchTerm.toLowerCase())
    );
  }, [merchantSearchTerm, merchants]);

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, customers]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowCustomerDropdown(false);
      setShowMerchantDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Add blank item
  function addBlankItem() {
    setForm((s) => ({
      ...s,
      items: [
        ...s.items,
        { id: Date.now().toString(), name: "", qty: 1, price: 0 },
      ],
    }));
  }

  // Add product
  function addProduct(productName, price = 0) {
    setForm((s) => {
      const existsIdx = s.items.findIndex((it) => it.name === productName);
      if (existsIdx >= 0) {
        const items = s.items.map((it, i) =>
          i === existsIdx ? { ...it, qty: it.qty + 1 } : it
        );
        return { ...s, items };
      }
      return {
        ...s,
        items: [
          ...s.items,
          { id: Date.now().toString(), name: productName, qty: 1, price: price },
        ],
      };
    });
  }

  // Add product from merchant
  function addProductFromMerchant(product) {
    setForm((s) => {
      const existsIdx = s.items.findIndex((it) => it.productId === product._id);
      if (existsIdx >= 0) {
        const items = s.items.map((it, i) =>
          i === existsIdx ? { ...it, qty: it.qty + 1 } : it
        );
        return { ...s, items };
      }
      return {
        ...s,
        items: [
          ...s.items,
          { 
            id: Date.now().toString(), 
            productId: product._id,
            name: product.name, 
            qty: 1, 
            price: product.price,
            description: product.description 
          },
        ],
      };
    });
  }

  function updateItem(index, field, value) {
    const items = form.items.map((it, i) =>
      i === index ? { ...it, [field]: value } : it
    );
    setForm((s) => ({ ...s, items }));
  }

  function removeItem(index) {
    const items = form.items.filter((_, i) => i !== index);
    setForm((s) => ({ ...s, items }));
  }

  const subtotal = useMemo(
    () =>
      form.items.reduce(
        (acc, it) =>
          acc + (Number(it.qty) || 0) * (Number(it.price) || 0),
        0
      ),
    [form.items]
  );

  const tax = useMemo(
    () => (subtotal * Number(form.taxPercent || 0)) / 100,
    [subtotal, form.taxPercent]
  );

  const total = useMemo(
    () =>
      subtotal +
      tax +
      Number(form.deliveryCharge || 0) -
      Number(form.discount || 0) +
      Number(form.tip || 0) -
      Number(form.loyalty || 0),
    [subtotal, tax, form.deliveryCharge, form.discount, form.tip, form.loyalty]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validation
    if (!selectedMerchant) {
      alert("Please select a merchant first");
      return;
    }
    
    if (form.items.length === 0) {
      alert("Please add at least one item to the order");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = { 
        ...form, 
        subtotal, 
        tax, 
        total,
        customerId: selectedCustomer?.userId,
        restaurantName: selectedMerchant?.restaurantName
      };
      console.log("payload →", payload);

      await new Promise((r) => setTimeout(r, 700));

      alert("Order created successfully!");
      navigate("/admin/dashboard/order/table");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Address Edit Component
  const AddressEditModal = ({ address, onSave, onClose }) => {
    const [editForm, setEditForm] = useState({
      displayName: address?.displayName || "",
      street: address?.street || "",
      area: address?.area || "",
      city: address?.city || "",
      state: address?.state || "",
      zip: address?.zip || "",
      receiverPhone: address?.receiverPhone || "",
      isDefault: address?.isDefault || false
    });

    const handleSave = () => {
      onSave(editForm);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Edit Address</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-all">
              <FiX className="text-lg text-gray-600" />
            </button>
          </div>
          
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Display Name</label>
              <input
                type="text"
                value={editForm.displayName}
                onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="Home, Office, etc."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Street</label>
              <input
                type="text"
                value={editForm.street}
                onChange={(e) => setEditForm(prev => ({ ...prev, street: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="Street address"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Area</label>
              <input
                type="text"
                value={editForm.area}
                onChange={(e) => setEditForm(prev => ({ ...prev, area: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="Area/Locality"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="City"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">State</label>
                <input
                  type="text"
                  value={editForm.state}
                  onChange={(e) => setEditForm(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="State"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">ZIP Code</label>
                <input
                  type="text"
                  value={editForm.zip}
                  onChange={(e) => setEditForm(prev => ({ ...prev, zip: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="ZIP Code"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Receiver Phone</label>
                <input
                  type="text"
                  value={editForm.receiverPhone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, receiverPhone: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Receiver phone"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={editForm.isDefault}
                onChange={(e) => setEditForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Set as default address
              </label>
            </div>
          </div>

          <div className="flex space-x-2 p-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:border-gray-400 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-all"
            >
              Save Address
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow p-4 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                to="/admin/dashboard/order/table"
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
              >
                <FiArrowLeft className="text-sm" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <FiShoppingCart className="text-xl" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Create New Order</h1>
                  <p className="text-orange-100 text-sm">Create manual order for customer</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-orange-100 text-sm">Order Total</div>
              <div className="text-lg font-bold">₹ {total.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column - Main Form */}
            <div className="lg:col-span-2 space-y-4">
              {/* Customer Information Card */}
              <div className="bg-white rounded-xl shadow p-4 border border-orange-100">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-1.5 bg-orange-100 rounded-lg">
                    <FiUser className="text-orange-600 text-sm" />
                  </div>
                  <h2 className="font-semibold text-gray-800">Customer Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1 relative">
                    <label className="text-xs font-medium text-gray-700">Customer Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-2 top-2 text-orange-400 text-sm z-10" />
                      <input
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowCustomerDropdown(true);
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                        className="pl-8 w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        placeholder="Search customer..."
                      />
                      <FiSearch className="absolute right-2 top-2 text-gray-400 text-sm" />
                    </div>

                    {/* Customer Dropdown */}
                    {showCustomerDropdown && filteredCustomers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto mt-1">
                        {filteredCustomers.map((customer) => (
                          <div
                            key={customer.userId}
                            className="p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => handleCustomerSelect(customer)}
                          >
                            <div className="font-medium text-gray-800">{customer.name}</div>
                            <div className="text-sm text-gray-600">{customer.phone}</div>
                            <div className="text-xs text-gray-500 truncate">{customer.email}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {showCustomerDropdown && searchTerm && filteredCustomers.length === 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-20 mt-1 p-3 text-center text-gray-500">
                        No customers found
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Phone</label>
                    <div className="relative">
                      <FiPhone className="absolute left-2 top-2 text-orange-400 text-sm" />
                      <input
                        value={form.customerPhone}
                        readOnly
                        className="pl-8 w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-50 text-gray-600"
                        placeholder="Phone will auto-fill"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Email</label>
                    <div className="relative">
                      <FiMail className="absolute left-2 top-2 text-orange-400 text-sm" />
                      <input
                        value={form.customerEmail}
                        readOnly
                        className="pl-8 w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-50 text-gray-600"
                        placeholder="Email will auto-fill"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Mode Tabs */}
                <div className="mt-4">
                  <label className="text-xs font-medium text-gray-700 mb-2 block">Delivery Mode</label>
                  <div className="flex space-x-2">
                    {deliveryModes.map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => handleDeliveryModeChange(mode.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all flex-1 text-sm font-medium ${
                          form.deliveryMode === mode.id
                            ? `bg-gradient-to-r ${mode.color} text-white border-transparent shadow-md`
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-base">{mode.icon}</span>
                        <span>{mode.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="mt-4">
                  <label className="text-xs font-medium text-gray-700 mb-2 block">Delivery Option</label>
                  <div className="grid grid-cols-2 gap-3">
                    {deliveryOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleDeliveryOptionChange(option.id)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          form.deliveryOption === option.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        <div className="font-medium text-gray-800 text-sm">{option.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scheduled Delivery - Show only when scheduled option is selected */}
                {form.deliveryOption === "scheduled" && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <h3 className="font-medium text-gray-800 text-sm mb-2 flex items-center space-x-2">
                      <FiClock className="text-orange-500" />
                      <span>Schedule Delivery</span>
                    </h3>
                    <div className="relative">
                      <FiClock className="absolute left-2 top-2 text-orange-400 text-sm z-10" />
                      <input
                        type="datetime-local"
                        value={form.scheduledAt}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            scheduledAt: e.target.value,
                          }))
                        }
                        className="pl-8 w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Delivery Address Section - Show for Home Delivery & Pick & Drop */}
                {(form.deliveryMode === "home_delivery" || form.deliveryMode === "pick_drop") && selectedCustomer && (
                  <div className={`mt-4 space-y-3 p-3 rounded-lg border-2 ${currentDeliveryMode.bgColor} ${currentDeliveryMode.borderColor}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-800 text-sm flex items-center space-x-2">
                        <span className={`p-1 rounded ${currentDeliveryMode.bgColor.replace('bg-', 'bg-')}`}>
                          {form.deliveryMode === "home_delivery" ? "🏠" : "🚗"}
                        </span>
                        <span>
                          {form.deliveryMode === "home_delivery" ? "Delivery Address" : "Pickup & Drop Address"}
                        </span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setExpandedAddress(!expandedAddress)}
                        className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-sm"
                      >
                        <span>Choose from saved addresses</span>
                        {expandedAddress ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                    </div>

                    {expandedAddress && (
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        {loadingAddresses ? (
                          <div className="text-center py-4 text-gray-500">
                            Loading addresses...
                          </div>
                        ) : customerAddresses.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {customerAddresses.map((address) => (
                              <div
                                key={address._id}
                                className="bg-white rounded-lg border border-gray-200 p-3 hover:border-orange-300 cursor-pointer transition-all"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-800 text-sm">
                                      {address.displayName || address.type}
                                    </span>
                                    {address.isDefault && (
                                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex space-x-1">
                                    <button
                                      type="button"
                                      className="p-1 text-orange-600 hover:bg-orange-100 rounded transition-all"
                                      onClick={() => handleAddressSelect(address)}
                                    >
                                      <FiCheck className="text-sm" />
                                    </button>
                                    <button
                                      type="button"
                                      className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-all"
                                      onClick={() => setEditingAddress(address)}
                                    >
                                      <FiEdit3 className="text-sm" />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="text-xs text-gray-600 space-y-1">
                                  <div className="line-clamp-2">{address.street}</div>
                                  {address.area && <div>{address.area}</div>}
                                  <div>
                                    {address.city}, {address.state} - {address.zip}
                                  </div>
                                  {address.receiverPhone && (
                                    <div className="text-gray-500 mt-1">
                                      📞 {address.receiverPhone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No saved addresses found for this customer.
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">
                        {form.deliveryMode === "home_delivery" ? "Delivery Address" : "Pickup & Drop Address"}
                      </label>
                      <div className="relative">
                        <FiMapPin className="absolute left-2 top-2 text-orange-400 text-sm" />
                        <textarea
                          rows={3}
                          value={form.address}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, address: e.target.value }))
                          }
                          className="pl-8 w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                          placeholder={
                            form.deliveryMode === "home_delivery" 
                              ? "Enter delivery address or select from saved addresses above"
                              : "Enter pickup and drop address or select from saved addresses above"
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Pickup Details Section - Show for Take Away */}
                {form.deliveryMode === "take_away" && (
                  <div className={`mt-4 space-y-3 p-3 rounded-lg border-2 ${currentDeliveryMode.bgColor} ${currentDeliveryMode.borderColor}`}>
                    <h3 className="font-medium text-gray-800 text-sm flex items-center space-x-2">
                      <span className="p-1 rounded bg-blue-100">📦</span>
                      <span>Pickup Details</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Pickup Name</label>
                        <div className="relative">
                          <FiUser className="absolute left-2 top-2 text-orange-400 text-sm" />
                          <input
                            value={form.pickupName}
                            onChange={(e) =>
                              setForm((s) => ({ ...s, pickupName: e.target.value }))
                            }
                            className="pl-8 w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            placeholder="Name for pickup"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Pickup Phone</label>
                        <div className="relative">
                          <FiPhone className="absolute left-2 top-2 text-orange-400 text-sm" />
                          <input
                            value={form.pickupPhone}
                            onChange={(e) =>
                              setForm((s) => ({ ...s, pickupPhone: e.target.value }))
                            }
                            className="pl-8 w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            placeholder="Phone for pickup"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Pickup Email</label>
                        <div className="relative">
                          <FiMail className="absolute left-2 top-2 text-orange-400 text-sm" />
                          <input
                            type="email"
                            value={form.pickupEmail}
                            onChange={(e) =>
                              setForm((s) => ({ ...s, pickupEmail: e.target.value }))
                            }
                            className="pl-8 w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            placeholder="Email for pickup"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Preparation Time (min)</label>
                    <input
                      type="number"
                      value={form.preparationTime}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          preparationTime: e.target.value,
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      placeholder="Estimated preparation time in minutes"
                    />
                  </div>
                </div>
              </div>

              {/* Merchant Selection Card - MOVED HERE (before Order Items) */}
              <div className="bg-white rounded-xl shadow p-4 border border-orange-100">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-1.5 bg-orange-100 rounded-lg">
                    <FiHome className="text-orange-600 text-sm" />
                  </div>
                  <h2 className="font-semibold text-gray-800">Select Merchant</h2>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1 relative">
                    <label className="text-xs font-medium text-gray-700">Search Merchant</label>
                    <div className="relative">
                      <FiHome className="absolute left-2 top-2 text-orange-400 text-sm z-10" />
                      <input
                        value={merchantSearchTerm}
                        onChange={(e) => {
                          setMerchantSearchTerm(e.target.value);
                          setShowMerchantDropdown(true);
                        }}
                        onFocus={() => setShowMerchantDropdown(true)}
                        className="pl-8 w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        placeholder="Search for restaurant or merchant..."
                      />
                      <FiSearch className="absolute right-2 top-2 text-gray-400 text-sm" />
                    </div>

                    {/* Merchant Dropdown */}
                    {showMerchantDropdown && filteredMerchants.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto mt-1">
                        {filteredMerchants.map((merchant) => (
                          <div
                            key={merchant._id}
                            className="p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => handleMerchantSelect(merchant)}
                          >
                            <div className="font-medium text-gray-800">{merchant.restaurantName}</div>
                            <div className="text-sm text-gray-600">{merchant.address}</div>
                            <div className="text-xs text-gray-500">{merchant.phone}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {showMerchantDropdown && merchantSearchTerm && filteredMerchants.length === 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-20 mt-1 p-3 text-center text-gray-500">
                        {loadingMerchants ? 'Loading merchants...' : 'No merchants found'}
                      </div>
                    )}
                  </div>

                  {selectedMerchant && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-green-800">{selectedMerchant.restaurantName}</div>
                          <div className="text-sm text-green-600">{selectedMerchant.address}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMerchant(null);
                            setMerchantSearchTerm("");
                            setProducts([]);
                            setForm(prev => ({ ...prev, restaurantId: "", items: [] }));
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items Card */}
              <div className="bg-white rounded-xl shadow p-4 border border-orange-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-orange-100 rounded-lg">
                      <FiShoppingCart className="text-orange-600 text-sm" />
                    </div>
                    <h2 className="font-semibold text-gray-800">Order Items</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter product name..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const productName = e.target.value.trim();
                            if (productName) {
                              addProduct(productName);
                              e.target.value = "";
                            }
                          }
                        }}
                        className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all w-48"
                      />
                      <div className="absolute right-2 top-2 text-gray-400 text-xs">
                        Enter to add
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addBlankItem}
                      className="flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow shadow-orange-200 text-sm"
                    >
                      <FiPlus className="text-sm" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>

                {/* Merchant Products Section */}
                {selectedMerchant && products.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-gray-800 text-sm mb-2">Available Products from {selectedMerchant.restaurantName}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                      {products.map((product) => (
                        <button
                          key={product._id}
                          type="button"
                          onClick={() => addProductFromMerchant(product)}
                          className="text-left p-2 bg-white border border-gray-300 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all text-sm"
                        >
                          <div className="font-medium text-gray-800">{product.name}</div>
                          <div className="text-xs text-gray-600">₹ {product.price}</div>
                          {product.description && (
                            <div className="text-xs text-gray-500 truncate">{product.description}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMerchant && products.length === 0 && !loadingProducts && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    No products found for this merchant.
                  </div>
                )}

                {loadingProducts && (
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 text-center">
                    Loading products...
                  </div>
                )}

                <div className="space-y-2">
                  {form.items.length === 0 && (
                    <div className="text-center py-4 text-gray-500 border border-dashed border-gray-300 rounded-lg text-sm">
                      <FiShoppingCart className="text-2xl mx-auto mb-1 text-gray-400" />
                      <p>No items added yet</p>
                      {!selectedMerchant && (
                        <p className="text-xs mt-1">Select a merchant first to see available products</p>
                      )}
                    </div>
                  )}

                  {form.items.map((it, idx) => (
                    <div
                      key={it.id}
                      className="grid grid-cols-12 gap-2 items-center bg-orange-50 p-2 rounded-lg border border-orange-100 transition-all hover:border-orange-300 text-sm"
                    >
                      <div className="col-span-5">
                        <input
                          value={it.name}
                          onChange={(e) =>
                            updateItem(idx, "name", e.target.value)
                          }
                          placeholder="Item name"
                          className="w-full p-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white text-sm"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min={1}
                          value={it.qty}
                          onChange={(e) =>
                            updateItem(idx, "qty", Number(e.target.value))
                          }
                          className="w-full p-1.5 border border-gray-300 rounded text-center focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white text-sm"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={it.price}
                          onChange={(e) =>
                            updateItem(idx, "price", Number(e.target.value))
                          }
                          className="w-full p-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white text-sm"
                        />
                      </div>

                      <div className="col-span-1 text-right font-semibold text-orange-600">
                        ₹ {(Number(it.qty) * Number(it.price)).toFixed(2)}
                      </div>

                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-all"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes & Charges Card */}
              <div className="bg-white rounded-xl shadow p-4 border border-orange-100">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-1.5 bg-orange-100 rounded-lg">
                    <FiEdit3 className="text-orange-600 text-sm" />
                  </div>
                  <h2 className="font-semibold text-gray-800">Notes & Charges</h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Order Notes</label>
                    <textarea
                      value={form.note}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, note: e.target.value }))
                      }
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      placeholder="Order notes / instructions"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">Delivery Charge</label>
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-orange-400 text-sm">₹</span>
                        <input
                          type="number"
                          value={form.deliveryCharge}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              deliveryCharge: Number(e.target.value),
                            }))
                          }
                          className="pl-7 w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">Flat Discount</label>
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-orange-400 text-sm">₹</span>
                        <input
                          type="number"
                          value={form.discount}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              discount: Number(e.target.value),
                            }))
                          }
                          className="pl-7 w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">Tax (%)</label>
                      <div className="relative">
                        <FiPercent className="absolute left-2 top-2 text-orange-400 text-sm" />
                        <input
                          type="number"
                          value={form.taxPercent}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              taxPercent: Number(e.target.value),
                            }))
                          }
                          className="pl-7 w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Empty space to maintain grid layout */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">&nbsp;</label>
                      <div className="w-full p-2"></div>
                    </div>
                  </div>

                  {/* Payment Section */}
                  <div className="pt-3 border-t border-gray-200">
                    <h4 className="font-medium text-gray-800 text-sm mb-2">Payment Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Payment Method</label>
                        <select
                          value={form.paymentMethod}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              paymentMethod: e.target.value,
                            }))
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        >
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="online">Online</option>
                          <option value="upi">UPI</option>
                          <option value="wallet">Wallet</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Payment Status</label>
                        <select
                          value={form.paymentStatus}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              paymentStatus: e.target.value,
                            }))
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Generation */}
                  {!showInvoiceExtras && (
                    <button
                      type="button"
                      onClick={() => setShowInvoiceExtras(true)}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 rounded-lg font-semibold text-sm hover:from-orange-600 hover:to-amber-600 transition-all shadow shadow-orange-200 mt-3"
                    >
                      Generate Invoice
                    </button>
                  )}

                  {/* Invoice Extras */}
                  {showInvoiceExtras && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg space-y-3 text-sm">
                      <h4 className="font-semibold text-gray-800">Invoice Extras</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Tip Amount</label>
                          <div className="relative">
                            <span className="absolute left-2 top-2 text-orange-400 text-sm">₹</span>
                            <input
                              type="number"
                              value={form.tip}
                              onChange={(e) =>
                                setForm((s) => ({
                                  ...s,
                                  tip: Number(e.target.value),
                                }))
                              }
                              className="pl-7 w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Loyalty Points</label>
                          <div className="relative">
                            <FiTag className="absolute left-2 top-2 text-orange-400 text-sm" />
                            <input
                              type="number"
                              value={form.loyalty}
                              onChange={(e) =>
                                setForm((s) => ({
                                  ...s,
                                  loyalty: Number(e.target.value),
                                }))
                              }
                              className="pl-7 w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Promo Code</label>
                          <input
                            type="text"
                            value={form.promo}
                            onChange={(e) =>
                              setForm((s) => ({ ...s, promo: e.target.value }))
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            placeholder="Enter promo code"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-4">
              {/* Order Summary Card - Sticky */}
              <div className="bg-white rounded-xl shadow p-4 border border-orange-100 sticky top-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-1.5 bg-orange-100 rounded-lg">
                    <span className="text-orange-600 text-sm font-bold">₹</span>
                  </div>
                  <h2 className="font-semibold text-gray-800">Order Summary</h2>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹ {subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <span className="text-gray-600">Tax ({form.taxPercent}%)</span>
                    <span className="font-semibold">₹ {tax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-semibold">₹ {Number(form.deliveryCharge).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-semibold text-red-500">- ₹ {Number(form.discount).toFixed(2)}</span>
                  </div>

                  {showInvoiceExtras && (
                    <>
                      <div className="flex justify-between items-center py-1 border-b border-gray-200">
                        <span className="text-gray-600">Tip</span>
                        <span className="font-semibold text-green-500">+ ₹ {Number(form.tip).toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-gray-200">
                        <span className="text-gray-600">Loyalty</span>
                        <span className="font-semibold text-red-500">- ₹ {Number(form.loyalty).toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t-2 border-orange-200">
                    <span className="font-bold text-gray-800">Total</span>
                    <span className="text-lg font-bold text-orange-600">₹ {total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  {showInvoiceExtras ? (
                    <button
                      disabled={isSubmitting || !selectedMerchant || form.items.length === 0}
                      type="submit"
                      className="w-full flex items-center justify-center space-x-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 rounded-lg font-semibold text-sm hover:from-green-600 hover:to-emerald-600 transition-all shadow shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span>Creating Order...</span>
                      ) : (
                        <>
                          <FiCheck className="text-sm" />
                          <span>Create Order</span>
                        </>
                      )}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => navigate("/admin/dashboard/order/table")}
                    className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold text-sm hover:border-orange-500 hover:text-orange-600 transition-all"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>

              {/* Quick Actions Card - Not sticky */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow p-4 text-white">
                <h3 className="font-semibold mb-3 text-sm">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={addBlankItem}
                    className="w-full text-left p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all flex items-center space-x-2 text-sm"
                  >
                    <FiPlus className="text-sm" />
                    <span>Add Custom Item</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addProduct("Custom Product")}
                    className="w-full text-left p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all flex items-center space-x-2 text-sm"
                  >
                    <FiPlus className="text-sm" />
                    <span>Add Sample Item</span>
                  </button>
                  {selectedMerchant && (
                    <div className="text-xs text-orange-100 pt-2">
                      Selected: {selectedMerchant.restaurantName}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Address Edit Modal */}
      {editingAddress && (
        <AddressEditModal
          address={editingAddress}
          onSave={(updatedAddress) => {
            // Handle address update logic here
            console.log("Updated address:", updatedAddress);
            // You would typically make an API call to update the address
          }}
          onClose={() => setEditingAddress(null)}
        />
      )}
    </div>
  );
}