import React, { useState } from "react";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { createRestaurantDiscount } from "../../../../../apis/adminApis/discountApi";

const SetRestaurantDiscountModal = ({ onClose, restaurantId, onDiscountCreated }) => {
  const [formData, setFormData] = useState({
    name: "", // Added discount name field
    discountType: "Percentage",
    discountValue: "",
    maxDiscountValue: "",
    description: "",
    validFrom: null,
    validTo: null,
  });

  const discountTypes = [
    { label: "Percentage", value: "Percentage" },
    { label: "Flat", value: "Flat" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.discountValue || !formData.validFrom || !formData.validTo) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        ...formData,
        restaurant: restaurantId,
      };

      // Send this payload back to parent
      onDiscountCreated(payload);
      onClose();

    } catch (error) {
      console.error("Error creating discount:", error);
      alert("Error creating discount. Check console.");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
        <div className="border-b border-gray-200 px-6 py-4">
          <h4 className="text-lg font-semibold text-gray-800">Set Restaurant Discount</h4>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Added Discount Name Field */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter discount name"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
            <Dropdown
              value={formData.discountType}
              options={discountTypes}
              onChange={(e) => setFormData({ ...formData, discountType: e.value })}
              placeholder="Select"
              className="w-full"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleChange}
              required
              min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder={formData.discountType === "Percentage" ? "0-100%" : "Enter amount"}
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount Value (₹)</label>
            <input
              type="number"
              name="maxDiscountValue"
              value={formData.maxDiscountValue}
              onChange={handleChange}
              min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Optional maximum amount"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              maxLength={150}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description (max 150 characters)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid From <span className="text-red-500">*</span>
              </label>
              <Calendar
                value={formData.validFrom}
                onChange={(e) => handleDateChange("validFrom", e.value)}
                showTime
                hourFormat="12"
                className="w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid To <span className="text-red-500">*</span>
              </label>
              <Calendar
                value={formData.validTo}
                onChange={(e) => handleDateChange("validTo", e.value)}
                showTime
                hourFormat="12"
                className="w-full"
                required
              />
            </div>
          </div>

          <div className="flex justify-end border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetRestaurantDiscountModal;