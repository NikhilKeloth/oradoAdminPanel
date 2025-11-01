import React, { useState, useEffect } from 'react';
import { X, DollarSign, Percent, Package, AlertCircle, CheckCircle, Loader2, Store } from 'lucide-react';

const MerchantTaxModal = ({ isOpen, onClose, onSubmit, merchant }) => {
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    type: '',
    applicableOn: '',
    // merchant: merchant?._id || '',
    status: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const TAX_TYPES = [
    { value: 'Fixed', label: 'Fixed Amount', icon: <DollarSign className="h-4 w-4" /> },
    { value: 'Percentage', label: 'Percentage', icon: <Percent className="h-4 w-4" /> }
  ];

  const APPLICABLE_ON_OPTIONS = [
    { value: 'All Orders', label: 'All Orders', icon: <Package className="h-4 w-4" /> },
    { value: 'Food Items', label: 'Food Items', icon: <Package className="h-4 w-4" /> },
    { value: 'Groceries', label: 'Groceries', icon: <Store className="h-4 w-4" /> },
    { value: 'Meat', label: 'Meat', icon: <Package className="h-4 w-4" /> },
    { value: 'Delivery Fee', label: 'Delivery Fee', icon: <DollarSign className="h-4 w-4" /> },
    { value: 'Packing Charge', label: 'Packing Charge', icon: <DollarSign className="h-4 w-4" /> }
  ];

  useEffect(() => {
    if (merchant) {
      setFormData(prev => ({
        ...prev,
        merchant: merchant._id
      }));
    }
  }, [merchant]);

 const validateForm = () => {
  const newErrors = {};

  if (!formData.name.trim()) newErrors.name = 'Tax name is required';
  if (!formData.value || isNaN(formData.value)) newErrors.value = 'Value must be a valid number';
  if (parseFloat(formData.value) <= 0) newErrors.value = 'Value must be greater than 0';
  if (formData.type === 'Percentage' && parseFloat(formData.value) > 100) newErrors.value = 'Percentage cannot exceed 100%';
  if (!formData.type) newErrors.type = 'Type is required';
  if (!formData.applicableOn) newErrors.applicableOn = 'Applicable scope is required';

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        name: formData.name.trim(),
        value: parseFloat(formData.value),
        type: formData.type,
        applicableOn: formData.applicableOn,
        merchant: formData.merchant,
        status: formData.status,
        category: "Tax",
        level: "Merchant"
      };

      await onSubmit(payload);
      setSubmitSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.message || error.message || 'Failed to create tax.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setFormData({
      name: '',
      value: '',
      type: '',
      applicableOn: '',
      merchant: merchant?._id || '',
      status: true
    });
    setErrors({});
    setSubmitSuccess(false);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Create Merchant Tax</h2>
              <p className="text-blue-100 text-sm">Add a new merchant tax configuration</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            disabled={isSubmitting} 
            className="p-2 hover:bg-white/20 rounded-xl disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {submitSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800 font-medium">Tax Created Successfully!</p>
            </div>
          )}

          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-800">{errors.general}</p>
            </div>
          )}

          {/* Tax Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tax Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., GST, Service Tax"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Value */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Value<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                placeholder="0"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.value ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                min="0"
                step={formData.type === 'Percentage' ? '0.01' : '1'}
              />
              {formData.type === 'Percentage' && (
                <span className="absolute right-3 top-3.5 text-gray-500">%</span>
              )}
            </div>
            {errors.value && <p className="text-sm text-red-600 mt-1">{errors.value}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Type<span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {TAX_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleInputChange('type', t.value)}
                  className={`flex items-center justify-center space-x-2 p-3 border rounded-xl ${
                    formData.type === t.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  } ${errors.type ? 'border-red-300' : ''}`}
                  disabled={isSubmitting}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
            {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type}</p>}
          </div>

          {/* Applicable On */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Applicable On<span className="text-red-500">*</span>
            </label>
            <select
              value={formData.applicableOn}
              onChange={(e) => handleInputChange('applicableOn', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.applicableOn ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select Scope</option>
              {APPLICABLE_ON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {errors.applicableOn && <p className="text-sm text-red-600 mt-1">{errors.applicableOn}</p>}
          </div>

          {/* Status Toggle */}
          <div className="flex items-center space-x-3 pt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.status}
                onChange={(e) => handleInputChange('status', e.target.checked)}
                disabled={isSubmitting}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {formData.status ? 'Active' : 'Inactive'}
              </span>
            </label>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex space-x-3 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || submitSuccess}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : submitSuccess ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Created!</span>
              </>
            ) : (
              <span>Create Tax</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MerchantTaxModal;