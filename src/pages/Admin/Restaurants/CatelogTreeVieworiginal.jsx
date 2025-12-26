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
  Layers
} from "lucide-react";
import { toast } from "react-toastify";

// Components
import TreeView from "./TreeView";
import CreateCategoryModal from "../../../components/catelog/CreateCategoryModal";
import AddSubcategoryModal from "../../../components/catelog/AddSubcategoryModal"; // New component
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
  // For tree view
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

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false); // New modal
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

  const [showNestedModal, setShowNestedModal] = useState(false);
  const [nestedFormData, setNestedFormData] = useState({ 
    categories: [{ name: '', description: '' }],  // Array for chain levels (e.g., [Main, Sub1, Sub2])
    initialParentId: null  // Optional: null for new main, or existing _id for under selected
  });

  // ====== FETCH DATA FROM BACKEND ======

  // Fetch store data
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

  // Fetch categories from backend and convert to tree structure
  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      const categoriesData = await fetchRestaurantCategories(id);
      
      // Format categories
      const formattedCategories = categoriesData.map(formatCategory);
      
      // Build tree structure from flat array
      const categoryTree = buildCategoryTree(formattedCategories);
      setCategories(categoryTree);
      
      // Select first category by default if nothing is selected
      if (categoryTree.length > 0 && !selectedNode.id) {
        handleCategorySelect(categoryTree[0], [categoryTree[0]._id]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  // Build tree structure from flat array
  const buildCategoryTree = (categories, parentId = null) => {
    return categories
      .filter(category => category.parentId === parentId)
      .map(category => ({
        ...category,
        children: buildCategoryTree(categories, category._id),
        level: parentId === null ? 0 : (findCategoryById(categories, parentId)?.level || 0) + 1
      }));
  };

  // Fetch products for selected category
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

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchStoreData();
      await fetchCategories();
    };
    
    fetchInitialData();
  }, [id]);

  // Fetch products when category is selected
  useEffect(() => {
    if (selectedNode.type === "category" && selectedNode.id) {
      fetchProductsForCategory(selectedNode.id);
    }
  }, [selectedNode.id]);

  // ====== TREE STRUCTURE HELPER FUNCTIONS ======

  // Find category by ID (recursive)
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

  // Find category path (recursive)
  const findCategoryPath = (categories, categoryId, path = []) => {
    for (const category of categories) {
      if (category._id === categoryId) {
        return [...path, category._id];
      }
      if (category.children && category.children.length > 0) {
        const found = findCategoryPath(category.children, categoryId, [...path, category._id]);
        if (found) return found;
      }
    }
    return null;
  };

  // Add category to tree (recursive)
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

  // Update category in tree (recursive)
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

  // Get category level (depth)
  const getCategoryLevel = (parentId) => {
    if (!parentId) return 0;
    const parentCategory = findCategoryById(categories, parentId);
    return parentCategory ? (parentCategory.level || 0) + 1 : 0;
  };

  // Count total categories (recursive)
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

  // ====== EVENT HANDLERS ======

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Handle category selection
  const handleCategorySelect = (category, path = []) => {
    setSelectedNode({
      type: "category",
      id: category._id,
      data: category,
      path: path
    });
  };

  // Handle product selection
  const handleProductSelect = (product) => {
    const categoryPath = findCategoryPath(categories, product.categoryId) || [];
    
    setSelectedNode({
      type: "product",
      id: product._id,
      data: product,
      path: categoryPath
    });
  };

  // ====== CATEGORY HANDLERS ======

  // Handle create MAIN category
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

  // Handle create SUB category
  // const handleCreateSubCategory = (parentId) => {
  //   const parentCategory = findCategoryById(categories, parentId);
  //   setSubcategoryModalData({
  //     mode: "create",
  //     data: { 
  //       restaurantId: id,
  //       parentId: parentId,
  //       active: true,
  //       archived: false,
  //       availability: "always"
  //     },
  //     parentId: parentId,
  //     parentName: parentCategory?.name || "Parent Category"
  //   });
  //   setShowSubcategoryModal(true);
  // };

  // Handle create SUB category (now supports chaining for nesting)
  const handleCreateSubCategory = (parentId, depth = 1) => {
    if (depth > 3) {  // Safety limit
      toast.info("Max nesting depth reached (3 levels).");
      return;
    }

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
      parentName: parentCategory?.name || "Parent Category",
      depth: depth  // Pass depth for chaining
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

  // Handle MAIN category submit
  const handleCategorySubmit = async (categoryData) => {
    try {
      setLoading(prev => ({ ...prev, actions: true }));
      
      if (categoryModalData.mode === "create") {
        // Prepare data for backend - MAIN CATEGORY (no parentId)
        const categoryToCreate = {
          ...categoryData,
          restaurantId: id,
          parentId: null // Main categories have no parent
        };
        
        // Call backend API
        const response = await createCategory(categoryToCreate);
        const newCategory = formatCategory(response.data);
        
        // Add to tree structure (level 0, no parent)
        const updatedCategories = addCategoryToTree(
          categories, 
          { 
            ...newCategory, 
            children: [],
            level: 0,
            parentId: null
          }, 
          null
        );
        setCategories(updatedCategories);
        
        toast.success("Main category created successfully!");
        
        // Select the new category
        setTimeout(() => {
          handleCategorySelect(newCategory, [newCategory._id]);
        }, 100);
      } else {
        // Edit existing category
        const editedCategory = {
          ...categoryData,
          _id: categoryData._id
        };
        
        // Extract data for the API call
        const {
          imageFiles = [],
          imagesToRemove = [],
          _id,
          ...categoryDataForApi
        } = editedCategory;

        // Prepare the data for API call
        const apiData = {
          name: categoryDataForApi.name,
          description: categoryDataForApi.description,
          availability: categoryDataForApi.availability,
          restaurantId: categoryDataForApi.restaurantId,
          active: categoryDataForApi.active === 'true' ? 'true' : String(Boolean(categoryDataForApi.active)),
          autoOnOff: categoryDataForApi.autoOnOff || 'false',
          availableAfterTime: categoryDataForApi.availableAfterTime,
          availableFromTime: categoryDataForApi.availableFromTime,
          availableToTime: categoryDataForApi.availableToTime
        };

        // Call backend API
        const response = await updateCategory(
          _id,
          apiData,
          imagesToRemove,
          imageFiles
        );
        
        const updatedCategory = formatCategory(response.data);
        
        // Update tree structure
        const updatedCategories = updateCategoryInTree(categories, updatedCategory);
        setCategories(updatedCategories);
        
        // Update selected node if it's the same category
        if (selectedNode.id === updatedCategory._id) {
          setSelectedNode(prev => ({
            ...prev,
            data: updatedCategory
          }));
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

  // Handle SUB category submit
  // const handleSubcategorySubmit = async (categoryData) => {
  //   try {
  //     setLoading(prev => ({ ...prev, actions: true }));
      
  //     // Prepare data for backend - SUB CATEGORY (with parentId)
  //     const categoryToCreate = {
  //       ...categoryData,
  //       restaurantId: id,
  //       parentId: subcategoryModalData.parentId
  //     };
      
  //     // Call backend API
  //     const response = await createCategory(categoryToCreate);
  //     const newCategory = formatCategory(response.data);
      
  //     // Add to tree structure under parent
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
      
  //     toast.success("Subcategory created successfully!");
      
  //     // Auto-expand parent category
  //     setExpandedCategories(prev => ({
  //       ...prev,
  //       [subcategoryModalData.parentId]: true
  //     }));
      
  //     // Select the new subcategory
  //     setTimeout(() => {
  //       const path = [...(findCategoryPath(updatedCategories, subcategoryModalData.parentId) || []), newCategory._id];
  //       handleCategorySelect(newCategory, path.filter(Boolean));
  //     }, 100);
      
  //     setShowSubcategoryModal(false);
  //   } catch (error) {
  //     console.error("Error:", error);
  //     toast.error("Failed to create subcategory");
  //   } finally {
  //     setLoading(prev => ({ ...prev, actions: false }));
  //   }
  // };

  // Handle SUB category submit (now chains on confirm)
//   const handleSubcategorySubmit = async (modalFormData) => {
//   console.log("🎯 Modal submitted with:", modalFormData);
  
//   try {
//     setLoading(prev => ({ ...prev, actions: true }));
    
//     // Extract only the data we need from modal
//     const { name, description, active, availability, availableAfterTime, availableFromTime, availableToTime, images } = modalFormData;
    
//     // Validate name
//     if (!name || name.trim() === '') {
//       toast.error("Category name is required!");
//       return;
//     }
    
//     // Prepare data in the EXACT format backend expects
//     const nestedData = {
//       levels: [{
//         name: name.trim(), // REQUIRED
//         description: description || '',
//         availability: availability || 'always',
//         active: active !== undefined ? active : true,
//         images: images || [] // Images array from modal
//         // Note: The backend might not handle availableAfterTime, availableFromTime, availableToTime
//         // So we're not sending them unless backend expects them
//       }],
//       initialParentId: subcategoryModalData.parentId || null
//     };
    
//     console.log("📤 Sending to backend:", nestedData);
//     console.log("📤 Restaurant ID:", id);
//     console.log("📤 Parent ID:", subcategoryModalData.parentId);
    
//     // Call the API
//     const response = await createNestedCategories(id, nestedData);
    
//     console.log("📥 API Response:", response);
    
//     // The backend returns { success, message, count, data }
//     if (!response.success) {
//       throw new Error(response.message || "Failed to create category");
//     }
    
//     // response.data is an array of created categories
//     if (!response.data || response.data.length === 0) {
//       throw new Error("No category was created");
//     }
    
//     // Take the first created category
//     const newCategory = formatCategory(response.data[0]);
//     console.log("✅ Formatted category:", newCategory);
    
//     // Add to tree structure under parent
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
    
//     // Auto-expand parent category
//     setExpandedCategories(prev => ({
//       ...prev,
//       [subcategoryModalData.parentId]: true
//     }));
    
//     // Select the new subcategory
//     setTimeout(() => {
//       const path = [...(findCategoryPath(updatedCategories, subcategoryModalData.parentId) || []), newCategory._id];
//       handleCategorySelect(newCategory, path.filter(Boolean));
//     }, 100);
    
//     // Chain nesting? Confirm to add under this new one
//     if (subcategoryModalData.depth < 3) {  // Only if not max depth
//       toast(
//         <div>
//           <p>Want to add another subcategory under "{newCategory.name}"?</p>
//           <div className="flex gap-2 mt-2 justify-center">
//             <button
//               className="px-3 py-1 bg-green-500 text-white rounded text-sm"
//               onClick={() => {
//                 toast.dismiss();  // Close this toast
//                 handleCreateSubCategory(newCategory._id, (subcategoryModalData.depth || 1) + 1);  // Chain next level
//               }}
//             >
//               Yes, Add Nested
//             </button>
//             <button
//               className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
//               onClick={() => toast.dismiss()}
//             >
//               No, Done
//             </button>
//           </div>
//         </div>,
//         {
//           type: "info",
//           autoClose: false,
//           closeOnClick: false,
//           position: "top-center"
//         }
//       );
//     }
    
//     setShowSubcategoryModal(false);
//   } catch (error) {
//     console.error("❌ Error creating subcategory:", error);
//     console.error("❌ Error details:", error.response?.data);
//     toast.error(error.response?.data?.message || error.message || "Failed to create subcategory");
//   } finally {
//     setLoading(prev => ({ ...prev, actions: false }));
//   }
// };

const handleSubcategorySubmit = async (modalFormData) => {
  console.log("🎯 handleSubcategorySubmit called");
  console.log("📝 Modal Form Data:", modalFormData);
  console.log("🏪 Restaurant ID:", id);
  console.log("📦 Parent ID:", subcategoryModalData.parentId);
  
  try {
    setLoading(prev => ({ ...prev, actions: true }));
    
    // Validate required fields
    if (!modalFormData.name || modalFormData.name.trim() === '') {
      toast.error("Category name is required!");
      setLoading(prev => ({ ...prev, actions: false }));
      return;
    }
    
    if (!id) {
      toast.error("Restaurant ID is missing!");
      setLoading(prev => ({ ...prev, actions: false }));
      return;
    }
    
    // Create the CORRECT payload structure
    const payload = {
      levels: [
        {
          name: modalFormData.name.trim(),
          description: modalFormData.description || '',
          availability: modalFormData.availability || 'always',
          active: modalFormData.active !== undefined ? modalFormData.active : true,
          images: modalFormData.images || [],
          // Add time fields if they exist
          ...(modalFormData.availableAfterTime && { availableAfterTime: modalFormData.availableAfterTime }),
          ...(modalFormData.availableFromTime && { availableFromTime: modalFormData.availableFromTime }),
          ...(modalFormData.availableToTime && { availableToTime: modalFormData.availableToTime })
        }
      ],
      initialParentId: subcategoryModalData.parentId || null
    };
    
    console.log("📤 Sending to API:", JSON.stringify(payload, null, 2));
    console.log("🔍 Checking payload structure:");
    console.log("- Has levels array?", Array.isArray(payload.levels));
    console.log("- Levels length:", payload.levels.length);
    console.log("- First item name:", payload.levels[0]?.name);
    console.log("- initialParentId:", payload.initialParentId);
    
    // Call the API
    const response = await createNestedCategories(id, payload);
    
    console.log("📥 API Response:", response);
    
    // Check if response is successful
    if (!response || !response.success) {
      throw new Error(response?.message || "Failed to create category");
    }
    
    // Check if data exists
    if (!response.data || response.data.length === 0) {
      throw new Error("No category was created");
    }
    
    // Format the new category
    const newCategory = formatCategory(response.data[0]);
    console.log("✅ Formatted new category:", newCategory);
    
    // Add to tree structure
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
    
    // Auto-expand parent category
    setExpandedCategories(prev => ({
      ...prev,
      [subcategoryModalData.parentId]: true
    }));
    
    // Select the new subcategory
    setTimeout(() => {
      const path = [...(findCategoryPath(updatedCategories, subcategoryModalData.parentId) || []), newCategory._id];
      handleCategorySelect(newCategory, path.filter(Boolean));
    }, 100);
    
    // Chain nesting option
    if (subcategoryModalData.depth < 3) {
      toast(
        <div>
          <p>Want to add another subcategory under "{newCategory.name}"?</p>
          <div className="flex gap-2 mt-2 justify-center">
            <button
              className="px-3 py-1 bg-green-500 text-white rounded text-sm"
              onClick={() => {
                toast.dismiss();
                handleCreateSubCategory(newCategory._id, (subcategoryModalData.depth || 1) + 1);
              }}
            >
              Yes, Add Nested
            </button>
            <button
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
              onClick={() => toast.dismiss()}
            >
              No, Done
            </button>
          </div>
        </div>,
        {
          type: "info",
          autoClose: false,
          closeOnClick: false,
          position: "top-center"
        }
      );
    }
    
    setShowSubcategoryModal(false);
    
  } catch (error) {
    console.error("❌ Error creating subcategory:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error message:", error.message);
    
    // Show specific error messages
    if (error.message.includes("levels array is required")) {
      toast.error("Please fill in the category name");
    } else if (error.message.includes("Restaurant ID")) {
      toast.error("Restaurant ID error. Please refresh the page.");
    } else {
      toast.error(error.response?.data?.message || error.message || "Failed to create subcategory");
    }
  } finally {
    setLoading(prev => ({ ...prev, actions: false }));
  }
};

  // Delete category
  const handleDeleteCategory = async (categoryId) => {
    try {
      // Call backend API
      await deleteCategory(categoryId);
      
      // Remove from tree
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
      if (selectedNode.id === categoryId) {
        setSelectedNode({ type: null, id: null, data: null, path: [] });
      }
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  // Toggle category status
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

  
  const handleAddProductFromTree = (categoryId, categoryName) => {
    // Open product creation modal with this category
    setProductModalData({
      mode: "create",
      data: {
        categoryId: categoryId, // CRITICAL: Pass category ID
        restaurantId: id,
        categoryName: categoryName
      }
    });
    setShowProductModal(true);
  };

  // Archive category
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

  const handleCreateProduct = (categoryId) => {
    const category = findCategoryById(categories, categoryId);
    setProductModalData({
      mode: "create",
      data: { 
        categoryId,
        restaurantId: id,
        categoryName: category?.name
      }
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setProductModalData({
      mode: "edit",
      data: product
    });
    setShowProductModal(true);
  };

  // Handle product submit
  const handleProductSubmit = async (productData) => {
    try {
      setLoading(prev => ({ ...prev, actions: true }));
      
      if (productModalData.mode === "create") {
        // Use your original handleProductCreate logic
        const newImages = productData.images.filter((img) => img instanceof File);
        const existingImages = productData.images.filter(
          (img) => typeof img === "string"
        );

        const preparedProductData = {
          ...productData,
          images: existingImages,
          categoryId: productData.categoryId || selectedNode.id,
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

        // Call backend API
        // const response = await createProduct(preparedProductData, id, selectedNode.id);
        const response = await createProduct(preparedProductData, id, preparedProductData.categoryId);
        const newProduct = formatProduct(response.data);
        
        // Update local state
        setProducts(prev => [...prev, newProduct]);
        
        // Update product count in category
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
        
        // const updatedCategories = updateProductCount(categories, selectedNode.id);

        const updatedCategories = updateProductCount(categories, preparedProductData.categoryId);
        setCategories(updatedCategories);
        
        toast.success("Product created successfully!");
        
        // Select the new product
        setTimeout(() => {
          handleProductSelect(newProduct);
        }, 100);
      } else {
        // Edit existing product
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

        // Call backend API
        const response = await updateProductById(
          productData._id,
          productDataForApi,
          productData.imagesToRemove || [],
          newImages
        );
        
        const updatedProduct = formatProduct(response.data);
        
        // Update local state
        const updatedProducts = products.map(product => 
          product._id === productData._id 
            ? updatedProduct
            : product
        );
        setProducts(updatedProducts);
        
        toast.success("Product updated successfully!");
        
        // Update selected product data
        if (selectedNode.id === productData._id) {
          setSelectedNode(prev => ({
            ...prev,
            data: updatedProduct
          }));
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

  // Delete product
  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      const updatedProducts = products.filter(product => product._id !== productId);
      setProducts(updatedProducts);
      
      toast.success("Product deleted successfully!");
      setShowDeleteModal(false);
      
      if (selectedNode.id === productId) {
        setSelectedNode({ type: null, id: null, data: null, path: [] });
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete product");
    }
  };

  // Toggle product status
  const handleToggleProductStatus = async (productId, currentStatus) => {
    try {
      const response = await toggleProductStatus(productId);
      const product = response.data;
      const formattedData = formatProduct(product);

      setProducts((prevProducts) =>
        prevProducts.map((p) => (p._id === product._id ? formattedData : p))
      );

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

  // Archive product
  const handleArchiveProduct = async (productId, shouldArchive) => {
    try {
      if (shouldArchive) {
        await archiveProduct(productId);
        toast.success("📁 Product has been archived!");
      } else {
        await unarchiveProduct(productId);
        toast.success("🔄 Product has been unarchived!");
      }
      
      if (selectedNode.type === "category" && selectedNode.id) {
        await fetchProductsForCategory(selectedNode.id);
      }
    } catch (error) {
      console.error('Failed to archive product:', error);
      toast.error('❌ Failed to update product archive status');
    }
  };

  // ====== UI RENDER ======

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedNode.type === "category" && 
                           product.categoryId === selectedNode.id;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get category breadcrumb
  const getCategoryBreadcrumb = (categoryId) => {
    const path = findCategoryPath(categories, categoryId) || [];
    return path.map(catId => findCategoryById(categories, catId)).filter(Boolean);
  };

  // Count total categories
  const totalCategories = countTotalCategories(categories);

  // UI helper functions
  const getStatusColor = (status) => {
    return status === "Active" || status === true
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  const getFoodTypeColor = (foodType) => {
    return foodType === "veg"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-orange-100 text-orange-800 border-orange-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 p-6">
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
                <p className="text-sm text-gray-600">
                  {totalCategories} total categories • {products.length} products
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchCategories();
                  if (selectedNode.type === "category" && selectedNode.id) {
                    fetchProductsForCategory(selectedNode.id);
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

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Category Tree */}
        <div className="col-span-4">
          <div className="bg-white rounded-2xl shadow-lg border border-pink-100 h-full overflow-hidden">
            <div className="p-6 border-b border-pink-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Folder className="h-5 w-5 text-pink-500" />
                  Category Tree 
                  <span className="text-sm text-gray-500 bg-pink-100 px-2 py-1 rounded-full">
                    {totalCategories} total
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCreateMainCategory}
                    className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                    title="Add Main Category"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
              {loading.categories ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12">
                  <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Categories Yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start by creating your first category
                  </p>
                  <button
                    onClick={handleCreateMainCategory}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                  >
                    Create First Category
                  </button>
                </div>
              ) : (
                <TreeView
                  categories={categories}
                  expandedCategories={expandedCategories}
                  onToggleExpansion={toggleCategoryExpansion}
                  onCategorySelect={handleCategorySelect}
                  onAddSubCategory={handleCreateSubCategory}
                  onAddProduct={handleAddProductFromTree}
                  selectedId={selectedNode.type === "category" ? selectedNode.id : null}
                  level={0}
                />
              )}
            </div>
          </div>
        </div>

        {/* Middle Panel - Products */}
        <div className="col-span-3">
          <div className="bg-white rounded-2xl shadow-lg border border-pink-100 h-full overflow-hidden">
            <div className="p-6 border-b border-pink-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Package className="h-5 w-5 text-pink-500" />
                  Products
                  {selectedNode.type === "category" && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {filteredProducts.length}
                    </span>
                  )}
                </h2>
                {selectedNode.type === "category" && (
                  <button
                    onClick={() => handleCreateProduct(selectedNode.id)}
                    className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Search and Breadcrumb */}
              <div className="space-y-4">
                {selectedNode.type === "category" && selectedNode.path.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600 bg-pink-50 p-2 rounded-lg">
                    <span className="font-medium">Path: </span>
                    {getCategoryBreadcrumb(selectedNode.id).map((cat, index) => (
                      <React.Fragment key={cat._id}>
                        {index > 0 && <ChevronRight className="h-3 w-3 mx-1" />}
                        <span className="text-pink-600 font-medium">{cat.name}</span>
                        <span className="text-gray-400 ml-1">({cat.level})</span>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    disabled={selectedNode.type !== "category"}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
              {loading.products ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
                </div>
              ) : selectedNode.type !== "category" ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a category to view products</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No products found in this category</p>
                  <button
                    onClick={() => handleCreateProduct(selectedNode.id)}
                    className="mt-4 text-pink-600 hover:text-pink-700 font-medium"
                  >
                    + Add first product
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleProductSelect(product)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedNode.type === "product" && selectedNode.id === product._id
                          ? "bg-pink-50 border border-pink-200 shadow-sm"
                          : "bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-pink-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              product.active ? "bg-green-500" : "bg-gray-400"
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              ${product.price} • {product.unit}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {product.archived && (
                            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
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
                            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Details */}
        <div className="col-span-5">
          <div className="bg-white rounded-2xl shadow-lg border border-pink-100 h-full overflow-hidden">
            <div className="p-6 border-b border-pink-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                {selectedNode.type === "category" ? (
                  <FolderOpen className="h-5 w-5 text-pink-500" />
                ) : (
                  <Package className="h-5 w-5 text-pink-500" />
                )}
                {selectedNode.type === "category" ? "Category Details" : "Product Details"}
                {selectedNode.data && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedNode.data.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {selectedNode.data.active ? "Active" : "Inactive"}
                  </span>
                )}
              </h2>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(100vh-280px)]">
              {!selectedNode.data ? (
                <div className="text-center py-12">
                  <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a category or product to view details</p>
                </div>
              ) : selectedNode.type === "category" ? (
                <CategoryDetails
                  category={selectedNode.data}
                  onEdit={() => handleEditCategory(selectedNode.data)}
                  onDelete={() => {
                    setDeleteModalData({
                      type: "category",
                      id: selectedNode.id,
                      name: selectedNode.data.name
                    });
                    setShowDeleteModal(true);
                  }}
                  onToggleStatus={() => handleToggleCategoryStatus(
                    selectedNode.id,
                    selectedNode.data.active
                  )}
                  onArchive={() => handleArchiveCategory(
                    selectedNode.id,
                    !selectedNode.data.archived
                  )}
                  onAddProduct={() => handleCreateProduct(selectedNode.id)}
                  onAddSubCategory={() => handleCreateSubCategory(selectedNode.id)}
                  level={selectedNode.data.level || 0}
                />
              ) : (
                <ProductDetails
                  product={selectedNode.data}
                  onEdit={() => handleEditProduct(selectedNode.data)}
                  onDelete={() => {
                    setDeleteModalData({
                      type: "product",
                      id: selectedNode.id,
                      name: selectedNode.data.name
                    });
                    setShowDeleteModal(true);
                  }}
                  onToggleStatus={() => handleToggleProductStatus(
                    selectedNode.id,
                    selectedNode.data.active
                  )}
                  onArchive={() => handleArchiveProduct(
                    selectedNode.id,
                    !selectedNode.data.archived
                  )}
                  getStatusColor={getStatusColor}
                  getFoodTypeColor={getFoodTypeColor}
                />
              )}
            </div>
          </div>
        </div>
      </div>

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

      {/* Modals */}
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