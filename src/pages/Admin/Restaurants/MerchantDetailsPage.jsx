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
  FileText,
  Percent,
  DollarSign,
  Layers,
  TrendingUp,
  CreditCard,
  Package,
  Truck
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
  
  // Store Type state
  const [storeType, setStoreType] = useState("restaurant");

  // Commission State - NEW
  const [commission, setCommission] = useState({
    main: {
      type: "percentage", // "percentage" or "fixed"
      value: 10,
      saved: false
    },
    tiers: [
      {
        id: 1,
        min: 0,
        max: 1000,
        type: "percentage",
        value: 5
      },
      {
        id: 2,
        min: 1001,
        max: 5000,
        type: "percentage",
        value: 7
      },
      {
        id: 3,
        min: 5001,
        max: 10000,
        type: "fixed",
        value: 500
      }
    ],
    saved: false
  });

  // Sponsorship State - Enhanced
  const [sponsorship, setSponsorship] = useState({
    isActive: false,
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "17:00",
    allDay: false
  });

  // Store Type options
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
        setStoreType(data.storeType || "restaurant");
        
        // Initialize commission from data - NEW
        // Initialize commission from data - NEW
        if (data.commission_new) {
          console.log("Loaded commission_new:", data.commission_new);
          setCommission({
            main: {
              type: data.commission_new.main?.type || "percentage",
              value: data.commission_new.main?.value || 10,
              saved: true
            },
            tiers: data.commission_new.tiers?.map((tier, index) => ({
              id: index + 1, // Add id for frontend
              min: tier.min || 0,
              max: tier.max || 0,
              type: tier.type || "percentage",
              value: tier.value || 0
            })) || [],
            saved: true
          });
        } else {
          console.log("No commission_new found");
        }

        // Initialize sponsorship from data - Enhanced
        // if (data.sponsorship) {
        //   setSponsorship({
        //     isActive: data.sponsorship.isActive || false,
        //     startDate: data.sponsorship.startDate || "",
        //     endDate: data.sponsorship.endDate || "",
        //     startTime: data.sponsorship.startTime || "09:00",
        //     endTime: data.sponsorship.endTime || "17:00",
        //     allDay: data.sponsorship.allDay || false
        //   });
        // }

        // Initialize sponsorship from data - Enhanced
        if (data.sponsorshipDates && data.sponsorshipDates.length > 0) {
          const sponsorData = data.sponsorshipDates[0];
          setSponsorship({
            isActive: data.isSponsored || false,
            startDate: sponsorData.startDate ? new Date(sponsorData.startDate).toISOString().split('T')[0] : "",
            endDate: sponsorData.endDate ? new Date(sponsorData.endDate).toISOString().split('T')[0] : "",
            startTime: sponsorData.startTime || "09:00",
            endTime: sponsorData.endTime || "17:00",
            allDay: !sponsorData.startTime || !sponsorData.endTime
          });
        } else {
          // Set isActive from isSponsored field even if no dates exist
          setSponsorship(prev => ({
            ...prev,
            isActive: data.isSponsored || false
          }));
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

  // Initialize sponsorship dates with today
  // useEffect(() => {
  //   if (!sponsorship.startDate) {
  //     const today = new Date().toISOString().split('T')[0];
  //     const oneWeekLater = new Date();
  //     oneWeekLater.setDate(oneWeekLater.getDate() + 7);
      
  //     setSponsorship(prev => ({
  //       ...prev,
  //       startDate: today,
  //       endDate: oneWeekLater.toISOString().split('T')[0]
  //     }));
  //   }
  // }, []);

  // Initialize sponsorship dates with today only if needed
  useEffect(() => {
    // Only set default dates if sponsorship is active but dates are not set
    if (sponsorship.isActive && !sponsorship.startDate) {
      const today = new Date().toISOString().split('T')[0];
      const oneWeekLater = new Date();
      oneWeekLater.setDate(oneWeekLater.getDate() + 7);
      
      setSponsorship(prev => ({
        ...prev,
        startDate: today,
        endDate: oneWeekLater.toISOString().split('T')[0]
      }));
    }
  }, [sponsorship.isActive]);

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
    
    setDisplayAddress(newAddress.fullAddress || `${newAddress.street}, ${newAddress.city}, ${newAddress.state} ${newAddress.zip}, ${newAddress.country}`);
  };

  // Handle location save from MapComponent
  const handleLocationSave = ({ longitude, latitude }) => {
    setCoordinates({
      latitude,
      longitude
    });
    console.log("Location saved:", { latitude, longitude });
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
      storeType: storeType,
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.zip,
        coordinates: [coordinates.latitude, coordinates.longitude]
      }
    };

    console.log("📦 Submitting data:", JSON.stringify(formData, null, 2));

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
          setStoreType(updatedData.storeType || "restaurant");
          
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

  // Handle main commission changes - NEW
  const handleMainCommissionChange = (field, value) => {
    setCommission(prev => ({
      ...prev,
      main: {
        ...prev.main,
        [field]: value,
        saved: false
      }
    }));
  };

  // Save main commission - NEW
  const saveMainCommission = async () => {
    try {
      const formData = {
         commission: {
        main: {
          type: commission.main.type,
          value: commission.main.value
          // Remove 'saved' field - it's frontend only
        },
        tiers: commission.tiers // Include existing tiers
      }
      };

      console.log("Saving main commission:", formData);
      
      const response = await updateRestaurantProfile(
        merchant._id,
        formData,
        [], // No files
        []  // No files
      );

      if (response && response.message) {
        alert("Main commission saved successfully!");
        setCommission(prev => ({
          ...prev,
          main: { ...prev.main, saved: true }
        }));
      }
    } catch (error) {
      console.error("Error saving main commission:", error);
      alert("Failed to save main commission");
    }
  };

  // Handle tier commission changes - NEW
  const handleTierChange = (tierId, field, value) => {
    setCommission(prev => ({
      ...prev,
      tiers: prev.tiers.map(tier =>
        tier.id === tierId ? { ...tier, [field]: value } : tier
      ),
      saved: false
    }));
  };

  // Add new tier - NEW
  const addNewTier = () => {
    const lastTier = commission.tiers[commission.tiers.length - 1];
    const newId = commission.tiers.length > 0 ? Math.max(...commission.tiers.map(t => t.id)) + 1 : 1;
    
    setCommission(prev => ({
      ...prev,
      tiers: [
        ...prev.tiers,
        {
          id: newId,
          min: lastTier ? lastTier.max + 1 : 0,
          max: lastTier ? lastTier.max + 1000 : 1000,
          type: "percentage",
          value: 5
        }
      ]
    }));
  };

  // Remove tier - NEW
  const removeTier = (tierId) => {
    if (commission.tiers.length > 1) {
      setCommission(prev => ({
        ...prev,
        tiers: prev.tiers.filter(tier => tier.id !== tierId)
      }));
    }
  };

  // Save tiered commission - NEW
  const saveTieredCommission = async () => {
    try {
      const formData = {
      commission: {
        main: {
          type: commission.main.type,
          value: commission.main.value
        },
        tiers: commission.tiers.map(tier => ({
          min: tier.min,
          max: tier.max,
          type: tier.type,
          value: tier.value
          // Remove 'id' field
        }))
      }
    };
      console.log("Saving tiered commission:", formData);
      
      const response = await updateRestaurantProfile(
        merchant._id,
        formData,
        [],
        []
      );

      if (response && response.message) {
        alert("Tiered commission saved successfully!");
        setCommission(prev => ({ ...prev, saved: true }));
      }
    } catch (error) {
      console.error("Error saving tiered commission:", error);
      alert("Failed to save tiered commission");
    }
  };

  // Handle sponsorship changes - Enhanced
  const handleSponsorshipChange = (field, value) => {
    setSponsorship(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save sponsorship - Enhanced
  const handleSponsorshipSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = {
        sponsorship: {
          isActive: sponsorship.isActive,
          startDate: sponsorship.startDate,
          endDate: sponsorship.endDate,
          startTime: sponsorship.allDay ? null : sponsorship.startTime,
          endTime: sponsorship.allDay ? null : sponsorship.endTime,
          allDay: sponsorship.allDay
        }
      };

      console.log("Saving sponsorship:", formData);
      
      const response = await updateRestaurantProfile(
        merchant._id,
        formData,
        [],
        []
      );

      if (response && response.message) {
        alert("Sponsorship settings saved!");
        
        if (response.restaurant) {
          setMerchant(prev => ({
            ...prev,
            sponsorship: response.restaurant.sponsorship
          }));
        }
      }
    } catch (error) {
      console.error("Error saving sponsorship:", error);
      alert("Failed to save sponsorship settings");
    }
  };

  // Calculate commission demo - NEW
  const calculateCommissionDemo = () => {
    const orderValue = parseFloat(document.getElementById('demoOrderValue')?.value || "1500");
    const matchingTier = commission.tiers.find(tier => 
      orderValue >= tier.min && orderValue <= tier.max
    );

    let commissionAmount = 0;
    
    if (matchingTier) {
      if (matchingTier.type === 'percentage') {
        commissionAmount = (orderValue * matchingTier.value) / 100;
      } else {
        commissionAmount = matchingTier.value;
      }
    } else {
      if (commission.main.type === 'percentage') {
        commissionAmount = (orderValue * commission.main.value) / 100;
      } else {
        commissionAmount = commission.main.value;
      }
    }

    alert(`Order Value: $${orderValue}\nCommission: $${commissionAmount.toFixed(2)}\n${matchingTier ? 'Tier Applied' : 'Default Commission Applied'}`);
  };

  // Handle address field changes
  const handleAddressChange = (field, value) => {
    setAddress(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'street' || field === 'city' || field === 'state' || field === 'zip') {
      const newDisplayAddress = `${address.street}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`;
      setDisplayAddress(newDisplayAddress);
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 p-3">
      {/* Top Navigation Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-pink-100 mb-6 overflow-hidden">
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

                  {/* Store Type Dropdown */}
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

          {/* Commission Section - NEW */}
          <div className="bg-white rounded-xl shadow-sm border border-pink-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-pink-500" />
                Commission Settings
              </h2>
              <p className="text-pink-600 text-sm mt-1">Configure commission structure for this merchant</p>
            </div>

            <div className="p-6">
              {/* Main Commission */}
              <div className="mb-8 pb-6 border-b border-pink-200">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-pink-500" />
                  Main Commission
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="flex items-center text-sm font-medium text-pink-800">
                        Commission Type
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="commissionType"
                            value="percentage"
                            checked={commission.main.type === 'percentage'}
                            onChange={(e) => handleMainCommissionChange('type', e.target.value)}
                            className="h-4 w-4 text-pink-600 focus:ring-pink-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Percentage (%)</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="commissionType"
                            value="fixed"
                            checked={commission.main.type === 'fixed'}
                            onChange={(e) => handleMainCommissionChange('type', e.target.value)}
                            className="h-4 w-4 text-pink-600 focus:ring-pink-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Fixed Amount</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center text-sm font-medium text-pink-800">
                        {commission.main.type === 'percentage' ? 'Commission Percentage' : 'Fixed Commission Amount'}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {commission.main.type === 'percentage' ? (
                            <Percent className="h-4 w-4 text-pink-400" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-pink-400" />
                          )}
                        </div>
                        <input
                          type="number"
                          min="0"
                          step={commission.main.type === 'percentage' ? "0.1" : "1"}
                          value={commission.main.value}
                          onChange={(e) => handleMainCommissionChange('value', parseFloat(e.target.value))}
                          className="w-full pl-10 pr-3 py-2.5 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors"
                          placeholder={commission.main.type === 'percentage' ? "Enter percentage" : "Enter fixed amount"}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={saveMainCommission}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        commission.main.saved
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-lg'
                          : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      {commission.main.saved ? 'Saved ✓' : 'Save Main Commission'}
                    </button>
                  </div>

                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200 p-4">
                    <h4 className="font-medium text-pink-800 mb-2 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      About Main Commission
                    </h4>
                    <p className="text-sm text-pink-600">
                      This commission will be applied to all orders that don't fall within the tiered commission ranges below.
                    </p>
                    <div className="mt-4 p-3 bg-white rounded border border-pink-100">
                      <p className="text-xs text-pink-500">
                        <span className="font-semibold">Example:</span> 
                        {commission.main.type === 'percentage' 
                          ? ` A $100 order will incur $${((100 * commission.main.value) / 100).toFixed(2)} commission (${commission.main.value}%).`
                          : ` Any order will incur $${commission.main.value} commission regardless of order value.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tiered Commission */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center">
                      <Layers className="h-4 w-4 mr-2 text-pink-500" />
                      Tiered Commission
                    </h3>
                    <p className="text-pink-600 text-sm mt-1">
                      <span className="font-semibold text-amber-600">Note:</span> Default commission will be applicable if amount doesn't fall within the range
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addNewTier}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-md transition-all duration-200 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Tier
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-pink-50 to-rose-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-pink-700 uppercase border-b border-pink-200">
                          Min Order Value ($)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-pink-700 uppercase border-b border-pink-200">
                          Max Order Value ($)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-pink-700 uppercase border-b border-pink-200">
                          Commission Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-pink-700 uppercase border-b border-pink-200">
                          Commission Value
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-pink-700 uppercase border-b border-pink-200">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {commission.tiers.map((tier) => (
                        <tr key={tier.id} className="border-b border-pink-100 hover:bg-pink-50 transition-colors">
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={tier.min}
                              onChange={(e) => handleTierChange(tier.id, 'min', parseInt(e.target.value))}
                              className="w-full px-3 py-2 text-sm border border-pink-200 rounded-lg focus:ring-1 focus:ring-pink-300 focus:border-pink-400 outline-none"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={tier.min + 1}
                              step="1"
                              value={tier.max}
                              onChange={(e) => handleTierChange(tier.id, 'max', parseInt(e.target.value))}
                              className="w-full px-3 py-2 text-sm border border-pink-200 rounded-lg focus:ring-1 focus:ring-pink-300 focus:border-pink-400 outline-none"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={tier.type}
                              onChange={(e) => handleTierChange(tier.id, 'type', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-pink-200 rounded-lg focus:ring-1 focus:ring-pink-300 focus:border-pink-400 outline-none"
                            >
                              <option value="percentage">Percentage</option>
                              <option value="fixed">Fixed Amount</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                {tier.type === 'percentage' ? (
                                  <Percent className="h-4 w-4 text-pink-400" />
                                ) : (
                                  <DollarSign className="h-4 w-4 text-pink-400" />
                                )}
                              </div>
                              <input
                                type="number"
                                min="0"
                                step={tier.type === 'percentage' ? "0.1" : "1"}
                                value={tier.value}
                                onChange={(e) => handleTierChange(tier.id, 'value', parseFloat(e.target.value))}
                                className="w-full pl-10 pr-3 py-2 text-sm border border-pink-200 rounded-lg focus:ring-1 focus:ring-pink-300 focus:border-pink-400 outline-none"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => removeTier(tier.id)}
                              disabled={commission.tiers.length <= 1}
                              className="px-3 py-1.5 text-sm bg-rose-100 text-rose-700 rounded hover:bg-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={calculateCommissionDemo}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-md transition-all duration-200 text-sm font-medium"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Test Commission Calculation
                    </button>
                    <input
                      id="demoOrderValue"
                      type="number"
                      placeholder="Enter order value"
                      defaultValue="1500"
                      min="0"
                      className="px-3 py-2 text-sm border border-pink-200 rounded-lg focus:ring-1 focus:ring-pink-300 focus:border-pink-400 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={saveTieredCommission}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                      commission.saved
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-lg'
                        : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    {commission.saved ? 'Tiered Commission Saved ✓' : 'Save Tiered Commission'}
                  </button>
                </div>
              </div>
            </div>
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

          {/* Sponsorship Section - Enhanced */}
          <div className="bg-white rounded-xl shadow-sm border border-pink-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Star className="h-5 w-5 mr-2 text-pink-500" />
                Sponsorship
              </h2>
              <p className="text-pink-600 text-sm mt-1">Manage restaurant sponsorship and promotions with calendar scheduling</p>
            </div>

            <form onSubmit={handleSponsorshipSubmit} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Enable Sponsorship</h3>
                  <p className="text-sm text-pink-600">Feature your restaurant prominently on selected dates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={sponsorship.isActive}
                    onChange={(e) => handleSponsorshipChange('isActive', e.target.checked)}
                  />
                  <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-rose-500"></div>
                </label>
              </div>

              {sponsorship.isActive && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allDay"
                        checked={sponsorship.allDay}
                        onChange={(e) => handleSponsorshipChange('allDay', e.target.checked)}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-pink-300 rounded"
                      />
                      <label htmlFor="allDay" className="ml-2 text-sm text-gray-700">
                        All day event
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="flex items-center text-sm font-medium text-pink-800">
                          <Calendar className="w-3 h-3 mr-1.5 text-pink-500" />
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={sponsorship.startDate}
                          onChange={(e) => handleSponsorshipChange('startDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2.5 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="flex items-center text-sm font-medium text-pink-800">
                          <Calendar className="w-3 h-3 mr-1.5 text-pink-500" />
                          End Date
                        </label>
                        <input
                          type="date"
                          value={sponsorship.endDate}
                          onChange={(e) => handleSponsorshipChange('endDate', e.target.value)}
                          min={sponsorship.startDate}
                          className="w-full px-3 py-2.5 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors"
                        />
                      </div>

                      {!sponsorship.allDay && (
                        <>
                          <div className="space-y-1.5">
                            <label className="flex items-center text-sm font-medium text-pink-800">
                              <Clock className="w-3 h-3 mr-1.5 text-pink-500" />
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={sponsorship.startTime}
                              onChange={(e) => handleSponsorshipChange('startTime', e.target.value)}
                              className="w-full px-3 py-2.5 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="flex items-center text-sm font-medium text-pink-800">
                              <Clock className="w-3 h-3 mr-1.5 text-pink-500" />
                              End Time
                            </label>
                            <input
                              type="time"
                              value={sponsorship.endTime}
                              onChange={(e) => handleSponsorshipChange('endTime', e.target.value)}
                              min={sponsorship.startTime}
                              className="w-full px-3 py-2.5 text-sm border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
                      <div className="flex items-start">
                        <Info className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-semibold text-blue-800 mb-1">Sponsorship Details</h4>
                          <p className="text-xs text-blue-600">
                            {sponsorship.allDay 
                              ? `Sponsorship will run all day from ${new Date(sponsorship.startDate).toLocaleDateString()} to ${new Date(sponsorship.endDate).toLocaleDateString()}`
                              : `Sponsorship will run from ${sponsorship.startTime} to ${sponsorship.endTime} daily between ${new Date(sponsorship.startDate).toLocaleDateString()} and ${new Date(sponsorship.endDate).toLocaleDateString()}`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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