import React from "react";
import BannerImg from "../../assets/bannerRestaurant.jpg";
import { FaMotorcycle } from "react-icons/fa";
import { MdShoppingBasket, MdAccessTime } from "react-icons/md";

const Banner = () => {
  return (
    <div
      className="relative w-full h-[300px] md:h-[400px] bg-cover bg-center flex items-center justify-start mt-15"
      style={{ backgroundImage: `url(${BannerImg})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bgOp"></div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-12 text-white max-w-screen-xl w-full">
        <p className="text-sm mb-1">I'm lovin' it!</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Tandoori Pizza London
        </h1>

        {/* Order Info */}
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <div className="flex items-center gap-2 border border-white rounded-full px-4 py-2">
            <MdShoppingBasket className="text-lg" />
            <span>Minimum Order: <strong>12 GBP</strong></span>
          </div>
          <div className="flex items-center gap-2 border border-white rounded-full px-4 py-2">
            <FaMotorcycle className="text-lg" />
            <span>Delivery in 20–25 Minutes</span>
          </div>
        </div>

        {/* Open Time */}
        <div className="flex items-center gap-2 text-sm text-white font-medium">
          <MdAccessTime className="text-base" />
          <span>Open until 3:00 AM</span>
        </div>
      </div>

      {/* Rating Card */}
      <div className="absolute top-6 right-6 md:top-10 md:right-12 bg-white text-black rounded-xl shadow-lg px-4 py-2 text-center">
        <div className="text-2xl font-bold">3.4</div>
        <div className="flex justify-center mb-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-4 h-4 ${
                i < 3 ? "text-yellow-400" : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="text-xs text-gray-600">1,360 reviews</p>
      </div>
    </div>
  );
};

export default Banner;
