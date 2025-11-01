import React from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

const AddTaxModal = ({ type = "marketplace", onClose, onSave, restaurants = [] }) => {
  const [formData, setFormData] = React.useState({
    name: "",
    amount: "",
    type: "",
    applicableOn: "",
    restaurants: [],
  });

  const [showRestaurantDropdown, setShowRestaurantDropdown] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleRestaurantSelection = (restaurantId) => {
    setFormData((prev) => {
      const newSelection = prev.restaurants.includes(restaurantId)
        ? prev.restaurants.filter((id) => id !== restaurantId)
        : [...prev.restaurants, restaurantId];
      return { ...prev, restaurants: newSelection };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = {
      name: formData.name,
      amount: formData.amount,
      type: formData.type,
      applicableOn: formData.applicableOn,
      restaurants: formData.restaurants,
    };
    onSave(dataToSend);
  };

  const getModalTitle = () => {
    switch (type) {
      case "merchant":
        return "Add Merchant Tax";
      case "additional":
        return "Add Additional Charge";
      case "subscription":
        return "Add Subscription Tax";
      default:
        return "Add Marketplace Tax";
    }
  };

  return (
    <div className="fixed inset-0 bgOp flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b border-gray-200 px-6 py-4">
          <h4 className="text-lg font-semibold text-gray-800">{getModalTitle()}</h4>
        </div>

        <div className="p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Name<span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Amount<span className="text-red-500">*</span></label>
              <input
                type="text"
                name="amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Type<span className="text-red-500">*</span></label>
              <select
                name="type"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select Type</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            {/* Applicable On */}
            {type !== "subscription" && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Applicable On<span className="text-red-500">*</span></label>
                <select
                  name="applicableOn"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.applicableOn}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select Scope</option>
                  <option value="product">Product</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
            )}

            {/* Multi-Select Restaurants */}
            {type === "additional" && (
              <div className="space-y-1 relative">
                <label className="block text-sm font-medium text-gray-700">Assign Restaurants</label>
                <div
                  className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer"
                  onClick={() => setShowRestaurantDropdown(!showRestaurantDropdown)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      {formData.restaurants.length > 0
                        ? `${formData.restaurants.length} selected`
                        : "Select Restaurants"}
                    </span>
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {showRestaurantDropdown && (
                  <div className="absolute z-50 bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto w-full">
                    {restaurants.map((res) => (
                      <label key={res._id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={formData.restaurants.includes(res._id)}
                          onChange={() => toggleRestaurantSelection(res._id)}
                        />
                        {res.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTaxModal;
