import React, { useState } from "react";
import {
  Percent,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Settings,
  User,
  Users,
} from "lucide-react";
import axios from "axios";
import apiClient from "../../../apis/apiClient/apiClient";

function CreateOffer({ onOfferCreated }) {
  const [type, setType] = useState("percentage");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTill, setValidTill] = useState("");
  const [usageLimitPerUser, setUsageLimitPerUser] = useState("");
  const [totalUsageLimit, setTotalUsageLimit] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
const handleSubmit = async () => {
  setSuccess("");
  setError("");
  setIsLoading(true);

  // Validate required fields
  const requiredFields = {
    title: "Title is required",
    discountValue: "Discount value is required",
    validFrom: "Valid from date is required",
    validTill: "Valid till date is required",
    minOrderValue: "Minimum order value is required"
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([field]) => !eval(field))
    .map(([_, message]) => message);

  if (missingFields.length > 0) {
    setError(missingFields.join(", "));
    setIsLoading(false);
    return;
  }

  // Validate dates
  if (new Date(validFrom) >= new Date(validTill)) {
    setError("Valid till date must be after valid from date");
    setIsLoading(false);
    return;
  }

  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Create the request data object
    const requestData = {
      title,
      description: description || null,
      type,
      discountValue: parseFloat(discountValue),
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      minOrderValue: parseFloat(minOrderValue),
      validFrom: new Date(validFrom),
      validTill: new Date(validTill),
      usageLimitPerUser: usageLimitPerUser ? parseInt(usageLimitPerUser) : null,
      totalUsageLimit: totalUsageLimit ? parseInt(totalUsageLimit) : null
    };

    // Make a single API call
    await apiClient.post("/admin/offer", requestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    setSuccess("Offer created successfully");
    // Reset all fields
    setTitle("");
    setDescription("");
    setDiscountValue("");
    setMaxDiscount("");
    setMinOrderValue("");
    setValidFrom("");
    setValidTill("");
    setUsageLimitPerUser("");
    setTotalUsageLimit("");
    
    if (onOfferCreated) onOfferCreated();
  } catch (err) {
    console.error("Error creating offer:", err);
    const errorMessage = err.response?.data?.message || 
                       err.message || 
                       "Failed to create offer";
    setError(errorMessage);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 flex items-center space-x-4 bg-gray-50">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Settings className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Create New Offer
          </h2>
          <p className="text-sm text-gray-600">
            Configure discount offers with advanced rules
          </p>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="flex items-center space-x-3 p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center space-x-3 p-4 mb-6 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500" />
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Summer Special"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Limited time summer discount"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type <span className="text-red-500">*</span>
              </label>
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setType("percentage")}
                  className={`px-4 py-2 text-sm font-medium border border-gray-300 ${
                    type === "percentage"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } rounded-l-md`}
                >
                  <div className="flex items-center space-x-2">
                    <Percent className="w-4 h-4" />
                    <span>Percentage</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setType("flat")}
                  className={`px-4 py-2 text-sm font-medium border-t border-b border-r border-gray-300 ${
                    type === "flat"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } rounded-r-md`}
                >
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Flat</span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={type === "percentage" ? "10" : "5"}
                  min="0"
                  step={type === "percentage" ? "0.1" : "1"}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                  {type === "percentage" ? "%" : "$"}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Discount {type === "percentage" && "($)"}
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="number"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="200"
                  min="0"
                />
                {type === "percentage" && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                    $
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Order Value <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="300"
                  min="0"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                  $
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usage Limit Per User
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="number"
                  value={usageLimitPerUser}
                  onChange={(e) => setUsageLimitPerUser(e.target.value)}
                  className="block w-full pl-10 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Unlimited"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Usage Limit
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Users className="h-4 w-4" />
                </div>
                <input
                  type="number"
                  value={totalUsageLimit}
                  onChange={(e) => setTotalUsageLimit(e.target.value)}
                  className="block w-full pl-10 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Unlimited"
                  min="1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid From <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <input
                  type="datetime-local"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="block w-full pl-10 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid Till <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <input
                  type="datetime-local"
                  value={validTill}
                  onChange={(e) => setValidTill(e.target.value)}
                  className="block w-full pl-10 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : 'Create Offer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOffer;