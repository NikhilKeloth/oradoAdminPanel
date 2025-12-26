import React, { useState } from "react";
import { 
  MoreVertical, Plus, Search, Package, Archive, Edit3, Trash2, Eye, 
  ToggleRight, RefreshCw, EyeOff, Eye as EyeIcon, Upload, Edit, Filter, Layers
} from "lucide-react";

function ProductsColumn({
  products,
  selectedProduct,
  setSelectedProduct,
  productDropdown,
  setProductDropdown,
  toggleProductDropdown,
  dropdownPosition,
  setDeleteProductId,
  setDeleteMode,
  setShowModal,
  setEditingProduct,
  setIsEditProductModalOpen,
  setIsProductModalOpen,
  loading,
  handleArchiveProduct,
  handleUnarchiveProduct,
  handleToggleProductActive,
  searchTerm,
  setSearchTerm,
  showInactiveProducts,
  setShowInactiveProducts,
  refreshProducts,
  setIsProductImportModalOpen,
  setIsBulkProductModalOpen,
  handleExportProduct,
  id,
  showSubCategoryToggle,
  setShowSubCategoryToggle,
  subCategories,
  selectedSubCategory
}) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(localSearchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleSearchChange = (e) => {
    setLocalSearchTerm(e.target.value);
    setSearchTerm(e.target.value);
  };

  return (
    <div className="bg-white rounded-xl h-full border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-800">
          Product ({filteredProducts.length})
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={localSearchTerm}
              onChange={handleSearchChange}
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent w-40"
            />
          </div>
          <button 
            className="p-1 text-gray-500 hover:text-pink-600 transition-colors"
            onClick={() => setIsProductModalOpen(true)}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Inactive Products Toggle - FROM ORIGINAL */}
      <div className="px-4 py-2 border-b border-gray-200">
        <button
          onClick={() => setShowInactiveProducts(!showInactiveProducts)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600"
        >
          {showInactiveProducts ? (
            <>
              <EyeOff size={16} />
              Hide Inactive Products
            </>
          ) : (
            <>
              <EyeIcon size={16} />
              Show Inactive Products
            </>
          )}
        </button>
      </div>

      {/* Refresh Button - FROM ORIGINAL */}
      <div className="px-4 py-2 border-b border-gray-200">
        <button
          onClick={refreshProducts}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600"
        >
          <RefreshCw size={16} />
          Refresh Products
        </button>
      </div>

      {/* Import and Bulk Edit Buttons - FROM ORIGINAL */}
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsProductImportModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-xs hover:from-green-700 hover:to-green-800 transition-all shadow-sm"
          >
            <Upload size={14} />
            <span>Import</span>
          </button>

          <button
            onClick={() => setIsBulkProductModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white text-purple-600 border border-purple-600 rounded-lg text-xs hover:bg-purple-600 hover:text-white transition-all"
          >
            <Edit size={14} />
            <span>Bulk Edit</span>
          </button>
        </div>
      </div>
      <div className="px-4 py-2 border-b border-gray-200">
      <button
        onClick={() => setShowSubCategoryToggle(!showSubCategoryToggle)}
        className={`flex items-center gap-2 text-sm ${showSubCategoryToggle ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
      >
        <Layers size={16} />
        {showSubCategoryToggle ? 'Hide Subcategories' : 'Show Subcategories'}
      </button>
    </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : (
        <>
          <div className="p-3 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => setSelectedProduct(product._id)}
                  className={`w-full p-3 flex justify-between items-center cursor-pointer transition-all duration-150 rounded-lg border ${
                    selectedProduct === product._id
                      ? "bg-pink-50 border-pink-300 shadow-sm"
                      : "bg-white border-gray-200 hover:bg-pink-50 hover:border-pink-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm uppercase truncate ${
                        selectedProduct === product._id
                          ? "font-bold text-pink-700"
                          : "font-medium text-gray-500"
                      }`}
                    >
                      {product.name}
                    </span>
                    {!product.active && (
                      <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={(e) => toggleProductDropdown(product._id, e)}
                      className="p-1 text-gray-500 hover:text-pink-600 rounded-md transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package size={48} className="mx-auto mb-3 text-pink-300" />
                <p className="font-medium">No products found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Product Dropdown */}
      {productDropdown && (
        <div
          className="fixed z-[9999] bg-white rounded-md shadow-lg border border-gray-200 w-48"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Archive/Unarchive Option - FIRST */}
          {products.find(p => p._id === productDropdown)?.archived ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUnarchiveProduct(productDropdown);
                setProductDropdown(null);
              }}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-pink-50"
            >
              <Archive size={14} className="mr-2" />
              Unarchive Product
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleArchiveProduct(productDropdown);
                setProductDropdown(null);
              }}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-pink-600 hover:bg-pink-50"
            >
              <Archive size={14} className="mr-2" />
              Archive Product
            </button>
          )}

          {/* Edit Product Option - SECOND */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const product = products.find(p => p._id === productDropdown);
              setEditingProduct(product);
              setIsEditProductModalOpen(true);
              setProductDropdown(null);
            }}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50"
          >
            <Edit3 size={14} className="mr-2" />
            Edit Product
          </button>

          {/* Toggle Availability Option - THIRD */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleProductActive(productDropdown);
              setProductDropdown(null);
            }}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50"
          >
            {products.find(p => p._id === productDropdown)?.active ? (
              <>
                <ToggleRight size={14} className="mr-2 text-green-600" />
                Set Unavailable
              </>
            ) : (
              <>
                <ToggleRight size={14} className="mr-2 text-red-600" />
                Set Available
              </>
            )}
          </button>

          {/* View Details Option - FOURTH */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(productDropdown);
              setProductDropdown(null);
            }}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50"
          >
            <Eye size={14} className="mr-2" />
            View Details
          </button>

          {/* Delete Option - FIFTH */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteProductId(productDropdown);
              setDeleteMode("product");
              setShowModal(true);
              setProductDropdown(null);
            }}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-pink-50"
          >
            <Trash2 size={14} className="mr-2" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductsColumn;