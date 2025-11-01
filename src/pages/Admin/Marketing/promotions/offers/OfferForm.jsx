import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X, Save, RotateCcw } from 'lucide-react';
import { fetchProductsByRestaurant } from '../../../../../apis/adminApis/restaurantApi';
import { fetchRestaurantsDropdown } from '../../../../../apis/adminApis/adminFuntionsApi';

const OfferForm = ({ editingOffer, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    applicableLevel: 'Restaurant',
    applicableRestaurants: [],
    applicableProducts: [],
    minOrderValue: 0,
    type: 'flat',
    discountValue: 0,
    maxDiscount: 0,
    validFrom: '',
    validTill: '',
    usageLimitPerUser: 1,
    totalUsageLimit: 0,
    createdBy: 'admin',
    comboProducts: [],
    bogoDetails: {
      buyProduct: '',
      buyQty: 1,
      getProduct: '',
      getQty: 1
    },
    isActive: true,
    priority: 10
  });

  const [restaurants, setRestaurants] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRestaurantsData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchRestaurantsDropdown();
        setRestaurants(response.data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setRestaurants([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurantsData();
  }, []);

  useEffect(() => {
    const fetchProductsData = async () => {
      if (formData.applicableLevel === 'Product' && formData.applicableRestaurants?.length) {
        try {
          setIsLoading(true);
          const restaurantId = formData.applicableRestaurants[0];
          const response = await fetchProductsByRestaurant(restaurantId);
          
          const productsData = response.data || [];
          setAvailableProducts(productsData.map(p => ({
            id: p._id,
            name: p.name,
            price: p.price,
            restaurantId: restaurantId
          })));
        } catch (error) {
          console.error('Error fetching products:', error);
          setAvailableProducts([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setAvailableProducts([]);
      }
    };
    fetchProductsData();
  }, [formData.applicableLevel, formData.applicableRestaurants]);

  useEffect(() => {
    if (editingOffer) {
      // Transform backend data to frontend format
      const transformedOffer = {
        ...editingOffer,
        type: editingOffer.type.toLowerCase(),
        applicableRestaurants: editingOffer.applicableRestaurants || [],
        applicableProducts: editingOffer.applicableProducts || [],
        comboProducts: editingOffer.comboProducts || [],
        bogoDetails: editingOffer.bogoDetails || {
          buyProduct: '',
          buyQty: 1,
          getProduct: '',
          getQty: 1
        },
        validFrom: editingOffer.validFrom.split('T')[0],
        validTill: editingOffer.validTill.split('T')[0],
        createdBy: editingOffer.createdBy.toLowerCase()
      };
      setFormData(transformedOffer);
    }
  }, [editingOffer]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (parentField, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  };

  const handleRestaurantChange = (restaurantId, checked) => {
    const updated = checked 
      ? [...formData.applicableRestaurants, restaurantId]
      : formData.applicableRestaurants.filter(id => id !== restaurantId);
    
    setFormData(prev => ({ 
      ...prev, 
      applicableRestaurants: updated,
      applicableProducts: [] // Reset products when restaurants change
    }));
  };

  const handleProductChange = (productId, checked) => {
    const updated = checked 
      ? [...formData.applicableProducts, productId]
      : formData.applicableProducts.filter(id => id !== productId);
    
    handleInputChange('applicableProducts', updated);
  };

  const addComboGroup = () => {
    const newGroup = {
      name: '',
      products: [],
      comboPrice: 0
    };
    handleInputChange('comboProducts', [...formData.comboProducts, newGroup]);
  };

  const updateComboGroup = (index, field, value) => {
    const updated = [...formData.comboProducts];
    updated[index] = { ...updated[index], [field]: value };
    handleInputChange('comboProducts', updated);
  };

  const removeComboGroup = (index) => {
    const updated = formData.comboProducts.filter((_, i) => i !== index);
    handleInputChange('comboProducts', updated);
  };

  const addProductToCombo = (comboIndex) => {
    const updated = [...formData.comboProducts];
    updated[comboIndex].products = [...updated[comboIndex].products, { product: '', quantity: 1 }];
    handleInputChange('comboProducts', updated);
  };

  const removeProductFromCombo = (comboIndex, productIndex) => {
    const updated = [...formData.comboProducts];
    updated[comboIndex].products = updated[comboIndex].products.filter((_, i) => i !== productIndex);
    handleInputChange('comboProducts', updated);
  };

  const updateComboProduct = (comboIndex, productIndex, field, value) => {
  const updated = [...formData.comboProducts];
  const product = updated[comboIndex].products[productIndex];
    
    if (field === 'product') {
    updated[comboIndex].products[productIndex] = { 
      ...product, 
      product: value 
    };
    } else if (field === 'quantity') {
    updated[comboIndex].products[productIndex] = { 
      ...product, 
      quantity: Math.max(1, parseInt(value) || 1)  // ✅ fixed parenthesis
    };
  }

  handleInputChange('comboProducts', updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Transform data for backend
    const offerData = {
      ...formData,
      type: formData.type.toLowerCase(),
      createdBy: formData.createdBy.toLowerCase(),
      validFrom: new Date(formData.validFrom).toISOString(),
      validTill: new Date(formData.validTill).toISOString(),
      // Ensure numeric fields are numbers
      minOrderValue: Number(formData.minOrderValue) || 0,
      discountValue: Number(formData.discountValue) || 0,
      maxDiscount: Number(formData.maxDiscount) || 0,
      usageLimitPerUser: Number(formData.usageLimitPerUser) || 1,
      totalUsageLimit: Number(formData.totalUsageLimit) || 0,
      priority: Number(formData.priority) || 10,
      // Transform combo products structure
      comboProducts: formData.comboProducts.map(group => ({
        name: group.name,
        products: group.products.map(p => ({
          product: p.product,
          quantity: p.quantity
        })),
        comboPrice: Number(group.comboPrice) || 0
      })),
      // Transform BOGO details
      bogoDetails: formData.type === 'bogo' ? {
        buyProduct: formData.bogoDetails.buyProduct,
        getProduct: formData.bogoDetails.getProduct,
        buyQty: Number(formData.bogoDetails.buyQty) || 1,
        getQty: Number(formData.bogoDetails.getQty) || 1
      } : undefined
    };

    onSave(offerData);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bgOp flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {editingOffer ? 'Edit Offer' : 'Create New Offer'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter offer title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter description"
            />
          </div>
        </div>

        {/* Priority Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority (Lower number = higher priority)
          </label>
          <input
            type="number"
            min="1"
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="10"
          />
        </div>

        {/* Applicable Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Applicable Level *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="applicableLevel"
                value="Restaurant"
                checked={formData.applicableLevel === 'Restaurant'}
                onChange={(e) => handleInputChange('applicableLevel', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Restaurant</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="applicableLevel"
                value="Product"
                checked={formData.applicableLevel === 'Product'}
                onChange={(e) => handleInputChange('applicableLevel', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Product</span>
            </label>
          </div>
        </div>

        {/* Restaurant Level Fields */}
        {formData.applicableLevel === 'Restaurant' && (
          <div className="space-y-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            {/* Restaurant Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Restaurants *
              </label>
              {restaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {restaurants.map(restaurant => (
                    <label key={restaurant._id} className="flex items-center p-3 bg-white rounded-md border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                        checked={formData.applicableRestaurants.includes(restaurant._id)}
                        onChange={(e) => handleRestaurantChange(restaurant._id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                      <div className="ml-3 flex flex-col">
                        <span className="text-sm font-medium text-gray-700">{restaurant.name}</span>
                      </div>
                  </label>
                ))}
              </div>
              ) : (
                <div className="text-sm text-gray-500">
                  {isLoading ? 'Loading restaurants...' : 'No restaurants available'}
                </div>
              )}
            </div>

            {/* Restaurant-level form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Value *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.minOrderValue}
                  onChange={(e) => handleInputChange('minOrderValue', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="₹ 0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Offer Type *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="flat"
                      checked={formData.type === 'flat'}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Flat (₹)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="percentage"
                      checked={formData.type === 'percentage'}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Percentage (%)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.type === 'percentage' ? 'Discount Percentage *' : 'Discount Amount *'}
                </label>
                <input
                  type="number"
                  min="0"
                  step={formData.type === 'percentage' ? '0.1' : '0.01'}
                  required={['flat', 'percentage'].includes(formData.type)}
                  value={formData.discountValue}
                  onChange={(e) => handleInputChange('discountValue', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder={formData.type === 'percentage' ? "%" : "₹"}
                />
              </div>

              {formData.type === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Discount ₹
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maxDiscount}
                    onChange={(e) => handleInputChange('maxDiscount', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="₹ 0"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Level Fields */}
        {formData.applicableLevel === 'Product' && (
          <div className="space-y-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            {/* Restaurant Selection for Products */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Restaurant *
              </label>
              <select
                required
                value={formData.applicableRestaurants[0] || ''}
                onChange={(e) => {
                  const selectedRestaurant = e.target.value;
                  handleInputChange('applicableRestaurants', selectedRestaurant ? [selectedRestaurant] : []);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Choose Restaurant</option>
                {restaurants.map(restaurant => (
                  <option key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Selection */}
            {availableProducts.length > 0 ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Products *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
                  {availableProducts.map(product => (
                    <label key={product.id} className="flex items-center p-3 bg-white rounded-md border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.applicableProducts.includes(product.id)}
                        onChange={(e) => handleProductChange(product.id, e.target.checked)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">{product.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                {isLoading ? 'Loading products...' : 
                 formData.applicableRestaurants.length === 0 ? 'Select a restaurant first' : 
                 'No products available for selected restaurant'}
              </div>
            )}

            {/* Offer Type */}
            {(formData.applicableProducts?.length || 0) > 0 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Offer Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['flat', 'percentage', 'combo', 'bogo'].map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value={type}
                          checked={formData.type === type}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Flat/Percentage Offer Fields */}
                {(formData.type === 'flat' || formData.type === 'percentage') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white rounded-md border border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.type === 'percentage' ? 'Discount Percentage *' : 'Discount Amount *'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step={formData.type === 'percentage' ? '0.1' : '0.01'}
                        required
                        value={formData.discountValue}
                        onChange={(e) => handleInputChange('discountValue', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        placeholder={formData.type === 'percentage' ? "%" : "₹"}
                      />
                    </div>

                    {formData.type === 'percentage' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Discount ₹
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.maxDiscount}
                          onChange={(e) => handleInputChange('maxDiscount', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                          placeholder="₹ 0"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Combo Offer Fields */}
                {formData.type === 'combo' && (
                  <div className="space-y-8">
                    {formData.comboProducts.map((combo, comboIndex) => (
                      <div key={comboIndex} className="p-4 bg-white rounded-md border border-gray-200 space-y-6">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-800">Combo Group {comboIndex + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removeComboGroup(comboIndex)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Combo Name *
                            </label>
                            <input
                              type="text"
                            required
                              value={combo.name}
                            onChange={e => updateComboGroup(comboIndex, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                              placeholder="Enter combo name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Combo Price ₹ *
                            </label>
                            <input
                              type="number"
                            min="0"
                            step="0.01"
                            required
                              value={combo.comboPrice}
                            onChange={e => updateComboGroup(comboIndex, 'comboPrice', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                              placeholder="₹ 0"
                            />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Products in Combo *
                          </label>
                          <button
                            type="button"
                            onClick={() => addProductToCombo(comboIndex)}
                            className="mb-2 px-3 py-1.5 bg-blue-50 border border-blue-300 text-blue-700 rounded hover:bg-blue-100 text-sm font-medium"
                          >
                            + Add Product
                          </button>
                          
                          <div className="space-y-4">
                            {combo.products.map((product, productIndex) => (
                              <div key={productIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product
                                  </label>
                                  <select
                                    value={product.product}
                                    onChange={e => updateComboProduct(comboIndex, productIndex, 'product', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                  >
                                    <option value="">Select Product</option>
                                    {availableProducts.map(p => (
                                      <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={product.quantity}
                                    onChange={e => updateComboProduct(comboIndex, productIndex, 'quantity', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                  />
                                </div>
                                
                                <div className="flex items-end">
                                  <button
                                    type="button"
                                    onClick={() => removeProductFromCombo(comboIndex, productIndex)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addComboGroup}
                      className="inline-flex items-center px-3 py-1.5 border border-emerald-300 text-sm font-medium rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Combo Group
                    </button>
                  </div>
                )}

                {/* BOGO Offer Fields */}
                {formData.type === 'bogo' && (
                  <div className="p-4 bg-white rounded-md border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">Buy One Get One Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Buy Product *
                        </label>
                        <select
                          value={formData.bogoDetails.buyProduct}
                          onChange={(e) => handleNestedInputChange('bogoDetails', 'buyProduct', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                          required
                        >
                          <option value="">Select Product</option>
                          {availableProducts.map(product => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Buy Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.bogoDetails.buyQty}
                          onChange={(e) => handleNestedInputChange('bogoDetails', 'buyQty', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Get Product *
                        </label>
                        <select
                          value={formData.bogoDetails.getProduct}
                          onChange={(e) => handleNestedInputChange('bogoDetails', 'getProduct', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                          required
                        >
                          <option value="">Select Product</option>
                          {availableProducts.map(product => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Get Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.bogoDetails.getQty}
                          onChange={(e) => handleNestedInputChange('bogoDetails', 'getQty', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Common Fields */}
        <div className="space-y-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-900">Offer Period</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid From *
              </label>
              <input
                type="date"
                required
                value={formData.validFrom}
                onChange={(e) => handleInputChange('validFrom', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid Till *
              </label>
              <input
                type="date"
                required
                value={formData.validTill}
                onChange={(e) => handleInputChange('validTill', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usage Limit Per User
              </label>
              <input
                type="number"
                min="0"
                value={formData.usageLimitPerUser}
                onChange={(e) => handleInputChange('usageLimitPerUser', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="0 = Unlimited"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Usage Limit
              </label>
              <input
                type="number"
                min="0"
                value={formData.totalUsageLimit}
                onChange={(e) => handleInputChange('totalUsageLimit', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="0 = Unlimited"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Created By *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="createdBy"
                  value="admin"
                  checked={formData.createdBy === 'admin'}
                  onChange={(e) => handleInputChange('createdBy', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Admin</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="createdBy"
                  value="restaurant"
                  checked={formData.createdBy === 'restaurant'}
                  onChange={(e) => handleInputChange('createdBy', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Restaurant</span>
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Active Offer</span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Cancel
          </button>
          
          <button
            type="submit"
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Offer
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfferForm;