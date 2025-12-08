import React, { useState, useMemo, useEffect, useRef } from "react";
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
  FiMinus,
  FiStar,
  FiPackage,
  FiArrowRight,
  FiArrowLeft as FiArrowLeftIcon,
  FiRefreshCw
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { restaurantTableList } from '../../../apis/adminApis/adminFuntionsApi';
// import { getOrderPriceSummary } from '../../../apis/adminApis/orderApi'; // Add this import
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://orado.online/backend';

// Tab components
import CustomerInfoTab from './tabs/CustomerInfoTab';
import MerchantMenuTab from './tabs/MerchantMenuTab';
import NotesChargesTab from './tabs/NotesChargesTab';

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartId, setCartId] = useState(null);

  // Price Summary State
  const [priceSummary, setPriceSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);


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
  
  // Menu state
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const merchantRef = useRef(null);
  const customerRef = useRef(null);

  

  // Delivery mode tabs
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
    deliveryMode: "home_delivery",
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
    coupon: '',
    couponId: null,
    couponData: null,
    couponDiscount: 0,
    // Pickup details
    pickupName: "",
    pickupPhone: "",
    pickupEmail: "",
    additionalInfo: {
      address: "",
      landmark: "", 
      secondaryContact: ""
    }
  });

  // Get current delivery mode config
  const currentDeliveryMode = deliveryModes.find(mode => mode.id === form.deliveryMode);

  const steps = [
    { id: 1, title: "Customer Info", icon: FiUser, description: "Customer & Delivery Details" },
    { id: 2, title: "Merchant & Menu", icon: FiHome, description: "Select Restaurant & Items" },
    { id: 3, title: "Payment & Notes", icon: FiTag, description: "Finalize & Create Order" },
  ];

  // Fetch merchants and customers on component mount
  useEffect(() => {
    fetchMerchants();
    fetchCustomers();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (merchantRef.current && !merchantRef.current.contains(event.target)) {
        setShowMerchantDropdown(false);
      }
      if (customerRef.current && !customerRef.current.contains(event.target)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getOrderPriceSummary = async (requestData) => {
  try {
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
    return response.data;
  } catch (error) {
    console.error('Error fetching order price summary:', error);
    throw error;
  }
};
  

  // ========== PRICE SUMMARY FUNCTION ==========
  // const fetchPriceSummary = async () => {
  //   if (!selectedCustomer || !cartId || !selectedMerchant) {
  //     console.log('Missing required data for price summary');
  //     return;
  //   }

  //   setLoadingSummary(true);
  //   setSummaryError(null);

  //   try {
  //     const requestData = {
  //       cartId: cartId,
  //       userId: selectedCustomer.userId,
  //       tipAmount: form.tip || 0,
  //       useLoyaltyPoints: form.loyalty > 0,
  //       loyaltyPointsToRedeem: form.loyalty || 0,
  //       useWallet: false,
  //       walletAmount: 0,
  //       couponCode: form.coupon || '',
  //       // Add coordinates only for delivery orders
  //       ...(form.deliveryMode !== 'take_away' && {
  //         longitude: 77.5946, // You'll need to get these from customer address
  //         latitude: 12.9716   // You'll need to get these from customer address
  //       })
  //     };

  //     console.log('Fetching price summary with:', requestData);

  //     const response = await getOrderPriceSummary(requestData);
      
  //     if (response.messageType === "success") {
  //       setPriceSummary(response.data);
  //       console.log('Price summary updated:', response.data);
  //     } else {
  //       setSummaryError(response.error || 'Failed to calculate price summary');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching price summary:', error);
  //     setSummaryError(error.response?.data?.error || 'Failed to calculate order summary');
  //   } finally {
  //     setLoadingSummary(false);
  //   }
  // };

  // ========== PRICE SUMMARY FUNCTION ==========
  // ========== PRICE SUMMARY FUNCTION ==========
  const fetchPriceSummary = async () => {
    if (!selectedCustomer || !cartId || !selectedMerchant) {
      alert("Please select customer, restaurant and add items first");
      return;
    }

    setLoadingSummary(true);
    setSummaryError(null);

    try {
      // GET COORDINATES FROM SELECTED ADDRESS
      let longitude = null;
      let latitude = null;

      // Find the currently selected address from customerAddresses
      const selectedAddress = customerAddresses.find(addr => 
        formatAddress(addr) === form.address
      );

      // If we found the selected address and it has coordinates
      if (selectedAddress && selectedAddress.location && selectedAddress.location.coordinates) {
        longitude = selectedAddress.location.coordinates[0];
        latitude = selectedAddress.location.coordinates[1];
        console.log('Using coordinates from selected address:', { longitude, latitude });
      } else {
        console.log('No coordinates found for selected address');
      }

      const requestData = {
        cartId: cartId,
        userId: selectedCustomer.userId,
        tipAmount: form.tip || 0,
        useLoyaltyPoints: form.loyalty > 0,
        loyaltyPointsToRedeem: form.loyalty || 0,
        useWallet: false,
        walletAmount: 0,
        couponCode: form.coupon || '',
        // Add coordinates only for delivery orders and if we have them
        ...(form.deliveryMode !== 'take_away' && longitude && latitude && {
          longitude: longitude,
          latitude: latitude
        })
      };

      console.log('Fetching price summary with:', requestData);

      const response = await getOrderPriceSummary(requestData);
      
      if (response.messageType === "success") {
        setPriceSummary(response.data);
        setInvoiceGenerated(true);
        console.log('Price summary updated:', response.data);
      } else {
        setSummaryError(response.error || 'Failed to calculate price summary');
      }
    } catch (error) {
      console.error('Error fetching price summary:', error);
      setSummaryError(error.response?.data?.error || 'Failed to calculate order summary');
    } finally {
      setLoadingSummary(false);
    }
  };
  // Auto-trigger price summary when relevant data changes
  useEffect(() => {
    if (selectedCustomer && cartId && selectedMerchant && form.items.length > 0) {
      const timer = setTimeout(() => {
        fetchPriceSummary();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [
    form.tip, 
    form.loyalty, 
    form.coupon,
    form.items,
    selectedCustomer, 
    cartId, 
    selectedMerchant
  ]);

  // ========== CART API FUNCTIONS ==========
  const addToCartAPI = async (cartData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const requestData = {
        restaurantId: cartData.restaurantId,
        customerId: selectedCustomer.userId, 
        products: [
          {
            productId: cartData.productId,
            quantity: cartData.quantity
          }
        ]
      };

      console.log('Sending to cart/add:', requestData);
      const response = await axios.post(`${API_BASE_URL}/admin/cart/add`, requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.cart && response.data.cart._id) {
        setCartId(response.data.cart._id);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error.response?.data || error.message);
      throw error;
    }
  };

  const removeFromCartAPI = async (productId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const requestData = {
        restaurantId: selectedMerchant.id,
        products: [
          {
            productId: productId,
            quantity: 0
          }
        ]
      };

      const response = await axios.post(`${API_BASE_URL}/admin/cart/add`, requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  // Main add to cart function
  const addToCart = async (product, quantity) => {
    if (!selectedMerchant || !selectedCustomer) {
      alert("Please select both customer and restaurant first");
      return false;
    }

    if (quantity < 0) return false;
    
    try {
      const cartData = {
        restaurantId: selectedMerchant.id,
        productId: product._id,
        quantity: quantity
      };

      let apiResult;
      
      if (quantity === 0) {
        apiResult = await removeFromCartAPI(product._id);
      } else {
        apiResult = await addToCartAPI(cartData);
      }

      if (apiResult.success) {
        setForm(prev => {
          const existsIdx = prev.items.findIndex(item => item.productId === product._id);

          if (existsIdx >= 0) {
            if (quantity === 0) {
              const items = prev.items.filter((_, i) => i !== existsIdx);
              return { ...prev, items };
            } else {
              const items = prev.items.map((item, i) =>
                i === existsIdx ? { ...item, qty: quantity } : item
              );
              return { ...prev, items };
            }
          } else if (quantity > 0) {
            return {
              ...prev,
              items: [
                ...prev.items,
                {
                  id: Date.now().toString(),
                  productId: product._id,
                  categoryId: product.categoryId,
                  restaurantId: selectedMerchant.id,
                  customerId: selectedCustomer.userId,
                  name: product.name,
                  qty: quantity,
                  price: product.price,
                  description: product.description,
                  image: product.images?.[0]
                }
              ]
            };
          }
          return prev;
        });
        return true;
      }
    } catch (error) {
      console.error('Error in addToCart:', error);
      alert('Failed to update cart. Please try again.');
      return false;
    }
  };

  // Add product from merchant menu
  const addProductFromMerchant = async (product) => {
    const currentQty = getItemQuantity(product._id);
    return await addToCart(product, currentQty + 1);
  };

  // Decrease product quantity
  const decreaseProductQuantity = async (product) => {
    const currentQty = getItemQuantity(product._id);
    if (currentQty > 0) {
      return await addToCart(product, currentQty - 1);
    }
    return false;
  };

  // ========== EXISTING FUNCTIONS ==========
  const fetchMerchants = async () => {
    try {
      setLoadingMerchants(true);
      const response = await restaurantTableList();
      if (response.messageType === "success") {
        setMerchants(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching merchants:', error);
      setMerchants([]);
    } finally {
      setLoadingMerchants(false);
    }
  };

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
        setProducts(response.data.data || []);
        const categoryIds = new Set(response.data.data.map(cat => cat.categoryId));
        setExpandedCategories(categoryIds);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching restaurant menu:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

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

  const handleMerchantSelect = (merchant) => {
    setSelectedMerchant(merchant);
    setForm(prev => ({
      ...prev,
      restaurantId: merchant.id
    }));
    setMerchantSearchTerm(merchant.name);
    setShowMerchantDropdown(false);
    setCartId(null);
    setForm(prev => ({ ...prev, items: [] }));
    fetchRestaurantMenu(merchant.id);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setForm(prev => ({
      ...prev,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      pickupName: customer.name,
      pickupPhone: customer.phone,
      pickupEmail: customer.email,
    }));
    setSearchTerm(customer.name);
    setShowCustomerDropdown(false);
    setCartId(null);
    setForm(prev => ({ ...prev, items: [] }));
    fetchCustomerDetails(customer.userId);
  };

  const handleAddressSelect = (address) => {
    setForm(prev => ({
      ...prev,
      address: formatAddress(address)
    }));
    setExpandedAddress(false);
  };

  const handleDeliveryModeChange = (mode) => {
    setForm(prev => ({
      ...prev,
      deliveryMode: mode,
      address: mode === "take_away" ? "" : prev.address
    }));
    setExpandedAddress(false);
  };

  const handleDeliveryOptionChange = (option) => {
    setForm(prev => ({
      ...prev,
      deliveryOption: option,
      scheduledAt: option === "on_demand" ? "" : prev.scheduledAt
    }));
  };

  const filteredMerchants = useMemo(() => {
    if (!merchantSearchTerm.trim()) return merchants;
    return merchants.filter(merchant =>
      merchant.name?.toLowerCase().includes(merchantSearchTerm.toLowerCase()) ||
      merchant.address?.toLowerCase().includes(merchantSearchTerm.toLowerCase()) ||
      merchant.city?.toLowerCase().includes(merchantSearchTerm.toLowerCase())
    );
  }, [merchantSearchTerm, merchants]);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, customers]);

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

  const getItemQuantity = (productId) => {
    const item = form.items.find(item => item.productId === productId);
    return item ? item.qty : 0;
  };

  function addBlankItem() {
    if (!selectedMerchant || !selectedCustomer) {
      alert("Please select both customer and restaurant first");
      return;
    }
    setForm((s) => ({
      ...s,
      items: [
        ...s.items,
        { 
          id: Date.now().toString(), 
          name: "", 
          qty: 1, 
          price: 0,
          restaurantId: selectedMerchant.id,
          customerId: selectedCustomer.userId,
          categoryId: "custom"
        },
      ],
    }));
  }

  function addProduct(productName, price = 0) {
    if (!selectedMerchant || !selectedCustomer) {
      alert("Please select both customer and restaurant first");
      return;
    }
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
          { 
            id: Date.now().toString(), 
            name: productName, 
            qty: 1, 
            price: price,
            restaurantId: selectedMerchant.id,
            customerId: selectedCustomer.userId,
            categoryId: "custom"
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
      Number(form.discount || 0) -
      Number(form.couponDiscount || 0) +
      Number(form.tip || 0) -
      Number(form.loyalty || 0),
    [subtotal, tax, form.deliveryCharge, form.discount, form.couponDiscount, form.tip, form.loyalty]
  );

  // Use backend calculated total if available
  const displayTotal = priceSummary?.finalAmount || total;

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return selectedCustomer &&
              (form.deliveryMode === "take_away" ||
                (form.deliveryMode !== "take_away" && form.address.trim()));
      case 2:
        return selectedMerchant && form.items.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (currentStep !== 3) {
      nextStep();
      return;
    }

    if (!validateStep(3)) {
      alert("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        subtotal,
        tax,
        total: displayTotal, // Use backend calculated total
        customerId: selectedCustomer?.userId,
        restaurantName: selectedMerchant?.name,
        merchantId: selectedMerchant?.id,
        cartId: cartId,
        items: form.items.map(item => ({
          ...item,
          restaurantId: selectedMerchant.id,
          customerId: selectedCustomer.userId,
          categoryId: item.categoryId || "custom"
        }))
      };

      console.log("Order payload →", payload);
      await new Promise((r) => setTimeout(r, 700));
      alert("Order created successfully!");
      navigate("/admin/dashboard/order/table");
    } catch (error) {
      console.error('Error creating order:', error);
      alert("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleNextClick = (e) => {
    e.preventDefault();
    if (currentStep < steps.length) {
      nextStep();
    } else {
      handleSubmit(e);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CustomerInfoTab
            form={form}
            setForm={setForm}
            selectedCustomer={selectedCustomer}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showCustomerDropdown={showCustomerDropdown}
            setShowCustomerDropdown={setShowCustomerDropdown}
            filteredCustomers={filteredCustomers}
            handleCustomerSelect={handleCustomerSelect}
            customerRef={customerRef}
            deliveryModes={deliveryModes}
            handleDeliveryModeChange={handleDeliveryModeChange}
            deliveryOptions={deliveryOptions}
            handleDeliveryOptionChange={handleDeliveryOptionChange}
            setCustomerAddresses={setCustomerAddresses}
            currentDeliveryMode={currentDeliveryMode}
            customerAddresses={customerAddresses}
            expandedAddress={expandedAddress}
            setExpandedAddress={setExpandedAddress}
            handleAddressSelect={handleAddressSelect}
            loadingAddresses={loadingAddresses}
            setEditingAddress={setEditingAddress}
            formatAddress={formatAddress}
          />
        );
      case 2:
        return (
          <MerchantMenuTab
            selectedMerchant={selectedMerchant}
            setSelectedMerchant={setSelectedMerchant}
            merchantSearchTerm={merchantSearchTerm}
            setMerchantSearchTerm={setMerchantSearchTerm}
            showMerchantDropdown={showMerchantDropdown}
            setShowMerchantDropdown={setShowMerchantDropdown}
            filteredMerchants={filteredMerchants}
            handleMerchantSelect={handleMerchantSelect}
            merchantRef={merchantRef}
            loadingMerchants={loadingMerchants}
            products={products}
            loadingProducts={loadingProducts}
            expandedCategories={expandedCategories}
            toggleCategory={toggleCategory}
            form={form}
            setForm={setForm}
            addProductFromMerchant={addProductFromMerchant}
            getItemQuantity={getItemQuantity}
            decreaseProductQuantity={decreaseProductQuantity}
            addBlankItem={addBlankItem}
            updateItem={updateItem}
            removeItem={removeItem}
          />
        );
      case 3:
        return (
          <NotesChargesTab
            form={form}
            setForm={setForm}
            subtotal={subtotal}
            priceSummary={priceSummary}
            loadingSummary={loadingSummary}
            summaryError={summaryError}
            onCalculateSummary={fetchPriceSummary}
            invoiceGenerated={invoiceGenerated}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-7xl mx-auto">
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
              <div className="text-lg font-bold">₹ {displayTotal.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow p-2 mb-6 border border-orange-100">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep >= step.id
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <step.icon className="text-lg" />
                  </div>
                  <div className="mt-2 text-center">
                    <div
                      className={`font-semibold text-sm ${
                        currentStep >= step.id ? "text-orange-600" : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        currentStep >= step.id ? "text-orange-500" : "text-gray-400"
                      }`}
                    >
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 transition-all duration-300 ${
                      currentStep > step.id
                        ? "bg-gradient-to-r from-orange-500 to-amber-500"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            {/* Left Column - Main Form */}
            <div className="xl:col-span-3 space-y-4">
              {/* TOP NAVIGATION BUTTONS */}
              <div className="bg-white rounded-xl shadow p-4 border border-orange-100">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg border transition-all ${
                      currentStep === 1
                        ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:border-orange-500 hover:text-orange-600"
                    }`}
                  >
                    <FiArrowLeftIcon className="text-sm" />
                    <span>Previous</span>
                  </button>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      Step {currentStep} of {steps.length}
                    </span>

                    <button
                      type="button"
                      onClick={handleNextClick}
                      disabled={!validateStep(currentStep)}
                      className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-all ${
                        validateStep(currentStep)
                          ? currentStep === steps.length
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow shadow-green-200"
                            : "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow shadow-orange-200"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {currentStep === steps.length ? (
                        <>
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Creating Order...</span>
                            </>
                          ) : (
                            <>
                              <FiCheck className="text-sm" />
                              <span>Create Order</span>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <span>Next</span>
                          <FiArrowRight className="text-sm" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Step Content */}
              <div className="bg-white rounded-xl shadow p-6 border border-orange-100">
                {renderStepContent()}
              </div>

              {/* BOTTOM NAVIGATION BUTTONS */}
              <div className="bg-white rounded-xl shadow p-4 border border-orange-100">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg border transition-all ${
                      currentStep === 1
                        ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:border-orange-500 hover:text-orange-600"
                    }`}
                  >
                    <FiArrowLeftIcon className="text-sm" />
                    <span>Previous</span>
                  </button>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      Step {currentStep} of {steps.length}
                    </span>

                    <button
                      type="button"
                      onClick={handleNextClick}
                      disabled={!validateStep(currentStep)}
                      className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-all ${
                        validateStep(currentStep)
                          ? currentStep === steps.length
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow shadow-green-200"
                            : "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow shadow-orange-200"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {currentStep === steps.length ? (
                        <>
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Creating Order...</span>
                            </>
                          ) : (
                            <>
                              <FiCheck className="text-sm" />
                              <span>Create Order</span>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <span>Next</span>
                          <FiArrowRight className="text-sm" />
                        </>
                      )}
                    </button>
                  </div>
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
                {/* Order Items List */}
                <div className="max-h-64 overflow-y-auto mb-4 space-y-2">
                  {form.items.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <FiShoppingCart className="text-xl mx-auto mb-2 text-gray-400" />
                      No items added
                    </div>
                  ) : (
                    form.items.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 text-sm truncate">{item.name}</div>
                          <div className="text-xs text-gray-600">
                            ₹{item.price} × {item.qty}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-orange-600 text-sm">
                            ₹{(item.qty * item.price).toFixed(2)}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="space-y-2 text-sm border-t pt-4">
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
                  {currentStep >= 3 && (
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
                    <span className="text-lg font-bold text-orange-600">₹ {displayTotal.toFixed(2)}</span>
                  </div>
                </div>
                {/* Cart Info */}
                {cartId && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-800 font-medium">
                      Cart Active
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      ID: {cartId.substring(0, 8)}...
                    </div>
                  </div>
                )}
                {/* Current Step Info */}
                <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-xs text-orange-800 font-medium">
                    {steps[currentStep - 1]?.title}
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    {steps[currentStep - 1]?.description}
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
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
                  {selectedMerchant && (
                    <div className="text-xs text-orange-100 pt-2">
                      Selected: {selectedMerchant.name}
                    </div>
                  )}
                  {selectedCustomer && (
                    <div className="text-xs text-orange-100">
                      Customer: {selectedCustomer.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}