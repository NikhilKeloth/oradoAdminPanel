import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, RefreshCw } from 'lucide-react';
import { addTax, deleteTax, editTax, getAllTaxes, toggleTaxStatus } from '../../../apis/adminApis/taxApi';

const TaxManagementPanel = () => {
  const [taxes, setTaxes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState(null);

 useEffect(() => {
  const loadTaxes = async () => {
    try {
      setIsLoading(true);
      const response = await getAllTaxes();
      const formattedTaxes = response.data.map(tax => ({
        _id: tax._id,
        name: tax.name || 'Unnamed Tax',
        percentage: tax.rate || tax.percentage || 0,
        applicableFor: tax.category || tax.applicableFor || 'other',
        active: tax.isActive !== undefined ? tax.isActive : tax.active || false, // Ensure proper fallback
        createdAt: tax.createdAt || new Date().toISOString()
      }));
      setTaxes(formattedTaxes);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading taxes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  loadTaxes();
}, []);
  const categories = [
    { value: 'food', label: 'Food Items', color: 'bg-green-100 text-green-800' },
    { value: 'beverages', label: 'Beverages', color: 'bg-blue-100 text-blue-800' },
    { value: 'meat', label: 'Meat Products', color: 'bg-red-100 text-red-800' },
    { value: 'grocery', label: 'Grocery', color: 'bg-purple-100 text-purple-800' },
    { value: 'deliveryFee', label: 'Delivery Fee', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'commission', label: 'Commission', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'agent', label: 'Agent Fee', color: 'bg-pink-100 text-pink-800' },
  ];

  const getCategoryInfo = (value) => categories.find(cat => cat.value === value) || { label: value, color: 'bg-gray-100 text-gray-800' };

  const filteredTaxes = taxes.filter(tax => {
    if (!tax) return false;
    
    const taxName = tax.name?.toLowerCase() || '';
    const categoryLabel = getCategoryInfo(tax.applicableFor).label?.toLowerCase() || '';
    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearch = taxName.includes(searchTermLower) || 
                         categoryLabel.includes(searchTermLower);
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && tax.active) || 
                         (filterStatus === 'inactive' && !tax.active);
    
    const matchesCategory = filterCategory === 'all' || tax.applicableFor === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleAddTax = () => {
    setEditingTax(null);
    setIsModalOpen(true);
  };

  const handleEditTax = (tax) => {
    setEditingTax(tax);
    setIsModalOpen(true);
  };

  const handleDeleteTax = async (id) => {
    if (window.confirm('Are you sure you want to delete this tax?')) {
      try {
        await deleteTax(id);
        setTaxes(prevTaxes => prevTaxes.filter(tax => tax._id !== id));
      } catch (error) {
        console.error('Error deleting tax:', error);
        alert('Failed to delete tax. Please try again.');
      }
    }
  };

const handleToggleStatus = async (taxId) => {
  try {
    const { data } = await toggleTaxStatus(taxId); // Destructure the response
    console.log("Updated tax data:", data); // Verify the structure
    
    setTaxes(taxes.map(tax => 
      tax._id === taxId 
        ? { ...tax, active: data.active } // Use data.active from response
        : tax
    ));
  } catch (error) {
    console.error('Error toggling tax status:', error);
    alert('Failed to toggle tax status. Please try again.');
  }
};
const handleSaveTax = async (taxData) => {
  try {
    setApiError(null);
    if (taxData._id) {
      // Editing existing tax
      console.log("Editing tax with data:", taxData);
      const updatedTax = await editTax({
        _id: taxData._id,
        name: taxData.name,
        applicableFor: taxData.applicableFor,
        percentage: taxData.percentage
      });
      
      setTaxes(taxes.map(tax => 
        tax._id === taxData._id 
          ? { 
              ...tax, 
              name: updatedTax.data.name,
              applicableFor: updatedTax.data.applicableFor,
              percentage: updatedTax.data.percentage
            }
          : tax
      ));
    } else {
      // Adding new tax
      console.log("Adding new tax with data:", taxData);
      const response = await addTax({
        name: taxData.name,
        applicableFor: taxData.applicableFor,
        percentage: taxData.percentage
      });
      
      setTaxes([...taxes, {
        _id: response.data._id,
        name: response.data.name,
        applicableFor: response.data.applicableFor,
        percentage: response.data.percentage,
        active: true,
        createdAt: new Date().toISOString()
      }]);
    }
    setIsModalOpen(false);
  } catch (error) {
    console.error("Failed to save tax:", error);
    setApiError(error.response?.data?.message || "Failed to save tax");
  }
};


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tax Management</h1>
              <p className="text-gray-600 mt-1">Manage taxes for your food delivery platform</p>
            </div>
            <button
              onClick={handleAddTax}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Tax
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search taxes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Filter className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Taxes</p>
                <p className="text-2xl font-bold text-gray-900">{taxes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-6 h-6 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Taxes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {taxes.filter(tax => tax.active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <div className="w-6 h-6 bg-yellow-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Inactive Taxes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {taxes.filter(tax => !tax.active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(taxes.map(tax => tax.applicableFor)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Tax Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Percentage</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTaxes.map(tax => {
                  const categoryInfo = getCategoryInfo(tax.applicableFor);
                  return (
                    <tr key={tax._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{tax.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-semibold text-gray-900">{tax.percentage}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                          {categoryInfo.label}
                        </span>
                      </td>
                     <td className="px-6 py-4">
  <label htmlFor={`toggle-${tax._id}`} className="flex items-center cursor-pointer">
    <div className="relative">
      <input
        type="checkbox"
        id={`toggle-${tax._id}`}
        className="sr-only"
        checked={tax.active}
        onChange={() => handleToggleStatus(tax._id)}
      />
      <div className={`block w-10 h-6 rounded-full transition-colors ${
        tax.active ? 'bg-green-500' : 'bg-gray-300'
      }`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
        tax.active ? 'transform translate-x-4' : ''
      }`}></div>
    </div>
    <div className="ml-3 text-sm font-medium text-gray-700">
      {tax.active ? 'Active' : 'Inactive'}
    </div>
  </label>
</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(tax.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditTax(tax)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Tax"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTax(tax._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Tax"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredTaxes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Filter className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No taxes found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <TaxModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTax}
          taxToEdit={editingTax}
          categories={categories}
          apiError={apiError}
        />
      )}
    </div>
  );
};

const TaxModal = ({ isOpen, onClose, onSave, taxToEdit, categories, apiError }) => {
  const [formData, setFormData] = useState({
    name: '',
    percentage: '',
    applicableFor: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (taxToEdit) {
      setFormData({
        name: taxToEdit.name,
        percentage: taxToEdit.percentage.toString(),
        applicableFor: taxToEdit.applicableFor
      });
    } else {
      setFormData({ name: '', percentage: '', applicableFor: '' });
    }
    setErrors({});
  }, [taxToEdit, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tax name is required';
    }
    
    if (!formData.percentage) {
      newErrors.percentage = 'Percentage is required';
    } else if (isNaN(formData.percentage) || formData.percentage < 0 || formData.percentage > 100) {
      newErrors.percentage = 'Percentage must be between 0 and 100';
    }
    
    if (!formData.applicableFor) {
      newErrors.applicableFor = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = (e) => {
  e.preventDefault();
  if (validateForm()) {
    onSave({
      // Include _id when editing
      ...(taxToEdit && { _id: taxToEdit._id }),
      name: formData.name.trim(),
      applicableFor: formData.applicableFor,
      percentage: parseFloat(formData.percentage)
    });
  }
};
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bgOp flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {taxToEdit ? 'Edit Tax' : 'Add New Tax'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {apiError && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg">
              {apiError}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Food GST"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Percentage (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100" 
              value={formData.percentage}
              onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
              placeholder="0.00"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.percentage ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.percentage && <p className="mt-1 text-sm text-red-600">{errors.percentage}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Applies To
            </label>
            <select
              value={formData.applicableFor}
              onChange={(e) => setFormData({ ...formData, applicableFor: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.applicableFor ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {errors.applicableFor && <p className="mt-1 text-sm text-red-600">{errors.applicableFor}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {taxToEdit ? 'Update Tax' : 'Add Tax'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaxManagementPanel;