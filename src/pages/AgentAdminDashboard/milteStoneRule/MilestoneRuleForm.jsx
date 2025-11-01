import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Package, MapPin, Star, Clock, Bell, TestTube } from 'lucide-react';

const MilestoneRuleForm = ({ rule, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    levelName: 'Bronze',
    minOrders: '',
    minDeliveryDistance: '',
    customerRatingsThreshold: '',
    minWorkingHours: '',
    startDate: '',
    endDate: '',
    isActive: true,
    notificationEnabled: true,
    abTestGroup: 'A',
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        levelName: rule.levelName,
        minOrders: rule.minOrders.toString(),
        minDeliveryDistance: rule.minDeliveryDistance.toString(),
        customerRatingsThreshold: rule.customerRatingsThreshold.toString(),
        minWorkingHours: rule.minWorkingHours.toString(),
        startDate: rule.startDate,
        endDate: rule.endDate,
        isActive: rule.isActive,
        notificationEnabled: rule.notificationEnabled,
        abTestGroup: rule.abTestGroup,
      });
    }
  }, [rule]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      levelName: formData.levelName,
      minOrders: parseInt(formData.minOrders),
      minDeliveryDistance: parseFloat(formData.minDeliveryDistance),
      customerRatingsThreshold: parseFloat(formData.customerRatingsThreshold),
      minWorkingHours: parseInt(formData.minWorkingHours),
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: formData.isActive,
      notificationEnabled: formData.notificationEnabled,
      abTestGroup: formData.abTestGroup,
    });
    
    // Reset form
    setFormData({
      levelName: 'Bronze',
      minOrders: '',
      minDeliveryDistance: '',
      customerRatingsThreshold: '',
      minWorkingHours: '',
      startDate: '',
      endDate: '',
      isActive: true,
      notificationEnabled: true,
      abTestGroup: 'A',
    });
  };

  const handleReset = () => {
    setFormData({
      levelName: 'Bronze',
      minOrders: '',
      minDeliveryDistance: '',
      customerRatingsThreshold: '',
      minWorkingHours: '',
      startDate: '',
      endDate: '',
      isActive: true,
      notificationEnabled: true,
      abTestGroup: 'A',
    });
    onCancel();
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Bronze': return 'bg-amber-100 text-amber-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'Bronze': return '🥉';
      case 'Silver': return '🥈';
      case 'Gold': return '🥇';
      case 'Platinum': return '💎';
      default: return '🏆';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {rule ? 'Edit Milestone Rule' : 'Create New Milestone Rule'}
        </h2>
        {rule && (
          <button
            onClick={handleReset}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🏆 Level Name
          </label>
          <select
            value={formData.levelName}
            onChange={(e) => setFormData({ ...formData, levelName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Bronze">Bronze</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>
          <div className="mt-2">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(formData.levelName)}`}>
              {getLevelIcon(formData.levelName)} {formData.levelName}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📦 Minimum Orders
            </label>
            <input
              type="number"
              value={formData.minOrders}
              onChange={(e) => setFormData({ ...formData, minOrders: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🌟 Minimum Delivery KM
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.minDeliveryDistance}
              onChange={(e) => setFormData({ ...formData, minDeliveryDistance: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 100.5"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⭐ Rating Threshold
            </label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formData.customerRatingsThreshold}
              onChange={(e) => setFormData({ ...formData, customerRatingsThreshold: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 4.2"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Rating from 1 to 5 stars</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⏱ Minimum Working Hours
            </label>
            <input
              type="number"
              value={formData.minWorkingHours}
              onChange={(e) => setFormData({ ...formData, minWorkingHours: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 160"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active Status
              </label>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              formData.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {formData.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notificationEnabled"
                checked={formData.notificationEnabled}
                onChange={(e) => setFormData({ ...formData, notificationEnabled: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="notificationEnabled" className="ml-2 block text-sm text-gray-700">
                🔔 Milestone Achievement Notifications
              </label>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              formData.notificationEnabled 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {formData.notificationEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🧪 A/B Testing Group
            </label>
            <select
              value={formData.abTestGroup}
              onChange={(e) => setFormData({ ...formData, abTestGroup: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="A">Group A</option>
              <option value="B">Group B</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">Assign agents to different testing groups for milestone rules</p>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{rule ? 'Update Rule' : 'Create Rule'}</span>
          </button>
          {rule && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MilestoneRuleForm;