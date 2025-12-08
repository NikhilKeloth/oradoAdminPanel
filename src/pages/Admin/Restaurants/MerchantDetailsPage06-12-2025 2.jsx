import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  MapPin,
  Image as ImageIcon,
  Upload,
  X,
  Building,
  Mail,
  Phone,
  Map,
  Check,
  AlertCircle,
  Calendar,
  Clock,
  Shield,
  Star,
  Users,
  Target,
  Globe,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  Camera,
  Home,
  Navigation,
  Settings,
  Sparkles,
  Info,
  FileText
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  fetchSingleRestaurantDetails,
  updateRestaurantProfile,
} from "../../../apis/adminApis/adminFuntionsApi";
import {
  getServiceAreas,
  addServiceArea,
} from "../../../apis/adminApis/storeApi";
import AddServiceModal from "./AddServiceModal";
import PolygonMap from "./PolygonMap";
import MapComponent from "./MapComponent";

const MerchantDetailsPage = () => {
  const [deliveryMode, setDeliveryMode] = useState("Home delivery/Pick And Drop");
  const [restrictionType, setRestrictionType] = useState("no-restriction");
  const [radius, setRadius] = useState("");
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [filesToRemove, setFilesToRemove] = useState([]);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  // State for address fields
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    fullAddress: ""
  });

  // State for location coordinates
  const [coordinates, setCoordinates] = useState({
    latitude: 0,
    longitude: 0
  });

  // Additional states
  const [isActive, setIsActive] = useState(false);
  const [description, setDescription] = useState("");
  const [displayAddress, setDisplayAddress] = useState("");
  
  // Store Type state - ADDED
  const [storeType, setStoreType] = useState("restaurant");

  // Store Type options - ADDED
  const storeTypeOptions = [
    { value: "restaurant", label: "🍽️ Restaurant" },
    { value: "grocery", label: "🛒 Grocery" },
    { value: "meat", label: "🥩 Meat Shop" },
    { value: "pharmacy", label: "💊 Pharmacy" },
    { value: "bakery", label: "🥐 Bakery" },
    { value: "cafe", label: "☕ Cafe" },
  ];

  useEffect(() => {
  const getMerchantDetails = async () => {
    try {
      const data = await fetchSingleRestaurantDetails(id);

      console.log("data", data);
      setMerchant(data);
      setImages(data.images || []);
      
      // Initialize address state from merchant data
      if (data.address) {
        const addressData = {
          street: data.address.street || "",
          city: data.address.city || "",
          state: data.address.state || "",
          zip: data.address.zip || "",
          country: data.address.country || "India",
          fullAddress: data.displayAddress || data.address.street || ""
        };
        
        setAddress(addressData);
        
        // Also set displayAddress
        setDisplayAddress(data.displayAddress || `${addressData.street}, ${addressData.city}, ${addressData.state} ${addressData.zip}, ${addressData.country}`);
      }

      // Initialize coordinates
      if (data.location?.coordinates) {
        setCoordinates({
          latitude: data.location.coordinates[1] || 0,
          longitude: data.location.coordinates[0] || 0
        });
      }

      // Initialize other states
      setIsActive(data.active || false);
      setDescription(data.description || "");
      
      // Initialize store type from data - ADDED
      setStoreType(data.storeType || "restaurant");
      
      // If displayAddress wasn't set above, set it from address
      if (!data.displayAddress && data.address) {
        setDisplayAddress(`${data.address.street}, ${data.address.city}, ${data.address.state} ${data.address.zip}, ${data.address.country || "India"}`);
      }

      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to fetch merchant details.");
      setLoading(false);
    }
  };

  if (id) {
    getMerchantDetails();
  }
}, [id]);
  const fetchServiceAreas = async () => {
    setLoading(true);
    try {
      const response = await getServiceAreas(id);
      console.log(response.data);

      if (response.messageType === "success") {
        setServiceAreas(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching service areas:", error);
      setServiceAreas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchServiceAreas(id);
  }, [id]);

  

  // Handle address updates from MapComponent
  const handleAddressUpdate = (newAddress) => {
    setAddress(prev => ({
      ...prev,
      street: newAddress.street || prev.street,
      city: newAddress.city || prev.city,
      state: newAddress.state || prev.state,
      zip: newAddress.zip || prev.zip,
      country: newAddress.country || prev.country,
      fullAddress: newAddress.fullAddress || prev.fullAddress
    }));
    
    // Update display address when address changes
    setDisplayAddress(newAddress.fullAddress || `${newAddress.street}, ${newAddress.city}, ${newAddress.state} ${newAddress.zip}, ${newAddress.country}`);
  };
  

  // Handle location save from MapComponent
  const handleLocationSave = ({ longitude, latitude }) => {
    setCoordinates({
      latitude,
      longitude
    });
    console.log("Location saved:", { latitude, longitude });
    // You can add API call here to save coordinates to backend
  };

  const handleImageUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const validFiles = selectedFiles.filter((file) => {
      return file.type.match("image.*") && file.size <= 5 * 1024 * 1024;
    });

    if (validFiles.length !== selectedFiles.length) {
      alert("Some files were invalid (must be images under 5MB)");
    }

    if (validFiles.length > 0) {
      const previewUrls = validFiles.map((file) => URL.createObjectURL(file));
      setImages((prev) => [...prev, ...previewUrls]);
      setFilesToUpload((prev) => [...prev, ...validFiles]);
    }

    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = images[index];

    if (imageToRemove.startsWith("blob:")) {
      setImages((prev) => prev.filter((_, i) => i !== index));
      setFilesToUpload((prev) =>
        prev.filter(
          (_, i) => i !== index - (images.length - filesToUpload.length)
        )
      );
    } else {
      setFilesToRemove((prev) => [...prev, imageToRemove]);
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleProfileSubmit = async (e) => {
  e.preventDefault();
  setIsProfileSaving(true);

  const formData = {
    name: e.target.name.value,
    email: e.target.email.value,
    phone: `+91${e.target.phone.value}`,
    isActive: isActive,
    description: description,
    storeType: storeType, // ADDED: Store Type field
    address: {
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.zip,
      coordinates: [coordinates.latitude, coordinates.longitude]
    }
  };

  console.log("📦 Submitting data:", JSON.stringify(formData, null, 2));
  console.log("📸 Files to upload:", filesToUpload.length);
  console.log("🗑️ Files to remove:", filesToRemove.length);

  try {
    const response = await updateRestaurantProfile(
      merchant._id,
      formData,
      filesToUpload,
      filesToRemove
    );

    console.log("✅ Full API Response:", response);
    
    if (response && response.message) {
      alert(response.message);
      
      if (response.restaurant) {
        const updatedData = response.restaurant;
        setMerchant(updatedData);
        setImages(updatedData.images || []);
        setIsActive(updatedData.active || false);
        setDescription(updatedData.description || "");
        setStoreType(updatedData.storeType || "restaurant"); // ADDED: Update store type from response
        
        if (updatedData.address) {
          setAddress({
            street: updatedData.address.street || "",
            city: updatedData.address.city || "",
            state: updatedData.address.state || "",
            zip: updatedData.address.zip || "",
            country: updatedData.address.country || "India",
            fullAddress: updatedData.displayAddress || ""
          });
        }

        if (updatedData.location?.coordinates) {
          setCoordinates({
            latitude: updatedData.location.coordinates[1] || 0,
            longitude: updatedData.location.coordinates[0] || 0
          });
        }

        setDisplayAddress(updatedData.displayAddress || "");
      }
      
      setFilesToUpload([]);
      setFilesToRemove([]);
    } else {
      throw new Error("No response message received");
    }
  } catch (error) {
    console.error("❌ Update failed:", error);
    alert(`Failed to update restaurant profile: ${error.message}`);
  } finally {
    setIsProfileSaving(false);
  }
};
  const handleServingAreaSubmit = async (e) => {
    e.preventDefault();
    alert("Serving area settings saved!");
  };

  const handleSponsorshipSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const isSponsored = e.target.sponsorshipToggle?.checked || false;
    const isSortingEnabled = e.target.sorting?.checked || false;
    
    // Parse date range (assuming format: "mm/dd/yyyy - mm/dd/yyyy")
    const dateRange = e.target.dateRange?.value;
    let startDate = '';
    let endDate = '';
    
    if (dateRange) {
      const dates = dateRange.split(' - ');
      if (dates.length === 2) {
        startDate = dates[0];
        endDate = dates[1];
      }
    }
    
    const sponsorshipDates = [];
    
    if (startDate && endDate) {
      sponsorshipDates.push({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        startTime: e.target.startTime?.value || "09:00",
        endTime: e.target.endTime?.value || "21:00"
      });
    }

    const formData = {
      isSponsored,
      isSortingEnabled,
      sponsorshipDates: sponsorshipDates.length > 0 ? sponsorshipDates : []
    };

    console.log("Saving sponsorship:", formData);
    
    // Call the SAME updateRestaurantProfile function
    const response = await updateRestaurantProfile(
      merchant._id,
      formData,
      [], // No files to upload
      []  // No files to remove
    );

    if (response && response.message) {
      alert("Sponsorship settings saved!");
      
      // Update local state
      if (response.restaurant) {
        setMerchant(prev => ({
          ...prev,
          isSponsored: response.restaurant.isSponsored,
          sponsorshipDates: response.restaurant.sponsorshipDates,
          isSortingEnabled: response.restaurant.isSortingEnabled
        }));
      }
    }
    
  } catch (error) {
    console.error("Error saving sponsorship:", error);
    alert("Failed to save sponsorship settings");
  }
};

  

  // Handle address field changes
  const handleAddressChange = (field, value) => {
    setAddress(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Update display address when address fields change
    if (field === 'street' || field === 'city' || field === 'state' || field === 'zip') {
      const newDisplayAddress = `${address.street}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`;
      setDisplayAddress(newDisplayAddress);
    }
  };

  // Handle description change
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  // Handle store type change - ADDED
  const handleStoreTypeChange = (e) => {
    setStoreType(e.target.value);
  };

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.startsWith("blob:")) {
          URL.revokeObjectURL(image);
        }
      });
    };
  }, [images]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-pink-600 font-medium">Loading merchant details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg border border-rose-200 p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Merchant</h2>
          <p className="text-rose-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2.5 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg border border-pink-200 p-8 max-w-md text-center">
          <Building className="w-12 h-12 text-pink-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Merchant Found</h2>
          <p className="text-gray-600 mb-6">The requested merchant data could not be found.</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2.5 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-pink-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex space-x-1">
            <li>
              <Link
                to={`/admin/dashboard/merchants/merchant-config/${id}`}
                className={`px-6 py-3 block transition-all duration-200 relative ${
                  location.pathname === `/admin/dashboard/merchants/merchant-config/${id}`
                    ? "text-pink-600 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-pink-500 after:to-rose-500"
                    : "text-gray-600 hover:text-pink-600"
                }`}
              >
                Configurations
              </Link>
            </li>
            <li>
              <Link
                to={`/admin/dashboard/merchants/merchant-catelogue/${id}`}
                className={`px-6 py-3 block transition-all duration-200 relative ${
                  location.pathname === `/admin/dashboard/merchants/merchant-catelogue/${id}`
                    ? "text-pink-600 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-pink-500 after:to-rose-500"
                    : "text-gray-600 hover:text-pink-600"
                }`}
              >
                Catalogue
              </Link>
            </li>
            <li>
              <Link
                to={`/admin/dashboard/merchants/merchant-details/${id}`}
                className={`px-6 py-3 block transition-all duration-200 relative ${
                  location.pathname === `/admin/dashboard/merchants/merchant-details/${id}`
                    ? "text-pink-600 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-pink-500 after:to-rose-500"
                    : "text-gray-600 hover:text-pink-600"
                }`}
              >
                Merchant
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-pink-700 hover:text-rose-600 transition-colors bg-pink-50 hover:bg-pink-100 px-3 py-2 rounded-lg mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="font-medium">Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Building className="h-6 w-6 mr-2 text-pink-500" />
                {merchant.name || "Restaurant Name"}
              </h1>
              <p className="text-pink-600 text-sm mt-1 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                Merchant ID: {merchant._id?.slice(-8) || "N/A"}
                <span className="mx-2">•</span>
                <span className="capitalize">{storeType}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-lg shadow-sm">
              <div className="text-xs font-medium text-pink-100">Status</div>
              <div className="text-sm font-bold flex items-center">
                {isActive ? (
                  <>
                    <div className="w-2 h-2 bg-emerald-300 rounded-full mr-1.5"></div>
                    Active
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-rose-300 rounded-full mr-1.5"></div>
                    Inactive
                  </>
                )}
              </div>
            </div>
            <button className="p-2 border border-pink-200 rounded-lg text-pink-600 hover:bg-pink-50 transition-colors">
              <ExternalLink className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 pb-8">
          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-sm border border-pink-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Building className="h-5 w-5 mr-2 text-pink-500" />
                Restaurant Profile
              </h2>
              <p className="text-pink-600 text-sm mt-1">Update restaurant information and settings</p>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* ID Field */}
                  <div className="space-y-1.5">
                    <label className="flex items-center text-sm font-medium text-pink-800">
                      <Shield className="w-3 h-3 mr-1.5 text-pink-500" />
                      Merchant ID
                    </label>
                    <div className="bg-pink-50 px-3 py-2.5 rounded-lg border border-pink-200 text-gray-700 font-mono text-sm">
                      {merchant._id || "N/A"}
                    </div>
                  </div>

                  {/* Name Field */}
                  <div className="space-y-1.5">
                    <label className="flex items-center text-sm font-medium text-pink-800">
                      <Building className="w-3 h-3 mr-1.5 text-pink-500" />
                      Restaurant Name *
                    </label>
                    <input
                      name="name"
                      type="text"
                      className="w-full px-3 py-2.5 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors"
                      placeholder="Enter restaurant name"
                      defaultValue={merchant.name || ""}
                      required
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="flex items-center text-sm font-medium text-pink-800">
                      <Mail className="w-3 h-3 mr-1.5 text-pink-500" />
                      Email Address *
                    </label>
                    <input
                      name="email"
                      type="email"
                      className="w-full px-3 py-2.5 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors"
                      placeholder="restaurant@example.com"
                      defaultValue={merchant.email || ""}
                      required
                    />
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-1.5">
                    <label className="flex items-center text-sm font-medium text-pink-800">
                      <Phone className="w-3 h-3 mr-1.5 text-pink-500" />
                      Phone Number *
                    </label>
                    <div className="flex">
                      <div className="w-1/4 px-3 py-2.5 text-sm border border-pink-200 rounded-l-lg bg-pink-50 text-pink-700 flex items-center justify-center">
                        +91
                      </div>
                      <input
                        name="phone"
                        type="tel"
                        className="w-3/4 px-3 py-2.5 text-sm border-t border-r border-b border-pink-200 rounded-r-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors"
                        placeholder="9876543210"
                        defaultValue={merchant.phone ? merchant.phone.replace("+91", "") : ""}
                        required
                      />
                    </div>
                  </div>

                  {/* Food Type */}
                  <div className="space-y-1.5">
                    <label className="flex items-center text-sm font-medium text-pink-800">
                      <Users className="w-3 h-3 mr-1.5 text-pink-500" />
                      Food Type
                    </label>
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-3 py-2.5 rounded-lg border border-pink-200 text-pink-700 font-medium capitalize">
                      {merchant.foodType || "Not specified"}
                    </div>
                  </div>

                  {/* Store Type Dropdown - ADDED */}
                  <div className="space-y-1.5">
                    <label className="flex items-center text-sm font-medium text-pink-800">
                      <Building className="w-3 h-3 mr-1.5 text-pink-500" />
                      Store Type *
                    </label>
                    <div className="relative">
                      <select
                        name="storeType"
                        value={storeType}
                        onChange={handleStoreTypeChange}
                        className="w-full px-3 py-2.5 text-sm border border-pink-200 rounded-lg appearance-none focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors bg-white"
                        required
                      >
                        <option value="">Select Store Type</option>
                        {storeTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400 pointer-events-none" />
                    </div>
                    <div className="text-xs text-pink-600 mt-1 flex items-center">
                      <span className="capitalize font-medium">{storeType}</span>
                      {storeType && (
                        <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 rounded text-xs">
                          {storeTypeOptions.find(opt => opt.value === storeType)?.label.replace(/[^\w\s]/gi, '')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <div className="space-y-1.5">
                    <label className="flex items-center text-sm font-medium text-pink-800">
                      <Check className="w-3 h-3 mr-1.5 text-pink-500" />
                      Restaurant Status
                    </label>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-rose-500"></div>
                      </label>
                      <span className="ml-3 text-sm text-gray-700">
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="mt-8 pt-6 border-t border-pink-200">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                    <Home className="h-4 w-4 mr-2 text-pink-500" />
                    Restaurant Address
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {/* Street Address */}
                      <div className="space-y-1.5">
                        <label className="flex items-center text-sm font-medium text-pink-800">
                          <MapPin className="w-3 h-3 mr-1.5 text-pink-500" />
                          Street Address *
                        </label>
                        <input
                          name="street"
                          type="text"
                          className="w-full px-3 py-2.5 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors"
                          placeholder="Building, street, area"
                          value={address.street}
                          onChange={(e) => handleAddressChange("street", e.target.value)}
                          required
                        />
                      </div>

                      {/* City & State */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="flex items-center text-sm font-medium text-pink-800">
                            City *
                          </label>
                          <input
                            name="city"
                            type="text"
                            className="w-full px-3 py-2.5 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors"
                            placeholder="City"
                            value={address.city}
                            onChange={(e) => handleAddressChange("city", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="flex items-center text-sm font-medium text-pink-800">
                            State *
                          </label>
                          <input
                            name="state"
                            type="text"
                            className="w-full px-3 py-2.5 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors"
                            placeholder="State"
                            value={address.state}
                            onChange={(e) => handleAddressChange("state", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Zip Code */}
                      <div className="space-y-1.5">
                        <label className="flex items-center text-sm font-medium text-pink-800">
                          Zip Code *
                        </label>
                        <input
                          name="zip"
                          type="text"
                          className="w-full px-3 py-2.5 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors"
                          placeholder="Pin code"
                          value={address.zip}
                          onChange={(e) => handleAddressChange("zip", e.target.value)}
                          required
                        />
                      </div>

                      {/* Country */}
                      <div className="space-y-1.5">
                        <label className="flex items-center text-sm font-medium text-pink-800">
                          Country
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2.5 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors bg-gray-50"
                          value="India"
                          readOnly
                        />
                      </div>

                      {/* Display Address */}
                      <div className="space-y-1.5">
                        <label className="flex items-center text-sm font-medium text-pink-800">
                          <Globe className="w-3 h-3 mr-1.5 text-pink-500" />
                          Display Address
                        </label>
                        <textarea
                          className="w-full px-3 py-2.5 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors h-20"
                          placeholder="Complete address for display purposes"
                          value={displayAddress || `${address.street}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`}
                          onChange={(e) => setDisplayAddress(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Map and Coordinates */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="flex items-center text-sm font-medium text-pink-800">
                          <Navigation className="w-3 h-3 mr-1.5 text-pink-500" />
                          Location Coordinates
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs text-pink-600">Latitude</label>
                            <div className="bg-pink-50 px-3 py-2 rounded-lg border border-pink-200 text-gray-700 font-mono">
                              {coordinates.latitude?.toFixed(6) || "—"}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-pink-600">Longitude</label>
                            <div className="bg-pink-50 px-3 py-2 rounded-lg border border-pink-200 text-gray-700 font-mono">
                              {coordinates.longitude?.toFixed(6) || "—"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Map Preview */}
                      <div className="h-96 rounded-lg overflow-hidden border border-pink-300 shadow-sm">
                        <MapComponent
                          latitude={coordinates.latitude}
                          longitude={coordinates.longitude}
                          onSave={handleLocationSave}
                          onAddressUpdate={handleAddressUpdate}
                          initialAddress={merchant.address}
                        />
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <Info className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-amber-700">
                            <span className="font-semibold">Tip:</span> Click "Edit Location" on the map, then click anywhere on the map or use the search box to update the location. The address fields will auto-populate.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6 pt-6 border-t border-pink-200">
                  <div className="space-y-1.5">
                    <label className="flex items-center text-sm font-medium text-pink-800">
                      <FileText className="w-3 h-3 mr-1.5 text-pink-500" />
                      Description (Max 360 Characters)
                    </label>
                    <textarea
                      className="w-full px-3 py-2.5 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors h-32"
                      placeholder="Describe your restaurant, specialty dishes, ambiance, etc."
                      maxLength={360}
                      value={description}
                      onChange={handleDescriptionChange}
                    />
                    <div className="text-xs text-pink-500 text-right">
                      {description.length}/360 characters
                    </div>
                  </div>
                </div>

                {/* Media Gallery */}
                <div className="mt-6 pt-6 border-t border-pink-200">
                  <div className="space-y-1.5">
                    <label className="flex items-center text-sm font-medium text-pink-800">
                      <Camera className="w-3 h-3 mr-1.5 text-pink-500" />
                      Restaurant Images
                    </label>
                    
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                      images.length > 0 ? 'border-pink-200' : 'border-pink-300 hover:border-pink-400 bg-pink-50'
                    }`}>
                      {images.length > 0 ? (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-bold text-pink-800">
                              Uploaded Images ({images.length})
                            </h4>
                            <button
                              type="button"
                              onClick={() => {
                                setImages([]);
                                setFilesToUpload([]);
                                setFilesToRemove([...filesToRemove, ...images.filter(img => !img.startsWith('blob:'))]);
                              }}
                              className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                            >
                              Remove All
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {images.map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image}
                                  alt={`Restaurant ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg shadow-sm"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index)}
                                  className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-rose-600 shadow-md"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="py-8">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 mb-4">
                            <ImageIcon className="w-8 h-8 text-pink-500" />
                          </div>
                          <p className="text-sm font-bold text-pink-700 mb-1">
                            No images uploaded yet
                          </p>
                          <p className="text-xs text-pink-500 mb-4">
                            Upload restaurant images to showcase your business
                          </p>
                        </div>
                      )}

                      <div>
                        <input
                          type="file"
                          id="restaurant-images"
                          className="hidden"
                          multiple
                          onChange={handleImageUpload}
                          accept="image/*"
                        />
                        <label
                          htmlFor="restaurant-images"
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          {images.length > 0 ? 'Add More Images' : 'Upload Images'}
                        </label>
                        <p className="text-xs text-pink-400 mt-2">
                          JPG, PNG up to 5MB each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="px-6 py-4 border-t border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isProfileSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isProfileSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Profile Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Serving Area Section */}
          <div className="bg-white rounded-xl shadow-sm border border-pink-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Target className="h-5 w-5 mr-2 text-pink-500" />
                Serving Area
              </h2>
              <p className="text-pink-600 text-sm mt-1">Define restaurant delivery and service areas</p>
            </div>

            <div className="p-6">
              {serviceAreas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border-2 border-dashed border-pink-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 mb-4">
                    <Map className="w-8 h-8 text-pink-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    No Service Areas Configured
                  </h3>
                  <p className="text-pink-600 mb-6 text-center max-w-md">
                    This restaurant doesn't have any service areas yet. Add service areas to define where you deliver.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Service Area
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {serviceAreas.length} Service Area{serviceAreas.length !== 1 ? 's' : ''} Configured
                      </h3>
                      <p className="text-sm text-pink-600">Manage your delivery and service zones</p>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-md transition-all duration-200 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Area
                    </button>
                  </div>

                  {serviceAreas.map((area, index) => (
                    <div
                      key={area._id || index}
                      className="bg-gradient-to-r from-pink-50 to-white rounded-lg border border-pink-200 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-gray-900">Service Area {index + 1}</h4>
                            {area.name && (
                              <p className="text-sm text-pink-600">{area.name}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-1.5 text-pink-600 hover:text-pink-700 hover:bg-pink-100 rounded transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="h-96">
                        <PolygonMap
                          serviceArea={area}
                          restaurantLocation={[coordinates.longitude, coordinates.latitude]}
                          restaurantName={merchant?.name}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sponsorship Section */}
          <div className="bg-white rounded-xl shadow-sm border border-pink-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Star className="h-5 w-5 mr-2 text-pink-500" />
                Sponsorship
              </h2>
              <p className="text-pink-600 text-sm mt-1">Manage restaurant sponsorship and promotions</p>
            </div>

            <form onSubmit={handleSponsorshipSubmit} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Enable Sponsorship</h3>
                  <p className="text-sm text-pink-600">Feature your restaurant prominently</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    name="sponsorshipToggle"
                    defaultChecked={merchant?.isSponsored || false}
                  />
                  <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-rose-500"></div>
                </label>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="flex items-center text-sm font-medium text-pink-800">
                    <Calendar className="w-3 h-3 mr-1.5 text-pink-500" />
                    Sponsorship Dates
                  </label>
                  <div className="bg-pink-50 rounded-lg border border-pink-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-pink-700">Date Range</label>
                        <input
                          name="dateRange"
                          type="text"
                          placeholder="mm/dd/yyyy - mm/dd/yyyy"
                          className="w-full px-3 py-2 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors bg-white"
                          defaultValue={merchant?.sponsorshipDates?.[0] ? 
                            `${new Date(merchant.sponsorshipDates[0].startDate).toLocaleDateString()} - ${new Date(merchant.sponsorshipDates[0].endDate).toLocaleDateString()}` 
                            : ''}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-pink-700">Start Time</label>
                        <input
                          name="startTime"
                          type="time"
                          className="w-full px-3 py-2 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors bg-white"
                          placeholder="HH:MM"
                          defaultValue={merchant?.sponsorshipDates?.[0]?.startTime || "09:00"}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-pink-700">End Time</label>
                        <input
                          name="endTime"
                          type="time"
                          className="w-full px-3 py-2 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors bg-white"
                          placeholder="HH:MM"
                          defaultValue={merchant?.sponsorshipDates?.[0]?.endTime || "21:00"}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sorting"
                    name="sorting"
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-pink-300 rounded"
                    defaultChecked={merchant?.isSortingEnabled || false}
                  />
                  <label htmlFor="sorting" className="ml-2 text-sm text-gray-700">
                    Enable sorting for sponsored restaurants
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-8 pt-6 border-t border-pink-200">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-semibold"
                  >
                    <Save className="w-4 h-4" />
                    Save Sponsorship Settings
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Service Area Modal */}
      <AddServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        restaurantId={id}
        onServiceAdded={() => {
          fetchServiceAreas();
          setIsModalOpen(false);
        }}
        restaurantLocation={[coordinates.longitude, coordinates.latitude]}
        restaurantName={merchant?.name}
      />
    </div>
  );
};

export default MerchantDetailsPage;