import React, { useState, useEffect } from 'react';
import { Plus, Calculator, MapPin, Clock, Settings, Target, Save, Edit, Trash2, DollarSign, Navigation, Zap, X, Eye } from 'lucide-react';
import { deleteEarningsSetting, fetchAllCitySettings, fetchGlobalSettings, saveCitySettings, saveGlobalSettings, updateCitySettings } from '../../apis/adminApis/agentEarnigSetting';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCities } from '../../apis/adminApis/cityApi';

const AgentDeliveryFeeSettings = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [selectedCity, setSelectedCity] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [viewingCity, setViewingCity] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Global Settings State
  const [globalSettings, setGlobalSettings] = useState({
    baseFee: 25,
    baseKm: 2, 
    perKmFeeBeyondBase: 3,
    bonuses: {
      peakHour: 10,
      rain: 0,
      zone: 5,
    },
    allowManualOverrides: true,
  });

  // City-wise Settings State
 const [citySettings, setCitySettings] = useState([
  
  
]);

  // Preview Calculation State
  const [previewData, setPreviewData] = useState({
    distance: 5.2,
    isPeakHour: true,
    isHighDemandZone: true,
    selectedCityForPreview: 'Mumbai'
  });

 const [availableCities, setAvailableCities] = useState([
  { id: '1', name: 'Mumbai' },
  { id: '2', name: 'Delhi' },
  { id: '3', name: 'Bangalore' },
  { id: '4', name: 'Chennai' },
  { id: '5', name: 'Kolkata' },
  { id: '6', name: 'Pune' },
  { id: '7', name: 'Hyderabad' },
  { id: '8', name: 'Gwalior' },
  { id: '9', name: 'Bhopal' },
  { id: '10', name: 'Indore' },
  { id: '11', name: 'Ujjain' }
]);
  // Modal handlers
  const openAddModal = () => {
    setEditingCity(null);
    setIsModalOpen(true);
  };

  const openEditModal = (city) => {
    setEditingCity(city);
    setIsModalOpen(true);
  };

  const openViewModal = (city) => {
    setViewingCity(city);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsViewModalOpen(false);
    setEditingCity(null);
    setViewingCity(null);
  };

const handleSaveCityRule = async (cityData) => {
  try {
    let response;
    console.log(editingCity);

    if (editingCity) {
      // Edit mode - call update API
      response = await updateCitySettings(editingCity._id, cityData);
      toast.success("City rule updated successfully");
    } else {
      // Create mode - call create API
      response = await saveCitySettings(cityData);
      toast.success("City rule added successfully");
    }
    
    const savedCity = response.data;

    setCitySettings(prev => {
      const exists = prev.some(city => city._id === savedCity._id);

      if (exists) {
        // Replace existing city rule
        return prev.map(city =>
          city._id === savedCity._id ? { ...savedCity } : city
        );
      } else {
        // Add as new
        return [...prev, savedCity];
      }
    });

    closeModal();
  } catch (error) {
    console.error("Error saving city rule:", error);
    toast.error(error?.response?.data?.message || "Failed to save city rule");
  }
};


  // Update the useEffect to match the new structure
  useEffect(() => {
    const fetchAllSettings = async () => {
      try {
        setLoading(true);
        
        // Fetch global settings
        const globalResponse = await fetchGlobalSettings();
        const globalData = globalResponse.data;

        // Fetch all city settings
        const cityResponse = await fetchAllCitySettings();
        const cityData = cityResponse.data;
        console.log(cityData)
        setCitySettings(cityData)
        
        // Set global settings
        const hasNestedBonuses = globalData?.bonuses && typeof globalData.bonuses === 'object';
        
        setGlobalSettings({
          baseFee: globalData?.baseFee ?? 25,
          baseKm: globalData?.baseKm ?? 2, 
          perKmFeeBeyondBase: globalData?.perKmFeeBeyondBase ?? 3,
          bonuses: {
            peakHour: hasNestedBonuses ? (globalData.bonuses.peakHour ?? 10) : (globalData?.peakHourBonus ?? 10),
            rain: hasNestedBonuses ? (globalData.bonuses.rain ?? 0) : (globalData?.rainBonus ?? 0),
            zone: hasNestedBonuses ? (globalData.bonuses.zone ?? 5) : (globalData?.zoneBonus ?? 5),
          },
          allowManualOverrides: globalData?.allowManualOverrides ?? true
        });

      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSettings();
  }, []);
useEffect(() => {
  const loadCities = async () => {
    try {
      const response = await getCities();
      if (response.success) {
        // Map the API response to include both id and name
        const citiesWithIds = response.data.map(city => ({
          id: city._id, // Use the _id from the API as the id
          name: city.name,
          // Include other relevant data if needed
          deliveryFeeSetting: city.cityDeliveryFeeSetting
        }));
        setAvailableCities(citiesWithIds);
      } else {
        console.error('Failed to load cities:', response.message);
        toast.error('Failed to load cities');
      }
    } catch (error) {
      console.error('Failed to load cities:', error);
      toast.error('Failed to load cities');
    }
  };

  loadCities();
}, []);

  const handleGlobalSettingsChange = (field, value) => {
    setGlobalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleCityStatus = (cityId) => {
    setCitySettings(prev => 
      prev.map(city => 
        city.id === cityId 
          ? { ...city, enabled: !city.enabled }
          : city
      )
    );
  };

 const handleRemoveCity = async (cityId) => {
  try {
    // Call API to delete from DB
    await deleteEarningsSetting(cityId);

    // Update frontend state only after success
    setCitySettings(prev => prev.filter(city => city._id !== cityId));

    toast.success("City rule removed successfully");
  } catch (error) {
    console.error("Error deleting city rule:", error);
    toast.error(error?.message || "Failed to remove city rule");
  }
};

  const calculatePreviewFee = () => {
    const settings = previewData.selectedCityForPreview 
      ? citySettings.find(c => c.cityName === previewData.selectedCityForPreview) || globalSettings
      : globalSettings;

    let totalFee = settings.baseFee || 0;
    
    if ((previewData.distance || 0) > (settings.baseKm || 0)) {
      const extraDistance = (previewData.distance || 0) - (settings.baseKm || 0);
      totalFee += extraDistance * (settings.perKmFeeBeyondBase || 0);
    }
    
    if (previewData.isPeakHour) {
      totalFee += settings.bonuses?.peakHour || 0;
    }
    
    if (previewData.isHighDemandZone) {
      totalFee += settings.bonuses?.zone || 0;
    }

    return {
      baseFee: settings.baseFee || 0,
      extraDistance: (previewData.distance || 0) > (settings.baseKm || 0) ? ((previewData.distance || 0) - (settings.baseKm || 0)) * (settings.perKmFeeBeyondBase || 0) : 0,
      peakBonus: previewData.isPeakHour ? (settings.bonuses?.peakHour || 0) : 0,
      zoneBonus: previewData.isHighDemandZone ? (settings.bonuses?.zone || 0) : 0,
      total: totalFee
    };
  };

  const handleSaveGlobalSettings = async () => {
    try {
      setLoading(true);
      const response = await saveGlobalSettings({
        mode: 'global',
        baseFee: globalSettings.baseFee,
        baseKm: globalSettings.baseKm,
        perKmFeeBeyondBase: globalSettings.perKmFeeBeyondBase,
        peakHourBonus: globalSettings.bonuses.peakHour,
        zoneBonus: globalSettings.bonuses.zone,
        rainBonus: globalSettings.bonuses.rain,
        allowManualOverrides: globalSettings.allowManualOverrides
      });

      console.log("Global settings saved successfully:", response);
      toast.success("Global settings saved successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        icon: "✅",
      });
    } catch (error) {
      console.error("Failed to save global settings:", error);
      toast.error("Failed to save global settings", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        icon: "❌",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCitySettings = (cityId) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("City settings saved successfully");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 shadow-lg">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white">Agent Delivery Fee Settings</h1>
                <p className="text-orange-100 text-sm">Configure delivery fees and bonuses</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6">
          <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('global')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-300 relative overflow-hidden ${
                activeTab === 'global'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {activeTab === 'global' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 animate-slideIn"></div>
              )}
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Global Settings</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('citywise')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-300 relative overflow-hidden ${
                activeTab === 'citywise'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {activeTab === 'citywise' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 animate-slideIn"></div>
              )}
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>City-wise Settings</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-6">
        {activeTab === 'global' && (
          <GlobalSettingsTab 
            settings={globalSettings}
            onChange={handleGlobalSettingsChange}
            onSave={handleSaveGlobalSettings}
            loading={loading}
          />
        )}
        {activeTab === 'citywise' && (
          <CityWiseSettingsTab 
            citySettings={citySettings}
            availableCities={availableCities}
            onToggleStatus={handleToggleCityStatus}
            onRemoveCity={handleRemoveCity}
            onSave={handleSaveCitySettings}
            loading={loading}
            onOpenAddModal={openAddModal}
            onOpenEditModal={openEditModal}
            onOpenViewModal={openViewModal}
          />
        )}
      </div>

      {/* Fee Calculation Preview */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div 
            className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 cursor-pointer hover:from-blue-100 hover:to-blue-200 transition-all duration-300"
            onClick={() => setShowPreview(!showPreview)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Fee Calculation Preview</h3>
              </div>
              <div className={`transform transition-transform duration-300 ${showPreview ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {showPreview && (
            <div className="p-6 animate-slideDown">
              <FeeCalculationPreview 
                previewData={previewData}
                setPreviewData={setPreviewData}
                calculateFee={calculatePreviewFee}
                citySettings={citySettings}
                globalSettings={globalSettings}
              />
            </div>
          )}
        </div>
      </div>

      {/* City Rule Modal */}
     {isModalOpen && (
  <CityRuleModal
    city={editingCity}
    onClose={closeModal}
    onSave={handleSaveCityRule}
    availableCities={availableCities.filter(city => 
      // Allow editing current city or cities not already in settings
      !citySettings.some(setting => setting.cityId === city.id) || 
      (editingCity && editingCity.cityId === city.id)
    )}
  />
)}
      {/* View City Modal */}
      {isViewModalOpen && (
        <ViewCityModal
          city={viewingCity}
          onClose={closeModal}
          onEdit={() => {
            setEditingCity(viewingCity);
            setIsViewModalOpen(false);
            setIsModalOpen(true);
          }}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              <span className="text-gray-700 font-medium">Saving settings...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// City Rule Modal Component
const CityRuleModal = ({ city, onClose, onSave, availableCities }) => {
    const isEditMode = Boolean(city);

  // Initialize form data based on mode
 const getInitialFormData = (city) => {
  if (city) {
    return {
      Id: city._id || '',
      cityId: city.cityId?._id || city.cityId || '', // Handle both object and string
      cityName: city.cityId?.name || city.cityName || '', // Handle both object and string
      baseFee: city.baseFee || 30,
      baseKm: city.baseKm || 3,
      perKmFeeBeyondBase: city.perKmFeeBeyondBase || 4,
      bonuses: {
        peakHour: city.bonuses?.peakHour ?? 15, // Use nullish coalescing
        rain: city.bonuses?.rain ?? 0,
        zone: city.bonuses?.zone ?? 8,
      },
      allowManualOverrides: city.allowManualOverrides !== undefined ? city.allowManualOverrides : true
    };
  } else {
    return {
      cityId: '',
      cityName: '',
      baseFee: 30,
      baseKm: 3,
      perKmFeeBeyondBase: 4,
      bonuses: {
        peakHour: 15,
        rain: 0,
        zone: 8,
      },
      allowManualOverrides: true
    };
  }
};

  const [formData, setFormData] = useState(getInitialFormData(city));

  // Update form when city prop changes
  useEffect(() => {
    setFormData(getInitialFormData(city));
  }, [city]);

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCitySelect = (e) => {
    const selectedCityId = e.target.value;
    const selectedCity = availableCities.find(city => city.id === selectedCityId);
    
    if (selectedCity) {
      // If the selected city has delivery fee settings, pre-fill the form
      if (selectedCity.deliveryFeeSetting && !isEditMode) {
        setFormData(prev => ({
          ...prev,
          cityId: selectedCityId,
          cityName: selectedCity.name,
          baseFee: selectedCity.deliveryFeeSetting.baseDeliveryFee || prev.baseFee,
          baseKm: selectedCity.deliveryFeeSetting.baseDistanceKm || prev.baseKm,
          perKmFeeBeyondBase: selectedCity.deliveryFeeSetting.perKmFeeBeyondBase || prev.perKmFeeBeyondBase
        }));
      } else {
        handleChange('cityId', selectedCityId);
        handleChange('cityName', selectedCity.name);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare the data to save
    const dataToSave = {
      ...formData,
      // Include the original ID if in edit mode
      ...(isEditMode && city && { id: city.id })
    };
    
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-slideDown">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {isEditMode ? 'Edit City Rule' : 'Add New City Rule'}
            </h2>
            <button
              onClick={onClose}
              className="text-orange-100 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* City Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <select
              value={formData.cityId}
              onChange={handleCitySelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              disabled={isEditMode} // Disable if in edit mode
            >
              <option value="">Select a city</option>
              {availableCities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>

          {/* Display selected city name (read-only) */}
          {formData.cityName && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                Selected City: <span className="font-medium">{formData.cityName}</span>
                {formData.cityId && (
                  <span className="ml-2 text-xs text-gray-500">(ID: {formData.cityId})</span>
                )}
              </p>
            </div>
          )}

          {/* Base Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Fee (₹)
              </label>
              <input
                type="number"
                value={formData.baseFee}
                onChange={(e) => handleChange('baseFee', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                min="0"
                step="0.1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Distance (km)
              </label>
              <input
                type="number"
                value={formData.baseKm}
                onChange={(e) => handleChange('baseKm', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                min="0"
                step="0.1"
                required
              />
            </div>
          </div>

          {/* Per KM Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Per KM Fee Beyond Base (₹/km)
            </label>
            <input
              type="number"
              value={formData.perKmFeeBeyondBase}
              onChange={(e) => handleChange('perKmFeeBeyondBase', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min="0"
              step="0.1"
              required
            />
          </div>

          {/* Bonuses */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Bonuses</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peak Hour (₹)
                </label>
                <input
                  type="number"
                  value={formData.bonuses.peakHour}
                  onChange={(e) => handleChange('bonuses.peakHour', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rain (₹)
                </label>
                <input
                  type="number"
                  value={formData.bonuses.rain}
                  onChange={(e) => handleChange('bonuses.rain', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone (₹)
              </label>
              <input
                type="number"
                value={formData.bonuses.zone}
                onChange={(e) => handleChange('bonuses.zone', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          {/* Manual Override */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.allowManualOverrides}
              onChange={(e) => handleChange('allowManualOverrides', e.target.checked)}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              id="allowManualOverrides"
            />
            <label htmlFor="allowManualOverrides" className="text-sm text-gray-700">
              Allow manual overrides
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.cityId}
            className="px-4 py-2 text-sm text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditMode ? 'Update Rule' : 'Add Rule'}
          </button>
        </div>
      </div>
    </div>
  );
};
// View City Modal Component
const ViewCityModal = ({ city, onClose, onEdit }) => {
  if (!city) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-slideDown">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              City Rule Details
            </h2>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{city.cityName}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${city.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {city.enabled ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Base Fee</label>
              <p className="text-lg font-semibold text-gray-900">₹{city.baseFee}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Base Distance</label>
              <p className="text-lg font-semibold text-gray-900">{city.baseKm} km</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Per KM Fee Beyond Base</label>
            <p className="text-lg font-semibold text-gray-900">₹{city.perKmFeeBeyondBase}/km</p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Bonuses</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Peak Hour</label>
                <p className="text-md font-semibold text-gray-900">₹{city.bonuses?.peakHour || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Rain</label>
                <p className="text-md font-semibold text-gray-900">₹{city.bonuses?.rain || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Zone</label>
                <p className="text-md font-semibold text-gray-900">₹{city.bonuses?.zone || 0}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-500">Manual Overrides</label>
            <p className="text-md font-semibold text-gray-900">{city.allowManualOverrides ? 'Allowed' : 'Not Allowed'}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            Edit Rule
          </button>
        </div>
      </div>
    </div>
  );
};

// Global Settings Tab Component
const GlobalSettingsTab = ({ settings, onChange, onSave, loading }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Settings className="w-6 h-6 text-orange-500" />
        <h2 className="text-lg font-semibold text-gray-900">Global Settings</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Base Fee */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Base Delivery Fee (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                value={settings.baseFee === 0 ? '' : settings.baseFee}
                onChange={(e) => onChange('baseFee', e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
                placeholder="25"
              />
            </div>
          </div>

          {/* Base Km */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Base Distance Included (km)</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={settings.baseKm === 0 ? '' : settings.baseKm}
                onChange={(e) => onChange('baseKm', e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
                placeholder="2"
              />
            </div>
          </div>

          {/* Per Km Fee */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Per km Fee beyond base distance</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                step="0.1"
                value={settings.perKmFeeBeyondBase === 0 ? '' : settings.perKmFeeBeyondBase}
                onChange={(e) => onChange('perKmFeeBeyondBase', e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full pl-8 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
                placeholder="3"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">/km</span>
            </div>
          </div>

          {/* Peak Hour Bonus */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Peak Hour Bonus (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                value={settings.bonuses.peakHour === 0 ? '' : settings.bonuses.peakHour}
                onChange={(e) => onChange('bonuses', {...settings.bonuses, peakHour: e.target.value === '' ? '' : parseFloat(e.target.value)})}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
                placeholder="10"
              />
            </div>
          </div>

          {/* Rain Bonus */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Rain Bonus (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                value={settings.bonuses.rain === 0 ? '' : settings.bonuses.rain}
                onChange={(e) => onChange('bonuses', {...settings.bonuses, rain: e.target.value === '' ? '' : parseFloat(e.target.value)})}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
                placeholder="0"
              />
            </div>
          </div>

          {/* Zone Bonus */}
      <div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">Zone Bonus (₹)</label>
  <div className="relative">
    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
    <input
      type="number"
      value={settings.bonuses.zone === 0 ? '' : settings.bonuses.zone}
      onChange={(e) => onChange('bonuses', {...settings.bonuses, zone: e.target.value === '' ? '' : parseFloat(e.target.value)})}
      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
      placeholder="5"
    />
  </div>
</div>

          {/* Allow Manual Overrides */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Allow Manual Overrides</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={settings.allowManualOverrides}
                  onChange={() => onChange('allowManualOverrides', true)}
                  className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">✓ Yes</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!settings.allowManualOverrides}
                  onChange={() => onChange('allowManualOverrides', false)}
                  className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onSave}
            disabled={loading}
            className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Global Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// City-wise Settings Tab Component with Table
const CityWiseSettingsTab = ({ 
  citySettings, 
  availableCities, 
  onToggleStatus, 
  onRemoveCity, 
  onSave, 
  loading, 
  onOpenAddModal,
  onOpenEditModal,
  onOpenViewModal
}) => {
  // Filter unused cities based on cityId instead of cityName
const unusedCities = availableCities.filter(city => 
  !citySettings.find(setting => setting.cityId === city.id)
);

  return (
    <div className="space-y-6"> 
      <div className="flex items-center space-x-3">
        <MapPin className="w-6 h-6 text-orange-500" />
        <h2 className="text-lg font-semibold text-gray-900">City-wise Settings</h2>
      </div>

      {/* Add New City Button */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-md font-medium text-gray-900">Manage City Rules</h3>
            <p className="text-sm text-gray-500">Add, view, edit or remove city-specific delivery fee rules</p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>Add New City Rule</span>
          </button>
        </div>
      </div>

      {/* City Settings Table */}
      {citySettings.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span>City</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-900">
                    <div className="flex items-center justify-center space-x-1">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      <span>Base Fee</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-900">
                    <div className="flex items-center justify-center space-x-1">
                      <Navigation className="w-4 h-4 text-gray-600" />
                      <span>Base Km</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-900">
                    <div className="flex items-center justify-center space-x-1">
                      <Target className="w-4 h-4 text-gray-600" />
                      <span>Per Km</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-900">
                    <div className="flex items-center justify-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span>Peak Bonus</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-900">
                    <div className="flex items-center justify-center space-x-1">
                      <Zap className="w-4 h-4 text-gray-600" />
                      <span>Zone Bonus</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              {console.log(citySettings)}
              <tbody className="divide-y divide-gray-100">
                {citySettings.map((city, index) => (
                  <tr key={city.id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    {/* City Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
                        <span className="font-medium text-gray-900">{city.cityId.name}</span>
                        {city.cityId && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            ID: {city.cityId._id}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={city.enabled}
                          onChange={() => onToggleStatus(city.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-orange-600"></div>
                      </label>
                    </td>

                    {/* Base Fee */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center">
                        <span className="font-semibold text-gray-900">₹{city.baseFee}</span>
                      </div>
                    </td>

                    {/* Base Km */}
                    <td className="py-4 px-4 text-center">
                      <span className="font-semibold text-gray-900">{city.baseKm} km</span>
                    </td>

                    {/* Per Km Fee */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center">
                        <span className="font-semibold text-gray-900">₹{city.perKmFeeBeyondBase}/km</span>
                      </div>
                    </td>

                    {/* Peak Hour Bonus */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center">
                        <span className="font-semibold text-gray-900">₹{city.bonuses?.peakHour || 0}</span>
                      </div>
                    </td>

                    {/* Zone Bonus */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center">
                        <span className="font-semibold text-gray-900">₹{city.bonuses?.zone || 0}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => onOpenViewModal(city)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2 rounded-md transition-all duration-300 hover:shadow-md"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenEditModal(city)}
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-2 rounded-md transition-all duration-300 hover:shadow-md"
                          title="Edit Rule"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onRemoveCity(city._id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 rounded-md transition-all duration-300 hover:shadow-md"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Target className="w-4 h-4" />
                <span>{citySettings.length} city rule{citySettings.length !== 1 ? 's' : ''} configured</span>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => {
                    citySettings.forEach(city => onSave(city.id));
                  }}
                  disabled={loading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 text-sm"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving All...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save All Cities</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No City Rules Configured</h3>
          <p className="text-gray-500">Add your first city-specific delivery fee rule above</p>
        </div>
      )}
    </div>
  );
};
// Fee Calculation Preview Component
const FeeCalculationPreview = ({ previewData, setPreviewData, calculateFee, citySettings, globalSettings }) => {
  const feeBreakdown = calculateFee();

  const updatePreviewData = (field, value) => {
    setPreviewData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Simulation Settings</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Delivery Distance</label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={previewData.distance === 0 ? '' : previewData.distance}
              onChange={(e) => updatePreviewData('distance', e.target.value === '' ? '' : parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">km</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">City</label>
          <select
            value={previewData.selectedCityForPreview}
            onChange={(e) => updatePreviewData('selectedCityForPreview', e.target.value)}
            className="w-1/2 sm:w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          >
            <option value="">Global Settings</option>
            {citySettings.map(city => (
              <option key={city._id} value={city.cityName}>{city.cityName}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Time Period</label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={previewData.isPeakHour}
              onChange={(e) => updatePreviewData('isPeakHour', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Peak Hour (7 PM)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Zone Type</label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={previewData.isHighDemandZone}
              onChange={(e) => updatePreviewData('isHighDemandZone', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">High Demand Zone</span>
          </div>
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
        <h5 className="text-lg font-semibold text-green-900 mb-4">Fee Breakdown</h5>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-green-800">Base Fee:</span>
            <span className="font-semibold text-green-900">₹{feeBreakdown.baseFee}</span>
          </div>
          
          {feeBreakdown.extraDistance > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-green-800">
                + Extra Distance ({((previewData.distance || 0) - (previewData.selectedCityForPreview 
                  ? citySettings.find(c => c.cityName === previewData.selectedCityForPreview)?.baseKm || globalSettings.baseKm || 0
                  : globalSettings.baseKm || 0)).toFixed(1)} km):
              </span>
              <span className="font-semibold text-green-900">₹{feeBreakdown.extraDistance.toFixed(1)}</span>
            </div>
          )}
          
          {feeBreakdown.peakBonus > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-green-800">+ Peak Hour Bonus:</span>
              <span className="font-semibold text-green-900">₹{feeBreakdown.peakBonus}</span>
            </div>
          )}
          
          {feeBreakdown.zoneBonus > 0 && (
            <div className="flex justify-between itemsCenter">
              <span className="text-green-800">+ Zone Bonus:</span>
              <span className="font-semibold text-green-900">₹{feeBreakdown.zoneBonus}</span>
            </div>
          )}
          
          <div className="border-t border-green-300 pt-3 flex justify-between items-center">
            <span className="text-lg font-bold text-green-900">= Total Agent Fee:</span>
            <span className="text-xl font-bold text-green-900">₹{feeBreakdown.total.toFixed(1)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 hover:shadow-lg text-sm"
          >
            <Calculator className="w-4 h-4" />
            <span>Recalculate</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// CSS animations
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideDown {
    from { 
      opacity: 0; 
      transform: translateY(-10px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes slideIn {
    from { width: 0; }
    to { width: 100%; }
  }
  
  .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
  .animate-slideDown { animation: slideDown 0.3s ease-out; }
  .animate-slideIn { animation: slideIn 0.3s ease-out; }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default AgentDeliveryFeeSettings;