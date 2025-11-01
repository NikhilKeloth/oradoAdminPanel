import React from "react";
import { Link } from "react-router-dom";

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link  to={`/restaurant/details/${restaurant._id}`}>
    <div className="min-w-[260px] max-w-[260px] bg-white rounded-2xl shadow-md overflow-hidden hover:scale-105 transition-all cursor-pointer">
      <img
        src={restaurant.images[0] || "https://via.placeholder.com/260x160"}
        alt={restaurant.name}
        className="w-full h-40 object-cover"
      />
      <div className="p-3">
        <h3 className="text-lg font-semibold mb-1 truncate">{restaurant.name}</h3>
        <div className="flex items-center text-sm text-gray-500 mb-1">
          ⭐ {restaurant.rating || "New"} • {restaurant.foodType}
        </div>
        <div className="text-xs text-gray-600">⏰ {restaurant.openingHours || "10 AM - 10 PM"}</div>
        <div className="text-xs text-gray-600 mt-1">💵 ₹{restaurant.minOrderAmount} Min Order</div>
        <div className="text-xs text-gray-600 mt-1">
          📍 {restaurant.distance ? `${(restaurant.distance / 1000).toFixed(1)} km` : "Nearby"}
        </div>
      </div>
    </div>
        </Link>
  );
};

export default RestaurantCard;
