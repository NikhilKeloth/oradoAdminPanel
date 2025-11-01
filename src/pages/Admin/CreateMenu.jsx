import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiClient from '../../apis/apiClient/apiClient';

const CreateMenu = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const navigate = useNavigate();

  

  useEffect(() => {
     const fetchRestaurants = async () => {
       try {
         const res = await apiClient.get('/restaurants/all-restaurants');
         setRestaurants(res.data.restaurants || []);
         setLoading(false);
       } catch (err) {
         setError('Failed to fetch restaurants');
         console.error('Error fetching restaurants:', err);
         setLoading(false);
       }
     };
 
     fetchRestaurants();
   }, []);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisines?.some(cuisine => cuisine.toLowerCase().includes(searchTerm.toLowerCase()));

    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'veg') return matchesSearch && (restaurant.foodType === 'veg' || restaurant.foodType === 'both');
    if (selectedFilter === 'non-veg') return matchesSearch && (restaurant.foodType === 'non-veg' || restaurant.foodType === 'both');
    if (selectedFilter === 'offers') return matchesSearch && restaurant.offer;

    return matchesSearch;
  });

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurants/${restaurantId}/categories`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Loading Cards */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Search Bar */}
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
      <div className="bg-white border-b sticky top-20 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-4 overflow-x-auto">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Restaurants
            </button>
            <button
              onClick={() => setSelectedFilter('offers')}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                selectedFilter === 'offers'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Percent className="h-4 w-4 mr-1" />
              Offers
            </button>
            <button
              onClick={() => setSelectedFilter('veg')}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                selectedFilter === 'veg'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Pure Veg
            </button>
            <button
              onClick={() => setSelectedFilter('non-veg')}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                selectedFilter === 'non-veg'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No restaurants found</h2>
            <p className="text-gray-600">Try searching with different keywords or clear your filters</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
               ( {filteredRestaurants.length}) Click restaurants To add catagorys and Items
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
                  onClick={() => handleRestaurantClick(restaurant._id)}
                >
                  {/* Restaurant Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={restaurant.images[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'}
                      alt={restaurant.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Offer Badge */}
                    {restaurant.offer && (
                      <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {restaurant.offer}
                      </div>
                    )}

                    {/* Favorite Button */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 hover:fill-red-500 transition-colors" />
                    </div>

                    {/* Status Badge */}
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

                  {/* Restaurant Info */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{restaurant.name}</h3>
                      <div className="flex items-center bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        <Star className="h-3 w-3 fill-white mr-1" />
                        {restaurant.rating}
                      </div>
                    </div>

                    {/* Cuisines */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                      {restaurant.cuisines?.join(', ') || 'Multi-cuisine'}
                    </p>

                    {/* Delivery Info */}
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

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {restaurant.foodType === 'veg' && (
                        <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full flex items-center border border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          Veg
                        </span>
                      )}
                      {restaurant.foodType === 'non-veg' && (
                        <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full flex items-center border border-red-200">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                          Non-Veg
                        </span>
                      )}
                      {restaurant.foodType === 'both' && (
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

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-100">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-orange-500 mr-1" />
                        <span>₹{restaurant.minOrderAmount} minimum</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {restaurant.paymentMethods.includes('online') && (
                          <CreditCard className="h-4 w-4 text-blue-500" />
                        )}
                        {restaurant.paymentMethods.includes('cash') && (
                          <Wallet className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">🍽️ Hungry? You're in the right place!</p>
            <p className="text-sm">Order from your favorite restaurants and get it delivered fresh to your door.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CreateMenu;