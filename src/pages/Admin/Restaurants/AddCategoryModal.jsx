import { useState } from "react";
import { FiX, FiChevronDown, FiUpload } from "react-icons/fi";
import { MdTranslate } from "react-icons/md";

const AddCategoryModal = ({ onClose, onAddCategory, isLoading = false }) => {
  const [formData, setFormData] = useState({
    language: "English",
    categoryName: "",
    description: "",
    image: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // ✅ Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, or WEBP images are allowed.");
      return;
    }

    // ✅ Check file size (limit: 10MB)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      alert("Image too large. Maximum size is 10MB.");
      return;
    }

    // ✅ Optional: check dimensions (e.g., min width/height)
    const img = new Image();
    img.onload = () => {
      if (img.width < 100 || img.height < 100) {
        alert("Image dimensions must be at least 100x100 pixels.");
        return;
      }

      // ✅ Passed all checks
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    };
    img.src = URL.createObjectURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAddCategory(formData);
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h4 className="text-lg font-semibold">Add Category</h4>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Language Dropdown */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <div className="relative">
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
                  disabled
                >
                  <option value="English">English</option>
                </select>
                <FiChevronDown className="absolute right-3 top-3 text-gray-500" />
              </div>
            </div>

            {/* Category Name */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Category NAME
                <span className="text-red-500 ml-1">*</span>
                <MdTranslate className="ml-2 text-gray-500 cursor-pointer" title="multilingual_field" />
              </label>
              <input
                type="text"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleChange}
                maxLength={90}
                placeholder="Enter name"
                className="w-full p-2 border rounded-md"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Description
                <MdTranslate className="ml-2 text-gray-500 cursor-pointer" title="multilingual_field" />
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={240}
                placeholder="Please enter description"
                className="w-full p-2 border rounded-md"
                disabled={isSubmitting}
              />
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="category-image-upload"
                  disabled={isSubmitting}
                />
                <label 
                  htmlFor="category-image-upload" 
                  className={`cursor-pointer ${isSubmitting ? 'opacity-50' : ''}`}
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    {formData.image ? (
                      <img 
                        src={URL.createObjectURL(formData.image)} 
                        alt="Preview" 
                        className="h-20 w-20 object-cover rounded-md"
                      />
                    ) : (
                      <img
                        src="/assets/images/add_cat_dummy.svg"
                        alt="Add category"
                        className="h-10 w-12 mx-auto"
                      />
                    )}
                    <div className="text-sm text-gray-500">
                      <p>Drag & Drop images, or</p>
                      <p className="text-blue-600 hover:text-blue-800">
                        browse from computer
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center min-w-20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  "Add"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;