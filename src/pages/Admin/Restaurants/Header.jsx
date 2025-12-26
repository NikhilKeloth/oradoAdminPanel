import React from "react";
import { Link } from "react-router-dom";
import { Store, ChevronLeft } from "lucide-react";

function Header({ restaurant, id, location }) {
  return (
    <div className="w-full mx-auto p-2 sm:p-3">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden">

        {/* Compact Pink Header */}
        <div className="bg-gradient-to-r from-pink-600 to-pink-700 px-4 py-3">
          <div className="flex items-center justify-between">

            {/* Back Button */}
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {/* Restaurant Name */}
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              <Store className="h-6 w-6" />
              {restaurant?.name || "Restaurant"}
            </h1>

            {/* Image */}
            {restaurant?.images?.length > 0 && (
              <img
                src={restaurant.images[0]}
                alt={restaurant.name}
                className="w-12 h-12 rounded-md object-cover border-2 border-white hidden sm:block"
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Store className="h-5 w-5 text-pink-600" />
            <h2 className="text-md font-medium text-gray-800">
              {restaurant?.name || "Restaurant"} - Catalog Management
            </h2>
          </div>

          <div className="border-b border-gray-200">
            <div className="container mx-auto px-2">
              <ul className="flex space-x-6">
                <li>
                  <Link
                    to={`/admin/dashboard/merchants/merchant-config/${id}`}
                    className={`px-3 py-2 block ${
                      location.pathname === `/admin/dashboard/merchants/merchant-config/${id}`
                        ? "border-b-2 border-pink-500 text-pink-600 font-medium"
                        : "text-gray-500 hover:text-pink-500"
                    }`}
                  >
                    Configurations
                  </Link>
                </li>

                <li>
                  <Link
                    to={`/admin/dashboard/merchants/merchant-catelogue/${id}`}
                    className={`px-3 py-2 block ${
                      location.pathname === `/admin/dashboard/merchants/merchant-catelogue/${id}`
                        ? "border-b-2 border-pink-500 text-pink-600 font-medium"
                        : "text-gray-500 hover:text-pink-500"
                    }`}
                  >
                    Catalogue
                  </Link>
                </li>

                <li>
                  <Link
                    to={`/admin/dashboard/merchants/merchant-details/${id}`}
                    className={`px-3 py-2 block ${
                      location.pathname === `/admin/dashboard/merchants/merchant-details/${id}`
                        ? "border-b-2 border-pink-500 text-pink-600 font-medium"
                        : "text-gray-500 hover:text-pink-500"
                    }`}
                  >
                    Merchant
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Header;
