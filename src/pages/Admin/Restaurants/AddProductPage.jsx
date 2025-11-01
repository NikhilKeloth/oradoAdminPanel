import { useEffect, useState } from "react";
import { FiChevronDown, FiUpload, FiX, FiInfo } from "react-icons/fi";
import { FaAngleLeft } from "react-icons/fa";

const AddProductPage = ({
  onClose,
  merchantName = "",
  categoryName = "",
  onAddProduct,
  initialData = null,
  isEditMode = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    minQty: "",
    maxQty: "",
    costPrice: "",
    preparationTime: "",
    isRecurring: false, 
    images: [],
    availability: "always",
    availableFromTime: "17:00",
    availableToTime: "22:00",
    unit: "piece",
    stock: 0,
    reorderLevel: 0,
    enableInventory: false,
    foodType: "veg",
  });

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const productData = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      minQty: formData.minQty,
      maxQty: formData.maxQty,
      costPrice: formData.costPrice,
      preparationTime: formData.preparationTime,
      isRecurring: formData.isRecurring,
      images: formData.images,
      availability: formData.availability,
      // ✅ Send the correct field names that backend expects
      availableFrom: formData.availability === "time-based" ? formData.availableFromTime : null,
      availableTo: formData.availability === "time-based" ? formData.availableToTime : null,
      unit: formData.unit,
      stock: formData.stock,
      reorderLevel: formData.reorderLevel,
      enableInventory: formData.enableInventory,
      foodType: formData.foodType,
      minimumOrderQuantity: formData.minQty,
      maximumOrderQuantity: formData.maxQty,
    };

    const response = await onAddProduct(productData);
    onClose();
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};  

useEffect(() => {
  if (isEditMode && initialData) {
    // Handle availability mapping correctly
    const availabilityType = initialData.availability || "always";
    
    setFormData({
      ...initialData,
      availability: availabilityType,
      // Map backend fields to frontend fields
      availableFromTime: initialData.availableFrom || "17:00",
      availableToTime: initialData.availableTo || "22:00",
      minQty: initialData.minimumOrderQuantity || "",
      maxQty: initialData.maximumOrderQuantity || "",
      images: initialData.images || [],
    });
  }
}, [isEditMode, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
      }));
    }
  };

  const toggleInventory = () => {
    setFormData((prev) => ({
      ...prev,
      enableInventory: !prev.enableInventory,
    }));
  };

  const handleAvailabilityChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      availability: value,
      availableFromTime: value === "scheduled" ? prev.availableFromTime || "17:00" : "",
      availableToTime: value === "scheduled" ? prev.availableToTime || "22:00" : "",
    }));
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Prevent backdrop click from closing modal when clicking inside modal content
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent event propagation for time inputs and other interactive elements
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const isTimeRangeValid = formData.availability === "scheduled" && 
                          formData.availableFromTime && 
                          formData.availableToTime &&
                          formData.availableFromTime >= formData.availableToTime;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      {/* Blurred Backdrop */}
      <div className="fixed inset-0 bgOp backdrop-blur-sm"></div>

      {/* Modal Container */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Modal Content - Add onClick to stop propagation */}
        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative"
          onClick={stopPropagation}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
          >
            <FiX className="text-gray-600 text-lg" />
          </button>

          {/* Content */}
          <div className="bg-white px-6 py-6">
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center mb-4 md:mb-0">
                  <button
                    onClick={onClose}
                    className="mr-4 text-gray-600 hover:text-gray-800"
                  >
                    <FaAngleLeft className="text-2xl" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {isEditMode ? "Edit Product" : "Add Product"}
                    </h1>
                    <p className="text-gray-600">{merchantName}</p>
                    <span className="mx-2">•</span>
                    <span> in {categoryName}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <select
                      className="w-full p-2 border rounded-md bg-white"
                      defaultValue="English"
                    >
                      <option>English</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-3 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Product Details */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Product Details
                    </h2>

                    {/* Product Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Please enter name"
                        className="w-full p-2 border rounded-md"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Please enter name
                      </p>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2">$</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="0.00"
                          className="w-full p-2 border rounded-md pl-8"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Standard price for product
                      </p>
                    </div>

                    {/* Minimum Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum quantity to order{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="minQty"
                        value={formData.minQty}
                        onChange={handleChange}
                        placeholder="1"
                        className="w-full p-2 border rounded-md"
                        min="1"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Please enter minimum quantity
                      </p>
                    </div>

                    {/* Maximum Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum quantity per order
                      </label>
                      <input
                        type="number"
                        name="maxQty"
                        value={formData.maxQty}
                        onChange={handleChange}
                        placeholder="Leave empty for no limit"
                        className="w-full p-2 border rounded-md"
                        min="0"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Please enter maximum quantity
                      </p>
                    </div>

                    {/* Cost Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cost Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2">$</span>
                        <input
                          type="number"
                          name="costPrice"
                          value={formData.costPrice}
                          onChange={handleChange}
                          placeholder="0.00"
                          className="w-full p-2 border rounded-md pl-8"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Please enter the cost price
                      </p>
                    </div>
                  </div>

                  {/* Inventory Tracking */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Inventory Tracking
                    </h2>

                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Enable Inventory Tracking
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.enableInventory}
                          onChange={toggleInventory}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>

                    {formData.enableInventory && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stock Quantity
                          </label>
                          <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            placeholder="Current stock"
                            className="w-full p-2 border rounded-md"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reorder Level
                          </label>
                          <input
                            type="number"
                            name="reorderLevel"
                            value={formData.reorderLevel}
                            onChange={handleChange}
                            placeholder="Reorder threshold"
                            className="w-full p-2 border rounded-md"
                            min="0"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Other Product Info */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Other Product Info
                    </h2>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Food Type <span className="text-red-500">*</span>
                      </label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="foodType"
                            value="veg"
                            checked={formData.foodType === "veg"}
                            onChange={handleChange}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                            required
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Vegetarian
                          </span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="foodType"
                            value="non-veg"
                            checked={formData.foodType === "non-veg"}
                            onChange={handleChange}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Non-Vegetarian
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="piece">Piece</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="g">Gram (g)</option>
                        <option value="lb">Pound (lb)</option>
                        <option value="oz">Ounce (oz)</option>
                        <option value="pack">Pack</option>
                        <option value="box">Box</option>
                      </select>
                    </div>

                    {/* Preparation Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preparation Time (in minutes)
                      </label>
                      <input
                        type="number"
                        name="preparationTime"
                        value={formData.preparationTime}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full p-2 border rounded-md"
                        min="0"
                      />
                    </div>

                    {/* Recurring Bookings */}
                    <div className="flex items-center justify-between pt-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Mark product for recurring bookings
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="isRecurring"
                          checked={formData.isRecurring}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-800">
                        Description
                      </h2>
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <span className="mr-1">✍️</span> Write with AI
                      </button>
                    </div>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Please enter description"
                      className="w-full p-2 border rounded-md h-32"
                      rows="4"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Please enter description
                    </p>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Product Images
                    </h2>
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:bg-gray-50">
                      <input
                        type="file"
                        id="prodImage"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        multiple
                      />
                      <label htmlFor="prodImage" className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          {formData.images.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 w-full">
                              {formData.images.map((image, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={URL.createObjectURL(image)}
                                    alt={`Preview ${index}`}
                                    className="h-24 w-full object-cover rounded-md"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <FiX size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <FiUpload className="text-gray-400 text-2xl" />
                              <p className="text-sm text-gray-500">
                                Drag & drop images here, or click to browse
                              </p>
                              <p className="text-xs text-gray-400">
                                Recommended size: 800x800px
                              </p>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Availability - FIXED CLICK PROPAGATION */}
                  {/* <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Availability
                    </h2>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="availableAlways"
                          name="availability"
                          value="always"
                          checked={formData.availability === "always"}
                          onChange={handleAvailabilityChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label
                          htmlFor="availableAlways"
                          className="ml-3 block text-sm text-gray-700"
                        >
                          Available Always
                        </label>
                      </div>

                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            type="radio"
                            id="availableFrom"
                            name="availability"
                            value="scheduled"
                            checked={formData.availability === "scheduled"}
                            onChange={handleAvailabilityChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor="availableFrom"
                            className="text-gray-700"
                          >
                            Available daily during specific time
                          </label>
                          {formData.availability === "scheduled" && (
                            <div 
                              className="mt-2 space-y-3"
                              onClick={stopPropagation}
                            >
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                  From
                                </label>
                                <input
                                  type="time"
                                  name="availableFromTime"
                                  value={formData.availableFromTime}
                                  onChange={handleTimeChange}
                                  onClick={stopPropagation}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                  To
                                </label>
                                <input
                                  type="time"
                                  name="availableToTime"
                                  value={formData.availableToTime}
                                  onChange={handleTimeChange}
                                  onClick={stopPropagation}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                />
                              </div>
                              {isTimeRangeValid && (
                                <p className="text-red-500 text-xs">
                                  End time must be after start time
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="outOfStock"
                          name="availability"
                          value="out_of_stock"
                          checked={formData.availability === "out_of_stock"}
                          onChange={handleAvailabilityChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label
                          htmlFor="outOfStock"
                          className="ml-3 block text-sm text-gray-700"
                        >
                          Out of Stock
                        </label>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>

              {/* Form Footer */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTimeRangeValid}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isEditMode ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;