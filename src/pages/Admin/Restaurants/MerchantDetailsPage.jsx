import React, { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, ChevronDown } from "lucide-react";
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
import MapComponent from "./Mapcomponent";
const MerchantDetailsPage = () => {
  const [deliveryMode, setDeliveryMode] = useState(
    "Home delivery/Pick And Drop"
  );
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

  useEffect(() => {
    const getMerchantDetails = async () => {
      try {
        const data = await fetchSingleRestaurantDetails(id);
        setMerchant(data);
        setImages(data.images || []);
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
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsProfileSaving(true);

    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      phone: `+91${e.target.phone.value}`,
      address: {
        street: e.target.street.value,
        city: e.target.city.value,
        state: e.target.state.value,
        zip: e.target.zip.value,
      },
      // Add other fields as needed
    };

    try {
      const response = await updateRestaurantProfile(
        merchant._id,
        formData,
        filesToUpload,
        filesToRemove
      );

      if (response.success) {
        alert("Restaurant profile updated successfully!");
        // Refresh data
        const updatedData = await fetchSingleRestaurantDetails(id);
        setMerchant(updatedData);
        setImages(updatedData.images || []);
        setFilesToUpload([]);
        setFilesToRemove([]);
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update restaurant profile. Please try again.");
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleServingAreaSubmit = async (e) => {
    e.preventDefault();
    // Add your serving area submission logic here
    alert("Serving area settings saved!");
  };

  const handleSponsorshipSubmit = async (e) => {
    e.preventDefault();
    // Add your sponsorship submission logic here
    alert("Sponsorship settings saved!");
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
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="container mx-auto px-4 py-8">No merchant data found.</div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Top Navigation Bar */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-8">
            <li>
              <Link
                to={`/admin/dashboard/merchants/merchant-config/${id}`}
                className={`px-4 py-3 block ${
                  location.pathname ===
                  `/admin/dashboard/merchants/merchant-config/${id}`
                    ? "border-b-2 border-orange-500 text-orange-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                Configurations
              </Link>
            </li>
            <li>
              <Link
                to={`/admin/dashboard/merchants/merchant-catelogue/${id}`}
                className={`px-4 py-3 block ${
                  location.pathname ===
                  `/admin/dashboard/merchants/merchant-catelogue/${id}`
                    ? "border-b-2 border-orange-500 text-orange-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                Catalogue
              </Link>
            </li>
            <li>
              <Link
                to={`/admin/dashboard/merchants/merchant-details/${id}`}
                className={`px-4 py-3 block ${
                  location.pathname ===
                  `/admin/dashboard/merchants/merchant-details/${id}`
                    ? "border-b-2 border-orange-500 text-orange-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                Merchant
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Page Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-orange-500"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-lg font-medium">Merchant</span>
          </button>
        </div>
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">
            {merchant.name || "Restaurant Name"}
          </h1>
          <ExternalLink className="h-5 w-5 ml-2 text-gray-500 hover:text-orange-500 cursor-pointer" />
        </div>
      </div>

      {/* Merchant Edit Form */}
      <div className="container mx-auto px-4 pb-8">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Restaurant Profile</h2>

          <form onSubmit={handleProfileSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* ID Field */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID
                </label>
                <div className="bg-gray-100 px-3 py-2 rounded-md text-gray-700">
                  {merchant._id || "N/A"}
                </div>
              </div>

              {/* Name Field */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NAME <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter name"
                  defaultValue={merchant.name || ""}
                  required
                />
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter email"
                  defaultValue={merchant.email || ""}
                  required
                />
              </div>

              {/* Phone Field */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <select className="w-1/4 border border-gray-300 rounded-l-md px-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option>+91</option>
                    <option>+971</option>
                    <option>+1</option>
                  </select>
                  <input
                    name="phone"
                    type="tel"
                    className="w-3/4 px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter phone"
                    defaultValue={
                      merchant.phone ? merchant.phone.replace("+91", "") : ""
                    }
                    required
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="form-group col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="street"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter street"
                    defaultValue={merchant.address?.street || ""}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* City Field */}
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="city"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter city"
                      defaultValue={merchant.address?.city || ""}
                      required
                    />
                  </div>

                  {/* State Field */}
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="state"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter state"
                      defaultValue={merchant.address?.state || ""}
                      required
                    />
                  </div>
                </div>

                {/* Zip Code Field */}
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="zip"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter zip code"
                    defaultValue={merchant.address?.zip || ""}
                    required
                  />
                </div>
{/* Location Coordinates Section */}
<div className="form-group mt-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Location Coordinates
  </label>

  <div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-xs text-gray-600 mb-1">Latitude</label>
    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
      {merchant?.location?.coordinates?.[1] ?? "—"}
    </div>
  </div>

  <div>
    <label className="block text-xs text-gray-600 mb-1">Longitude</label>
    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
      {merchant?.location?.coordinates?.[0] ?? "—"}
    </div>
  </div>
</div>

  {/* Optional: Map Preview */}
  <div className="mt-3 border rounded-md h-64">

   <MapComponent
  latitude={merchant?.location?.coordinates?.[1] || 0}
  longitude={merchant?.location?.coordinates?.[0] || 0}
  onSave={({ longitude, latitude }) => {
    console.log("New coords saved:", longitude, latitude);
    // update form state or call API to save to DB
    setFormData({
      ...formData,
      location: { type: "Point", coordinates: [longitude, latitude] },
    });
  }}
/>



    {/* <MapComponent
      latitude={merchant?.location?.coordinates?.[1] || 0}
      longitude={merchant?.location?.coordinates?.[0] || 0}
      onMarkerDrag={(lng, lat) => {
        // optional: update input fields live
        console.log("Marker moved to:", lng, lat);
      }}
    /> */}
  </div>
</div>




                <div className="relative ">
                  <input
                    type="text"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter address"
                    defaultValue={merchant.address?.street || ""}
                  />
                  <button className="absolute right-2 top-2">
                    <img
                      src="/assets/images/aim@3x.png"
                      alt="Map"
                      className="h-6 w-6"
                    />
                  </button>
                </div>
              </div>

              {/* Display Address Field */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Address <span className="text-red-500">*</span>
                  <span
                    className="ml-1 text-gray-400"
                    title="multilingual_field"
                  >
                    <i className="material-icons text-sm">translate</i>
                  </span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter Display Address"
                  defaultValue={merchant.address?.street || ""}
                />
              </div>

              {/* Store Name Field */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store NAME <span className="text-red-500">*</span>
                  <span
                    className="ml-1 text-gray-400"
                    title="multilingual_field"
                  >
                    <i className="material-icons text-sm">translate</i>
                  </span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter Store name"
                  defaultValue={merchant.name || ""}
                />
              </div>

              {/* Description Field */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Max 360 Characters)
                  <span
                    className="ml-1 text-gray-400"
                    title="multilingual_field"
                  >
                    <i className="material-icons text-sm">translate</i>
                  </span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter Description"
                />
              </div>

              {/* Media Gallery */}
              <div className="form-group col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                  <div className="flex flex-col items-center">
                    {images.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 w-full">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Restaurant ${index + 1}`}
                              className="h-24 w-full object-cover rounded-md"
                            />
                            <button
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveImage(index)}
                              type="button"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <img
                          src="/assets/images/add_cat_dummy.svg"
                          alt="Add images"
                          className="h-10 w-10 mb-2"
                        />
                        <p className="text-sm text-gray-500">
                          No images uploaded yet
                        </p>
                      </>
                    )}
                  </div>
                  <div className="mt-4">
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
                      className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Upload Images
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Upload multiple images at once (JPG, PNG, etc.)
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked={merchant.active}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              {/* Food Type */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food Type
                </label>
                <div className="bg-gray-100 px-3 py-2 rounded-md text-gray-700 capitalize">
                  {merchant.foodType || "N/A"}
                </div>
              </div>
            </div>

            {/* Profile Form Actions */}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-orange-300"
                disabled={isProfileSaving}
              >
                {isProfileSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Serving Area Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Serving Area</h2>

          {serviceAreas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No Service Areas Found
              </h3>
              <p className="text-gray-500 mb-6">
                This restaurant doesn't have any service areas yet.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gray-950 bg-gradient-to-r hover:from-gray-700 hover:to-gray-900 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Service Area
                </span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <div>
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                  }}
                  className="bg-gray-950 bg-gradient-to-r hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Edit Area
                </button>
              </div>
              {serviceAreas.map((area, index) => (
                <div
                  key={area._id || index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="h-96">
                    {serviceAreas.map((area) => (
                      <PolygonMap
                        key={area._id}
                        serviceArea={area} // pass the whole object
                        restaurantLocation={merchant?.location?.coordinates}
                        restaurantName={merchant?.name}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <AddServiceModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
            }}
            restaurantId={id} // Or .id if that's your key
            onServiceAdded={() => {
              fetchServiceAreas();
              setIsModalOpen(false);
            }}
            restaurantLocation={merchant?.location?.coordinates} // [lng, lat]
            restaurantName={merchant?.name}
          />
        </div>

        {/* Sponsorship Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Sponsorship</h2>

          <form onSubmit={handleSponsorshipSubmit}>
            <div className="flex items-center mb-4">
              <label className="text-lg font-semibold text-gray-800 mr-2">
                Enable Sponsorship
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <div className="form-group">
              <label className="text-md font-medium text-gray-700 mb-2">
                Sponsorship Dates
              </label>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left font-normal text-gray-600 pb-2">
                        Date Range
                      </th>
                      <th className="text-left font-normal text-gray-600 pb-2">
                        Start Time
                      </th>
                      <th className="text-left font-normal text-gray-600 pb-2">
                        End Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 pr-5">
                        <input
                          type="text"
                          placeholder="mm/dd/yyyy - mm/dd/yyyy"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          readOnly
                        />
                      </td>
                      <td className="py-2 pr-5">
                        <input
                          type="time"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="HH:MM"
                        />
                      </td>
                      <td className="py-2 pr-5">
                        <input
                          type="time"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="HH:MM"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="sorting"
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="sorting" className="ml-2 text-gray-700">
                  Do you want sorting?
                </label>
              </div>
            </div>

            {/* Sponsorship Form Actions */}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Save Sponsorship Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MerchantDetailsPage;
