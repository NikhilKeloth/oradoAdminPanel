import React, { useState } from 'react';
import { FiSend, FiClock, FiRepeat, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import apiClient from '../../../../apis/apiClient/apiClient';

const CustomerCampaigns = () => {
  const [formData, setFormData] = useState({
    campaignName: '',
    channelType: '',
    messageTitle: '',
    description: '',
    campaignType: 'now',
    scheduledTime: '',
    recurringInterval: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const channelTypes = [
    { id: 'support', label: 'Support', icon: '💬' },
    { id: 'promotional', label: 'Promotional', icon: '🎉' },
    { id: 'popup', label: 'Popup', icon: '🪟' },
    { id: 'web_push', label: 'Web Push', icon: '📱' },
  ];

  const campaignTypes = [
    { id: 'now', label: 'Send Now', icon: <FiSend className="mr-2" /> },
    { id: 'later', label: 'Schedule', icon: <FiClock className="mr-2" /> },
    { id: 'recurring', label: 'Recurring', icon: <FiRepeat className="mr-2" /> }
  ];

  const recurringIntervals = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendCampaign = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Basic validation
      if (!formData.campaignName || !formData.channelType || !formData.messageTitle || !formData.description) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.campaignType === 'later' && !formData.scheduledTime) {
        throw new Error('Please select a schedule time');
      }

      if (formData.campaignType === 'recurring' && !formData.recurringInterval) {
        throw new Error('Please select a recurring interval');
      }

      await apiClient.post('/campaign', {
        name: formData.campaignName,
        description: formData.description,
        channelType: formData.channelType,
        messageTitle: formData.messageTitle,
        messageBody: formData.description,
        segment: 'frequent_customers',
        campaignType: formData.campaignType,
        scheduledTime: formData.campaignType === 'later' ? formData.scheduledTime : null,
        recurringInterval: formData.campaignType === 'recurring' ? formData.recurringInterval : null,
      });

      setSuccess(true);
      // Reset form
      setFormData({
        campaignName: '',
        channelType: '',
        messageTitle: '',
        description: '',
        campaignType: 'now',
        scheduledTime: '',
        recurringInterval: ''
      });

    } catch (err) {
      console.error('Error creating campaign:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Campaign</h1>
          <p className="text-gray-600">Fill in the details below to launch your marketing campaign</p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r flex items-start">
            <FiAlertCircle className="text-red-500 text-xl mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r flex items-start">
            <FiCheckCircle className="text-green-500 text-xl mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-800">Success!</h3>
              <p className="text-green-600">Your campaign has been created successfully.</p>
            </div>
          </div>
        )}

        {/* Form Sections */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          {/* Campaign Basics */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Campaign Basics</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
              <input
                type="text"
                name="campaignName"
                value={formData.campaignName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Summer Sale 2023"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Channel Type *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {channelTypes.map((channel) => (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => setFormData({...formData, channelType: channel.id})}
                    className={`p-3 rounded-lg border flex flex-col items-center transition-all ${
                      formData.channelType === channel.id 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl mb-1">{channel.icon}</span>
                    <span className="text-sm font-medium">{channel.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Scheduling</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Type *</label>
              <div className="flex flex-wrap gap-3">
                {campaignTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({...formData, campaignType: type.id})}
                    className={`px-4 py-3 rounded-lg border flex items-center transition-all ${
                      formData.campaignType === type.id 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {type.icon}
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {formData.campaignType === 'later' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date & Time *</label>
                <input
                  type="datetime-local"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}

            {formData.campaignType === 'recurring' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recurring Interval *</label>
                <select
                  name="recurringInterval"
                  value={formData.recurringInterval}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an interval</option>
                  {recurringIntervals.map(interval => (
                    <option key={interval.id} value={interval.id}>{interval.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Message Content */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Message Content</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Title *</label>
              <input
                type="text"
                name="messageTitle"
                value={formData.messageTitle}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a compelling title"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write your campaign message here..."
                rows={5}
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSendCampaign}
                disabled={isLoading}
                className={`px-6 py-3 rounded-lg text-white font-medium flex items-center transition-colors ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    Launch Campaign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCampaigns;