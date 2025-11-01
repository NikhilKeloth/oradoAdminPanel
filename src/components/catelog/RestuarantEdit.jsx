import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  MapPin,
  CreditCard,
  Image,
  Upload,
  X,
  ChevronDown,
  Clock,
  Save,
} from "react-feather";
import {
  updateRestaurantBasicInfo,
  updateRestaurantImages,
  updateRestaurantLocation,
  updateRestaurantOpeningHours,
  getRestaurantById
} from "../../../../apis/restaurantApi";
import LocationPicker from "../../../map/LocationPicker";

const RestaurantEdit = ({ restaurantId, onRestaurantUpdate }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    foodType: "Indian",
    merchantSearchName: "",
    minOrderAmount: 250,
    isActive: true,
    status: "active",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
    location: {
      longitude: 0,
      latitude: 0
    },
    paymentMethods: ["UPI", "Card", "Cash"],
    openingHours: [
      {
        day: "Monday",
        openingTime: "09:00",
        closingTime: "22:00",
        isClosed: false,
      },
      {
        day: "Tuesday",
        openingTime: "09:00",
        closingTime: "22:00",
        isClosed: false,
      },
      {
        day: "Wednesday",
        openingTime: "09:00",
        closingTime: "22:00",
        isClosed: false,
      },
      {
        day: "Thursday",
        openingTime: "09:00",
        closingTime: "22:00",
        isClosed: false,
      },
      {
        day: "Friday",
        openingTime: "09:00",
        closingTime: "22:00",
        isClosed: false,
      },
      {
        day: "Saturday",
        openingTime: "09:00",
        closingTime: "23:00",
        isClosed: false,
      },
      {
        day: "Sunday",
        openingTime: "10:00",
        closingTime: "22:00",
        isClosed: false,
      },
    ],
  });
  
  const foodTypes = ["veg", "non-veg", "both"];
  const [uploadedFiles, setUploadedFiles] = useState({
    fssaiDoc: null,
    gstDoc: null,
    aadharDoc: null,
    logo: null,
    coverPhoto: null,
    galleryImages: [],
  });

  const fileInputRefs = {
    fssaiDoc: useRef(null),
    gstDoc: useRef(null),
    aadharDoc: useRef(null),
    logo: useRef(null),
    coverPhoto: useRef(null),
    galleryImages: useRef(null),
  };

  const paymentOptions = ["UPI", "Card", "Cash", "Net Banking", "Wallet"];

  const tabs = [
    { id: "basic", label: "Basic Information", icon: FileText },
    { id: "location", label: "Location & Hours", icon: MapPin },
    { id: "documents", label: "Documents & Payments", icon: CreditCard },
    { id: "media", label: "Media & Gallery", icon: Image },
  ];

  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!restaurantId) return;
      
      try {
        const response = await getRestaurantById(restaurantId);
        const restaurant = response.data;
        if (restaurant) {
          setFormData({
            name: restaurant.name || "",
            phone: restaurant.phone || "",
            email: restaurant.email || "",
            foodType: restaurant.foodType || "Indian",
            merchantSearchName: restaurant.merchantSearchName || "",
            minOrderAmount: restaurant.minOrderAmount || 250,
            isActive: restaurant.isActive !== undefined ? restaurant.isActive : true,
            status: restaurant.status || "active",
            address: {
              street: restaurant.address?.street || "",
              city: restaurant.address?.city || "",
              state: restaurant.address?.state || "",
              pincode: restaurant.address?.zip || restaurant.address?.pincode || "",
            },
            location: restaurant.location?.coordinates
              ? {
                  longitude: restaurant.location.coordinates[0],
                  latitude: restaurant.location.coordinates[1],
                }
              : { longitude: 0, latitude: 0 },
            paymentMethods: restaurant.paymentMethods || ["UPI", "Card", "Cash"],
            openingHours: restaurant.openingHours || formData.openingHours,
          });
          
          setExistingImages(restaurant.images || []);
        }
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
        alert("Failed to load restaurant data");
      }
    };

    fetchRestaurantData();
  }, [restaurantId]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleOpeningHoursChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: prev.openingHours.map((hour, i) =>
        i === index ? { ...hour, [field]: value } : hour
      ),
    }));
  };

  const handleSelectLocation = (locationDetails) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        street: locationDetails.street,
        city: locationDetails.city,
        state: locationDetails.state,
        pincode: locationDetails.zip,
      },
      location: {
        longitude: locationDetails.longitude,
        latitude: locationDetails.latitude,
      },
    }));
  };

  const handleFileUpload = (field, files) => {
    if (!files || files.length === 0) return;

    if (field === "galleryImages") {
      setUploadedFiles((prev) => ({
        ...prev,
        [field]: [...prev[field], ...Array.from(files)],
      }));
      setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
    } else {
      setUploadedFiles((prev) => ({
        ...prev,
        [field]: files[0],
      }));
    }
  };

  const removeFile = (field, index = null) => {
    if (field === "galleryImages" && index !== null) {
      setUploadedFiles((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    } else {
      setUploadedFiles((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleSave = async (scope = "all") => {
    if (!restaurantId) {
      alert("Please select a restaurant first");
      return;
    }

    setLoading(true);
    try {
      const newErrors = {};

      if (scope === "basic" || scope === "all") {
        if (!formData.name) newErrors.name = "Restaurant name is required";
        if (!formData.phone) newErrors.phone = "Phone number is required";
        if (!formData.email) newErrors.email = "Email is required";
      }

      if (scope === "location" || scope === "all") {
        if (!formData.address.street)
          newErrors.street = "Street address is required";
        if (!formData.address.city) newErrors.city = "City is required";
        if (!formData.address.pincode)
          newErrors.pincode = "Pincode is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      // Scope based API calls
      if (scope === "basic") {
        await updateRestaurantBasicInfo(restaurantId, formData);
      }

      if (scope === "location") {
        await updateRestaurantLocation(restaurantId, {
          address: formData.address,
          longitude: formData.location.longitude,
          latitude: formData.location.latitude,
        });
      }

      if (scope === "hours") {
        await updateRestaurantOpeningHours(
          restaurantId,
          formData.openingHours
        );
      }

      if (scope === "all") {
        // Basic info
        await updateRestaurantBasicInfo(restaurantId, formData);

        // Location
        await updateRestaurantLocation(restaurantId, {
          address: formData.address,
          longitude: formData.location.longitude,
          latitude: formData.location.latitude,
        });

        // Opening hours
        await updateRestaurantOpeningHours(
          restaurantId,
          formData.openingHours
        );
      }

      alert(`Restaurant "${formData.name}" updated successfully!`);
      setErrors({});
      
      // Call the update callback if provided
      if (onRestaurantUpdate) {
        onRestaurantUpdate();
      }
    } catch (error) {
      console.error("Error saving restaurant:", error);
      alert("Failed to save restaurant data");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (url) => {
    setExistingImages(prev => prev.filter(img => img !== url));
    setRemovedImages(prev => [...prev, url]);
  };

  const handleSaveImages = async () => {
    try {
      const formPayload = new FormData();

      // Add selected new images
      selectedFiles.forEach((file) => {
        formPayload.append("images", file);
      });

      // Add removed images if any
      formPayload.append("remove", JSON.stringify(removedImages));

      await updateRestaurantImages(restaurantId, formPayload);
      alert("Gallery updated successfully");

      // Reset state
      setSelectedFiles([]);
      setRemovedImages([]);
      
      // Refresh the data
      const response = await getRestaurantById(restaurantId);
      setExistingImages(response.data.images || []);
    } catch (error) {
      console.error("Failed to update images", error);
      alert("Failed to save gallery.");
    }
  };

  const FileUploadArea = ({
    field,
    label,
    accept = "*/*",
    multiple = false,
  }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
      <input
        ref={fileInputRefs[field]}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFileUpload(field, e.target.files)}
      />
      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-600 mb-2">{label}</p>
      <button
        type="button"
        onClick={() => fileInputRefs[field].current?.click()}
        className="bg-gray-800 hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-800 text-white px-4 py-2 rounded-md transition-colors"
      >
        Choose File{multiple ? "s" : ""}
      </button>
      {uploadedFiles[field] && (
        <div className="mt-4">
          {multiple ? (
            <div className="flex flex-wrap gap-2">
              {uploadedFiles[field].map((file, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-100 rounded-md px-3 py-1"
                >
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    onClick={() => removeFile(field, index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center bg-gray-100 rounded-md px-3 py-2">
              <span className="text-sm text-gray-700">
                {uploadedFiles[field].name}
              </span>
              <button
                onClick={() => removeFile(field)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const BasicInformationSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Restaurant Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`w-full px-3 py-2 border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Enter restaurant name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className={`w-full px-3 py-2 border ${
              errors.phone ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="+91 9876543210"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`w-full px-3 py-2 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="contact@restaurant.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Food Type *
          </label>
          <div className="relative">
            <select
              value={formData.foodType}
              onChange={(e) => handleInputChange("foodType", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              {foodTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Merchant Search Name
          </label>
          <input
            type="text"
            value={formData.merchantSearchName}
            onChange={(e) =>
              handleInputChange("merchantSearchName", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="spice-garden-thrissur"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Order Amount (₹)
          </label>
          <input
            type="number"
            value={formData.minOrderAmount}
            onChange={(e) =>
              handleInputChange("minOrderAmount", parseInt(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="250"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={() => handleSave("basic")}
          className="bg-gray-800 hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-800 text-white px-4 py-2 rounded transition"
        >
          Save Basic Information
        </button>
      </div>
    </div>
  );

  const LocationHoursSection = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <MapPin className="mr-2 h-5 w-5 text-blue-500" />
          Restaurant Address
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) =>
                handleInputChange("address.street", e.target.value)
              }
              className={`w-full px-3 py-2 border ${
                errors.street ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="123 MG Road"
            />
            {errors.street && (
              <p className="mt-1 text-sm text-red-600">{errors.street}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) =>
                handleInputChange("address.city", e.target.value)
              }
              className={`w-full px-3 py-2 border ${
                errors.city ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Thrissur"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <input
              type="text"
              value={formData.address.state}
              onChange={(e) =>
                handleInputChange("address.state", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kerala"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pincode *
            </label>
            <input
              type="text"
              value={formData.address.pincode}
              onChange={(e) =>
                handleInputChange("address.pincode", e.target.value)
              }
              className={`w-full px-3 py-2 border ${
                errors.pincode ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="680001"
            />
            {errors.pincode && (
              <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowLocationPicker(true)}
            className="bg-gray-800 hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-800 text-white px-3 py-1 rounded transition"
          >
            Change Location
          </button>
        </div>
        <button
          onClick={() => handleSave("location")}
          className="bg-gray-800 hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-800 text-white px-4 py-2 rounded transition mt-4"
        >
          Save Location
        </button>
        {showLocationPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg max-w-lg w-full relative">
              <button
                onClick={() => setShowLocationPicker(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              >
                ✖
              </button>
              <LocationPicker
                onSelectLocation={(locationDetails) => {
                  handleSelectLocation(locationDetails);
                  setShowLocationPicker(false);
                }}
                initialCoordinates={
                  formData.location.longitude !== 0 ? 
                  [formData.location.longitude, formData.location.latitude] : 
                  null
                }
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Clock className="mr-2 h-5 w-5 text-blue-500" />
          Opening Hours
        </h3>
        <div className="space-y-3">
          {formData.openingHours.map((hour, index) => (
            <div
              key={hour.day}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-20 font-medium text-gray-700">{hour.day}</div>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={hour.openingTime}
                  onChange={(e) =>
                    handleOpeningHoursChange(
                      index,
                      "openingTime",
                      e.target.value
                    )
                  }
                  disabled={hour.isClosed}
                  className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={hour.closingTime}
                  onChange={(e) =>
                    handleOpeningHoursChange(
                      index,
                      "closingTime",
                      e.target.value
                    )
                  }
                  disabled={hour.isClosed}
                  className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
                />
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={hour.isClosed}
                  onChange={(e) =>
                    handleOpeningHoursChange(
                      index,
                      "isClosed",
                      e.target.checked
                    )
                  }
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Closed</span>
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={() => handleSave("hours")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Save Opening Hours
          </button>
        </div>
      </div>
    </div>
  );

  const DocumentsPaymentsSection = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-blue-500" />
          Payment Methods
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {paymentOptions.map((method) => (
            <label
              key={method}
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.paymentMethods.includes(method)}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleInputChange("paymentMethods", [
                      ...formData.paymentMethods,
                      method,
                    ]);
                  } else {
                    handleInputChange(
                      "paymentMethods",
                      formData.paymentMethods.filter((m) => m !== method)
                    );
                  }
                }}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                {method}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FileText className="mr-2 h-5 w-5 text-blue-500" />
          KYC Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              FSSAI Certificate *
            </label>
            <FileUploadArea
              field="fssaiDoc"
              label="Upload FSSAI Certificate"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GST Document *
            </label>
            <FileUploadArea
              field="gstDoc"
              label="Upload GST Document"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aadhar Card *
            </label>
            <FileUploadArea
              field="aadharDoc"
              label="Upload Aadhar Document"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const MediaGallerySection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {existingImages.map((url, index) => (
          <div key={index} className="relative">
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className="w-32 h-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(url)}
              className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 hover:bg-opacity-80"
            >
              ✖
            </button>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gallery Images
        </label>
        <FileUploadArea
          field="galleryImages"
          label="Upload Multiple Images"
          accept=".jpg,.jpeg,.png"
          multiple={true}
        />
        <p className="text-sm text-gray-500 mt-2">
          Upload multiple images to showcase your restaurant and food items.
        </p>
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={handleSaveImages}
          className="bg-gray-800 hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-800 text-white px-4 py-2 rounded transition"
        >
          Save Gallery
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return <BasicInformationSection />;
      case "location":
        return <LocationHoursSection />;
      case "documents":
        return <DocumentsPaymentsSection />;
      case "media":
        return <MediaGallerySection />;
      default:
        return <BasicInformationSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Edit Restaurant</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSave("all")}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-900 hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-800 text-white rounded-md font-medium transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save All Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-gray-700 border-l-4 border-gray-900"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantEdit;