import React, { useState, useEffect } from 'react';
import { X, DollarSign, Percent, Package, AlertCircle, CheckCircle, Loader2, Box } from 'lucide-react';

const MerchantPackingChargeModal = ({ isOpen, onClose, onSubmit, merchant }) => {
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    type: 'Fixed',
    applicableOn: 'All Orders',
    status: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const CHARGE_TYPES = [
    { value: 'Fixed', label: 'Fixed Amount', icon: <DollarSign className="h-4 w-4" /> },
    { value: 'Percentage', label: 'Percentage', icon: <Percent className="h-4 w-4" /> },
  ];

  const APPLICABLE_ON_OPTIONS = [
    { value: 'All Orders', label: 'All Orders', icon: <Package className="h-4 w-4" /> },
    { value: 'Food Items', label: 'Food Items', icon: <Package className="h-4 w-4" /> },
    { value: 'Groceries', label: 'Groceries', icon: <Package className="h-4 w-4" /> },
    { value: 'Meat', label: 'Meat', icon: <Package className="h-4 w-4" /> }
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
    
    // Validate name
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }
    
    // Validate value
    if (!formData.value || isNaN(formData.value)) {
      newErrors.value = 'Value must be a valid number';
    } else if (parseFloat(formData.value) <= 0) {
      newErrors.value = 'Value must be greater than 0';
    } else if (formData.type === 'Percentage' && parseFloat(formData.value) > 100) {
      newErrors.value = 'Percentage cannot exceed 100%';
    }

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
        category: "PackingCharge",
        level: "Merchant"
      };

      await onSubmit(payload);
      setSubmitSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.message || error.message || 'Failed to create packing charge.' 
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
      type: 'Fixed',
      applicableOn: 'All Orders',
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
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Box className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Add Packing Charge</h2>
              <p className="text-green-100 text-sm">Configure packing charges for this merchant</p>
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
              <p className="text-green-800 font-medium">Packing Charge Added!</p>
            </div>
          )}

          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-800">{errors.general}</p>
            </div>
          )}

          {/* Name Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Charge Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter charge name (e.g., Standard Packing)"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
              maxLength={50}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            <p className="text-xs text-gray-500 mt-1">
              {formData.name.length}/50 characters
            </p>
          </div>

          {/* Value */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Charge Amount<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                placeholder={formData.type === 'Percentage' ? '0-100' : '0'}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
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
              Charge Type<span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CHARGE_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleInputChange('type', t.value)}
                  className={`flex items-center justify-center space-x-2 p-3 border rounded-xl ${
                    formData.type === t.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={isSubmitting}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Applicable On */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Applicable On<span className="text-red-500">*</span>
            </label>
            <select
              value={formData.applicableOn}
              onChange={(e) => handleInputChange('applicableOn', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.applicableOn ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              {APPLICABLE_ON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
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
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : submitSuccess ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Added!</span>
              </>
            ) : (
              <span>Add Charge</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MerchantPackingChargeModal;