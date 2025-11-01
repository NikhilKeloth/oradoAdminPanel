import React, { useState, useEffect } from "react";
import axios from "axios";
import { fetchRestaurantsDropdown } from "../../../../apis/adminApis/adminFuntionsApi";
import { getCities } from "../../../../apis/adminApis/cityApi";
import { ChevronDown } from "lucide-react";
import apiClient from "../../../../apis/apiClient/apiClient";

const CreatePromoCode = ({ onAddPromoCode, onCancel }) => {
  const [promoData, setPromoData] = useState({
    language: "English",
    promotionType: "Percentage",
    promotionName: "",
    description: "",
    discountValue: "",
    maximumDiscountValue: "",
    minimumOrderAmount: "",
    singleUserOption: "No",
    loyaltyPointsEnabled: "No",
    loyaltyEarningEnabled: "No",
    promoAppliedOn: "Cart Value",
    applicationMode: "Public",
    from: "",
    till: "",
    merchantListForPromo: [],
    cityData: [],
    orderCount: "",
    isCustomerSpecific: false,
    maximumNoOfAllowedUsers: ""
  });

  const [restaurantsList, setRestaurantsList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restaurantsResponse, citiesResponse] = await Promise.all([
          fetchRestaurantsDropdown(),
          getCities('/city/cities')
        ]);
        setRestaurantsList(restaurantsResponse.data);
        setCitiesList(citiesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load required data. Please try again.");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPromoData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRadioChange = (name, value) => {
    setPromoData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setPromoData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleMerchantSelection = (merchantId) => {
    setPromoData(prev => ({
      ...prev,
      merchantListForPromo: prev.merchantListForPromo.includes(merchantId)
        ? prev.merchantListForPromo.filter(id => id !== merchantId)
        : [...prev.merchantListForPromo, merchantId]
    }));
  };

  const handleCitySelection = (cityId) => {
    setPromoData(prev => ({
      ...prev,
      cityData: prev.cityData.includes(cityId)
        ? prev.cityData.filter(id => id !== cityId)
        : [...prev.cityData, cityId]
    }));
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString();
  };

  const validateForm = () => {
    if (!promoData.promotionName.trim()) {
      setError("Promotion name is required");
      return false;
    }
    if (!promoData.discountValue) {
      setError("Discount value is required");
      return false;
    }
    if (!promoData.from || !promoData.till) {
      setError("Start and end dates are required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);

    try {
    const apiData = {
  ...promoData,
  discountValue: parseFloat(promoData.discountValue),
  maximumDiscountValue: promoData.maximumDiscountValue ? parseFloat(promoData.maximumDiscountValue) : null,
  minimumOrderAmount: promoData.minimumOrderAmount ? parseFloat(promoData.minimumOrderAmount) : null,
  from: formatDateForAPI(promoData.from),
  till: formatDateForAPI(promoData.till),
  isReusableBySameUser: promoData.singleUserOption === "Yes",
  allowLoyaltyRedeem: promoData.loyaltyPointsEnabled === "Yes",
  allowLoyaltyEarn: promoData.loyaltyEarningEnabled === "Yes",
  orderCount: promoData.orderCount ? parseInt(promoData.orderCount) : null,
  maximumNoOfAllowedUsers: promoData.maximumNoOfAllowedUsers ? parseInt(promoData.maximumNoOfAllowedUsers) : null,
  promoAppliedOn: promoData.promoAppliedOn.replace(/\s+/g, '').toLowerCase(),
  assignedRestaurants: promoData.merchantListForPromo,
  applicableCities: promoData.cityData
};


      const response = await apiClient.post('/promo', apiData);
      onAddPromoCode?.(response.data);
    } catch (error) {
      console.error("Error creating promo:", error);
      setError(error.response?.data?.message || "Failed to create promotion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="border-b p-6 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-semibold text-gray-800">Add Promotion</h3>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <div className="relative">
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md appearance-none bg-gray-100 cursor-not-allowed"
                    disabled
                  >
                    <option>English</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Promotion Type */}
              <div className="space-y-2 col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Promotion Type <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-blue-600"
                      checked={promoData.promotionType === "Percentage"}
                      onChange={() => handleRadioChange("promotionType", "Percentage")}
                    />
                    <span className="ml-2 text-gray-700">Percentage Discount</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-blue-600"
                      checked={promoData.promotionType === "Flat"}
                      onChange={() => handleRadioChange("promotionType", "Flat")}
                    />
                    <span className="ml-2 text-gray-700">Flat Discount</span>
                  </label>
                </div>
              </div>

              {/* Promotion Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Promotion Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="promotionName"
                  value={promoData.promotionName}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter promotion name"
                />
              </div>

              {/* Discount Value */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {promoData.promotionType === "Percentage" ? "Discount (%)" : "Discount Amount"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {promoData.promotionType === "Flat" && (
                    <span className="absolute left-3 top-2">$</span>
                  )}
                  <input
                    type="number"
                    name="discountValue"
                    value={promoData.discountValue}
                    onChange={handleChange}
                    required
                    min="0"
                    step={promoData.promotionType === "Percentage" ? "0.1" : "1"}
                    className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      promoData.promotionType === "Flat" ? "pl-8" : ""
                    }`}
                    placeholder={promoData.promotionType === "Percentage" ? "0-100" : "0.00"}
                  />
                  {promoData.promotionType === "Percentage" && (
                    <span className="absolute right-3 top-2">%</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description (max 150 characters) <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={promoData.description}
                  onChange={handleChange}
                  maxLength="150"
                  required
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter promotion description"
                />
                <div className="text-xs text-gray-500 text-right">
                  {promoData.description.length}/150
                </div>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  From <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="from"
                  value={promoData.from}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Till <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="till"
                  value={promoData.till}
                  onChange={handleChange}
                  required
                  min={promoData.from}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Maximum Discount Value */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Maximum discount value</label>
                <div className="relative">
                  <span className="absolute left-3 top-2">$</span>
                  <input
                    type="number"
                    name="maximumDiscountValue"
                    value={promoData.maximumDiscountValue}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Maximum Allowed Users */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Maximum no of allowed users</label>
                <input
                  type="number"
                  name="maximumNoOfAllowedUsers"
                  value={promoData.maximumNoOfAllowedUsers}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              {/* Minimum Order Amount */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Minimum Order amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2">$</span>
                  <input
                    type="number"
                    name="minimumOrderAmount"
                    value={promoData.minimumOrderAmount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Application Mode */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Promotion Application Mode</label>
                <div className="relative">
                  <select
                    name="applicationMode"
                    value={promoData.applicationMode}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md appearance-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Single User Option */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Allow single user to use the code multiple times? <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-blue-600"
                      checked={promoData.singleUserOption === "Yes"}
                      onChange={() => handleRadioChange("singleUserOption", "Yes")}
                    />
                    <span className="ml-2 text-gray-700">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-blue-600"
                      checked={promoData.singleUserOption === "No"}
                      onChange={() => handleRadioChange("singleUserOption", "No")}
                    />
                    <span className="ml-2 text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {/* Loyalty Points Enabled */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Allow Loyalty Points to be redeemed if this Promo Code is applied? <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-blue-600"
                      checked={promoData.loyaltyPointsEnabled === "Yes"}
                      onChange={() => handleRadioChange("loyaltyPointsEnabled", "Yes")}
                    />
                    <span className="ml-2 text-gray-700">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-blue-600"
                      checked={promoData.loyaltyPointsEnabled === "No"}
                      onChange={() => handleRadioChange("loyaltyPointsEnabled", "No")}
                    />
                    <span className="ml-2 text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {/* Loyalty Earning Enabled */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Allow Loyalty Points to be earned if this Promo Code is applied? <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-blue-600"
                      checked={promoData.loyaltyEarningEnabled === "Yes"}
                      onChange={() => handleRadioChange("loyaltyEarningEnabled", "Yes")}
                    />
                    <span className="ml-2 text-gray-700">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-blue-600"
                      checked={promoData.loyaltyEarningEnabled === "No"}
                      onChange={() => handleRadioChange("loyaltyEarningEnabled", "No")}
                    />
                    <span className="ml-2 text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {/* Promotion Applied On */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Promotion Applied On</label>
                <div className="relative">
                  <select
                    name="promoAppliedOn"
                    value={promoData.promoAppliedOn}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md appearance-none focus:ring-blue-500 focus:border-blue-500"
                  >
  <option value="cartValue">Cart Value</option>
  <option value="specificProducts">Specific Products</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Order Count */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Promo applicable on order no.</label>
                <input
                  type="number"
                  name="orderCount"
                  value={promoData.orderCount}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Leave empty for all orders"
                />
              </div>

              {/* Assign Merchant */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Assign Merchant</label>
                <div className="border border-gray-300 rounded-md p-2 max-h-40 overflow-y-auto">
                  {restaurantsList.length > 0 ? (
                    restaurantsList.map(restaurant => (
                      <div key={restaurant._id} className="flex items-center p-1">
                        <input
                          type="checkbox"
                          id={`merchant-${restaurant._id}`}
                          checked={promoData.merchantListForPromo.includes(restaurant._id)}
                          onChange={() => handleMerchantSelection(restaurant._id)}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`merchant-${restaurant._id}`} className="ml-2 text-sm text-gray-700">
                          {restaurant.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 p-1">No merchants available</p>
                  )}
                </div>
              </div>

              {/* Customer Specific */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Customer specific promo</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isCustomerSpecific"
                    checked={promoData.isCustomerSpecific}
                    onChange={handleCheckboxChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Select City */}
              <div className="space-y-2 col-span-2">
                <label className="block text-sm font-medium text-gray-700">Select city</label>
                <div className="border border-gray-300 rounded-md p-2 max-h-40 overflow-y-auto">
                  {citiesList?.length > 0 ? (
                    citiesList.map(city => (
                      <div key={city._id} className="flex items-center p-1">
                        <input
                          type="checkbox"
                          id={`city-${city._id}`}
                          checked={promoData.cityData.includes(city._id)}
                          onChange={() => handleCitySelection(city._id)}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`city-${city._id}`} className="ml-2 text-sm text-gray-700">
                          {city.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 p-1">No cities available</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePromoCode;