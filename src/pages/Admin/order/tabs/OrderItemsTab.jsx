import React, { useState, useMemo } from 'react';
import { FiEdit3, FiPlus, FiTrash2, FiShoppingCart, FiSearch, FiX, FiPackage, FiMinus, FiMapPin, FiPhone, FiNavigation } from 'react-icons/fi';

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
        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <FiPackage className="text-gray-400 text-lg" />
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
              <span className="text-base font-bold text-orange-600">
                ₹{product.price}
              </span>
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
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isInStock
                    ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isInStock ? 'Add' : 'Out of Stock'}
              </button>
            )}
          </div>
        </div>
      </div>
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
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <FiSearch className="text-white text-sm" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          <div className="text-center py-6">
            <FiSearch className="text-2xl text-gray-400 mx-auto mb-2" />
            <h3 className="text-gray-600 font-medium text-sm">No products found</h3>
            <p className="text-gray-500 text-xs mt-1">
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

      {/* Compact Validation Summary */}
      {/* {!isFormValid && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-xs font-medium flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            Please fill all required fields above
          </p>
        </div>
      )} */}
    </div>
  );
};

const OrderItemsTab = ({
  form,
  setForm,
  addBlankItem,
  addProduct,
  updateItem,
  removeItem,
  selectedMerchant,
  products = [],
  addProductFromMerchant,
  getItemQuantity,
  decreaseProductQuantity
}) => {
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Filter products based on search term
  const searchResults = useMemo(() => {
    if (!productSearchTerm.trim() || !selectedMerchant) return [];

    const searchTerm = productSearchTerm.toLowerCase().trim();
    
    // Flatten all products from all categories
    const allProducts = products.flatMap(category => category.items || []);
    
    return allProducts.filter(product => 
      product.name?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  }, [productSearchTerm, products, selectedMerchant]);

  const handleProductSearch = (e) => {
    const value = e.target.value;
    setProductSearchTerm(value);
    setShowSearchResults(value.length > 0 && selectedMerchant);
  };

  const clearSearch = () => {
    setProductSearchTerm('');
    setShowSearchResults(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <FiShoppingCart className="text-orange-600 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Order Items</h2>
          <p className="text-gray-600 text-sm">Review and customize your order items</p>
        </div>
      </div>

      {/* Product Search Section - Only show when merchant is selected */}
      {selectedMerchant && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <FiSearch className="text-blue-600 text-sm" />
              </div>
              <h3 className="font-semibold text-gray-800">Search Menu Items</h3>
            </div>
            <p className="text-blue-600 text-xs">
              Search and add from {selectedMerchant.name}'s menu
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
              <input
                type="text"
                value={productSearchTerm}
                onChange={handleProductSearch}
                className="pl-10 pr-10 w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Search for dishes, items, or keywords..."
                disabled={!selectedMerchant}
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
            {!selectedMerchant && (
              <p className="text-xs text-gray-500">
                Select a merchant first to search their menu
              </p>
            )}
          </div>

          {/* Search Results */}
          {showSearchResults && (
            <div className="mt-4">
              <SearchResultsSection
                searchResults={searchResults}
                searchTerm={productSearchTerm}
                addProductFromMerchant={addProductFromMerchant}
                getItemQuantity={getItemQuantity}
                decreaseProductQuantity={decreaseProductQuantity}
              />
            </div>
          )}
        </div>
      )}

      {/* Custom Items Section - MOVED TO TOP */}
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

      {/* Compact Additional Information Section - MOVED TO BOTTOM */}
      <AdditionalInformationSection form={form} setForm={setForm} />
    </div>
  );
};

export default OrderItemsTab;