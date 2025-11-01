import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Search, Tag } from "lucide-react";
import axios from "axios";
import apiClient from "../../../apis/apiClient/apiClient";

function AssignOffer({ onAssignmentSuccess }) {
  const [restaurants, setRestaurants] = useState([]);
  const [offers, setOffers] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [selectedOffer, setSelectedOffer] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState({
    restaurants: false,
    offers: false,
    assigning: false
  });

  const fetchRestaurants = async () => {
    try {
      setLoading(prev => ({ ...prev, restaurants: true }));
      const res = await apiClient.get("/restaurants/all-restaurants");
      setRestaurants(res.data.restaurants || []);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError("Failed to load restaurants");
    } finally {
      setLoading(prev => ({ ...prev, restaurants: false }));
    }
  };

  const fetchOffers = async () => {
    try {
      setLoading(prev => ({ ...prev, offers: true }));
      const res = await apiClient.get("/admin/offer");
      setOffers(res.data.offers || []);
    } catch (err) {
      console.error("Error fetching offers:", err);
      setError("Failed to load offers");
    } finally {
      setLoading(prev => ({ ...prev, offers: false }));
    }
  };

  useEffect(() => {
    fetchRestaurants();
    fetchOffers();
  }, []);

  const handleAssign = async () => {
    if (!selectedRestaurant || !selectedOffer) {
      setError("Please select both a restaurant and an offer");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(prev => ({ ...prev, assigning: true }));

    try {

      const token = localStorage.getItem('adminToken');

      const response = await apiClient.put(
        `/merchant/restaurants/${selectedRestaurant}/offer/${selectedOffer}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess(response.data.message || "Offer status updated successfully");

      await apiClient.post("/admin/offers/assign", {
        restaurantId: selectedRestaurant,
        offerId: selectedOffer,
      });
      setSuccess("Offer assigned successfully");

      setSelectedRestaurant("");
      setSelectedOffer("");
      if (onAssignmentSuccess) onAssignmentSuccess(response.data.isAssigned);
    } catch (err) {
      console.error("Error toggling offer assignment:", err);
      const errorMessage = err.response?.data?.message || 
                         err.response?.statusText || 
                         "Failed to update offer status";
      setError(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, assigning: false }));
    }
  };

  const filteredOffers = offers.filter(offer =>
    offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 bg-[#f7f7f7] px-6 py-5 border-b">
        <div className="p-2 bg-orange-100 rounded-full">
          <Tag className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Assign Offer to Restaurant</h2>
          <p className="text-sm text-gray-500">Easily link available offers to restaurants</p>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-4 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200">
            <CheckCircle2 className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Select Restaurant</label>
            {loading.restaurants ? (
              <div className="w-full h-12 bg-gray-100 animate-pulse rounded-lg"></div>
            ) : (
              <select
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="w-full h-12 px-4 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Choose a restaurant...</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                    {restaurant.address?.city && ` (${restaurant.address.city})`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Select Offer</label>
            <div className="relative">
              <Search className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-10 pr-4 mb-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              {loading.offers ? (
                <div className="w-full h-12 bg-gray-100 animate-pulse rounded-lg"></div>
              ) : (
                <select
                  value={selectedOffer}
                  onChange={(e) => setSelectedOffer(e.target.value)}
                  className="w-full h-12 px-4 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Choose an offer...</option>
                  {filteredOffers.map((offer) => (
                    <option key={offer._id} value={offer._id}>
                      {offer.title} - {offer.discountValue}{offer.type === 'percentage' ? '%' : '$'} off
                      {offer.validTill && ` (till ${new Date(offer.validTill).toLocaleDateString()})`}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleAssign}
            disabled={loading.assigning || !selectedRestaurant || !selectedOffer}
            className={`px-6 py-3 bg-orange-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition-all duration-150 ${
              loading.assigning || !selectedRestaurant || !selectedOffer ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading.assigning ? 'Assigning...' : 'Assign Offer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignOffer;
