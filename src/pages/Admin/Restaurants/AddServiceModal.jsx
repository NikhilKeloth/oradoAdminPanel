import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { addServiceArea } from "../../../apis/adminApis/storeApi";
import { toast } from 'react-toastify';
import { Locate } from 'lucide-react';
mapboxgl.accessToken = 'pk.eyJ1IjoiYW1hcm5hZGg2NSIsImEiOiJjbWJ3NmlhcXgwdTh1MmlzMWNuNnNvYmZ3In0.kXrgLZhaz0cmbuCvyxOd6w';

const AddServiceModal = ({
  isOpen, onClose, restaurantId, onServiceAdded,
  restaurantLocation, restaurantName
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const drawRef = useRef(null);

  const [areaType, setAreaType] = useState('radius'); // 'radius' or 'polygon'
  const [polygon, setPolygon] = useState(null);
  const [radius, setRadius] = useState(0);
  const [circleFeature, setCircleFeature] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize map when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (mapContainerRef.current && !mapRef.current) {
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: restaurantLocation || [76.32, 9.995],
          zoom: 13
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          }
        });
        map.addControl(draw, 'top-left');
        drawRef.current = draw;

        map.on('draw.create', (e) => {
          const newPolygon = e.features[0];
          setPolygon(newPolygon);
          clearCircle();
        });

        map.on('draw.delete', () => {
          setPolygon(null);
        });

        map.on('draw.update', (e) => {
          const updatedPolygon = e.features[0];
          setPolygon(updatedPolygon);
        });

        // Add restaurant marker if location is provided
        if (restaurantLocation) {
          const marker = new mapboxgl.Marker({ 
            color: "#e91e63",
            scale: 1.2 
          })
            .setLngLat(restaurantLocation)
            .addTo(map);

          const popup = new mapboxgl.Popup({ 
            offset: 25,
            closeButton: false,
            closeOnClick: false
          })
            .setText(restaurantName || "Restaurant Location");
          marker.setPopup(popup).togglePopup();
        }

        mapRef.current = map;

        // Auto-draw circle if radius mode is selected
        if (areaType === 'radius') {
          setTimeout(() => drawCircle(), 500);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, restaurantLocation, restaurantName]);

  // Handle area type change
  useEffect(() => {
    if (!mapRef.current) return;

    if (areaType === 'radius') {
      // Clear polygon and draw circle
      if (drawRef.current) {
        drawRef.current.deleteAll();
      }
      setPolygon(null);
      drawCircle();
    } else {
      // Clear circle and enable polygon drawing
      clearCircle();
      setCircleFeature(null);
    }
  }, [areaType, radius]);

  // Cleanup map when modal closes
  useEffect(() => {
    if (!isOpen && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      drawRef.current = null;
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setPolygon(null);
    setCircleFeature(null);
    setSearchQuery('');
    setAreaType('radius');
    setRadius(2);
  };

  const clearCircle = () => {
    if (mapRef.current?.getSource("circleArea")) {
      mapRef.current.removeLayer("circleAreaFill");
      mapRef.current.removeLayer("circleAreaStroke");
      mapRef.current.removeSource("circleArea");
    }
  };

  const drawCircle = () => {
    if (!restaurantLocation || !mapRef.current) return;

    clearCircle();

    const circle = turf.circle(restaurantLocation, radius, { 
      steps: 64, 
      units: 'kilometers' 
    });

    mapRef.current.addSource("circleArea", {
      type: "geojson",
      data: circle
    });

    // Fill layer
    mapRef.current.addLayer({
      id: "circleAreaFill",
      type: "fill",
      source: "circleArea",
      layout: {},
      paint: {
        "fill-color": "#2196f3",
        "fill-opacity": 0.2
      }
    });

    // Stroke layer
    mapRef.current.addLayer({
      id: "circleAreaStroke",
      type: "line",
      source: "circleArea",
      layout: {},
      paint: {
        "line-color": "#2196f3",
        "line-width": 2,
        "line-opacity": 0.8
      }
    });

    setCircleFeature(circle);

    // Fit map to circle bounds
    const bounds = turf.bbox(circle);
    mapRef.current.fitBounds(bounds, { padding: 50 });
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 14 });
      }, (error) => {
        alert("Unable to get your location. Please check your browser settings.");
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}&limit=1`
      );
      const data = await response.json();
      
      if (data.features?.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 14 });
        setSearchQuery(''); // Clear search after successful search
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please check your internet connection.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const startPolygonDrawing = () => {
    if (drawRef.current) {
      drawRef.current.changeMode('draw_polygon');
    }
  };

  const clearAll = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
    }
    clearCircle();
    setPolygon(null);
    setCircleFeature(null);
  };

  const hasValidArea = () => {
    return (areaType === 'radius' && circleFeature) || 
           (areaType === 'polygon' && polygon);
  };

  const handleSave = async () => {
    if (!hasValidArea()) {
      alert(`Please ${areaType === 'radius' ? 'set a valid radius' : 'draw a polygon'} for the service area.`);
      return;
    }

    let serviceArea = null;

    if (areaType === 'polygon' && polygon) {
      serviceArea = {
        type: "Polygon",
        area: {
          type: "Polygon",
          coordinates: polygon.geometry.coordinates,
        }
      };
    } else if (areaType === 'radius' && circleFeature) {
      serviceArea = {
        type: "Circle",
        center: restaurantLocation,
        radius: radius * 1000, // Convert km to meters
      };
    }

    try {
      setIsSubmitting(true);
      const response = await addServiceArea(restaurantId, [serviceArea]);

      if (response.messageType === "success") {
toast.success(
  <div className="flex items-center gap-3">
    <div className="text-2xl">⚡</div>
    <div>
       <div className="font-bold text-white text-lg">Success!</div>
      <div className="text-green-300 text-sm">Your service area has been saved successfully.</div>
    </div>
  </div>,
  {
    position: "top-right",
    autoClose: 3500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      border: '1px solid #22c55e',
      borderRadius: '14px',
      boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
      color: 'white',
      fontSize: '15px',
      padding: '18px 22px'
    },
    progressStyle: {
      background: '#22c55e'
    }
  }
);
        onServiceAdded?.(response.data);
        handleClose();
      } else {
        alert(response.message || "Failed to save service area. Please try again.");
      }
    } catch (err) {
      console.error("Error saving service area:", err);
      alert("Error saving service area. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(2px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '95vw',
        height: '95vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e0e0e0',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '24px', fontWeight: '600' }}>
                Define Service Area
              </h2>
              <p style={{ margin: '8px 0 0', color: '#6c757d', fontSize: '14px' }}>
                {restaurantName && `${restaurantName} • `}ID: {restaurantId}
              </p>
            </div>
            <button onClick={handleClose} style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '8px',
              color: '#6c757d',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}>×</button>
          </div>
        </div>

        {/* Control Panel & Map Container */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Control Panel */}
          <div style={{
            width: '320px',
            padding: '24px',
            borderRight: '1px solid #e0e0e0',
            background: '#f8f9fa',
            overflowY: 'auto'
          }}>
            {/* Search */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#495057' }}>
                🔍 Search Location
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Enter location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #ced4da',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <button onClick={handleLocateMe} style={{
                  padding: '10px 12px',
                  border: 'none',
                  background: '#28a745',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }} title="Use my location"><Locate /></button>
              </div>
            </div>

            {/* Area Type Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: '#495057' }}>
                📐 Service Area Type
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  onClick={() => setAreaType('radius')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: `2px solid ${areaType === 'radius' ? '#2196f3' : '#dee2e6'}`,
                    background: areaType === 'radius' ? '#e3f2fd' : 'white',
                    color: areaType === 'radius' ? '#1976d2' : '#6c757d',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  ⭕ Radius
                </button>
                <button
                  onClick={() => setAreaType('polygon')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: `2px solid ${areaType === 'polygon' ? '#ff9800' : '#dee2e6'}`,
                    background: areaType === 'polygon' ? '#fff3e0' : 'white',
                    color: areaType === 'polygon' ? '#f57c00' : '#6c757d',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  ⬟ Custom
                </button>
              </div>
            </div>

 {/* Radius Controls */}
{/* Radius Controls */}
{areaType === 'radius' && (
  <div style={{ marginBottom: '24px' }}>
    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#495057' }}>
      📏 Delivery Radius: {radius} km
    </label>

    {/* Slider */}
    <input
      type="range"
      min="0.5"
      max="20"
      step="0.5"
      value={radius}
      onChange={(e) => setRadius(Number(e.target.value))}
      style={{
        width: '100%',
        marginBottom: '8px',
        accentColor: '#2196f3'
      }}
    />

    {/* Number input for manual typing */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
      <input
        type="number"
        min="0.5"
        max="20"
        step="0.5"
        value={radius}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          if (!isNaN(val)) {
            // Clamp the value between 0.5 and 20
            const clampedValue = Math.min(20, Math.max(0.5, val));
            setRadius(clampedValue);
          }
        }}
        onBlur={(e) => {
          // If empty or invalid, reset to minimum value
          if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
            setRadius(0.5);
          }
        }}
        style={{
          width: '80px',
          padding: '8px',
          border: '1px solid #ced4da',
          borderRadius: '6px',
          fontSize: '14px'
        }}
      />
      <span style={{ fontSize: '14px', color: '#495057' }}>km</span>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6c757d', marginTop: '6px' }}>
      <span>0.5km</span>
      <span>20km</span>
    </div>

    {circleFeature && (
      <div style={{
        marginTop: '12px',
        padding: '8px 12px',
        background: '#e3f2fd',
        borderRadius: '6px',
        fontSize: '14px',
        color: '#1976d2'
      }}>
        ✅ Circle area ready ({radius} km radius)
      </div>
    )}
  </div>
)}


            {/* Polygon Controls */}
            {areaType === 'polygon' && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: '#495057' }}>
                  ✏️ Custom Area
                </label>
                <button
                  onClick={startPolygonDrawing}
                  disabled={!restaurantId}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: 'none',
                    background: !restaurantId ? '#dee2e6' : '#ff9800',
                    color: !restaurantId ? '#6c757d' : 'white',
                    borderRadius: '8px',
                    cursor: !restaurantId ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}
                >
                  🖊️ Start Drawing
                </button>
                <p style={{ fontSize: '12px', color: '#6c757d', margin: '0', lineHeight: '1.4' }}>
                  Click on the map to start drawing your custom delivery area. Click the first point again to finish.
                </p>
                {polygon && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: '#fff3e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#f57c00'
                  }}>
                    ✅ Custom area drawn
                  </div>
                )}
              </div>
            )}

            {/* Clear Button */}
            <button
              onClick={clearAll}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #dc3545',
                background: 'white',
                color: '#dc3545',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🗑️ Clear All
            </button>
          </div>

          {/* Map */}
          <div style={{ flex: 1, position: 'relative' }}>
            <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '20px 24px', 
          borderTop: '1px solid #e0e0e0',
          background: '#f8f9fa',
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            {hasValidArea() ? (
              <span style={{ color: '#28a745' }}>✅ Service area is ready to save</span>
            ) : (
              <span>⚠️ Please define a service area</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleClose} style={{
              padding: '10px 24px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || !restaurantId || !hasValidArea()}
              style={{
                padding: '10px 24px',
                background: (isSubmitting || !restaurantId || !hasValidArea()) ? '#dee2e6' : '#28a745',
                color: (isSubmitting || !restaurantId || !hasValidArea()) ? '#6c757d' : 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: (isSubmitting || !restaurantId || !hasValidArea()) ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              {isSubmitting ? '⏳ Saving...' : '💾 Save Service Area'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddServiceModal;