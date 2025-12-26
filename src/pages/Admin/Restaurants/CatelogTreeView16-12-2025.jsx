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
  Eye,
  EyeOff,
  Archive,
  Search,
  Store,
  RefreshCw,
  Layers
} from "lucide-react";
import { toast } from "react-toastify";
// Components
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
  const [loading, setLoading] = useState({
    store: false,
    categories: false,
    products: false,
    actions: false
  });
  
  // Navigation state
  const [navigationPath, setNavigationPath] = useState([]); // Array of category IDs in the path
  const [selectedCategory, setSelectedCategory] = useState(null); // Currently selected category
  const [selectedProduct, setSelectedProduct] = useState(null); // Currently selected product
  const [products, setProducts] = useState([]); // Products for current category
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
 
  const [mainProducts, setMainProducts] = useState([]);
  
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

  // Refs for click outside detection
  const categoryDropdownRef = useRef(null);
  const productDropdownRef = useRef(null);

  // ====== CLICK OUTSIDE DROPDOWN HANDLER ======
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close category dropdown if clicked outside
      if (categoryDropdown && 
          categoryDropdownRef.current && 
          !categoryDropdownRef.current.contains(event.target)) {
        // Check if click is on the three dots button that opened this dropdown
        const isThreeDotsButton = event.target.closest('button')?.querySelector('.lucide-more-vertical');
        if (!isThreeDotsButton) {
          setCategoryDropdown(null);
        }
      }
      
      // Close product dropdown if clicked outside
      if (productDropdown && 
          productDropdownRef.current && 
          !productDropdownRef.current.contains(event.target)) {
        // Check if click is on the three dots button that opened this dropdown
        const isThreeDotsButton = event.target.closest('button')?.querySelector('.lucide-more-vertical');
        if (!isThreeDotsButton) {
          setProductDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categoryDropdown, productDropdown]);

  // ====== HELPER FUNCTIONS ======
  const buildCategoryTree = (categories, parentId = null) => {
    return categories
      .filter(category => category.parentId === parentId)
      .map(category => ({
        ...category,
        children: buildCategoryTree(categories, category._id),
        level: parentId === null ? 0 : (findCategoryById(categories, parentId)?.level || 0) + 1
      }));
  };

  const findCategoryById = (categories, categoryId) => {
    for (const category of categories) {
      if (category._id === categoryId) {
        return category;
      }
      if (category.children && category.children.length > 0) {
        const found = findCategoryById(category.children, categoryId);
        if (found) return found;
      }
    }
    return null;
  };

  const findCategoryPath = (categories, categoryId, path = []) => {
    for (const category of categories) {
      if (category._id === categoryId) {
        return [...path, category];
      }
      if (category.children && category.children.length > 0) {
        const found = findCategoryPath(category.children, categoryId, [...path, category]);
        if (found) return found;
      }
    }
    return null;
  };

  // Function to find the deepest category in a tree
  const findDeepestCategory = (categoryTree) => {
    if (!categoryTree || categoryTree.length === 0) return null;
    
    // Start with the first category
    let currentCategory = categoryTree[0];
    
    // Keep going down the first child until we reach a leaf category
    while (currentCategory && currentCategory.children && currentCategory.children.length > 0) {
      currentCategory = currentCategory.children[0];
    }
    
    return currentCategory;
  };

  const addCategoryToTree = (categories, newCategory, parentId = null) => {
    if (parentId === null) {
      return [...categories, newCategory];
    }
    return categories.map(category => {
      if (category._id === parentId) {
        return {
          ...category,
          children: [...(category.children || []), newCategory]
        };
      }
      if (category.children && category.children.length > 0) {
        return {
          ...category,
          children: addCategoryToTree(category.children, newCategory, parentId)
        };
      }
      return category;
    });
  };

  const updateCategoryInTree = (categories, updatedCategory) => {
    return categories.map(category => {
      if (category._id === updatedCategory._id) {
        return {
          ...category,
          ...updatedCategory,
          children: category.children || []
        };
      }
      if (category.children && category.children.length > 0) {
        return {
          ...category,
          children: updateCategoryInTree(category.children, updatedCategory)
        };
      }
      return category;
    });
  };

  const countTotalCategories = (cats) => {
    let count = 0;
    for (const cat of cats) {
      count++;
      if (cat.children && cat.children.length > 0) {
        count += countTotalCategories(cat.children);
      }
    }
    return count;
  };

  // ====== FETCH DATA ======
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

  // const fetchCategories = async () => {
    
  //   try {
  //     setLoading(prev => ({ ...prev, categories: true }));
  //     const categoriesData = await fetchRestaurantCategories(id);
  //     const formattedCategories = categoriesData.map(formatCategory);
  //     const categoryTree = buildCategoryTree(formattedCategories);
  //     setCategories(categoryTree);
      
  //     // Automatically select and expand the first available category
  //     if (categoryTree.length > 0) {
  //       // Find the deepest category in the first branch
  //       const deepestCategory = findDeepestCategory(categoryTree);
  //       if (deepestCategory) {
  //         // Get the full path to the deepest category
  //         const path = findCategoryPath(categoryTree, deepestCategory._id) || [];
  //         setNavigationPath(path);
  //         setSelectedCategory(deepestCategory);
  //       } else {
  //         // If no deepest category found, select the first one
  //         setNavigationPath([categoryTree[0]]);
  //         setSelectedCategory(categoryTree[0]);
  //       }
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to load categories");
  //   } finally {
  //     setLoading(prev => ({ ...prev, categories: false }));
  //   }
  // };

  // const fetchProductsForCategory = async (categoryId) => {
  //   if (!categoryId) return;
    
  //   try {
  //     setLoading(prev => ({ ...prev, products: true }));
  //     const productsData = await fetchCategoryProducts(id, categoryId);
  //     const formattedProducts = productsData.map(formatProduct);
  //     setProducts(formattedProducts);
  //   } catch (err) {
  //     console.error("Error fetching products:", err);
  //     toast.error("Failed to load products");
  //   } finally {
  //     setLoading(prev => ({ ...prev, products: false }));
  //   }
  // };

//   const fetchCategories = async () => {
//   try {
//     setLoading(prev => ({ ...prev, categories: true }));
//     const categoriesData = await fetchRestaurantCategories(id);

//     console.log("Fetched categories data:", categoriesData);
//     const formattedCategories = categoriesData.map(formatCategory);
//     const categoryTree = buildCategoryTree(formattedCategories);
//     setCategories(categoryTree);
    
//     // Automatically select the FIRST main category only
//     if (categoryTree.length > 0) {
//       // Just select the first main category
//       const firstMainCategory = categoryTree[0];
//       setNavigationPath([firstMainCategory]);
//       setSelectedCategory(firstMainCategory);
//     }
//   } catch (err) {
//     console.error(err);
//     toast.error("Failed to load categories");
//   } finally {
//     setLoading(prev => ({ ...prev, categories: false }));
//   }
// };

// const fetchCategories = async () => {
//   try {
//     setLoading(prev => ({ ...prev, categories: true }));
    
//     // Now this returns an object with both categories and mainProducts
//     const response = await fetchRestaurantCategories(id);

//     console.log("Full response:", response);
    
//     const { categories: categoriesData, mainProducts } = response;
    
//     console.log("Categories data:", categoriesData);
//     console.log("Main products:", mainProducts);
    
//     const formattedCategories = categoriesData.map(formatCategory);
//     const categoryTree = buildCategoryTree(formattedCategories);
    
//     // Save both to state
//     setCategories(categoryTree);
//     setMainProducts(mainProducts || []); // You'll need to add this state
    
//     // Automatically select the FIRST main category only
//     if (categoryTree.length > 0) {
//       const firstMainCategory = categoryTree[0];
//       setNavigationPath([firstMainCategory]);
//       setSelectedCategory(firstMainCategory);
//     }
//   } catch (err) {
//     console.error(err);
//     toast.error("Failed to load categories");
//   } finally {
//     setLoading(prev => ({ ...prev, categories: false }));
//   }
// };

const fetchCategories = async () => {
  try {
    setLoading(prev => ({ ...prev, categories: true }));
    
    const response = await fetchRestaurantCategories(id);
    
    const { categories: categoriesData, mainProducts } = response;
    
    const formattedCategories = categoriesData.map(formatCategory);
    const categoryTree = buildCategoryTree(formattedCategories);
    
    // Save both to state
    setCategories(categoryTree);
    setMainProducts(mainProducts || []);
    
    if (categoryTree.length > 0) {
      const firstMainCategory = categoryTree[0];
      setNavigationPath([firstMainCategory]);
      setSelectedCategory(firstMainCategory);
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to load categories");
  } finally {
    setLoading(prev => ({ ...prev, categories: false }));
  }
};

const handleMainProductSelect = (product) => {
  setSelectedProduct(product);
  setSelectedCategory(null);
  setNavigationPath([]);
  setCategoryDropdown(null);
  setProductDropdown(null);
};

  const fetchProductsForCategory = async (categoryId) => {
  if (!categoryId) return;
  
  try {
    setLoading(prev => ({ ...prev, products: true }));
    const productsData = await fetchCategoryProducts(id, categoryId);
    const formattedProducts = productsData.map(formatProduct);
    
    // Instead of replacing ALL products, merge them
    setProducts(prevProducts => {
      // Remove existing products for this category
      const filteredProducts = prevProducts.filter(p => p.categoryId !== categoryId);
      // Add new products for this category
      return [...filteredProducts, ...formattedProducts];
    });
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

  useEffect(() => {
    if (selectedCategory && selectedCategory._id) {
      fetchProductsForCategory(selectedCategory._id);
    }
  }, [selectedCategory?._id]);

  // ====== NAVIGATION HANDLERS ======
  // const handleCategorySelect = (category) => {
  //   // Find the complete path to this category
  //   const path = findCategoryPath(categories, category._id) || [];
    
  //   // Set the navigation path to show all intermediate levels
  //   setNavigationPath(path);
  //   setSelectedCategory(category);
  //   setSelectedProduct(null);
    
  //   // Close any open dropdowns
  //   setCategoryDropdown(null);
  //   setProductDropdown(null);
  // };

  const handleCategorySelect = (category) => {
  // Find the complete path to this category
  const path = findCategoryPath(categories, category._id) || [];
  
  // Set the navigation path to show all intermediate levels
  setNavigationPath(path);
  setSelectedCategory(category);
  setSelectedProduct(null);
  
  // Close any open dropdowns
  setCategoryDropdown(null);
  setProductDropdown(null);
  
  // Products will be fetched by useEffect automatically
  // and they will be ADDED to existing products, not replace them
};

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    // Ensure the category path is set for this product's category
    if (product.categoryId) {
      const category = findCategoryById(categories, product.categoryId);
      if (category) {
        const path = findCategoryPath(categories, category._id) || [];
        setNavigationPath(path);
        setSelectedCategory(category);
      }
    }
    // Close any open dropdowns
    setCategoryDropdown(null);
    setProductDropdown(null);
  };

  const getCategoriesForLevel = (levelIndex) => {
    if (levelIndex === 0) {
      return categories; // Main categories
    }
    
    // Get categories for this level from the navigation path
    if (levelIndex <= navigationPath.length) {
      const parentCategory = navigationPath[levelIndex - 1];
      return parentCategory?.children || [];
    }
    
    return [];
  };

  // ====== COLUMN RENDERING ======
  // const renderCategoryColumn = (level) => {
  //   const categoriesAtLevel = getCategoriesForLevel(level);
  //   const currentCategory = navigationPath[level];
    
  //   return (
  //     <div className="flex-none w-80 bg-white rounded-2xl shadow-lg border border-pink-100 h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">
  //       <div className="p-4 border-b border-pink-100">
  //         <div className="flex items-center justify-between">
  //           <h3 className="font-semibold text-gray-800 flex items-center gap-2">
  //             <Folder className="h-4 w-4 text-pink-500" />
  //             {level === 0 ? "Main Categories" : `Level ${level}`}
  //             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
  //               {categoriesAtLevel.length}
  //             </span>
  //           </h3>
  //           {level === 0 && (
  //             <button
  //               onClick={handleCreateMainCategory}
  //               className="p-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
  //               title="Add Main Category"
  //             >
  //               <Plus className="h-4 w-4" />
  //             </button>
  //           )}
  //         </div>
  //       </div>
        
  //       <div className="p-3 overflow-y-auto h-[calc(100%-80px)]">
  //         {categoriesAtLevel.length === 0 ? (
  //           <div className="text-center py-8 text-gray-500">
  //             <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
  //             <p>No categories yet</p>
  //             {level === 0 ? (
  //               <button
  //                 onClick={handleCreateMainCategory}
  //                 className="mt-3 text-pink-600 hover:text-pink-700 text-sm"
  //               >
  //                 + Create first category
  //               </button>
  //             ) : null}
  //           </div>
  //         ) : (
  //           <div className="space-y-2">
  //             {categoriesAtLevel.map((category) => {
  //               const isSelected = currentCategory?._id === category._id;
                
  //               return (
  //                 <div
  //                   key={category._id}
  //                   onClick={() => handleCategorySelect(category)}
  //                   className={`p-3 rounded-lg cursor-pointer transition-all ${
  //                     isSelected
  //                       ? "bg-pink-50 border border-pink-300"
  //                       : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
  //                   }`}
  //                 >
  //                   <div className="flex items-center justify-between">
  //                     <div className="flex items-center gap-3">
  //                       <div className={`p-1.5 rounded ${isSelected ? 'bg-pink-200' : 'bg-gray-100'}`}>
  //                         <Folder className="h-4 w-4 text-pink-500" />
  //                       </div>
  //                       <div>
  //                         <div className="font-medium text-gray-800">{category.name}</div>
  //                         <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
  //                           <span className={`px-1.5 py-0.5 rounded ${category.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
  //                             {category.active ? 'Active' : 'Inactive'}
  //                           </span>
  //                           <span className="flex items-center gap-1">
  //                             <Package className="h-3 w-3" />
  //                             {category.productCount || 0}
  //                           </span>
  //                           {category.children && category.children.length > 0 && (
  //                             <span className="flex items-center gap-1">
  //                               <Folder className="h-3 w-3" />
  //                               {category.children.length}
  //                             </span>
  //                           )}
  //                         </div>
  //                       </div>
  //                     </div>
                      
  //                     <div className="flex items-center gap-1">
  //                       {category.children && category.children.length > 0 && (
  //                         <ChevronRight className="h-4 w-4 text-gray-400" />
  //                       )}
  //                       <button
  //                         onClick={(e) => {
  //                           e.stopPropagation();
  //                           const rect = e.currentTarget.getBoundingClientRect();
  //                           setDropdownPosition({
  //                             top: rect.bottom + window.scrollY,
  //                             left: rect.left
  //                           });
  //                           setCategoryDropdown(category._id);
  //                           setProductDropdown(null);
  //                         }}
  //                         className="p-1 hover:bg-gray-200 rounded"
  //                       >
  //                         <MoreVertical className="h-4 w-4 text-gray-500" />
  //                       </button>
  //                     </div>
  //                   </div>
  //                 </div>
  //               );
  //             })}
              
  //             {level > 0 && currentCategory && (
  //               <button
  //                 onClick={() => handleCreateSubCategory(currentCategory._id)}
  //                 className="w-full p-2.5 mt-3 border border-dashed border-pink-300 rounded-lg text-pink-600 hover:bg-pink-50 flex items-center justify-center gap-2"
  //               >
  //                 <Plus className="h-4 w-4" />
  //                 Add Subcategory
  //               </button>
  //             )}
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // };

  //  const renderCategoryColumn = (level) => {
  // const categoriesAtLevel = getCategoriesForLevel(level);
  // const currentCategory = navigationPath[level];
  
  // return (
  //   <div className="flex-none w-80 bg-white rounded-2xl shadow-lg border border-pink-100 h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">
  //     <div className="p-4 border-b border-pink-100">
  //       <div className="flex items-center justify-between">
  //         <h3 className="font-semibold text-gray-800 flex items-center gap-2">
  //           <Folder className="h-4 w-4 text-pink-500" />
  //           {level === 0 ? "Main Categories" : `Level ${level}`}
  //           <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
  //             {categoriesAtLevel.length}
  //           </span>
  //         </h3>
  //         {level === 0 && (
  //           <button
  //             onClick={handleCreateMainCategory}
  //             className="p-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
  //             title="Add Main Category"
  //           >
  //             <Plus className="h-4 w-4" />
  //           </button>
  //         )}
  //       </div>
  //     </div>
      
  //     <div className="p-3 overflow-y-auto h-[calc(100%-80px)]">
  //       {categoriesAtLevel.length === 0 ? (
  //         <div className="text-center py-8 text-gray-500">
  //           <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
  //           <p>No categories yet</p>
  //           {level === 0 ? (
  //             <button
  //               onClick={handleCreateMainCategory}
  //               className="mt-3 text-pink-600 hover:text-pink-700 text-sm"
  //             >
  //               + Create first category
  //             </button>
  //           ) : null}
  //         </div>
  //       ) : (
  //         <div className="space-y-2">
  //           {categoriesAtLevel.map((category) => {
  //             const isSelected = currentCategory?._id === category._id;
              
  //             return (
  //               <div
  //                 key={category._id}
  //                 onClick={() => handleCategorySelect(category)}
  //                 className={`p-3 rounded-lg cursor-pointer transition-all ${
  //                   isSelected
  //                     ? "bg-pink-50 border border-pink-300"
  //                     : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
  //                 }`}
  //               >
  //                 <div className="flex items-center justify-between">
  //                   <div className="flex items-center gap-3">
  //                     {/* Folder icon with optional image badge */}
  //                     <div className="relative">
  //                       <div className={`p-1.5 rounded ${isSelected ? 'bg-pink-200' : 'bg-gray-100'}`}>
  //                         <Folder className="h-4 w-4 text-pink-500" />
  //                       </div>
  //                       {/* Show small image badge if category has images */}
  //                       {category.images && category.images.length > 0 && (
  //                         <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full overflow-hidden border-2 border-white bg-white shadow-sm">
  //                           <img 
  //                             src={category.images[0]} 
  //                             alt=""
  //                             className="w-full h-full object-cover"
  //                             onError={(e) => {
  //                               // If image fails to load, show a fallback
  //                               e.target.style.display = 'none';
  //                               e.target.parentElement.innerHTML = '<div class="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">IMG</div>';
  //                             }}
  //                           />
  //                         </div>
  //                       )}
  //                     </div>
                      
  //                     <div className="flex-1 min-w-0">
  //                       <div className="font-medium text-gray-800 truncate">{category.name}</div>
  //                       <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
  //                         <span className={`px-1.5 py-0.5 rounded ${category.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
  //                           {category.active ? 'Active' : 'Inactive'}
  //                         </span>
  //                         <span className="flex items-center gap-1">
  //                           <Package className="h-3 w-3" />
  //                           {category.productCount || 0}
  //                         </span>
  //                         {category.children && category.children.length > 0 && (
  //                           <span className="flex items-center gap-1">
  //                             <Folder className="h-3 w-3" />
  //                             {category.children.length}
  //                           </span>
  //                         )}
  //                         {/* Show image count badge - FIXED to show actual count */}
  //                         {category.images && category.images.length > 0 && (
  //                           <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">
  //                             <svg className="h-3 w-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
  //                               <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
  //                             </svg>
  //                             {category.images.length}
  //                           </span>
  //                         )}
  //                       </div>
  //                     </div>
  //                   </div>
                    
  //                   <div className="flex items-center gap-1">
  //                     {category.children && category.children.length > 0 && (
  //                       <ChevronRight className="h-4 w-4 text-gray-400" />
  //                     )}
  //                     <button
  //                       onClick={(e) => {
  //                         e.stopPropagation();
  //                         const rect = e.currentTarget.getBoundingClientRect();
  //                         setDropdownPosition({
  //                           top: rect.bottom + window.scrollY,
  //                           left: rect.left
  //                         });
  //                         setCategoryDropdown(category._id);
  //                         setProductDropdown(null);
  //                       }}
  //                       className="p-1 hover:bg-gray-200 rounded"
  //                     >
  //                       <MoreVertical className="h-4 w-4 text-gray-500" />
  //                     </button>
  //                   </div>
  //                 </div>
  //               </div>
  //             );
  //           })}
            
  //           {level > 0 && currentCategory && (
  //             <button
  //               onClick={() => handleCreateSubCategory(currentCategory._id)}
  //               className="w-full p-2.5 mt-3 border border-dashed border-pink-300 rounded-lg text-pink-600 hover:bg-pink-50 flex items-center justify-center gap-2"
  //             >
  //               <Plus className="h-4 w-4" />
  //               Add Subcategory
  //             </button>
  //           )}
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );
  // };

//   const renderCategoryColumn = (level) => {
//   const categoriesAtLevel = getCategoriesForLevel(level);
//   const currentCategory = navigationPath[level];
  
//   return (
//     <div className="flex-none w-80 bg-white rounded-2xl shadow-lg border border-pink-100 h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">
//       <div className="p-4 border-b border-pink-100">
//         {/* <div className="flex items-center justify-between">
//           <h3 className="font-semibold text-gray-800 flex items-center gap-2">
//             <Folder className="h-4 w-4 text-pink-500" />
//             {level === 0 ? "Main Categories" : `Level ${level}`}
//             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
//               {categoriesAtLevel.length}
//             </span>
//           </h3>
//           {level === 0 && (
//             <button
//               onClick={handleCreateMainCategory}
//               className="p-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
//               title="Add Main Category"
//             >
//               <Plus className="h-4 w-4" />
//             </button>
//           )}
//         </div> */}

//         <div className="flex items-center justify-between">
//           <h3 className="font-semibold text-gray-800 flex items-center gap-2">
//             <Folder className="h-4 w-4 text-pink-500" />
//             {level === 0 ? "Main Categories" : `Level ${level}`}
//             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
//               {categoriesAtLevel.length}
//             </span>
//           </h3>
//           {level === 0 && (
//             <div className="flex gap-2">
//               <button
//                 onClick={() => handleCreateProduct(null)}  // NEW
//                 className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                 title="Add Main Product"
//               >
//                 <Package className="h-4 w-4" />
//               </button>
//               <button
//                 onClick={handleCreateMainCategory}
//                 className="p-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
//                 title="Add Main Category"
//               >
//                 <Plus className="h-4 w-4" />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
      
//       <div className="p-3 overflow-y-auto h-[calc(100%-80px)]">
//         {categoriesAtLevel.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
//             <p>No categories yet</p>
//             {level === 0 ? (
//               <button
//                 onClick={handleCreateMainCategory}
//                 className="mt-3 text-pink-600 hover:text-pink-700 text-sm"
//               >
//                 + Create first category
//               </button>
//             ) : null}
//           </div>
//         ) : (
//           <div className="space-y-2">
//             {categoriesAtLevel.map((category) => {
//               const isSelected = currentCategory?._id === category._id;
              
//               return (
//                 <div
//                   key={category._id}
//                   onClick={() => handleCategorySelect(category)}
//                   className={`p-3 rounded-lg cursor-pointer transition-all ${
//                     isSelected
//                       ? "bg-pink-50 border border-pink-300"
//                       : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       {/* Folder icon with image badge */}
//                       <div className="relative group">
//                         {/* Main folder icon */}
//                         <div className={`p-1.5 rounded ${isSelected ? 'bg-pink-200' : 'bg-gray-100'}`}>
//                           <Folder className="h-4 w-4 text-pink-500" />
//                         </div>
                        
//                         {/* Image badges in corners - show up to 2 images */}
//                         {category.images && category.images.length > 0 && (
//                           <>
//                             {/* First image badge - top right */}
//                             <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full overflow-hidden border-2 border-white bg-white shadow-sm">
//                               <img 
//                                 src={category.images[0]} 
//                                 alt=""
//                                 className="w-full h-full object-cover"
//                               />
//                             </div>
                            
//                             {/* Second image badge - bottom left (if exists) */}
//                             {category.images.length > 1 && (
//                               <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full overflow-hidden border-2 border-white bg-white shadow-sm">
//                                 <img 
//                                   src={category.images[1]} 
//                                   alt=""
//                                   className="w-full h-full object-cover"
//                                 />
//                               </div>
//                             )}
                            
//                             {/* More images indicator (if > 2) */}
//                             {category.images.length > 2 && (
//                               <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white text-white text-[8px] flex items-center justify-center shadow-sm">
//                                 +{category.images.length - 2}
//                               </div>
//                             )}
//                           </>
//                         )}
                        
//                         {/* Image preview on hover */}
//                         {category.images && category.images.length > 0 && (
//                           <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
//                             <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-64">
//                               <div className="grid grid-cols-3 gap-2 mb-2">
//                                 {category.images.slice(0, 6).map((img, index) => (
//                                   <div key={index} className="aspect-square overflow-hidden rounded-md">
//                                     <img 
//                                       src={img} 
//                                       alt={`${category.name} ${index + 1}`}
//                                       className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
//                                     />
//                                   </div>
//                                 ))}
//                               </div>
//                               {category.images.length > 6 && (
//                                 <p className="text-xs text-gray-500 text-center">
//                                   +{category.images.length - 6} more images
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                         )}
//                       </div>
                      
//                       <div className="flex-1 min-w-0">
//                         <div className="font-medium text-gray-800 truncate">{category.name}</div>
//                         <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
//                           <span className={`px-1.5 py-0.5 rounded ${category.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
//                             {category.active ? 'Active' : 'Inactive'}
//                           </span>
//                           <span className="flex items-center gap-1">
//                             <Package className="h-3 w-3" />
//                             {category.productCount || 0}
//                           </span>
//                           {category.children && category.children.length > 0 && (
//                             <span className="flex items-center gap-1">
//                               <Folder className="h-3 w-3" />
//                               {category.children.length}
//                             </span>
//                           )}
//                           {/* Image count badge with SVG icon */}
//                           {category.images && category.images.length > 0 && (
//                             <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">
//                               <svg className="h-3 w-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
//                                 <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
//                               </svg>
//                               {category.images.length}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-1">
//                       {category.children && category.children.length > 0 && (
//                         <ChevronRight className="h-4 w-4 text-gray-400" />
//                       )}
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           const rect = e.currentTarget.getBoundingClientRect();
//                           setDropdownPosition({
//                             top: rect.bottom + window.scrollY,
//                             left: rect.left
//                           });
//                           setCategoryDropdown(category._id);
//                           setProductDropdown(null);
//                         }}
//                         className="p-1 hover:bg-gray-200 rounded"
//                       >
//                         <MoreVertical className="h-4 w-4 text-gray-500" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
            
//             {level > 0 && currentCategory && (
//               <button
//                 onClick={() => handleCreateSubCategory(currentCategory._id)}
//                 className="w-full p-2.5 mt-3 border border-dashed border-pink-300 rounded-lg text-pink-600 hover:bg-pink-50 flex items-center justify-center gap-2"
//               >
//                 <Plus className="h-4 w-4" />
//                 Add Subcategory
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const renderCategoryColumn = (level) => {
//   const categoriesAtLevel = getCategoriesForLevel(level);
//   const currentCategory = navigationPath[level];
  
//   return (
//     <div className="flex-none w-80 bg-white rounded-2xl shadow-lg border border-pink-100 h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">
//       <div className="p-4 border-b border-pink-100">
//         <div className="flex items-center justify-between">
//           <h3 className="font-semibold text-gray-800 flex items-center gap-2">
//             <Folder className="h-4 w-4 text-pink-500" />
//             {level === 0 ? "Main Categories" : `Level ${level}`}
//             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
//               {categoriesAtLevel.length}
//             </span>
//           </h3>
//           {level === 0 && (
//             <div className="flex gap-2">
//               <button
//                 onClick={() => handleCreateProduct(null)}  // null = main product
//                 className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                 title="Add Store Product"
//               >
//                 <Package className="h-4 w-4" />
//               </button>
//               <button
//                 onClick={handleCreateMainCategory}
//                 className="p-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
//                 title="Add Main Category"
//               >
//                 <Plus className="h-4 w-4" />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
      
//       <div className="p-3 overflow-y-auto h-[calc(100%-80px)]">
//         {/* STORE PRODUCTS SECTION (only for level 0) */}
//         {level === 0 && mainProducts.length > 0 && (
//           <div className="mb-6">
//             <div className="flex items-center justify-between mb-3">
//               <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
//                 <Package className="h-3.5 w-3.5 text-blue-500" />
//                 Store Products
//               </h4>
//               <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
//                 {mainProducts.length}
//               </span>
//             </div>
//             <div className="space-y-2">
//               {mainProducts.map((product) => (
//                 <div
//                   key={product._id}
//                   onClick={() => handleMainProductSelect(product)}
//                   className={`p-3 rounded-lg cursor-pointer transition-all ${
//                     selectedProduct?._id === product._id && !selectedCategory
//                       ? "bg-blue-50 border border-blue-300"
//                       : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className="p-1.5 rounded bg-blue-100">
//                         <Package className="h-4 w-4 text-blue-500" />
//                       </div>
//                       <div>
//                         <div className="font-medium text-gray-800 text-sm">{product.name}</div>
//                         <div className="text-xs text-gray-500">
//                           ₹{product.price} • {product.unit}
//                           <span className={`ml-2 px-1.5 py-0.5 rounded ${product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
//                             {product.active ? 'Active' : 'Inactive'}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         const rect = e.currentTarget.getBoundingClientRect();
//                         setDropdownPosition({
//                           top: rect.bottom + window.scrollY,
//                           left: rect.left
//                         });
//                         setProductDropdown(product._id);
//                         setCategoryDropdown(null);
//                       }}
//                       className="p-1 hover:bg-gray-200 rounded"
//                     >
//                       <MoreVertical className="h-4 w-4 text-gray-500" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div className="border-t my-4"></div>
//           </div>
//         )}
        
//         {/* REGULAR CATEGORIES */}
//         {categoriesAtLevel.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
//             <p>No categories yet</p>
//             {level === 0 && (
//               <button
//                 onClick={handleCreateMainCategory}
//                 className="mt-3 text-pink-600 hover:text-pink-700 text-sm"
//               >
//                 + Create first category
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-2">
//             {categoriesAtLevel.map((category) => {
//               const isSelected = currentCategory?._id === category._id;
              
//               return (
//                 <div
//                   key={category._id}
//                   onClick={() => handleCategorySelect(category)}
//                   className={`p-3 rounded-lg cursor-pointer transition-all ${
//                     isSelected
//                       ? "bg-pink-50 border border-pink-300"
//                       : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className={`p-1.5 rounded ${isSelected ? 'bg-pink-200' : 'bg-gray-100'}`}>
//                         <Folder className="h-4 w-4 text-pink-500" />
//                       </div>
//                       <div>
//                         <div className="font-medium text-gray-800">{category.name}</div>
//                         <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
//                           <span className={`px-1.5 py-0.5 rounded ${category.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
//                             {category.active ? 'Active' : 'Inactive'}
//                           </span>
//                           <span className="flex items-center gap-1">
//                             <Package className="h-3 w-3" />
//                             {category.productCount || 0}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-1">
//                       {category.children && category.children.length > 0 && (
//                         <ChevronRight className="h-4 w-4 text-gray-400" />
//                       )}
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           const rect = e.currentTarget.getBoundingClientRect();
//                           setDropdownPosition({
//                             top: rect.bottom + window.scrollY,
//                             left: rect.left
//                           });
//                           setCategoryDropdown(category._id);
//                           setProductDropdown(null);
//                         }}
//                         className="p-1 hover:bg-gray-200 rounded"
//                       >
//                         <MoreVertical className="h-4 w-4 text-gray-500" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
            
//             {level > 0 && currentCategory && (
//               <button
//                 onClick={() => handleCreateSubCategory(currentCategory._id)}
//                 className="w-full p-2.5 mt-3 border border-dashed border-pink-300 rounded-lg text-pink-600 hover:bg-pink-50 flex items-center justify-center gap-2"
//               >
//                 <Plus className="h-4 w-4" />
//                 Add Subcategory
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const renderCategoryColumn = (level) => {
//   const categoriesAtLevel = getCategoriesForLevel(level);
//   const currentCategory = navigationPath[level];
  
//   return (
//     <div className="flex-none w-80 bg-white rounded-2xl shadow-lg border border-pink-100 h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">
//       <div className="p-4 border-b border-pink-100">
//         <div className="flex items-center justify-between">
//           <h3 className="font-semibold text-gray-800 flex items-center gap-2">
//             <Folder className="h-4 w-4 text-pink-500" />
//             {level === 0 ? "Main Categories" : `Level ${level}`}
//             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
//               {categoriesAtLevel.length}
//             </span>
//           </h3>
//           {level === 0 && (
//             <div className="flex gap-2">
//               <button
//                 onClick={() => handleCreateProduct(null)}
//                 className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                 title="Add Store Product"
//               >
//                 <Package className="h-4 w-4" />
//               </button>
//               <button
//                 onClick={handleCreateMainCategory}
//                 className="p-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
//                 title="Add Main Category"
//               >
//                 <Plus className="h-4 w-4" />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
      
//       <div className="p-3 overflow-y-auto h-[calc(100%-80px)]">
//         {/* STORE PRODUCTS SECTION (only for level 0) */}
//         {level === 0 && mainProducts.length > 0 && (
//           <div className="mb-6">
//             <div className="flex items-center justify-between mb-3">
//               <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
//                 <Package className="h-3.5 w-3.5 text-blue-500" />
//                 Store Products
//               </h4>
//               <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
//                 {mainProducts.length}
//               </span>
//             </div>
//             <div className="space-y-2">
//               {mainProducts.map((product) => (
//                 <div
//                   key={product._id}
//                   onClick={() => handleMainProductSelect(product)}
//                   className={`p-3 rounded-lg cursor-pointer transition-all ${
//                     selectedProduct?._id === product._id && !selectedCategory
//                       ? "bg-blue-50 border border-blue-300"
//                       : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className="p-1.5 rounded bg-blue-100">
//                         <Package className="h-4 w-4 text-blue-500" />
//                       </div>
//                       <div>
//                         <div className="font-medium text-gray-800 text-sm">{product.name}</div>
//                         <div className="text-xs text-gray-500">
//                           ₹{product.price} • {product.unit}
//                           <span className={`ml-2 px-1.5 py-0.5 rounded ${product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
//                             {product.active ? 'Active' : 'Inactive'}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         const rect = e.currentTarget.getBoundingClientRect();
//                         setDropdownPosition({
//                           top: rect.bottom + window.scrollY,
//                           left: rect.left
//                         });
//                         setProductDropdown(product._id);
//                         setCategoryDropdown(null);
//                       }}
//                       className="p-1 hover:bg-gray-200 rounded"
//                     >
//                       <MoreVertical className="h-4 w-4 text-gray-500" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div className="border-t my-4"></div>
//           </div>
//         )}
        
//         {/* REGULAR CATEGORIES */}
//         {categoriesAtLevel.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
//             <p>No categories yet</p>
//             {level === 0 && (
//               <button
//                 onClick={handleCreateMainCategory}
//                 className="mt-3 text-pink-600 hover:text-pink-700 text-sm"
//               >
//                 + Create first category
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-2">
//             {categoriesAtLevel.map((category) => {
//               const isSelected = currentCategory?._id === category._id;
              
//               return (
//                 <div
//                   key={category._id}
//                   onClick={() => handleCategorySelect(category)}
//                   className={`p-3 rounded-lg cursor-pointer transition-all ${
//                     isSelected
//                       ? "bg-pink-50 border border-pink-300"
//                       : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       {/* FIXED: Folder icon with image badge - SAME AS SUBCATEGORY */}
//                       <div className="relative group">
//                         {/* Main folder icon */}
//                         <div className={`p-1.5 rounded ${isSelected ? 'bg-pink-200' : 'bg-gray-100'}`}>
//                           <Folder className="h-4 w-4 text-pink-500" />
//                         </div>
                        
//                         {/* Image badges in corners - show up to 2 images */}
//                         {category.images && category.images.length > 0 && (
//                           <>
//                             {/* First image badge - top right */}
//                             <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full overflow-hidden border-2 border-white bg-white shadow-sm">
//                               <img 
//                                 src={category.images[0]} 
//                                 alt=""
//                                 className="w-full h-full object-cover"
//                                 onError={(e) => {
//                                   // If image fails to load, show a fallback
//                                   e.target.style.display = 'none';
//                                   e.target.parentElement.innerHTML = '<div class="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">IMG</div>';
//                                 }}
//                               />
//                             </div>
                            
//                             {/* Second image badge - bottom left (if exists) */}
//                             {category.images.length > 1 && (
//                               <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full overflow-hidden border-2 border-white bg-white shadow-sm">
//                                 <img 
//                                   src={category.images[1]} 
//                                   alt=""
//                                   className="w-full h-full object-cover"
//                                   onError={(e) => {
//                                     e.target.style.display = 'none';
//                                     e.target.parentElement.innerHTML = '<div class="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">IMG</div>';
//                                   }}
//                                 />
//                               </div>
//                             )}
                            
//                             {/* More images indicator (if > 2) */}
//                             {category.images.length > 2 && (
//                               <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white text-white text-[8px] flex items-center justify-center shadow-sm">
//                                 +{category.images.length - 2}
//                               </div>
//                             )}
//                           </>
//                         )}
                        
//                         {/* Image preview on hover */}
//                         {category.images && category.images.length > 0 && (
//                           <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
//                             <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-64">
//                               <div className="grid grid-cols-3 gap-2 mb-2">
//                                 {category.images.slice(0, 6).map((img, index) => (
//                                   <div key={index} className="aspect-square overflow-hidden rounded-md">
//                                     <img 
//                                       src={img} 
//                                       alt={`${category.name} ${index + 1}`}
//                                       className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
//                                       onError={(e) => {
//                                         e.target.style.display = 'none';
//                                         e.target.parentElement.innerHTML = '<div class="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">IMG</div>';
//                                       }}
//                                     />
//                                   </div>
//                                 ))}
//                               </div>
//                               {category.images.length > 6 && (
//                                 <p className="text-xs text-gray-500 text-center">
//                                   +{category.images.length - 6} more images
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                         )}
//                       </div>
                      
//                       <div className="flex-1 min-w-0">
//                         <div className="font-medium text-gray-800 truncate">{category.name}</div>
//                         <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
//                           <span className={`px-1.5 py-0.5 rounded ${category.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
//                             {category.active ? 'Active' : 'Inactive'}
//                           </span>
//                           <span className="flex items-center gap-1">
//                             <Package className="h-3 w-3" />
//                             {category.productCount || 0}
//                           </span>
//                           {category.children && category.children.length > 0 && (
//                             <span className="flex items-center gap-1">
//                               <Folder className="h-3 w-3" />
//                               {category.children.length}
//                             </span>
//                           )}
//                           {/* Show image count badge - FIXED to show actual count */}
//                           {category.images && category.images.length > 0 && (
//                             <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">
//                               <svg className="h-3 w-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
//                                 <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
//                               </svg>
//                               {category.images.length}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-1">
//                       {category.children && category.children.length > 0 && (
//                         <ChevronRight className="h-4 w-4 text-gray-400" />
//                       )}
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           const rect = e.currentTarget.getBoundingClientRect();
//                           setDropdownPosition({
//                             top: rect.bottom + window.scrollY,
//                             left: rect.left
//                           });
//                           setCategoryDropdown(category._id);
//                           setProductDropdown(null);
//                         }}
//                         className="p-1 hover:bg-gray-200 rounded"
//                       >
//                         <MoreVertical className="h-4 w-4 text-gray-500" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
            
//             {level > 0 && currentCategory && (
//               <button
//                 onClick={() => handleCreateSubCategory(currentCategory._id)}
//                 className="w-full p-2.5 mt-3 border border-dashed border-pink-300 rounded-lg text-pink-600 hover:bg-pink-50 flex items-center justify-center gap-2"
//               >
//                 <Plus className="h-4 w-4" />
//                 Add Subcategory
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const renderCategoryColumn = (level) => {
//   const categoriesAtLevel = getCategoriesForLevel(level);
//   const currentCategory = navigationPath[level];
  
//   return (
//     <div className="flex-none w-80 bg-white rounded-2xl shadow-lg border border-pink-100 h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">
//       <div className="p-4 border-b border-pink-100">
//         <div className="flex items-center justify-between">
//           <h3 className="font-semibold text-gray-800 flex items-center gap-2">
//             <Folder className="h-4 w-4 text-pink-500" />
//             {level === 0 ? "Main Categories" : `Level ${level}`}
//             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
//               {categoriesAtLevel.length}
//             </span>
//           </h3>
//           {level === 0 && (
//             <div className="flex gap-2">
//               <button
//                 onClick={handleCreateMainCategory}
//                 className="p-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
//                 title="Add Main Category"
//               >
//                 <Plus className="h-4 w-4" />
//               </button>
//               <button
//                 onClick={() => handleCreateProduct(null)}
//                 className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                 title="Add Store Product"
//               >
//                 <Package className="h-4 w-4" />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
      
//       <div className="p-3 overflow-y-auto h-[calc(100%-80px)]">
//         {/* MAIN CATEGORIES SECTION - SHOW FIRST */}
//         {categoriesAtLevel.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
//             <p>No categories yet</p>
//             {level === 0 && (
//               <button
//                 onClick={handleCreateMainCategory}
//                 className="mt-3 text-pink-600 hover:text-pink-700 text-sm"
//               >
//                 + Create first category
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-2">
//             {categoriesAtLevel.map((category) => {
//               const isSelected = currentCategory?._id === category._id;
              
//               return (
//                 <div
//                   key={category._id}
//                   onClick={() => handleCategorySelect(category)}
//                   className={`p-3 rounded-lg cursor-pointer transition-all ${
//                     isSelected
//                       ? "bg-pink-50 border border-pink-300"
//                       : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       {/* Folder icon with image badge */}
//                       <div className="relative group">
//                         {/* Main folder icon */}
//                         <div className={`p-1.5 rounded ${isSelected ? 'bg-pink-200' : 'bg-gray-100'}`}>
//                           <Folder className="h-4 w-4 text-pink-500" />
//                         </div>
                        
//                         {/* Image badges in corners - show up to 2 images */}
//                         {category.images && category.images.length > 0 && (
//                           <>
//                             {/* First image badge - top right */}
//                             <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full overflow-hidden border-2 border-white bg-white shadow-sm">
//                               <img 
//                                 src={category.images[0]} 
//                                 alt=""
//                                 className="w-full h-full object-cover"
//                                 onError={(e) => {
//                                   // If image fails to load, show a fallback
//                                   e.target.style.display = 'none';
//                                   e.target.parentElement.innerHTML = '<div class="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">IMG</div>';
//                                 }}
//                               />
//                             </div>
                            
//                             {/* Second image badge - bottom left (if exists) */}
//                             {category.images.length > 1 && (
//                               <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full overflow-hidden border-2 border-white bg-white shadow-sm">
//                                 <img 
//                                   src={category.images[1]} 
//                                   alt=""
//                                   className="w-full h-full object-cover"
//                                   onError={(e) => {
//                                     e.target.style.display = 'none';
//                                     e.target.parentElement.innerHTML = '<div class="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">IMG</div>';
//                                   }}
//                                 />
//                               </div>
//                             )}
                            
//                             {/* More images indicator (if > 2) */}
//                             {category.images.length > 2 && (
//                               <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white text-white text-[8px] flex items-center justify-center shadow-sm">
//                                 +{category.images.length - 2}
//                               </div>
//                             )}
//                           </>
//                         )}
                        
//                         {/* Image preview on hover */}
//                         {category.images && category.images.length > 0 && (
//                           <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
//                             <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-64">
//                               <div className="grid grid-cols-3 gap-2 mb-2">
//                                 {category.images.slice(0, 6).map((img, index) => (
//                                   <div key={index} className="aspect-square overflow-hidden rounded-md">
//                                     <img 
//                                       src={img} 
//                                       alt={`${category.name} ${index + 1}`}
//                                       className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
//                                       onError={(e) => {
//                                         e.target.style.display = 'none';
//                                         e.target.parentElement.innerHTML = '<div class="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">IMG</div>';
//                                       }}
//                                     />
//                                   </div>
//                                 ))}
//                               </div>
//                               {category.images.length > 6 && (
//                                 <p className="text-xs text-gray-500 text-center">
//                                   +{category.images.length - 6} more images
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                         )}
//                       </div>
                      
//                       <div className="flex-1 min-w-0">
//                         <div className="font-medium text-gray-800 truncate">{category.name}</div>
//                         <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
//                           <span className={`px-1.5 py-0.5 rounded ${category.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
//                             {category.active ? 'Active' : 'Inactive'}
//                           </span>
//                           <span className="flex items-center gap-1">
//                             <Package className="h-3 w-3" />
//                             {category.productCount || 0}
//                           </span>
//                           {category.children && category.children.length > 0 && (
//                             <span className="flex items-center gap-1">
//                               <Folder className="h-3 w-3" />
//                               {category.children.length}
//                             </span>
//                           )}
//                           {/* Show image count badge - FIXED to show actual count */}
//                           {category.images && category.images.length > 0 && (
//                             <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">
//                               <svg className="h-3 w-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
//                                 <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
//                               </svg>
//                               {category.images.length}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-1">
//                       {category.children && category.children.length > 0 && (
//                         <ChevronRight className="h-4 w-4 text-gray-400" />
//                       )}
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           const rect = e.currentTarget.getBoundingClientRect();
//                           setDropdownPosition({
//                             top: rect.bottom + window.scrollY,
//                             left: rect.left
//                           });
//                           setCategoryDropdown(category._id);
//                           setProductDropdown(null);
//                         }}
//                         className="p-1 hover:bg-gray-200 rounded"
//                       >
//                         <MoreVertical className="h-4 w-4 text-gray-500" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
            
//             {level > 0 && currentCategory && (
//               <button
//                 onClick={() => handleCreateSubCategory(currentCategory._id)}
//                 className="w-full p-2.5 mt-3 border border-dashed border-pink-300 rounded-lg text-pink-600 hover:bg-pink-50 flex items-center justify-center gap-2"
//               >
//                 <Plus className="h-4 w-4" />
//                 Add Subcategory
//               </button>
//             )}
//           </div>
//         )}
        
//         {/* STORE PRODUCTS SECTION (only for level 0) - SHOW AFTER CATEGORIES */}
//         {level === 0 && mainProducts.length > 0 && (
//           <div className="mt-6 pt-6 border-t border-gray-200">
//             <div className="flex items-center justify-between mb-3">
//               <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
//                 <Package className="h-3.5 w-3.5 text-blue-500" />
//                 Main Products
//               </h4>
//               <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
//                 {mainProducts.length}
//               </span>
//             </div>
//             <div className="space-y-2">
//               {mainProducts.map((product) => (
//                 <div
//                   key={product._id}
//                   onClick={() => handleMainProductSelect(product)}
//                   className={`p-3 rounded-lg cursor-pointer transition-all ${
//                     selectedProduct?._id === product._id && !selectedCategory
//                       ? "bg-blue-50 border border-blue-300"
//                       : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className="p-1.5 rounded bg-blue-100">
//                         <Package className="h-4 w-4 text-blue-500" />
//                       </div>
//                       <div>
//                         <div className="font-medium text-gray-800 text-sm">{product.name}</div>
//                         <div className="text-xs text-gray-500">
//                           ₹{product.price} • {product.unit}
//                           <span className={`ml-2 px-1.5 py-0.5 rounded ${product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
//                             {product.active ? 'Active' : 'Inactive'}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         const rect = e.currentTarget.getBoundingClientRect();
//                         setDropdownPosition({
//                           top: rect.bottom + window.scrollY,
//                           left: rect.left
//                         });
//                         setProductDropdown(product._id);
//                         setCategoryDropdown(null);
//                       }}
//                       className="p-1 hover:bg-gray-200 rounded"
//                     >
//                       <MoreVertical className="h-4 w-4 text-gray-500" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };


// const renderCategoryColumn = (level) => {
//   const categoriesAtLevel = getCategoriesForLevel(level);
//   const currentCategory = navigationPath[level];
  
//   return (
//     <div className="flex-none w-80 bg-white rounded-2xl shadow-lg border border-pink-100 h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">
//       <div className="p-4 border-b border-pink-100">
//         <div className="flex items-center justify-between">
//           <h3 className="font-semibold text-gray-800 flex items-center gap-2">
//             <Folder className="h-4 w-4 text-pink-500" />
//             {level === 0 ? "Main Categories" : `Level ${level}`}
//             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
//               {categoriesAtLevel.length}
//             </span>
//           </h3>
//           {level === 0 && (
//             <div className="flex gap-2">
//               <button
//                 onClick={handleCreateMainCategory}
//                 className="p-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
//                 title="Add Main Category"
//               >
//                 <Plus className="h-4 w-4" />
//               </button>
//               <button
//                 onClick={() => handleCreateProduct(null)}
//                 className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                 title="Add Store Product"
//               >
//                 <Package className="h-4 w-4" />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
      
//       <div className="p-3 overflow-y-auto h-[calc(100%-80px)]">
//         {/* MAIN CATEGORIES SECTION - SHOW FIRST */}
//         {categoriesAtLevel.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
//             <p>No categories yet</p>
//             {level === 0 && (
//               <button
//                 onClick={handleCreateMainCategory}
//                 className="mt-3 text-pink-600 hover:text-pink-700 text-sm"
//               >
//                 + Create first category
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-2">
//             {categoriesAtLevel.map((category) => {
//               const isSelected = currentCategory?._id === category._id;
              
//               return (
//                 <div
//                   key={category._id}
//                   onClick={() => handleCategorySelect(category)}
//                   className={`p-3 rounded-lg cursor-pointer transition-all ${
//                     isSelected
//                       ? "bg-pink-50 border border-pink-300"
//                       : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       {/* Folder icon with image badge */}
//                       <div className="relative group">
//                         {/* Main folder icon */}
//                         <div className={`p-1.5 rounded ${isSelected ? 'bg-pink-200' : 'bg-gray-100'}`}>
//                           <Folder className="h-4 w-4 text-pink-500" />
//                         </div>
                        
//                         {/* Image badges in corners - show up to 2 images */}
//                         {category.images && category.images.length > 0 && (
//                           <>
//                             {/* First image badge - top right */}
//                             <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full overflow-hidden border-2 border-white bg-white shadow-sm">
//                               <img 
//                                 src={category.images[0]} 
//                                 alt=""
//                                 className="w-full h-full object-cover"
//                                 onError={(e) => {
//                                   // If image fails to load, show a fallback
//                                   e.target.style.display = 'none';
//                                   e.target.parentElement.innerHTML = '<div class="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">IMG</div>';
//                                 }}
//                               />
//                             </div>
                            
//                             {/* Second image badge - bottom left (if exists) */}
//                             {category.images.length > 1 && (
//                               <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full overflow-hidden border-2 border-white bg-white shadow-sm">
//                                 <img 
//                                   src={category.images[1]} 
//                                   alt=""
//                                   className="w-full h-full object-cover"
//                                   onError={(e) => {
//                                     e.target.style.display = 'none';
//                                     e.target.parentElement.innerHTML = '<div class="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">IMG</div>';
//                                   }}
//                                 />
//                               </div>
//                             )}
                            
//                             {/* More images indicator (if > 2) */}
//                             {category.images.length > 2 && (
//                               <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white text-white text-[8px] flex items-center justify-center shadow-sm">
//                                 +{category.images.length - 2}
//                               </div>
//                             )}
//                           </>
//                         )}
                        
//                         {/* Image preview on hover */}
//                         {category.images && category.images.length > 0 && (
//                           <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
//                             <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-64">
//                               <div className="grid grid-cols-3 gap-2 mb-2">
//                                 {category.images.slice(0, 6).map((img, index) => (
//                                   <div key={index} className="aspect-square overflow-hidden rounded-md">
//                                     <img 
//                                       src={img} 
//                                       alt={`${category.name} ${index + 1}`}
//                                       className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
//                                       onError={(e) => {
//                                         e.target.style.display = 'none';
//                                         e.target.parentElement.innerHTML = '<div class="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">IMG</div>';
//                                       }}
//                                     />
//                                   </div>
//                                 ))}
//                               </div>
//                               {category.images.length > 6 && (
//                                 <p className="text-xs text-gray-500 text-center">
//                                   +{category.images.length - 6} more images
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                         )}
//                       </div>
                      
//                       <div className="flex-1 min-w-0">
//                         <div className="font-medium text-gray-800 truncate">{category.name}</div>
//                         <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
//                           <span className={`px-1.5 py-0.5 rounded ${category.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
//                             {category.active ? 'Active' : 'Inactive'}
//                           </span>
//                           <span className="flex items-center gap-1">
//                             <Package className="h-3 w-3" />
//                             {category.productCount || 0}
//                           </span>
//                           {category.children && category.children.length > 0 && (
//                             <span className="flex items-center gap-1">
//                               <Folder className="h-3 w-3" />
//                               {category.children.length}
//                             </span>
//                           )}
                          
//                           {category.images && category.images.length > 0 && (
//                             <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">
//                               <svg className="h-3 w-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
//                                 <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
//                               </svg>
//                               {category.images.length}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-1">
//                       {category.children && category.children.length > 0 && (
//                         <ChevronRight className="h-4 w-4 text-gray-400" />
//                       )}
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           const rect = e.currentTarget.getBoundingClientRect();
//                           setDropdownPosition({
//                             top: rect.bottom + window.scrollY,
//                             left: rect.left
//                           });
//                           setCategoryDropdown(category._id);
//                           setProductDropdown(null);
//                         }}
//                         className="p-1 hover:bg-gray-200 rounded"
//                       >
//                         <MoreVertical className="h-4 w-4 text-gray-500" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
            
//             {level > 0 && currentCategory && (
//               <button
//                 onClick={() => handleCreateSubCategory(currentCategory._id)}
//                 className="w-full p-2.5 mt-3 border border-dashed border-pink-300 rounded-lg text-pink-600 hover:bg-pink-50 flex items-center justify-center gap-2"
//               >
//                 <Plus className="h-4 w-4" />
//                 Add Subcategory
//               </button>
//             )}
//           </div>
//         )}
        
//         {/* STORE PRODUCTS SECTION (only for level 0) - SHOW AFTER CATEGORIES */}
//         {level === 0 && mainProducts.length > 0 && (
//           <div className="mt-6 pt-6 border-t border-gray-200">
//             <div className="flex items-center justify-between mb-3">
//               <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
//                 <Package className="h-3.5 w-3.5 text-blue-500" />
//                 Main Products
//               </h4>
//               <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
//                 {mainProducts.length}
//               </span>
//             </div>
//             <div className="space-y-2">
//               {mainProducts.map((product) => (
//                 <div
//                   key={product._id}
//                   onClick={() => handleMainProductSelect(product)}
//                   className={`p-3 rounded-lg cursor-pointer transition-all ${
//                     selectedProduct?._id === product._id && !selectedCategory
//                       ? "bg-blue-50 border border-blue-300"
//                       : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       {/* PRODUCT IMAGE SECTION - Similar to regular products */}
//                       <div className="relative">
//                         {product.images && product.images.length > 0 ? (
//                           <>
//                             {/* First image (main) */}
//                             <img 
//                               src={product.images[0]} 
//                               alt={product.name}
//                               className="w-10 h-10 rounded-lg object-cover border border-gray-200 relative z-10"
//                               onError={(e) => {
//                                 // Fallback to package icon
//                                 e.target.style.display = 'none';
//                                 const parent = e.target.parentElement;
//                                 parent.innerHTML = `
//                                   <div class="p-1.5 rounded bg-blue-100">
//                                     <Package class="h-4 w-4 text-blue-500" />
//                                   </div>
//                                 `;
//                               }}
//                             />
                            
//                             {/* Second image (slightly offset behind) */}
//                             {product.images.length > 1 && (
//                               <img 
//                                 src={product.images[1]} 
//                                 alt={product.name}
//                                 className="absolute top-0 left-0 w-10 h-10 rounded-lg object-cover border border-gray-200 transform -translate-x-1 -translate-y-1 opacity-80 z-0"
//                                 onError={(e) => e.target.style.display = 'none'}
//                               />
//                             )}
                            
//                             {/* Third image (slightly offset behind) */}
//                             {product.images.length > 2 && (
//                               <img 
//                                 src={product.images[2]} 
//                                 alt={product.name}
//                                 className="absolute top-0 left-0 w-10 h-10 rounded-lg object-cover border border-gray-200 transform translate-x-1 translate-y-1 opacity-60 z-0"
//                                 onError={(e) => e.target.style.display = 'none'}
//                               />
//                             )}
//                           </>
//                         ) : (
//                           <div className="p-1.5 rounded bg-blue-100">
//                             <Package className="h-4 w-4 text-blue-500" />
//                           </div>
//                         )}
                        
//                         {/* Hover preview for all images */}
//                         {product.images && product.images.length > 0 && (
//                           <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-20 w-48">
//                             <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3">
//                               <div className="grid grid-cols-3 gap-2">
//                                 {product.images.slice(0, 9).map((img, index) => (
//                                   <div key={index} className="aspect-square overflow-hidden rounded-md">
//                                     <img 
//                                       src={img} 
//                                       alt={`${product.name} ${index + 1}`}
//                                       className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
//                                     />
//                                   </div>
//                                 ))}
//                               </div>
//                               {product.images.length > 9 && (
//                                 <p className="text-xs text-gray-500 text-center mt-2">
//                                   +{product.images.length - 9} more
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                         )}
//                       </div>
                      
//                       <div>
//                         <div className="font-medium text-gray-800 text-sm">{product.name}</div>
//                         <div className="text-xs text-gray-500">
//                           ₹{product.price} • {product.unit}
//                           <span className={`ml-2 px-1.5 py-0.5 rounded ${product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
//                             {product.active ? 'Active' : 'Inactive'}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         const rect = e.currentTarget.getBoundingClientRect();
//                         setDropdownPosition({
//                           top: rect.bottom + window.scrollY,
//                           left: rect.left
//                         });
//                         setProductDropdown(product._id);
//                         setCategoryDropdown(null);
//                       }}
//                       className="p-1 hover:bg-gray-200 rounded"
//                     >
//                       <MoreVertical className="h-4 w-4 text-gray-500" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
const renderCategoryColumn = (level) => {
  const categoriesAtLevel = getCategoriesForLevel(level);
  const currentCategory = navigationPath[level];
  
  return (
    <div className="flex-none w-80 bg-white rounded-2xl shadow-lg border border-pink-100 h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">
      <div className="p-4 border-b border-pink-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Folder className="h-4 w-4 text-pink-500" />
            {level === 0 ? "Main Categories" : `Level ${level}`}
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {categoriesAtLevel.length}
            </span>
          </h3>
          {level === 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleCreateMainCategory}
                className="p-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                title="Add Main Category"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleCreateProduct(null)}
                className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                title="Add Store Product"
              >
                <Package className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-3 overflow-y-auto h-[calc(100%-80px)]">
        {/* MAIN CATEGORIES SECTION - SHOW FIRST */}
        {categoriesAtLevel.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No categories yet</p>
            {level === 0 && (
              <button
                onClick={handleCreateMainCategory}
                className="mt-3 text-pink-600 hover:text-pink-700 text-sm"
              >
                + Create first category
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {categoriesAtLevel.map((category) => {
              const isSelected = currentCategory?._id === category._id;
              
              return (
                <div
                  key={category._id}
                  onClick={() => handleCategorySelect(category)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "bg-pink-50 border border-pink-300"
                      : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Folder icon with image badge */}
                      <div className="relative group">
                        {/* Main folder icon */}
                        <div className={`p-1.5 rounded ${isSelected ? 'bg-pink-200' : 'bg-gray-100'}`}>
                          <Folder className="h-4 w-4 text-pink-500" />
                        </div>
                        
                        {/* Image badges in corners - show up to 2 images */}
                        {category.images && category.images.length > 0 && (
                          <>
                            {/* First image badge - top right */}
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full overflow-hidden border-2 border-white bg-white shadow-sm">
                              <img 
                                src={category.images[0]} 
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // If image fails to load, show a fallback
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div class="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">IMG</div>';
                                }}
                              />
                            </div>
                            
                            {/* Second image badge - bottom left (if exists) */}
                            {category.images.length > 1 && (
                              <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full overflow-hidden border-2 border-white bg-white shadow-sm">
                                <img 
                                  src={category.images[1]} 
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div class="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">IMG</div>';
                                  }}
                                />
                              </div>
                            )}
                            
                            {/* More images indicator (if > 2) */}
                            {category.images.length > 2 && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white text-white text-[8px] flex items-center justify-center shadow-sm">
                                +{category.images.length - 2}
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* Image preview on hover */}
                        {category.images && category.images.length > 0 && (
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-64">
                              <div className="grid grid-cols-3 gap-2 mb-2">
                                {category.images.slice(0, 6).map((img, index) => (
                                  <div key={index} className="aspect-square overflow-hidden rounded-md">
                                    <img 
                                      src={img} 
                                      alt={`${category.name} ${index + 1}`}
                                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = '<div class="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs">IMG</div>';
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                              {category.images.length > 6 && (
                                <p className="text-xs text-gray-500 text-center">
                                  +{category.images.length - 6} more images
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">{category.name}</div>
                        {/* SHOW COUNTS ONLY WHEN CATEGORY IS SELECTED */}
                        {isSelected && (
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span className={`px-1.5 py-0.5 rounded ${category.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                              {category.active ? 'Active' : 'Inactive'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {products.filter(p => p.categoryId === category._id).length}
                            </span>
                            <span className="flex items-center gap-1">
                              <Folder className="h-3 w-3" />
                              {category.children?.length || 0}
                            </span>
                            {category.images && category.images.length > 0 && (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">
                                <svg className="h-3 w-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                                {category.images.length}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {category.children && category.children.length > 0 && (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setDropdownPosition({
                            top: rect.bottom + window.scrollY,
                            left: rect.left
                          });
                          setCategoryDropdown(category._id);
                          setProductDropdown(null);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {level > 0 && currentCategory && (
              <button
                onClick={() => handleCreateSubCategory(currentCategory._id)}
                className="w-full p-2.5 mt-3 border border-dashed border-pink-300 rounded-lg text-pink-600 hover:bg-pink-50 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Subcategory
              </button>
            )}
          </div>
        )}
        
        {/* STORE PRODUCTS SECTION (only for level 0) - SHOW AFTER CATEGORIES */}
        {level === 0 && mainProducts.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-blue-500" />
                Main Products
              </h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {mainProducts.length}
              </span>
            </div>
            <div className="space-y-2">
              {mainProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleMainProductSelect(product)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedProduct?._id === product._id && !selectedCategory
                      ? "bg-blue-50 border border-blue-300"
                      : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* PRODUCT IMAGE SECTION - Similar to regular products */}
                      <div className="relative">
                        {product.images && product.images.length > 0 ? (
                          <>
                            {/* First image (main) */}
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200 relative z-10"
                              onError={(e) => {
                                // Fallback to package icon
                                e.target.style.display = 'none';
                                const parent = e.target.parentElement;
                                parent.innerHTML = `
                                  <div class="p-1.5 rounded bg-blue-100">
                                    <Package class="h-4 w-4 text-blue-500" />
                                  </div>
                                `;
                              }}
                            />
                            
                            {/* Second image (slightly offset behind) */}
                            {product.images.length > 1 && (
                              <img 
                                src={product.images[1]} 
                                alt={product.name}
                                className="absolute top-0 left-0 w-10 h-10 rounded-lg object-cover border border-gray-200 transform -translate-x-1 -translate-y-1 opacity-80 z-0"
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            )}
                            
                            {/* Third image (slightly offset behind) */}
                            {product.images.length > 2 && (
                              <img 
                                src={product.images[2]} 
                                alt={product.name}
                                className="absolute top-0 left-0 w-10 h-10 rounded-lg object-cover border border-gray-200 transform translate-x-1 translate-y-1 opacity-60 z-0"
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            )}
                          </>
                        ) : (
                          <div className="p-1.5 rounded bg-blue-100">
                            <Package className="h-4 w-4 text-blue-500" />
                          </div>
                        )}
                        
                        {/* Hover preview for all images */}
                        {product.images && product.images.length > 0 && (
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-20 w-48">
                            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3">
                              <div className="grid grid-cols-3 gap-2">
                                {product.images.slice(0, 9).map((img, index) => (
                                  <div key={index} className="aspect-square overflow-hidden rounded-md">
                                    <img 
                                      src={img} 
                                      alt={`${product.name} ${index + 1}`}
                                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                                    />
                                  </div>
                                ))}
                              </div>
                              {product.images.length > 9 && (
                                <p className="text-xs text-gray-500 text-center mt-2">
                                  +{product.images.length - 9} more
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{product.name}</div>
                        <div className="text-xs text-gray-500">
                          ₹{product.price} • {product.unit}
                          <span className={`ml-2 px-1.5 py-0.5 rounded ${product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                            {product.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setDropdownPosition({
                          top: rect.bottom + window.scrollY,
                          left: rect.left
                        });
                        setProductDropdown(product._id);
                        setCategoryDropdown(null);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

  const renderProductsColumn = () => {
  if (!selectedCategory) return null;
  
  // Get subcategories of the selected category
  const subcategories = selectedCategory.children || [];
  
  // Get products for the selected category
  const productsForThisCategory = products.filter(p => p.categoryId === selectedCategory._id);
  
  // Filter products based on search term
  const filteredProducts = productsForThisCategory.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-none w-80 bg-white rounded-2xl shadow-lg border border-pink-100 h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">
      <div className="p-4 border-b border-pink-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-pink-500" />
            {selectedCategory.name}
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {subcategories.length + filteredProducts.length}
            </span>
          </h3>
          <button
            onClick={() => handleCreateProduct(selectedCategory._id)}
            className="p-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search in this category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
          />
        </div>
      </div>
      
      <div className="p-3 overflow-y-auto h-[calc(100%-120px)]">
        {subcategories.length === 0 && filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No items in this category</p>
            <button
              onClick={() => handleCreateProduct(selectedCategory._id)}
              className="mt-3 text-pink-600 hover:text-pink-700 text-sm"
            >
              + Add first product
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Show Subcategories First */}
            {subcategories.map((subcategory) => (
              <div
                key={subcategory._id}
                onClick={() => handleCategorySelect(subcategory)}
                className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-gray-100">
                      <Folder className="h-4 w-4 text-pink-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{subcategory.name}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className={`px-1.5 py-0.5 rounded ${subcategory.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                          {subcategory.active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {subcategory.productCount || 0}
                        </span>
                        {subcategory.children && subcategory.children.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Folder className="h-3 w-3" />
                            {subcategory.children.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {subcategory.children && subcategory.children.length > 0 && (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setDropdownPosition({
                          top: rect.bottom + window.scrollY,
                          left: rect.left
                        });
                        setCategoryDropdown(subcategory._id);
                        setProductDropdown(null);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show Products in this Category */}
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => handleProductSelect(product)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedProduct?._id === product._id
                    ? "bg-blue-50 border border-blue-300"
                    : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded ${selectedProduct?._id === product._id ? 'bg-blue-200' : 'bg-gray-100'}`}>
                      <Package className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        ${product.price} • {product.unit}
                        <span className={`ml-2 px-1.5 py-0.5 rounded ${product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                          {product.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {product.archived && (
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full">
                        Archived
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setDropdownPosition({
                          top: rect.bottom + window.scrollY,
                          left: rect.left
                        });
                        setProductDropdown(product._id);
                        setCategoryDropdown(null);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add buttons at the bottom */}
            <div className="space-y-2 mt-3">
              <button
                onClick={() => handleCreateSubCategory(selectedCategory._id)}
                className="w-full p-2.5 border border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2"
              >
                <Layers className="h-4 w-4" />
                Add Subcategory
              </button>
              <button
                onClick={() => handleCreateProduct(selectedCategory._id)}
                className="w-full p-2.5 border border-dashed border-pink-300 rounded-lg text-pink-600 hover:bg-pink-50 flex items-center justify-center gap-2"
              >
                <Package className="h-4 w-4" />
                Add Product Here
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

  // const renderProductsColumn = () => {
  //   if (!selectedCategory) return null;
    
  //   const hasChildren = selectedCategory.children && selectedCategory.children.length > 0;
    
  //   // If category has children, show children instead of products
  //   if (hasChildren) {
  //     return null;
  //   }
    
  //   const filteredProducts = products.filter(product => 
  //     product.name.toLowerCase().includes(searchTerm.toLowerCase())
  //   );

  //   return (
  //     <div className="flex-none w-80 bg-white rounded-2xl shadow-lg border border-pink-100 h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">
  //       <div className="p-4 border-b border-pink-100">
  //         <div className="flex items-center justify-between mb-3">
  //           <h3 className="font-semibold text-gray-800 flex items-center gap-2">
  //             <Package className="h-4 w-4 text-pink-500" />
  //             Products
  //             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
  //               {filteredProducts.length}
  //             </span>
  //           </h3>
  //           <button
  //             onClick={() => handleCreateProduct(selectedCategory._id)}
  //             className="p-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
  //           >
  //             <Plus className="h-4 w-4" />
  //           </button>
  //         </div>
          
  //         <div className="relative">
  //           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
  //           <input
  //             type="text"
  //             placeholder="Search products..."
  //             value={searchTerm}
  //             onChange={(e) => setSearchTerm(e.target.value)}
  //             className="w-full pl-10 pr-4 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
  //           />
  //         </div>
  //       </div>
        
  //       <div className="p-3 overflow-y-auto h-[calc(100%-120px)]">
  //         {filteredProducts.length === 0 ? (
  //           <div className="text-center py-8 text-gray-500">
  //             <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
  //             <p>No products in this category</p>
  //             <button
  //               onClick={() => handleCreateProduct(selectedCategory._id)}
  //               className="mt-3 text-pink-600 hover:text-pink-700 text-sm"
  //             >
  //               + Add first product
  //             </button>
  //           </div>
  //         ) : (
  //           <div className="space-y-2">
  //             {filteredProducts.map((product) => (
  //               <div
  //                 key={product._id}
  //                 onClick={() => handleProductSelect(product)}
  //                 className={`p-3 rounded-lg cursor-pointer transition-all ${
  //                   selectedProduct?._id === product._id
  //                     ? "bg-pink-50 border border-pink-300"
  //                     : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
  //                 }`}
  //               >
  //                 <div className="flex items-center justify-between">
  //                   <div className="flex items-center gap-3">
  //                     <div className={`w-2 h-2 rounded-full ${product.active ? 'bg-green-500' : 'bg-gray-400'}`} />
  //                     <div>
  //                       <div className="font-medium text-gray-800 text-sm">{product.name}</div>
  //                       <div className="text-xs text-gray-500">
  //                         ${product.price} • {product.unit}
  //                       </div>
  //                     </div>
  //                   </div>
                    
  //                   <div className="flex items-center gap-1">
  //                     {product.archived && (
  //                       <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full">
  //                         Archived
  //                       </span>
  //                     )}
  //                     <button
  //                       onClick={(e) => {
  //                         e.stopPropagation();
  //                         const rect = e.currentTarget.getBoundingClientRect();
  //                         setDropdownPosition({
  //                           top: rect.bottom + window.scrollY,
  //                           left: rect.left
  //                         });
  //                         setProductDropdown(product._id);
  //                         setCategoryDropdown(null);
  //                       }}
  //                       className="p-1 hover:bg-gray-200 rounded"
  //                     >
  //                       <MoreVertical className="h-4 w-4 text-gray-500" />
  //                     </button>
  //                   </div>
  //                 </div>
  //               </div>
  //             ))}
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // };

  const renderChildrenColumn = () => {
    if (!selectedCategory) return null;
    
    const hasChildren = selectedCategory.children && selectedCategory.children.length > 0;
    
    // Only show children column if category has children
    if (!hasChildren) return null;
    
    const children = selectedCategory.children || [];
    
    return (
      <div className="flex-none w-80 bg-white rounded-2xl shadow-lg border border-pink-100 h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">
        <div className="p-4 border-b border-pink-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Folder className="h-4 w-4 text-pink-500" />
              Subcategories
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {children.length}
              </span>
            </h3>
            <button
              onClick={() => handleCreateSubCategory(selectedCategory._id)}
              className="p-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="p-3 overflow-y-auto h-[calc(100%-80px)]">
          {children.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No subcategories yet</p>
              <button
                onClick={() => handleCreateSubCategory(selectedCategory._id)}
                className="mt-3 text-pink-600 hover:text-pink-700 text-sm"
              >
                + Add subcategory
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {children.map((category) => (
                <div
                  key={category._id}
                  onClick={() => handleCategorySelect(category)}
                  className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-gray-100">
                        <Folder className="h-4 w-4 text-pink-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{category.name}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span className={`px-1.5 py-0.5 rounded ${category.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                            {category.active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {category.productCount || 0}
                          </span>
                          {category.children && category.children.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Folder className="h-3 w-3" />
                              {category.children.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {category.children && category.children.length > 0 && (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setDropdownPosition({
                            top: rect.bottom + window.scrollY,
                            left: rect.left
                          });
                          setCategoryDropdown(category._id);
                          setProductDropdown(null);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => handleCreateSubCategory(selectedCategory._id)}
                className="w-full p-2.5 mt-3 border border-dashed border-pink-300 rounded-lg text-pink-600 hover:bg-pink-50 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Subcategory
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDetailsColumn = () => {
    if (selectedProduct) {
      return (
        <div className="flex-none w-96 bg-white rounded-2xl shadow-lg border border-pink-100 h-[calc(100vh-280px)] overflow-hidden">
          <div className="p-4 border-b border-pink-100">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Package className="h-4 w-4 text-pink-500" />
              Product Details
            </h3>
          </div>
          
          <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
            <ProductDetails
              product={selectedProduct}
              onEdit={() => handleEditProduct(selectedProduct)}
              onDelete={() => {
                setDeleteModalData({
                  type: "product",
                  id: selectedProduct._id,
                  name: selectedProduct.name
                });
                setShowDeleteModal(true);
              }}
              onToggleStatus={() => handleToggleProductStatus(
                selectedProduct._id,
                selectedProduct.active
              )}
              onArchive={() => handleArchiveProduct(
                selectedProduct._id,
                !selectedProduct.archived
              )}
            />
          </div>
        </div>
      );
    }
    
    // if (selectedCategory) {
    //   return (
    //     <div className="flex-none w-96 bg-white rounded-2xl shadow-lg border border-pink-100 h-[calc(100vh-280px)] overflow-hidden">
    //       <div className="p-4 border-b border-pink-100">
    //         <h3 className="font-semibold text-gray-800 flex items-center gap-2">
    //           <FolderOpen className="h-4 w-4 text-pink-500" />
    //           Category Details
    //         </h3>
    //       </div>
          
    //       <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
    //         <CategoryDetails
    //           category={selectedCategory}
    //           onEdit={() => handleEditCategory(selectedCategory)}
    //           onDelete={() => {
    //             setDeleteModalData({
    //               type: "category",
    //               id: selectedCategory._id,
    //               name: selectedCategory.name
    //             });
    //             setShowDeleteModal(true);
    //           }}
    //           onToggleStatus={() => handleToggleCategoryStatus(
    //             selectedCategory._id,
    //             selectedCategory.active
    //           )}
    //           onArchive={() => handleArchiveCategory(
    //             selectedCategory._id,
    //             !selectedCategory.archived
    //           )}
    //           onAddProduct={() => handleCreateProduct(selectedCategory._id)}
    //           onAddSubCategory={() => handleCreateSubCategory(selectedCategory._id)}
    //           level={selectedCategory.level || 0}
    //         />
    //       </div>
    //     </div>
    //   );
    // }
    
    return null;
  };

  // ====== CATEGORY HANDLERS ======
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

  const handleCreateSubCategory = (parentId) => {
    const parentCategory = findCategoryById(categories, parentId);
    setSubcategoryModalData({
      mode: "create",
      data: {
        restaurantId: id,
        parentId: parentId,
        active: true,
        archived: false,
        availability: "always"
      },
      parentId: parentId,
      parentName: parentCategory?.name || "Parent Category"
    });
    setShowSubcategoryModal(true);
  };

  const handleEditCategory = (category) => {
    setCategoryModalData({
      mode: "edit",
      data: category,
      parentId: category.parentId
    });
    setShowCategoryModal(true);
  };

  // const handleCategorySubmit = async (categoryData) => {
  //   try {
  //     setLoading(prev => ({ ...prev, actions: true }));
      
  //     if (categoryModalData.mode === "create") {
  //       const categoryToCreate = {
  //         ...categoryData,
  //         restaurantId: id,
  //         parentId: categoryModalData.parentId
  //       };
        
  //       const response = await createCategory(categoryToCreate);
  //       const newCategory = formatCategory(response.data);
        
  //       const updatedCategories = addCategoryToTree(
  //         categories,
  //         {
  //           ...newCategory,
  //           children: [],
  //           level: categoryModalData.parentId ? getCategoryLevel(categoryModalData.parentId) : 0,
  //           parentId: categoryModalData.parentId
  //         },
  //         categoryModalData.parentId
  //       );
  //       setCategories(updatedCategories);
        
  //       toast.success("Category created successfully!");
        
  //       // Select the new category
  //       setTimeout(() => {
  //         handleCategorySelect(newCategory);
  //       }, 100);
  //     } else {
  //       const editedCategory = {
  //         ...categoryData,
  //         _id: categoryData._id
  //       };
        
  //       const {
  //         imageFiles = [],
  //         imagesToRemove = [],
  //         _id,
  //         ...categoryDataForApi
  //       } = editedCategory;
        
  //       const apiData = {
  //         name: categoryDataForApi.name,
  //         description: categoryDataForApi.description,
  //         availability: categoryDataForApi.availability,
  //         restaurantId: categoryDataForApi.restaurantId,
  //         active: categoryDataForApi.active === 'true' ? 'true' : String(Boolean(categoryDataForApi.active)),
  //         autoOnOff: categoryDataForApi.autoOnOff || 'false',
  //         availableAfterTime: categoryDataForApi.availableAfterTime,
  //         availableFromTime: categoryDataForApi.availableFromTime,
  //         availableToTime: categoryDataForApi.availableToTime
  //       };
        
  //       const response = await updateCategory(
  //         _id,
  //         apiData,
  //         imagesToRemove,
  //         imageFiles
  //       );
        
  //       const updatedCategory = formatCategory(response.data);
  //       const updatedCategories = updateCategoryInTree(categories, updatedCategory);
  //       setCategories(updatedCategories);
        
  //       if (selectedCategory?._id === updatedCategory._id) {
  //         setSelectedCategory(updatedCategory);
  //       }
        
  //       toast.success("Category updated successfully!");
  //     }
      
  //     setShowCategoryModal(false);
  //   } catch (error) {
  //     console.error("Error:", error);
  //     toast.error(`Failed to ${categoryModalData.mode} category`);
  //   } finally {
  //     setLoading(prev => ({ ...prev, actions: false }));
  //   }
  // };
    const handleCategorySubmit = async (categoryData) => {
    try {
      setLoading(prev => ({ ...prev, actions: true }));
      
      if (categoryModalData.mode === "create") {
        const categoryToCreate = {
          ...categoryData,
          restaurantId: id,
          parentId: categoryModalData.parentId
        };
        
        // EXTRACT imageFiles from categoryData and pass as SECOND parameter
        const imageFiles = categoryData.imageFiles || [];
        
        // Remove imageFiles from categoryToCreate before sending
        const { imageFiles: filesToUpload, ...categoryWithoutFiles } = categoryToCreate;
        
        // Pass TWO parameters: categoryData AND imageFiles
        const response = await createCategory(categoryWithoutFiles, imageFiles);
        
        const newCategory = formatCategory(response.data);
        
        const updatedCategories = addCategoryToTree(
          categories,
          {
            ...newCategory,
            children: [],
            level: categoryModalData.parentId ? getCategoryLevel(categoryModalData.parentId) : 0,
            parentId: categoryModalData.parentId
          },
          categoryModalData.parentId
        );
        setCategories(updatedCategories);
        
        toast.success("Category created successfully!");
        
        // Select the new category
        setTimeout(() => {
          handleCategorySelect(newCategory);
        }, 100);
      } else {
        // EDIT mode - also needs to pass imageFiles separately
        const editedCategory = {
          ...categoryData,
          _id: categoryData._id
        };
        
        const imageFiles = categoryData.imageFiles || [];
        const imagesToRemove = categoryData.imagesToRemove || [];
        
        // Extract the category data without files
        const { imageFiles: filesToUpload, imagesToRemove: filesToRemove, ...categoryDataForApi } = editedCategory;
        
        const response = await updateCategory(
          editedCategory._id,
          categoryDataForApi,
          imagesToRemove,
          imageFiles
        );
        
        const updatedCategory = formatCategory(response.data);
        const updatedCategories = updateCategoryInTree(categories, updatedCategory);
        setCategories(updatedCategories);
        
        if (selectedCategory?._id === updatedCategory._id) {
          setSelectedCategory(updatedCategory);
        }
        
        toast.success("Category updated successfully!");
      }
      
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Failed to ${categoryModalData.mode} category`);
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };
  // const handleSubcategorySubmit = async (modalFormData) => {
  //   try {
  //     setLoading(prev => ({ ...prev, actions: true }));
      
  //     if (!modalFormData.name || modalFormData.name.trim() === '') {
  //       toast.error("Category name is required!");
  //       setLoading(prev => ({ ...prev, actions: false }));
  //       return;
  //     }
      
  //     if (!id) {
  //       toast.error("Restaurant ID is missing!");
  //       setLoading(prev => ({ ...prev, actions: false }));
  //       return;
  //     }
      
  //     const payload = {
  //       levels: [
  //         {
  //           name: modalFormData.name.trim(),
  //           description: modalFormData.description || '',
  //           availability: modalFormData.availability || 'always',
  //           active: modalFormData.active !== undefined ? modalFormData.active : true,
  //           images: modalFormData.images || [],
  //           ...(modalFormData.availableAfterTime && { availableAfterTime: modalFormData.availableAfterTime }),
  //           ...(modalFormData.availableFromTime && { availableFromTime: modalFormData.availableFromTime }),
  //           ...(modalFormData.availableToTime && { availableToTime: modalFormData.availableToTime })
  //         }
  //       ],
  //       initialParentId: subcategoryModalData.parentId || null
  //     };
      
  //     const response = await createNestedCategories(id, payload);
      
  //     if (!response || !response.success) {
  //       throw new Error(response?.message || "Failed to create category");
  //     }
      
  //     if (!response.data || response.data.length === 0) {
  //       throw new Error("No category was created");
  //     }
      
  //     const newCategory = formatCategory(response.data[0]);
      
  //     const updatedCategories = addCategoryToTree(
  //       categories,
  //       {
  //         ...newCategory,
  //         children: [],
  //         level: getCategoryLevel(subcategoryModalData.parentId),
  //         parentId: subcategoryModalData.parentId
  //       },
  //       subcategoryModalData.parentId
  //     );
  //     setCategories(updatedCategories);
      
  //     toast.success(response.message || "Subcategory created successfully!");
      
  //     // Update the selected category's children
  //     if (selectedCategory?._id === subcategoryModalData.parentId) {
  //       const updatedSelectedCategory = findCategoryById(updatedCategories, selectedCategory._id);
  //       setSelectedCategory(updatedSelectedCategory);
  //     }
      
  //     setShowSubcategoryModal(false);
      
  //   } catch (error) {
  //     console.error("Error creating subcategory:", error);
  //     toast.error(error.response?.data?.message || error.message || "Failed to create subcategory");
  //   } finally {
  //     setLoading(prev => ({ ...prev, actions: false }));
  //   }
  // };
//   const handleSubcategorySubmit = async (modalFormData) => {
//   try {
//     setLoading(prev => ({ ...prev, actions: true }));
    
//     if (!modalFormData.name || modalFormData.name.trim() === '') {
//       toast.error("Category name is required!");
//       setLoading(prev => ({ ...prev, actions: false }));
//       return;
//     }
    
//     if (!id) {
//       toast.error("Restaurant ID is missing!");
//       setLoading(prev => ({ ...prev, actions: false }));
//       return;
//     }
    
//     // 1. Create the new subcategory object
//     const newSubcategory = {
//       _id: `temp_${Date.now()}`,
//       name: modalFormData.name.trim(),
//       description: modalFormData.description || '',
//       active: true,
//       archived: false,
//       productCount: 0,
//       children: [],
//       level: (selectedCategory?.level || 0) + 1,
//       parentId: subcategoryModalData.parentId,
//       images: modalFormData.images || [],
//       availability: modalFormData.availability || 'always',
//       isTemp: true
//     };
    
//     // 2. **CRITICAL: Update navigationPath - this is what renders the columns!**
//     setNavigationPath(prev => {
//       // If we're currently viewing the parent category
//       const lastCategory = prev[prev.length - 1];
//       if (lastCategory && lastCategory._id === subcategoryModalData.parentId) {
//         // Create a new array with the updated children
//         const updatedParent = {
//           ...lastCategory,
//           children: [...(lastCategory.children || []), newSubcategory]
//         };
        
//         // Replace the last item in the path with the updated parent
//         return [...prev.slice(0, -1), updatedParent];
//       }
//       return prev;
//     });
    
//     // 3. Also update selectedCategory if it's the parent
//     if (selectedCategory?._id === subcategoryModalData.parentId) {
//       setSelectedCategory(prev => ({
//         ...prev,
//         children: [...(prev.children || []), newSubcategory]
//       }));
//     }
    
//     // 4. Save to server
//     const payload = {
//       levels: [
//         {
//           name: modalFormData.name.trim(),
//           description: modalFormData.description || '',
//           availability: modalFormData.availability || 'always',
//           active: modalFormData.active !== undefined ? modalFormData.active : true,
//           images: modalFormData.images || [],
//           ...(modalFormData.availableAfterTime && { availableAfterTime: modalFormData.availableAfterTime }),
//           ...(modalFormData.availableFromTime && { availableFromTime: modalFormData.availableFromTime }),
//           ...(modalFormData.availableToTime && { availableToTime: modalFormData.availableToTime })
//         }
//       ],
//       initialParentId: subcategoryModalData.parentId || null
//     };
    
//     const response = await createNestedCategories(id, payload);
    
//     if (!response || !response.success) {
//       throw new Error(response?.message || "Failed to create category");
//     }
    
//     if (!response.data || response.data.length === 0) {
//       throw new Error("No category was created");
//     }
    
//     const newCategory = formatCategory(response.data[0]);
    
//     // 5. Update categories tree with real data
//     const updatedCategories = addCategoryToTree(
//       categories,
//       {
//         ...newCategory,
//         children: [],
//         level: getCategoryLevel(subcategoryModalData.parentId),
//         parentId: subcategoryModalData.parentId
//       },
//       subcategoryModalData.parentId
//     );
//     setCategories(updatedCategories);
    
//     // 6. Replace temp category with real one in navigationPath
//     setTimeout(() => {
//       setNavigationPath(prev => {
//         const lastCategory = prev[prev.length - 1];
//         if (lastCategory && lastCategory._id === subcategoryModalData.parentId) {
//           const updatedParent = {
//             ...lastCategory,
//             children: (lastCategory.children || []).map(child => 
//               child.isTemp ? newCategory : child
//             )
//           };
//           return [...prev.slice(0, -1), updatedParent];
//         }
//         return prev;
//       });
      
//       if (selectedCategory?._id === subcategoryModalData.parentId) {
//         setSelectedCategory(prev => ({
//           ...prev,
//           children: (prev.children || []).map(child => 
//             child.isTemp ? newCategory : child
//           )
//         }));
//       }
//     }, 100);
    
//     toast.success(response.message || "Subcategory created successfully!");
//     setShowSubcategoryModal(false);
    
//   } catch (error) {
//     console.error("Error creating subcategory:", error);
//     toast.error(error.response?.data?.message || error.message || "Failed to create subcategory");
    
//     // Remove temp category on error
//     setNavigationPath(prev => {
//       const lastCategory = prev[prev.length - 1];
//       if (lastCategory && lastCategory._id === subcategoryModalData.parentId) {
//         const updatedParent = {
//           ...lastCategory,
//           children: (lastCategory.children || []).filter(child => !child.isTemp)
//         };
//         return [...prev.slice(0, -1), updatedParent];
//       }
//       return prev;
//     });
    
//     if (selectedCategory?._id === subcategoryModalData.parentId) {
//       setSelectedCategory(prev => ({
//         ...prev,
//         children: (prev.children || []).filter(child => !child.isTemp)
//       }));
//     }
//   } finally {
//     setLoading(prev => ({ ...prev, actions: false }));
//   }
// };


// const handleSubcategorySubmit = async (modalFormData) => {
//   try {
//     setLoading(prev => ({ ...prev, actions: true }));
    
//     if (!modalFormData.name || modalFormData.name.trim() === '') {
//       toast.error("Category name is required!");
//       setLoading(prev => ({ ...prev, actions: false }));
//       return;
//     }
    
//     if (!id) {
//       toast.error("Restaurant ID is missing!");
//       setLoading(prev => ({ ...prev, actions: false }));
//       return;
//     }
    
//     const payload = {
//       levels: [
//         {
//           name: modalFormData.name.trim(),
//           description: modalFormData.description || '',
//           availability: modalFormData.availability || 'always',
//           active: modalFormData.active !== undefined ? modalFormData.active : true,
//           images: modalFormData.images || [],
//           ...(modalFormData.availableAfterTime && { availableAfterTime: modalFormData.availableAfterTime }),
//           ...(modalFormData.availableFromTime && { availableFromTime: modalFormData.availableFromTime }),
//           ...(modalFormData.availableToTime && { availableToTime: modalFormData.availableToTime })
//         }
//       ],
//       initialParentId: subcategoryModalData.parentId || null
//     };
    
//     const response = await createNestedCategories(id, payload);
    
//     if (!response || !response.success) {
//       throw new Error(response?.message || "Failed to create category");
//     }
    
//     if (!response.data || response.data.length === 0) {
//       throw new Error("No category was created");
//     }
    
//     const newCategory = formatCategory(response.data[0]);
    
//     const updatedCategories = addCategoryToTree(
//       categories,
//       {
//         ...newCategory,
//         children: [],
//         level: getCategoryLevel(subcategoryModalData.parentId),
//         parentId: subcategoryModalData.parentId
//       },
//       subcategoryModalData.parentId
//     );
//     setCategories(updatedCategories);
    
//     toast.success(response.message || "Subcategory created successfully!");
    
//     // FIXED: Update the selected category's children immediately
//     if (selectedCategory?._id === subcategoryModalData.parentId) {
//       // Find the updated category from the new categories tree
//       const updatedSelectedCategory = findCategoryById(updatedCategories, selectedCategory._id);
//       if (updatedSelectedCategory) {
//         setSelectedCategory({
//           ...updatedSelectedCategory,
//           children: [...(updatedSelectedCategory.children || []), newCategory]
//         });
//       }
//     }
    
//     // Also update the navigation path if it contains the parent category
//     if (navigationPath.some(cat => cat._id === subcategoryModalData.parentId)) {
//       const updatedPath = navigationPath.map(cat => {
//         if (cat._id === subcategoryModalData.parentId) {
//           return {
//             ...cat,
//             children: [...(cat.children || []), newCategory]
//           };
//         }
//         return cat;
//       });
//       setNavigationPath(updatedPath);
//     }
    
//     setShowSubcategoryModal(false);
    
//   } catch (error) {
//     console.error("Error creating subcategory:", error);
//     toast.error(error.response?.data?.message || error.message || "Failed to create subcategory");
//   } finally {
//     setLoading(prev => ({ ...prev, actions: false }));
//   }
// };

// const handleSubcategorySubmit = async (formData) => {
//   try {
//     setLoading(prev => ({ ...prev, actions: true }));
    
//     // Call the API with FormData
//     const response = await createNestedCategories(id, formData);
    
//     if (!response || !response.success) {
//       throw new Error(response?.message || "Failed to create category");
//     }
    
//     if (!response.data || response.data.length === 0) {
//       throw new Error("No category was created");
//     }
    
//     const newCategory = formatCategory(response.data[0]);
    
//     // Update state
//     const updatedCategories = addCategoryToTree(
//       categories,
//       {
//         ...newCategory,
//         children: [],
//         level: getCategoryLevel(subcategoryModalData.parentId),
//         parentId: subcategoryModalData.parentId
//       },
//       subcategoryModalData.parentId
//     );
//     setCategories(updatedCategories);
    
//     toast.success(response.message || "Subcategory created successfully!");
    
//     // Update selected category
//     if (selectedCategory?._id === subcategoryModalData.parentId) {
//       const updatedSelectedCategory = findCategoryById(updatedCategories, selectedCategory._id);
//       if (updatedSelectedCategory) {
//         setSelectedCategory({
//           ...updatedSelectedCategory,
//           children: [...(updatedSelectedCategory.children || []), newCategory]
//         });
//       }
//     }
    
//     setShowSubcategoryModal(false);
    
//   } catch (error) {
//     console.error("Error creating subcategory:", error);
//     toast.error(error.response?.data?.message || error.message || "Failed to create subcategory");
//   } finally {
//     setLoading(prev => ({ ...prev, actions: false }));
//   }
// };

const handleSubcategorySubmit = async (formData) => {
  try {
    setLoading(prev => ({ ...prev, actions: true }));
    
    // Call the API with FormData
    const response = await createNestedCategories(id, formData);
    
    if (!response || !response.success) {
      throw new Error(response?.message || "Failed to create category");
    }
    
    if (!response.data || response.data.length === 0) {
      throw new Error("No category was created");
    }
    
    const newCategory = formatCategory(response.data[0]);
    
    // Update state
    const updatedCategories = addCategoryToTree(
      categories,
      {
        ...newCategory,
        children: [],
        level: getCategoryLevel(subcategoryModalData.parentId),
        parentId: subcategoryModalData.parentId
      },
      subcategoryModalData.parentId
    );
    setCategories(updatedCategories);
    
    toast.success(response.message || "Subcategory created successfully!");
    
    // FIX: Update navigation path if we're currently viewing the parent category
    if (selectedCategory?._id === subcategoryModalData.parentId) {
      // 1. Update selectedCategory to show the new subcategory
      const updatedSelectedCategory = {
        ...selectedCategory,
        children: [...(selectedCategory.children || []), newCategory]
      };
      setSelectedCategory(updatedSelectedCategory);
      
      // 2. Update navigationPath to reflect the new children
      setNavigationPath(prev => {
        const updatedPath = [...prev];
        const lastIndex = updatedPath.length - 1;
        if (lastIndex >= 0 && updatedPath[lastIndex]._id === subcategoryModalData.parentId) {
          updatedPath[lastIndex] = updatedSelectedCategory;
        }
        return updatedPath;
      });
    }
    
    setShowSubcategoryModal(false);
    
  } catch (error) {
    console.error("Error creating subcategory:", error);
    toast.error(error.response?.data?.message || error.message || "Failed to create subcategory");
  } finally {
    setLoading(prev => ({ ...prev, actions: false }));
  }
};
  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      
      const removeCategoryFromTree = (cats, targetId) => {
        return cats
          .filter(category => category._id !== targetId)
          .map(category => {
            if (category.children && category.children.length > 0) {
              return {
                ...category,
                children: removeCategoryFromTree(category.children, targetId)
              };
            }
            return category;
          });
      };
      
      const updatedCategories = removeCategoryFromTree(categories, categoryId);
      setCategories(updatedCategories);
      
      toast.success("Category deleted successfully!");
      setShowDeleteModal(false);
      
      // Reset selection if deleted category was selected
      if (selectedCategory?._id === categoryId) {
        setSelectedCategory(null);
        setNavigationPath([]);
        setSelectedProduct(null);
      }
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const handleToggleCategoryStatus = async (categoryId, currentStatus) => {
    try {
      await toggleCategoryStatus(categoryId);
      await fetchCategories();
      toast.success(`Category ${currentStatus ? "disabled" : "enabled"} successfully!`);
    } catch (error) {
      console.error('Failed to toggle category status:', error);
      toast.error('❌ Failed to update category status');
    }
  };

  const handleArchiveCategory = async (categoryId, shouldArchive) => {
    try {
      if (shouldArchive) {
        await archiveCategory(categoryId);
      } else {
        await unarchiveCategory(categoryId);
      }
      
      await fetchCategories();
      toast.success(`Category ${shouldArchive ? "archived" : "unarchived"} successfully!`);
    } catch (error) {
      console.error('Failed to archive category:', error);
      toast.error('Failed to update category archive status');
    }
  };

  // ====== PRODUCT HANDLERS ======
  // const handleCreateProduct = (categoryId) => {
  //   const category = findCategoryById(categories, categoryId);
  //   setProductModalData({
  //     mode: "create",
  //     data: {
  //       categoryId,
  //       restaurantId: id,
  //       categoryName: category?.name
  //     }
  //   });
  //   setShowProductModal(true);
  // };

  const handleCreateProduct = (categoryId) => {
  // If categoryId is null, it's a store-level/main product

  console.log("cateegoryId in handleCreateProduct:", categoryId);
  const isMainProduct = categoryId === null;
  
  let targetCategoryId = null;
  let categoryName = "Store Products";
  
  // Only set category if it's NOT null (regular category product)
  if (categoryId && categoryId !== "main") {
    const category = findCategoryById(categories, categoryId);
    targetCategoryId = categoryId;
    categoryName = category?.name || "Category";
  }
  
  setProductModalData({
    mode: "create",
    data: {
      categoryId: targetCategoryId, // null for main products
      restaurantId: id,
      categoryName: categoryName
    }
  });
  setShowProductModal(true);
};

  // const handleEditProduct = (product) => {
  //   setProductModalData({
  //     mode: "edit",
  //     data: product
  //   });
  //   setShowProductModal(true);
  // };

  const handleEditProduct = (product) => {
  // Get the correct category name based on product type
  let categoryName = "Store Products"; // Default for main products
  
  if (product.categoryId) {
    // Regular category product
    const category = findCategoryById(categories, product.categoryId);
    categoryName = category?.name || "Category";
  }
  
  // For main products, categoryName remains "Store Products"
  
  setProductModalData({
    mode: "edit",
    data: {
      ...product,
      categoryName: categoryName // This is what the modal needs
    }
  });
  setShowProductModal(true);
};

  const handleProductSubmit = async (productData) => {
    try {
      setLoading(prev => ({ ...prev, actions: true }));
      
      if (productModalData.mode === "create") {
        const newImages = productData.images.filter((img) => img instanceof File);
        const existingImages = productData.images.filter(
          (img) => typeof img === "string"
        );
        const preparedProductData = {
          ...productData,
          images: existingImages,
          restaurantId: id,
          // categoryId: productData.categoryId || selectedCategory._id,
          categoryId: productModalData.data?.categoryId,
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
        
        const response = await createProduct(preparedProductData, id, preparedProductData.categoryId);
        const newProduct = formatProduct(response.data);
        
        setProducts(prev => [...prev, newProduct]);
        
        const updateProductCount = (cats, targetId) => {
          return cats.map(cat => {
            if (cat._id === targetId) {
              return {
                ...cat,
                productCount: (cat.productCount || 0) + 1
              };
            }
            if (cat.children && cat.children.length > 0) {
              return {
                ...cat,
                children: updateProductCount(cat.children, targetId)
              };
            }
            return cat;
          });
        };
        
        const updatedCategories = updateProductCount(categories, preparedProductData.categoryId);
        setCategories(updatedCategories);
        
        toast.success("Product created successfully!");
        
        setTimeout(() => {
          handleProductSelect(newProduct);
        }, 100);
      } else {
        const newImages = productData.images.filter((img) => img instanceof File);
        const existingImages = productData.images.filter(
          (img) => typeof img === "string"
        );
        const productDataForApi = {
          ...productData,
          images: existingImages,
          categoryId: productData.categoryId,
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
        
        const response = await updateProductById(
          productData._id,
          productDataForApi,
          productData.imagesToRemove || [],
          newImages
        );
        
        const updatedProduct = formatProduct(response.data);
        
        const updatedProducts = products.map(product =>
          product._id === productData._id
            ? updatedProduct
            : product
        );
        setProducts(updatedProducts);
        
        toast.success("Product updated successfully!");
        
        if (selectedProduct?._id === productData._id) {
          setSelectedProduct(updatedProduct);
        }
      }
      
      setShowProductModal(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Failed to ${productModalData.mode} product`);
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      const updatedProducts = products.filter(product => product._id !== productId);
      setProducts(updatedProducts);
      
      toast.success("Product deleted successfully!");
      setShowDeleteModal(false);
      
      if (selectedProduct?._id === productId) {
        setSelectedProduct(null);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete product");
    }
  };

  const handleToggleProductStatus = async (productId, currentStatus) => {
    try {
      const response = await toggleProductStatus(productId);
      const product = response.data;
      const formattedData = formatProduct(product);
      setProducts((prevProducts) =>
        prevProducts.map((p) => (p._id === product._id ? formattedData : p))
      );
      if (selectedProduct?._id === product._id) {
        setSelectedProduct(formattedData);
      }
      if (product.active) {
        toast.success("✅ Product is now available");
      } else {
        toast.info("🚫 Product is now unavailable");
      }
    } catch (error) {
      console.error("Error toggling product status:", error);
      toast.error("Failed to update product status");
    }
  };

  const handleArchiveProduct = async (productId, shouldArchive) => {
    try {
      if (shouldArchive) {
        await archiveProduct(productId);
        toast.success("📁 Product has been archived!");
      } else {
        await unarchiveProduct(productId);
        toast.success("🔄 Product has been unarchived!");
      }
      
      if (selectedCategory?._id) {
        await fetchProductsForCategory(selectedCategory._id);
      }
    } catch (error) {
      console.error('Failed to archive product:', error);
      toast.error('❌ Failed to update product archive status');
    }
  };

  const getCategoryLevel = (parentId) => {
    if (!parentId) return 0;
    const parentCategory = findCategoryById(categories, parentId);
    return parentCategory ? (parentCategory.level || 0) + 1 : 0;
  };

  const totalCategories = countTotalCategories(categories);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 p-3">
      {/* Header */}
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
                {/* <p className="text-sm text-gray-600">
                  {totalCategories} total categories • {products.length} products
                </p> */}

                <p className="text-sm text-gray-600">
                  {categories.length} main categories • {mainProducts.length} main products
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchCategories();
                  if (selectedCategory) {
                    fetchProductsForCategory(selectedCategory._id);
                  }
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

      {/* Main Content - Columns */}
      {/* Main Content - Columns */}
{/* Main Content - Columns */}
<div className="flex gap-4 overflow-x-auto pb-4">
  {/* Always show Main Categories column */}
  {renderCategoryColumn(0)}
  
  {/* Show columns for each level in the navigation path */}
  {navigationPath.map((category, index) => (
    
    <div key={category._id} className="flex-none w-80 bg-white rounded-2xl shadow-lg border border-pink-100 h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">
      <div className="p-4 border-b border-pink-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-pink-500" />
            {category.name}
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {(category.children?.length || 0) + products.filter(p => p.categoryId === category._id).length}
            </span>
          </h3>
          <button
            onClick={() => handleCreateProduct(category._id)}
            className="p-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search in this category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
          />
        </div>
      </div>
      
      <div className="p-3 overflow-y-auto h-[calc(100%-120px)]">
        {category.children && category.children.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Subcategories ({category.children.length})</h4>
            <div className="space-y-2">
              {/* {category.children.map((subcategory) => (
                <div
                  key={subcategory._id}
                  onClick={() => handleCategorySelect(subcategory)}
                  className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-gray-100">
                        <Folder className="h-4 w-4 text-pink-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{subcategory.name}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span className={`px-1.5 py-0.5 rounded ${subcategory.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                            {subcategory.active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {subcategory.productCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))} */}

              {category.children.map((subcategory) => (
                <div
                  key={subcategory._id}
                  onClick={() => handleCategorySelect(subcategory)}
                  className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Folder icon with image badge - SAME AS MAIN CATEGORY */}
                      <div className="relative group">
                        {/* Main folder icon */}
                        <div className="p-1.5 rounded bg-gray-100">
                          <Folder className="h-4 w-4 text-pink-500" />
                        </div>
                        
                        {/* Image badges in corners - show up to 2 images */}
                        {subcategory.images && subcategory.images.length > 0 && (
                          <>
                            {/* First image badge - top right */}
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full overflow-hidden border-2 border-white bg-white shadow-sm">
                              <img 
                                src={subcategory.images[0]} 
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* Second image badge - bottom left (if exists) */}
                            {subcategory.images.length > 1 && (
                              <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full overflow-hidden border-2 border-white bg-white shadow-sm">
                                <img 
                                  src={subcategory.images[1]} 
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            {/* More images indicator (if > 2) */}
                            {subcategory.images.length > 2 && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white text-white text-[8px] flex items-center justify-center shadow-sm">
                                +{subcategory.images.length - 2}
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* Image preview on hover */}
                        {subcategory.images && subcategory.images.length > 0 && (
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-64">
                              <div className="grid grid-cols-3 gap-2 mb-2">
                                {subcategory.images.slice(0, 6).map((img, index) => (
                                  <div key={index} className="aspect-square overflow-hidden rounded-md">
                                    <img 
                                      src={img} 
                                      alt={`${subcategory.name} ${index + 1}`}
                                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                                    />
                                  </div>
                                ))}
                              </div>
                              {subcategory.images.length > 6 && (
                                <p className="text-xs text-gray-500 text-center">
                                  +{subcategory.images.length - 6} more images
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800">{subcategory.name}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span className={`px-1.5 py-0.5 rounded ${subcategory.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                            {subcategory.active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {subcategory.productCount || 0}
                          </span>
                          {/* Image count badge with SVG icon */}
                          {subcategory.images && subcategory.images.length > 0 && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">
                              <svg className="h-3 w-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                              {subcategory.images.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Show products for this category */}
        {/* {(() => {
          const categoryProducts = products.filter(p => p.categoryId === category._id);
          const filteredProducts = categoryProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          return filteredProducts.length > 0 ? (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Products</h4>
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductSelect(product)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedProduct?._id === product._id
                        ? "bg-blue-50 border border-blue-300"
                        : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded ${selectedProduct?._id === product._id ? 'bg-blue-200' : 'bg-gray-100'}`}>
                          <Package className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            ${product.price} • {product.unit}
                            <span className={`ml-2 px-1.5 py-0.5 rounded ${product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                              {product.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {product.archived && (
                          <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full">
                            Archived
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setDropdownPosition({
                              top: rect.bottom + window.scrollY,
                              left: rect.left
                            });
                            setProductDropdown(product._id);
                            setCategoryDropdown(null);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()} */}

        {/* Show products for this category */}
{(() => {
  const categoryProducts = products.filter(p => p.categoryId === category._id);
  const filteredProducts = categoryProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return filteredProducts.length > 0 ? (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Products</h4>
      <div className="space-y-2">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            onClick={() => handleProductSelect(product)}
            className={`p-3 rounded-lg cursor-pointer transition-all ${
              selectedProduct?._id === product._id
                ? "bg-blue-50 border border-blue-300"
                : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* PRODUCT IMAGE - Multiple images stacked */}
                <div className="relative">
                  {product.images && product.images.length > 0 ? (
                    <>
                      {/* First image (main) */}
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200 relative z-10"
                        onError={(e) => {
                          // Fallback to package icon
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          parent.innerHTML = `
                            <div class="p-1.5 rounded ${selectedProduct?._id === product._id ? 'bg-blue-200' : 'bg-gray-100'}">
                              <svg class="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                              </svg>
                            </div>
                          `;
                        }}
                      />
                      
                      {/* Second image (slightly offset behind) */}
                      {product.images.length > 1 && (
                        <img 
                          src={product.images[1]} 
                          alt={product.name}
                          className="absolute top-0 left-0 w-10 h-10 rounded-lg object-cover border border-gray-200 transform -translate-x-1 -translate-y-1 opacity-80 z-0"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      
                      {/* Third image (slightly offset behind) */}
                      {product.images.length > 2 && (
                        <img 
                          src={product.images[2]} 
                          alt={product.name}
                          className="absolute top-0 left-0 w-10 h-10 rounded-lg object-cover border border-gray-200 transform translate-x-1 translate-y-1 opacity-60 z-0"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                    </>
                  ) : (
                    <div className={`p-1.5 rounded ${selectedProduct?._id === product._id ? 'bg-blue-200' : 'bg-gray-100'}`}>
                      <Package className="h-4 w-4 text-blue-500" />
                    </div>
                  )}
                  
                  {/* Hover preview for all images */}
                  {product.images && product.images.length > 0 && (
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-20 w-48">
                      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3">
                        <div className="grid grid-cols-3 gap-2">
                          {product.images.slice(0, 9).map((img, index) => (
                            <div key={index} className="aspect-square overflow-hidden rounded-md">
                              <img 
                                src={img} 
                                alt={`${product.name} ${index + 1}`}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                              />
                            </div>
                          ))}
                        </div>
                        {product.images.length > 9 && (
                          <p className="text-xs text-gray-500 text-center mt-2">
                            +{product.images.length - 9} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="font-medium text-gray-800 text-sm">{product.name}</div>
                  <div className="text-xs text-gray-500">
                    ₹{product.price} • {product.unit}
                    <span className={`ml-2 px-1.5 py-0.5 rounded ${product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {product.archived && (
                  <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full">
                    Archived
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDropdownPosition({
                      top: rect.bottom + window.scrollY,
                      left: rect.left
                    });
                    setProductDropdown(product._id);
                    setCategoryDropdown(null);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null;
})()}
        
        {/* Add buttons */}
        <div className="space-y-2 mt-4">
          <button
            onClick={() => handleCreateSubCategory(category._id)}
            className="w-full p-2.5 border border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2 text-sm"
          >
            <Layers className="h-3 w-3" />
            Add Subcategory
          </button>
          <button
            onClick={() => handleCreateProduct(category._id)}
            className="w-full p-2.5 border border-dashed border-pink-300 rounded-lg text-pink-600 hover:bg-pink-50 flex items-center justify-center gap-2 text-sm"
          >
            <Package className="h-3 w-3" />
            Add Product Here
          </button>
        </div>
      </div>
    </div>
  ))}
  
  {/* Show details column if something is selected */}
  {renderDetailsColumn()}
  
  {/* Empty state */}
  {!selectedCategory && !selectedProduct && categories.length === 0 && (
    <div className="flex-none w-80 bg-white rounded-2xl shadow-lg border border-pink-100 h-[calc(100vh-280px)] flex items-center justify-center">
      <div className="text-center p-6">
        <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Categories Yet
        </h3>
        <p className="text-gray-500 mb-4">
          Create your first category to get started
        </p>
        <button
          onClick={handleCreateMainCategory}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          Create First Category
        </button>
      </div>
    </div>
  )}
</div>

      {/* Category Dropdown */}
      {categoryDropdown && (
        <div
          ref={categoryDropdownRef}
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
          ref={productDropdownRef}
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

      {/* Modals */}
      {showCategoryModal && (
        <CreateCategoryModal
          onClose={() => setShowCategoryModal(false)}
          onSuccess={handleCategorySubmit}
          restaurantId={id}
          isEditMode={categoryModalData.mode === "edit"}
          initialData={categoryModalData.data}
          loading={loading.actions}
          isMainCategory={categoryModalData.parentId === null}
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
          categoryName={productModalData.data?.categoryName || "Store Products"}
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

// Helper components (keep the same as before)
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
          <span className="text-sm text-gray-500">Level: {level || 0}</span>
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
       
        {(level || 0) < 3 && (
          <button
            onClick={onAddSubCategory}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
          >
            <Layers className="h-4 w-4" />
            Add Subcategory
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

const ProductDetails = ({ product, onEdit, onDelete, onToggleStatus, onArchive }) => (
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