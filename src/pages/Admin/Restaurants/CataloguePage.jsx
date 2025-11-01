import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FiChevronLeft,
  FiSearch,
  FiPlus,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiX,
} from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import {
  addCategory,
  fetchCategoryProducts,
  fetchRestaurantCategories,
} from "../../../apis/adminApis/adminFuntionsApi";
import AddCategoryModal from "./AddCategoryModal";
import AddProductPage from "./AddProductPage";
import {
  updateCategory,
  toggleCategoryActiveStatus,
  deleteCategory,
  createProduct,
  getStoreById,
  updateProductById,
  createCategory,
  deleteProduct,
  toggleProductStatus,
} from "../../../apis/adminApis/storeApi";
import EditProductPage from "./EditProductPage";
import { toast } from "react-toastify";
import EditCategoryModal from "./EditCategoryModal";
import socket, {
  connectSocket,
  disconnectSocket,
} from "../../../services/socket";

const MerchantCataloguePage = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const { id } = useParams();
  const [activeFilter, setActiveFilter] = useState("approved");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [loading, setLoading] = useState({
    categories: false,
    products: false,
    store: false,
    actions: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState({
    categories: null,
    products: null,
    store: null,
  });
  const [storeData, setStoreData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editModalState, setEditModalState] = useState({
    show: false,
    product: null,
  });
 


  // Category edit state
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [currentEditCategory, setCurrentEditCategory] = useState(null);

  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close category dropdowns when clicking outside
      if (!event.target.closest(".product-dropdown")) {
        setOpenDropdown(null);
      }
      // Close product dropdowns when clicking outside
      if (!event.target.closest(".product-dropdown")) {
        setShowDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch store and categories when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading((prev) => ({ ...prev, store: true, categories: true }));

        const store = await getStoreById(id);
        setStoreData(store);

        const categoriesData = await fetchRestaurantCategories(id);
        setCategories(categoriesData);

        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0]);
        }
      } catch (err) {
        setError((prev) => ({
          ...prev,
          store: err.message,
          categories: err.message,
        }));
        toast.error("Failed to load initial data");
      } finally {
        setLoading((prev) => ({ ...prev, store: false, categories: false }));
      }
    };

    fetchInitialData();
  }, [id]);

  // Fetch products when selected category or filters change
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchProducts = async () => {
      setLoading((prev) => ({ ...prev, products: true }));
      setError((prev) => ({ ...prev, products: null }));

      try {
        const productsData = await fetchCategoryProducts(
          id,
          selectedCategory._id,
          activeFilter,
          searchQuery
        );
      

        setProducts(productsData);
        setSelectedProduct(productsData[0] || null);
      } catch (err) {
        setError((prev) => ({ ...prev, products: err.message }));
        toast.error("Failed to load products");
      } finally {
        setLoading((prev) => ({ ...prev, products: false }));
      }
    };

    const debounceTimer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [id, selectedCategory, activeFilter, searchQuery]);

  // Inside your component
  useEffect(() => {
    // Connect to socket when component mounts
    socket.connect();

    const handleConnect = () => {
      console.log("Socket connected");

      const adminId = localStorage.getItem("userId");
      if (!adminId) {
        console.error("No admin ID found in session storage");
        setError("Authentication error: Please log in again");
        return;
      }

      socket.emit(
        "join-room",
        {
          userId: adminId,
          userType: "admin",
        },
        (response) => {
          if (response && response.success) {
            console.log("Successfully joined admin room");
          } else {
            console.error("Failed to join admin room:", response?.message);
          }
        }
      );
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
    };

    const handleStockUpdate = ({ productId, newStock }) => {
      
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId ? { ...product, stock: newStock } : product
        )
      );

      // Update selected product if it's the one being updated
      setSelectedProduct((prevSelected) =>
        prevSelected?._id === productId
          ? { ...prevSelected, stock: newStock }
          : prevSelected
      );
    };
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("stockUpdated", handleStockUpdate);

    // Cleanup on unmount
    return () => {
      socket.off("stockUpdated", handleStockUpdate);

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      disconnectSocket();
    };
  }, []); // Empty dependency array means this runs once on mount and cleanup on unmount

  // Category handlers
  const openEditCategoryModal = (category) => {
    console.log("Opening edit category modal for:", category.name);
    alert("Opening edit category modal for: " + category.name);
    setCurrentEditCategory(category);
    setEditCategoryModalOpen(true);
    setOpenDropdown(null);
  };

  const closeEditCategoryModal = () => {
    console.log("Closing edit category modal");
    setEditCategoryModalOpen(false);
    setCurrentEditCategory(null);
  };

  const handleUpdateCategory = async (updatedData) => {
    try {
      setLoading((prev) => ({ ...prev, actions: true }));

      const updatedCategory = await updateCategory(
        currentEditCategory._id,
        updatedData
      );

      // Update categories list
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === currentEditCategory._id ? updatedCategory : cat
        )
      );

      // Update selectedCategory if it's the one being edited
      if (selectedCategory?._id === currentEditCategory._id) {
        setSelectedCategory(updatedCategory);
      }

      closeEditCategoryModal();
      toast.success("Category updated successfully");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    } finally {
      setLoading((prev) => ({ ...prev, actions: false }));
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      setLoading((prev) => ({ ...prev, actions: true }));

      await deleteCategory(categoryId);

      setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));

      if (selectedCategory?._id === categoryId) {
        setSelectedCategory(categories[0] || null);
      }

      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    } finally {
      setLoading((prev) => ({ ...prev, actions: false }));
    }
  };

  const handleToggleCategoryActive = async (categoryId, currentStatus) => {
    try {
      setLoading((prev) => ({ ...prev, actions: true }));

      const updatedCategory = await toggleCategoryActiveStatus(
        categoryId,
        !currentStatus
      );

      setCategories((prev) =>
        prev.map((cat) => (cat._id === categoryId ? updatedCategory : cat))
      );

      if (selectedCategory?._id === categoryId) {
        setSelectedCategory(updatedCategory);
      }

      toast.success(
        `Category ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Error toggling category status:", error);
      toast.error("Failed to update category status");
    } finally {
      setLoading((prev) => ({ ...prev, actions: false }));
    }
  };

  const handleAddCategory = async (categoryData) => {
    try {
      setLoading((prev) => ({ ...prev, actions: true }));

      const payload = {
        restaurantId: storeData._id,
        active: true,
        name: categoryData.categoryName,
        ...categoryData,
      };
      console.log(categoryData);

      const newCategory = await createCategory(payload, [categoryData.image]);
      console.log(newCategory);

      // Refresh categories from server to get the most up-to-date list
      const refreshedCategories = await fetchRestaurantCategories(id);
      setCategories(refreshedCategories);

      // Select the newly created category
      const createdCategory = refreshedCategories.find(
        (c) => c._id === newCategory.data._id
      );
      if (createdCategory) {
        setSelectedCategory(createdCategory);
      }

      setShowModal(false);
      toast.success("Category added successfully");
    } catch (error) {
      toast.error("Failed to add category");
      console.error("Error adding category:", error);
    } finally {
      setLoading((prev) => ({ ...prev, actions: false }));
    }
  };

  // Product handlers
  const openEditProductModal = (product) => {
    console.log("Opening edit product modal for:", product.name);
    alert("Opening edit product modal for: " + product.name);
    setEditModalState({
      show: true,
      product: product,
    });
    setShowDropdown(null);
  };

  const closeEditProductModal = () => {
    console.log("Closing edit product modal");
    setEditModalState({ show: false, product: null });
  };

  const handleProductCreate = async (productData) => {
    try {
      setLoading((prev) => ({ ...prev, actions: true }));

      const newProduct = await createProduct(
        productData,
        storeData._id,
        selectedCategory._id
      );

      // Refresh products from server to get the most up-to-date list
      const refreshedProducts = await fetchCategoryProducts(
        id,
        selectedCategory._id,
        activeFilter,
        searchQuery
      );

      setProducts(refreshedProducts);

      // Find and select the newly created product
      const createdProduct = refreshedProducts.find(
        (p) => p._id === newProduct._id
      );
      setSelectedProduct(createdProduct || refreshedProducts[0] || null);

      setShowAddProduct(false);
      toast.success("Product created successfully");
    } catch (error) {
      toast.error("Failed to create product");
      console.error("Error creating product:", error);
    } finally {
      setLoading((prev) => ({ ...prev, actions: false }));
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      setLoading((prev) => ({ ...prev, actions: true }));

      const response = await updateProductById(
        selectedProduct._id,
        productData,
        productData.imagesToRemove,
        productData.newImages
      );

      // Refresh products from server to get the most up-to-date list
      const refreshedProducts = await fetchCategoryProducts(
        id,
        selectedCategory._id,
        activeFilter,
        searchQuery
      );

      setProducts(refreshedProducts);

      // Find and select the updated product
      const updatedProduct = refreshedProducts.find(
        (p) => p._id === selectedProduct._id
      );
      setSelectedProduct(updatedProduct || refreshedProducts[0] || null);

      closeEditProductModal();
      toast.success("Product updated successfully");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.message || "Failed to update product");
    } finally {
      setLoading((prev) => ({ ...prev, actions: false }));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      setLoading((prev) => ({ ...prev, actions: true }));

      await deleteProduct(productId, storeData._id);

      setProducts((prevProducts) => {
        const updated = prevProducts.filter((p) => p._id !== productId);

        if (selectedProduct?._id === productId) {
          setSelectedProduct(updated[0] || null);
        }

        return updated;
      });

      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete product");
      console.error("Error deleting product:", error);
    } finally {
      setLoading((prev) => ({ ...prev, actions: false }));
    }
  };

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      setLoading((prev) => ({ ...prev, actions: true }));

      // Optimistically update local state first
      const newStatus = !currentStatus;
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId
            ? { ...product, active: newStatus }
            : product
        )
      );

      // Update selectedProduct if it's the one being toggled
      if (selectedProduct?._id === productId) {
        setSelectedProduct((prev) => ({ ...prev, active: newStatus }));
      }

      // Then make the API call
      const updatedProduct = await toggleProductStatus(productId);
      console.log(updatedProduct);

      // Update with the actual response from API
      if (updatedProduct.data) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === productId ? updatedProduct.data : product
          )
        );

        if (selectedProduct?._id === productId) {
          setSelectedProduct(updatedProduct.data);
        }
      }

      toast.success(
        updatedProduct.message || "Product status updated successfully"
      );
    } catch (error) {
      // Revert the state on error
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId
            ? { ...product, active: currentStatus }
            : product
        )
      );

      if (selectedProduct?._id === productId) {
        setSelectedProduct((prev) => ({ ...prev, active: currentStatus }));
      }

      toast.error("Failed to update product status");
      console.error("Error toggling product status:", error);
    } finally {
      setLoading((prev) => ({ ...prev, actions: false }));
    }
  };
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-8">
            <li>
              <Link
                to={`/admin/dashboard/merchants/merchant-config/${id}`}
                className={`px-4 py-3 block ${
                  location.pathname ===
                  `/admin/dashboard/merchants/merchant-config/${id}`
                    ? "border-b-2 border-orange-500 text-orange-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                Configurations
              </Link>
            </li>
            <li>
              <Link
                to={`/admin/dashboard/merchants/merchant-catelogue/${id}`}
                className={`px-4 py-3 block ${
                  location.pathname ===
                  `/admin/dashboard/merchants/merchant-catelogue/${id}`
                    ? "border-b-2 border-orange-500 text-orange-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                Catalogue
              </Link>
            </li>
            <li>
              <Link
                to={`/admin/dashboard/merchants/merchant-details/${id}`}
                className={`px-4 py-3 block ${
                  location.pathname ===
                  `/admin/dashboard/merchants/merchant-details/${id}`
                    ? "border-b-2 border-orange-500 text-orange-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                Merchant
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Error messages */}
      {error.categories && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          Failed to load categories: {error.categories}
        </div>
      )}
      {error.products && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          Failed to load products: {error.products}
        </div>
      )}

      {/* Catalog Content */}
      <div className="flex flex-col lg:flex-row gap-6 mt-10">
        {/* Categories Column */}
        <div className="lg:w-1/4 bg-white rounded-lg shadow-sm p-2 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">
              Categories ({categories.length})
            </h3>
            <button
              onClick={() => setShowModal(true)}
              className="p-1 text-blue-600 hover:text-blue-800"
              disabled={loading.categories}
            >
              <FiPlus size={20} />
            </button>
          </div>

          {showModal && (
            <AddCategoryModal
              onClose={() => setShowModal(false)}
              onAddCategory={handleAddCategory}
              isLoading={loading.actions}
            />
          )}

          {loading.categories ? (
            <div className="text-center py-4 text-gray-500">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No categories found
            </div>
          ) : (
            <ul className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {categories.map((category) => (
                <li
                  key={category._id}
                  className={`p-3 rounded-md flex justify-between items-center cursor-pointer transition-colors relative ${
                    selectedCategory?._id === category._id
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <span
                    className={`truncate ${
                      category.active ? "font-medium" : "text-gray-500"
                    }`}
                    title={category.name}
                  >
                    {category.name}
                  </span>
                  <div className="flex items-center">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded mr-2">
                      {category.productCount || 0}
                    </span>
                    <div className="relative product-dropdown">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setOpenDropdown(
                            openDropdown === category._id ? null : category._id
                          );
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
                      >
                        <FiMoreVertical size={16} />
                      </button>

                      {openDropdown === category._id && (
                        <div
                          className="absolute right-0 top-8 z-[9999] w-40 bg-white rounded-md shadow-xl border border-gray-200 min-w-max"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log(
                                  "Edit button clicked for category:",
                                  category
                                );
                                alert(
                                  "Edit button clicked for category: " +
                                    category.name
                                );
                                openEditCategoryModal(category);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <FiEdit className="mr-2" /> Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteCategory(category._id);
                                setOpenDropdown(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                            >
                              <FiTrash2 className="mr-2" /> Delete
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleToggleCategoryActive(
                                  category._id,
                                  category.active
                                );
                                setOpenDropdown(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              {category.active ? (
                                <FiEyeOff className="mr-2" />
                              ) : (
                                <FiEye className="mr-2" />
                              )}
                              {category.active ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Products Column */}
        <div className="lg:w-1/4 bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">
              Products ({products.length})
            </h3>
            <button
              onClick={() => setShowAddProduct(true)}
              className="p-1 text-blue-600 hover:text-blue-800"
              disabled={!selectedCategory || loading.products}
            >
              <FiPlus size={20} />
            </button>
          </div>

          {loading.products ? (
            <div className="text-center py-4 text-gray-500">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              {selectedCategory
                ? "No products in this category"
                : "Select a category to view products"}
            </div>
          ) : (
            <ul className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {products.map((product) => (
                <li
                  key={product._id}
                  className={`p-3 rounded-md flex justify-between items-center transition-colors ${
                    selectedProduct?._id === product._id
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div
                    className="flex-grow cursor-pointer truncate"
                    onClick={() => setSelectedProduct(product)}
                    title={product.name}
                  >
                    <span
                      className={`${
                        product.active ? "font-medium" : "text-gray-500"
                      }`}
                    >
                      {product.name}
                    </span>
                  </div>

                  <div className="relative product-dropdown">
                    <button
                      className="p-1 rounded hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.target.getBoundingClientRect();
                        setDropdownPosition({
                          top: rect.bottom + 5,
                          left: rect.right - 192,
                        });
                        setShowDropdown(
                          showDropdown === product._id ? null : product._id
                        );
                      }}
                      disabled={loading.actions}
                    >
                      <FiMoreVertical className="text-gray-500" />
                    </button>

                    {showDropdown === product._id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-[9999] border border-gray-200 min-w-max">
                        <div className="py-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Edit product clicked:", product);
                              alert(
                                "Edit button clicked for product: " +
                                  product.name
                              );
                              openEditProductModal(product);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            disabled={loading.actions}
                          >
                            <FiEdit className="mr-2" /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(product._id);
                              setShowDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                            disabled={loading.actions}
                          >
                            <FiTrash2 className="mr-2" /> Delete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(product._id, product.active);
                              setShowDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            disabled={loading.actions}
                          >
                            {product.active ? (
                              <>
                                <FiEyeOff className="mr-2" /> Deactivate
                              </>
                            ) : (
                              <>
                                <FiEye className="mr-2" /> Activate
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>









        {/* Product Details Column */}
        <div className="lg:w-2/4 bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Product Details</h3>

          {selectedProduct ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/3">
                  <img
                    src={
                      selectedProduct.images?.[0] ||
                      "https://via.placeholder.com/300"
                    }
                    alt={selectedProduct.name}
                    className="w-full h-auto rounded-md object-cover aspect-square"
                  />
                </div>
                <div className="md:w-2/3 space-y-3">
                  <h4 className="text-xl font-bold">{selectedProduct.name}</h4>
                  <p className="text-lg font-semibold text-gray-700">
                    ${selectedProduct.price?.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedProduct.foodType === "veg"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedProduct.foodType === "veg"
                        ? "Vegetarian"
                        : "Non-Vegetarian"}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
                      {selectedProduct.unit || "piece"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProduct.active}
                        onChange={() =>
                          handleToggleActive(
                            selectedProduct._id,
                            selectedProduct.active
                          )
                        }
                        className="sr-only peer"
                        disabled={loading.actions}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                    <span className="text-xs font-medium">
                      {selectedProduct.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="text-gray-600 line-clamp-3">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>

              {/* <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Inventory Tracking</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProduct.enableInventory || false}
                        readOnly
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>

                  {selectedProduct.enableInventory && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Current Stock</p>
                        <p className="font-medium">
                          {selectedProduct.stock || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Reorder Level</p>
                        <p className="font-medium">
                          {selectedProduct.reorderLevel || 0}
                        </p>
                      </div>
                    </div>
                  )}
                </div> */}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Preparation Time</p>
                    <p className="font-medium">
                      {selectedProduct.preparationTime
                        ? `${selectedProduct.preparationTime} mins`
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Quantities</p>
                    <p className="font-medium">
                      Min: {selectedProduct.minimumOrderQuantity || 1}, Max:{" "}
                      {selectedProduct.maximumOrderQuantity || "No limit"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Availability</p>
                    <p className="font-medium capitalize">
                      {selectedProduct.availability === "time-based"
                        ? `Scheduled (after ${selectedProduct.availableAfterTime})`
                        : selectedProduct.availability?.replace("_", " ") ||
                          "Always"}
                    </p>
                  </div>

                 <div>
  {selectedProduct.enableInventory && (
    <>
      <p className="text-sm text-gray-500">Stock</p>
      <p className="font-medium">
        {selectedProduct.stock || 0} {selectedProduct.unit || ""}
      </p>
    </>
  )}
</div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p
                      className={`font-medium ${
                        selectedProduct.active
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {selectedProduct.active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Full Description</h4>
                <p className="text-gray-600 whitespace-pre-line">
                  {selectedProduct.description || "No description available"}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {products.length === 0
                ? "No products available"
                : "Select a product to view details"}
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <AddProductPage
          onClose={() => setShowAddProduct(false)}
          merchantName={storeData?.name || ""}
          categoryName={selectedCategory?.name || ""}
          onAddProduct={handleProductCreate}
        />
      )}

      {/* Edit Product Modal */}
      {console.log("Product modal state:", editModalState)}
      {editModalState.show && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            background: "blue",
            color: "white",
            zIndex: 99999,
            padding: "10px",
          }}
        >
          DEBUG: Product Modal is open! Product: {editModalState.product?.name}
        </div>
      )}
      {editModalState.show && editModalState.product && (
        <EditProductPage
          onClose={closeEditProductModal}
          merchantName={storeData?.name || ""}
          categoryName={selectedCategory?.name || ""}
          onUpdateProduct={handleUpdateProduct}
          initialData={editModalState.product}
        />
      )}

      {/* Edit Category Modal */}
      {console.log("Modal state:", {
        editCategoryModalOpen,
        currentEditCategory,
      })}
      {editCategoryModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            background: "red",
            color: "white",
            zIndex: 99999,
            padding: "10px",
          }}
        >
          DEBUG: Modal is open! Category: {currentEditCategory?.name}
        </div>
      )}
      {editCategoryModalOpen && currentEditCategory && (
        <EditCategoryModal
          onClose={closeEditCategoryModal}
          onSubmit={handleUpdateCategory}
          category={currentEditCategory}
          isLoading={loading.actions}
        />
      )}
    </div>
  );
};

export default MerchantCataloguePage;
