import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { FiSearch, FiTrash2, FiPlus, FiX, FiSave } from 'react-icons/fi';
import { MdOutlineMyLocation } from 'react-icons/md';
import { createGeofence } from '../../../../apis/adminApis/geoFenceApi';
import { useNavigate } from 'react-router-dom';

mapboxgl.accessToken = 'pk.eyJ1IjoiYW1hcm5hZGg2NSIsImEiOiJjbWJ3NmlhcXgwdTh1MmlzMWNuNnNvYmZ3In0.kXrgLZhaz0cmbuCvyxOd6w';

function createCircle(center, radiusInKm) {
  const points = 64, coords = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * (2 * Math.PI);
    const dx = radiusInKm * Math.cos(angle) / 111.32;
    const dy = radiusInKm * Math.sin(angle) / (111.32 * Math.cos(center[1] * Math.PI / 180));
    coords.push([center[0] + dx, center[1] + dy]);
  }
  coords.push(coords[0]);
  return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: { center, radius: radiusInKm } };
}

const GeofenceAdder = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const drawRef = useRef(null);
  const mapContainerRef = useRef(null);

  const [polygon, setPolygon] = useState(null);
  const [type, setType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [circleCenter, setCircleCenter] = useState(null);
  const [circleRadius, setCircleRadius] = useState(0.5);
  const [showRadiusSlider, setShowRadiusSlider] = useState(false);
  const [areaSize, setAreaSize] = useState(0);
  const [regionName, setRegionName] = useState('');
  const [regionDescription, setRegionDescription] = useState('');
  const [geofenceType, setGeofenceType] = useState('delivery_zone');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!regionName) newErrors.regionName = 'Region name is required';
    if (!type) newErrors.type = 'Geofence type is required';
    if (!polygon) newErrors.polygon = 'Please draw a geofence';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const geometry = polygon.geometry;
      const geofenceData = {
        type: geofenceType,
        regionName,
        regionDescription,
        geometry: {
          type: geometry.type,
          coordinates: geometry.coordinates,
          ...(geometry.type === "Polygon" ? {} : { radius: circleRadius })
        },
        active: true,
        lastUpdatedBy: "admin"
      };

      await createGeofence(geofenceData);
      alert("Geofence saved successfully!");
      navigate('/admin/dashboard/geofence');
    } catch (error) {
      console.error("Failed to save geofence", error);
      alert(error.message || "Failed to save geofence");
    }
  };

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [76.32, 9.99],
      zoom: 13,
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
    });

    map.addControl(draw, 'top-left');
    drawRef.current = draw;
    mapRef.current = map;

    map.on('draw.create', (e) => setPolygon(e.features[0]));
    map.on('draw.update', (e) => setPolygon(e.features[0]));
    map.on('draw.delete', () => {
      setPolygon(null);
      setAreaSize(0);
    });

    map.on('click', (e) => {
      if (type === 'Circle') {
        const center = [e.lngLat.lng, e.lngLat.lat];
        const circle = createCircle(center, circleRadius);
        draw.deleteAll();
        draw.add(circle);
        setPolygon(circle);
        setCircleCenter(center);
        setShowRadiusSlider(true);
      }
    });

    return () => map.remove();
  }, [type]);

  useEffect(() => {
    if (polygon) {
      const coords = polygon.geometry.coordinates[0];
      let area = 0;
      for (let i = 0; i < coords.length - 1; i++) {
        const [x1, y1] = coords[i];
        const [x2, y2] = coords[i + 1];
        area += (x1 * y2) - (x2 * y1);
      }
      area = Math.abs(area) * 111.32 * 111.32 / 2;
      setAreaSize(area.toFixed(2));
    }
  }, [polygon]);

  const handleDraw = () => {
    if (!type) {
      setErrors(prev => ({ ...prev, type: 'Please select geofence type' }));
      return;
    }
    if (type === 'Polygon') {
      drawRef.current.changeMode('draw_polygon');
      setShowRadiusSlider(false);
    } else {
      drawRef.current.changeMode('simple_select');
      alert('Click on map to set Circle center');
    }
  };

  const handleLocate = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lng = pos.coords.longitude;
      const lat = pos.coords.latitude;
      mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
    });
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}`
    );
    const data = await res.json();
    if (data.features.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
    } else {
      alert('Place not found');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Side panel */}
      <div className="w-96 p-4 bg-white border-r overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add Geofence</h2>
          <button 
            onClick={() => navigate('/admin/dashboard/geofence')}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Geofence Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Geofence Type *
            </label>
            <select 
              className={`w-full p-2 border rounded ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
              value={geofenceType}
              onChange={(e) => {
                setGeofenceType(e.target.value);
                setErrors(prev => ({ ...prev, type: '' }));
              }}
            >
              <option value="delivery_zone">Delivery Zone</option>
              <option value="service_area">Service Area</option>
              <option value="restricted_area">Restricted Area</option>
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
          </div>

          {/* Drawing Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Drawing Type *
            </label>
            <select 
              className={`w-full p-2 border rounded ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setErrors(prev => ({ ...prev, type: '' }));
              }}
            >
              <option value="">Select Type</option>
              <option value="Polygon">Polygon (Custom Shape)</option>
              <option value="Circle">Circle (Fixed Radius)</option>
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
          </div>

          {/* Region Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region Name *
            </label>
            <input
              type="text"
              className={`w-full p-2 border rounded ${errors.regionName ? 'border-red-500' : 'border-gray-300'}`}
              value={regionName}
              onChange={(e) => {
                setRegionName(e.target.value);
                setErrors(prev => ({ ...prev, regionName: '' }));
              }}
              placeholder="Enter region name"
            />
            {errors.regionName && <p className="mt-1 text-sm text-red-600">{errors.regionName}</p>}
          </div>

          {/* Region Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region Description
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded"
              value={regionDescription}
              onChange={(e) => setRegionDescription(e.target.value)}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>

          {/* Search and Location Controls */}
          <div className="flex gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location"
              className="flex-1 p-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleSearch}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <FiSearch size={18} />
            </button>
            <button
              onClick={handleLocate}
              className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              title="Use my location"
            >
              <MdOutlineMyLocation size={18} />
            </button>
          </div>

          {/* Circle Radius Slider */}
          {type === 'Circle' && showRadiusSlider && (
            <div className="p-3 bg-gray-50 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radius: {circleRadius} km
              </label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={circleRadius}
                onChange={(e) => setCircleRadius(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* Drawing Controls */}
          <div className="flex gap-2">
            <button
              onClick={handleDraw}
              className="flex-1 p-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center gap-2"
              disabled={!type}
            >
              <FiPlus /> {type === 'Circle' ? 'Set Center' : 'Draw Area'}
            </button>
            <button
              onClick={() => drawRef.current?.deleteAll()}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center gap-2"
            >
              <FiTrash2 />
            </button>
          </div>

          {/* Area Information */}
          {polygon && (
            <div className="p-3 bg-blue-50 rounded">
              <p className="text-sm font-medium">
                Area: <span className="font-normal">{areaSize} km²</span>
              </p>
              {errors.polygon && <p className="mt-1 text-sm text-red-600">{errors.polygon}</p>}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2 mt-4"
          >
            <FiSave /> Save Geofence
          </button>
        </div>
      </div>

      {/* Map */}
      <div ref={mapContainerRef} className="flex-1" />
    </div>
  );
};

export default GeofenceAdder;