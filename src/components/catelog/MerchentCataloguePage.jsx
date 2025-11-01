  import React, { useEffect, useState } from "react";
  import {
    Plus,
    RefreshCw,
    Clock,
    Package,
    Image,
    Activity,
    Search,
    Filter,
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    ChevronRight,
    AlertCircle,
    MoreVertical,ToggleRight,
    ToggleLeft
  } from "lucide-react";
  import { useParams } from "react-router-dom";

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
  } from "../../../../apis/storeApi";
  import CreateCategoryModal from "./CreateCategoryModal";
  import toast from "react-hot-toast";
  import AddProductPage from "./AddProductPage";
  import DeleteConfirmationModal from "./DeleteConfirmationModal";

  function MerchentCataloguePage({ restaurantId }) {
    const id = restaurantId;
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState({
      categories: false,
      products: false,
      store: false,
      actions: false,
    });
    const [error, setError] = useState({
      categories: null,
      products: null,
      store: null,
    });

    const [showModal, setShowModal] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isEditCategoryModalOpen,setIsEditCategoryModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
    const [editingCategory,setEditingCategory] = useState(null);
    
    
    const [deleteCategoryId, setDeleteCategoryId] = useState(null);
    const [deleteProductId, setDeleteProductId] = useState(null);
    const [deleteMode, setDeleteMode] = useState(""); // "category" | "product"
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showInactiveProducts, setShowInactiveProducts] = useState(false);
    const [openProductDropdown, setOpenProductDropdown] = useState(null);
    const [openCategoryDropdown, setOpenCategoryDropdown] = useState(null);
    const [showProdutDeleteModal,setShowProductDeleteModal]  = useState(false);
    // Format product data from backend to frontend structure
    const formatProduct = (product) => ({
      id: product._id,
      _id: product._id,
      categoryId: product.categoryId,
      name: product.name,
      price: product.price,
      foodType: product.foodType ,
      unit: product.unit,
      status: product.active ? "Active" : "Inactive",
      active: product.active,
      preparationTime: product.preparationTime,
      minOrderQty: product.minimumOrderQuantity,
      maxOrderQty: product.maximumOrderQuantity,
      availabilityTime: product.availableAfterTime || "--:--",
      availableAfterTime: product.availableAfterTime,
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

    // Format category data from backend to frontend structure
    const formatCategory = (category) => ({
      _id: category._id,
      name: category.name,
      productCount: category.productCount || 0,
      isActive: category.active,
      active: category.active,
      images:  category.images,
      description: category.description,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,

    
    });

    const handleCategoryCreate = async (newCategory) => {
      try {
        console.log("Creating category with data:", newCategory);
        const response = await createCategory(newCategory);
        setCategories((prevCategories) => [...prevCategories, response.data]);
        console.log("Category created successfully:", response);
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

    useEffect(() => {
      const fetchInitialData = async () => {
        try {
          setLoading((prev) => ({ ...prev, store: true, categories: true }));
          await getStoreById(id);
          const categoriesData = await fetchRestaurantCategories(id);
          const formattedCategories = categoriesData.map(formatCategory);
          setCategories(formattedCategories);

          if (formattedCategories.length > 0) {
            setSelectedCategory(formattedCategories[0]._id);
          }
        } catch (err) {
          console.error(err);
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

    const toggleProductDropdown = (productId, e) => {
      e.stopPropagation();
      setOpenProductDropdown(
        openProductDropdown === productId ? null : productId
      );
    };

    const toggleCategoryDropdown = (categoryId, e) => {
      e.stopPropagation();
      setOpenCategoryDropdown(openCategoryDropdown === categoryId ? null : categoryId);
      setOpenProductDropdown(null);
    };

    const handleProductCreate = async (productData) => {
      try {
        setLoading((prev) => ({ ...prev, products: true }));
        const response = await createProduct(
          productData,
          restaurantId,
          selectedCategory
        );
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
      console.log("Product before update:", product);

      // 1. Split images into existing (URLs) and new (Files)
      const newImages = product.images.filter((img) => img instanceof File);
      const existingImages = product.images.filter((img) => typeof img === "string");
      
      // 2. Call API with correct params
      const response = await updateProductById(
        product._id,
        { ...product, images: existingImages }, // keep only URLs in productData
        product.imagesToRemove || [],           // tell backend which to remove
        newImages                               // upload these
      );

      // 3. Format response
      const formattedData = formatProduct(response.data);

      // 4. Update UI state
      setProducts((prevProducts) =>
        prevProducts.map((p) => (p._id === product._id ? formattedData : p))
      );
        setLoading((prev) => ({ ...prev, products: false }));
      toast.success("Product updated successfully");
      setIsEditProductModalOpen(false);

    } catch (error) {
      setLoading((prev) => ({ ...prev, products: false }))
      console.error("Update failed:", error);
      toast.error("Failed to update product");
    }
  };


    const handleEdit = (categoryId, e) => {
      e.stopPropagation();
      // Implement category edit logic here
      console.log("Edit category:", categoryId);
      setOpenCategoryDropdown(null);
    };

    const toggleCategoryStatus = (categoryId, e) => {
      e.stopPropagation();
      // Implement category status toggle logic here
      console.log("Toggle category status:", categoryId);
      setOpenCategoryDropdown(null);
    };

    const handleViewDetails = (productId, e) => {
      e.stopPropagation();
      setSelectedProduct(productId);
      setOpenProductDropdown(null);
    };

    const handleDelete = async (productId, e) => {
      e.stopPropagation();
      setDeleteProductId(productId);
      setDeleteMode("product");
      setShowModal(true);
      setOpenProductDropdown(null);
    };

  const handleEditCategory = async (editedCategory) => {
    try {
      setLoading((prev) => ({ ...prev, actions: true }));
      
      console.log("Editing category with data:", editedCategory._id);
      
      // Extract data for the API call
      const { imageFiles = [], imagesToRemove = [], ...categoryData } = editedCategory;
      
      // Call the update API
      const response = await updateCategory(
        editedCategory._id, // Use the category ID
        editedCategory,       // Basic category data
  
      );

      // Format the response
      const formattedCategory = formatCategory(response.data);
      
      // Update the categories list
      setCategories((prev) => 
        prev.map((c) => c._id === editedCategory._id ? formattedCategory : c)
      );
      
      // If we're editing the currently selected category, update it too
      if (selectedCategory === editedCategory._id) {
        setSelectedCategory(editedCategory._id); // This will trigger a refresh
      }
      
      toast.success("Category updated successfully");
      setIsEditCategoryModalOpen(false);
      
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    } finally {
      setLoading((prev) => ({ ...prev, actions: false }));
    }
  };


  const handleProductDelete = async(productId) =>
  {

    try {
      

    setProducts((prev) => prev.filter((p) => p._id !== productId));
    await deleteProduct(productId,restaurantId);

    toast.success("Product deleted successfully");



    } catch (error) {
      console.log(error)
    }
  }

  const handleToggleProductActive = async(id) =>

    {

    try {
    

      const response =  await toggleProductStatus(id);
      // console.log(response)

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
      
    }
    }



    const HandleDeleteCategory = async (categoryId) => {
      try {

        console.log("Deleting category with ID:", categoryId);
        // Optimistically update UI
        const originalCategories = [...categories];
        const originalProducts = [...products];
        
        setCategories((prev) => prev.filter((c) => c._id !== categoryId));
        setProducts((prev) => prev.filter((p) => p.categoryId !== categoryId));

        await deleteCategory(categoryId);
        toast.success("Category deleted successfully");
      } catch (error) {
        console.error("Error deleting category:", error);
        // Rollback state if API fails
        setCategories(originalCategories);
        setProducts(originalProducts);
        toast.error("Failed to delete category");
      }
    };



    const filteredProducts = products.filter((product) => {
      const matchesCategory = product.categoryId === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = showInactiveProducts || product.status === "Active";
      return matchesCategory && matchesSearch && matchesStatus;
    });

    const currentProduct = products.find(
      (product) => product.id === selectedProduct
    );
    const selectedCategoryData = categories.find(
      (cat) => cat._id === selectedCategory
    );

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

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div>
          {isCategoryModalOpen && (
            <CreateCategoryModal
              restaurantId={id}
              onSuccess={handleCategoryCreate}
              onClose={() => setIsCategoryModalOpen(false)}
            />
          )}
        </div>

        <div>
          {isEditCategoryModalOpen && (
            <CreateCategoryModal
              restaurantId={id}
              onSuccess={handleEditCategory}
              onClose={() => setIsEditCategoryModalOpen(false)}
              initialData={editingCategory}
              isEditMode={true}
            />
          )}
        </div>


          <div>
          {isEditProductModalOpen && (
            <AddProductPage
              onAddProduct={handleEditProduct}
              onClose={() => setIsEditProductModalOpen(false)}
              initialData={editingProduct}
              isEditMode={true}
              loading={loading.products}
            />
          )}
        </div>

        <div>
          {isProductModalOpen && (
            <AddProductPage
              onAddProduct={handleProductCreate}
              onClose={() => setIsProductModalOpen(false)}
              loading={loading.products}
            />
          )}
        </div>


        <DeleteConfirmationModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onConfirm={() => {HandleDeleteCategory(deleteCategoryId)}}
            title="Delete Product"
            itemName="Onion Rings"
            message="This product will be permanently removed from your menu and cannot be recovered."
          />





        <DeleteConfirmationModal
            isOpen={showProdutDeleteModal}
            onClose={() => setShowProductDeleteModal(false)}
            onConfirm={() => {handleProductDelete(deleteProductId)}}
            title="Delete Product"
            itemName="Onion Rings"
            message="This product will be permanently removed from your menu and cannot be recovered."
          />

        <div className="w-full mx-auto p-4 sm:p-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                🏬 Restaurant Menu Manager
              </h1>
              <p className="text-blue-100 mt-1">
                Manage your restaurant categories and products
              </p>
            </div>

            <div className="p-6">
              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showInactiveProducts}
                      onChange={(e) => setShowInactiveProducts(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {showInactiveProducts ? (
                      <Eye size={16} />
                    ) : (
                      <EyeOff size={16} />
                    )}
                    Show Inactive
                  </label>
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm font-medium"
                    onClick={() => {
                      if (selectedCategory) {
                        const fetchProducts = async () => {
                          try {
                            setLoading((prev) => ({ ...prev, products: true }));
                            const productsData = await fetchCategoryProducts(
                              id,
                              selectedCategory
                            );
                            const formattedProducts =
                              productsData.map(formatProduct);
                            setProducts(formattedProducts);
                          } catch (err) {
                            toast.error("Failed to refresh products");
                          } finally {
                            setLoading((prev) => ({ ...prev, products: false }));
                          }
                        };
                        fetchProducts();
                      }
                    }}
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[700px]">
                {/* Categories Column */}
                <div className="xl:col-span-3">
                  <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-5 h-full border border-gray-200">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Filter size={18} className="text-blue-600" />
                        Categories
                      </h2>
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                        {categories.length}
                      </span>
                    </div>
  <div className="space-y-3 mb-5">

 
    {categories.map((category) => (
      <div
        key={category._id}
        onClick={() => setSelectedCategory(category._id)}
        className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
          selectedCategory === category._id
            ? "bg-blue-50 border-blue-300 shadow-md transform scale-[1.02]"
            : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm"
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                category.isActive
                  ? "bg-green-400"
                  : "bg-gray-400"
              }`}
            />
            <span className="font-semibold text-gray-800">
              {category.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {category.productCount}
            </span>

            <div className="relative">
              <button 
                onClick={(e) => toggleCategoryDropdown(category._id, e)}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
      
                <MoreVertical size={16} />
              </button>
              
              {/* Dropdown menu - Fixed z-index and positioning */}
              {openCategoryDropdown === category._id && (
                <div 
                  className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {  setEditingCategory(category);
                      setIsEditCategoryModalOpen(true)
                      }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit3 size={14} className="mr-2"      />
                    Edit Category
                  </button>
                
                  <button
                    onClick={(e) => toggleCategoryStatus(category._id, e)}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {category.isActive ? (
                      <>
                        <i className="fas fa-toggle-off w-4 mr-2 text-center"></i>
                        Deactivate
                      </>
                    ) : (
                      <>
                        <i className="fas fa-toggle-on w-4 mr-2 text-center text-green-500"></i>
                        Activate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() =>  {       setDeleteCategoryId(category._id)
                        setShowModal(true)   
                        
                      setDeleteMode("category")
                        }}  
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete Category
                  </button>
                </div>
              )}
            </div>
            
            {/* <ChevronRight
              size={16}
              className={`text-gray-400 transition-transform duration-200 ${
                selectedCategory === category._id
                  ? "rotate-90 text-blue-600"
                  : "group-hover:translate-x-1"
              }`}
            /> */}
          </div>
        </div>
      </div>
    ))}
  </div>

                    <button
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                      onClick={() => setIsCategoryModalOpen(true)}
                    >
                      <Plus size={18} />
                      Add New Category
                    </button>
                  </div>
                </div>

                {/* Products Column */}
                {/* Products Column */}
                <div className="xl:col-span-3">
                  <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-5 h-full border border-gray-200">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Package size={18} className="text-green-600" />
                        Products
                        {selectedCategoryData && (
                          <span className="text-sm font-normal text-gray-500">
                            in {selectedCategoryData.name}
                          </span>
                        )}
                      </h2>
                      {!loading.products && (
                        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                          {filteredProducts.length}
                        </span>
                      )}
                    </div>

                    {loading.products ? (
                      // Loading state
                      <div className="flex flex-col items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
                        <p className="text-gray-600">Loading products...</p>
                      </div>
                    ) : (
                      // Content when not loading
                      <>
                        <div className="space-y-3 mb-5 max-h-[500px] overflow-y-auto">
                          {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                              <div
                                key={product._id}
                                onClick={() => setSelectedProduct(product._id)}
                                className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                                  selectedProduct === product._id
                                    ? "bg-green-50 border-green-300 shadow-md transform scale-[1.02]"
                                    : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-gray-800 truncate">
                                        {product.name}
                                      </h3>
                                      {product.isLowStock && (
                                        <AlertCircle
                                          size={14}
                                          className="text-red-500 flex-shrink-0"
                                        />
                                      )}
                                    </div>
                                    <p className="text-lg font-bold text-green-600">
                                      ${product.price}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="relative">
                                      <button
                                        onClick={(e) =>
                                          toggleProductDropdown(product._id, e)
                                        }
                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                      >
                                        <MoreVertical size={16} />
                                      </button>

                                      {openProductDropdown === product._id && (
                                        <div
                                          className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <button
                                            onClick={(e) =>{
                                              setIsEditProductModalOpen(true);
                                              setEditingProduct(product);

                                          

                                            }
                                            
                                            }
                                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                          >
                                            <Edit3 size={14} className="mr-2" />
                                            Edit Product
                                          </button>
                                          <button
        onClick={() =>{
          handleToggleProductActive(product._id)
        }}
        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        {product.active ? (
          <>
            <ToggleRight size={16} className="mr-2 text-green-600" />
            Set Unavailable
          </>
        ) : (
          <>
            <ToggleRight size={16} className="mr-2 text-red-600" />
            Set Available
          </>
        )}
      </button>
                                          <button
                                            onClick={(e) =>

                                              {
                                              setDeleteProductId(product._id);

                                              setShowProductDeleteModal(true)

                                      

                                              }
                                            
                                            }
                                            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                          >
                                            <Trash2 size={14} className="mr-2" />
                                            Delete
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                    {/* <ChevronRight
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                      selectedProduct === product._id
                        ? "rotate-90 text-green-600"
                        : "group-hover:translate-x-1"
                    }`}
                  /> */}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full border font-medium ${getFoodTypeColor(
                                      product.foodType
                                    )}`}
                                  >
                                    {product.foodType}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full border font-medium ${getStatusColor(
                                      product.status
                                    )}`}
                                  >
                                    {product.status}
                                  </span>
                                </div>

                                {product.enableInventory && (
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Package size={12} />
                                    <span>
                                      Stock: {product.stock} {product.unit}
                                    </span>
                                    {product.isLowStock && (
                                      <span className="text-red-600 font-medium">
                                        (Low Stock!)
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Package
                                size={48}
                                className="mx-auto mb-3 text-gray-300"
                              />
                              <p className="font-medium">No products found</p>
                              <p className="text-sm">
                                Try adjusting your search or filters
                              </p>
                            </div>
                          )}
                        </div>

                        <button
                          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                          onClick={() => {
                            setIsProductModalOpen(true);
                          }}
                        >
                          <Plus size={18} />
                          Add New Product
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Product Details Column */}
                <div className="xl:col-span-6">
                  <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-5 h-full border border-gray-200">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Edit3 size={18} className="text-purple-600" />
                        Product Details
                      </h2>
                      {currentProduct && (
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                            <Edit3 size={16} /> 
                          </button>
                          <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {currentProduct ? (
                      <div className="space-y-5 max-h-[600px] overflow-y-auto">
                        {/* Alert for Low Stock */}
                        {currentProduct.enableInventory &&
                          currentProduct.isLowStock && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                              <AlertCircle
                                className="text-red-500 flex-shrink-0"
                                size={20}
                              />
                              <div>
                                <p className="font-medium text-red-800">
                                  Low Stock Alert!
                                </p>
                                <p className="text-sm text-red-600">
                                  Current stock ({currentProduct.stock}) is below
                                  reorder level ({currentProduct.reorderLevel})
                                </p>
                              </div>
                            </div>
                          )}

                        {/* Basic Information */}
                        {/* Basic Information Card with Image */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                          {/* Header with title */}
                          <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                              <Activity size={18} className="text-blue-600" />
                              Basic Information
                            </h3>
                          </div>

                          {/* Content with image and details */}
                          <div className="p-5">
                            <div className="flex flex-col md:flex-row gap-5">
                              {/* Product Image */}
                              <div className="w-full md:w-1/3 flex-shrink-0">
                                {currentProduct.images?.length > 0 ? (
                                  <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                                    <img
                                      src={currentProduct.images[0]}
                                      alt={currentProduct.name}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                    />
                                  </div>
                                ) : (
                                  <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <Image size={40} className="text-gray-400" />
                                  </div>
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-500">
                                    Product Name
                                  </label>
                                  <p className="text-gray-900 font-semibold text-lg">
                                    {currentProduct.name}
                                  </p>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-500">
                                    Price
                                  </label>
                                  <p className="text-green-600 font-bold text-xl">
                                    ${currentProduct.price}
                                  </p>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-500">
                                    Food Type
                                  </label>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getFoodTypeColor(
                                      currentProduct.foodType
                                    )}`}
                                  >
                                    {currentProduct.foodType === "veg"
                                      ? "🍏 Veg"
                                      : "🍗 Non-Veg"}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-500">
                                    Unit
                                  </label>
                                  <p className="text-gray-900 font-medium capitalize">
                                    {currentProduct.unit}
                                  </p>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-500">
                                    Status
                                  </label>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                      currentProduct.status
                                    )}`}
                                  >
                                    {currentProduct.status === "Active"
                                      ? "✅ Active"
                                      : "❌ Inactive"}
                                  </span>
                                </div>

                                {currentProduct.description && (
                                  <div className="sm:col-span-2 space-y-1">
                                    <label className="text-sm font-medium text-gray-500">
                                      Description
                                    </label>
                                    <p className="text-gray-700">
                                      {currentProduct.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Operational Details */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock size={16} className="text-orange-600" />
                            Operational Details
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                              <Clock
                                size={18}
                                className="text-blue-600 flex-shrink-0"
                              />
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Preparation Time
                                </label>
                                <p className="text-gray-900 font-semibold">
                                  {currentProduct.preparationTime} minutes
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                              <Package
                                size={18}
                                className="text-green-600 flex-shrink-0"
                              />
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Allowed Order Quantity
                                </label>
                                <p className="text-gray-900 font-semibold">
                                  Min: {currentProduct.minOrderQty} | Max:{" "}
                                  {currentProduct.maxOrderQty}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                              <Clock
                                size={18}
                                className="text-purple-600 flex-shrink-0"
                              />
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Available From
                                </label>
                                <p className="text-gray-900 font-semibold">
                                  {currentProduct.availabilityTime}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <label className="text-sm font-medium text-gray-600 block mb-2">
                              Description
                            </label>
                            <p className="text-gray-900 leading-relaxed">
                              {currentProduct.description}
                            </p>
                          </div>
                        </div>

                        {/* Images */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Image size={16} className="text-indigo-600" />
                            Product Images
                            <span className="text-sm font-normal text-gray-500">
                              ({currentProduct.images.length})
                            </span>
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            {currentProduct.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image}
                                  alt={`Product ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-indigo-300 transition-colors duration-200"
                                />
                                <button className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                            <button className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-all duration-200 group">
                              <Plus
                                size={20}
                                className="text-gray-400 group-hover:text-indigo-600"
                              />
                            </button>
                          </div>
                        </div>

                        {/* Inventory - Only show if inventory is enabled */}
                        {currentProduct.enableInventory && (
                          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                              <Package size={16} className="text-emerald-600" />
                              Inventory Management
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                <label className="text-sm font-medium text-gray-600 block mb-1">
                                  Current Stock
                                </label>
                                <p className="text-2xl font-bold text-emerald-600">
                                  {currentProduct.stock}{" "}
                                  <span className="text-sm font-normal text-gray-600">
                                    {currentProduct.unit}
                                  </span>
                                </p>
                              </div>
                              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <label className="text-sm font-medium text-gray-600 block mb-1">
                                  Reorder Level
                                </label>
                                <p className="text-2xl font-bold text-orange-600">
                                  {currentProduct.reorderLevel}{" "}
                                  <span className="text-sm font-normal text-gray-600">
                                    {currentProduct.unit}
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Stock Status Bar */}
                            <div className="mt-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-600">
                                  Stock Level
                                </span>
                                <span className="text-sm text-gray-500">
                                  {Math.round(
                                    (currentProduct.stock /
                                      (currentProduct.reorderLevel * 3)) *
                                      100
                                  )}
                                  %
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className={`h-3 rounded-full transition-all duration-300 ${
                                    currentProduct.isLowStock
                                      ? "bg-red-500"
                                      : "bg-green-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      (currentProduct.stock /
                                        (currentProduct.reorderLevel * 3)) *
                                        100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Additional Backend Fields */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Activity size={16} className="text-blue-600" />
                            Additional Information
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-600">
                                Cost Price
                              </label>
                              <p className="text-gray-900 font-medium">
                                ${currentProduct.costPrice}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-600">
                                Created At
                              </label>
                              <p className="text-gray-900 font-medium">
                                {new Date(
                                  currentProduct.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-600">
                                Last Updated
                              </label>
                              <p className="text-gray-900 font-medium">
                                {new Date(
                                  currentProduct.updatedAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                        <Package size={64} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          No Product Selected
                        </h3>
                        <p className="text-center text-gray-500 max-w-md">
                          Select a product from the list to view and edit its
                          details, manage inventory, and update images.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  export default MerchentCataloguePage;
