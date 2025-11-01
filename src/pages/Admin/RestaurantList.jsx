import React, { useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Wallet,
  Heart,
  Shield,
  Zap,
  Search,
  Filter,
  ChevronDown,
  Truck,
  Timer,
  Percent,
  X,
  Edit,
  Image as ImageIcon,
  Save,
  Loader2,
} from "lucide-react";
import axios from "axios";
import LoadingForAdmins from "./AdminUtils/LoadingForAdmins";
import apiClient from "../../apis/apiClient/apiClient";

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await apiClient.get("/restaurants/all-restaurants");
        setRestaurants(res.data.restaurants || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch restaurants");
        console.error("Error fetching restaurants:", err);
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - (editFormData.images?.length || 0) - newImages.length;
    const filesToAdd = files.slice(0, remainingSlots);
    setNewImages((prev) => [...prev, ...filesToAdd]);
  };

  const handleRemoveImage = (index, isNew) => {
    if (isNew) {
      setNewImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const imageToDelete = editFormData.images[index];
      setDeletedImages((prev) => [...prev, imageToDelete]);
      setEditFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisines?.some((cuisine) =>
        cuisine.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "veg")
      return (
        matchesSearch &&
        (restaurant.foodType === "veg" || restaurant.foodType === "both")
      );
    if (selectedFilter === "non-veg")
      return (
        matchesSearch &&
        (restaurant.foodType === "non-veg" || restaurant.foodType === "both")
      );
    if (selectedFilter === "offers") return matchesSearch && restaurant.offer;

    return matchesSearch;
  });

  const handleEditClick = (restaurant) => {
    setEditingRestaurant(restaurant);
    setEditFormData({
      name: restaurant.name,
      phone: restaurant.phone,
      minOrderAmount: restaurant.minOrderAmount,
      foodType: restaurant.foodType,
      address: {
        street: restaurant.address.street,
        city: restaurant.address.city,
      },
      deliveryTime: restaurant.deliveryTime,
      offer: restaurant.offer || "",
      cuisines: restaurant.cuisines?.join(", ") || "",
      autoOnOff: restaurant.autoOnOff,
      images: restaurant.images || [],
    });
    setNewImages([]);
    setDeletedImages([]);
    setEditError(null);
    setEditSuccess(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setEditFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const token = localStorage.getItem("adminToken");

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEditError(null);

    try {
      const formData = new FormData();

      // Append all form data
      formData.append("name", editFormData.name);
      formData.append("phone", editFormData.phone);
      formData.append("minOrderAmount", editFormData.minOrderAmount);
      formData.append("foodType", editFormData.foodType);
      formData.append("address", JSON.stringify(editFormData.address));
      formData.append("deliveryTime", editFormData.deliveryTime);
      formData.append("offer", editFormData.offer || "");
      formData.append("cuisines", editFormData.cuisines.split(",").map(item => item.trim()).filter(item => item));
      formData.append("autoOnOff", editFormData.autoOnOff);
      
      // Append new images
      newImages.forEach((image) => {
        formData.append("images", image);
      });

      // Append deleted images
      if (deletedImages.length > 0) {
        formData.append("deletedImages", JSON.stringify(deletedImages));
      }

      const res = await apiClient.put(
        `/admin/edit/restaurant/${editingRestaurant._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update UI with the returned restaurant data
      const updatedRestaurant = res.data.restaurant;
      const updatedRestaurants = restaurants.map((r) =>
        r._id === updatedRestaurant._id ? updatedRestaurant : r
      );
      setRestaurants(updatedRestaurants);

      setEditSuccess(true);
      setTimeout(() => {
        setEditingRestaurant(null);
        setEditSuccess(false);
        setNewImages([]);
        setDeletedImages([]);
      }, 2000);
    } catch (err) {
      console.error("Error updating restaurant:", err);
      setEditError(
        err.response?.data?.message || "Failed to update restaurant"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingForAdmins />;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b top-0 sticky z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for restaurants, dishes or cuisines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b top-20 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-4 overflow-x-auto">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === "all"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Restaurants
            </button>
            <button
              onClick={() => setSelectedFilter("offers")}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                selectedFilter === "offers"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Percent className="h-4 w-4 mr-1" />
              Offers
            </button>
            <button
              onClick={() => setSelectedFilter("veg")}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                selectedFilter === "veg"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Pure Veg
            </button>
            <button
              onClick={() => setSelectedFilter("non-veg")}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                selectedFilter === "non-veg"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Non-Veg
            </button>
            <button className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No restaurants found
            </h2>
            <p className="text-gray-600">
              Try searching with different keywords or clear your filters
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {filteredRestaurants.length} restaurants delivering to you
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Sort by:</span>
                <select className="border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>Relevance</option>
                  <option>Delivery Time</option>
                  <option>Rating</option>
                  <option>Cost: Low to High</option>
                  <option>Cost: High to Low</option>
                </select>
              </div>
            </div>

            {/* Restaurant Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <div
                  key={restaurant._id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group relative"
                >
                  <button
                    onClick={() => handleEditClick(restaurant)}
                    className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-100"
                    title="Edit Restaurant"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>

                  <div className="relative overflow-hidden">
                    <img
                      src={
                        restaurant.images?.[0] ||
                        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop"
                      }
                      alt={restaurant.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {restaurant.offer && (
                      <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {restaurant.offer}
                      </div>
                    )}

                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 hover:fill-red-500 transition-colors" />
                    </div>

                    <div className="absolute bottom-3 left-3">
                      {restaurant.autoOnOff ? (
                        <div className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center shadow-lg">
                          <Zap className="h-3 w-3 mr-1" />
                          OPEN
                        </div>
                      ) : (
                        <div className="bg-gray-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg">
                          CLOSED
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        <Star className="h-3 w-3 fill-white mr-1" />
                        {restaurant.rating}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                      {restaurant.cuisines?.join(", ") || "Multi-cuisine"}
                    </p>

                    <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
                      <div className="flex items-center">
                        <Timer className="h-4 w-4 text-orange-500 mr-1" />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 text-orange-500 mr-1" />
                        <span>{restaurant.distance}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {restaurant.foodType === "veg" && (
                        <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full flex items-center border border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          Veg
                        </span>
                      )}
                      {restaurant.foodType === "non-veg" && (
                        <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full flex items-center border border-red-200">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                          Non-Veg
                        </span>
                      )}
                      {restaurant.foodType === "both" && (
                        <>
                          <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full flex items-center border border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            Veg
                          </span>
                          <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full flex items-center border border-red-200">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                            Non-Veg
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-100">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-orange-500 mr-1" />
                        <span>₹{restaurant.minOrderAmount} minimum</span>
                      </div>
                    
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">🍽️ Hungry? You're in the right place!</p>
            <p className="text-sm">
              Order from your favorite restaurants and get it delivered fresh to
              your door.
            </p>
          </div>
        </div>
      </footer>

      {/* Edit Restaurant Modal */}
      {editingRestaurant && (
        <div className="fixed inset-0  bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky z-100 top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-6 flex justify-between items-center rounded-t-3xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L10 4.414l8.293 8.293a1 1 0 001.414-1.414l-9-9z" />
                    <path d="M17 11h-1V8a1 1 0 00-1-1H5a1 1 0 00-1 1v3H3a1 1 0 000 2h1v4a1 1 0 001 1h10a1 1 0 001-1v-4h1a1 1 0 100-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Edit Restaurant</h3>
                  <p className="text-orange-100 text-sm">
                    Update restaurant information
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingRestaurant(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-8 space-y-8">
              {editSuccess && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Restaurant updated successfully!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {editError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {editError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Information Section */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L10 4.414l8.293 8.293a1 1 0 001.414-1.414l-9-9z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="Enter restaurant name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleEditFormChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                        placeholder="+91 12345 67890"
                        required
                      />
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Restaurant Images (Max 5)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                      {editFormData.images?.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Restaurant ${index}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index, false)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {newImages.map((image, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`New image ${index}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index, true)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {(editFormData.images?.length + newImages.length) < 5 && (
                      <div className="relative">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          id="restaurant-images"
                        />
                        <label
                          htmlFor="restaurant-images"
                          className="block border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-orange-400 transition-colors cursor-pointer"
                        >
                          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            Click to upload images
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            JPG, PNG (5MB max each)
                          </p>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Location Details
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={editFormData.address.street}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="Enter street address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={editFormData.address.city}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="Enter city name"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Business Details Section */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Business Details
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Minimum Order (₹)
                    </label>
                    <input
                      type="number"
                      name="minOrderAmount"
                      value={editFormData.minOrderAmount}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="100"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Delivery Time
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="deliveryTime"
                        value={editFormData.deliveryTime}
                        onChange={handleEditFormChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                        placeholder="30-45 mins"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Food Type
                    </label>
                    <select
                      name="foodType"
                      value={editFormData.foodType}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm appearance-none"
                      required
                    >
                      <option value="veg">🥬 Vegetarian</option>
                      <option value="non-veg">🍖 Non-Vegetarian</option>
                      <option value="both">🍽️ Both Veg & Non-Veg</option>
                    </select>
                  </div>
                </div>
              </div>

           
              {/* Cuisine & Status Section */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-2xl p-6 border border-yellow-200">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Cuisine & Status
                  </h4>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Cuisines
                    </label>
                    <input
                      type="text"
                      name="cuisines"
                      value={editFormData.cuisines}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="Italian, Chinese, Indian, Continental"
                      required
                    />
                    <p className="text-xs text-gray-600 mt-2 flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Separate multiple cuisines with commas
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center p-4 border-2 border-dashed border-yellow-300 rounded-xl hover:border-yellow-400 hover:bg-white transition-all duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        name="autoOnOff"
                        checked={editFormData.autoOnOff}
                        onChange={handleEditFormChange}
                        className="h-6 w-6 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                      />
                      <div className="ml-4">
                        <span className="text-lg font-semibold text-gray-900 flex items-center">
                          🏪 Restaurant is Open
                        </span>
                        <p className="text-sm text-gray-600">
                          Enable to accept new orders and go live
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingRestaurant(null)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantList;
