import React, { useState } from 'react';
import { X, DollarSign, Percent, AlertCircle, CheckCircle, Loader2, Globe } from 'lucide-react';

const MarketplaceAdditionalChargeModal = ({ 
  isOpen, 
  onClose, 
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    type: 'Fixed',
    applicableOn: 'All Orders',
    category: 'AdditionalCharge',
    level: 'Marketplace',
    status: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const CHARGE_TYPES = [
    { value: 'Fixed', label: 'Fixed Amount', icon: DollarSign },
    { value: 'Percentage', label: 'Percentage', icon: Percent }
  ];

  const APPLICABLE_OPTIONS = [
    { value: 'All Orders', label: 'All Orders' },
    { value: 'Food Items', label: 'Food Items' },
    { value: 'Groceries', label: 'Groceries' },
    { value: 'Meat', label: 'Meat' },
    { value: 'Delivery Fee', label: 'Delivery Fee' },
    { value: 'Packing Charge', label: 'Packing Charge' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Charge name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Charge name must be at least 2 characters';
    }

    if (!formData.value.trim()) {
      newErrors.value = 'Value is required';
    } else {
      const value = parseFloat(formData.value);
      if (isNaN(value) || value <= 0) {
        newErrors.value = 'Value must be a valid number greater than 0';
      } else if (formData.type === 'Percentage' && value > 100) {
        newErrors.value = 'Percentage cannot exceed 100%';
      }
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
        category: formData.category,
        level: formData.level,
        status: formData.status
      };

      await onSubmit(payload);
      setSubmitSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setErrors({
        general: error.message || 'Failed to create additional charge. Please try again.'
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
      category: 'AdditionalCharge',
      level: 'Marketplace',
      status: true
    });
    setErrors({});
    setSubmitSuccess(false);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bgOp flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Create Additional Charge</h2>
                <p className="text-blue-100 text-sm">Add a new marketplace-level additional charge</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-green-800 font-medium">Charge Created Successfully!</h3>
                <p className="text-green-700 text-sm">Redirecting...</p>
              </div>
            </div>
          )}

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Level Field (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
                <Globe className="h-5 w-5 text-gray-600" />
                <span className="font-medium">Marketplace</span>
              </div>
            </div>

            {/* Category Field (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-gray-600" />
                <span className="font-medium">Additional Charge</span>
              </div>
            </div>

            {/* Charge Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Charge Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g. Service Fee, Convenience Fee"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Charge Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Charge Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CHARGE_TYPES.map((chargeType) => {
                  const Icon = chargeType.icon;
                  return (
                    <button
                      key={chargeType.value}
                      type="button"
                      onClick={() => handleInputChange('type', chargeType.value)}
                      className={`p-4 border rounded-xl flex flex-col items-center space-y-2 transition-colors ${
                        formData.type === chargeType.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      } ${errors.type ? 'border-red-300 bg-red-50' : ''}`}
                      disabled={isSubmitting}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium text-sm">{chargeType.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.type && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.type}</span>
                </p>
              )}
            </div>

            {/* Charge Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Charge Value <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  placeholder={formData.type === 'Percentage' ? '0-100%' : '0.00'}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                    errors.value ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {formData.type && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {formData.type === 'Percentage' ? '%' : '$'}
                  </div>
                )}
              </div>
              {errors.value && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.value}</span>
                </p>
              )}
            </div>

            {/* Applicable On */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Applicable On <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.applicableOn}
                onChange={(e) => handleInputChange('applicableOn', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.applicableOn ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                {APPLICABLE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.applicableOn && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.applicableOn}</span>
                </p>
              )}
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="text-sm text-gray-500">Enable or disable this charge</p>
              </div>
              <button
                type="button"
                onClick={() => handleInputChange('status', !formData.status)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  formData.status ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                disabled={isSubmitting}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.status ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </form>
        </div>

        {/* Fixed Buttons at Bottom */}
        <div className="bg-gray-50 px-6 py-4 flex space-x-3 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || submitSuccess}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
              <span>Create Additional Charge</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceAdditionalChargeModal;