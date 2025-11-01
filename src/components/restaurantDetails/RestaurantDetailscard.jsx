import React from "react";
import burger from "../../assets/burger.png";
function RestaurantDetailscard({ restaurant }) {
  return (
    <div className="relative w-full h-[22em]  overflow-hidden shadow-lg">
      {/* Background Image */}
      <img
        src={restaurant.images ? restaurant.images[0] : burger}
        alt="Restaurant Banner"
        className="w-full h-full object-cover"
      />

      {/* Black overlay with restaurant info */}
      <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-6 text-white">
        <h1 className="text-3xl font-bold mb-4">{restaurant.name}</h1>
        <div className="flex gap-4 mb-4 text-sm">
          <button className="bg-transparent border border-white py-2 px-6 rounded-2xl font-semibold hover:bg-white hover:text-black transition">
            Delivery in 20-25 minutes
          </button>
          <button className="bg-transparent border border-white py-2 px-6 rounded-2xl font-semibold hover:bg-white hover:text-black transition">
            Min Order ₹{restaurant.minOrderAmount || 100}
          </button>
        </div>
        <p className="text-xs">Open until 3:00 AM</p>

        {/* Small white review card inside overlay */}
        <div className="absolute bottom-6 right-10 bg-white rounded-lg shadow-md px-2 text-black text-center hidden md:block">
          <h3 className=" mb-2 text-4xl font-semibold">3.4</h3>
          <h3>



             </h3>
            <h4>1360 reviews</h4>
        </div>
      </div>
    </div>
  );
}

export default RestaurantDetailscard;
