import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { createSurgeArea } from "../../../apis/surgeApi";
import { format, addHours } from 'date-fns';
import { FiSearch, FiTrash2, FiSave, FiMapPin, FiPlus, FiX } from 'react-icons/fi';
import { MdOutlineMyLocation } from 'react-icons/md';

mapboxgl.accessToken = 'pk.eyJ1IjoiYW1hcm5hZGg2NSIsImEiOiJjbWJ3NmlhcXgwdTh1MmlzMWNuNnNvYmZ3In0.kXrgLZhaz0cmbuCvyxOd6w';

// Helper function to create circle polygon
function createCircle(center, radiusInKm) {
  const points = 64;
  const coords = [];
  
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * (2 * Math.PI);
    const dx = radiusInKm * Math.cos(angle) / 111.32;
    const dy = radiusInKm * Math.sin(angle) / (111.32 * Math.cos(center[1] * Math.PI / 180));
    coords.push([center[0] + dx, center[1] + dy]);
  }
  coords.push(coords[0]);
  
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coords]
    },
    properties: {
      radius: radiusInKm,
      center: center
    }
  };
}

const SurgeAreaMap = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const drawRef = useRef(null);

  const [polygon, setPolygon] = useState(null);
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [surgeType, setSurgeType] = useState('fixed');
  const [surgeValue, setSurgeValue] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [circleRadius, setCircleRadius] = useState(0.5);
  const [circleCenter, setCircleCenter] = useState(null);
  const [showRadiusSlider, setShowRadiusSlider] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [areaSize, setAreaSize] = useState(0);

  // Set default times
  useEffect(() => {
    const now = new Date();
    const defaultStart = format(now, "yyyy-MM-dd'T'HH:mm");
    const defaultEnd = format(addHours(now, 1), "yyyy-MM-dd'T'HH:mm");
    setStartTime(defaultStart);
    setEndTime(defaultEnd);
  }, []);

  const handleDelete = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
    }
    setPolygon(null);
    setCircleCenter(null);
    setShowRadiusSlider(false);
    setAreaSize(0);
  };

  // Calculate area size when polygon changes
  useEffect(() => {
    if (!polygon) return;
    
    if (polygon.geometry.type === 'Polygon' && polygon.properties?.radius) {
      // Circle area (πr²)
      const area = Math.PI * Math.pow(polygon.properties.radius, 2);
      setAreaSize(parseFloat(area.toFixed(2)));
    } else if (polygon.geometry.type === 'Polygon') {
      // Simple polygon area calculation (approximation)
      // Note: For production, use a proper geodesic area calculation library
      const coords = polygon.geometry.coordinates[0];
      let area = 0;
      if (coords.length > 2) {
        for (let i = 0; i < coords.length - 1; i++) {
          const [x1, y1] = coords[i];
          const [x2, y2] = coords[i + 1];
          area += (x1 * y2) - (x2 * y1);
        }
        area = Math.abs(area) * 111.32 * 111.32 / 2; // Rough km² conversion
        setAreaSize(parseFloat(area.toFixed(2)));
      }
    }
  }, [polygon]);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [76.32, 9.995],
      zoom: 13
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      styles: [
        {
          id: 'gl-draw-polygon-fill',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: {
            'fill-color': '#3bb2d0',
            'fill-outline-color': '#3bb2d0',
            'fill-opacity': 0.2
          }
        },
        {
          id: 'gl-draw-polygon-stroke-active',
          type: 'line',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#3bb2d0',
            'line-width': 2,
            'line-dasharray': [0.2, 2]
          }
        }
      ]
    });

    map.addControl(draw, 'top-left');
    drawRef.current = draw;

    map.on('draw.create', (e) => {
      const feature = e.features[0];
      setPolygon(feature);
    });

    map.on('draw.update', (e) => {
      setPolygon(e.features[0]);
    });

    map.on('draw.delete', handleDelete);

    map.on('click', (e) => {
      if (type === 'Circle' && drawRef.current.getMode() === 'simple_select') {
        const center = [e.lngLat.lng, e.lngLat.lat];
        const circleFeature = createCircle(center, circleRadius);
        drawRef.current.deleteAll();
        drawRef.current.add(circleFeature);
        setPolygon(circleFeature);
        setCircleCenter(center);
        setShowRadiusSlider(true);
      }
    });

    mapRef.current = map;

    return () => map.remove();
  }, [type]);

  useEffect(() => {
    if (circleCenter && polygon && type === 'Circle') {
      const circleFeature = createCircle(circleCenter, circleRadius);
      drawRef.current.deleteAll();
      drawRef.current.add(circleFeature);
      setPolygon(circleFeature);
    }
  }, [circleRadius, circleCenter, type]);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lng = pos.coords.longitude;
          const lat = pos.coords.latitude;
          mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
          
          // Add a marker at user's location
          new mapboxgl.Marker({ color: '#4285F4' })
            .setLngLat([lng, lat])
            .addTo(mapRef.current);
        },
        (err) => {
          console.error("Geolocation error:", err);
          alert("Couldn't get your location. Please ensure location permissions are granted.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      if (data.features?.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
        
        // Add a marker at searched location
        new mapboxgl.Marker({ color: '#EA4335' })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (err) {
      console.error('Search error:', err);
      alert('Search failed. Please check your connection and try again.');
    }
  };

  const handleDraw = () => {
    if (!type) return alert('Please select a surge area type first.');
    if (type === 'Polygon') {
      drawRef.current.changeMode('draw_polygon');
      setShowRadiusSlider(false);
    } else if (type === 'Circle') {
      drawRef.current.changeMode('simple_select');
      alert('Click on the map to place the center of your surge area circle');
    }
  };

  const validateForm = () => {
    if (!polygon) {
      alert('Please draw a surge area first.');
      return false;
    }
    
    if (!name.trim()) {
      alert('Please enter a name for the surge area.');
      return false;
    }
    
    if (!reason.trim()) {
      alert('Please provide a reason for the surge pricing.');
      return false;
    }
    
    if (!surgeValue || isNaN(surgeValue) || Number(surgeValue) <= 0) {
      alert('Please enter a valid surge value (must be greater than 0).');
      return false;
    }
    
    if (!startTime || !endTime) {
      alert('Please set both start and end times.');
      return false;
    }
    
    if (new Date(endTime) <= new Date(startTime)) {
      alert('End time must be after start time.');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = {
      name: name.trim(),
      surgeReason: reason.trim(),
      surgeType,
      surgeValue: Number(surgeValue),
      startTime,
      endTime,
      areaSize
    };

    if (type === 'Polygon' && polygon.geometry.type === 'Polygon') {
      payload.type = 'Polygon';
      payload.area = {
        type: 'Polygon',
        coordinates: polygon.geometry.coordinates
      };
    } else if (type === 'Circle' && polygon.geometry.type === 'Polygon' && polygon.properties.radius) {
      payload.type = 'Circle';
      payload.center = polygon.properties.center;
      payload.radius = polygon.properties.radius;
    } else {
      return alert('Drawn shape does not match selected type.');
    }

    setIsSubmitting(true);
    try {
      const data = await createSurgeArea(payload);
      if (data.success) {
        alert('Surge area saved successfully!');
        // Reset form
        setName('');
        setReason('');
        setSurgeValue('');
        handleDelete();
      } else {
        alert(data.message || 'Failed to save surge area. Please try again.');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('An error occurred while saving. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="surge-map-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
        
        {/* Map Controls */}
        <div className="map-controls" style={{
          position: 'absolute',
          top: 20,
          right: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 1
        }}>
          <button 
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {isDrawerOpen ? <FiX size={20} /> : <FiMapPin size={20} />}
          </button>
          
          <button 
            onClick={handleLocateMe}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <MdOutlineMyLocation size={20} />
          </button>
        </div>

        {/* Side Drawer */}
        {isDrawerOpen && (
          <div className="side-drawer" style={{
            position: 'absolute',
            top: 20,
            left: 20,
            background: 'white',
            padding: 20,
            borderRadius: 12,
            width: 340,
            zIndex: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 15, color: '#333' }}>Create Surge Area</h3>
            
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Area Type</label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setShowRadiusSlider(false);
                  setCircleCenter(null);
                  handleDelete();
                }}
                style={{ 
                  width: '100%',
                  padding: '10px',
                  borderRadius: 6,
                  border: '1px solid #ddd',
                  fontSize: 14,
                  backgroundColor: '#f9f9f9'
                }}
              >
                <option value="">Select area type</option>
                <option value="Polygon">Custom Polygon</option>
                <option value="Circle">Circle</option>
              </select>
            </div>

            {type && (
              <>
                <div style={{ marginBottom: 15 }}>
                  <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Search Location</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Search for a place..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      style={{ 
                        flex: 1,
                        padding: '10px',
                        borderRadius: 6,
                        border: '1px solid #ddd',
                        fontSize: 14
                      }}
                    />
                    <button 
                      onClick={handleSearch}
                      style={{
                        padding: '10px',
                        background: '#4285F4',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <FiSearch size={18} />
                    </button>
                  </div>
                </div>

                {type === 'Circle' && showRadiusSlider && (
                  <div style={{ marginBottom: 15 }}>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
                      Radius: {circleRadius} km
                    </label>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="10" 
                      step="0.1" 
                      value={circleRadius} 
                      onChange={(e) => setCircleRadius(parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
                  <button
                    onClick={handleDraw}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#4285F4',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      cursor: 'pointer'
                    }}
                  >
                    <FiPlus size={16} />
                    {type === 'Circle' ? 'Set Center' : 'Draw Area'}
                  </button>
                  
                  {polygon && (
                    <button
                      onClick={handleDelete}
                      style={{
                        padding: '10px',
                        background: '#EA4335',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              </>
            )}

            {polygon && (
              <div style={{ 
                marginBottom: 15,
                padding: 15,
                background: '#f5f5f5',
                borderRadius: 6
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>Area Type:</span>
                  <span>{type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                  <span style={{ fontWeight: 500 }}>Approx. Size:</span>
                  <span>{areaSize} km²</span>
                </div>
              </div>
            )}

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Name</label>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Downtown Surge" 
                style={{ 
                  width: '100%',
                  padding: '10px',
                  borderRadius: 6,
                  border: '1px solid #ddd',
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Reason</label>
              <input 
                value={reason} 
                onChange={e => setReason(e.target.value)} 
                placeholder="e.g. Major concert event" 
                style={{ 
                  width: '100%',
                  padding: '10px',
                  borderRadius: 6,
                  border: '1px solid #ddd',
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Surge Type</label>
                <select 
                  value={surgeType} 
                  onChange={e => setSurgeType(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '10px',
                    borderRadius: 6,
                    border: '1px solid #ddd',
                    fontSize: 14,
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
                  {surgeType === 'fixed' ? 'Amount (₹)' : 'Percentage (%)'}
                </label>
                <input 
                  type="number" 
                  value={surgeValue} 
                  onChange={e => setSurgeValue(e.target.value)} 
                  placeholder={surgeType === 'fixed' ? 'e.g. 50' : 'e.g. 20'} 
                  min="0"
                  step={surgeType === 'fixed' ? '1' : '0.1'}
                  style={{ 
                    width: '100%',
                    padding: '10px',
                    borderRadius: 6,
                    border: '1px solid #ddd',
                    fontSize: 14
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Active Period</label>
              <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: '#666' }}>Start Time</label>
                  <input 
                    type="datetime-local" 
                    value={startTime} 
                    onChange={e => setStartTime(e.target.value)} 
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      borderRadius: 6,
                      border: '1px solid #ddd',
                      fontSize: 14
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: '#666' }}>End Time</label>
                  <input 
                    type="datetime-local" 
                    value={endTime} 
                    onChange={e => setEndTime(e.target.value)} 
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      borderRadius: 6,
                      border: '1px solid #ddd',
                      fontSize: 14
                    }}
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleSave} 
              disabled={isSubmitting || !polygon}
              style={{ 
                width: '100%',
                padding: '12px',
                background: isSubmitting || !polygon ? '#ccc' : '#34A853',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: isSubmitting || !polygon ? 'not-allowed' : 'pointer'
              }}
            >
              <FiSave size={18} />
              {isSubmitting ? 'Saving...' : 'Save Surge Area'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurgeAreaMap;