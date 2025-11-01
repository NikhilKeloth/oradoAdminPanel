import React, { useEffect, useState } from "react";
import EditDiscountModal from "./Editdscoutemodesl";
import ProductWiseDiscount from "./ProductWiseDiscount";
import { fetchRestaurantsDropdown } from "../../../../../apis/adminApis/adminFuntionsApi";
import {
  createRestaurantDiscount,
  getProductDiscounts,
  getRestaurantDiscounts,
} from "../../../../../apis/adminApis/discountApi";
import SetRestaurantDiscountModal from "./SetRestaurantDiscountModal";

const DiscountPage = () => {
  // State management
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProductWiseModal, setShowProductWiseModal] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDiscountLoading, setIsDiscountLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restaurantDiscounts, setRestaurantDiscounts] = useState([]);
  const [productDiscounts, setProductDiscounts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showSetDiscountModal, setShowSetDiscountModal] = useState(false);

  // Fetch restaurants data
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetchRestaurantsDropdown();

        // Handle different API response structures
        let restaurantsData = [];
        if (Array.isArray(response)) {
          restaurantsData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          restaurantsData = response.data;
        } else if (response?.success && Array.isArray(response.data)) {
          restaurantsData = response.data;
        }

        if (restaurantsData.length === 0) {
          setError("No restaurants available");
        } else {
          setRestaurants(restaurantsData);
          setSelectedRestaurant(restaurantsData[0]._id);
        }
      } catch (err) {
        console.error("Error loading restaurants:", err);
        setError("Failed to load restaurants. Please try again.");
        setRestaurants([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRestaurants();
  }, []);

 const fetchDiscounts = async () => {
  try {
    setIsDiscountLoading(true);
    setError(null);

    const [restaurantDiscountRes, productDiscountRes] = await Promise.all([
      getRestaurantDiscounts(selectedRestaurant),
      getProductDiscounts(selectedRestaurant),
    ]);
     console.log(restaurantDiscountRes)
    setRestaurantDiscounts(restaurantDiscountRes.data || []);
    setProductDiscounts(productDiscountRes.data || []);
  } catch (error) {
    console.error("Error fetching discounts:", error);
    setError("Failed to fetch discounts. Please try again.");
    setRestaurantDiscounts([]);
    setProductDiscounts([]);
  } finally {
    setIsDiscountLoading(false);
  }
};

// Run it on restaurant change
useEffect(() => {
  if (!selectedRestaurant) return;
  fetchDiscounts();
}, [selectedRestaurant]);

  const handleRestaurantChange = (e) => {
    setSelectedRestaurant(e.target.value);
  };

  
const handleDiscountCreated = async (formData) => {
  try {
    const response = await createRestaurantDiscount(formData);
    console.log("New discount created:", response.data);
    
 
   await fetchDiscounts()
  } catch (error) {
    console.error("Failed to create discount:", error);
    alert(error.message || "Failed to create discount.");
  }
};

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProductDiscounts = productDiscounts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(productDiscounts.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Main Discount Section */}
      <section className="mb-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 5H3C2.44772 5 2 5.44772 2 6V18C2 18.5523 2.44772 19 3 19H21C21.5523 19 22 18.5523 22 18V6C22 5.44772 21.5523 5 21 5Z"
                  stroke="#4B5563"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 9C16 10.6569 14.6569 12 13 12C11.3431 12 10 10.6569 10 9C10 7.34315 11.3431 6 13 6C14.6569 6 16 7.34315 16 9Z"
                  stroke="#4B5563"
                  strokeWidth="2"
                />
                <path
                  d="M16 15C16 16.6569 14.6569 18 13 18C11.3431 18 10 16.6569 10 15C10 13.3431 11.3431 12 13 12C14.6569 12 16 13.3431 16 15Z"
                  stroke="#4B5563"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Discount</h1>
          </div>

          <div className="flex items-center">
            {error ? (
              <div className="text-red-500 text-sm mr-4">{error}</div>
            ) : (
              <select
                value={selectedRestaurant || ""}
                onChange={handleRestaurantChange}
                disabled={isLoading || restaurants.length === 0}
                className={`border border-gray-300 rounded-md px-4 py-2 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isLoading ? "bg-gray-100" : ""
                }`}
              >
                {isLoading ? (
                  <option value="">Loading restaurants...</option>
                ) : restaurants.length === 0 ? (
                  <option value="">No restaurants available</option>
                ) : (
                  restaurants.map((restaurant) => (
                    <option key={restaurant._id} value={restaurant._id}>
                      {restaurant.name?.trim() || "Unnamed Restaurant"}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>
        </div>

        {/* Main Discount Section - Updated Button Group */}
        <div className="flex justify-end mb-6 space-x-3">
          {restaurantDiscounts.length === 0 ? (
            <button
              onClick={() => setShowSetDiscountModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={
                isLoading ||
                isDiscountLoading ||
                restaurants.length === 0 ||
                !selectedRestaurant
              }
            >
              Set Discount
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={
                  isLoading ||
                  isDiscountLoading ||
                  restaurants.length === 0 ||
                  !selectedRestaurant
                }
              >
                Edit Discount
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={
                  isLoading ||
                  isDiscountLoading ||
                  restaurants.length === 0 ||
                  !selectedRestaurant
                }
              >
                Delete
              </button>
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={
                  isLoading ||
                  isDiscountLoading ||
                  restaurants.length === 0 ||
                  !selectedRestaurant
                }
              >
                Disable
              </button>
            </>
          )}
        </div>

        {showEditModal && selectedRestaurant && (
          <EditDiscountModal
            onClose={() => setShowEditModal(false)}
            onSave={(data) => {
              console.log("Saved data:", data);
              setShowEditModal(false);
              // You might want to refetch discounts here
            }}
            selectedRestaurant={selectedRestaurant}
            initialData={restaurantDiscounts[0]} // Pass existing data if editing
          />
        )}

        {isDiscountLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : restaurantDiscounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No store discounts available for this restaurant
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                    Valid From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                    Valid To
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {restaurantDiscounts.map((discount, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {discount.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {discount.value ? `${discount.value}%` : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {discount.description || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(discount.validFrom)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(discount.validTo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Product Wise Discount Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Product Wise Discount
          </h2>
          <button
            onClick={() => setShowProductWiseModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={
              isLoading ||
              isDiscountLoading ||
              restaurants.length === 0 ||
              !selectedRestaurant
            }
          >
            Add Discount
          </button>
        </div>

        {showProductWiseModal && selectedRestaurant && (
          <ProductWiseDiscount
            onClose={() => setShowProductWiseModal(false)}
            onSave={(data) => {
              console.log("Saving discount:", data);
              setShowProductWiseModal(false);
              // You might want to refetch product discounts here
            }}
            selectedRestaurant={selectedRestaurant}
          />
        )}

        {isDiscountLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : productDiscounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No product discounts available for this restaurant
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/7">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/7">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/7">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/7">
                      Valid From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/7">
                      Valid To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/7">
                      Max Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/7">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProductDiscounts.map((discount, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {discount.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {discount.discountValue ? `${discount.discountValue}%` : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {discount.description || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(discount.validFrom)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(discount.validTo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {discount.maxAmount
                          ? `₹${discount.maxAmount.toFixed(2)}`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {indexOfFirstItem + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, productDiscounts.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {productDiscounts.length}
                      </span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1
                            ? "text-gray-300"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages
                            ? "text-gray-300"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>
      {showSetDiscountModal && (
        <SetRestaurantDiscountModal
          onClose={() => setShowSetDiscountModal(false)}
          restaurantId={selectedRestaurant}
          onDiscountCreated={handleDiscountCreated}
        />
      )}





    </div>
  );
};

export default DiscountPage;
