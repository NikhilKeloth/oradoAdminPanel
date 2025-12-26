import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

// Components
import CreateCategoryModal from "../../../components/catelog/CreateCategoryModal";
import AddProductPage from "../../../components/catelog/AddProductPage";
import DeleteConfirmationModal from "../../../components/catelog/DeleteConfirmationModal";
import ImportCategoriesModal from "../../../components/catelog/ImportCategoriesModal";
import BulkEditCategoriesModal from "../../../components/catelog/BulkEditCategoriesModal";
import ImportProductsModal from "../../../components/catelog/ImportProductsModal";
import BulkEditProductsModal from "../../../components/catelog/BulkEditProductsModal";

// New Components
import CategoriesColumn from "./CategoriesColumn";
import ProductsColumn from "./ProductsColumn";
import ProductDetails from "./ProductDetails";
import Header from "./Header";

// API functions
import {
  getStoreById,
  fetchCategoryProducts,
  fetchRestaurantCategories,
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  updateProductById,
  toggleProductStatus,
  updateCategory,
  downloadCategoryTemplate,
  importCategoriesExcel,
  exportCategoriesExcel,
  bulkEditCategoriesExcel,
  exportProducts,
  bulkEditProducts,
  toggleCategoryStatus,
  archiveProduct,
  unarchiveProduct
} from "../../../apis/adminApis/storeApi2";

import { archiveCategory, unarchiveCategory } from "../../../apis/adminApis/storeApi";

function CatelogManagement() {
  const id = useParams().id;
  const navigate = useNavigate();
  const location = useLocation();

  // ALL STATE VARIABLES FROM ORIGINAL
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoryDropdown, setCategoryDropdown] = useState(null);
  const [productDropdown, setProductDropdown] = useState(null);
  const [loading, setLoading] = useState({
    categories: false,
    products: false,
    store: false,
    actions: false,
    categoryCreate: false,
    categoryEdit: false,
  });
  const [error, setError] = useState({
    categories: null,
    products: null,
    store: null,
  });
  const [showModal, setShowModal] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [deleteMode, setDeleteMode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactiveProducts, setShowInactiveProducts] = useState(false);
  const [openProductDropdown, setOpenProductDropdown] = useState(null);
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState(null);
  const [showProdutDeleteModal, setShowProductDeleteModal] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isProductImportModalOpen, setIsProductImportModalOpen] = useState(false);
  const [isBulkProductModalOpen, setIsBulkProductModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [importMessage, setImportMessage] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  const fileInputRef = useRef(null);

  // ALL FUNCTIONS FROM ORIGINAL

  // Format functions
  const formatProduct = (product) => ({
    id: product._id,
    _id: product._id,
    categoryId: product.categoryId,
    name: product.name,
    price: product.price,
    foodType: product.foodType,
    unit: product.unit,
    status: product.active ? "Active" : "Inactive",
    active: product.active,
    archived: product.archived || false,
    archivedAt: product.archivedAt || null,
    preparationTime: product.preparationTime,
    minOrderQty: product.minimumOrderQuantity,
    maxOrderQty: product.maximumOrderQuantity,
    availability: product.availability || "always",
    availableAfterTime: product.availableAfterTime || "",
    availableFromTime: product.availableFromTime || "",
    availableToTime: product.availableToTime || "",
    description: product.description,
    images: product.images || [],
    stock: product.enableInventory ? product.stock : undefined,
    enableInventory: product.enableInventory,
    reorderLevel: product.reorderLevel,
    isLowStock: product.enableInventory && product.stock < product.reorderLevel,
    costPrice: product.costPrice,
    revenueShare: product.revenueShare,
    specialOffer: product.specialOffer,
    restaurantId: product.restaurantId,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  });

  const formatCategory = (category) => ({
    _id: category._id,
    name: category.name,
    productCount: category.productCount || 0,
    isActive: category.active,
    active: category.active,
    archived: category.archived,
    images: category.images,
    description: category.description,
    availability: category.availability || 'always',
    availableAfterTime: category.availableAfterTime || '',
    availableFromTime: category.availableFromTime || '',
    availableToTime: category.availableToTime || '',
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading((prev) => ({ ...prev, categories: true }));
      const categoriesData = await fetchRestaurantCategories(id);
      const formattedCategories = categoriesData.map(formatCategory);
      setCategories(formattedCategories);
    } catch (err) {
      console.error(err);
      setError((prev) => ({ ...prev, categories: err.message }));
      toast.error("Failed to load categories");
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }));
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading((prev) => ({ ...prev, store: true, categories: true }));
        const restaurantData = await getStoreById(id);
        setRestaurant(restaurantData);
        const categoriesData = await fetchRestaurantCategories(id);
        const formattedCategories = categoriesData.map(formatCategory);
        setCategories(formattedCategories);
        if (formattedCategories.length > 0) {
          setSelectedCategory(formattedCategories[0]._id);
        }
      } catch (err) {
        console.error(err);
        setError((prev) => ({ ...prev, store: err.message, categories: err.message }));
        toast.error("Failed to load initial data");
      } finally {
        setLoading((prev) => ({ ...prev, store: false, categories: false }));
      }
    };
    fetchInitialData();
  }, [id]);

  // Fetch products when category changes
  useEffect(() => {
    if (!selectedCategory) return;
    
    const fetchProducts = async () => {
      setLoading((prev) => ({ ...prev, products: true }));
      setError((prev) => ({ ...prev, products: null }));
      
      try {
        const productsData = await fetchCategoryProducts(id, selectedCategory);
        const formattedProducts = productsData.map(formatProduct);
        setProducts(formattedProducts);
        if (formattedProducts.length > 0) {
          setSelectedProduct(formattedProducts[0].id);
        }
      } catch (err) {
        console.error(err);
        setError((prev) => ({ ...prev, products: err.message }));
        toast.error("Failed to load products");
      } finally {
        setLoading((prev) => ({ ...prev, products: false }));
      }
    };
    
    fetchProducts();
  }, [id, selectedCategory]);

  // Dropdown handlers
  const toggleProductDropdown = (productId, e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left - 150,
    });
    setProductDropdown(productDropdown === productId ? null : productId);
    setCategoryDropdown(null);
  };

  const toggleCategoryDropdown = (categoryId, e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left - 150,
    });
    setCategoryDropdown(categoryDropdown === categoryId ? null : categoryId);
    setProductDropdown(null);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setCategoryDropdown(null);
      setProductDropdown(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Category Handlers
  const handleDisableCategory = async (categoryId) => {
    try {
      const category = categories.find(cat => cat._id === categoryId);
      const categoryName = category?.name || 'Category';
      await toggleCategoryStatus(categoryId);
      await fetchCategories();
      toast.success(`🚫 "${categoryName}" has been disabled!`, { duration: 4000 });
    } catch (error) {
      console.error('Failed to disable category:', error);
      toast.error('❌ Failed to disable category');
    }
  };

  const handleEnableCategory = async (categoryId) => {
    try {
      const category = categories.find(cat => cat._id === categoryId);
      const categoryName = category?.name || 'Category';
      await toggleCategoryStatus(categoryId);
      await fetchCategories();
      toast.success(`✅ "${categoryName}" has been enabled!`, { duration: 4000 });
    } catch (error) {
      console.error('Failed to enable category:', error);
      toast.error('❌ Failed to enable category');
    }
  };

  const handleCategoryCreate = async (newCategory) => {
    try {
      setLoading((prev) => ({ ...prev, actions: true }));
      const response = await createCategory(newCategory);
      setCategories((prevCategories) => [...prevCategories, response.data]);
      toast.success("Category created successfully");
      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error("Error creating category:", err);
      setError((prev) => ({ ...prev, actions: err.message }));
      toast.error("Failed to create category");
    } finally {
      setLoading((prev) => ({ ...prev, actions: false }));
    }
  };

  const handleEditCategory = async (editedCategory) => {
    try {
      setLoading((prev) => ({ ...prev, actions: true }));
      const { imageFiles = [], imagesToRemove = [], _id, ...categoryData } = editedCategory;
      const apiData = {
        name: categoryData.name,
        description: categoryData.description,
        availability: categoryData.availability,
        restaurantId: categoryData.restaurantId,
        active: categoryData.active === 'true' ? 'true' : String(Boolean(categoryData.active)),
        autoOnOff: categoryData.autoOnOff || 'false',
        availableAfterTime: categoryData.availableAfterTime,
        availableFromTime: categoryData.availableFromTime,
        availableToTime: categoryData.availableToTime
      };
      const response = await updateCategory(_id, apiData, imagesToRemove, imageFiles);
      const formattedCategory = formatCategory(response.data);
      setCategories((prev) => prev.map((c) => (c._id === _id ? formattedCategory : c)));
      if (selectedCategory === _id) setSelectedCategory(_id);
      toast.success("Category updated successfully");
      setIsEditCategoryModalOpen(false);
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    } finally {
      setLoading((prev) => ({ ...prev, actions: false }));
    }
  };

  const handleArchiveCategory = async (categoryId) => {
    try {
      toast.success('Category archived successfully! 📁');
      await archiveCategory(categoryId);
      await fetchCategories();
    } catch (error) {
      console.error('Failed to archive category:', error);
      toast.error('Failed to archive category');
    }
  };

  const handleUnarchiveCategory = async (categoryId) => {
    try {
      await unarchiveCategory(categoryId);
      await fetchCategories();
      toast.success('Category unarchived successfully! 🔄');
    } catch (error) {
      console.error('Failed to unarchive category:', error);
      toast.error('Failed to restore category');
    }
  };

  // Product Handlers
  const handleProductCreate = async (productData) => {
    try {
      setLoading((prev) => ({ ...prev, products: true }));
      const newImages = productData.images.filter((img) => img instanceof File);
      const existingImages = productData.images.filter((img) => typeof img === "string");
      const preparedProductData = {
        ...productData,
        images: existingImages,
        ...(productData.availability === "time-based" && {
          availableAfterTime: productData.availableAfterTime,
          availableFromTime: null,
          availableToTime: null
        }),
        ...(productData.availability === "time-range" && {
          availableFromTime: productData.availableFromTime,
          availableToTime: productData.availableToTime,
          availableAfterTime: null
        }),
        ...(productData.availability === "always" && {
          availableAfterTime: null,
          availableFromTime: null,
          availableToTime: null
        }),
        ...(productData.availability === "out-of-stock" && {
          availableAfterTime: null,
          availableFromTime: null,
          availableToTime: null
        })
      };
      const response = await createProduct(preparedProductData, id, selectedCategory);
      const formattedData = formatProduct(response.data);
      setProducts((prevProducts) => [...prevProducts, formattedData]);
      setSelectedProduct(response.data._id);
      toast.success("Product created successfully");
      setIsProductModalOpen(false);
    } catch (err) {
      console.error("Error creating product:", err);
      setError((prev) => ({ ...prev, products: err.message }));
      toast.error("Failed to create product");
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  };

  const handleEditProduct = async (product) => {
    try {
      setLoading((prev) => ({ ...prev, products: true }));
      const newImages = product.images.filter((img) => img instanceof File);
      const existingImages = product.images.filter((img) => typeof img === "string");
      const productData = {
        ...product,
        images: existingImages,
        ...(product.availability === "time-based" && {
          availableAfterTime: product.availableAfterTime,
          availableFromTime: null,
          availableToTime: null
        }),
        ...(product.availability === "time-range" && {
          availableFromTime: product.availableFromTime,
          availableToTime: product.availableToTime,
          availableAfterTime: null
        }),
        ...(product.availability === "always" && {
          availableAfterTime: null,
          availableFromTime: null,
          availableToTime: null
        }),
        ...(product.availability === "out-of-stock" && {
          availableAfterTime: null,
          availableFromTime: null,
          availableToTime: null
        })
      };
      const response = await updateProductById(
        product._id,
        productData,
        product.imagesToRemove || [],
        newImages
      );
      const formattedData = formatProduct(response.data);
      setProducts((prevProducts) => prevProducts.map((p) => (p._id === product._id ? formattedData : p)));
      toast.success("Product updated successfully");
      setIsEditProductModalOpen(false);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update product");
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  };

  const handleUnarchiveProduct = async (productId) => {
    try {
      const product = products.find(p => p._id === productId);
      const productName = product?.name || 'Product';
      await unarchiveProduct(productId);
      if (selectedCategory) {
        const productsData = await fetchCategoryProducts(id, selectedCategory);
        const formattedProducts = productsData.map(formatProduct);
        setProducts(formattedProducts);
      }
      toast.success(`🔄 "${productName}" has been unarchived!`);
    } catch (error) {
      console.error('Failed to unarchive product:', error);
      toast.error('❌ Failed to unarchive product');
    }
  };

  const handleArchiveProduct = async (productId) => {
    try {
      const product = products.find(p => p._id === productId);
      const productName = product?.name || 'Product';
      await archiveProduct(productId);
      if (selectedCategory) {
        const productsData = await fetchCategoryProducts(id, selectedCategory);
        const formattedProducts = productsData.map(formatProduct);
        setProducts(formattedProducts);
      }
      toast.success(`📁 "${productName}" has been archived!`);
    } catch (error) {
      console.error('Failed to archive product:', error);
      toast.error('❌ Failed to archive product');
    }
  };

  const handleToggleProductActive = async (productId) => {
    try {
      const response = await toggleProductStatus(productId);
      const product = response.data;
      const formattedData = formatProduct(product);
      setProducts((prevProducts) => prevProducts.map((p) => (p._id === product._id ? formattedData : p)));
      if (product.active) {
        toast.success("✅ Product is now available");
      } else {
        toast.info("🚫 Product is now unavailable");
      }
    } catch (error) {
      console.error('Failed to toggle product status:', error);
    }
  };

  const handleProductDelete = async (productId) => {
    try {
      if (!productId) {
        toast.error("Invalid product ID");
        return;
      }
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      await deleteProduct(productId);
      toast.success("Product deleted successfully");
      setShowModal(false);
      setDeleteProductId(null);
      setDeleteMode("");
      if (selectedProduct === productId) setSelectedProduct(null);
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete product");
      setShowModal(false);
      setDeleteProductId(null);
      setDeleteMode("");
    }
  };

  const HandleDeleteCategory = async (categoryId) => {
    try {
      if (!categoryId) {
        toast.error("Invalid category ID");
        return;
      }
      const originalCategories = [...categories];
      const originalProducts = [...products];
      setCategories((prev) => prev.filter((c) => c._id !== categoryId));
      setProducts((prev) => prev.filter((p) => p.categoryId !== categoryId));
      await deleteCategory(categoryId);
      toast.success("Category deleted successfully");
      setShowModal(false);
      setDeleteCategoryId(null);
      setDeleteMode("");
    } catch (error) {
      console.error("Error deleting category:", error);
      setCategories(originalCategories);
      setProducts(originalProducts);
      toast.error("Failed to delete category");
      setShowModal(false);
      setDeleteCategoryId(null);
      setDeleteMode("");
    }
  };

  // Refresh products function
  const refreshProducts = async () => {
    if (!selectedCategory) return;
    try {
      setLoading((prev) => ({ ...prev, products: true }));
      const productsData = await fetchCategoryProducts(id, selectedCategory);
      const formattedProducts = productsData.map(formatProduct);
      setProducts(formattedProducts);
      toast.success("Products refreshed successfully");
    } catch (err) {
      toast.error("Failed to refresh products");
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesCategory = product.categoryId === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showInactiveProducts ? true : product.active;
    
    return matchesCategory && matchesSearch && matchesStatus;
  });

  const currentProduct = products.find((product) => product.id === selectedProduct);
  const selectedCategoryData = categories.find((cat) => cat._id === selectedCategory);

  // Utility functions for styling
  const getStatusColor = (status) => {
    return status === "Active"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  const getFoodTypeColor = (foodType) => {
    return foodType === "veg"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-orange-100 text-orange-800 border-orange-200";
  };

  // FROM ORIGINAL - These functions exist in original but aren't used in current UI
  const getApprovalStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStoreTypeColor = (type) => {
    switch (type) {
      case "restaurant":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pharmacy":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "grocery":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Import/Export functions
  const resetImportModal = () => {
    setIsImportModalOpen(false);
    setUploadedFile(null);
    setImportStatus(null);
    setImportMessage("");
  };

  const resetBulkModal = () => {
    setIsBulkModalOpen(false);
    setUploadedFile(null);
    setImportStatus("");
    setImportMessage("");
  };

  const importCategories = async () => {
    if (!uploadedFile) {
      setImportStatus("error");
      setImportMessage("Please select a file before uploading.");
      return;
    }
    try {
      setImportStatus("uploading");
      setImportMessage("Uploading and processing file...");
      const result = await importCategoriesExcel(id, uploadedFile);
      setImportStatus("success");
      setImportMessage(`✅ Imported ${result.count} categories successfully!`);
      setCategories((prev) => {
        const updated = [...prev];
        result.savedCategories.forEach((cat) => {
          const index = updated.findIndex((c) => c._id === cat._id);
          if (index >= 0) updated[index] = cat;
          else updated.push(cat);
        });
        return updated;
      });
      setUploadedFile(null);
      setIsImportModalOpen(false);
    } catch (error) {
      console.error("Error importing Excel:", error);
      setImportStatus("error");
      setImportMessage("❌ Failed to import categories. Please check the file format.");
    }
  };

  const handleBulkEditProducts = async () => {
    if (!uploadedFile) {
      setImportStatus("error");
      setImportMessage("Please select a file before uploading.");
      return;
    }
    try {
      setImportStatus("uploading");
      setImportMessage("Uploading and processing product file...");
      const formData = new FormData();
      formData.append("file", uploadedFile);
      const result = await bulkEditProducts(id, formData);
      setImportStatus("success");
      setImportMessage(`✅ Updated ${result.updatedCount} products successfully!`);
      if (result.updatedProducts && result.updatedProducts.length > 0) {
        const formattedUpdates = result.updatedProducts.map((p) => formatProduct(p));
        setProducts((prev) => prev.map((prod) => {
          const updated = formattedUpdates.find((p) => p._id === prod._id);
          return updated ? updated : prod;
        }));
      }
      setUploadedFile(null);
      setIsBulkModalOpen(false);
      toast.success(`✅ ${result.updatedCount} products updated successfully!`);
    } catch (error) {
      console.error("Error bulk editing products:", error);
      setImportStatus("error");
      setImportMessage("❌ Failed to update products. Please check the file format.");
      toast.error("❌ Bulk update failed");
    }
  };

  // Handle export functions
  const handleExport = async () => {
    try {
      setImportStatus("uploading");
      setImportMessage("Generating Excel file...");
      await exportCategoriesExcel(id);
      setImportStatus("success");
      setImportMessage("✅ Categories exported successfully!");
    } catch (error) {
      setImportStatus("error");
      setImportMessage("❌ Failed to export categories.");
    }
  };

  const handleExportProduct = async () => {
    try {
      setImportStatus("uploading");
      setImportMessage("Generating Excel file...");
      await exportProducts(id);
      setImportStatus("success");
      setImportMessage("✅ Products exported successfully!");
    } catch (error) {
      setImportStatus("error");
      setImportMessage("❌ Failed to export products.");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setUploadedFile(file);
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadCategoryTemplate();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleImportExcel = async () => {
    if (!uploadedFile) {
      setImportStatus("error");
      setImportMessage("Please select a file before uploading.");
      return;
    }
    try {
      setImportStatus("uploading");
      setImportMessage("Uploading and processing file...");
      const result = await importCategoriesExcel(id, uploadedFile);
      setImportStatus("success");
      setImportMessage(`✅ Imported ${result.count} categories successfully!`);
      setCategories((prev) => [...prev, ...result.savedCategories]);
      setUploadedFile(null);
      setIsImportModalOpen(false);
    } catch (error) {
      console.error("Error importing Excel:", error);
      setImportStatus("error");
      setImportMessage("❌ Failed to import categories. Please check the file format.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ALL MODALS FROM ORIGINAL */}
      {isCategoryModalOpen && (
        <CreateCategoryModal
          restaurantId={id}
          onSuccess={handleCategoryCreate}
          onClose={() => setIsCategoryModalOpen(false)}
          loading={loading.actions}
        />
      )}

      {isEditCategoryModalOpen && (
        <CreateCategoryModal
          restaurantId={id}
          onSuccess={handleEditCategory}
          onClose={() => setIsEditCategoryModalOpen(false)}
          initialData={editingCategory}
          isEditMode={true}
          loading={loading.actions}
        />
      )}

      {isEditProductModalOpen && (
        <AddProductPage
          onAddProduct={handleEditProduct}
          onClose={() => setIsEditProductModalOpen(false)}
          initialData={editingProduct}
          isEditMode={true}
          loading={loading.products}
        />
      )}

      {isProductModalOpen && (
        <AddProductPage
          onAddProduct={handleProductCreate}
          onClose={() => setIsProductModalOpen(false)}
          loading={loading.products}
        />
      )}

      <DeleteConfirmationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setDeleteCategoryId(null);
          setDeleteProductId(null);
        }}
        onConfirm={() => {
          if (deleteMode === "category" && deleteCategoryId) {
            HandleDeleteCategory(deleteCategoryId);
          } else if (deleteMode === "product" && deleteProductId) {
            handleProductDelete(deleteProductId);
          }
        }}
        title={deleteMode === "category" ? "Delete Category" : "Delete Product"}
        itemName={
          deleteMode === "category" 
            ? categories.find(cat => cat._id === deleteCategoryId)?.name || "this category"
            : products.find(prod => prod._id === deleteProductId)?.name || "this product"
        }
        message={
          deleteMode === "category" 
            ? "This category and all its products will be permanently removed from your menu and cannot be recovered."
            : "This product will be permanently removed from your menu and cannot be recovered."
        }
      />

      {/* Header with navigation */}
      <Header restaurant={restaurant} id={id} location={location} />

      <div className="w-full mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[700px]">
          {/* Categories Column */}
          <div className="lg:col-span-3">
            <CategoriesColumn
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categoryDropdown={categoryDropdown}
              setCategoryDropdown={setCategoryDropdown}
              toggleCategoryDropdown={toggleCategoryDropdown}
              dropdownPosition={dropdownPosition}
              setDeleteCategoryId={setDeleteCategoryId}
              setDeleteMode={setDeleteMode}
              setShowModal={setShowModal}
              setEditingCategory={setEditingCategory}
              setIsEditCategoryModalOpen={setIsEditCategoryModalOpen}
              setIsProductModalOpen={setIsProductModalOpen}
              handleArchiveCategory={handleArchiveCategory}
              handleUnarchiveCategory={handleUnarchiveCategory}
              handleDisableCategory={handleDisableCategory}
              handleEnableCategory={handleEnableCategory}
              setIsCategoryModalOpen={setIsCategoryModalOpen}
            />
          </div>

          {/* Products Column */}
          <div className="lg:col-span-3">
            <ProductsColumn
              products={filteredProducts}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              productDropdown={productDropdown}
              setProductDropdown={setProductDropdown}
              toggleProductDropdown={toggleProductDropdown}
              dropdownPosition={dropdownPosition}
              setDeleteProductId={setDeleteProductId}
              setDeleteMode={setDeleteMode}
              setShowModal={setShowModal}
              setEditingProduct={setEditingProduct}
              setIsEditProductModalOpen={setIsEditProductModalOpen}
              setIsProductModalOpen={setIsProductModalOpen}
              loading={loading.products}
              handleArchiveProduct={handleArchiveProduct}
              handleUnarchiveProduct={handleUnarchiveProduct}
              handleToggleProductActive={handleToggleProductActive}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              showInactiveProducts={showInactiveProducts}
              setShowInactiveProducts={setShowInactiveProducts}
              refreshProducts={refreshProducts}
              setIsProductImportModalOpen={setIsProductImportModalOpen}
              setIsBulkProductModalOpen={setIsBulkProductModalOpen}
              handleExportProduct={handleExportProduct}
              id={id}
            />
          </div>

          {/* Product Details Column */}
          <div className="lg:col-span-6">
            <ProductDetails 
              product={currentProduct}
              loading={loading.products}
              getStatusColor={getStatusColor}
              getFoodTypeColor={getFoodTypeColor}
              selectedCategoryData={selectedCategoryData}
            />
          </div>
        </div>
      </div>

      {/* Import Modals */}
      <ImportCategoriesModal
        isOpen={isImportModalOpen}
        onClose={resetImportModal}
        handleDownloadTemplate={handleDownloadTemplate}
        handleImportExcel={importCategories}
        fileInputRef={fileInputRef}
        uploadedFile={uploadedFile}
        setUploadedFile={setUploadedFile}
        importStatus={importStatus}
        importMessage={importMessage}
        handleFileSelect={handleFileSelect}
      />

      <BulkEditCategoriesModal
        isOpen={isBulkModalOpen}
        onClose={resetBulkModal}
        handleDownloadTemplate={handleDownloadTemplate}
        handleExportCurrent={handleExport}
        handleImportExcel={importCategories}
        fileInputRef={fileInputRef}
        uploadedFile={uploadedFile}
        setUploadedFile={setUploadedFile}
        importStatus={importStatus}
        importMessage={importMessage}
        handleFileSelect={handleFileSelect}
      />

      <ImportProductsModal
        isOpen={isProductImportModalOpen}
        onClose={() => setIsProductImportModalOpen(false)}
        handleDownloadTemplate={handleDownloadTemplate}
        handleImportExcel={() => {}}
        fileInputRef={fileInputRef}
        uploadedFile={uploadedFile}
        setUploadedFile={setUploadedFile}
        importStatus={importStatus}
        importMessage={importMessage}
        handleFileSelect={handleFileSelect}
      />

      <BulkEditProductsModal
        isOpen={isBulkProductModalOpen}
        onClose={() => setIsBulkProductModalOpen(false)}
        handleDownloadTemplate={handleDownloadTemplate}
        handleExportCurrent={handleExportProduct}
        handleImportExcel={handleBulkEditProducts}
        fileInputRef={fileInputRef}
        uploadedFile={uploadedFile}
        setUploadedFile={setUploadedFile}
        importStatus={importStatus}
        importMessage={importMessage}
        handleFileSelect={handleFileSelect}
      />
    </div>
  );
}

export default CatelogManagement;