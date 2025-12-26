import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Plus,
  MoreVertical,
  Edit3,
  Trash2,
  Folder,
  FolderOpen,
  Package,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Archive,
  Search,
  Store,
  RefreshCw,
  AlertCircle,
  Clock,
  Image as ImageIcon,
  Activity,
  ToggleRight,
  ToggleLeft,
  ArrowUp,
  ArrowDown,
  Layers,
  Grid3x3
} from "lucide-react";
import { toast } from "react-toastify";

// Components - Updated TreeView for multi-column
import TreeView from "./TreeView"; // We'll update this file
import CreateCategoryModal from "../../../components/catelog/CreateCategoryModal";
import AddSubcategoryModal from "../../../components/catelog/AddSubcategoryModal";
import AddProductPage from "../../../components/catelog/AddProductPage";
import DeleteConfirmationModal from "../../../components/catelog/DeleteConfirmationModal";

// API imports
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
  toggleCategoryStatus,
  archiveProduct,
  unarchiveProduct,
  createNestedCategories,
} from "../../../apis/adminApis/storeApi2";
import { archiveCategory, unarchiveCategory } from "../../../apis/adminApis/storeApi";

// Format functions (SAME AS BEFORE)
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
  archived: category.archived || false,
  images: category.images,
  description: category.description,
  availability: category.availability || 'always',
  availableAfterTime: category.availableAfterTime || '',
  availableFromTime: category.availableFromTime || '',
  availableToTime: category.availableToTime || '',
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
  children: category.children || [],
  level: category.level || 0,
  parentId: category.parentId || null
});

function CatelogTreeView() {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState({
    store: false,
    categories: false,
    products: false,
    actions: false
  });
  
  // Tree structure states
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedNode, setSelectedNode] = useState({
    type: null,
    id: null,
    data: null,
    path: []
  });
  const [selectedColumn, setSelectedColumn] = useState({
    column1: null,  // Selected category in column 1
    column2: null,  // Selected category in column 2
    column3: null   // Selected category in column 3
  });

  // Modal states (SAME AS BEFORE)
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [categoryModalData, setCategoryModalData] = useState({
    mode: "create",
    data: null,
    parentId: null
  });
  
  const [subcategoryModalData, setSubcategoryModalData] = useState({
    mode: "create",
    data: null,
    parentId: null,
    parentName: ""
  });
  
  const [productModalData, setProductModalData] = useState({
    mode: "create",
    data: null
  });
  
  const [deleteModalData, setDeleteModalData] = useState({
    type: "",
    id: null,
    name: ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryDropdown, setCategoryDropdown] = useState(null);
  const [productDropdown, setProductDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // ====== DATA FETCHING (SAME AS BEFORE) ======
  const fetchStoreData = async () => {
    try {
      setLoading(prev => ({ ...prev, store: true }));
      const restaurantData = await getStoreById(id);
      setStore(restaurantData);
    } catch (err) {
      console.error("Error fetching store:", err);
      toast.error("Failed to load store data");
    } finally {
      setLoading(prev => ({ ...prev, store: false }));
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      const categoriesData = await fetchRestaurantCategories(id);
      const formattedCategories = categoriesData.map(formatCategory);
      const categoryTree = buildCategoryTree(formattedCategories);
      setCategories(categoryTree);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const buildCategoryTree = (categories, parentId = null) => {
    return categories
      .filter(category => category.parentId === parentId)
      .map(category => ({
        ...category,
        children: buildCategoryTree(categories, category._id),
        level: parentId === null ? 0 : (findCategoryById(categories, parentId)?.level || 0) + 1
      }));
  };

  const fetchProductsForCategory = async (categoryId) => {
    if (!categoryId) return;
    try {
      setLoading(prev => ({ ...prev, products: true }));
      const productsData = await fetchCategoryProducts(id, categoryId);
      const formattedProducts = productsData.map(formatProduct);
      setProducts(formattedProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchStoreData();
      await fetchCategories();
    };
    fetchInitialData();
  }, [id]);

  // ====== HELPER FUNCTIONS (SAME AS BEFORE) ======
  const findCategoryById = (categories, categoryId) => {
    for (const category of categories) {
      if (category._id === categoryId) return category;
      if (category.children && category.children.length > 0) {
        const found = findCategoryById(category.children, categoryId);
        if (found) return found;
      }
    }
    return null;
  };

  const findCategoryPath = (categories, categoryId, path = []) => {
    for (const category of categories) {
      if (category._id === categoryId) return [...path, category._id];
      if (category.children && category.children.length > 0) {
        const found = findCategoryPath(category.children, categoryId, [...path, category._id]);
        if (found) return found;
      }
    }
    return null;
  };

  const addCategoryToTree = (categories, newCategory, parentId = null) => {
    if (parentId === null) return [...categories, newCategory];
    return categories.map(category => {
      if (category._id === parentId) {
        return { ...category, children: [...(category.children || []), newCategory] };
      }
      if (category.children && category.children.length > 0) {
        return { ...category, children: addCategoryToTree(category.children, newCategory, parentId) };
      }
      return category;
    });
  };

  const getCategoryLevel = (parentId) => {
    if (!parentId) return 0;
    const parentCategory = findCategoryById(categories, parentId);
    return parentCategory ? (parentCategory.level || 0) + 1 : 0;
  };

  // ====== EVENT HANDLERS (UPDATED FOR MULTI-COLUMN) ======
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleCategorySelect = (category, path = [], columnNumber = 1) => {
    setSelectedNode({
      type: "category",
      id: category._id,
      data: category,
      path: path
    });
    
    // Update selected column
    if (columnNumber === 1) {
      setSelectedColumn({
        column1: category._id,
        column2: null,
        column3: null
      });
    } else if (columnNumber === 2) {
      setSelectedColumn(prev => ({
        ...prev,
        column2: category._id,
        column3: null
      }));
    } else if (columnNumber === 3) {
      setSelectedColumn(prev => ({
        ...prev,
        column3: category._id
      }));
    }
    
    // Fetch products for this category
    fetchProductsForCategory(category._id);
  };

  const handleProductSelect = (product) => {
    const categoryPath = findCategoryPath(categories, product.categoryId) || [];
    setSelectedNode({
      type: "product",
      id: product._id,
      data: product,
      path: categoryPath
    });
  };

  // Get root categories for column 1
  const getRootCategories = () => {
    return categories.filter(cat => !cat.parentId);
  };

  // Get children of selected category for column 2
  const getChildCategories = () => {
    if (!selectedColumn.column1) return [];
    return categories.filter(cat => cat.parentId === selectedColumn.column1);
  };

  // Get grandchildren for column 3
  const getGrandchildCategories = () => {
    if (!selectedColumn.column2) return [];
    return categories.filter(cat => cat.parentId === selectedColumn.column2);
  };

  // Get products for selected category
  const getCategoryProducts = () => {
    const selectedCategoryId = selectedColumn.column3 || selectedColumn.column2 || selectedColumn.column1;
    if (!selectedCategoryId) return [];
    return products.filter(product => product.categoryId === selectedCategoryId);
  };

  // ====== RENDER FUNCTIONS ======
  const renderProductsColumn = () => {
    const categoryProducts = getCategoryProducts();
    const selectedCategoryId = selectedColumn.column3 || selectedColumn.column2 || selectedColumn.column1;
    const selectedCategory = findCategoryById(categories, selectedCategoryId);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-gray-600" />
            <div>
              <h3 className="font-semibold text-gray-800">
                {selectedCategory?.name || "Products"}
              </h3>
              <p className="text-sm text-gray-500">{categoryProducts.length} products</p>
            </div>
          </div>
          {selectedCategory && (
            <button
              onClick={() => handleCreateProduct(selectedCategoryId)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          )}
        </div>

        {categoryProducts.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-xl">
            <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No products yet</h3>
            <p className="text-gray-500 mb-6">Add products to this category</p>
            {selectedCategory && (
              <button
                onClick={() => handleCreateProduct(selectedCategoryId)}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                + Add First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {categoryProducts.map(product => (
              <div
                key={product._id}
                onClick={() => handleProductSelect(product)}
                className={`p-4 border rounded-xl cursor-pointer transition-all ${
                  selectedNode.type === "product" && selectedNode.id === product._id
                    ? "border-pink-300 bg-pink-50"
                    : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">${product.price}</div>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                      product.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {product.active ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ====== KEEP ALL YOUR EXISTING HANDLER FUNCTIONS ======
  // Keep ALL your existing handler functions (they should work as-is):
  // handleCreateMainCategory, handleCreateSubCategory, handleCategorySubmit, 
  // handleSubcategorySubmit, handleEditCategory, handleDeleteCategory,
  // handleToggleCategoryStatus, handleAddProductFromTree, handleCreateProduct,
  // handleEditProduct, handleProductSubmit, handleDeleteProduct, 
  // handleToggleProductStatus, handleArchiveCategory, handleArchiveProduct
  
  // I'm showing one as example - you need to keep ALL your original handlers:
  const handleCreateMainCategory = () => {
    setCategoryModalData({
      mode: "create",
      data: { 
        restaurantId: id,
        active: true,
        archived: false,
        availability: "always"
      },
      parentId: null
    });
    setShowCategoryModal(true);
  };

  const handleAddProductFromTree = (categoryId, categoryName) => {
    setProductModalData({
      mode: "create",
      data: {
        categoryId: categoryId,
        restaurantId: id,
        categoryName: categoryName
      }
    });
    setShowProductModal(true);
  };

  // ====== RENDER UI ======
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 p-6">
      {/* Header - KEEP EXACTLY THE SAME */}
      <div className="bg-white rounded-2xl shadow-lg border border-pink-100 mb-6 overflow-hidden">
        <div className="border-b border-pink-100">
          <div className="px-8">
            <ul className="flex space-x-8">
              <li>
                <Link
                  to={`/admin/dashboard/merchants/merchant-config/${id}`}
                  className={`px-4 py-3 block ${
                    window.location.pathname.includes('merchant-config')
                      ? "border-b-2 border-pink-500 text-pink-500 font-medium"
                      : "text-gray-500 hover:text-pink-600"
                  }`}
                >
                  Configurations
                </Link>
              </li>
              <li>
                <Link
                  to={`/admin/dashboard/merchants/merchant-catelogue/${id}`}
                  className={`px-4 py-3 block ${
                    window.location.pathname.includes('merchant-catelogue')
                      ? "border-b-2 border-pink-500 text-pink-500 font-medium"
                      : "text-gray-500 hover:text-pink-600"
                  }`}
                >
                  Catalogue
                </Link>
              </li>
              <li>
                <Link
                  to={`/admin/dashboard/merchants/merchant-details/${id}`}
                  className={`px-4 py-3 block ${
                    window.location.pathname.includes('merchant-details')
                      ? "border-b-2 border-pink-500 text-pink-500 font-medium"
                      : "text-gray-500 hover:text-pink-600"
                  }`}
                >
                  Merchant
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Store Info Bar */}
        <div className="p-6 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm border border-pink-200">
                <Store className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {store?.name || "Store Catalog"}
                </h3>
                <p className="text-sm text-gray-600">
                  {getRootCategories().length} main categories • {products.length} products
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchCategories();
                  toast.success("Refreshed!");
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-pink-200 text-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={handleCreateMainCategory}
                className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Add Main Category
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - MULTI-COLUMN LAYOUT */}
      <div className="flex gap-6 h-[calc(100vh-280px)]">
        {/* COLUMN 1: MAIN CATEGORIES */}
        <div className="w-1/4 bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden">
          <div className="p-6 border-b border-pink-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Folder className="h-5 w-5 text-pink-500" />
              Main Categories
              <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                {getRootCategories().length}
              </span>
            </h3>
            <p className="text-sm text-gray-500 mt-1">Select a main category</p>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100%-100px)]">
            {loading.categories ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : getRootCategories().length === 0 ? (
              <div className="text-center py-12">
                <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No main categories yet</p>
                <button
                  onClick={handleCreateMainCategory}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  Create First Category
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {getRootCategories().map((category) => (
                  <div
                    key={category._id}
                    onClick={() => handleCategorySelect(category, [category._id], 1)}
                    className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedColumn.column1 === category._id
                        ? "bg-pink-100 border border-pink-300"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div className="p-1.5 rounded flex-shrink-0 bg-gray-100">
                      <Folder className="h-4 w-4 text-pink-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium truncate ${
                          selectedColumn.column1 === category._id ? 'text-pink-700' : 'text-gray-800'
                        }`}>
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Package className="h-3 w-3" />
                          <span>{category.productCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Folder className="h-3 w-3" />
                          <span>{category.children?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: SUBCATEGORIES */}
        <div className="w-1/4 bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden">
          <div className="p-6 border-b border-pink-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-blue-500" />
              Subcategories
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {selectedColumn.column1 
                ? `Subcategories of "${findCategoryById(categories, selectedColumn.column1)?.name || 'selected category'}"`
                : "Select a main category first"}
            </p>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100%-100px)]">
            {!selectedColumn.column1 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a main category to view subcategories</p>
              </div>
            ) : getChildCategories().length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No subcategories yet</p>
                <button
                  onClick={() => handleCreateSubCategory(selectedColumn.column1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Add Subcategory
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {getChildCategories().map((category) => (
                  <div
                    key={category._id}
                    onClick={() => handleCategorySelect(category, [selectedColumn.column1, category._id], 2)}
                    className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedColumn.column2 === category._id
                        ? "bg-blue-100 border border-blue-300"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div className="p-1.5 rounded flex-shrink-0 bg-gray-100">
                      <Folder className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium truncate ${
                          selectedColumn.column2 === category._id ? 'text-blue-700' : 'text-gray-800'
                        }`}>
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Package className="h-3 w-3" />
                          <span>{category.productCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Folder className="h-3 w-3" />
                          <span>{category.children?.length || 0}</span>
                          <span className="text-gray-400">• Level 1</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: SUB-SUBCATEGORIES */}
        <div className="w-1/4 bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden">
          <div className="p-6 border-b border-pink-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Layers className="h-5 w-5 text-green-500" />
              Sub-subcategories
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {selectedColumn.column2 
                ? `Subcategories of "${findCategoryById(categories, selectedColumn.column2)?.name || 'selected subcategory'}"`
                : "Select a subcategory first"}
            </p>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100%-100px)]">
            {!selectedColumn.column2 ? (
              <div className="text-center py-12">
                <Layers className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a subcategory to view further nesting</p>
              </div>
            ) : getGrandchildCategories().length === 0 ? (
              <div className="text-center py-12">
                <Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No further subcategories</p>
                <button
                  onClick={() => handleCreateSubCategory(selectedColumn.column2)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  + Add Subcategory
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {getGrandchildCategories().map((category) => (
                  <div
                    key={category._id}
                    onClick={() => handleCategorySelect(category, [selectedColumn.column1, selectedColumn.column2, category._id], 3)}
                    className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedColumn.column3 === category._id
                        ? "bg-green-100 border border-green-300"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div className="p-1.5 rounded flex-shrink-0 bg-gray-100">
                      <Folder className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium truncate ${
                          selectedColumn.column3 === category._id ? 'text-green-700' : 'text-gray-800'
                        }`}>
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Package className="h-3 w-3" />
                          <span>{category.productCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Folder className="h-3 w-3" />
                          <span>{category.children?.length || 0}</span>
                          <span className="text-gray-400">• Level 2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 4: PRODUCTS */}
        <div className="w-1/4 bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden">
          <div className="p-6 border-b border-pink-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-500" />
                  Products
                  <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                    {getCategoryProducts().length}
                  </span>
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedColumn.column1 
                    ? `Products in selected category` 
                    : "Select a category to view products"}
                </p>
              </div>
              {(selectedColumn.column1 || selectedColumn.column2 || selectedColumn.column3) && (
                <button
                  onClick={() => handleCreateProduct(selectedColumn.column3 || selectedColumn.column2 || selectedColumn.column1)}
                  className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  title="Add Product"
                >
                  <Plus className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100%-100px)]">
            {renderProductsColumn()}
          </div>
        </div>
      </div>

      {/* KEEP ALL YOUR EXISTING MODALS AND DROPDOWNS BELOW */}
      {/* Category Dropdown */}
      {categoryDropdown && (
        <div
          className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-pink-200 w-56"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateProduct(categoryDropdown);
                setCategoryDropdown(null);
              }}
              className="flex items-center w-full px-4 py-2.5 text-sm text-pink-600 hover:bg-pink-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product Here
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateSubCategory(categoryDropdown);
                setCategoryDropdown(null);
              }}
              className="flex items-center w-full px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50"
            >
              <Layers className="h-4 w-4 mr-2" />
              Add Subcategory
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                const category = findCategoryById(categories, categoryDropdown);
                handleEditCategory(category);
                setCategoryDropdown(null);
              }}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Category
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                const category = findCategoryById(categories, categoryDropdown);
                handleToggleCategoryStatus(category._id, category.active);
                setCategoryDropdown(null);
              }}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              {findCategoryById(categories, categoryDropdown)?.active ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Disable Category
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Enable Category
                </>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                const category = findCategoryById(categories, categoryDropdown);
                handleArchiveCategory(category._id, !category.archived);
                setCategoryDropdown(null);
              }}
              className="flex items-center w-full px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50"
            >
              <Archive className="h-4 w-4 mr-2" />
              {findCategoryById(categories, categoryDropdown)?.archived ? "Unarchive" : "Archive"}
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                const category = findCategoryById(categories, categoryDropdown);
                setDeleteModalData({
                  type: "category",
                  id: category._id,
                  name: category.name
                });
                setShowDeleteModal(true);
                setCategoryDropdown(null);
              }}
              className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Category
            </button>
          </div>
        </div>
      )}

      {/* Product Dropdown */}
      {productDropdown && (
        <div
          className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-pink-200 w-48"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const product = products.find(p => p._id === productDropdown);
                handleEditProduct(product);
                setProductDropdown(null);
              }}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Product
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                const product = products.find(p => p._id === productDropdown);
                handleToggleProductStatus(product._id, product.active);
                setProductDropdown(null);
              }}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              {products.find(p => p._id === productDropdown)?.active ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Disable Product
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Enable Product
                </>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                const product = products.find(p => p._id === productDropdown);
                handleArchiveProduct(product._id, !product.archived);
                setProductDropdown(null);
              }}
              className="flex items-center w-full px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50"
            >
              <Archive className="h-4 w-4 mr-2" />
              {products.find(p => p._id === productDropdown)?.archived ? "Unarchive" : "Archive"}
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                const product = products.find(p => p._id === productDropdown);
                setDeleteModalData({
                  type: "product",
                  id: product._id,
                  name: product.name
                });
                setShowDeleteModal(true);
                setProductDropdown(null);
              }}
              className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Product
            </button>
          </div>
        </div>
      )}

      {/* Modals (Keep all your existing modals) */}
      {showCategoryModal && (
        <CreateCategoryModal
          onClose={() => setShowCategoryModal(false)}
          onSuccess={handleCategorySubmit}
          restaurantId={id}
          isEditMode={categoryModalData.mode === "edit"}
          initialData={categoryModalData.data}
          loading={loading.actions}
          isMainCategory={true}
        />
      )}

      {showSubcategoryModal && (
        <AddSubcategoryModal
          onClose={() => setShowSubcategoryModal(false)}
          onSuccess={handleSubcategorySubmit}
          restaurantId={id}
          parentId={subcategoryModalData.parentId}
          parentName={subcategoryModalData.parentName}
          loading={loading.actions}
        />
      )}

      {showProductModal && (
        <AddProductPage
          onClose={() => setShowProductModal(false)}
          onAddProduct={handleProductSubmit}
          merchantName={store?.name}
          categoryName={selectedNode.type === "category" ? selectedNode.data?.name : "Category"}
          initialData={productModalData.data}
          isEditMode={productModalData.mode === "edit"}
          loading={loading.actions}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            if (deleteModalData.type === "category") {
              handleDeleteCategory(deleteModalData.id);
            } else {
              handleDeleteProduct(deleteModalData.id);
            }
          }}
          title={deleteModalData.type === "category" ? "Delete Category" : "Delete Product"}
          itemName={deleteModalData.name}
          message={
            deleteModalData.type === "category"
              ? "This category will be permanently removed and cannot be recovered."
              : "This product will be permanently removed from your menu and cannot be recovered."
          }
        />
      )}
    </div>
  );
}
// Helper components
const CategoryDetails = ({ 
  category, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onArchive, 
  onAddProduct,
  onAddSubCategory,
  level 
}) => (
  <div className="space-y-6">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">{category.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-500">Level: {level}</span>
          {level > 0 && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              Subcategory {level}
            </span>
          )}
        </div>
        <p className="text-gray-600 mt-2">{category.description || "No description"}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit Category"
        >
          <Edit3 className="h-5 w-5" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Category"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
        <p className="text-sm text-gray-500">Status</p>
        <div className="flex items-center gap-2 mt-2">
          <div
            className={`w-3 h-3 rounded-full ${
              category.active ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <span className="font-semibold text-lg">
            {category.active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
        <p className="text-sm text-gray-500">Products</p>
        <p className="text-2xl font-bold text-pink-600 mt-2">
          {category.productCount || 0}
        </p>
      </div>

      <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
        <p className="text-sm text-gray-500">Subcategories</p>
        <p className="text-2xl font-bold text-pink-600 mt-2">
          {category.children?.length || 0}
        </p>
      </div>
    </div>

    <div className="space-y-4 pt-4 border-t border-gray-200">
      <h4 className="font-semibold text-gray-800">Quick Actions</h4>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onAddProduct}
          className="px-4 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
        
        {level < 5 && (
          <button
            onClick={onAddSubCategory}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
          >
            <Layers className="h-4 w-4" />
            Add Subcategory (Level {level + 1})
          </button>
        )}
        
        <button
          onClick={onToggleStatus}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium flex items-center gap-2"
        >
          {category.active ? (
            <>
              <EyeOff className="h-4 w-4" />
              Disable Category
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Enable Category
            </>
          )}
        </button>
        
        <button
          onClick={onArchive}
          className="px-4 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg font-medium flex items-center gap-2"
        >
          <Archive className="h-4 w-4" />
          {category.archived ? "Unarchive" : "Archive"}
        </button>
      </div>
    </div>
  </div>
);

const ProductDetails = ({ product, onEdit, onDelete, onToggleStatus, onArchive, getStatusColor, getFoodTypeColor }) => (
  <div className="space-y-6">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
        <p className="text-3xl font-bold text-pink-600 mt-2">${product.price}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit Product"
        >
          <Edit3 className="h-5 w-5" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Product"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>

    {product.images && product.images.length > 0 && (
      <div className="grid grid-cols-4 gap-2">
        {product.images.slice(0, 4).map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`${product.name} ${index + 1}`}
            className="w-full h-24 object-cover rounded-lg border border-gray-200"
          />
        ))}
      </div>
    )}

    <div className="grid grid-cols-2 gap-4">
      <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
        <p className="text-sm text-gray-500">Status</p>
        <div className="flex items-center gap-2 mt-2">
          <div
            className={`w-3 h-3 rounded-full ${
              product.active ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <span className="font-semibold">
            {product.active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
        <p className="text-sm text-gray-500">Type</p>
        <div className="flex items-center gap-2 mt-2">
          <div
            className={`w-3 h-3 rounded-full ${
              product.foodType === "veg" ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="font-semibold capitalize">
            {product.foodType === "veg" ? "Vegetarian" : "Non-Vegetarian"}
          </span>
        </div>
      </div>
    </div>

    {product.description && (
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <p className="text-sm text-gray-500 mb-2">Description</p>
        <p className="text-gray-700">{product.description}</p>
      </div>
    )}

    <div className="space-y-4 pt-4 border-t border-gray-200">
      <h4 className="font-semibold text-gray-800">Quick Actions</h4>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onToggleStatus}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium flex items-center gap-2"
        >
          {product.active ? (
            <>
              <EyeOff className="h-4 w-4" />
              Disable Product
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Enable Product
            </>
          )}
        </button>
        
        <button
          onClick={onArchive}
          className="px-4 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg font-medium flex items-center gap-2"
        >
          <Archive className="h-4 w-4" />
          {product.archived ? "Unarchive" : "Archive"}
        </button>
      </div>
    </div>
  </div>
);

export default CatelogTreeView;