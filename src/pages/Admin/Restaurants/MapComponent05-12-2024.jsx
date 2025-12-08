import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { MapPin, Search, X, Save, Edit, Globe, Home } from "lucide-react";

mapboxgl.accessToken = 'pk.eyJ1IjoiYW1hcm5hZGg2NSIsImEiOiJjbWJ3NmlhcXgwdTh1MmlzMWNuNnNvYmZ3In0.kXrgLZhaz0cmbuCvyxOd6w';

const MapComponent = ({ latitude, longitude, onSave, onAddressUpdate }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  
  // const [selectedLocation, setSelectedLocation] = useState([longitude || 76.3000, latitude || 10.0000]);
  const [selectedLocation, setSelectedLocation] = useState(() => {
  // Use props if they exist, otherwise use defaults
    return longitude && latitude ? [longitude, latitude] : [76.3000, 10.0000];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const [addressData, setAddressData] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    fullAddress: "",
    longitude: longitude && latitude ? longitude : 76.3000,
    latitude: longitude && latitude ? latitude : 10.0000
  });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current && mapContainer.current) {
      console.log("Initializing map...");
      
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: selectedLocation,
        zoom: 15,
      });
      
      map.addControl(new mapboxgl.NavigationControl());
      mapRef.current = map;

      // Initialize Mapbox Geocoder
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false,
        placeholder: 'Search for places...',
        countries: 'in',
        proximity: {
          longitude: selectedLocation[0],
          latitude: selectedLocation[1]
        },
        zoom: 15
      });

      geocoderRef.current = geocoder;
      
      // Handle search results
      geocoder.on('result', (e) => {
        console.log("Search result selected:", e.result);
        const { center, place_name, text, context } = e.result;
        const [lng, lat] = center;
        
        // Update marker
        addMarker([lng, lat]);
        setSelectedLocation([lng, lat]);
        
        // Parse address from search result
        const address = {
          street: text || '',
          city: '',
          state: '',
          zip: '',
          country: 'India',
          fullAddress: place_name,
          longitude: lng,
          latitude: lat
        };

        // Extract context from result
        if (context) {
          context.forEach(ctx => {
            const id = ctx.id.split('.')[0];
            if (id.includes('place')) address.city = ctx.text;
            if (id.includes('region')) address.state = ctx.text;
            if (id.includes('postcode')) address.zip = ctx.text;
            if (id.includes('country')) address.country = ctx.text;
          });
        }

        setAddressData(address);
        setSearchQuery(place_name);
        setShowSearchResults(false);
        
        // Update parent
        if (onAddressUpdate) {
          onAddressUpdate(address);
        }
      });

      // Add geocoder to map
      map.addControl(geocoder, 'top-left');

      // ALWAYS listen for map clicks - no edit mode restriction
      map.on("click", async (e) => {
        console.log("Map clicked at:", e.lngLat);
        const { lng, lat } = e.lngLat;
        await handleLocationSelect(lng, lat);
      });

      // Add marker if we have coordinates
      if (latitude && longitude) {
        addMarker([longitude, latitude]);
        // Get initial address
        setTimeout(() => {
          getAddressFromCoordinates(longitude, latitude);
        }, 1000);
      } else {
        // Center on default
        addMarker(selectedLocation);
      }
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty dependency array - init once

  // Update when props change
  useEffect(() => {
    if (latitude && longitude && mapRef.current) {
      const newCoords = [longitude, latitude];
      setSelectedLocation(newCoords);
      
      if (markerRef.current) {
        markerRef.current.setLngLat(newCoords);
      } else {
        addMarker(newCoords);
      }
      
      mapRef.current.flyTo({
        center: newCoords,
        zoom: 15,
        duration: 1000
      });
      
      getAddressFromCoordinates(longitude, latitude);
    }
  }, [latitude, longitude]);

  const addMarker = (coordinates) => {
    if (!mapRef.current) return;
    
    if (markerRef.current) {
      markerRef.current.remove();
    }
    
    const el = document.createElement("div");
    el.style.backgroundColor = "#ec4899";
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

  const handleSearchChange = (value) => {
    setSearchQuery(value);

    if (!value.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      searchLocation(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSearchSelect = async (feature) => {
    const [lng, lat] = feature.center;

    addMarker([lng, lat]);
    setSelectedLocation([lng, lat]);

    const locationData = await getAddressFromCoordinates(lng, lat);

    const newAddressData = {
      street: feature.place_name || locationData.fullAddress,
      city: locationData.components.city || '',
      state: locationData.components.state || '',
      zip: locationData.components.zip || '',
      country: locationData.components.country || 'India',
      fullAddress: feature.place_name || locationData.fullAddress,
      longitude: lng,
      latitude: lat
    };

    setAddressData(newAddressData);
    setSearchQuery(feature.place_name || locationData.fullAddress);
    setShowSearchResults(false);
    setSearchResults([]);
    
    // Update parent
    if (onAddressUpdate) {
      onAddressUpdate(newAddressData);
    }
  };

  const parseAddressComponents = (features) => {
    const address = {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'India',
      landmark: ''
    };
    
    features.forEach(feature => {
      const placeType = feature.place_type[0];
      const text = feature.text;
      
      switch (placeType) {
        case 'address':
          address.street = feature.place_name || feature.text;
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
        if (ctx.id.includes('locality') && !address.landmark) {
          address.landmark = ctx.text;
        }
        if (ctx.id.includes('country')) {
          address.country = ctx.text;
        }
      });
    }
    
    return address;
  };

  const getAddressFromCoordinates = async (lng, lat) => {
    try {
      setIsLoading(true);
      
      // Try to get address first
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&country=in`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const addressComponents = parseAddressComponents([feature]);
        
        const newAddressData = {
          street: addressComponents.street || feature.place_name || "",
          city: addressComponents.city || "",
          state: addressComponents.state || "",
          zip: addressComponents.zip || "",
          country: addressComponents.country || "India",
          fullAddress: feature.place_name || `${addressComponents.street}, ${addressComponents.city}`,
          longitude: lng,
          latitude: lat
        };
        
        setAddressData(newAddressData);
        setSearchQuery(feature.place_name || "");
        
        // Update parent
        if (onAddressUpdate) {
          onAddressUpdate(newAddressData);
        }
        
        return {
          fullAddress: feature.place_name,
          components: addressComponents
        };
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    } finally {
      setIsLoading(false);
    }
    
    return {
      fullAddress: "Address not found",
      components: {}
    };
  };

  const handleLocationSelect = async (lng, lat) => {
    console.log("Selecting location:", lng, lat);
    
    const coordinates = [lng, lat];
    addMarker(coordinates);
    setSelectedLocation(coordinates);
    
    await getAddressFromCoordinates(lng, lat);
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}&country=IN&limit=1`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;
        
        await handleLocationSelect(lng, lat);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ 
        longitude: selectedLocation[0], 
        latitude: selectedLocation[1] 
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original
    const originalCoords = [longitude || 76.3000, latitude || 10.0000];
    setSelectedLocation(originalCoords);
    
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLngLat(originalCoords);
      mapRef.current.flyTo({
        center: originalCoords,
        zoom: 15
      });
    }
    
    if (latitude && longitude) {
      getAddressFromCoordinates(longitude, latitude);
    }
    
    setIsEditing(false);
  };

  return (
    <div className="border border-pink-200 rounded-xl bg-gradient-to-br from-white to-pink-50 shadow-sm overflow-hidden">
      {/* Map Header */}
      <div className="px-5 py-3 border-b border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-pink-500 mr-2" />
            <h3 className="text-base font-bold text-gray-900">Restaurant Location</h3>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-md transition-all"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Location
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:shadow-md transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Location
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="p-5">
        <div className="relative rounded-lg overflow-hidden border border-pink-300 shadow-sm">
          <div 
            ref={mapContainer} 
            style={{ height: "400px", width: "100%" }}
            className="rounded-lg"
          />
          
          {/* Always show click instruction */}
          <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-lg shadow-lg z-10">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">
                Click anywhere on map to place pin
              </span>
            </div>
          </div>
          
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-20 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading...</p>
              </div>
            </div>
          )}
        </div>

        {/* Custom Search Box (Alternative to built-in) */}
        <div className="mt-4">
          <label className="flex items-center text-sm font-medium text-pink-800 mb-2">
            <Search className="w-4 h-4 mr-1.5 text-pink-500" />
            Search Address
          </label>
          <div className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                className="w-full px-4 py-2.5 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-colors pl-10"
                placeholder="Search for address, place, or landmark..."
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-pink-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((feature, index) => (
                  <div
                    key={feature.id || index}
                    onClick={() => handleSearchSelect(feature)}
                    className="p-3 hover:bg-pink-50 cursor-pointer border-b border-pink-100 last:border-b-0"
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
          <p className="text-xs text-pink-500 mt-1">
            Search for address or click on map to update location
          </p>
        </div>

        {/* Coordinates Display */}
        <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-pink-800 flex items-center">
              <Globe className="w-4 h-4 mr-1.5" />
              Current Coordinates
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-pink-700">Longitude</label>
              <div className="bg-white px-3 py-2 rounded border border-pink-200 text-gray-700 font-mono">
                {selectedLocation[0]?.toFixed(6)}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-pink-700">Latitude</label>
              <div className="bg-white px-3 py-2 rounded border border-pink-200 text-gray-700 font-mono">
                {selectedLocation[1]?.toFixed(6)}
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs text-pink-600">
            {isEditing ? (
              <span className="text-green-600 font-semibold">Editing: Click map to update location, then Save</span>
            ) : (
              <span>Click "Edit Location" to change coordinates</span>
            )}
          </div>
        </div>

        {/* Address Preview */}
        {addressData.fullAddress && (
          <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
            <div className="flex items-start">
              <Home className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-emerald-800 mb-2">📍 Detected Address</h4>
                <p className="text-sm text-emerald-700 mb-2">{addressData.fullAddress}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {addressData.street && (
                    <div className="text-xs">
                      <span className="text-emerald-600 font-medium">Street:</span>
                      <span className="text-emerald-800 ml-1">{addressData.street}</span>
                    </div>
                  )}
                  {addressData.city && (
                    <div className="text-xs">
                      <span className="text-emerald-600 font-medium">City:</span>
                      <span className="text-emerald-800 ml-1">{addressData.city}</span>
                    </div>
                  )}
                  {addressData.state && (
                    <div className="text-xs">
                      <span className="text-emerald-600 font-medium">State:</span>
                      <span className="text-emerald-800 ml-1">{addressData.state}</span>
                    </div>
                  )}
                  {addressData.zip && (
                    <div className="text-xs">
                      <span className="text-emerald-600 font-medium">Zip:</span>
                      <span className="text-emerald-800 ml-1">{addressData.zip}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-emerald-600 mt-3">
                  This address will auto-populate in the form fields
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Note about built-in search */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Note:</strong> There's also a built-in search box on the top-left of the map
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;