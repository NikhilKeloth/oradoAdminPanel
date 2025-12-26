import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Layers, 
  Clock,
  Image as ImageIcon,
  Trash2,
  Upload
} from "lucide-react";
import { toast } from "react-toastify";

const AddSubcategoryModal = ({
  onClose,
  onSuccess,
  restaurantId,
  parentId,
  parentName,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    active: true,
    availability: "always",
    availableAfterTime: "",
    availableFromTime: "",
    availableToTime: "",
    restaurantId: restaurantId,
    parentId: parentId,
    images: [],
    imageFiles: []
  });

  const [errors, setErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Required";
    }
    
    if (formData.availability === "time-based" && !formData.availableAfterTime) {
      newErrors.availableAfterTime = "Required";
    }
    
    if (formData.availability === "time-range") {
      if (!formData.availableFromTime) {
        newErrors.availableFromTime = "Required";
      }
      if (!formData.availableToTime) {
        newErrors.availableToTime = "Required";
      }
      if (formData.availableFromTime && formData.availableToTime && 
          formData.availableFromTime >= formData.availableToTime) {
        newErrors.availableToTime = "Must be after start";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
    
  //   if (!validateForm()) {
  //     toast.error("Please fix form errors");
  //     return;
  //   }
    
  //   try {
  //     await onSuccess(formData);
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    toast.error("Please fix form errors");
    return;
  }
  
  try {
    // Convert image files to base64 strings
    const imagePromises = formData.imageFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });
    
    const base64Images = await Promise.all(imagePromises);
    
    // Create final data with base64 images
    const finalData = {
      ...formData,
      images: base64Images, // Send as base64 strings
      imageFiles: undefined // Remove file objects
    };
    
    await onSuccess(finalData);
  } catch (error) {
    console.error("Error:", error);
    toast.error("Failed to process images");
  }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.images.length + files.length > 8) {
      toast.error("Max 8 images");
      return;
    }
    
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} too large`);
        return false;
      }
      return true;
    });
    
    const newPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setFormData(prev => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...validFiles]
    }));
  };

  const removeImage = (index) => {
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
    
    setFormData(prev => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index)
    }));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        URL.revokeObjectURL(preview.preview);
      });
    };
  }, [imagePreviews]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-white" />
              <div>
                <h2 className="text-lg font-bold text-white">Add Subcategory</h2>
                <p className="text-indigo-100 text-xs">
                  Under <span className="font-semibold">{parentName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Vegetarian Pizzas"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500 ${
                  errors.name ? "border-red-300" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional description"
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 resize-none text-sm"
                disabled={loading}
              />
            </div>

            {/* Availability - Compact */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Availability
              </label>
              <div className="flex gap-2">
                {["always", "time-based", "time-range"].map((option) => (
                  <label
                    key={option}
                    className={`flex-1 text-center px-3 py-2 rounded-lg border text-sm cursor-pointer ${
                      formData.availability === option
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="availability"
                      value={option}
                      checked={formData.availability === option}
                      onChange={handleChange}
                      className="sr-only"
                      disabled={loading}
                    />
                    {option === "always" ? "Always" : 
                     option === "time-based" ? "After Time" : "Time Range"}
                  </label>
                ))}
              </div>

              {/* Time Inputs */}
              {formData.availability === "time-based" && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <input
                      type="time"
                      name="availableAfterTime"
                      value={formData.availableAfterTime}
                      onChange={handleChange}
                      className={`flex-1 px-3 py-1.5 border rounded text-sm ${
                        errors.availableAfterTime ? "border-red-300" : "border-gray-300"
                      }`}
                      disabled={loading}
                    />
                  </div>
                  {errors.availableAfterTime && (
                    <p className="text-xs text-red-600 mt-1">{errors.availableAfterTime}</p>
                  )}
                </div>
              )}

              {formData.availability === "time-range" && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-16">From:</span>
                    <input
                      type="time"
                      name="availableFromTime"
                      value={formData.availableFromTime}
                      onChange={handleChange}
                      className={`flex-1 px-3 py-1.5 border rounded text-sm ${
                        errors.availableFromTime ? "border-red-300" : "border-gray-300"
                      }`}
                      disabled={loading}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-16">To:</span>
                    <input
                      type="time"
                      name="availableToTime"
                      value={formData.availableToTime}
                      onChange={handleChange}
                      className={`flex-1 px-3 py-1.5 border rounded text-sm ${
                        errors.availableToTime ? "border-red-300" : "border-gray-300"
                      }`}
                      disabled={loading}
                    />
                  </div>
                  {errors.availableToTime && (
                    <p className="text-xs text-red-600">{errors.availableToTime}</p>
                  )}
                </div>
              )}
            </div>

            {/* Status - Compact */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="sr-only"
                    disabled={loading}
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${
                    formData.active ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      formData.active ? 'left-5' : 'left-0.5'
                    }`}></div>
                  </div>
                </div>
                <span className="text-sm text-gray-700">
                  {formData.active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-gray-500">
                  ({formData.active ? 'Visible' : 'Hidden'})
                </span>
              </label>
            </div>

            {/* Images - Compact */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Images ({imagePreviews.length}/8)
                </label>
                {imagePreviews.length > 0 && (
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    + Add More
                  </button>
                )}
              </div>

              {/* Upload Button */}
              {imagePreviews.length === 0 && (
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center gap-1"
                >
                  <Upload className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">Click to upload</span>
                  <span className="text-xs text-gray-500">PNG, JPG up to 5MB</span>
                </button>
              )}

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={preview.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                  
                  {imagePreviews.length < 8 && (
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="aspect-square border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-indigo-400"
                    >
                      <Upload className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={loading}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 text-sm disabled:opacity-50 flex items-center gap-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Layers className="h-3 w-3" />
                  Create
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubcategoryModal;