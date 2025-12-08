import React, { useState, useMemo } from 'react';
import { 
  FiHome, FiSearch, FiShoppingCart, FiPackage, FiMinus, FiPlus, 
  FiClock, FiStar, FiChevronDown, FiChevronUp, FiX, FiEdit3, 
  FiTrash2, FiMapPin, FiPhone, FiNavigation 
} from 'react-icons/fi';

const ProductCard = ({ product, addProductFromMerchant, getItemQuantity, decreaseProductQuantity }) => {
  const quantity = getItemQuantity(product._id);
  const isInStock = product.enableInventory ? product.stock > 0 : true;

  return (
    <div className={`bg-white rounded-xl border-2 p-4 transition-all duration-200 ${
      quantity > 0 
        ? 'border-orange-300 bg-orange-50 shadow-md' 
        : 'border-gray-200 hover:border-orange-200 hover:shadow-sm'
    }`}>
      <div className="flex space-x-3">
        {/* Product Image */}
        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <FiPackage className="text-gray-400 text-xl" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-gray-800 text-sm leading-tight pr-2">
              {product.name}
            </h3>
            {!isInStock && (
              <span className="flex-shrink-0 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          <p className="text-gray-600 text-xs mb-2 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-orange-600">
                ₹{product.price}
              </span>
              
              {product.specialOffer?.discount > 0 && (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {product.specialOffer.discount}% OFF
                </span>
              )}
            </div>

            {/* Quantity Controls */}
            {quantity > 0 ? (
              <div className="flex items-center space-x-2 bg-orange-500 text-white rounded-full px-3 py-1">
                <button
                  type="button"
                  onClick={() => decreaseProductQuantity(product)}
                  className="p-1 hover:bg-orange-600 rounded-full transition-all"
                  disabled={!isInStock}
                >
                  <FiMinus className="text-xs" />
                </button>
                <span className="text-sm font-semibold min-w-4 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => addProductFromMerchant(product)}
                  className="p-1 hover:bg-orange-600 rounded-full transition-all"
                  disabled={!isInStock || (product.enableInventory && quantity >= product.stock)}
                >
                  <FiPlus className="text-xs" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addProductFromMerchant(product)}
                disabled={!isInStock}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isInStock
                    ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isInStock ? 'Add' : 'Out of Stock'}
              </button>
            )}
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <FiClock className="text-xs" />
                <span>{product.preparationTime} min</span>
              </span>
              {product.foodType && (
                <span className={`px-2 py-1 rounded-full ${
                  product.foodType === 'veg' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.foodType === 'veg' ? '🥬 Veg' : '🍖 Non-Veg'}
                </span>
              )}
            </div>

            {product.rating > 0 && (
              <div className="flex items-center space-x-1">
                <FiStar className="text-yellow-500 text-xs" />
                <span>{product.rating}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CategorySection = ({ category, isExpanded, toggleCategory, form, addProductFromMerchant, getItemQuantity, decreaseProductQuantity }) => {
  const itemsInCategory = form.items.filter(item => 
    category.items.some(catItem => catItem._id === item.productId)
  );
  const totalItemsInCategory = itemsInCategory.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Category Header */}
      <button
        type="button"
        onClick={() => toggleCategory(category.categoryId)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {category.categoryName.charAt(0)}
            </span>
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-800 text-sm">
              {category.categoryName}
            </h3>
            <p className="text-gray-600 text-xs">
              {category.totalProducts} items • {category.description}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {totalItemsInCategory > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              {totalItemsInCategory} in cart
            </span>
          )}
          {isExpanded ? (
            <FiChevronUp className="text-gray-500" />
          ) : (
            <FiChevronDown className="text-gray-500" />
          )}
        </div>
      </button>

      {/* Category Items */}
      {isExpanded && (
        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {category.items.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product}
                addProductFromMerchant={addProductFromMerchant}
                getItemQuantity={getItemQuantity}
                decreaseProductQuantity={decreaseProductQuantity}
              />
            ))}
          </div>

          {category.items.length === 0 && (
            <div className="text-center py-6 text-gray-500 text-sm">
              <FiPackage className="text-2xl mx-auto mb-2 text-gray-400" />
              No products available in this category
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SearchResultsSection = ({ searchResults, searchTerm, addProductFromMerchant, getItemQuantity, decreaseProductQuantity }) => {
  if (!searchTerm) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Search Results Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FiSearch className="text-white text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Search Results</h3>
              <p className="text-gray-600 text-xs">
                Found {searchResults.length} products for "{searchTerm}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="p-4 bg-gray-50">
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {searchResults.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product}
                addProductFromMerchant={addProductFromMerchant}
                getItemQuantity={getItemQuantity}
                decreaseProductQuantity={decreaseProductQuantity}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiSearch className="text-3xl text-gray-400 mx-auto mb-3" />
            <h3 className="text-gray-600 font-medium">No products found</h3>
            <p className="text-gray-500 text-sm mt-1">
              No products match your search for "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Compact Additional Information Section Component
const AdditionalInformationSection = ({ form, setForm }) => {
  const handleAdditionalInfoChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      additionalInfo: {
        ...prev.additionalInfo,
        [field]: value
      }
    }));
  };

  const isFormValid = form.additionalInfo?.address && 
                     form.additionalInfo?.landmark && 
                     form.additionalInfo?.secondaryContact;

  return (
    <div className={`border rounded-xl p-4 transition-all duration-200 ${
      isFormValid 
        ? 'bg-green-50 border-green-200' 
        : 'bg-orange-50 border-orange-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg ${
            isFormValid ? 'bg-green-100' : 'bg-orange-100'
          }`}>
            <FiMapPin className={`text-sm ${
              isFormValid ? 'text-green-600' : 'text-orange-600'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">Additional Information</h3>
            <p className={`text-xs ${
              isFormValid ? 'text-green-600' : 'text-orange-600'
            }`}>
              {isFormValid ? 'All information provided' : 'Required delivery details'}
            </p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isFormValid 
            ? 'bg-green-100 text-green-800' 
            : 'bg-orange-100 text-orange-800'
        }`}>
          {isFormValid ? '✓ Complete' : 'Required'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Address Field */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Delivery Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiMapPin className="absolute left-2 top-2 text-gray-400 text-xs" />
            <textarea
              value={form.additionalInfo?.address || ''}
              onChange={(e) => handleAdditionalInfoChange('address', e.target.value)}
              placeholder="Enter complete delivery address"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-xs resize-none"
              rows="2"
              required
            />
          </div>
        </div>

        {/* Landmark Field */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Landmark <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiNavigation className="absolute left-2 top-2 text-gray-400 text-xs" />
            <input
              type="text"
              value={form.additionalInfo?.landmark || ''}
              onChange={(e) => handleAdditionalInfoChange('landmark', e.target.value)}
              placeholder="Nearby landmark"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-xs"
              required
            />
          </div>
        </div>

        {/* Secondary Contact Number Field */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Secondary Contact <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiPhone className="absolute left-2 top-2 text-gray-400 text-xs" />
            <input
              type="tel"
              value={form.additionalInfo?.secondaryContact || ''}
              onChange={(e) => handleAdditionalInfoChange('secondaryContact', e.target.value)}
              placeholder="Alternate phone"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-xs"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const MerchantMenuTab = ({
  selectedMerchant,
  setSelectedMerchant,
  merchantSearchTerm,
  setMerchantSearchTerm,
  showMerchantDropdown,
  setShowMerchantDropdown,
  filteredMerchants,
  handleMerchantSelect,
  merchantRef,
  loadingMerchants,
  products,
  loadingProducts,
  expandedCategories,
  toggleCategory,
  form,
  setForm,
  addProductFromMerchant,
  getItemQuantity,
  decreaseProductQuantity,
  addBlankItem,
  updateItem,
  removeItem
}) => {
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

   const [currentCartId, setCurrentCartId] = useState(null);

  // Filter products based on search term
  const searchResults = useMemo(() => {
    if (!productSearchTerm.trim()) return [];

    const searchTerm = productSearchTerm.toLowerCase().trim();
    
    // Flatten all products from all categories
    const allProducts = products.flatMap(category => category.items);
    
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  }, [productSearchTerm, products]);

  const handleProductSearch = (e) => {
    const value = e.target.value;
    setProductSearchTerm(value);
    setShowSearchResults(value.length > 0);
  };

  const clearSearch = () => {
    setProductSearchTerm('');
    setShowSearchResults(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <FiHome className="text-orange-600 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Merchant & Menu</h2>
          <p className="text-gray-600 text-sm">Select restaurant and add menu items</p>
        </div>
      </div>

      {/* Merchant Selection */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="space-y-3">
          <div className="space-y-2 relative" ref={merchantRef}>
            <label className="text-sm font-medium text-gray-700">Search Merchant</label>
            <div className="relative">
              <FiHome className="absolute left-3 top-3 text-orange-400 text-sm z-10" />
              <input
                value={merchantSearchTerm}
                onChange={(e) => {
                  setMerchantSearchTerm(e.target.value);
                  setShowMerchantDropdown(true);
                }}
                onFocus={() => setShowMerchantDropdown(true)}
                className="pl-10 w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="Search for restaurant or merchant..."
              />
              <FiSearch className="absolute right-3 top-3 text-gray-400 text-sm" />
            </div>

            {/* Merchant Dropdown */}
            {showMerchantDropdown && filteredMerchants.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto mt-1">
                {filteredMerchants.map((merchant) => (
                  <div
                    key={merchant.id}
                    className="p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleMerchantSelect(merchant)}
                  >
                    <div className="font-medium text-gray-800">{merchant.name}</div>
                    <div className="text-sm text-gray-600">{merchant.address}</div>
                    <div className="text-xs text-gray-500">{merchant.city}, {merchant.phone}</div>
                  </div>
                ))}
              </div>
            )}
            
            {showMerchantDropdown && merchantSearchTerm && filteredMerchants.length === 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-20 mt-1 p-3 text-center text-gray-500">
                {loadingMerchants ? 'Loading merchants...' : 'No merchants found'}
              </div>
            )}
          </div>

          {selectedMerchant && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-green-800">{selectedMerchant.name}</div>
                  <div className="text-sm text-green-600">{selectedMerchant.address}</div>
                  <div className="text-xs text-green-500">{selectedMerchant.city}, {selectedMerchant.phone}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMerchant(null);
                    setMerchantSearchTerm("");
                    setProductSearchTerm("");
                    setShowSearchResults(false);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Change
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restaurant Menu & Order Items Combined */}
      {selectedMerchant && (
        <div className="space-y-6">
          {/* Menu Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiShoppingCart className="text-orange-600 text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Menu Items</h3>
                  <p className="text-gray-600 text-sm">
                    Browse and add items from {selectedMerchant.name}'s menu
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600">
                  {form.items.length} items in order
                </div>
              </div>
            </div>

            {/* Product Search Bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search Menu Items</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
                  <input
                    type="text"
                    value={productSearchTerm}
                    onChange={handleProductSearch}
                    className="pl-10 pr-10 w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="Search for dishes, items, or keywords..."
                  />
                  {productSearchTerm && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FiX className="text-sm" />
                    </button>
                  )}
                </div>
                {productSearchTerm && (
                  <p className="text-xs text-gray-500">
                    Search results will appear below. You can search by dish name, ingredients, or description.
                  </p>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loadingProducts && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-gray-600 text-sm mt-2">Loading menu...</p>
              </div>
            )}

            {/* Search Results */}
            {showSearchResults && (
              <SearchResultsSection
                searchResults={searchResults}
                searchTerm={productSearchTerm}
                addProductFromMerchant={addProductFromMerchant}
                getItemQuantity={getItemQuantity}
                decreaseProductQuantity={decreaseProductQuantity}
              />
            )}

            {/* Menu Categories (only show when not searching) */}
            {!loadingProducts && products.length > 0 && !showSearchResults && (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {products.map((category) => (
                  <CategorySection 
                    key={category.categoryId} 
                    category={category}
                    isExpanded={expandedCategories.has(category.categoryId)}
                    toggleCategory={toggleCategory}
                    form={form}
                    addProductFromMerchant={addProductFromMerchant}
                    getItemQuantity={getItemQuantity}
                    decreaseProductQuantity={decreaseProductQuantity}
                  />
                ))}
              </div>
            )}

            {/* Empty State for Menu */}
            {!loadingProducts && products.length === 0 && !showSearchResults && (
              <div className="text-center py-8">
                <FiPackage className="text-4xl text-gray-400 mx-auto mb-3" />
                <h3 className="text-gray-600 font-medium">No Menu Available</h3>
                <p className="text-gray-500 text-sm mt-1">
                  This merchant doesn't have any products in their menu yet.
                </p>
              </div>
            )}
          </div>

          {/* Custom Items Section */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-orange-100 rounded-lg">
                  <FiEdit3 className="text-orange-600 text-sm" />
                </div>
                <h3 className="font-semibold text-gray-800">Order Items</h3>
              </div>
              <button
                type="button"
                onClick={addBlankItem}
                className="flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow shadow-orange-200 text-sm"
              >
                <FiPlus className="text-sm" />
                <span>Add Custom Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {form.items.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <FiShoppingCart className="text-3xl mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">No items added yet</p>
                  {!selectedMerchant && (
                    <p className="text-xs mt-1 text-gray-500">Select a merchant first to see available products</p>
                  )}
                </div>
              )}

              {form.items.map((it, idx) => (
                <div
                  key={it.id}
                  className="grid grid-cols-12 gap-3 items-center bg-white p-4 rounded-lg border border-orange-100 transition-all hover:border-orange-300 shadow-sm"
                >
                  <div className="col-span-5">
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Item Name</label>
                    <input
                      value={it.name}
                      onChange={(e) =>
                        updateItem(idx, "name", e.target.value)
                      }
                      placeholder="Item name"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={it.qty}
                      onChange={(e) =>
                        updateItem(idx, "qty", Number(e.target.value))
                      }
                      className="w-full p-2 border border-gray-300 rounded text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Price (₹)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={it.price}
                      onChange={(e) =>
                        updateItem(idx, "price", Number(e.target.value))
                      }
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Total</label>
                    <div className="text-right font-semibold text-orange-600 text-sm">
                      ₹ {(Number(it.qty) * Number(it.price)).toFixed(2)}
                    </div>
                  </div>

                  <div className="col-span-1 flex justify-center pt-4">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-2 rounded text-red-500 hover:bg-red-50 transition-all"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Preview */}
          {form.items.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Order Preview</h3>
              <div className="space-y-2">
                {form.items.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 text-sm">{item.name}</div>
                      <div className="text-xs text-gray-600">
                        ₹{item.price} × {item.qty}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-orange-600 text-sm">
                        ₹{(item.qty * item.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Information Section */}
          <AdditionalInformationSection form={form} setForm={setForm} />
        </div>
      )}
    </div>
  );
};

export default MerchantMenuTab;