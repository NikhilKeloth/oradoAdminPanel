import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; // ✅ Required for map to display

// Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoiYW1hcm5hZGg2NSIsImEiOiJjbWJ3NmlhcXgwdTh1MmlzMWNuNnNvYmZ3In0.kXrgLZhaz0cmbuCvyxOd6w';

// Mock data
const mockAreas = [
  { area: 'Koramangala', popularItem: 'Biryani', orderCount: 245, coordinates: [77.6271, 12.9352] },
  { area: 'Indiranagar', popularItem: 'Pizza', orderCount: 198, coordinates: [77.6408, 12.9719] },
  { area: 'Whitefield', popularItem: 'Burger', orderCount: 176, coordinates: [77.7490, 12.9698] },
  { area: 'HSR Layout', popularItem: 'Chinese', orderCount: 154, coordinates: [77.6412, 12.9116] },
  { area: 'Marathahalli', popularItem: 'South Indian', orderCount: 132, coordinates: [77.6974, 12.9560] },
];

const AreaMapDashboard = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null); // Persistent map reference
  const [marker, setMarker] = useState(null); // For moving marker

  useEffect(() => {
    if (mapRef.current) return; // Prevent reinitialization

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [77.5946, 12.9716], // Default center
      zoom: 11,
    });

    mapRef.current = map;

    return () => map.remove();
  }, []);

  const flyToLocation = (coordinates) => {
    if (!mapRef.current) return;

    mapRef.current.flyTo({
      center: coordinates,
      zoom: 14,
      speed: 1.6,
      curve: 1.2,
    });

    // Move existing marker or create new one
    if (marker) {
      marker.setLngLat(coordinates);
    } else {
      const newMarker = new mapboxgl.Marker().setLngLat(coordinates).addTo(mapRef.current);
      setMarker(newMarker);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen">
      {/* Left Panel: Area List */}
      <div className="w-full lg:w-1/3 bg-white p-6 overflow-y-auto border-r border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Most Ordered Areas</h2>
        <div className="space-y-4">
          {mockAreas.map((area, idx) => (
            <div
              key={idx}
              onClick={() => flyToLocation(area.coordinates)}
              className="border p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-800">{area.area}</h3>
              <p className="text-sm text-gray-600 mb-1">
                Popular: <span className="font-medium">{area.popularItem}</span>
              </p>
              <p className="text-sm text-gray-500">{area.orderCount} orders</p>
            </div>
          ))}
        </div>
      </div>
          
      {/* Right Panel: Map */}
      <div className="flex-1 relative">
        <div
          ref={mapContainer}
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
};

export default AreaMapDashboard;
