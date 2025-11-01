import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import RestaurantDetailscard from "../../components/restaurantDetails/RestaurantDetailscard";
import CategorySection from "../../components/restaurantDetails/CategorySection";
import { getRestaurantById, getRestaurantMenu } from "../../apis/restaurantApi";

function RestaurantDetails() {
  const { restaurantId } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

useEffect(() => {
  const fetchRestaurantData = async () => {
    try {
      console.log("🍽️ Starting fetch for", restaurantId);

      // Fetch restaurant details first
      const restaurantRes = await getRestaurantById(restaurantId);
      console.log("✅ Fetched restaurant:", restaurantRes);
      setRestaurant(restaurantRes.data);

      // Then fetch menu data
      const menuRes = await getRestaurantMenu(restaurantId);
      console.log("✅ Fetched menu:", menuRes.data);
      setMenu(menuRes.data);

    } catch (error) {
      console.error("❌ Error fetching restaurant details or menu:", error);
    } finally {
      console.log("🍴 Done fetching, setting loading false");
      setLoading(false);
    }
  };

  fetchRestaurantData();
}, [restaurantId]);
  return (
    <div>
      <Navbar />

      {/* Restaurant Card */}
      {restaurant? (
        <RestaurantDetailscard
  restaurant={
    restaurant || {
      name: "The Burger Hub",
      minOrderAmount: 150,
      openingHours: "10:00 AM - 11:00 PM",
      images: [],
      rating: 4.2,
      address: "123, MG Road, Delhi",
    }
  }
/>
      ) : (
        <p className="text-center py-10 text-lg font-semibold">Loading restaurant details...</p>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between px-10 py-4 max-md:flex-col">
        <p className="text-xl font-bold max-md:mb-4">
          All Offers from {restaurant?.name || "this restaurant"}
        </p>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search from menu..."
          className="pl-4 pr-10 py-2 border-black border outline-none rounded-2xl"
        />
      </div>

      {/* Categories */}
      <div className="bg-[#EA4424] w-full flex flex-row gap-2 justify-center overflow-x-auto whitespace-nowrap px-2 py-4">
        {(menu?.length > 0 ? menu?.map((category, index) => (
          <button
            key={index}
            className="text-white font-bold py-2 px-6 rounded-full whitespace-nowrap hover:bg-black hover:text-[#EA4424] transition"
          >
            {category.categoryName}
          </button>
        )) : (
          <button className="text-white font-bold py-2 px-6 rounded-full whitespace-nowrap bg-black">
            No Categories
          </button>
        ))}
      </div>

      {/* Menu */}
      <div className="px-4  mx-auto ">
        {loading ? (
          <p className="text-center py-10 text-lg font-semibold">Loading menu...</p>
        ) : menu?.length === 0 ? (
          <p className="text-center py-10 text-lg font-semibold">No menu available.</p>
        ) : (
          menu
            ?.filter((category) =>
              category.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((category) => (
              <div className=" flex flex-col justify-center items-center">
              <CategorySection key={category.categoryId} category={category} restaurantId={restaurantId}  />
                </div>

            ))
        )}
      </div>
    </div>
  );
}

export default RestaurantDetails;
