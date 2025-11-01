import { useState, useEffect } from "react";
import axios from "axios";
import apiClient from "../../../apis/apiClient/apiClient";
import { Search } from "lucide-react";
import LoadingForAdmins from "../AdminUtils/LoadingForAdmins";
import CreateOffer from "./CreateOffer";
import AssignOffer from "./AssignOffer";

const OfferPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState({
    restaurants: false,
    offers: false,
    assigning: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchOffers = async () => {
    try {
      const res = await apiClient.get("/admin/offer");
      setOffers(res.data || []); // The API returns the array directly
      console.log(res)
    } catch (err) {
      console.error("Error fetching offers:", err);
      setError("Failed to fetch offers");
    } finally {
      setLoading(false);
    }
  };

 
  useEffect(()=>{
    fetchRestaurants()
  },[])

  const fetchRestaurants = async () => {
    try {
      setLoading((prev) => ({ ...prev, restaurants: true }));
      const res = await apiClient.get("/restaurants/all-restaurants");
      const data = res.data.restaurants || [];
      setRestaurants(data);
      setFilteredRestaurants(data);
    } catch (err) {
      setError("Failed to load restaurants");
    } finally {
      setLoading((prev) => ({ ...prev, restaurants: false }));}}
      
  const handleDelete = async (offerId) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      try {
        await apiClient.delete(`/admin/offers/${offerId}`);
        setError("");
        fetchOffers();
      } catch (err) {
        console.error("Error deleting offer:", err);
        setError("Failed to delete offer");
      }
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    const filtered = restaurants.filter((r) =>
      r.name?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredRestaurants(filtered);
  };

  const fetchRestaurantOffers = async (restaurantId) => {
    try {
      setLoading((prev) => ({ ...prev, offers: true }));
      const res = await apiClient.get(`/merchant/restaurant/${restaurantId}/offer`);
      setOffers(res.data.offers || []);
    } catch (err) {
      setError("Failed to load offers");
    } finally {
      setLoading((prev) => ({ ...prev, offers: false }));
    }
  };

  const handleRestaurantClick = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    await fetchRestaurantOffers(restaurant._id);
    setShowModal(true);
  };

  const toggleOfferAssignment = async (offerId) => {
    if (!selectedRestaurant) return;
    setLoading((prev) => ({ ...prev, assigning: true }));
    setError("");
    setSuccess("");

    try {
      const res = await apiClient.put(
        `/merchant/restaurants/${selectedRestaurant._id}/offer/${offerId}`,
        {}
      );
      setSuccess(res.data.message);
      setOffers((prevOffers) =>
        prevOffers.map((offer) =>
          offer._id === offerId
            ? {
                ...offer,
                applicableRestaurants: res.data.offer.applicableRestaurants,
              }
            : offer
        )
      );
    } catch (err) {
      setError("Failed to toggle offer");
    } finally {
      setLoading((prev) => ({ ...prev, assigning: false }));
    }
  };

  const isAssigned = (offer) =>
    offer.applicableRestaurants?.includes(selectedRestaurant?._id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Offer Management</h2>
        <p className="text-sm text-gray-500">Click on a restaurant to manage offers</p>
      </div>

      <div className="mb-6 flex items-center space-x-3">
        <Search className="text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search restaurants..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      )}

      {loading.restaurants ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredRestaurants.map((r) => (
            <div
              key={r._id}
              onClick={() => handleRestaurantClick(r)}
              className="border rounded-xl overflow-hidden shadow hover:shadow-lg cursor-pointer transition"
            >
              {r.images?.[0] && (
                <img
                  src={r.images[0]} 
                  alt={r.name}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold">{r.name}</h3>
                {r.address && (
                  <p className="text-sm text-gray-500">
                    {[r.address.street, r.address.city, r.address.state]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                <p className="text-xs text-orange-600 mt-2">Tap to manage offers</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="bg-white w-full max-w-2xl rounded-lg overflow-hidden shadow-lg">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">
                Manage Offers - {selectedRestaurant?.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Toggle offers on/off for this restaurant.
              </p>

              {success && (
                <div className="bg-green-100 border border-green-300 text-green-800 p-3 rounded mb-4">
                  {success}
                </div>
              )}

              {loading.offers ? (
                <div className="flex justify-center items-center h-20">
                  <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-orange-500 rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {offers.map((offer) => (
                    <div
                      key={offer._id}
                      className="flex items-center justify-between border px-4 py-3 rounded"
                    >
                      <div>
                        <h4 className="font-medium">{offer.title}</h4>
                        <p className="text-sm text-gray-500">{offer.description}</p>
                        <p className="text-xs text-gray-400">
                          Valid: {new Date(offer.validFrom).toLocaleDateString()} -{" "}
                          {new Date(offer.validTill).toLocaleDateString()}
                        </p>
                      </div>
                      <label className="inline-flex relative items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isAssigned(offer)}
                          onChange={() => toggleOfferAssignment(offer._id)}
                          disabled={loading.assigning}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:bg-orange-600 after:content-[''] after:absolute after:left-[4px] after:top-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-100 px-4 py-3 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-white border rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferPage;
