import React, { useState, useEffect, useCallback } from "react";
import {
  Upload,
  MapPin,
  Phone,
  Mail,
  FileText,
  Clock,
  CreditCard,
  User,
  Building,
  ChevronDown,
  Info,
  AlertCircle,
  Image,
  X,
  Settings,
  Plus,
  Trash2,
  Check,
  ArrowLeft,
  FileCheck,
  Calendar,
  Shield,
  Wallet,
  Star,
  Camera,
  Eye,
  Package,
  DollarSign,
  Percent,
  Lock,
  Home,
  Navigation,
  Map,
  Sparkles,
  Moon,
  Sun,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import Lottie from "lottie-react";
import apiClient from "../../apis/apiClient/apiClient";
import LocationPicker from "../../components/map/LocationPicker";
import animationData from "../../../src/assets/Animation/SpoonLoader.json";
import "leaflet/dist/leaflet.css";

// Professional Pink Theme
const brandColors = {
  primary: "from-pink-500 to-rose-500",
  secondary: "from-pink-600 to-rose-600",
  accent: "from-fuchsia-500 to-pink-500",
  dark: "from-rose-600 to-pink-600",
  light: "from-pink-50 to-rose-50"
};

// Utility Components with Pink Theme
const StepIndicator = ({ step, current, steps }) => {
  const isCompleted = current > step;
  const isCurrent = current === step;
  const StepIcon = steps[step].icon;

  return (
    <div className="flex flex-col items-center">
      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
        isCompleted ? `bg-gradient-to-r ${steps[step].color} border-transparent text-white shadow-md` :
        isCurrent ? 'bg-white border-pink-500 text-pink-500 shadow-lg' :
        'bg-white border-pink-200 text-pink-300'
      }`}>
        {isCompleted ? (
          <Check className="w-4 h-4" />
        ) : (
          <StepIcon className="w-4 h-4" />
        )}
        {isCurrent && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-ping"></div>
        )}
      </div>
      <span className={`text-xs font-medium mt-2 ${
        isCompleted || isCurrent ? 'text-gray-900 font-bold' : 'text-pink-400'
      }`}>
        {steps[step].title}
      </span>
    </div>
  );
};

const SectionCard = ({ title, description, children, className = "", icon: Icon }) => (
  <div className={`bg-white rounded-xl border border-pink-100 shadow-sm overflow-hidden mb-6 hover:shadow-md transition-shadow duration-300 ${className}`}>
    <div className="px-5 py-3 border-b border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
      <div className="flex items-center">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mr-3 shadow-sm">
            <Icon className="w-4 h-4 text-white" />
          </div>
        )}
        <div>
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          {description && <p className="text-pink-600 text-xs mt-1">{description}</p>}
        </div>
      </div>
    </div>
    <div className="p-5">
      {children}
    </div>
  </div>
);

const InputField = ({ label, name, value, onChange, type = "text", placeholder, error, icon: Icon, required = false, ...props }) => (
  <div className="space-y-1.5">
    <label className="flex items-center text-sm font-medium text-pink-800">
      {Icon && <Icon className="w-3 h-3 mr-1.5 text-pink-500" />}
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 text-sm border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none ${
          error ? 'border-rose-300 bg-rose-50' : 'border-pink-200 hover:border-pink-300'
        }`}
        required={required}
        {...props}
      />
      {error && (
        <div className="absolute right-3 top-2.5 animate-pulse">
          <AlertCircle className="w-4 h-4 text-rose-500" />
        </div>
      )}
    </div>
    {error && (
      <p className="text-rose-600 text-xs flex items-center gap-1 animate-fadeIn">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

const SelectField = ({ label, name, value, onChange, options, error, icon: Icon, required = false }) => (
  <div className="space-y-1.5">
    <label className="flex items-center text-sm font-medium text-pink-800">
      {Icon && <Icon className="w-3 h-3 mr-1.5 text-pink-500" />}
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2.5 text-sm border rounded-lg appearance-none transition-all duration-200 focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none ${
          error ? 'border-rose-300 bg-rose-50' : 'border-pink-200 hover:border-pink-300'
        }`}
        required={required}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400 pointer-events-none" />
      {error && (
        <div className="absolute right-8 top-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500" />
        </div>
      )}
    </div>
    {error && (
      <p className="text-rose-600 text-xs flex items-center gap-1">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

const InfoCard = ({ title, value, subValue, icon: Icon, color = "pink" }) => {
  const colorClasses = {
    pink: "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200",
    purple: "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200",
    rose: "bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200",
    fuchsia: "bg-gradient-to-r from-fuchsia-50 to-pink-50 border-fuchsia-200",
  };
  
  return (
    <div className={`p-3 rounded-lg border ${colorClasses[color]} hover:shadow-sm transition-shadow duration-200`}>
      <div className="flex items-center mb-1.5">
        {Icon && <Icon className="w-3 h-3 mr-1.5 text-pink-600" />}
        <span className="text-xs font-medium text-pink-700">{title}</span>
      </div>
      <div className="text-sm font-bold text-gray-900">{value}</div>
      {subValue && <div className="text-xs text-pink-600 mt-0.5">{subValue}</div>}
    </div>
  );
};

const FileUploadCard = ({ name, label, file, onChange, onRemove, error, acceptedTypes = "*" }) => (
  <div className="space-y-1.5">
    <label className="flex items-center text-sm font-medium text-pink-800">
      <FileText className="w-3 h-3 mr-1.5 text-pink-500" />
      {label}
      <span className="text-rose-500 ml-0.5">*</span>
    </label>
    <div className="relative">
      <input
        type="file"
        name={name}
        onChange={onChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        accept={acceptedTypes}
      />
      <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 hover:shadow-sm ${
        error ? 'border-rose-300 bg-rose-50' : 'border-pink-200 hover:border-pink-400 bg-pink-50'
      }`}>
        <Upload className={`w-6 h-6 mx-auto mb-1.5 ${error ? 'text-rose-400' : 'text-pink-400'}`} />
        <p className="text-sm text-pink-700">
          {file ? file.name : "Click to upload"}
        </p>
        <p className="text-xs text-pink-400 mt-0.5">
          PDF, JPG, PNG (Max 5MB)
        </p>
        {file && (
          <div className="mt-2">
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs bg-rose-100 text-rose-700 rounded hover:bg-rose-200 transition-colors"
            >
              <X className="w-3 h-3" />
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
    {error && (
      <p className="text-rose-600 text-xs flex items-center gap-1">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

const OpeningHoursCard = ({ hour, index, onChange, onRemove, errors }) => (
  <div className="bg-gradient-to-r from-pink-50 to-white rounded-lg border border-pink-200 p-3 mb-2.5 hover:shadow-sm transition-shadow duration-200">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-2.5">
      <SelectField
        label="Day"
        value={hour.day}
        onChange={(e) => onChange(index, "day", e.target.value)}
        options={[
          { value: "monday", label: "Monday" },
          { value: "tuesday", label: "Tuesday" },
          { value: "wednesday", label: "Wednesday" },
          { value: "thursday", label: "Thursday" },
          { value: "friday", label: "Friday" },
          { value: "saturday", label: "Saturday" },
          { value: "sunday", label: "Sunday" },
        ]}
        error={errors[`day-${index}`]}
      />
      
      <InputField
        label="Opening Time"
        type="time"
        value={hour.openingTime}
        onChange={(e) => onChange(index, "openingTime", e.target.value)}
        disabled={hour.isClosed}
        error={errors[`open-${index}`]}
      />
      
      <InputField
        label="Closing Time"
        type="time"
        value={hour.closingTime}
        onChange={(e) => onChange(index, "closingTime", e.target.value)}
        disabled={hour.isClosed}
        error={errors[`close-${index}`]}
      />
      
      <div className="flex items-center space-x-2.5">
        <div className="flex items-center h-full">
          <label className="flex items-center space-x-1.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={hour.isClosed}
              onChange={() => onChange(index, "isClosed")}
              className="w-4 h-4 text-pink-600 border-pink-300 rounded focus:ring-pink-500 cursor-pointer"
            />
            <span className="text-sm text-pink-700 group-hover:text-pink-800">Closed</span>
          </label>
        </div>
      </div>
      
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
    
    <div className="flex items-center justify-between">
      <div className={`text-sm px-2.5 py-1 rounded font-medium ${
        hour.isClosed 
          ? 'bg-rose-100 text-rose-700' 
          : 'bg-emerald-100 text-emerald-700'
      }`}>
        {hour.isClosed ? "Closed" : `${hour.openingTime} - ${hour.closingTime}`}
      </div>
      <div className="text-xs text-pink-600 capitalize font-medium">
        {hour.day}
      </div>
    </div>
  </div>
);

const PaymentMethodCard = ({ method, selected, onChange }) => {
  const getMethodDetails = (method) => {
    switch(method) {
      case "cash":
        return { label: "Cash", icon: Wallet, description: "Cash on Delivery", color: "from-emerald-100 to-green-100 border-emerald-200" };
      case "online":
        return { label: "Online", icon: CreditCard, description: "Card/UPI Payment", color: "from-blue-100 to-indigo-100 border-blue-200" };
      case "wallet":
        return { label: "Wallet", icon: Wallet, description: "App Wallet", color: "from-purple-100 to-pink-100 border-purple-200" };
      default:
        return { label: method, icon: CreditCard, description: "Payment Method", color: "from-pink-100 to-rose-100 border-pink-200" };
    }
  };

  const details = getMethodDetails(method);
  const Icon = details.icon;

  return (
    <label
      className={`flex flex-col p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-sm ${
        selected
          ? 'border-pink-500 bg-gradient-to-r from-pink-50 to-rose-50 shadow-sm'
          : `border-pink-100 hover:border-pink-300 ${details.color}`
      }`}
    >
      <div className="flex items-center mb-1.5">
        <input
          type="checkbox"
          checked={selected}
          onChange={onChange}
          className="w-4 h-4 text-pink-600 border-pink-300 rounded focus:ring-pink-500 cursor-pointer"
        />
        <div className="ml-2.5">
          <div className="flex items-center">
            <Icon className="w-4 h-4 mr-1.5" />
            <span className="font-bold text-gray-900">{details.label}</span>
          </div>
          <p className="text-xs text-pink-600 mt-0.5">{details.description}</p>
        </div>
      </div>
    </label>
  );
};

// Main Component
const AddRestaurant = () => {
  const [formData, setFormData] = useState({
    name: "",
    ownerId: "",
    ownerName: "",
    phone: "",
    email: "",
    city: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      latitude: "",
      longitude: "",
    },
    storeType: "restaurant",
    foodType: "veg",
    minOrderAmount: 100,
    openingHours: [
      { day: "monday", openingTime: "09:00", closingTime: "22:00", isClosed: false },
      { day: "tuesday", openingTime: "09:00", closingTime: "22:00", isClosed: false },
      { day: "wednesday", openingTime: "09:00", closingTime: "22:00", isClosed: false },
      { day: "thursday", openingTime: "09:00", closingTime: "22:00", isClosed: false },
      { day: "friday", openingTime: "09:00", closingTime: "23:00", isClosed: false },
      { day: "saturday", openingTime: "09:00", closingTime: "23:00", isClosed: false },
      { day: "sunday", openingTime: "09:00", closingTime: "23:00", isClosed: false },
    ],
    paymentMethods: ["online", "cash", "wallet"],
    fssaiNumber: "",
    gstNumber: "",
    aadharNumber: "",
    commission: { type: "percentage", value: 20 },
    preparationTime: 20,
    active: true,
    autoOnOff: true,
    description: "",
    deliveryRadius: 5,
    taxPercentage: 5,
    packagingCharge: 10,
  });

  const [documents, setDocuments] = useState({
    fssaiDoc: null,
    gstDoc: null,
    aadharDoc: null,
    images: [],
    menuPdf: null,
  });

  const [merchants, setMerchants] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [merchantLoading, setMerchantLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [merchantOption, setMerchantOption] = useState("existing");
  const [newMerchantData, setNewMerchantData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [uploadProgress, setUploadProgress] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: false, message: "" });
  const [selectedAddress, setSelectedAddress] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const steps = [
    { id: 0, title: "Merchant", icon: User, color: "from-pink-500 to-rose-500" },
    { id: 1, title: "Basic Info", icon: Building, color: "from-fuchsia-500 to-pink-500" },
    { id: 2, title: "Location", icon: MapPin, color: "from-purple-500 to-pink-500" },
    { id: 3, title: "Business", icon: Settings, color: "from-rose-500 to-pink-500" },
    { id: 4, title: "Documents", icon: FileCheck, color: "from-pink-500 to-rose-500" },
  ];

  // Fetch merchants on component mount
  useEffect(() => {
    fetchMerchants();
  }, []);

  // Reset merchant fields when option changes
  useEffect(() => {
    if (merchantOption === "new") {
      setFormData(prev => ({
        ...prev,
        ownerId: "",
        ownerName: newMerchantData.name || "",
        phone: newMerchantData.phone || "",
        email: newMerchantData.email || ""
      }));
      setSelectedMerchant(null);
    } else {
      setNewMerchantData({
        name: "",
        email: "",
        phone: "",
        password: ""
      });
    }
  }, [merchantOption]);

  const fetchMerchants = async () => {
    setMerchantLoading(true);
    try {
      const response = await apiClient.get("/admin/merchant/getallmerchants");
      setMerchants(response.data.data || []);
    } catch (error) {
      console.error("Error fetching merchants:", error);
      setErrors(prev => ({ ...prev, fetchMerchants: "Failed to load merchants" }));
    } finally {
      setMerchantLoading(false);
    }
  };

  const handleMerchantSelect = (merchantId) => {
    const merchant = merchants.find((m) => m._id === merchantId);
    if (merchant) {
      setSelectedMerchant(merchant);
      setFormData(prev => ({
        ...prev,
        ownerId: merchant._id,
        ownerName: merchant.name,
        phone: merchant.phone || "",
        email: merchant.email || "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes("address.")) {
      const key = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else if (name.includes("commission.")) {
      const key = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        commission: { ...prev.commission, [key]: key === 'value' ? parseFloat(value) : value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    
    if (name === "images") {
      const newImages = [...documents.images, ...Array.from(files)].slice(0, 5);
      setDocuments(prev => ({
        ...prev,
        images: newImages,
      }));
    } else {
      setDocuments(prev => ({
        ...prev,
        [name]: files[0],
      }));
      
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const handleNewMerchantChange = (field, value) => {
    setNewMerchantData(prev => ({ ...prev, [field]: value }));
    
    if (field === "name") setFormData(prev => ({ ...prev, ownerName: value }));
    if (field === "phone") setFormData(prev => ({ ...prev, phone: value }));
    if (field === "email") setFormData(prev => ({ ...prev, email: value }));
    
    const errorField = `newMerchant${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (errors[errorField]) {
      setErrors(prev => ({ ...prev, [errorField]: undefined }));
    }
  };

  // FIXED: Improved location selection handler
  const handleLocationSelect = useCallback((locationDetails) => {
    console.log("Location selected:", locationDetails);
    
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        street: locationDetails.street || locationDetails.address || "",
        city: locationDetails.city || "",
        state: locationDetails.state || "",
        pincode: locationDetails.zip || locationDetails.pincode || "",
        latitude: locationDetails.latitude || locationDetails.lat || "",
        longitude: locationDetails.longitude || locationDetails.lng || "",
      },
    }));

    // Set the display address
    const addressParts = [];
    if (locationDetails.street) addressParts.push(locationDetails.street);
    if (locationDetails.city) addressParts.push(locationDetails.city);
    if (locationDetails.state) addressParts.push(locationDetails.state);
    if (locationDetails.country) addressParts.push(locationDetails.country);
    
    const displayAddress = addressParts.join(", ");
    setSelectedAddress(displayAddress);
    
    // Auto-populate city and state if not already set
    if (locationDetails.city && !formData.address.city) {
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, city: locationDetails.city }
      }));
    }
    
    if (locationDetails.state && !formData.address.state) {
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, state: locationDetails.state }
      }));
    }
    
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: undefined }));
    }
  }, [errors.location, formData.address.city, formData.address.state]);

  const addOpeningHour = () => {
    if (formData.openingHours.length >= 7) {
      setErrors(prev => ({ ...prev, openingHours: "Maximum 7 days allowed" }));
      return;
    }
    
    const usedDays = formData.openingHours.map(h => h.day);
    const availableDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
      .filter(day => !usedDays.includes(day));
    
    if (availableDays.length === 0) return;
    
    setFormData(prev => ({
      ...prev,
      openingHours: [
        ...prev.openingHours,
        { 
          day: availableDays[0], 
          openingTime: "09:00", 
          closingTime: "18:00", 
          isClosed: false 
        },
      ],
    }));
  };

  const removeOpeningHour = (index) => {
    setFormData(prev => ({
      ...prev,
      openingHours: prev.openingHours.filter((_, i) => i !== index),
    }));
  };

  const handleOpeningHoursChange = (index, field, value) => {
    const updated = [...formData.openingHours];
    
    if (field === "isClosed") {
      updated[index][field] = !updated[index][field];
      if (updated[index][field]) {
        updated[index].openingTime = "";
        updated[index].closingTime = "";
      }
    } else {
      updated[index][field] = value;
    }
    
    setFormData(prev => ({ ...prev, openingHours: updated }));
    
    const errorKey = `${field}-${index}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  const handlePaymentMethodChange = (method, checked) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: checked
        ? [...prev.paymentMethods, method]
        : prev.paymentMethods.filter(item => item !== method),
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 0:
        if (merchantOption === "existing") {
          if (!formData.ownerId) newErrors.ownerId = "Please select a merchant";
        } else {
          if (!newMerchantData.name.trim()) newErrors.newMerchantName = "Merchant name is required";
          if (!newMerchantData.phone.trim()) newErrors.newMerchantPhone = "Phone number is required";
          if (!newMerchantData.email.trim()) newErrors.newMerchantEmail = "Email is required";
          else if (!/^\S+@\S+\.\S+$/.test(newMerchantData.email)) newErrors.newMerchantEmail = "Invalid email format";
          if (!newMerchantData.password.trim()) newErrors.newMerchantPassword = "Password is required";
          else if (newMerchantData.password.length < 6) newErrors.newMerchantPassword = "Password must be at least 6 characters";
        }
        break;
        
      case 1:
        if (!formData.name.trim()) newErrors.name = "Restaurant name is required";
        if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email format";
        break;
        
      case 2:
        // FIXED: Check if location is selected by checking if we have address details
        if (!formData.address.latitude || !formData.address.longitude) {
          // Only show error if neither coordinates nor address fields are filled
          if (!formData.address.street || !formData.address.city || !formData.address.state || !formData.address.pincode) {
            newErrors.location = "Please select a location on the map or fill address manually";
          }
        }
        if (!formData.address.street.trim()) newErrors.street = "Street address is required";
        if (!formData.address.city.trim()) newErrors.city = "City is required";
        if (!formData.address.state.trim()) newErrors.state = "State is required";
        if (!formData.address.pincode.trim()) newErrors.pincode = "Pincode is required";
        else if (!/^\d{6}$/.test(formData.address.pincode)) newErrors.pincode = "Invalid pincode (6 digits required)";
        break;
        
      case 3:
        if (formData.openingHours.length === 0) {
          newErrors.openingHours = "At least one opening hour entry is required";
        }
        break;
        
      case 4:
        if (!formData.fssaiNumber.trim()) newErrors.fssaiNumber = "FSSAI number is required";
        if (!formData.gstNumber.trim()) newErrors.gstNumber = "GST number is required";
        if (!formData.aadharNumber.trim()) newErrors.aadharNumber = "Aadhar number is required";
        if (!documents.fssaiDoc) newErrors.fssaiDoc = "FSSAI document is required";
        if (!documents.gstDoc) newErrors.gstDoc = "GST document is required";
        if (!documents.aadharDoc) newErrors.aadharDoc = "Aadhar document is required";
        if (documents.images.length < 1) newErrors.images = "Please upload at least 1 restaurant image";
        if (documents.images.length > 5) newErrors.images = "Maximum 5 images allowed";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep = (step) => {
    if (step >= 0 && step <= 4) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) {
      setSubmitStatus({
        success: false,
        message: "Please fix all validation errors before submitting"
      });
      return;
    }

    setLoading(true);
    setSubmitStatus({ success: false, message: "" });

    try {
      const formDataToSend = new FormData();
      
      // Basic restaurant information
      formDataToSend.append("name", formData.name);
      formDataToSend.append("city", formData.address.city);
      formDataToSend.append("fssaiNumber", formData.fssaiNumber);
      formDataToSend.append("gstNumber", formData.gstNumber);
      formDataToSend.append("aadharNumber", formData.aadharNumber);
      formDataToSend.append("foodType", formData.foodType);
      formDataToSend.append("storeType", formData.storeType);
      formDataToSend.append("minOrderAmount", formData.minOrderAmount);
      formDataToSend.append("preparationTime", formData.preparationTime);
      formDataToSend.append("active", formData.active.toString());
      formDataToSend.append("autoOnOff", formData.autoOnOff.toString());
      formDataToSend.append("deliveryRadius", formData.deliveryRadius);
      formDataToSend.append("taxPercentage", formData.taxPercentage);
      formDataToSend.append("packagingCharge", formData.packagingCharge);
      
      if (formData.description) {
        formDataToSend.append("description", formData.description);
      }

      // Merchant data
      if (merchantOption === "new") {
        formDataToSend.append("ownerName", newMerchantData.name);
        formDataToSend.append("phone", newMerchantData.phone);
        formDataToSend.append("email", newMerchantData.email);
        formDataToSend.append("password", newMerchantData.password);
      } else {
        formDataToSend.append("ownerId", formData.ownerId);
        formDataToSend.append("ownerName", formData.ownerName);
        formDataToSend.append("phone", formData.phone);
        formDataToSend.append("email", formData.email);
      }

      // Payment methods
      formData.paymentMethods.forEach(method => {
        formDataToSend.append("paymentMethods", method);
      });

      // Address and operational details
      formDataToSend.append("address", JSON.stringify(formData.address));
      formDataToSend.append("openingHours", JSON.stringify(formData.openingHours));
      formDataToSend.append("commission", JSON.stringify(formData.commission));

      // File uploads
      if (documents.fssaiDoc) formDataToSend.append("fssaiDoc", documents.fssaiDoc);
      if (documents.gstDoc) formDataToSend.append("gstDoc", documents.gstDoc);
      if (documents.aadharDoc) formDataToSend.append("aadharDoc", documents.aadharDoc);
      if (documents.menuPdf) formDataToSend.append("menuPdf", documents.menuPdf);
      
      documents.images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      const endpoint = merchantOption === "new" 
        ? "/store/create-merchant-and-store"
        : "/store/register";

      const response = await apiClient.post(endpoint, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress({ [endpoint]: progress });
          }
        }
      });

      if (response.data.success) {
        setSubmitStatus({
          success: true,
          message: "🎉 Restaurant created successfully!"
        });
        
        alert("Restaurant created successfully!");
        
        setTimeout(() => {
          resetForm();
        }, 2000);
      } else {
        throw new Error(response.data.message || "Failed to create restaurant");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitStatus({
        success: false,
        message: `❌ Error: ${err.response?.data?.message || err.message || "Unknown error occurred"}`
      });
      alert(`Error: ${err.response?.data?.message || "Failed to create restaurant"}`);
    } finally {
      setLoading(false);
      setUploadProgress({});
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      ownerId: "",
      ownerName: "",
      phone: "",
      email: "",
      city: "",
      address: {
        street: "",
        city: "",
        state: "",
        pincode: "",
        latitude: "",
        longitude: "",
      },
      storeType: "restaurant",
      foodType: "veg",
      minOrderAmount: 100,
      openingHours: [
        { day: "monday", openingTime: "09:00", closingTime: "22:00", isClosed: false },
        { day: "tuesday", openingTime: "09:00", closingTime: "22:00", isClosed: false },
        { day: "wednesday", openingTime: "09:00", closingTime: "22:00", isClosed: false },
        { day: "thursday", openingTime: "09:00", closingTime: "22:00", isClosed: false },
        { day: "friday", openingTime: "09:00", closingTime: "23:00", isClosed: false },
        { day: "saturday", openingTime: "09:00", closingTime: "23:00", isClosed: false },
        { day: "sunday", openingTime: "09:00", closingTime: "23:00", isClosed: false },
      ],
      paymentMethods: ["online", "cash", "wallet"],
      fssaiNumber: "",
      gstNumber: "",
      aadharNumber: "",
      commission: { type: "percentage", value: 20 },
      preparationTime: 20,
      active: true,
      autoOnOff: true,
      description: "",
      deliveryRadius: 5,
      taxPercentage: 5,
      packagingCharge: 10,
    });
    
    setDocuments({
      fssaiDoc: null,
      gstDoc: null,
      aadharDoc: null,
      images: [],
      menuPdf: null,
    });
    
    setNewMerchantData({
      name: "",
      email: "",
      phone: "",
      password: "",
    });
    
    setSelectedMerchant(null);
    setMerchantOption("existing");
    setCurrentStep(0);
    setErrors({});
    setSubmitStatus({ success: false, message: "" });
    setShowPreview(false);
    setSelectedAddress("");
  };

  const removeImage = (index) => {
    setDocuments(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removeDocument = (docName) => {
    setDocuments(prev => ({
      ...prev,
      [docName]: null,
    }));
    
    if (errors[docName]) {
      setErrors(prev => ({ ...prev, [docName]: undefined }));
    }
  };

  const toggleShowPreview = () => {
    setShowPreview(!showPreview);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const renderMerchantStep = () => (
    <SectionCard 
      title="Merchant Selection" 
      description="Choose or create a merchant account for this restaurant"
      icon={User}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setMerchantOption("existing")}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              merchantOption === "existing"
                ? 'border-pink-500 bg-gradient-to-r from-pink-50 to-rose-50 shadow-sm'
                : 'border-pink-100 hover:border-pink-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                merchantOption === "existing"
                  ? 'bg-pink-100 text-pink-600'
                  : 'bg-pink-50 text-pink-400'
              }`}>
                <User className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-900">Existing Merchant</div>
                <div className="text-xs text-pink-600">Use an existing merchant account</div>
              </div>
              {merchantOption === "existing" && (
                <Check className="w-5 h-5 text-emerald-500 ml-auto" />
              )}
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setMerchantOption("new")}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              merchantOption === "new"
                ? 'border-pink-500 bg-gradient-to-r from-pink-50 to-rose-50 shadow-sm'
                : 'border-pink-100 hover:border-pink-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                merchantOption === "new"
                  ? 'bg-pink-100 text-pink-600'
                  : 'bg-pink-50 text-pink-400'
              }`}>
                <Plus className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-900">New Merchant</div>
                <div className="text-xs text-pink-600">Create a new merchant account</div>
              </div>
              {merchantOption === "new" && (
                <Check className="w-5 h-5 text-emerald-500 ml-auto" />
              )}
            </div>
          </button>
        </div>

        {merchantOption === "existing" ? (
          <>
            <SelectField
              label="Select Merchant"
              name="ownerId"
              value={formData.ownerId}
              onChange={(e) => handleMerchantSelect(e.target.value)}
              options={merchants.map(m => ({ 
                value: m._id, 
                label: `${m.name} - ${m.email} (${m.phone || 'No phone'})` 
              }))}
              error={errors.ownerId}
              icon={User}
              required
            />
            
            {merchantLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                <span className="ml-3 text-pink-600">Loading merchants...</span>
              </div>
            )}

            {selectedMerchant && (
              <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                  <Info className="w-4 h-4 mr-2 text-pink-500" />
                  Selected Merchant Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <InfoCard 
                    title="Merchant Name" 
                    value={selectedMerchant.name}
                    icon={User}
                    color="pink"
                  />
                  <InfoCard 
                    title="Email" 
                    value={selectedMerchant.email}
                    icon={Mail}
                    color="pink"
                  />
                  <InfoCard 
                    title="Phone" 
                    value={selectedMerchant.phone || "Not provided"}
                    icon={Phone}
                    color="pink"
                  />
                  <InfoCard 
                    title="Status" 
                    value={selectedMerchant.isActive ? "Active" : "Inactive"}
                    subValue={selectedMerchant.isActive ? "✅ Ready to use" : "❌ Inactive"}
                    color="pink"
                  />
                </div>
                <div className="mt-3 pt-3 border-t border-pink-200">
                  <div className="text-xs text-pink-600 font-medium">Merchant ID:</div>
                  <div className="text-sm font-mono bg-pink-100 px-2.5 py-1.5 rounded mt-0.5 text-pink-800">
                    {selectedMerchant._id}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-5">
              <InputField
                label="Merchant Name"
                name="newMerchantName"
                value={newMerchantData.name}
                onChange={(e) => handleNewMerchantChange("name", e.target.value)}
                placeholder="Enter merchant full name"
                error={errors.newMerchantName}
                icon={User}
                required
              />
              
              <InputField
                label="Email Address"
                name="newMerchantEmail"
                type="email"
                value={newMerchantData.email}
                onChange={(e) => handleNewMerchantChange("email", e.target.value)}
                placeholder="merchant@example.com"
                error={errors.newMerchantEmail}
                icon={Mail}
                required
              />
              
              <InputField
                label="Phone Number"
                name="newMerchantPhone"
                value={newMerchantData.phone}
                onChange={(e) => handleNewMerchantChange("phone", e.target.value)}
                placeholder="+91 9876543210"
                error={errors.newMerchantPhone}
                icon={Phone}
                required
              />
              
              <InputField
                label="Password"
                name="newMerchantPassword"
                type="password"
                value={newMerchantData.password}
                onChange={(e) => setNewMerchantData(prev => ({...prev, password: e.target.value}))}
                placeholder="Minimum 6 characters"
                error={errors.newMerchantPassword}
                required
              />
            </div>
            
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
              <div className="flex items-start">
                <Info className="w-4 h-4 text-emerald-500 mr-2.5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-emerald-800">
                    A new merchant account will be created with these details
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    The merchant will receive login credentials via email
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );

  const renderBasicInfoStep = () => (
    <SectionCard 
      title="Restaurant Details" 
      description="Basic information about your restaurant"
      icon={Building}
    >
      <div className="space-y-6">
        <InputField
          label="Restaurant Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Spice Kitchen, Burger Palace"
          error={errors.name}
          icon={Building}
          required
        />
        
        <div className="grid md:grid-cols-2 gap-5">
          <InputField
            label="Contact Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
            error={errors.phone}
            icon={Phone}
            required
          />
          
          <InputField
            label="Contact Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="restaurant@example.com"
            error={errors.email}
            icon={Mail}
            required
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-pink-800 mb-1.5">
            <FileText className="w-3 h-3 mr-1.5 text-pink-500" />
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your restaurant, specialty dishes, ambiance, etc."
            rows="3"
            className="w-full px-3 py-2.5 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none hover:border-pink-300 transition-colors"
          />
        </div>

        {(formData.ownerId || formData.ownerName) && (
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <Check className="w-4 h-4 text-purple-500 mr-2.5" />
              <div>
                <p className="text-sm font-bold text-purple-800">
                  Connected to merchant: {formData.ownerName}
                </p>
                <p className="text-xs text-purple-600 mt-0.5">
                  Merchant ID: {formData.ownerId}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );

  const renderLocationStep = () => (
    <SectionCard 
      title="Restaurant Location" 
      description="Set your restaurant's physical location"
      icon={MapPin}
    >
      <div className="space-y-6">
        <div className="mb-6">
          <label className="flex items-center text-sm font-medium text-pink-800 mb-3">
            <MapPin className="w-4 h-4 mr-2 text-pink-500" />
            Select Location on Map
          </label>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compact Map */}
            <div className="rounded-lg overflow-hidden border border-pink-300 shadow-sm h-[350px]">
              <LocationPicker onSelectLocation={handleLocationSelect} />
            </div>
            
            {/* Form Fields on Right */}
            <div className="space-y-5">
              {/* Display selected address */}
              {selectedAddress && (
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-emerald-800">📍 Selected Address:</p>
                      <p className="text-xs text-emerald-700 mt-0.5">{selectedAddress}</p>
                      <p className="text-xs text-emerald-600 mt-0.5">
                        Coordinates: {formData.address.latitude}, {formData.address.longitude}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <InputField
                  label="Street Address"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  placeholder="Building number, street name"
                  error={errors.street}
                  required
                />

                <div className="grid md:grid-cols-2 gap-5">
                  <InputField
                    label="City"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    placeholder="e.g., Mumbai, Delhi"
                    error={errors.city}
                    required
                  />
                  
                  <InputField
                    label="State"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    placeholder="e.g., Maharashtra, Delhi"
                    error={errors.state}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                  <InputField
                    label="Pincode"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleChange}
                    placeholder="400001"
                    error={errors.pincode}
                    required
                  />
                  
                  <InputField
                    label="Latitude"
                    name="address.latitude"
                    value={formData.address.latitude}
                    onChange={handleChange}
                    placeholder="Auto-filled from map"
                    readOnly
                    className="bg-pink-50 border-pink-200"
                  />
                  
                  <InputField
                    label="Longitude"
                    name="address.longitude"
                    value={formData.address.longitude}
                    onChange={handleChange}
                    placeholder="Auto-filled from map"
                    readOnly
                    className="bg-pink-50 border-pink-200"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                  <InputField
                    label="Delivery Radius (km)"
                    name="deliveryRadius"
                    type="number"
                    value={formData.deliveryRadius}
                    onChange={handleChange}
                    placeholder="5"
                    min="1"
                    max="50"
                    error={errors.deliveryRadius}
                    icon={Navigation}
                  />
                  
                  <InputField
                    label="Tax Percentage (%)"
                    name="taxPercentage"
                    type="number"
                    value={formData.taxPercentage}
                    onChange={handleChange}
                    placeholder="5"
                    min="0"
                    max="100"
                    step="0.1"
                    error={errors.taxPercentage}
                    icon={Percent}
                  />
                  
                  <InputField
                    label="Packaging Charge (₹)"
                    name="packagingCharge"
                    type="number"
                    value={formData.packagingCharge}
                    onChange={handleChange}
                    placeholder="10"
                    min="0"
                    error={errors.packagingCharge}
                    icon={Package}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {errors.location && (
            <p className="text-rose-600 text-xs mt-3 flex items-center gap-1 animate-pulse">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {errors.location}
            </p>
          )}
        </div>

        {(formData.address.latitude && formData.address.longitude) && (
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200 animate-fadeIn">
            <div className="flex items-center">
              <Check className="w-4 h-4 text-emerald-500 mr-2.5" />
              <div>
                <p className="text-sm font-bold text-emerald-800">
                  ✓ Location set successfully!
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Map coordinates: {formData.address.latitude}, {formData.address.longitude}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );

  const renderBusinessStep = () => (
    <>
      <SectionCard 
        title="Business Configuration" 
        description="Legal and operational settings"
        icon={Settings}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          <SelectField
            label="Food Type"
            name="foodType"
            value={formData.foodType}
            onChange={handleChange}
            options={[
              { value: "veg", label: "🥬 Vegetarian" },
              { value: "non-veg", label: "🍗 Non-Vegetarian" },
              { value: "both", label: "🍽️ Both" },
            ]}
            icon={Settings}
          />
          
          <SelectField
            label="Store Type"
            name="storeType"
            value={formData.storeType}
            onChange={handleChange}
            options={[
              { value: "restaurant", label: "🍽️ Restaurant" },
              { value: "grocery", label: "🛒 Grocery" },
              { value: "meat", label: "🥩 Meat Shop" },
              { value: "pharmacy", label: "💊 Pharmacy" },
              { value: "bakery", label: "🥐 Bakery" },
              { value: "cafe", label: "☕ Cafe" },
            ]}
            icon={Building}
            required
          />
          
          <InputField
            label="Min Order (₹)"
            name="minOrderAmount"
            type="number"
            value={formData.minOrderAmount}
            onChange={handleChange}
            placeholder="100"
            min="0"
            error={errors.minOrderAmount}
            icon={DollarSign}
          />
          
          <InputField
            label="Prep Time (min)"
            name="preparationTime"
            type="number"
            value={formData.preparationTime}
            onChange={handleChange}
            placeholder="20"
            min="1"
            error={errors.preparationTime}
            icon={Clock}
          />
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-5">
          <div>
            <label className="flex items-center text-sm font-medium text-pink-800 mb-1.5">
              <Percent className="w-3 h-3 mr-1.5 text-pink-500" />
              Commission Type
            </label>
            <select
              name="commission.type"
              value={formData.commission.type}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>
          
          <InputField
            label="Commission Value"
            name="commission.value"
            type="number"
            value={formData.commission.value}
            onChange={handleChange}
            placeholder={formData.commission.type === "percentage" ? "20" : "100"}
            min="0"
            icon={DollarSign}
          />
        </div>
      </SectionCard>

      <SectionCard 
        title="Payment Methods" 
        description="Select payment options for customers"
        icon={CreditCard}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {["cash", "online", "wallet"].map(method => (
            <PaymentMethodCard
              key={method}
              method={method}
              selected={formData.paymentMethods.includes(method)}
              onChange={(e) => handlePaymentMethodChange(method, e.target.checked)}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard 
        title="Opening Hours" 
        description="Set your restaurant's operating schedule"
        icon={Clock}
      >
        {formData.openingHours.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-10 h-10 text-pink-300 mx-auto mb-3" />
            <p className="text-pink-600 text-sm">No opening hours added yet</p>
            <button
              type="button"
              onClick={addOpeningHour}
              className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Time Slot
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.openingHours.map((item, idx) => (
              <OpeningHoursCard
                key={idx}
                hour={item}
                index={idx}
                onChange={handleOpeningHoursChange}
                onRemove={removeOpeningHour}
                errors={errors}
              />
            ))}
            
            {formData.openingHours.length < 7 && (
              <button
                type="button"
                onClick={addOpeningHour}
                className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-md transition-all duration-200 text-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Day
              </button>
            )}
          </div>
        )}
        
        {errors.openingHours && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg">
            <p className="text-rose-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {errors.openingHours}
            </p>
          </div>
        )}
      </SectionCard>

      <SectionCard 
        title="Additional Settings" 
        description="Configure additional restaurant settings"
        icon={Settings}
      >
        <div className="grid md:grid-cols-2 gap-5">
          <div className="flex items-center space-x-2.5">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="w-4 h-4 text-pink-600 border-pink-300 rounded focus:ring-pink-500 cursor-pointer"
            />
            <label htmlFor="active" className="text-sm font-medium text-pink-800 cursor-pointer">
              Restaurant Active
            </label>
          </div>
          
          <div className="flex items-center space-x-2.5">
            <input
              type="checkbox"
              id="autoOnOff"
              name="autoOnOff"
              checked={formData.autoOnOff}
              onChange={(e) => setFormData(prev => ({ ...prev, autoOnOff: e.target.checked }))}
              className="w-4 h-4 text-pink-600 border-pink-300 rounded focus:ring-pink-500 cursor-pointer"
            />
            <label htmlFor="autoOnOff" className="text-sm font-medium text-pink-800 cursor-pointer">
              Auto On/Off based on hours
            </label>
          </div>
        </div>
      </SectionCard>
    </>
  );

  const renderDocumentsStep = () => (
    <>
      <SectionCard 
        title="Restaurant Images" 
        description="Upload photos of your restaurant (Max 5 images, 5MB each)"
        icon={Camera}
      >
        <div className="space-y-4">
          <div className="relative">
            <input
              type="file"
              name="images"
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`border-3 border-dashed rounded-lg p-6 text-center transition-all duration-200 hover:shadow-sm ${
              errors.images ? 'border-rose-300 bg-rose-50' : 'border-pink-200 hover:border-pink-400 bg-pink-50'
            }`}>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 mb-3">
                <Upload className="w-6 h-6 text-pink-600" />
              </div>
              <p className="text-sm font-bold text-pink-700 mb-1">
                Click to upload images
              </p>
              <p className="text-xs text-pink-600">
                Drag & drop or click to browse (JPG, PNG, Max 5MB each)
              </p>
              <p className="text-xs text-pink-400 mt-1.5">
                Upload 1-5 images of your restaurant
              </p>
            </div>
          </div>

          {documents.images.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-sm font-bold text-pink-800">
                  Selected Images ({documents.images.length}/5)
                </h4>
                <button
                  type="button"
                  onClick={() => setDocuments(prev => ({ ...prev, images: [] }))}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                >
                  Remove All
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {documents.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Restaurant ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-rose-600 shadow-sm"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                    <div className="absolute bottom-1 left-1 right-1 text-xs text-white bg-black bg-opacity-50 px-1.5 py-0.5 rounded text-center truncate">
                      {image.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {errors.images && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <p className="text-rose-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.images}
              </p>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard 
        title="Legal Documents" 
        description="Upload required business registration documents"
        icon={FileCheck}
      >
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-5">
            <InputField
              label="FSSAI Number"
              name="fssaiNumber"
              value={formData.fssaiNumber}
              onChange={handleChange}
              placeholder="e.g., 11223344556677"
              error={errors.fssaiNumber}
              icon={Shield}
              required
            />
            
            <InputField
              label="GST Number"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              placeholder="e.g., 27AABCU9603R1ZM"
              error={errors.gstNumber}
              icon={FileText}
              required
            />
            
            <InputField
              label="Aadhar Number"
              name="aadharNumber"
              value={formData.aadharNumber}
              onChange={handleChange}
              placeholder="e.g., 1234 5678 9012"
              error={errors.aadharNumber}
              icon={User}
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <FileUploadCard
              name="fssaiDoc"
              label="FSSAI Certificate"
              file={documents.fssaiDoc}
              onChange={handleFileChange}
              onRemove={() => removeDocument("fssaiDoc")}
              error={errors.fssaiDoc}
              acceptedTypes=".pdf,.jpg,.jpeg,.png"
            />
            
            <FileUploadCard
              name="gstDoc"
              label="GST Certificate"
              file={documents.gstDoc}
              onChange={handleFileChange}
              onRemove={() => removeDocument("gstDoc")}
              error={errors.gstDoc}
              acceptedTypes=".pdf,.jpg,.jpeg,.png"
            />
            
            <FileUploadCard
              name="aadharDoc"
              label="Aadhar Document"
              file={documents.aadharDoc}
              onChange={handleFileChange}
              onRemove={() => removeDocument("aadharDoc")}
              error={errors.aadharDoc}
              acceptedTypes=".pdf,.jpg,.jpeg,.png"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="flex items-center text-sm font-medium text-pink-800">
                <FileText className="w-3 h-3 mr-1.5 text-pink-500" />
                Menu PDF (Optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="menuPdf"
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="border-2 border-dashed border-pink-200 rounded-lg p-4 text-center hover:border-pink-400 transition-colors bg-pink-50 hover:shadow-sm">
                  <Upload className="w-6 h-6 text-pink-400 mx-auto mb-1.5" />
                  <p className="text-sm text-pink-700">
                    {documents.menuPdf ? documents.menuPdf.name : "Click to upload menu"}
                  </p>
                  <p className="text-xs text-pink-400 mt-0.5">PDF only (Max 10MB)</p>
                  {documents.menuPdf && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => removeDocument("menuPdf")}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-rose-100 text-rose-700 rounded hover:bg-rose-200 transition-colors"
                      >
                        <X className="w-2.5 h-2.5" />
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <Info className="w-4 h-4 text-blue-500 mr-2.5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-800 mb-1">
                  Document Requirements
                </p>
                <ul className="text-xs text-blue-600 space-y-0.5">
                  <li>• All documents must be clear and readable</li>
                  <li>• Maximum file size: 10MB per document</li>
                  <li>• Accepted formats: PDF, JPG, PNG</li>
                  <li>• Ensure documents are valid and not expired</li>
                  <li>• Menu PDF is optional but recommended</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="relative">
            <Lottie animationData={animationData} loop={true} style={{ width: 200, height: 200 }} />
            {uploadProgress && Object.values(uploadProgress)[0] && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-48">
                <div className="text-sm text-pink-600 mb-1 font-medium">Uploading: {Object.values(uploadProgress)[0]}%</div>
                <div className="w-full bg-pink-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Object.values(uploadProgress)[0]}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <p className="mt-12 text-lg font-bold text-pink-700">
            Creating your restaurant...
          </p>
          <p className="text-pink-500 text-sm mt-2">
            This may take a few moments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Combined Header and Step Indicator */}
        <div className="bg-white rounded-xl shadow-lg border border-pink-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-rose-600 transition-all duration-200 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Create Restaurant
                  </h1>
                  <p className="text-pink-600 text-xs mt-0.5">
                    Complete all steps to register on the platform
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg border border-pink-200 bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1.5 rounded-lg shadow-md">
                  <div className="text-xs font-medium text-pink-100">Step {currentStep + 1} of {steps.length}</div>
                  <div className="text-sm font-bold flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {steps[currentStep]?.title}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-5">
            {/* Progress Steps */}
            <div className="flex justify-between items-center mb-5">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <StepIndicator step={index} current={currentStep} steps={steps} />
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-3 rounded-full ${
                      currentStep > index 
                        ? `bg-gradient-to-r ${step.color}`
                        : 'bg-pink-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {/* Progress Bar and Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="flex justify-between text-xs text-pink-600 mb-1.5 font-medium">
                  <span>Completion</span>
                  <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-pink-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-pink-700 bg-pink-100 rounded-lg hover:bg-pink-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>
                
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={currentStep === 4}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 0 && renderMerchantStep()}
          {currentStep === 1 && renderBasicInfoStep()}
          {currentStep === 2 && renderLocationStep()}
          {currentStep === 3 && renderBusinessStep()}
          {currentStep === 4 && renderDocumentsStep()}
        </div>

        {/* Bottom Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
                resetForm();
              }
            }}
            className="px-5 py-2.5 border border-pink-200 text-pink-700 rounded-lg hover:bg-pink-50 transition-all duration-200 font-medium shadow-sm text-sm"
          >
            Cancel & Reset
          </button>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={toggleShowPreview}
              className="px-5 py-2.5 border border-pink-200 text-pink-700 rounded-lg hover:bg-pink-50 transition-all duration-200 font-medium shadow-sm text-sm"
            >
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
            >
              {loading ? 'Processing...' : '🎉 Complete Registration'}
            </button>
          </div>
        </div>

        {/* Status Message */}
        {submitStatus.message && (
          <div className={`mt-6 p-3 rounded-lg animate-fadeIn ${
            submitStatus.success 
              ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200' 
              : 'bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200'
          }`}>
            <div className="flex items-center">
              {submitStatus.success ? (
                <Check className="w-4 h-4 text-emerald-500 mr-2.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 mr-2.5" />
              )}
              <p className={`text-sm font-medium ${submitStatus.success ? 'text-emerald-800' : 'text-rose-800'}`}>
                {submitStatus.message}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AddRestaurant;