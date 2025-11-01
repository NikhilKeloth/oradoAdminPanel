import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import apiClient from '../../../../apis/apiClient/apiClient';

const PreferencesPage = () => {
  // Initialize state with default values
  const [preferences, setPreferences] = useState({
    countryCode: { name: 'UNITED STATES', code: 'US', dialCode: '+1' },
    currency: 'USD ($)',
    currencyFormat: 'Default',
    timezone: '(UTC+05:00) Ashgabat, Tashkent',
    timeFormat: '12Hrs Format',
    dateFormat: 'MMMM dd yyyy',
    distanceUnit: 'KM',
    onlineOfflineTax: false,
    productShare: false,
    deliveryAddressConfirmation: false,
    aerialDistance: false,
    favoriteRestaurants: false,
    autoRefund: false,
    pickupNotifications: false,
    orderReadyStatus: false,
    showCommission: false,
    showProductTags: false,
    enableHolidayHours: false,
    virtualMeetTimings: false,
    customerRating: false,
    hideCustomerDetails: false,
    showCustomerProfile: false,
    showCurrencyToRestaurants: false,
    showGeofence: false,
    showGeofenceVirtualMeet: false,
    servingRadius: false,
    showAcceptReject: false,
    showAnalytics: false,
    customerSeeSameTags: false,
    userTags: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for dropdowns
  const countryOptions = [
    { name: 'UNITED STATES', code: 'US', dialCode: '+1' },
    { name: 'UNITED KINGDOM', code: 'GB', dialCode: '+44' },
    { name: 'CANADA', code: 'CA', dialCode: '+1' },
    { name: 'India', code: 'IN', dialCode: '+91' }
  ];

  const currencyOptions = ['USD ($)', 'EUR (€)', 'GBP (£)'];
  const currencyFormatOptions = ['Default', 'Symbol First', 'Symbol Last'];
  const timezoneOptions = [
    '(UTC+05:00) Ashgabat, Tashkent', 
    '(UTC-05:00) Eastern Time', 
    '(UTC+00:00) London',
    '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi'
  ];
  const timeFormatOptions = ['12Hrs Format', '24Hrs Format'];
  const dateFormatOptions = ['MMMM dd yyyy', 'dd/MM/yyyy', 'MM/dd/yyyy'];
  const distanceUnitOptions = ['KM', 'Miles'];

  // Fetch preferences from API
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await apiClient.get('/preferences');
        if (response.data && response.data.data) {
          // Transform the API data to match our state structure
          const apiData = response.data.data;
          setPreferences({
            countryCode: apiData.countryCode || { name: 'UNITED STATES', code: 'US', dialCode: '+1' },
            currency: apiData.currency || 'USD ($)',
            currencyFormat: apiData.currencyFormat || 'Default',
            timezone: apiData.timezone || '(UTC+05:00) Ashgabat, Tashkent',
            timeFormat: apiData.timeFormat || '12Hrs Format',
            dateFormat: apiData.dateFormat || 'MMMM dd yyyy',
            distanceUnit: apiData.distanceUnit || 'KM',
            onlineOfflineTax: apiData.onlineOfflineTax || false,
            productShare: apiData.productShare || false,
            deliveryAddressConfirmation: apiData.deliveryAddressConfirmation || false,
            aerialDistance: apiData.aerialDistance || false,
            favoriteRestaurants: apiData.favoriteRestaurants || false,
            autoRefund: apiData.autoRefund || false,
            pickupNotifications: apiData.pickupNotifications || false,
            orderReadyStatus: apiData.orderReadyStatus || false,
            showCommission: apiData.showCommission || false,
            showProductTags: apiData.showProductTags || false,
            enableHolidayHours: apiData.enableHolidayHours || false,
            virtualMeetTimings: apiData.virtualMeetTimings || false,
            customerRating: apiData.customerRating || false,
            hideCustomerDetails: apiData.hideCustomerDetails || false,
            showCustomerProfile: apiData.showCustomerProfile || false,
            showCurrencyToRestaurants: apiData.showCurrencyToRestaurants || false,
            showGeofence: apiData.showGeofence || false,
            showGeofenceVirtualMeet: apiData.showGeofenceVirtualMeet || false,
            servingRadius: apiData.servingRadius || false,
            showAcceptReject: apiData.showAcceptReject || false,
            showAnalytics: apiData.showAnalytics || false,
            customerSeeSameTags: apiData.customerSeeSameTags || false,
            userTags: apiData.userTags || []
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  // Handle preference updates
  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle country code change
  const handleCountryCodeChange = (e) => {
    const selectedCountry = JSON.parse(e.target.value);
    setPreferences(prev => ({
      ...prev,
      countryCode: selectedCountry
    }));
  };

  // Handle save
  const handleSave = async () => {
    try {
      setLoading(true);
      // Transform data to match API expected format
      const dataToSave = {
        ...preferences,
        countryCode: {
          name: preferences.countryCode.name,
          code: preferences.countryCode.code,
          dialCode: preferences.countryCode.dialCode
        }
      };
      
      await apiClient.post('/preferences', dataToSave);
      // Show success message
      toast.success("Preferences saved successfully!")

    } catch (err) {
      setError(err.message);
     toast.error('Error saving preferences: ');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading preferences...</div>;
  if (error) return <div className="text-red-500 p-4">Error loading preferences: {error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center mb-8 pb-4 border-b">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#E3E7EA"/>
            <path d="M6.25 17C5.97386 17 5.75 16.7761 5.75 16.5V16.25C5.75 15.9739 5.97386 15.75 6.25 15.75H7C7.27614 15.75 7.5 15.5261 7.5 15.25V7.5C7.5 7.22386 7.72386 7 8 7H12C12.2761 7 12.5 7.22386 12.5 7.5V7.75C12.5 8.02614 12.7239 8.25 13 8.25H14.75C15.0261 8.25 15.25 8.47386 15.25 8.75V12.01C15.25 12.2861 15.0261 12.51 14.75 12.51H14.5C14.2239 12.51 14 12.2861 14 12.01V8.5C14 8.22386 13.7761 8 13.5 8H12.5C12.2239 8 12 8.22386 12 8.5V12.0775C12 12.3536 11.7761 12.5775 11.5 12.5775H11.25C10.9739 12.5775 10.75 12.3536 10.75 12.0775V8.75C10.75 8.47386 10.5261 8.25 10.25 8.25H8.25C7.97386 8.25 7.75 8.47386 7.75 8.75V15.25C7.75 15.5261 7.97386 15.75 8.25 15.75H10.7125C10.9886 15.75 11.2125 15.9739 11.2125 16.25V16.5C11.2125 16.7761 10.9886 17 10.7125 17H6.25ZM14.2017 17.7212C13.9497 17.7212 13.7371 17.5337 13.7056 17.2837L13.6685 16.9889C13.6421 16.779 13.4856 16.6111 13.2824 16.552C12.9591 16.4581 12.6827 16.3403 12.4532 16.1987C12.2403 16.0674 12.0357 15.9146 11.8392 15.7403C11.6813 15.6002 11.4564 15.5564 11.2646 15.6446L10.9763 15.7771C10.7533 15.8796 10.4889 15.8052 10.3522 15.6014L10.121 15.2568C9.97758 15.043 10.0199 14.7553 10.2187 14.5919L10.4791 14.3779C10.6396 14.246 10.6991 14.0292 10.6464 13.8282C10.5584 13.4932 10.5145 13.1734 10.5145 12.8687C10.5145 12.5648 10.5584 12.2454 10.6463 11.9105C10.6991 11.7096 10.6396 11.4928 10.4791 11.3608L10.2187 11.1468C10.0199 10.9834 9.97758 10.6957 10.121 10.482L10.3525 10.137C10.4891 9.9333 10.7532 9.8588 10.9761 9.961L11.2648 10.0934C11.4566 10.1814 11.6812 10.1375 11.8388 9.9972C12.0353 9.8222 12.2401 9.6682 12.4532 9.535C12.6826 9.3916 12.9591 9.2727 13.2827 9.1783C13.4863 9.1189 13.6431 8.9505 13.6691 8.74L13.7052 8.4486C13.7362 8.1981 13.949 8.01 14.2014 8.01H14.568C14.8202 8.01 15.0329 8.1978 15.0641 8.4481L15.1007 8.7405C15.1269 8.9507 15.2836 9.1189 15.4871 9.178C15.8108 9.2719 16.0875 9.3897 16.317 9.5312C16.5296 9.6624 16.7338 9.8152 16.9296 9.9896C17.0876 10.1304 17.3129 10.1747 17.5053 10.0864L17.7939 9.9539C18.0169 9.8515 18.2811 9.926 18.4178 10.1297L18.6492 10.4745C18.7926 10.6882 18.7503 10.9759 18.5515 11.1393L18.2911 11.3533C18.1306 11.4853 18.071 11.7021 18.1238 11.903C18.2117 12.238 18.2557 12.5579 18.2557 12.8625C18.2557 13.1665 18.2117 13.4859 18.1238 13.8208C18.071 14.0217 18.1306 14.2385 18.2911 14.3704L18.5515 14.5844C18.7503 14.7478 18.7926 15.0355 18.6492 15.2493L18.4164 15.5961C18.2804 15.799 18.0177 15.8738 17.7952 15.7731L17.5049 15.6418C17.3133 15.5552 17.0896 15.5997 16.9326 15.7395C16.7356 15.9148 16.5304 16.0683 16.317 16.2C16.0869 16.3415 15.8102 16.4593 15.4869 16.5532C15.2835 16.6123 15.1269 16.7805 15.1007 16.9906L15.0641 17.2832C15.0329 17.5334 14.8202 17.7212 14.568 17.7212H14.2017ZM14.3794 15.5588C15.1186 15.5588 15.7528 15.2954 16.282 14.7687C16.8111 14.2421 17.0761 13.6092 17.077 12.87C17.0778 12.1308 16.8145 11.4967 16.287 10.9675C15.7595 10.4383 15.127 10.1733 14.3895 10.1725C13.652 10.1717 13.0178 10.435 12.4869 10.9625C11.9561 11.49 11.6911 12.1225 11.6919 12.86C11.6928 13.5975 11.9561 14.2321 12.482 14.7638C13.0078 15.2954 13.6403 15.5613 14.3794 15.5588ZM10.375 12.9625C10.1167 12.9625 9.89167 12.8667 9.7 12.675C9.50833 12.4833 9.4125 12.2583 9.4125 12C9.4125 11.7417 9.50833 11.5167 9.7 11.325C9.89167 11.1333 10.1167 11.0375 10.375 11.0375C10.6333 11.0375 10.8583 11.1333 11.05 11.325C11.2417 11.5167 11.3375 11.7417 11.3375 12C11.3375 12.2583 11.2417 12.4833 11.05 12.675C10.8583 12.8667 10.6333 12.9625 10.375 12.9625Z" fill="#111827"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Preferences</h2>
      </div>

      {/* Country Code */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Country Code</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Set the default country code for your platform. If the country code is not selected, it will be automatically determined based on the user's IP address.
          </div>
          <div className="md:w-1/4">
            <div className="relative">
              <select 
                className="w-full p-2 border border-gray-300 rounded-md appearance-none bg-white pr-8"
                value={JSON.stringify(preferences.countryCode)}
                onChange={handleCountryCodeChange}
              >
                {countryOptions.map((country) => (
                  <option key={country.code} value={JSON.stringify(country)}>
                    {country.name} ({country.dialCode})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Currency */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Currency</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Choose the currency in which your marketplace will operate in. Make sure that currency is supported by your payment gateway.
          </div>
          <div className="md:w-1/4">
            <div className="relative">
              <select 
                className="w-full p-2 border border-gray-300 rounded-md appearance-none bg-white pr-8"
                value={preferences.currency}
                onChange={(e) => handlePreferenceChange('currency', e.target.value)}
              >
                {currencyOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Formatting */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Currency Formatting</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Choose the currency format in which your marketplace and dashboard will show the currency.
          </div>
          <div className="md:w-1/4">
            <div className="relative">
              <select 
                className="w-full p-2 border border-gray-300 rounded-md appearance-none bg-white pr-8"
                value={preferences.currencyFormat}
                onChange={(e) => handlePreferenceChange('currencyFormat', e.target.value)}
              >
                {currencyFormatOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timezone */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Timezone</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Select the timezone you operate in.
          </div>
          <div className="md:w-1/4">
            <div className="relative">
              <select 
                className="w-full p-2 border border-gray-300 rounded-md appearance-none bg-white pr-8"
                value={preferences.timezone}
                onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
              >
                {timezoneOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Format */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Time Format</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            The selected time format will be visible on your entire platform from Admin/Restaurants dashboard to Customer Applications
          </div>
          <div className="md:w-1/4">
            <div className="relative">
              <select 
                className="w-full p-2 border border-gray-300 rounded-md appearance-none bg-white pr-8"
                value={preferences.timeFormat}
                onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
              >
                {timeFormatOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Format */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Date Format</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            The selected time format will be visible on your entire platform from Admin/Restaurants dashboard to Customer Applications
          </div>
          <div className="md:w-1/4">
            <div className="relative">
              <select 
                className="w-full p-2 border border-gray-300 rounded-md appearance-none bg-white pr-8"
                value={preferences.dateFormat}
                onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
              >
                {dateFormatOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Online and Offline Tax */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4 flex items-center">
            Online and Offline Tax
            <div className="group relative ml-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute hidden group-hover:block z-10 w-64 p-2 text-sm text-gray-700 bg-white border border-gray-200 rounded shadow-lg">
                By default, Pay Later and Pay on Delivery are treated as the offline payment method, and taxes for both are implemented accordingly.
              </div>
            </div>
          </label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this to apply different tax amount on offline and online payment methods
            <br />
            <span className="text-sm text-gray-600">*(To use this feature, please disable Product Inclusive Tax and ensure your apps are updated after February 29th 2024. Otherwise, customers may encounter price mismatch issues during order creation.)</span>
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.onlineOfflineTax}
                onChange={() => handlePreferenceChange('onlineOfflineTax', !preferences.onlineOfflineTax)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Product Share */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Product Share</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this to share products via social media.
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.productShare}
                onChange={() => handlePreferenceChange('productShare', !preferences.productShare)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Delivery Address Confirmation */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Delivery Address Confirmation</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this to show delivery address confirmation pop up to the customer on completing order checkout
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.deliveryAddressConfirmation}
                onChange={() => handlePreferenceChange('deliveryAddressConfirmation', !preferences.deliveryAddressConfirmation)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Aerial Distance */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Aerial Distance</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this to showcase Aerial distance else the merchant distance will be calculated by Google Maps/Mappr
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.aerialDistance}
                onChange={() => handlePreferenceChange('aerialDistance', !preferences.aerialDistance)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Favourite restaurants */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Favourite restaurants</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this to allow your customers to mark restaurants as favourites
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.favoriteRestaurants}
                onChange={() => handlePreferenceChange('favoriteRestaurants', !preferences.favoriteRestaurants)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Auto Refund */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Auto Refund</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Allow auto refund when order is cancelled by the Admin/Restaurants/Manager
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.autoRefund}
                onChange={() => handlePreferenceChange('autoRefund', !preferences.autoRefund)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Pickup Notifications */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Pickup Notifications</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this toggle to set pickup notifications for the Orders
            <br />
            (Make sure your apps are updated)
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.pickupNotifications}
                onChange={() => handlePreferenceChange('pickupNotifications', !preferences.pickupNotifications)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* ORDER READY Status */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">ORDER READY Status</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this toggle to set ORDER READY status
            <br />
            (Make sure your apps are updated)
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.orderReadyStatus}
                onChange={() => handlePreferenceChange('orderReadyStatus', !preferences.orderReadyStatus)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Distance Unit */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Distance Unit</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Select the distance unit for your marketplace.
          </div>
          <div className="md:w-1/4">
            <div className="relative">
              <select 
                className="w-full p-2 border border-gray-300 rounded-md appearance-none bg-white pr-8"
                value={preferences.distanceUnit}
                onChange={(e) => handlePreferenceChange('distanceUnit', e.target.value)}
              >
                {distanceUnitOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Show Commission to restaurants */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Show Commission to restaurants</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this toggle to show commisions to restaurants
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.showCommission}
                onChange={() => handlePreferenceChange('showCommission', !preferences.showCommission)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Show Product Tags to restaurants */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Show Product Tags to restaurants</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this toggle to allow merchants to create tags and assign products to tags
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.showProductTags}
                onChange={() => handlePreferenceChange('showProductTags', !preferences.showProductTags)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Enable Holiday Hours */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Enable Holiday Hours</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this to allow restaurants to set holiday hours. restaurants will be unavailable during holiday hours
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.enableHolidayHours}
                onChange={() => handlePreferenceChange('enableHolidayHours', !preferences.enableHolidayHours)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Virtual Meet Timings */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Virtual Meet Timings</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this toggle to allow the restaurants to set different timings for Virtual Meet
            <br />
            <span className="text-sm text-gray-600">(Please make sure your apps are updated before you enable this feature.)</span>
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.virtualMeetTimings}
                onChange={() => handlePreferenceChange('virtualMeetTimings', !preferences.virtualMeetTimings)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Customer Rating */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Customer Rating</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this, to allow restaurants to rate customers after the Restaurants completes their order.
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.customerRating}
                onChange={() => handlePreferenceChange('customerRating', !preferences.customerRating)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left:[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Hide Customer Details From restaurants */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Hide Customer Details From restaurants</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this, to hide Customer details from merchants
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.hideCustomerDetails}
                onChange={() => handlePreferenceChange('hideCustomerDetails', !preferences.hideCustomerDetails)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left:[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Show Customer profile to restaurants */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Show Customer profile to restaurants</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this to show Customer profile with additional information to restaurants.
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.showCustomerProfile}
                onChange={() => handlePreferenceChange('showCustomerProfile', !preferences.showCustomerProfile)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left:[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Show Currency to restaurants */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Show Currency to restaurants</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this to show currency option to restaurants.
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.showCurrencyToRestaurants}
                onChange={() => handlePreferenceChange('showCurrencyToRestaurants', !preferences.showCurrencyToRestaurants)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left:[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Show Geofence to restaurants */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Show Geofence to restaurants (Home delivery and Pick And Drop Orders)</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this to allow restaurants to set their Geofence for Home delivery and Pick And Drop Order
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.showGeofence}
                onChange={() => handlePreferenceChange('showGeofence', !preferences.showGeofence)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left:[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Show Geofence to restaurants Virtual Meet Orders */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Show Geofence to restaurants Virtual Meet Orders (Virtual Meet Orders)</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this to allow restaurants to set their Geofence for Virtual Meet Order
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.showGeofenceVirtualMeet}
                onChange={() => handlePreferenceChange('showGeofenceVirtualMeet', !preferences.showGeofenceVirtualMeet)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left:[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Serving Radius */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Serving Radius</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this toggle to consider serving radius specified in restaurants configuration as google FM distance instead of aerial distance
            <br />
            <span className="text-sm text-gray-600">*(If you enable this toggle your google billing will increase in case you are using google maps)</span>
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.servingRadius}
                onChange={() => handlePreferenceChange('servingRadius', !preferences.servingRadius)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left:[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Show Accept/Reject to merchants */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Show Accept/Reject to merchants</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this to allow restaurants to accept/reject Order
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.showAcceptReject}
                onChange={() => handlePreferenceChange('showAcceptReject', !preferences.showAcceptReject)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left:[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Show Analytics to merchants */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <label className="text-gray-700 font-medium mb-2 md:mb-0 md:w-1/4">Show Analytics to merchants</label>
          <div className="text-gray-500 md:w-2/4 mb-4 md:mb-0">
            Enable this to allow merchants to see analytics section.
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.showAnalytics}
                onChange={() => handlePreferenceChange('showAnalytics', !preferences.showAnalytics)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left:[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* User Tags */}
      <div className="mb-8 border rounded-lg p-4">
        <div className="flex flex-col mb-4">
          <label className="text-gray-700 font-medium mb-2">User Tags</label>
          <div className="text-gray-500">
            Define tags at user level. Tags defined here can be assigned to customers and restaurants in their respective listing under general section.
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="md:w-3/4 mb-2 md:mb-0">
            <label className="text-gray-700 font-medium flex items-center">
              Customer can see the merchants with same tags only
              <div className="group relative ml-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute hidden group-hover:block z-10 w-64 p-2 text-sm text-gray-700 bg-white border border-gray-200 rounded shadow-lg">
                  Customers will only see restaurants that have matching tags
                </div>
              </div>
            </label>
          </div>
          <div className="md:w-1/4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.customerSeeSameTags}
                onChange={() => handlePreferenceChange('customerSeeSameTags', !preferences.customerSeeSameTags)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left:[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">
            Add Tag
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border">Name</th>
                <th className="py-2 px-4 border">Default</th>
                <th className="py-2 px-4 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {preferences.userTags.length > 0 ? (
                preferences.userTags.map(tag => (
                  <tr key={tag._id}>
                    <td className="py-2 px-4 border">{tag.name}</td>
                    <td className="py-2 px-4 border">
                      {tag.isDefault ? 'Yes' : 'No'}
                    </td>
                    <td className="py-2 px-4 border">
                      <button className="text-red-500 hover:text-red-700">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-gray-500">
                    No Data Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default PreferencesPage;