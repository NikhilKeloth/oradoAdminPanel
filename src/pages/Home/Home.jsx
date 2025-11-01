import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import HomeOrange from "../../assets/homeOrange.png";
import homeGirlimage from "../../assets/homeGirl.png";
import Categorylist from "../../components/home/CategoryList"
import catgoryImage from "../../assets/category1.png";
import categoryImage1 from "../../assets/category2.png";
import categoryImage2 from "../../assets/category3.png";
import categoryImage3 from "../../assets/category4.png";
import categoryImage4 from "../../assets/category5.png";
import categoryImage5 from "../../assets/category6.png";
import RestaurantCard from "../../components/home/RestaurantCard";
import { getRecommendedRestaurants } from "../../apis/restaurantApi"; // 👈 import your api function
import { useSelector } from "react-redux";

function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const selectedLocation = useSelector((state) => state.location.location);

  useEffect(() => {
    console.log(selectedLocation);
    const fetchRestaurants = async () => {
      if (!selectedLocation) return; // Don't fetch if no location selected yet

      try {
        const { lat, lon } = selectedLocation;
        const data = await getRecommendedRestaurants(lat, lon);
        console.log(data);
        setRestaurants(data.data);
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
      }
    };

    fetchRestaurants();
  }, [selectedLocation]);
  return (
    <div>
      <Navbar />

      {/* home banner */}
      <div className="flex flex-row max-sm:flex-col mt-20">
        <div className="w-full sm:mb-10 md:mb-0">
          <h1 className="text-[80px] max-md:text-6xl sm:ml-25 mt-20 font-bold text-gray-800 leading-20 max-sm:text-[60px]">
            Deliver Your <br />
            Delicious Food at <br />
            <span className="text-[#EA4424]">Lightning Speed</span>
          </h1>
          <p className="hidden lg:block text-lg font-mono font-bold leading-10 ml-24 mt-5">
            Our job is to satisfy your hunger with delicious food <br /> and
            fast, free delivery.
          </p>
          <button className="p-4 m-4 bg-[#EA4424] text-white font-bold rounded-[50px] max-sm:hidden max-md:mt-3 max-md:p-3 ml-24 py-[11]">
            Get Started
          </button>
        </div>

        <div className="relative w-full flex justify-center">
          <div className="relative w-full max-md:w-full max-sm:hidden flex justify-center items-center">
            <img
              src={HomeOrange}
              alt=""
              className="absolute mt-30 max-sm:h-[500px] w-full h-[400px]"
            />
            <img
              src={homeGirlimage}
              alt="Girl Eating"
              className="w-full object-fit max-sm:h-[500px] h-[528px] relative z-10"
            />
          </div>
        </div>
      </div>

      {/* categories */}
      <p className="text-2xl m-5 text-center font-bold">Popular categories</p>
      <div
        className="flex overflow-x-auto justify-center gap-5 p-4 bg-gray-100 [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-gray-100
        [&::-webkit-scrollbar-thumb]:bg-gray-300
        dark:[&::-webkit-scrollbar-track]:bg-neutral-700
        dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
      >
        <Categorylist
          catgoryImage={catgoryImage}
          restaurantName={"Burgers & Fast food"}
        />
        <Categorylist catgoryImage={categoryImage1} restaurantName={"Salads"} />
        <Categorylist
          catgoryImage={categoryImage2}
          restaurantName={"Pasta & Casuals"}
        />
        <Categorylist catgoryImage={categoryImage3} restaurantName={"Pizza"} />
        <Categorylist
          catgoryImage={categoryImage4}
          restaurantName={"Breakfast"}
        />
        <Categorylist catgoryImage={categoryImage5} restaurantName={"Soups"} />
      </div>

      {/* restaurants */}
      <div className="m-5">
        <h2 className="text-xl font-bold">Popular restaurants</h2>
      </div>

      <div className="py-4 px-14">
  {restaurants.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant._id} restaurant={restaurant} />
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-lg font-medium text-center py-10">
      No restaurants available at this location.
    </p>
  )}
</div>
    </div>
  );
}

export default Home;
