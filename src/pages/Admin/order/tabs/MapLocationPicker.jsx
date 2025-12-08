import React, { useState, useRef, useEffect } from 'react';
import { FiMap, FiNavigation, FiX, FiMapPin, FiEdit, FiSearch } from 'react-icons/fi';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiYW1hcm5hZGg2NSIsImEiOiJjbWJ3NmlhcXgwdTh1MmlzMWNuNnNvYmZ3In0.kXrgLZhaz0cmbuCvyxOd6w';

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
    displayName: existingAddress?.displayName || ''
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
      longitude: lng,
      latitude: lat
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

  // Improved address parsing function
  const parseAddressComponents = (features) => {
    const address = {
      street: '',
      area: '',
      city: '',
      state: '',
      zip: '',
      landmark: ''
    };

    features.forEach(feature => {
      const placeType = feature.place_type[0];
      const text = feature.text;
      const context = feature.context;

      switch (placeType) {
        case 'address':
          address.street = feature.place_name || feature.text;
          break;
        case 'poi':
          if (!address.landmark) address.landmark = text;
          break;
        case 'neighborhood':
        case 'locality':
          address.area = text;
          break;
        case 'place':
          address.city = text;
          break;
        case 'region':
          address.state = text;
          break;
        case 'postcode':
          address.zip = text;
          break;
        default:
          break;
      }
    });

    // Extract additional info from context
    if (features[0]?.context) {
      features[0].context.forEach(ctx => {
        if (ctx.id.includes('place') && !address.city) {
          address.city = ctx.text;
        }
        if (ctx.id.includes('region') && !address.state) {
          address.state = ctx.text;
        }
        if (ctx.id.includes('postcode') && !address.zip) {
          address.zip = ctx.text;
        }
        if (ctx.id.includes('locality') && !address.area) {
          address.area = ctx.text;
        }
      });
    }

    return address;
  };

  const getAddressFromCoordinates = async (lng, lat) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&types=address,poi,neighborhood,locality,place,region,postcode&limit=10`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const addressComponents = parseAddressComponents(data.features);
        const fullAddress = data.features[0].place_name;
        
        return {
          fullAddress,
          components: addressComponents
        };
      }
      return {
        fullAddress: "Address not found",
        components: {}
      };
    } catch (error) {
      console.error("Error fetching address:", error);
      return {
        fullAddress: "Could not fetch address",
        components: {}
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = async (lng, lat) => {
    const coordinates = [lng, lat];
    addMarker(coordinates);
    
    const locationData = await getAddressFromCoordinates(lng, lat);
    setSelectedLocation(coordinates);
    
    // Auto-fill address fields with proper mapping
    setAddressData(prev => ({
      ...prev,
      street: locationData.fullAddress,
      area: locationData.components.area || prev.area,
      city: locationData.components.city || prev.city,
      state: locationData.components.state || prev.state,
      zip: locationData.components.zip || prev.zip,
      landmark: locationData.components.landmark || prev.landmark,
      longitude: lng,
      latitude: lat
    }));

    // Update search query with the found address
    setSearchQuery(locationData.fullAddress);
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
      type: addressData.displayName || addressData.type,
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
        {/* Header */}
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
          {/* Left Side - Address Form */}
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

            {/* Save Button */}
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

          {/* Right Side - Map */}
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

export default MapLocationPicker;