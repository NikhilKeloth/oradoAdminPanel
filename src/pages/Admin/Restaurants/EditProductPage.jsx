import { useEffect, useState } from "react";
import { FiChevronDown, FiUpload, FiX, FiInfo, FiTrash2 } from "react-icons/fi";
import { FaAngleLeft } from "react-icons/fa";

const EditProductPage = ({
  onClose,
  merchantName = "",
  categoryName = "",
  onUpdateProduct,
  initialData = null,
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
    newImages: [],
    existingImages: [],
    imagesToRemove: [],
    availability: "always",
    availableFrom: "17:00",  // ✅ Changed from availableFromTime
    availableTo: "22:00",    // ✅ Added availableTo
    unit: "piece",
    stock: 0,
    reorderLevel: 0,
    enableInventory: false,
    foodType: "veg",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Convert backend data to form structure
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price?.toString() || "",
        minQty: initialData.minimumOrderQuantity?.toString() || "1",
        maxQty: initialData.maximumOrderQuantity?.toString() || "",
        costPrice: initialData.costPrice?.toString() || "",
        preparationTime: initialData.preparationTime?.toString() || "",
        isRecurring: initialData.isRecurring || false,
        existingImages: initialData.images || [],
        newImages: [],
        imagesToRemove: [],
        availability: initialData.availability || "always", // ✅ Direct mapping
        availableFrom: initialData.availableFrom || "17:00", // ✅ Changed from availableAfterTime
        availableTo: initialData.availableTo || "22:00",     // ✅ Added
        unit: initialData.unit || "piece",
        stock: initialData.stock || 0,
        reorderLevel: initialData.reorderLevel || 0,
        enableInventory: initialData.enableInventory || false,
        foodType: initialData.foodType || "veg",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare all product data for API
      const productPayload = {
        // Basic product info
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        minimumOrderQuantity: parseInt(formData.minQty),
        maximumOrderQuantity: formData.maxQty ? parseInt(formData.maxQty) : null,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : null,
        isRecurring: formData.isRecurring,
        
        // Inventory
        stock: parseInt(formData.stock),
        reorderLevel: parseInt(formData.reorderLevel),
        enableInventory: formData.enableInventory,
        
        // Product type
        unit: formData.unit,
        foodType: formData.foodType,
        
        // ✅ Corrected availability fields
        availability: formData.availability,
        availableFrom: formData.availability === "time-based" ? formData.availableFrom : "",
        availableTo: formData.availability === "time-based" ? formData.availableTo : "",
        
        // Images
        existingImages: formData.existingImages,
        imagesToRemove: formData.imagesToRemove,
        newImages: formData.newImages
      };

      console.log("Sending update data:", productPayload); // Debug log

      // Call parent handler with all data
      await onUpdateProduct(productPayload);

      // Close modal on success
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
      // Error is handled by parent component
    } finally {
      setIsLoading(false);
    }
  };

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
        newImages: [...prev.newImages, ...files],
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
      availableFrom: value === "time-based" ? prev.availableFrom || "17:00" : "",
      availableTo: value === "time-based" ? prev.availableTo || "22:00" : "",
    }));
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const removeNewImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index),
    }));
  };

  const removeExistingImage = (index, imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index),
      imagesToRemove: [...prev.imagesToRemove, imageUrl],
    }));
  };

  // Validation for time range
  const isTimeRangeValid = formData.availability === "time-based" && 
                          formData.availableFrom && 
                          formData.availableTo &&
                          formData.availableFrom >= formData.availableTo;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bgOp backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Modal Content */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative">
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
                    <h1 className="text-2xl font-bold">Edit Product</h1>
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
                        <span className="mr-1">✍</span> Write with AI
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
                          {formData.existingImages.length > 0 || formData.newImages.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 w-full">
                              {/* Existing images */}
                              {formData.existingImages.map((image, index) => (
                                <div key={`existing-${index}`} className="relative group">
                                  <img
                                    src={image}
                                    alt={`Preview ${index}`}
                                    className="h-24 w-full object-cover rounded-md"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeExistingImage(index, image)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <FiTrash2 size={12} />
                                  </button>
                                </div>
                              ))}
                              
                              {/* New images */}
                              {formData.newImages.map((image, index) => (
                                <div key={`new-${index}`} className="relative group">
                                  <img
                                    src={URL.createObjectURL(image)}
                                    alt={`Preview ${index}`}
                                    className="h-24 w-full object-cover rounded-md"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeNewImage(index)}
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

                  {/* Availability */}
                  <div className="space-y-4">
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
                            value="time-based"
                            checked={formData.availability === "time-based"}
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
                          {formData.availability === "time-based" && (
                            <div className="mt-2 space-y-3">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                  From
                                </label>
                                <input
                                  type="time"
                                  name="availableFrom"
                                  value={formData.availableFrom}
                                  onChange={handleTimeChange}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                  required={formData.availability === "time-based"}
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                  To
                                </label>
                                <input
                                  type="time"
                                  name="availableTo"
                                  value={formData.availableTo}
                                  onChange={handleTimeChange}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                  required={formData.availability === "time-based"}
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
                          value="out-of-stock"
                          checked={formData.availability === "out-of-stock"}
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
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isLoading || isTimeRangeValid}
                >
                  {isLoading ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductPage;