import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Star, Clock, MapPin, Users, ChevronRight, Eye } from "lucide-react";
import LoadingForAdmins from "../AdminUtils/LoadingForAdmins";
import apiClient from "../../../apis/apiClient/apiClient";

function RestaurantListforReviews() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/feedback/restaurants/${restaurantId}`);
  };

  if (loading) {
    return (
     <LoadingForAdmins/>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠</div>
          <p className="text-gray-800 font-medium text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Restaurant Reviews Management
              </h1>
              <p className="text-gray-600">
                Click on any restaurant to view and manage reviews
              </p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-blue-700 font-semibold text-sm">
                {restaurants.length} Restaurants
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant List */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {restaurants.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">🏪</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No Restaurants Found
              </h3>
              <p className="text-gray-500">
                No restaurants available for review management.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant._id}
                  onClick={() => handleRestaurantClick(restaurant._id)}
                  className="flex items-center p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-200 group"
                >
                  {/* Restaurant Image */}
                  <div className="flex-shrink-0 mr-6">
                    <img
                      src={restaurant.images?.[0] || "/api/placeholder/80/80"}
                      alt={restaurant.name}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-gray-100 group-hover:border-blue-200 transition-colors"
                    />
                  </div>

                  {/* Restaurant Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                          {restaurant.name}
                        </h3>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                            {/* <span className="truncate max-w-xs">
                              {restaurant.address || "Address not available"}
                            </span> */}
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-500">•</span>
                            <span className="ml-1">{restaurant.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            {(restaurant.cuisine || ["Multi Cuisine"])
                              .slice(0, 2)
                              .map((cuisine, idx) => (
                                <span
                                  key={idx}
                                  className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium"
                                >
                                  {cuisine}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center space-x-6 ml-6">
                        <div className="flex items-center">
                          <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium group-hover:bg-blue-600">
                            <Eye className="w-4 h-4 mr-2" />
                            View Reviews
                          </button>
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-2 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {restaurants.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {restaurants.length}
                </div>
                <p className="text-gray-600">Total Restaurants</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {restaurants.reduce(
                    (sum, r) => sum + (r.totalReviews || 0),
                    0
                  )}
                </div>
                <p className="text-gray-600">Total Reviews</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {(
                    restaurants.reduce(
                      (sum, r) => sum + (r.avgRating || 4.0),
                      0
                    ) / restaurants.length
                  ).toFixed(1)}
                </div>
                <p className="text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RestaurantListforReviews;
