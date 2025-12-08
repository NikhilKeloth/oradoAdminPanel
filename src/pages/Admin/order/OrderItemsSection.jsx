import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FiPlus, FiX, FiSearch, FiPackage, FiMinus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://orado.online/backend';

// Search Result Product Card Component
const SearchResultProductCard = ({ product, onAdd, existingQuantity }) => {
  const isInStock = product.enableInventory ? product.stock > 0 : true;

  return (
    <div className={`p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-all duration-200 ${
      existingQuantity > 0 ? 'bg-green-50' : ''
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {/* Product Image */}
          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <FiPackage className="text-gray-400 text-xs" />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                {product.name}
              </h3>
              {!isInStock && (
                <span className="flex-shrink-0 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full ml-2">
                  Out of Stock
                </span>
              )}
            </div>

            <p className="text-gray-600 text-xs mt-1 line-clamp-1">
              {product.description}
            </p>

            <div className="flex items-center justify-between mt-2">
              <span className="text-base font-bold text-pink-600">
                ₹{product.price}
              </span>
              
              {existingQuantity > 0 && (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {existingQuantity} in cart
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAdd(product)}
          disabled={!isInStock}
          className={`ml-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            isInStock
              ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-sm'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isInStock ? 'Add' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

// Compact Order Item Card (Read-only)
const CompactOrderItemCard = ({ item }) => (
  <div className="bg-white border border-pink-100 rounded-lg p-2 hover:shadow-sm transition-all duration-200 group">
    <div className="flex justify-between items-start mb-1">
      <h3 className="font-semibold text-gray-900 text-sm group-hover:text-pink-600 transition-colors">
        {item.name || "Product"}
      </h3>
      <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
        Qty: {item.quantity || 0}
      </span>
    </div>

    <div className="flex items-center gap-2 mb-2">
      <img
        src={item.image || "/assets/images/placeholder_3.png"}
        alt={item.name || "Product"}
        className="w-10 h-10 object-cover rounded-lg border border-pink-100"
      />
      <div className="flex-1">
        <div className="text-xs text-gray-600">
          Unit Price: ₹{item.totalPrice && item.quantity ? (item.totalPrice / item.quantity).toFixed(2) : "0.00"}
        </div>
      </div>
    </div>

    <div className="border-t border-pink-100 pt-1.5">
      <div className="flex justify-between items-center font-semibold">
        <span className="text-gray-700 text-sm">Total Price:</span>
        <span className="text-pink-600 text-sm">₹{item.totalPrice?.toFixed(2) || "0.00"}</span>
      </div>
    </div>
  </div>
);

// Editable Order Item Card
const EditableOrderItemCard = ({ item, index, onUpdateQuantity, onUpdatePrice, onUpdateName, onRemove, isEditing }) => (
  <div className="bg-white border border-pink-200 rounded-lg p-3 transition-all duration-200">
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1">
        <input
          type="text"
          value={item.name}
          onChange={(e) => onUpdateName(index, e.target.value)}
          className="w-full p-1 border border-gray-300 rounded text-sm font-semibold focus:ring-2 focus:ring-pink-500"
          placeholder="Item name"
        />
      </div>
      <button
        onClick={() => onRemove(index)}
        className="p-1 text-red-500 hover:text-red-700 transition-colors ml-2"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </div>

    <div className="flex items-center gap-2 mb-2">
      <img
        src={item.image || "/assets/images/placeholder_3.png"}
        alt={item.name || "Product"}
        className="w-10 h-10 object-cover rounded-lg border border-pink-100"
      />
      <div className="flex-1 grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Quantity</label>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onUpdateQuantity(index, (item.quantity || 1) - 1)}
              className="p-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              <FiMinus className="w-3 h-3" />
            </button>
            <input
              type="number"
              value={item.quantity || 1}
              onChange={(e) => onUpdateQuantity(index, parseInt(e.target.value) || 1)}
              className="w-12 p-1 border border-gray-300 rounded text-center text-sm"
              min="1"
            />
            <button
              onClick={() => onUpdateQuantity(index, (item.quantity || 1) + 1)}
              className="p-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              <FiPlus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 block">Unit Price (₹)</label>
          <input
            type="number"
            value={item.price || 0}
            onChange={(e) => onUpdatePrice(index, parseFloat(e.target.value) || 0)}
            className="w-full p-1 border border-gray-300 rounded text-sm"
            step="0.01"
            min="0"
          />
        </div>
      </div>
    </div>

    <div className="border-t border-pink-100 pt-2">
      <div className="flex justify-between items-center font-semibold">
        <span className="text-gray-700 text-sm">Total Price:</span>
        <span className="text-pink-600 text-sm">
          ₹{((item.quantity || 1) * (item.price || 0)).toFixed(2)}
        </span>
      </div>
    </div>
  </div>
);

// Main OrderItemsSection Component
// const OrderItemsSection = ({ 
//   order, 
//   isEditing, 
//   editingSection, 
//   editedItems, 
//   setEditedItems,
//   startEditing 
// }) => {

  const OrderItemsSection = ({ 
    order, 
    isEditing, 
    editedItems, 
    setEditedItems
  }) => {
  const [merchantProducts, setMerchantProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Determine if we're currently editing items
  // const isEditingItems = isEditing && editingSection === 'items';

  // Fetch restaurant menu when component mounts and order is available
  useEffect(() => {
    if (order?.restaurant?._id) {
      fetchRestaurantMenu(order.restaurant._id);
    }
  }, [order?.restaurant?._id]);

  // Cart API functions - Always use the existing cart ID
  const updateCartItem = async (productId, quantity) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`${API_BASE_URL}/cart/update`, {
        productId,
        quantity,
        cartId: order.cartId // Use existing cart ID
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(`${API_BASE_URL}/cart/remove`, {
        data: { 
          productId,
          cartId: order.cartId // Use existing cart ID
        },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const addToCart = async (product) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(`${API_BASE_URL}/cart/add`, {
        restaurantId: order.restaurant._id,
        cartId: order.cartId, // Use existing cart ID
        products: [{
          productId: product._id,
          quantity: 1
        }]
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const fetchRestaurantMenu = async (restaurantId) => {
    if (!restaurantId) return;
    try {
      setLoadingProducts(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/restaurants/${restaurantId}/menu`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.data.messageType === "success") {
        setMerchantProducts(response.data.data || []);
      } else {
        setMerchantProducts([]);
      }
    } catch (error) {
      console.error('Error fetching restaurant menu:', error);
      setMerchantProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductSearch = (e) => {
    const value = e.target.value;
    setProductSearchTerm(value);
    
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTerm = value.toLowerCase().trim();
    const allProducts = merchantProducts.flatMap(category => 
      category.items ? category.items.map(item => ({
        ...item,
        categoryName: category.categoryName
      })) : []
    );
    
    const filtered = allProducts.filter(product => 
      product.name?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.categoryName?.toLowerCase().includes(searchTerm)
    );
    
    setSearchResults(filtered);
  };

  // Add product and sync with existing cart
  const addProductFromMerchant = async (product) => {
    try {
      // Check if item already exists in cart
      const existingItem = editedItems.find(item => 
        item.productId === product._id
      );

      if (existingItem) {
        // If exists, update quantity using updateCartItem
        const newQuantity = (existingItem.quantity || 1) + 1;
        await updateCartItem(product._id, newQuantity);
        
        // Update local state
        setEditedItems(prev =>
          prev.map(item =>
            item.productId === product._id
              ? {
                  ...item,
                  quantity: newQuantity,
                  totalPrice: newQuantity * (item.price || product.price || 0)
                }
              : item
          )
        );
      } else {
        // If new item, add to existing cart
        await addToCart(product);
        
        // Then update local state
        const newItem = {
          _id: product._id,
          productId: product._id,
          name: product.name,
          quantity: 1,
          price: product.price,
          totalPrice: product.price,
          image: product.images?.[0],
          description: product.description
        };
        
        setEditedItems(prev => [...prev, newItem]);
      }
      
      // Clear search after adding
      setProductSearchTerm('');
      setSearchResults([]);
      
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Update quantity and sync with existing cart
  const updateItemQuantity = async (index, newQuantity) => {
    if (newQuantity < 1) return;

    const item = editedItems[index];
    
    try {
      if (item.productId && !item.isCustom) {
        // For existing cart items, use updateCartItem with existing cart ID
        await updateCartItem(item.productId, newQuantity);
      }

      // Update local state
      setEditedItems(prev =>
        prev.map((item, i) =>
          i === index ? {
            ...item,
            quantity: newQuantity,
            totalPrice: newQuantity * (item.price || 0)
          } : item
        )
      );
      
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update cart');
    }
  };

  const updateItemPrice = (index, newPrice) => {
    setEditedItems(prev =>
      prev.map((item, i) =>
        i === index ? {
          ...item,
          price: newPrice,
          totalPrice: (item.quantity || 1) * newPrice
        } : item
      )
    );
  };

  // Remove item and sync with existing cart
  const removeItem = async (index) => {
    const item = editedItems[index];
    
    try {
      // Remove from cart if it's not a custom item and has productId
      if (!item.isCustom && item.productId) {
        await removeFromCart(item.productId);
      }

      // Remove from local state
      setEditedItems(prev => prev.filter((_, i) => i !== index));
      
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const addCustomItem = () => {
    const newItem = {
      _id: `custom-${Date.now()}`,
      name: "New Item",
      quantity: 1,
      price: 0,
      totalPrice: 0,
      isCustom: true
    };
    setEditedItems(prev => [...prev, newItem]);
  };

  const updateItemName = (index, newName) => {
    setEditedItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, name: newName } : item
      )
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/50 overflow-hidden">
      <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 flex justify-between items-center">
        <h2 className="text-sm font-bold text-gray-900 flex items-center">
          <div className="w-1.5 h-4 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full mr-2"></div>
          Order Items
        </h2>
        {/* {isEditing && !isEditingItems && (
          <button
            onClick={() => startEditing('items')}
            className="flex items-center space-x-1 text-pink-600 hover:text-pink-700 text-xs font-medium"
          >
            <FiPlus className="w-3 h-3" />
            <span>Edit Items</span>
          </button>
        )}
        {isEditingItems && (
          <button
            onClick={addCustomItem}
            className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-xs font-medium"
          >
            <FiPlus className="w-3 h-3" />
            <span>Add Custom Item</span>
          </button>
        )} */}

        {isEditing ? (
          <button
            onClick={addCustomItem}
            className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-xs font-medium"
          >
            <FiPlus className="w-3 h-3" />
            <span>Add Custom Item</span>
          </button>
        ) : (
          <button
            onClick={() => {/* You'll need to pass startEditing prop back or handle differently */}}
            className="flex items-center space-x-1 text-pink-600 hover:text-pink-700 text-xs font-medium"
          >
            <FiPlus className="w-3 h-3" />
            <span>Edit Items</span>
          </button>
        )
        
        }
      </div>

      <div className="p-3">
        {/* Search Bar - Only show when editing items */}
        {isEditing && (
          <div className="mb-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
              <input
                type="text"
                value={productSearchTerm}
                onChange={handleProductSearch}
                placeholder="Search menu items from restaurant..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
              />
              {productSearchTerm && (
                <button
                  onClick={() => {
                    setProductSearchTerm('');
                    setSearchResults([]);
                  }}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((product) => (
                  <SearchResultProductCard
                    key={product._id}
                    product={product}
                    onAdd={addProductFromMerchant}
                    existingQuantity={editedItems.find(item => item.productId === product._id)?.quantity || 0}
                  />
                ))}
              </div>
            )}

            {productSearchTerm && searchResults.length === 0 && !loadingProducts && (
              <div className="mt-2 text-center py-4 text-gray-500 text-sm">
                No products found matching "{productSearchTerm}"
              </div>
            )}

            {loadingProducts && (
              <div className="mt-2 text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto"></div>
                <p className="text-gray-600 text-sm mt-2">Loading menu...</p>
              </div>
            )}
          </div>
        )}

        {isEditing  ? (
          <div className="space-y-3">
            {editedItems.map((item, index) => (
              <EditableOrderItemCard
                key={item._id || item.id}
                item={item}
                index={index}
                onUpdateQuantity={updateItemQuantity}
                onUpdatePrice={updateItemPrice}
                onUpdateName={updateItemName}
                onRemove={removeItem}
                isEditing={true}
              />
            ))}
            
            {editedItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FiPackage className="text-3xl text-gray-400 mx-auto mb-3" />
                <p className="text-sm">No items in order. Add items using search above or add custom items.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {order.orderItems?.length > 0 ? (
              order.orderItems.map((item) => (
                <CompactOrderItemCard key={item._id} item={item} />
              ))
            ) : (
              <div className="col-span-full text-center py-4">
                <div className="text-gray-500 text-sm font-medium">No order items found</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderItemsSection;