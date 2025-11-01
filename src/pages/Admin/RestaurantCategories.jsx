import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ChevronRight,
  Star,
  Clock,
  Search,
  Plus,
  X,
  Edit2,
  Trash2,
} from "lucide-react";
import LoadingForAdmins from "./AdminUtils/LoadingForAdmins";
import apiClient from "../../apis/apiClient/apiClient";

const RestaurantCategories = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    active: true,
    autoOnOff: false,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const token = localStorage.getItem("adminToken");


  const fetchRestaurantAndCategories = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("adminToken"); // Or wherever your token is stored
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch restaurant data
        const restaurantRes = await apiClient.get(
          `/restaurants/${restaurantId}`,
          config
        );
        setRestaurant(restaurantRes.data.data);

        // Fetch categories
        const categoriesRes = await apiClient.get(
          `/admin/restaurant/${restaurantId}/category`,
          config
        );
        setCategories(categoriesRes.data.data || []);

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch restaurant data");
        console.error("Error:", err);
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchRestaurantAndCategories();
  }, [restaurantId]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/restaurants/${restaurantId}/categories/${categoryId}/items`);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category._id);
    setCategoryForm({
      name: category.name,
      description: category.description,
      active: category.active,
      autoOnOff: category.autoOnOff,
    });
    setExistingImages(category.images || []);
    setImagePreviews([]);
    setImageFiles([]);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      description: "",
      active: true,
      autoOnOff: false,
    });
    setExistingImages([]);
    setImagePreviews([]);
    setImageFiles([]);
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();

    if (categoryForm.description.length < 100) {
      alert("Description must be at least 100 characters long.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", categoryForm.name);
      formData.append("description", categoryForm.description);
      formData.append("active", categoryForm.active);
      formData.append("autoOnOff", categoryForm.autoOnOff);

      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      if (editingCategory) {
        const formData = new FormData();
        formData.append("name", categoryForm.name);
        formData.append("description", categoryForm.description);
        formData.append("active", categoryForm.active);
        formData.append("autoOnOff", categoryForm.autoOnOff || false);

        // ❗ Add this
        formData.append("restaurantId", restaurantId);

        imageFiles.forEach((file) => {
          formData.append("images", file);
        });

        const response = await apiClient.put(
          `/admin/restaurant/${restaurantId}/category/${editingCategory}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCategories(
          categories.map((cat) =>
            cat._id === editingCategory ? response.data.category : cat
          )
        );
      } else {
        // Create new category
        const response = await apiClient.post(
          `/admin/restaurant/${restaurantId}/category`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCategories([...categories, response.data.category]);
      }
      fetchRestaurantAndCategories()
      handleCancelEdit();
      setShowCreateForm(false);
      
    } catch (err) {
      console.error("Error saving category:", err);
      alert(
        err.response?.data?.message ||
          "Failed to save category. Please try again."
      );
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category? All items in this category will also be deleted."
      )
    ) {
      return;
    }

    try {
      await apiClient.delete(
        `/admin/restaurant/${restaurantId}/category/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            restaurantId: restaurantId,
          },
        }
      );
      setCategories(categories.filter((cat) => cat._id !== categoryId));
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Failed to delete category. Please try again.");
    }
  };


  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles([...imageFiles, ...files]);

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const removeImage = (index) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (index) => {
    const newImages = [...existingImages];
    newImages.splice(index, 1);
    setExistingImages(newImages);
  };

  if (loading) {
    return (
      <LoadingForAdmins/>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredCategories = categories.filter((category) =>
    category?.name?.toLowerCase().includes(searchTerm?.toLowerCase() || "")
  );

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-orange-500 text-sm font-medium"
            >
              <ChevronRight className="rotate-180 h-5 w-5 mr-1" />
              Back
            </button>
            <div className="relative w-1/2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 text-sm"
              />
            </div>
          </div>

          {restaurant && (
            <div className="flex items-center justify-between pb-2">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {restaurant.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {restaurant.cuisines?.join(", ") || "Multi-cuisine"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-xs bg-gray-100 px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                  <span>{restaurant.rating}</span>
                </div>
                <div className="flex items-center text-xs bg-gray-100 px-2 py-1 rounded-full">
                  <Clock className="h-3 w-3 text-orange-500 mr-1" />
                  <span>{restaurant.deliveryTime} mins</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {(categories.length > 0 || editingCategory) && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Menu Categories</h2>
            {!editingCategory && (
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  handleCancelEdit();
                }}
                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </button>
            )}
          </div>
        )}

        {(showCreateForm || editingCategory) && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h3>
              <button
                onClick={() => {
                  if (editingCategory) {
                    handleCancelEdit();
                  } else {
                    setShowCreateForm(false);
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitCategory}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="e.g. Appetizers, Main Course"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description*
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="At least 100 characters"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {categoryForm.description.length}/100 characters
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={categoryForm.active}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        active: e.target.checked,
                      })
                    }
                    className="form-checkbox h-4 w-4 text-orange-500 rounded focus:ring-orange-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>

                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={categoryForm.autoOnOff}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        autoOnOff: e.target.checked,
                      })
                    }
                    className="form-checkbox h-4 w-4 text-orange-500 rounded focus:ring-orange-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Auto On/Off
                  </span>
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Plus className="h-6 w-6 text-gray-400 mb-1" />
                    <p className="text-sm text-gray-500">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {(existingImages.length > 0 || imagePreviews.length > 0) && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {editingCategory ? "Current Images" : "Selected Images"}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {existingImages.map((src, idx) => (
                      <div key={`existing-${idx}`} className="relative group">
                        <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={src}
                            alt={`Existing ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3 text-gray-600" />
                        </button>
                      </div>
                    ))}
                    {imagePreviews.map((src, idx) => (
                      <div key={`new-${idx}`} className="relative group">
                        <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={src}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3 text-gray-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    if (editingCategory) {
                      handleCancelEdit();
                    } else {
                      setShowCreateForm(false);
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categoryForm.description.length < 100}
                  className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${
                    categoryForm.description.length < 100
                      ? "bg-orange-400 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  {editingCategory ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        )}

        {filteredCategories.length === 0 &&
        !showCreateForm &&
        !editingCategory ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-10 w-10 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              No Categories Found
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              Get started by creating your first menu category
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              Create Category
            </button>
          </div>
        ) : (
          !editingCategory && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCategories.map((category) => (
                <div
                  key={category._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden relative"
                >
                  <div
                    className="h-40 w-full cursor-pointer"
                    onClick={() => handleCategoryClick(category._id)}
                  >
                    {category?.images?.length > 0 ? (
                      <img
                        src={category.images[0]}
                        alt={category.name || "Category image"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(category);
                      }}
                      className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100"
                      title="Edit category"
                    >
                      <Edit2 className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category._id);
                      }}
                      className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100"
                      title="Delete category"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {category.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => handleCategoryClick(category._id)}
                  >
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {category.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-400">
                      <span>View items</span>
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default RestaurantCategories;
