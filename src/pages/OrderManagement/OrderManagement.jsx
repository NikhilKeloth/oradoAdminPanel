import React from 'react';
import Banner from '../../components/orderManagement/Banner';
import Navbar from '../../components/layout/Navbar';
import MenuNavigation from '../../components/orderManagement/Menu';
import Items from '../../components/orderManagement/Items';
import MyBasket from '../../components/addToCart/MyBasket';
import RestaurantInfo from '../../components/orderManagement/RestaurantInfo';
import MapWithOverlayInfo from '../../components/orderManagement/MapWithInfo';
import CustomerReviews from '../../components/orderManagement/CustomerReviews';
import SimilarRestaurants from '../../components/orderManagement/SimilarRestaurants';

const OrderManagement = () => {
  return (
    <>
      <Navbar />
      <Banner />

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6 px-4 lg:px-12 py-8">
        {/* Left Section: Menu + Items */}
        <div className="w-full lg:w-8/12 flex flex-col lg:flex-row gap-6">
          {/* Menu Sidebar */}
          <div className="w-full lg:w-1/3 bg-white shadow-md rounded-lg p-4">
            <MenuNavigation />
          </div>

          {/* Items List */}
          <div className="w-full lg:w-2/3 bg-white shadow-md rounded-lg p-4">
            <Items />
          </div>
        </div>

        {/* Right Section: My Basket */}
        <div className="w-full lg:w-4/12 bg-white shadow-md rounded-lg p-4">
          <MyBasket />
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="px-4 lg:px-12 pb-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <RestaurantInfo />
        </div>
      </div>

      {/* Customer Reviews */}
      <div className="px-4 lg:px-12 pb-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <CustomerReviews />
        </div>
      </div>

      {/* Similar Restaurants */}
      <div className="px-4 lg:px-12 mb-12">
        <div className="bg-white shadow-md rounded-lg p-6">
          <SimilarRestaurants />
        </div>
      </div>
    </>
  );
};

export default OrderManagement;
