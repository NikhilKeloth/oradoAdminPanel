import React, { useState, useEffect } from 'react';
import { Save, Settings, MapPin, Info, ArrowUp, ArrowDown, ChevronDown, AlertCircle, CheckCircle, DollarSign, Navigation } from 'lucide-react';
import { 
  updateDeliveryFeeSettings, 
  getCurrentDeliveryFeeSettings
} from '../../../apis/adminApis/feeSettings';
import { getAllCities } from "../../../apis/adminApis/adminFuntionsApi";
import { Link } from 'react-router-dom';
import { getCityDeliveryFeeSetting, updateCityDeliveryFeeSetting } from '../../../apis/adminApis/cityApi';
import { toast } from 'react-toastify';

const DeliveryFeeSettings = () => {
  // State for editable settings
  const [settings, setSettings] = useState({
    deliveryFeeType: 'Per KM',
    baseDeliveryFee: 0,
    baseDistanceKm: 0,
    perKmFeeBeyondBase: 0,
    orderTypeDeliveryFees: {}
  });

  // State for current saved settings
  const [currentSettings, setCurrentSettings] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // City related states
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [citySettings, setCitySettings] = useState({
    deliveryFeeType: 'Fixed',
    baseDeliveryFee: 0,
    baseDistanceKm: 0,
    perKmFeeBeyondBase: 0,
    isCustomFeeEnabled: false
  });

  // Load current settings and cities on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load global settings
        const globalResponse = await getCurrentDeliveryFeeSettings();
        if (globalResponse.status === 200) {
          const apiData = globalResponse.data.data || globalResponse.data;
          const settings = {
            deliveryFeeType: apiData.deliveryFeeType || 'Per KM',
            baseDeliveryFee: parseFloat(apiData.baseDeliveryFee) || 0,
            baseDistanceKm: parseFloat(apiData.baseDistanceKm) || 0,
            perKmFeeBeyondBase: parseFloat(apiData.perKmFeeBeyondBase) || 0,
            orderTypeDeliveryFees: apiData.orderTypeDeliveryFees || {}
          };
          
          setCurrentSettings(settings);
          setSettings(settings);
        }

        // Load cities
        const citiesResponse = await getAllCities();
        if (citiesResponse.success) {
          setCities(citiesResponse.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Load city settings when city is selected
  useEffect(() => {
    if (selectedCity) {
      const loadCitySettings = async () => {
        try {
          const response = await getCityDeliveryFeeSetting(selectedCity._id);
          console.log('City delivery fee setting response:', response);
          console.log('Response type:', typeof response);
          console.log('Response keys:', response ? Object.keys(response) : 'null');
          
          if (response && typeof response === 'object' && response.isCustomFeeEnabled !== undefined) {
            // Response contains the settings directly
            console.log('Setting city settings with:', response);
            setCitySettings({
              deliveryFeeType: response.deliveryFeeType || 'Fixed',
              baseDeliveryFee: response.baseDeliveryFee || 0,
              baseDistanceKm: response.baseDistanceKm || 0,
              perKmFeeBeyondBase: response.perKmFeeBeyondBase || 0,
              isCustomFeeEnabled: response.isCustomFeeEnabled || false
            });
          } else {
            // No settings found, set defaults
            console.log('No settings found, using defaults');
            setCitySettings({
              deliveryFeeType: 'Fixed',
              baseDeliveryFee: 0,
              baseDistanceKm: 0,
              perKmFeeBeyondBase: 0,
              isCustomFeeEnabled: false
            });
          }
        } catch (error) {
          console.error("Error loading city settings:", error);
          setCitySettings({
            deliveryFeeType: 'Fixed',
            baseDeliveryFee: 0,
            baseDistanceKm: 0,
            perKmFeeBeyondBase: 0,
            isCustomFeeEnabled: false
          });
        }
      };

      loadCitySettings();
    }
  }, [selectedCity]);

  const handleToggleCustomFee = async () => {
    const newValue = !citySettings.isCustomFeeEnabled;
    setCitySettings(prev => ({
      ...prev,
      isCustomFeeEnabled: newValue
    }));

    // Immediately save the toggle change
    if (selectedCity && selectedCity._id) {
      try {
        setIsSaving(true);
        const payload = {
          isCustomFeeEnabled: newValue,
          deliveryFeeType: citySettings.deliveryFeeType,
          baseDeliveryFee: citySettings.baseDeliveryFee,
          baseDistanceKm: citySettings.baseDistanceKm,
          perKmFeeBeyondBase: citySettings.perKmFeeBeyondBase
        };

        const response = await updateCityDeliveryFeeSetting(selectedCity._id, payload);
        console.log('Update response:', response);
        toast.success(`Custom fees ${newValue ? 'enabled' : 'disabled'} successfully!`)
        if (response && response.success) {
          setSaveMessage(`Custom fees ${newValue ? 'enabled' : 'disabled'} successfully!`);

          // Reload settings after toggle
          const updatedResponse = await getCityDeliveryFeeSetting(selectedCity._id);
          console.log('Updated settings response:', updatedResponse);

          if (updatedResponse && typeof updatedResponse === 'object' && updatedResponse.isCustomFeeEnabled !== undefined) {
            setCitySettings({
              deliveryFeeType: updatedResponse.deliveryFeeType || 'Fixed',
              baseDeliveryFee: updatedResponse.baseDeliveryFee || 0,
              baseDistanceKm: updatedResponse.baseDistanceKm || 0,
              perKmFeeBeyondBase: updatedResponse.perKmFeeBeyondBase || 0,
              isCustomFeeEnabled: updatedResponse.isCustomFeeEnabled || false
            });
          }
        }
      } catch (error) {
        console.error('Error toggling custom fees:', error);
        // Revert if there's an error
        setCitySettings(prev => ({
          ...prev,
          isCustomFeeEnabled: !newValue
        }));
        setSaveMessage('Failed to update settings. Please try again.');
      } finally {
        setIsSaving(false);
        setTimeout(() => setSaveMessage(''), 3000);
      }
    }
  };

  const handleCityFeeTypeChange = (type) => {
    setCitySettings(prev => ({
      ...prev,
      deliveryFeeType: type
    }));
  };

  const handleGlobalFeeTypeChange = (type) => {
    setSettings(prev => ({
      ...prev,
      deliveryFeeType: type
    }));
  };

  // Check if there are unsaved changes
  const hasChanges = !currentSettings || 
    JSON.stringify(settings) !== JSON.stringify(currentSettings);

  // Handler for changing base delivery fee
  const handleBaseDeliveryFeeChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setSettings({ 
      ...settings, 
      baseDeliveryFee: numValue
    });
  };

  // Handler for changing base distance
  const handleBaseDistanceChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setSettings({ 
      ...settings, 
      baseDistanceKm: numValue
    });
  };

  // Handler for changing per km fee
  const handlePerKmFeeChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setSettings({ 
      ...settings, 
      perKmFeeBeyondBase: numValue
    });
  };

  // Handler for changing order type fees
  const handleOrderTypeFeeChange = (orderType, value) => {
    const numValue = parseFloat(value) || 0;
    setSettings(prev => ({
      ...prev,
      orderTypeDeliveryFees: {
        ...prev.orderTypeDeliveryFees,
        [orderType]: numValue
      }
    }));
  };

  // Handler for changing city base delivery fee
  const handleCityBaseDeliveryFeeChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setCitySettings({ 
      ...citySettings, 
      baseDeliveryFee: numValue
    });
  };

  // Handler for changing city base distance
  const handleCityBaseDistanceChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setCitySettings({ 
      ...citySettings, 
      baseDistanceKm: numValue
    });
  };

  // Handler for changing city per km fee
  const handleCityPerKmFeeChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setCitySettings({ 
      ...citySettings, 
      perKmFeeBeyondBase: numValue
    });
  };

  // Save global settings to API
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const payload = {
        deliveryFeeType: settings.deliveryFeeType,
        baseDeliveryFee: settings.baseDeliveryFee,
        baseDistanceKm: settings.baseDistanceKm,
        perKmFeeBeyondBase: settings.perKmFeeBeyondBase,
        orderTypeDeliveryFees: settings.orderTypeDeliveryFees
      };

      const response = await updateDeliveryFeeSettings(payload);
      
      if (response.status === 200) {
        setSaveMessage('Settings saved successfully!');
        setCurrentSettings(settings);
      } else {
        throw new Error(response.data?.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage(error.message || 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // Handler for saving city settings
  const handleSaveCitySettings = async () => {
    if (!selectedCity || !selectedCity._id) {
      setSaveMessage('Please select a city before saving settings.');
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        isCustomFeeEnabled: citySettings.isCustomFeeEnabled,
        deliveryFeeType: citySettings.deliveryFeeType,
        baseDeliveryFee: citySettings.baseDeliveryFee,
        baseDistanceKm: citySettings.baseDistanceKm,
        perKmFeeBeyondBase: citySettings.perKmFeeBeyondBase
      };

      const response = await updateCityDeliveryFeeSetting(selectedCity._id, payload);

      if (response && response.success) {
        setSaveMessage(`City settings for ${selectedCity.name} ${citySettings.isCustomFeeEnabled ? 'saved' : 'disabled'} successfully!`);
        // Reload city settings after save
        const updatedResponse = await getCityDeliveryFeeSetting(selectedCity._id);
        console.log('Save - Updated settings response:', updatedResponse);
        if (updatedResponse && typeof updatedResponse === 'object' && updatedResponse.isCustomFeeEnabled !== undefined) {
          setCitySettings({
            deliveryFeeType: updatedResponse.deliveryFeeType || 'Fixed',
            baseDeliveryFee: updatedResponse.baseDeliveryFee || 0,
            baseDistanceKm: updatedResponse.baseDistanceKm || 0,
            perKmFeeBeyondBase: updatedResponse.perKmFeeBeyondBase || 0,
            isCustomFeeEnabled: updatedResponse.isCustomFeeEnabled || false
          });
        }
      } else {
        throw new Error(response?.message || 'Failed to save city settings');
      }
    } catch (error) {
      console.error('Error saving city settings:', error);
      setSaveMessage(error.message || 'Failed to save city settings. Please try again.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // Helper function to render comparison indicator
  const renderComparison = (currentVal, newVal, isCurrency = false) => {
    if (currentVal === undefined || newVal === undefined) return null;
    
    const diff = newVal - currentVal;
    if (diff === 0) return null;

    const isIncrease = diff > 0;
    const displayDiff = isCurrency 
      ? Math.abs(diff).toFixed(2)
      : Math.abs(diff);

    return (
      <span className={`ml-2 inline-flex items-center text-xs ${
        isIncrease ? 'text-red-500' : 'text-green-500'
      }`}>
        {isIncrease ? <ArrowUp size={12} className="mr-0.5" /> : <ArrowDown size={12} className="mr-0.5" />}
        {isCurrency ? '₹' : ''}{displayDiff}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading delivery fee settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mr-4">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Delivery Fee Settings</h1>
              <p className="text-gray-600 mt-1">Configure delivery fees for your platform</p>
            </div>
          </div>
        </div>

        {/* City Selection */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">City-Based Delivery Fees</h2>
              </div>
              <Link
                to="/admin/dashboard/add-city"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                + Add City
              </Link>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select City</label>
                <div className="relative">
                  <select
                    value={selectedCity?._id || ''}
                    onChange={(e) => {
                      const city = cities.find(c => c._id === e.target.value);
                      setSelectedCity(city || null);
                    }}
                    className="w-full pl-5 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 appearance-none bg-white text-gray-900 font-medium transition-all duration-200 hover:border-gray-300"
                  >
                    <option value="">Choose a city to configure</option>
                    {cities.map(city => (
                      <option key={city._id} value={city._id}>{city.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* City Settings View - Always visible when city is selected */}
            {selectedCity && (
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-xl mr-4">
                      <Navigation className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-blue-900">
                        {selectedCity.name} Delivery Fee Settings
                      </h3>
                      <p className="text-blue-700 text-sm mt-1">Configure custom delivery fees for this city</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-4 text-sm font-semibold text-gray-700">
                      Enable Custom Fees
                    </span>
                    <button
                      onClick={handleToggleCustomFee}
                      type="button"
                      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                        citySettings.isCustomFeeEnabled 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ${
                          citySettings.isCustomFeeEnabled ? 'translate-x-8' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                {citySettings.isCustomFeeEnabled && (
                  <>
                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Delivery Fee Type
                      </label>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleCityFeeTypeChange('Fixed')}
                          className={`px-6 py-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                            citySettings.deliveryFeeType === 'Fixed'
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500 text-white shadow-lg'
                              : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <DollarSign className="w-5 h-5 mr-2" />
                            Fixed Fee
                          </div>
                        </button>
                        <button
                          onClick={() => handleCityFeeTypeChange('Per KM')}
                          className={`px-6 py-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                            citySettings.deliveryFeeType === 'Per KM'
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500 text-white shadow-lg'
                              : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <Navigation className="w-5 h-5 mr-2" />
                            Per KM
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Base Delivery Fee
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-medium">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={citySettings.baseDeliveryFee || ''}
                            onChange={(e) => handleCityBaseDeliveryFeeChange(e.target.value)}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                handleCityBaseDeliveryFeeChange('0');
                              }
                            }}
                            className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg font-medium transition-all duration-200 hover:border-gray-300"
                            placeholder="0.00"
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Base amount for delivery</p>
                      </div>

                      {citySettings.deliveryFeeType === 'Per KM' && (
                        <>
                          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Base Distance Coverage
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={citySettings.baseDistanceKm || ''}
                                onChange={(e) => handleCityBaseDistanceChange(e.target.value)}
                                onBlur={(e) => {
                                  if (e.target.value === '') {
                                    handleCityBaseDistanceChange('0');
                                  }
                                }}
                                className="w-full pl-4 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg font-medium transition-all duration-200 hover:border-gray-300"
                                placeholder="0.0"
                              />
                              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">km</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">Distance covered by base fee</p>
                          </div>
                          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Per KM Fee Beyond Base
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-medium">₹</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={citySettings.perKmFeeBeyondBase || ''}
                                onChange={(e) => handleCityPerKmFeeChange(e.target.value)}
                                onBlur={(e) => {
                                  if (e.target.value === '') {
                                    handleCityPerKmFeeChange('0');
                                  }
                                }}
                                className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg font-medium transition-all duration-200 hover:border-gray-300"
                                placeholder="0.00"
                              />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">Additional fee per km</p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={handleSaveCitySettings}
                        disabled={isSaving}
                        className={`inline-flex items-center px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
                          isSaving
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:scale-105'
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-3" />
                            Save City Settings
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Settings Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Configuration Section */}
          <div className="p-8">
            <div className="flex items-center mb-8">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mr-4">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Global Delivery Fee Settings
                </h3>
                <p className="text-gray-600 mt-1">
                  Default fees applied when no city-specific settings exist
                </p>
              </div>
            </div>

            {/* Fee Type Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Delivery Fee Type
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleGlobalFeeTypeChange('Fixed')}
                  className={`px-6 py-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                    settings.deliveryFeeType === 'Fixed'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500 text-white shadow-lg'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Fixed Fee
                  </div>
                </button>
                <button
                  onClick={() => handleGlobalFeeTypeChange('Per KM')}
                  className={`px-6 py-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                    settings.deliveryFeeType === 'Per KM'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500 text-white shadow-lg'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Navigation className="w-5 h-5 mr-2" />
                    Per KM
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {/* Base Delivery Fee - Always shown */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Base Delivery Fee
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-medium">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.baseDeliveryFee || ''}
                    onChange={(e) => handleBaseDeliveryFeeChange(e.target.value)}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        handleBaseDeliveryFeeChange('0');
                      }
                    }}
                    className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg font-medium transition-all duration-200 hover:border-gray-300"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Base amount before any calculations
                </p>
              </div>

              {/* Per KM Settings - Only shown when type is Per KM */}
              {settings.deliveryFeeType === 'Per KM' && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                  <div className="flex items-start">
                    <div className="p-3 bg-blue-100 rounded-xl mr-4 flex-shrink-0">
                      <Info className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-blue-900 mb-6">Distance-Based Pricing</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Base Distance Coverage
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={settings.baseDistanceKm || ''}
                              onChange={(e) => handleBaseDistanceChange(e.target.value)}
                              onBlur={(e) => {
                                if (e.target.value === '') {
                                  handleBaseDistanceChange('0');
                                }
                              }}
                              className="w-full pl-4 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg font-medium transition-all duration-200 hover:border-gray-300"
                              placeholder="0.0"
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">km</span>
                          </div>
                          <p className="mt-2 text-xs text-gray-600">
                            Distance covered by base fee
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Per KM Fee Beyond Base
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-medium">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={settings.perKmFeeBeyondBase || ''}
                              onChange={(e) => handlePerKmFeeChange(e.target.value)}
                              onBlur={(e) => {
                                if (e.target.value === '') {
                                  handlePerKmFeeChange('0');
                                }
                              }}
                              className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg font-medium transition-all duration-200 hover:border-gray-300"
                              placeholder="0.00"
                            />
                          </div>
                          <p className="mt-2 text-xs text-gray-600">
                            Amount charged per kilometer beyond base distance
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 p-6 bg-white rounded-xl border border-blue-200">
                        <p className="text-sm text-blue-800 font-medium mb-3">
                          <strong>Formula:</strong> Base Fee (₹{settings.baseDeliveryFee.toFixed(2)}) for first {settings.baseDistanceKm}km + Additional distance × ₹{settings.perKmFeeBeyondBase.toFixed(2)}/km
                        </p>
                        <div className="text-xs text-blue-600 space-y-2">
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                            <span>Example 1: {settings.baseDistanceKm}km delivery = ₹{settings.baseDeliveryFee.toFixed(2)} (within base distance)</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                            <span>
                              Example 2: 5km delivery = ₹{settings.baseDeliveryFee.toFixed(2)} + (
                              {Math.max(0, (5 - settings.baseDistanceKm)).toFixed(2)} × ₹{settings.perKmFeeBeyondBase.toFixed(2)}) = ₹
                              {(
                                settings.baseDeliveryFee +
                                (Math.max(0, (5 - settings.baseDistanceKm)) * settings.perKmFeeBeyondBase)
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Comparison Card - Moved to bottom */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Settings Comparison</h3>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Current Settings */}
                    <div>
                      <div className="flex items-center mb-4">
                        <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                        <h4 className="font-bold text-gray-700">Current Settings</h4>
                      </div>
                      
                      {currentSettings ? (
                        <div className="space-y-4 text-sm">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600 font-medium">Fee Type:</span>
                            <span className="text-gray-900 font-semibold">{currentSettings.deliveryFeeType}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600 font-medium">Base Fee:</span>
                            <span className="text-gray-900 font-semibold">₹{currentSettings.baseDeliveryFee.toFixed(2)}</span>
                          </div>
                          {currentSettings.deliveryFeeType === 'Per KM' && (
                            <>
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600 font-medium">Base Distance:</span>
                                <span className="text-gray-900 font-semibold">{currentSettings.baseDistanceKm} km</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600 font-medium">Per KM Fee Beyond Base:</span>
                                <span className="text-gray-900 font-semibold">₹{currentSettings.perKmFeeBeyondBase.toFixed(2)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                          <p className="text-yellow-800 font-medium">No current settings available</p>
                        </div>
                      )}
                    </div>

                    {/* New Settings */}
                    <div>
                      <div className="flex items-center mb-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <h4 className="font-bold text-gray-700">Pending Changes</h4>
                      </div>
                      
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="text-gray-600 font-medium">Fee Type:</span>
                          <span className="text-gray-900 font-semibold">
                            {settings.deliveryFeeType}
                            {currentSettings?.deliveryFeeType !== settings.deliveryFeeType && (
                              <span className="ml-2 inline-flex items-center text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                Changed
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="text-gray-600 font-medium">Base Fee:</span>
                          <span className="text-gray-900 font-semibold">
                            ₹{settings.baseDeliveryFee.toFixed(2)}
                            {renderComparison(
                              currentSettings?.baseDeliveryFee, 
                              settings.baseDeliveryFee, 
                              true
                            )}
                          </span>
                        </div>
                        {settings.deliveryFeeType === 'Per KM' && (
                          <>
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                              <span className="text-gray-600 font-medium">Base Distance:</span>
                              <span className="text-gray-900 font-semibold">
                                {settings.baseDistanceKm} km
                                {renderComparison(
                                  currentSettings?.baseDistanceKm, 
                                  settings.baseDistanceKm
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                              <span className="text-gray-600 font-medium">Per KM Fee Beyond Base:</span>
                              <span className="text-gray-900 font-semibold">
                                ₹{settings.perKmFeeBeyondBase.toFixed(2)}
                                {renderComparison(
                                  currentSettings?.perKmFeeBeyondBase, 
                                  settings.perKmFeeBeyondBase, 
                                  true
                                )}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="px-8 py-8 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                {saveMessage && (
                  <div className={`flex items-center ${
                    saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      saveMessage.includes('success') ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-semibold">{saveMessage}</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className={`inline-flex items-center px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
                  isSaving
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : !hasChanges
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-3" />
                    {hasChanges ? 'Save Changes' : 'No Changes'}
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

export default DeliveryFeeSettings;