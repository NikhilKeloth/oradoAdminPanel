import React, { useState } from 'react';
import { X, Plus, ChevronDown } from 'lucide-react';

const IncentivePlanModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    planType: 'daily',
    targetType: 'delivery_fee',
    condition: '>=',
    thresholdAmount: '',
    incentiveAmount: '',
    effectiveFrom: '',
    effectiveTo: '',
    cities: ['All'],
  });

  const [showCitiesDropdown, setShowCitiesDropdown] = useState(false);

  const cityOptions = ['All', 'Kochi', 'Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Kolkata'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.thresholdAmount || !formData.incentiveAmount || !formData.effectiveFrom) return;
    
  onSubmit({
  planType: formData.planType,
  targetType: formData.targetType,
  condition: formData.condition,
  thresholdAmount: parseFloat(formData.thresholdAmount),
  incentiveAmount: parseFloat(formData.incentiveAmount),
  effectiveFrom: formData.effectiveFrom,
  effectiveTo: formData.effectiveTo || null,
  applyToAllCities: formData.cities.includes('All'),
  cities: formData.cities.includes('All') ? [] : formData.cities,
});

    
    // Reset form
    setFormData({
      planType: 'daily',
      targetType: 'delivery_fee',
      condition: '>=',
      thresholdAmount: '',
      incentiveAmount: '',
      effectiveFrom: '',
      effectiveTo: '',
      cities: ['All'],
    });
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCityToggle = (city) => {
    if (city === 'All') {
      setFormData(prev => ({ ...prev, cities: ['All'] }));
    } else {
      setFormData(prev => {
        const newCities = prev.cities.includes('All') 
          ? [city]
          : prev.cities.includes(city)
            ? prev.cities.filter(c => c !== city)
            : [...prev.cities, city];
        
        return { ...prev, cities: newCities.length === 0 ? ['All'] : newCities };
      });
    }
  };

  const getSelectedCitiesText = () => {
    if (formData.cities.includes('All')) return 'All Cities';
    if (formData.cities.length === 0) return 'Select Cities';
    if (formData.cities.length === 1) return formData.cities[0];
    return `${formData.cities.length} cities selected`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add New Incentive Plan</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Type
              </label>
              <select
                value={formData.planType}
                onChange={(e) => handleInputChange('planType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Target Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Type
              </label>
              <select
                value={formData.targetType}
                onChange={(e) => handleInputChange('targetType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                disabled
              >
                <option value="delivery_fee">Delivery Fee</option>
              </select>
            </div>

            {/* Condition and Threshold Amount */}
            <div className="flex gap-3">
              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  disabled
                >
                  <option value=">=">&gt;=</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Threshold Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.thresholdAmount}
                  onChange={(e) => handleInputChange('thresholdAmount', e.target.value)}
                  placeholder="Enter threshold amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Incentive Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incentive Amount (₹)
              </label>
              <input
                type="number"
                value={formData.incentiveAmount}
                onChange={(e) => handleInputChange('incentiveAmount', e.target.value)}
                placeholder="Enter incentive amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="0"
                step="0.01"
              />
            </div>

            {/* Effective From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective From
              </label>
              <input
                type="date"
                value={formData.effectiveFrom}
                onChange={(e) => handleInputChange('effectiveFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Effective To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective To <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="date"
                value={formData.effectiveTo}
                onChange={(e) => handleInputChange('effectiveTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={formData.effectiveFrom}
              />
            </div>

            {/* Cities Multi-select */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cities
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCitiesDropdown(!showCitiesDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
                >
                  <span className="text-gray-900">{getSelectedCitiesText()}</span>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-400 transition-transform ${showCitiesDropdown ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                {showCitiesDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {cityOptions.map((city) => (
                      <label
                        key={city}
                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.cities.includes(city)}
                          onChange={() => handleCityToggle(city)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-900">{city}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncentivePlanModal;