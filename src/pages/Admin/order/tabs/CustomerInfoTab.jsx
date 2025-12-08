import React, { useState, useRef, useEffect } from 'react';
import { FiUser, FiPhone, FiMail, FiMapPin, FiClock, FiCheck, FiEdit3, FiSearch, FiChevronDown, FiChevronUp, FiPlus, FiSave, FiX, FiMap, FiNavigation, FiHome, FiTrash2, FiEdit } from 'react-icons/fi';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { addressService } from '../../../../services/addressService';

mapboxgl.accessToken = 'pk.eyJ1IjoiYW1hcm5hZGg2NSIsImEiOiJjbWJ3NmlhcXgwdTh1MmlzMWNuNnNvYmZ3In0.kXrgLZhaz0cmbuCvyxOd6w';

// MapLocationPicker Component
const MapLocationPicker = ({ 
  onSave, 
  onClose, 
  selectedCustomer, 
  editMode = false, 
  existingAddress = null 
}) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Initialize with existing address data or empty values
  const [addressData, setAddressData] = useState({
    type: existingAddress?.type || 'Other',
    street: existingAddress?.street || '',
    area: existingAddress?.area || '',
    landmark: existingAddress?.landmark || '',
    city: existingAddress?.city || '',
    state: existingAddress?.state || '',
    zip: existingAddress?.zip || '',
    country: existingAddress?.country || 'India',
    longitude: existingAddress?.location?.coordinates?.[0] || '',
    latitude: existingAddress?.location?.coordinates?.[1] || '',
    displayName: existingAddress?.displayName || existingAddress?.type || ''
  });

  useEffect(() => {
    if (!mapRef.current && mapContainer.current) {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: existingAddress?.location?.coordinates ? 
          [existingAddress.location.coordinates[0], existingAddress.location.coordinates[1]] : 
          [76.3000, 10.0000],
        zoom: existingAddress?.location?.coordinates ? 15 : 12,
      });

      map.addControl(new mapboxgl.NavigationControl());
      mapRef.current = map;

      // Add geolocate control
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserLocation: true,
      });
      map.addControl(geolocate);

      map.on("click", async (e) => {
        const { lng, lat } = e.lngLat;
        await handleLocationSelect(lng, lat);
      });

      // Auto-detect user location on load
      geolocate.on('geolocate', async (e) => {
        const { longitude, latitude } = e.coords;
        await handleLocationSelect(longitude, latitude);
      });

      // If editing existing address, add marker at existing location
      if (existingAddress?.location?.coordinates) {
        const [lng, lat] = existingAddress.location.coordinates;
        addMarker([lng, lat]);
        setSelectedLocation([lng, lat]);
        // Set search query to existing address
        setSearchQuery(existingAddress.street || '');
      } else {
        // Trigger geolocate on load for new addresses
        setTimeout(() => {
          geolocate.trigger();
        }, 1000);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [existingAddress]);

  // Search for locations based on address query
  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&country=IN&limit=5`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        setSearchResults(data.features);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error("Error searching location:", error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    
    // Clear results if query is empty
    if (!value.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      searchLocation(value);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  // Handle selection from search results
  const handleSearchSelect = async (feature) => {
    const [lng, lat] = feature.center;
    
    // Update map view
    addMarker([lng, lat]);
    setSelectedLocation([lng, lat]);
    
    // Get detailed address information
    const locationData = await getAddressFromCoordinates(lng, lat);
    
    // Update address fields
    setAddressData(prev => ({
      ...prev,
      street: feature.place_name || locationData.fullAddress,
      area: locationData.components.area || prev.area,
      city: locationData.components.city || prev.city,
      state: locationData.components.state || prev.state,
      zip: locationData.components.zip || prev.zip,
      landmark: locationData.components.landmark || prev.landmark,
      longitude: lng.toString(),
      latitude: lat.toString()
    }));
    
    // Update search query and hide results
    setSearchQuery(feature.place_name || locationData.fullAddress);
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const addMarker = (coordinates) => {
    if (markerRef.current) {
      markerRef.current.remove();
    }

    const el = document.createElement("div");
    el.className = "location-marker";
    el.style.backgroundColor = "#f97316";
    el.style.width = "24px";
    el.style.height = "24px";
    el.style.borderRadius = "50%";
    el.style.border = "3px solid white";
    el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
    el.style.cursor = "pointer";

    markerRef.current = new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .addTo(mapRef.current);

    mapRef.current.flyTo({
      center: coordinates,
      zoom: 15,
      duration: 1000
    });
  };

  const parseAddressComponents = (features) => {
    console.log('🔍 Parsing address components from features:', features);
    
    const address = {
      street: '',
      area: '',
      city: '',
      state: '',
      zip: '',
      landmark: '',
      country: 'India'
    };

    // Sort features by relevance (address types first)
    const sortedFeatures = [...features].sort((a, b) => {
      const priority = {
        'address': 1,
        'poi': 2,
        'neighborhood': 3,
        'locality': 4,
        'place': 5,
        'region': 6,
        'postcode': 7
      };
      return (priority[a.place_type[0]] || 99) - (priority[b.place_type[0]] || 99);
    });

    sortedFeatures.forEach(feature => {
      const placeType = feature.place_type[0];
      const text = feature.text;
      const context = feature.context;

      console.log(`📍 Processing ${placeType}:`, text);

      switch (placeType) {
        case 'address':
          if (!address.street) {
            address.street = feature.place_name || text;
          }
          break;
        case 'poi':
          if (!address.landmark && !address.street.includes(text)) {
            address.landmark = text;
          }
          break;
        case 'neighborhood':
        case 'locality':
          if (!address.area) address.area = text;
          break;
        case 'place':
          if (!address.city) address.city = text;
          break;
        case 'region':
          if (!address.state) address.state = text;
          break;
        case 'postcode':
          if (!address.zip) address.zip = text;
          break;
        default:
          break;
      }

      // Extract from context if available
      if (context) {
        context.forEach(ctx => {
          const ctxId = ctx.id;
          if (ctxId.includes('place') && !address.city) {
            address.city = ctx.text;
          } else if (ctxId.includes('region') && !address.state) {
            address.state = ctx.text;
          } else if (ctxId.includes('postcode') && !address.zip) {
            address.zip = ctx.text;
          } else if (ctxId.includes('locality') && !address.area && !ctxId.includes('place')) {
            address.area = ctx.text;
          } else if (ctxId.includes('country') && !address.country) {
            address.country = ctx.text;
          }
        });
      }
    });

    // If we still don't have a street address, use the first feature's place_name
    if (!address.street && features[0]?.place_name) {
      address.street = features[0].place_name;
    }

    console.log('✅ Final parsed address:', address);
    return address;
  };

  const getAddressFromCoordinates = async (lng, lat) => {
    try {
      setIsLoading(true);
      console.log('🌍 Fetching address for coordinates:', lng, lat);
      
      // Try different types in order of preference
      const typesToTry = ['address', 'poi', 'place', 'neighborhood'];
      
      for (const type of typesToTry) {
        console.log(`🔄 Trying type: ${type}`);
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&types=${type}&limit=3`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            console.log(`✅ Found results with type: ${type}`, data.features);
            const addressComponents = parseAddressComponents(data.features);
            return {
              fullAddress: data.features[0].place_name,
              components: addressComponents
            };
          }
        }
      }
      
      // If no types returned results, create manual address
      console.warn('⚠️ No results found with any type');
      return createManualAddressFromCoords(lng, lat);
      
    } catch (error) {
      console.error("❌ Error fetching address:", error);
      return createManualAddressFromCoords(lng, lat);
    } finally {
      setIsLoading(false);
    }
  };

  const createManualAddressFromCoords = (lng, lat) => {
    return {
      fullAddress: `Location at ${lng.toFixed(6)}, ${lat.toFixed(6)}`,
      components: {
        street: `Location at ${lng.toFixed(6)}, ${lat.toFixed(6)}`,
        area: 'Area',
        city: 'City',
        state: 'Kerala',
        zip: '',
        landmark: '',
        country: 'India'
      }
    };
  };

  // Fallback search with fewer restrictions
  const fallbackAddressSearch = async (lng, lat) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&limit=1`
      );
      
      if (!response.ok) throw new Error('Fallback search failed');
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return {
          fullAddress: data.features[0].place_name,
          components: {
            area: data.features[0].text || '',
            city: '',
            state: '',
            zip: '',
            landmark: ''
          }
        };
      }
      
      return {
        fullAddress: "Location details unavailable",
        components: {}
      };
    } catch (error) {
      console.error("Fallback search error:", error);
      return {
        fullAddress: "Location details unavailable",
        components: {}
      };
    }
  };

  const handleLocationSelect = async (lng, lat) => {
    const coordinates = [lng, lat];
    addMarker(coordinates);
    setSelectedLocation(coordinates);
    
    // Immediately update coordinates in the form
    setAddressData(prev => ({
      ...prev,
      longitude: lng.toString(),
      latitude: lat.toString()
    }));

    try {
      const locationData = await getAddressFromCoordinates(lng, lat);
      
      setAddressData(prev => ({
        ...prev,
        street: locationData.fullAddress,
        area: locationData.components.area || prev.area,
        city: locationData.components.city || prev.city,
        state: locationData.components.state || prev.state,
        zip: locationData.components.zip || prev.zip,
        landmark: locationData.components.landmark || prev.landmark,
        country: locationData.components.country || prev.country,
        longitude: lng.toString(),
        latitude: lat.toString()
      }));

      // Update search query
      setSearchQuery(locationData.fullAddress);
    } catch (error) {
      console.error('Error in handleLocationSelect:', error);
      // Fallback address
      const fallbackAddress = `Location at ${lng.toFixed(6)}, ${lat.toFixed(6)}`;
      setAddressData(prev => ({
        ...prev,
        street: fallbackAddress,
        area: 'Area',
        city: 'City', 
        state: 'Kerala',
        country: 'India'
      }));
      setSearchQuery(fallbackAddress);
    }
  };

  const handleSave = () => {
    if (!addressData.street.trim()) {
      alert('Please select a location on the map or enter an address');
      return;
    }
    
    if (!selectedLocation && !editMode) {
      alert('Please select a location on the map');
      return;
    }

    // Prepare data for API - match backend expectations
    const apiData = {
      type: addressData.type,
      displayName: addressData.displayName, 
      street: addressData.street,
      area: addressData.area,
      landmark: addressData.landmark,
      city: addressData.city,
      state: addressData.state,
      zip: addressData.zip,
      country: addressData.country,
      longitude: addressData.longitude,
      latitude: addressData.latitude
    };

    onSave(apiData);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setAddressData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                {editMode ? <FiEdit className="text-orange-500 text-xl" /> : <FiMap className="text-orange-500 text-xl" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {editMode ? 'Edit Address' : 'Add Delivery Address'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {editMode ? 'Update the address details and location' : 'Search for address or click on the map to select location'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <FiX className="text-lg text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="w-full lg:w-2/5 p-6 overflow-y-auto border-r border-gray-200">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Search Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 pl-10 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Search for address, place, or landmark..."
                    onKeyPress={handleKeyPress}
                  />
                  {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                    </div>
                  )}
                </div>
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((feature, index) => (
                      <div
                        key={feature.id || index}
                        onClick={() => handleSearchSelect(feature)}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-sm text-gray-800">
                          {feature.text}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {feature.place_name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Address Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addressData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Home, Office, etc."
                  onKeyPress={handleKeyPress}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={addressData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Search above or click on map to auto-fill address"
                  required
                />
                {selectedLocation && (
                  <p className="text-xs text-green-600 mt-1 flex items-center space-x-1">
                    <FiMapPin className="text-xs" />
                    <span>Location selected - coordinates: {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}</span>
                  </p>
                )}
                {editMode && existingAddress?.location && !selectedLocation && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center space-x-1">
                    <FiMapPin className="text-xs" />
                    <span>Current location: {existingAddress.location.coordinates[0].toFixed(6)}, {existingAddress.location.coordinates[1].toFixed(6)}</span>
                  </p>
                )}
                {isLoading && (
                  <p className="text-xs text-blue-600 mt-1">Loading address details...</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Area/Locality</label>
                  <input
                    type="text"
                    value={addressData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Area/Locality"
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Landmark</label>
                  <input
                    type="text"
                    value={addressData.landmark}
                    onChange={(e) => handleInputChange('landmark', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Nearby landmark"
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
                  <input
                    type="text"
                    value={addressData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="City"
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">State</label>
                  <input
                    type="text"
                    value={addressData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="State"
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ZIP Code</label>
                  <input
                    type="text"
                    value={addressData.zip}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="ZIP Code"
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Country</label>
                  <input
                    type="text"
                    value={addressData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Country"
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-6 mt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || (!selectedLocation && !editMode)}
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editMode ? 'Update Address' : 'Save Address'}</span>
                )}
              </button>
            </div>
          </div>

          <div className="w-full lg:w-3/5 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FiNavigation className="text-orange-500" />
                <span>
                  {editMode 
                    ? 'Search for address or click anywhere on the map to update location' 
                    : 'Search for address or click anywhere on the map to select delivery location'
                  }
                </span>
                {isLoading && (
                  <span className="ml-auto text-orange-600 flex items-center space-x-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-600"></div>
                    <span>Searching...</span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 relative">
              <div 
                ref={mapContainer} 
                style={{ height: "100%", width: "100%" }}
                className="rounded-r-lg"
              />
              
              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-r-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading address details...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Address Card Component
const AddressCard = ({ 
  address, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete
}) => {
  return (
    <div 
      className={`relative bg-white rounded-lg border-2 p-3 transition-all cursor-pointer transform hover:scale-[1.02] ${
        isSelected 
          ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg' 
          : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
      }`}
      onClick={() => onSelect(address)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded-full ${
            isSelected ? 'bg-orange-500' : 'bg-gray-300'
          }`}>
            <FiMapPin className={`text-xs ${
              isSelected ? 'text-white' : 'text-gray-600'
            }`} />
          </div>
          <span className="font-medium text-gray-800 text-sm">
            {address.type || 'Address'}
          </span>
          {isSelected && (
            <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-medium animate-pulse">
              ✓ Selected
            </span>
          )}
        </div>
        <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`p-1 rounded transition-all ${
              isSelected 
                ? 'text-white bg-orange-400 hover:bg-orange-500' 
                : 'text-blue-600 hover:bg-blue-100'
            }`}
            onClick={() => onEdit(address)}
          >
            <FiEdit3 className="text-sm" />
          </button>
          <button
            type="button"
            className={`p-1 rounded transition-all ${
              isSelected 
                ? 'text-white bg-red-400 hover:bg-red-500' 
                : 'text-red-600 hover:bg-red-100'
            }`}
            onClick={() => onDelete(address._id)}
          >
            <FiTrash2 className="text-sm" />
          </button>
        </div>
      </div>
      
      <div className={`text-xs space-y-0.5 ${
        isSelected ? 'text-gray-700' : 'text-gray-600'
      }`}>
        <div className="line-clamp-2 font-medium">{address.street}</div>
        {address.area && <div className="flex items-center space-x-1">
          <FiHome className="text-gray-400" />
          <span>{address.area}</span>
        </div>}
        {address.landmark && <div className="flex items-center space-x-1">
          <FiNavigation className="text-gray-400" />
          <span>Landmark: {address.landmark}</span>
        </div>}
        <div className="flex items-center space-x-1">
          <FiMapPin className="text-gray-400" />
          <span>
            {address.city}, {address.state} - {address.zip}
          </span>
        </div>
        {address.country && address.country !== 'India' && (
          <div>{address.country}</div>
        )}
        {address.location && (
          <div className="text-gray-500 mt-1 flex items-center space-x-1">
            <FiMap className="text-xs" />
            <span className="text-xs">
              Location: {address.location.coordinates[0].toFixed(4)}, {address.location.coordinates[1].toFixed(4)}
            </span>
          </div>
        )}
      </div>
      
      {/* Selection indicator bar */}
      {isSelected && (
        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 rounded-l-lg"></div>
      )}
    </div>
  );
};

// Main CustomerInfoTab Component
const CustomerInfoTab = ({
  form,
  setForm,
  selectedCustomer,
  searchTerm,
  setSearchTerm,
  showCustomerDropdown,
  setShowCustomerDropdown,
  filteredCustomers,
  handleCustomerSelect,
  customerRef,
  deliveryModes,
  handleDeliveryModeChange,
  deliveryOptions,
  handleDeliveryOptionChange,
  currentDeliveryMode,
  customerAddresses,
  setCustomerAddresses,
  expandedAddress,
  setExpandedAddress,
  handleAddressSelect,
  loadingAddresses,
  formatAddress
}) => {
  const [showAddAddressPopup, setShowAddAddressPopup] = useState(false);
  const [showEditAddressPopup, setShowEditAddressPopup] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fixed handleAddressSelect function
  const fixedHandleAddressSelect = (address) => {
    setForm(prev => ({
      ...prev,
      address: formatAddress(address),
      selectedAddressId: address._id   // This is the key fix
    }));
  };

  // Fixed handleAddAddress function
  const fixedHandleAddAddress = async (newAddressData) => {
    if (!selectedCustomer) return;

    try {
      setLoading(true);
      const response = await addressService.addCustomerAddress(
        selectedCustomer.userId, 
        newAddressData
      );
      
      if (response.data) {
        const newAddress = response.data;
        setCustomerAddresses(prev => [...prev, newAddress]);
        
        // Auto-select the newly added address
        fixedHandleAddressSelect(newAddress);
      }
      
      setShowAddAddressPopup(false);
      alert('Address added successfully!');
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fixed handleEditSave function
  const fixedHandleEditSave = async (updatedAddressData) => {
    if (!selectedCustomer || !editingAddress) return;

    try {
      setLoading(true);
      
      const updateData = {
        type: updatedAddressData.type || editingAddress.type,
        street: updatedAddressData.street,
        area: updatedAddressData.area || '',
        landmark: updatedAddressData.landmark || '',
        city: updatedAddressData.city,
        state: updatedAddressData.state,
        zip: updatedAddressData.zip,
        country: updatedAddressData.country || 'India',
        longitude: updatedAddressData.longitude,
        latitude: updatedAddressData.latitude
      };

      const response = await addressService.updateCustomerAddress(
        selectedCustomer.userId, 
        editingAddress._id, 
        updateData
      );
      
      const updatedAddress = { 
        ...editingAddress, 
        ...updateData,
        location: {
          type: "Point",
          coordinates: [parseFloat(updateData.longitude), parseFloat(updateData.latitude)]
        }
      };
      
      setCustomerAddresses(prev => 
        prev.map(addr => 
          addr._id === editingAddress._id ? updatedAddress : addr
        )
      );
      
      // If the edited address was selected, update the form address
      if (form.selectedAddressId === editingAddress._id) {
        setForm(prev => ({
          ...prev,
          address: formatAddress(updatedAddress)
        }));
      }
      
      setShowEditAddressPopup(false);
      setEditingAddress(null);
      
      alert('Address updated successfully!');
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to update address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId) => {
    if (!selectedCustomer || !confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setLoading(true);
      await addressService.deleteCustomerAddress(selectedCustomer.userId, addressId);
      
      setCustomerAddresses(prev => prev.filter(addr => addr._id !== addressId));
      
      // If the deleted address was selected, clear the selection
      if (form.selectedAddressId === addressId) {
        setForm(prev => ({ 
          ...prev, 
          address: '',
          selectedAddressId: ''
        }));
      }
      
      alert('Address deleted successfully!');
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh addresses
  const refreshAddresses = async () => {
    if (!selectedCustomer) return;
    
    try {
      setLoading(true);
      const response = await addressService.getCustomerAddresses(selectedCustomer.userId);
      if (response.success) {
        setCustomerAddresses(response.data.addresses || []);
      }
    } catch (error) {
      console.error('Error refreshing addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Start editing address with map modal
  const handleEditStart = (address) => {
    setEditingAddress(address);
    setShowEditAddressPopup(true);
  };

  // Auto-expand addresses when home delivery or pick_drop is selected
  useEffect(() => {
    if ((form.deliveryMode === "home_delivery" || form.deliveryMode === "pick_drop") && selectedCustomer) {
      setExpandedAddress(true);
    }
  }, [form.deliveryMode, selectedCustomer]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <FiUser className="text-orange-600 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Customer Information</h2>
          <p className="text-gray-600 text-sm">Select customer and delivery preferences</p>
        </div>
      </div>

      {/* Customer Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 relative" ref={customerRef}>
          <label className="text-sm font-medium text-gray-700">Customer Name</label>
          <div className="relative">
            <FiUser className="absolute left-3 top-3 text-orange-400 text-sm z-10" />
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowCustomerDropdown(true);
              }}
              onFocus={() => setShowCustomerDropdown(true)}
              className="pl-10 w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              placeholder="Search customer..."
            />
            <FiSearch className="absolute right-3 top-3 text-gray-400 text-sm" />
          </div>

          {showCustomerDropdown && filteredCustomers.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto mt-1">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.userId}
                  className="p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="font-medium text-gray-800">{customer.name}</div>
                  <div className="text-sm text-gray-600">{customer.phone}</div>
                  <div className="text-xs text-gray-500 truncate">{customer.email}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Phone</label>
          <div className="relative">
            <FiPhone className="absolute left-3 top-3 text-orange-400 text-sm" />
            <input
              value={form.customerPhone}
              readOnly
              className="pl-10 w-full border border-gray-300 rounded-lg p-3 text-sm bg-gray-50 text-gray-600"
              placeholder="Phone will auto-fill"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-3 text-orange-400 text-sm" />
            <input
              value={form.customerEmail}
              readOnly
              className="pl-10 w-full border border-gray-300 rounded-lg p-3 text-sm bg-gray-50 text-gray-600"
              placeholder="Email will auto-fill"
            />
          </div>
        </div>
      </div>

      {/* Delivery Mode */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Delivery Mode</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {deliveryModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => handleDeliveryModeChange(mode.id)}
              className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${
                form.deliveryMode === mode.id
                  ? `border-orange-500 bg-orange-50 shadow-md`
                  : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-sm'
              }`}
            >
              <span className="text-2xl">{mode.icon}</span>
              <div className="text-left">
                <div className="font-semibold text-gray-800">{mode.name}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {mode.id === 'take_away' && 'Customer will pick up'}
                  {mode.id === 'home_delivery' && 'Deliver to customer address'}
                  {mode.id === 'pick_drop' && 'Pickup and drop service'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Delivery Options */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Delivery Option</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {deliveryOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleDeliveryOptionChange(option.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                form.deliveryOption === option.id
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-sm'
              }`}
            >
              <div className="font-semibold text-gray-800">{option.name}</div>
              <div className="text-sm text-gray-600 mt-1">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Scheduled Delivery */}
      {form.deliveryOption === "scheduled" && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center space-x-2">
            <FiClock className="text-orange-500" />
            <span>Schedule Delivery</span>
          </h3>
          <div className="relative">
            <FiClock className="absolute left-3 top-3 text-orange-400 text-sm z-10" />
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  scheduledAt: e.target.value,
                }))
              }
              className="pl-10 w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              required
            />
          </div>
        </div>
      )}

      {/* Delivery Address */}
      {(form.deliveryMode === "home_delivery" || form.deliveryMode === "pick_drop") && selectedCustomer && (
        <div className={`space-y-3 p-4 rounded-xl border-2 ${currentDeliveryMode.bgColor} ${currentDeliveryMode.borderColor}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center space-x-2">
              <span className="text-xl">
                {form.deliveryMode === "home_delivery" ? "🏠" : "🚗"}
              </span>
              <span>
                {form.deliveryMode === "home_delivery" ? "Delivery Address" : "Pickup & Drop Address"}
              </span>
            </h3>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={refreshAddresses}
                disabled={loading}
                className="text-sm text-orange-600 hover:text-orange-700 disabled:text-gray-400"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={() => setExpandedAddress(!expandedAddress)}
                className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-sm"
              >
                <span>{expandedAddress ? 'Hide' : 'Show'} saved addresses</span>
                {expandedAddress ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>
          </div>

          {/* Always show address cards when home delivery or pick_drop is selected */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowAddAddressPopup(true)}
              disabled={loading}
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 text-sm font-medium p-2 border border-dashed border-orange-300 rounded-lg hover:bg-orange-50 transition-all w-full justify-center disabled:opacity-50"
            >
              <FiPlus className="text-sm" />
              <span>Add New Address</span>
            </button>

            {loadingAddresses || loading ? (
              <div className="text-center py-4 text-gray-500">
                Loading addresses...
              </div>
            ) : customerAddresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customerAddresses.map((address) => (
                  <AddressCard
                    key={address._id}
                    address={address}
                    isSelected={form.selectedAddressId === address._id}
                    onSelect={fixedHandleAddressSelect}
                    onEdit={handleEditStart}
                    onDelete={handleDeleteAddress}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
                No saved addresses found. Click "Add New Address" to create one.
              </div>
            )}
          </div>

          {/* <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {form.deliveryMode === "home_delivery" ? "Delivery Address" : "Pickup & Drop Address"}
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-orange-400 text-sm" />
              <textarea
                rows={3}
                value={form.address}
                onChange={(e) =>
                  setForm((s) => ({ ...s, address: e.target.value }))
                }
                className="pl-10 w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder={
                  form.deliveryMode === "home_delivery" 
                    ? "Enter delivery address or select from saved addresses above"
                    : "Enter pickup and drop address or select from saved addresses above"
                }
                required
              />
            </div>
          </div> */}
        </div>
      )}

      {/* Pickup Details */}
      {form.deliveryMode === "take_away" && (
        <div className={`space-y-4 p-4 rounded-xl border-2 ${currentDeliveryMode.bgColor} ${currentDeliveryMode.borderColor}`}>
          <h3 className="font-semibold text-gray-800 text-sm flex items-center space-x-2">
            <span className="text-xl">📦</span>
            <span>Pickup Details</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pickup Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-orange-400 text-sm" />
                <input
                  value={form.pickupName}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, pickupName: e.target.value }))
                  }
                  className="pl-10 w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Name for pickup"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pickup Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 text-orange-400 text-sm" />
                <input
                  value={form.pickupPhone}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, pickupPhone: e.target.value }))
                  }
                  className="pl-10 w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Phone for pickup"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pickup Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-orange-400 text-sm" />
                <input
                  type="email"
                  value={form.pickupEmail}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, pickupEmail: e.target.value }))
                  }
                  className="pl-10 w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Email for pickup"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Address Popup */}
      {showAddAddressPopup && (
        <MapLocationPicker
          onSave={fixedHandleAddAddress}
          onClose={() => setShowAddAddressPopup(false)}
          selectedCustomer={selectedCustomer}
        />
      )}

      {/* Edit Address Popup */}
      {showEditAddressPopup && editingAddress && (
        <MapLocationPicker
          onSave={fixedHandleEditSave}
          onClose={() => {
            setShowEditAddressPopup(false);
            setEditingAddress(null);
          }}
          selectedCustomer={selectedCustomer}
          editMode={true}
          existingAddress={editingAddress}
        />
      )}
    </div>
  );
};

export default CustomerInfoTab;