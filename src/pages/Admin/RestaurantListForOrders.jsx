import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, ChevronRight, ShoppingBag, Utensils, Star, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../apis/apiClient/apiClient";

const RestaurantListForOrders = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await apiClient.get(
          "/admin/restaurant/approved/list"
        );
        const formattedRestaurants = res.data.data.map((restaurant) => ({
          id: restaurant._id,
          name: restaurant.name,
          street: restaurant.address?.street || "",
          city: restaurant.address?.city || "",
          state: restaurant.address?.state || "",
          zip: restaurant.address?.zip || "",
          cuisine: restaurant.cuisine || "",
          rating: restaurant.rating || 0,
          orderCount: restaurant.orders?.length || 0,
        }));

        setRestaurants(formattedRestaurants);
        setFilteredRestaurants(formattedRestaurants);
        setLoading(false);
        // console.log(res)
      } catch (err) {
        setError("Failed to fetch restaurants");
        console.error("Error fetching restaurants:", err);
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const formatAddress = ({ street, city, state, zip }) => {
    return `${street}, ${city}, ${state} ${zip}`;
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === "") {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter((restaurant) => {
        const fullAddress = formatAddress(restaurant).toLowerCase();
        return (
          restaurant.name.toLowerCase().includes(term) ||
          restaurant.cuisine.toLowerCase().includes(term) ||
          fullAddress.includes(term)
        );
      });
      setFilteredRestaurants(filtered);
    }
  };

  
  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurants/${restaurantId}/orders`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center max-w-md bg-white p-6 rounded-xl shadow-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{error}</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <Utensils className="w-6 h-6 mr-2 text-orange-500" />
            Restaurant Orders
          </h1>
          <p className="text-gray-500 mt-1">
            Manage and view orders from all restaurants
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            placeholder="Search restaurants by name, cuisine or address..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {/* Stats Card */}
        <div className="bg-orange-500 rounded-xl shadow-xs mb-6 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Total Restaurants</h3>
              <p className="text-2xl font-bold">{restaurants.length}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Restaurants List */}
        <div className="space-y-3">
          {filteredRestaurants.length > 0 ? (
            filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl shadow-xs overflow-hidden cursor-pointer hover:shadow-sm transition-shadow border border-gray-100"
                onClick={() => handleRestaurantClick(restaurant.id)}
              >
                <div className="p-4 sm:p-5 flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                      {restaurant.name}
                    </h2>
                    <div className="mt-2 flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-gray-600">
                      <span className="inline-flex items-center bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                        <Utensils className="w-3 h-3 mr-1" />
                        {restaurant.cuisine}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate max-w-xs">
                        {formatAddress(restaurant)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center ml-4">
                    <div className="text-right mr-3">
                      <div className="flex items-center justify-end text-amber-500">
                        <Star className="w-4 h-4 fill-current mr-0.5" />
                        <span className="font-medium">{restaurant.rating}</span>
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        {restaurant.orders} {restaurant.orderCount === 1 ? "order" : "orders"}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-xs border border-gray-100">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                No restaurants found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm
                  ? "No restaurants match your search. Try different keywords."
                  : "There are currently no restaurants available."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantListForOrders;