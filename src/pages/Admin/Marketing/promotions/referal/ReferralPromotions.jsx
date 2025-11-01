import React, { useState, useEffect } from 'react';
import apiClient from '../../../../../apis/apiClient/apiClient';
import { toast } from 'react-toastify';

const ReferralPromotions = () => {
  const [formData, setFormData] = useState({
    language: 'English',
    referralType: 'percentage',
    referrerDiscountValue: '30.00',
    referrerMaxDiscountValue: '0',
    referrerDescription: 'Refer & get 30% off',
    refereeDiscountValue: '30.00',
    refereeMaxDiscountValue: '0',
    minOrderValue: '2.00',
    refereeDescription: 'Refer & get 30% off',
    status: true,
    referralCodeOnSignup: true,
    smartURL: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch referral settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get("/referal/referral-promotions");
        if (response.data && response.data.success) {
          setFormData(response.data.data);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Update descriptions when discount values change
    if (name === 'referrerDiscountValue' || name === 'refereeDiscountValue') {
      updateDescriptions(name, value);
    }
  };

  const updateDescriptions = (field, value) => {
    if (field === 'referrerDiscountValue') {
      setFormData(prev => ({
        ...prev,
        referrerDescription: prev.referralType === 'percentage' 
          ? `Refer & get ${value}% off` 
          : `Refer & get $${value} off`
      }));
    } else if (field === 'refereeDiscountValue') {
      setFormData(prev => ({
        ...prev,
        refereeDescription: prev.referralType === 'percentage' 
          ? `Refer & get ${value}% off` 
          : `Refer & get $${value} off`
      }));
    }
  };

  const handleReferralTypeChange = (e) => {
    const type = e.target.value;
    setFormData(prev => ({
      ...prev,
      referralType: type,
      referrerDescription: type === 'percentage' 
        ? `Refer & get ${prev.referrerDiscountValue}% off` 
        : `Refer & get $${prev.referrerDiscountValue} off`,
      refereeDescription: type === 'percentage' 
        ? `Refer & get ${prev.refereeDiscountValue}% off` 
        : `Refer & get $${prev.refereeDiscountValue} off`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const response = await apiClient.post("/referal/referral-promotions", formData);
      
      if (response.data && response.data.success) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center mb-8 pb-6 border-b border-gray-100">
        <div className="mr-4 bg-blue-50 p-3 rounded-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h4 className="text-2xl font-bold text-gray-900">Referral Promotions</h4>
          <p className="text-gray-500 mt-1">Manage your referral program settings and track performance</p>
        </div>
      </div>

      {/* Referral Settings Section */}
      <form onSubmit={handleSubmit}>
        <section className="mb-8 p-6 border border-gray-100 rounded-xl bg-gray-50">
          <div className="flex flex-col md:flex-row justify-between w-full mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Referral Program Settings</h2>
              <p className="text-gray-500 text-sm">
                Define referral codes that customers can use to refer new customers to your platform.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Language */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <p className="text-xs text-gray-500">Language for referral messages</p>
              </div>
              <div className="md:col-span-2">
                <select 
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>

            {/* Referral Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referral type</label>
                <p className="text-xs text-gray-500">Choose between percentage or flat discount</p>
              </div>
              <div className="md:col-span-2">
                <select 
                  name="referralType"
                  value={formData.referralType}
                  onChange={handleReferralTypeChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="percentage">Percentage Discount</option>
                  <option value="flat">Flat Discount</option>
                </select>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Referrer Section */}
            <div className="space-y-6">
              <h3 className="text-md font-medium text-gray-900">Referrer Benefits</h3>
              
              {/* Referrer Discount Value */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount {formData.referralType === 'percentage' ? '(%)' : 'value'}
                  </label>
                  <p className="text-xs text-gray-500">Amount to reward the referrer</p>
                </div>
                <div className="md:col-span-2">
                  <div className="relative">
                    <input 
                      type="number" 
                      name="referrerDiscountValue"
                      value={formData.referrerDiscountValue}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500 text-sm">
                      {formData.referralType === 'percentage' ? '%' : '$'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Referrer Max Discount Value */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum discount value</label>
                  <p className="text-xs text-gray-500">Cap the maximum discount amount</p>
                </div>
                <div className="md:col-span-2">
                  <div className="relative">
                    <input 
                      type="number" 
                      name="referrerMaxDiscountValue"
                      value={formData.referrerMaxDiscountValue}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500 text-sm">$</span>
                  </div>
                </div>
              </div>

              {/* Referrer Description */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-xs text-gray-500">How this will appear to referrers</p>
                </div>
                <div className="md:col-span-2">
                  <input 
                    type="text" 
                    name="referrerDescription"
                    value={formData.referrerDescription}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Referee Section */}
            <div className="space-y-6">
              <h3 className="text-md font-medium text-gray-900">Referee Benefits</h3>
              
              {/* Referee Discount Value */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount {formData.referralType === 'percentage' ? '(%)' : 'value'}
                  </label>
                  <p className="text-xs text-gray-500">Amount to reward the new customer</p>
                </div>
                <div className="md:col-span-2">
                  <div className="relative">
                    <input 
                      type="number" 
                      name="refereeDiscountValue"
                      value={formData.refereeDiscountValue}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500 text-sm">
                      {formData.referralType === 'percentage' ? '%' : '$'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Referee Max Discount Value */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum discount value</label>
                  <p className="text-xs text-gray-500">Cap the maximum discount amount</p>
                </div>
                <div className="md:col-span-2">
                  <div className="relative">
                    <input 
                      type="number" 
                      name="refereeMaxDiscountValue"
                      value={formData.refereeMaxDiscountValue}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500 text-sm">$</span>
                  </div>
                </div>
              </div>

              {/* Minimum Order Amount */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum order amount</label>
                  <p className="text-xs text-gray-500">Required purchase to get the discount</p>
                </div>
                <div className="md:col-span-2">
                  <div className="relative">
                    <input 
                      type="number" 
                      name="minOrderValue"
                      value={formData.minOrderValue}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500 text-sm">$</span>
                  </div>
                </div>
              </div>

              {/* Referee Description */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Description
                    <span className="ml-1.5 text-gray-400 hover:text-gray-500 cursor-help" title="This will be shown to new customers">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </label>
                  <p className="text-xs text-gray-500">How this will appear to new customers</p>
                </div>
                <div className="md:col-span-2">
                  <input 
                    type="text" 
                    name="refereeDescription"
                    value={formData.refereeDescription}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Program Options */}
            <div className="space-y-6">
              <h3 className="text-md font-medium text-gray-900">Program Options</h3>
              
              {/* Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program status</label>
                  <p className="text-xs text-gray-500">Enable or disable the referral program</p>
                </div>
                <div className="md:col-span-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="status"
                      checked={formData.status}
                      onChange={handleInputChange}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {formData.status ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Referral Code On Signup */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referral code on signup</label>
                  <p className="text-xs text-gray-500">Show referral field during registration</p>
                </div>
                <div className="md:col-span-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="referralCodeOnSignup"
                      checked={formData.referralCodeOnSignup}
                      onChange={handleInputChange}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {formData.referralCodeOnSignup ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Smart URL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Smart referral URL</label>
                  <p className="text-xs text-gray-500">Generate trackable referral links</p>
                </div>
                <div className="md:col-span-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="smartURL"
                      checked={formData.smartURL}
                      onChange={handleInputChange}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {formData.smartURL ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end mt-8 gap-3">
            <button 
              type="button"
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm font-medium transition-colors shadow-sm disabled:opacity-70"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </section>
      </form>

      {/* Referral Statistics Section */}
      <section className="p-6 border border-gray-100 rounded-xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Referral Statistics</h2>
          <p className="text-gray-500 text-sm mt-1">Track the performance of your referral program</p>
        </div>

        {/* Empty State */}
        <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200 border-dashed">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No referral data yet</h3>
          <p className="mt-1 text-sm text-gray-500">Your referral statistics will appear here once customers start using the program.</p>
        </div>

        {/* Pagination (hidden when no data) */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 space-y-3 md:space-y-0 opacity-50">
          <div className="flex items-center space-x-2">
            <button disabled className="p-2 border rounded-md text-gray-400 cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button disabled className="p-2 border rounded-md text-gray-400 cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <span className="px-2 text-sm text-gray-700">Page 1</span>
            <button disabled className="p-2 border rounded-md text-gray-400 cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button disabled className="p-2 border rounded-md text-gray-400 cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Rows per page:</span>
            <select disabled className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              <option>10</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReferralPromotions;