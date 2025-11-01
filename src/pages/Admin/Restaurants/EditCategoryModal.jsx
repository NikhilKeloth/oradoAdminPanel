import { useState, useEffect } from "react";
import { FiX, FiChevronDown } from "react-icons/fi";
import { MdTranslate } from "react-icons/md";

const EditCategoryModal = ({ 
  onClose, 
  onSubmit, 
  category,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imagesToRemove: [],
    newImages: [],
    previewUrls: []
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        imagesToRemove: [],
        newImages: [],
        previewUrls: category.images || []
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      
      setFormData(prev => ({
        ...prev,
        newImages: [...prev.newImages, ...newFiles],
        previewUrls: [...prev.previewUrls, ...newPreviewUrls]
      }));
    }
  };

  const removeImage = (index, isExisting) => {
    if (isExisting) {
      // Mark existing image for removal
      setFormData(prev => ({
        ...prev,
        imagesToRemove: [...prev.imagesToRemove, prev.previewUrls[index]],
        previewUrls: prev.previewUrls.filter((_, i) => i !== index)
      }));
    } else {
      // Remove newly added image
      const newIndex = index - (formData.previewUrls.length - formData.newImages.length);
      setFormData(prev => ({
        ...prev,
        newImages: prev.newImages.filter((_, i) => i !== newIndex),
        previewUrls: prev.previewUrls.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim()
    }, category._id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h4 className="text-lg font-semibold">Edit Category</h4>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Category Name <span className="text-red-500 ml-1">*</span>
                <MdTranslate className="ml-2 text-gray-500" title="Multilingual Field" />
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength={90}
                placeholder="Enter category name"
                required
                className="w-full p-2 border rounded-md"
                disabled={isLoading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Description
                <MdTranslate className="ml-2 text-gray-500" title="Multilingual Field" />
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={240}
                placeholder="Please enter description"
                className="w-full p-2 border rounded-md"
                disabled={isLoading}
              />
            </div>

            {/* Image Gallery */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>
              
              {/* Current Images */}
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index}`}
                      className="h-20 w-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index, index < formData.previewUrls.length - formData.newImages.length)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isLoading}
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add More Images */}
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="category-image-upload"
                  multiple
                  disabled={isLoading}
                />
                <label htmlFor="category-image-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    <img
                      src="/assets/images/add_cat_dummy.svg"
                      alt="Add images"
                      className="h-10 w-12"
                    />
                    <div className="text-sm text-gray-500">
                      <p>Drag & drop or</p>
                      <p className="text-blue-600 hover:text-blue-800">browse from computer</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                disabled={isLoading || !formData.name.trim()}
              >
                {isLoading ? "Updating..." : "Update Category"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCategoryModal;