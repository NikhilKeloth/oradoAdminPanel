import { useState, useEffect } from 'react';
import { FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa';

const ProductWiseDiscount = ({ 
  onClose, 
  onSave,
  initialData = null,
  products = [
    'shawarma',
    'Guilt Free Goodness',
    'Fit for a King Smoothie',
    'Immune Charger Juice',
    'Green Beans and Chicken',
    'Beef Pastrami Sourdough Sandwich',
    'Zuchinni rolls'
  ]
}) => {
  const [formData, setFormData] = useState({
    discountName: '',
    discountValue: '',
    description: '',
    maxAmount: '',
    fromDate: '',
    tillDate: '',
    discountOnAddon: false,
    selectedProducts: []
  });

  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        discountName: initialData.name || '',
        discountValue: initialData.value || '',
        description: initialData.description || '',
        maxAmount: initialData.maxAmount || '',
        fromDate: initialData.fromDate || '',
        tillDate: initialData.tillDate || '',
        discountOnAddon: initialData.discountOnAddon || false,
        selectedProducts: initialData.selectedProducts || []
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleProductSelection = (product) => {
    setFormData(prev => {
      const newSelected = prev.selectedProducts.includes(product)
        ? prev.selectedProducts.filter(p => p !== product)
        : [...prev.selectedProducts, product];
      return { ...prev, selectedProducts: newSelected };
    });
  };

  const toggleSelectAll = () => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.length === products.length ? [] : [...products]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: formData.discountName,
      value: formData.discountValue,
      description: formData.description,
      maxAmount: formData.maxAmount,
      fromDate: formData.fromDate,
      tillDate: formData.tillDate,
      discountOnAddon: formData.discountOnAddon,
      selectedProducts: formData.selectedProducts
    });
  };

  const filteredProducts = products.filter(product =>
    product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div 
        className="modal-content bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
      >
        <div className="modal-header p-4 border-b border-gray-200 flex justify-between items-center">
          <h4 className="modal-title text-lg font-semibold">
            {initialData ? 'Edit Discount' : 'Add Discount'}
          </h4>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <div className="modal-body p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Language Field */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <div className="relative">
                  <select 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 bg-gray-100 cursor-not-allowed"
                    disabled
                  >
                    <option>English</option>
                  </select>
                  <FaChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-3" />
                </div>
              </div>

              {/* Discount Name */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="discountName"
                  value={formData.discountName}
                  onChange={handleInputChange}
                  maxLength={100}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              {/* Discount Value */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description max 150 characters <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={150}
                  rows={2}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              {/* Select Product */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Product <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="relative">
                    <input
                      readOnly
                      value={`${formData.selectedProducts.length} out of ${products.length} selected`}
                      onClick={() => setShowProductDropdown(!showProductDropdown)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 cursor-pointer"
                      required
                    />
                    <FaChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-3" />
                  </div>

                  {showProductDropdown && (
                    <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300">
                      <div className="p-2 border-b border-gray-200 flex items-center">
                        <input
                          type="text"
                          placeholder="Search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="flex-1 px-2 py-1 border-none focus:outline-none"
                        />
                        <FaSearch className="h-4 w-4 text-gray-400 ml-2" />
                      </div>
                      <div className="p-2 border-b border-gray-200 flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.selectedProducts.length === products.length}
                          onChange={toggleSelectAll}
                          className="mr-2"
                        />
                        <span>Select All</span>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredProducts.map((product, index) => (
                          <div key={index} className="p-2 border-b border-gray-200 flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.selectedProducts.includes(product)}
                              onChange={() => toggleProductSelection(product)}
                              className="mr-2"
                            />
                            <span>{product}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => setShowProductDropdown(false)}
                          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Max Amount */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  max amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="maxAmount"
                  value={formData.maxAmount}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              {/* From Date */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  from <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              {/* Till Date */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Till <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="tillDate"
                  value={formData.tillDate}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              {/* Discount on Addon */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount on Addon
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="discountOnAddon"
                    checked={formData.discountOnAddon}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer p-4 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            {initialData ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductWiseDiscount;