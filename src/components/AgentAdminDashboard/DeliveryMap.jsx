import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
mapboxgl.accessToken = "pk.eyJ1IjoiYW1hcm5hZGg2NSIsImEiOiJjbWJ3NmlhcXgwdTh1MmlzMWNuNnNvYmZ3In0.kXrgLZhaz0cmbuCvyxOd6w";

const DeliveryMap = ({flyToAgentId, orderLocations, agents = [] , selectedOrder  , 
  onFilterChange,
  isSidebarCollapsed,
  isAgentPanelCollapsed
  }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);


const [showFilters, setShowFilters] = useState(false);
const [filters, setFilters] = useState({
  showAgents: true,
  showOrders: true,
  hideOffline: false,
  hideBusy: false,
  hideUnassigned: false,
  hideAssigned: false,
  hideCompleted: false
});





  const agentMarkersRef = useRef([]); 
  const orderMarkersRef = useRef([]);

  // 🗺️ Initialize the map once
  useEffect(() => {
    if (!mapRef.current && mapContainer.current) {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [76.3000, 10.0000],
        zoom: 12,
      });

      map.addControl(new mapboxgl.NavigationControl());
      mapRef.current = map;
      setMapInitialized(true);
    }
  }, []);




   useEffect(() => {
    if (!flyToAgentId || !mapRef.current) return;

    const agent = agents.find(a => a._id === flyToAgentId);
    if (!agent?.location) return;

    mapRef.current.flyTo({
      center: agent.location,
      zoom: 15,
      duration: 1000,
      essential: true
    });

    // Optional: Highlight the agent marker
    // Could use mapRef.current.setFeatureState(...)
  }, [flyToAgentId, agents]);




  // 🧹 Utility to clear old markers
  const clearMarkers = (markersRef) => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  // 📍 Add agent markers (live)
useEffect(() => {
  if (!mapInitialized || !mapRef.current) return;

  clearMarkers(agentMarkersRef);

  agents.forEach(agent => {
    if (!agent.location || agent.location.length !== 2) return;

    const [lng, lat] = agent.location;
    
    // Determine marker color based on availability status
    let markerColor;
    if (agent.agentStatus?.availabilityStatus === "AVAILABLE") {
      markerColor = "#4CAF50"; // Green for available
    } else {
      markerColor = "#9E9E9E"; // Gray for unavailable
    }
    
    // You can also add additional status-based colors if needed
    // For example, for different order statuses:
    if (agent.agentStatus?.status === "ON_BREAK") {
      markerColor = "#FF9800"; // Orange for on break
    }
    
    const el = document.createElement("div");
    el.className = "agent-marker";
    el.style.backgroundColor = markerColor; // Use the dynamic color
    el.style.width = "20px";
    el.style.height = "20px";
    el.style.borderRadius = "50%";
    el.style.border = "2px solid white";
    
    const deviceInfo = agent.deviceInfo || {};
const marker = new mapboxgl.Marker(el)
  .setLngLat([lng, lat])
  .setPopup(
    new mapboxgl.Popup({ offset: 15, closeButton: true, closeOnClick: true })
      .setHTML(`
      <div style="
        font-family: 'Segoe UI', sans-serif;
        font-size: 13px;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        padding: 14px;
        max-width: 280px;
        border: 1px solid #e5e7eb;
        position: relative;
      ">
        <!-- Header -->
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          ${
            agent?.profilePicture
              ? `<img 
                  src="${agent.profilePicture}" 
                  alt="profile" 
                  style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; margin-right: 10px;" 
                />`
              : `<div style="
                  background: #3b82f6;
                  color: white;
                  font-size: 16px;
                  font-weight: 600;
                  border-radius: 50%;
                  width: 42px;
                  height: 42px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-right: 10px;
                ">
                  ${agent?.fullName?.[0] || "A"}
                </div>`
          }
          <div>
            <div style="font-size: 15px; font-weight: 600; color: #111827;">
              ${agent?.fullName || "Unknown Agent"}
            </div>
          </div>
        </div>

        <!-- Status Row -->
        <div style="margin-bottom: 10px; display: flex; gap: 6px; flex-wrap: wrap;">
          <span style="
            background: ${
              agent.agentStatus?.status === "ACTIVE"
                ? "#dcfce7"
                : "#fee2e2"
            };
            color: ${
              agent.agentStatus?.status === "ACTIVE"
                ? "#16a34a"
                : "#b91c1c"
            };
            font-size: 11px;
            font-weight: 600;
            padding: 3px 8px;
            border-radius: 999px;
          ">
            ${agent.agentStatus?.status || "OFFLINE"}
          </span>
          <span style="
            background: ${
              agent.agentStatus?.availabilityStatus === "AVAILABLE"
                ? "#e0f2fe"
                : "#fef3c7"
            };
            color: ${
              agent.agentStatus?.availabilityStatus === "AVAILABLE"
                ? "#0284c7"
                : "#b45309"
            };
            font-size: 11px;
            font-weight: 600;
            padding: 3px 8px;
            border-radius: 999px;
          ">
            ${agent.agentStatus?.availabilityStatus || "UNAVAILABLE"}
          </span>
        </div>

        <!-- Details -->
        <div style="display: grid; grid-template-columns: 100px 1fr; row-gap: 6px; column-gap: 6px; font-size: 12px;">
          <span style="font-weight: 500; color: #374151;">Battery:</span> 
          <span>🔋 ${agent?.deviceInfo?.batteryLevel ?? "N/A"}%</span>

          <span style="font-weight: 500; color: #374151;">Device:</span> 
          <span>📱 ${agent?.deviceInfo?.model || "N/A"}</span>

          <span style="font-weight: 500; color: #374151;">OS:</span> 
          <span>${agent?.deviceInfo?.os || "N/A"} ${agent?.deviceInfo?.osVersion || ""}</span>

          <span style="font-weight: 500; color: #374151;">App Ver:</span> 
          <span>${agent?.deviceInfo?.appVersion || "N/A"}</span>

          <span style="font-weight: 500; color: #374151;">Rooted:</span> 
          <span>${agent?.deviceInfo?.isRooted ? "Yes" : "No"}</span>

          <span style="font-weight: 500; color: #374151;">Location:</span> 
          <span>${agent?.deviceInfo?.locationEnabled ? "Enabled" : "Disabled"}</span>

          <span style="font-weight: 500; color: #374151;">Network:</span> 
          <span>${agent?.deviceInfo?.networkType || "Unknown"}</span>

          <span style="font-weight: 500; color: #374151;">Timezone:</span> 
          <span>${agent?.deviceInfo?.timezone || "N/A"}</span>
        </div>
      </div>
    `)
  )
  .addTo(mapRef.current);

// Make close button bigger + styled
const popupEl = document.querySelector(".mapboxgl-popup-close-button");
if (popupEl) {
  popupEl.style.fontSize = "20px";
  popupEl.style.color = "#374151";
  popupEl.style.fontWeight = "bold";
  popupEl.style.top = "6px";
  popupEl.style.right = "6px";
  popupEl.style.width = "26px";
  popupEl.style.height = "26px";
  popupEl.style.borderRadius = "50%";
  popupEl.style.background = "#f3f4f6";
  popupEl.style.boxShadow = "0 1px 4px rgba(0,0,0,0.1)";
}




    agentMarkersRef.current.push(marker);
  });
}, [agents, mapInitialized]);

  // 🗺️ Add pickup and drop markers
// 🗺️ Add pickup and drop markers
useEffect(() => {
  if (!mapInitialized || !mapRef.current || !orderLocations?.length) return;

  clearMarkers(orderMarkersRef);

  orderLocations.forEach(order => {
    if (!order.pickupLocation || !order.dropLocation?.coordinates) return;

    const pickupCoords = [order.pickupLocation.lng, order.pickupLocation.lat];
    const dropCoords = [order.dropLocation.coordinates.lng, order.dropLocation.coordinates.lat];

    // Create custom pickup marker (P)
    const pickupEl = document.createElement("div");
    pickupEl.innerHTML = "P";
    pickupEl.style.background = "#4CAF50";
    pickupEl.style.color = "white";
    pickupEl.style.fontWeight = "bold";
    pickupEl.style.borderRadius = "50%";
    pickupEl.style.width = "24px";
    pickupEl.style.height = "24px";
    pickupEl.style.display = "flex";
    pickupEl.style.alignItems = "center";
    pickupEl.style.justifyContent = "center";
    pickupEl.style.fontSize = "14px";
    pickupEl.style.boxShadow = "0 0 4px rgba(0,0,0,0.4)";

    const pickupMarker = new mapboxgl.Marker({ element: pickupEl })
      .setLngLat(pickupCoords)
      .setPopup(new mapboxgl.Popup().setHTML(`
        <b>Pickup:</b> ${order.restaurantName || "Restaurant"}
      `))
      .addTo(mapRef.current);

    // Create custom drop marker (D)
    const dropEl = document.createElement("div");
    dropEl.innerHTML = "D";
    dropEl.style.background = "#F44336";
    dropEl.style.color = "white";
    dropEl.style.fontWeight = "bold";
    dropEl.style.borderRadius = "50%";
    dropEl.style.width = "24px";
    dropEl.style.height = "24px";
    dropEl.style.display = "flex";
    dropEl.style.alignItems = "center";
    dropEl.style.justifyContent = "center";
    dropEl.style.fontSize = "14px";
    dropEl.style.boxShadow = "0 0 4px rgba(0,0,0,0.4)";

    const dropMarker = new mapboxgl.Marker({ element: dropEl })
      .setLngLat(dropCoords)
      .setPopup(new mapboxgl.Popup().setHTML(`
        <b>Drop:</b> 
        ${order.dropLocation.address?.street || ""}, ${order.dropLocation.address?.city || ""}
      `))
      .addTo(mapRef.current);

    orderMarkersRef.current.push(pickupMarker, dropMarker);
  });
}, [orderLocations, mapInitialized]);


console.log(selectedOrder,"selected orders")



 const handleFilterChange = (key, value) => {
    // Update local state
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Notify parent component
    if (onFilterChange) {
      onFilterChange(key, value);
    }
  };


const FilterDropdown = ({ filters,   onFilterChange
, onClose }) => {
  return (
    <div className="absolute bottom-16 right-4 bg-white p-4 rounded-lg shadow-lg z-10 w-64">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Map Filters</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-3">
        {/* Agent Filters */}
        <div className="border-b pb-2">
          <h4 className="font-medium text-sm mb-2 text-gray-700">Agent Filters</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.hideOffline}
                onChange={(e) => onFilterChange('hideOffline', e.target.checked)}
                className="rounded text-blue-500"
              />
              <span>Hide Offline Agents</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.hideBusy}
                onChange={(e) => onFilterChange('hideBusy', e.target.checked)}
                className="rounded text-blue-500"
              />
              <span>Hide Busy Agents</span>
            </label>
          </div>
        </div>
        
        {/* Order Filters */}
        <div>
          <h4 className="font-medium text-sm mb-2 text-gray-700">Order Filters</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.hideUnassigned}
                onChange={(e) => onFilterChange('hideUnassigned', e.target.checked)}
                className="rounded text-blue-500"
              />
              <span>Hide Unassigned Tasks</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.hideAssigned}
                onChange={(e) => onFilterChange('hideAssigned', e.target.checked)}
                className="rounded text-blue-500"
              />
              <span>Hide Assigned Tasks</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.hideCompleted}
                onChange={(e) => onFilterChange('hideCompleted', e.target.checked)}
                className="rounded text-blue-500"
              />
              <span>Hide Completed Tasks</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

useEffect(() => {
  if (!mapInitialized || !mapRef.current) return;

  const map = mapRef.current;

  // Function to add the route
  const addRoute = () => {
    // Remove previous route if it exists
    if (map.getSource("order-route")) {
      if (map.getLayer("order-route")) {
        map.removeLayer("order-route");
      }
      map.removeSource("order-route");
    }

    if (!selectedOrder?.pickupLocation || !selectedOrder?.dropLocation?.coordinates) return;

    const pickupCoords = [
      selectedOrder.pickupLocation.lng,
      selectedOrder.pickupLocation.lat
    ];
    const dropCoords = [
      selectedOrder.dropLocation.coordinates.lng,
      selectedOrder.dropLocation.coordinates.lat
    ];

    // Midpoint
    const mid = [
      (pickupCoords[0] + dropCoords[0]) / 2,
      (pickupCoords[1] + dropCoords[1]) / 2
    ];
    const offsetMid = [mid[0], mid[1] + 0.02];

    const line = turf.lineString([pickupCoords, offsetMid, dropCoords]);
    const curved = turf.bezierSpline(line);

    // ✅ Add source + layer after style is ready
    map.addSource("order-route", {
      type: "geojson",
      data: curved
    });

    map.addLayer({
      id: "order-route",
      type: "line",
      source: "order-route",
      layout: {
        "line-cap": "round",
        "line-join": "round"
      },
      paint: {
        "line-color": "#FF9800",
        "line-width": 4,
        "line-dasharray": [2, 2]
      }
    });

    // Auto-zoom
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend(pickupCoords).extend(dropCoords);
    map.fitBounds(bounds, { padding: 50 });
  };

  // If style is already loaded, add immediately
  if (map.isStyleLoaded()) {
    addRoute();
  } else {
    map.once("load", addRoute); // wait for style to load
  }

}, [selectedOrder, mapInitialized]);

// Resize map when sidebar states change
useEffect(() => {
  if (!mapRef.current || !mapInitialized || !mapContainer.current) return;
  
  // Multiple resize attempts to ensure proper expansion
  const resizeMap = () => {
    if (mapRef.current) {
      mapRef.current.resize();
    }
  };
  
  // Immediate resize
  resizeMap();
  
  // Delayed resize to ensure DOM has fully updated
  const timeoutId1 = setTimeout(resizeMap, 100);
  
  // Additional delayed resize for edge cases
  const timeoutId2 = setTimeout(resizeMap, 300);
  
  // Use ResizeObserver to detect container size changes
  const resizeObserver = new ResizeObserver(() => {
    resizeMap();
  });
  
  resizeObserver.observe(mapContainer.current);
  
  return () => {
    clearTimeout(timeoutId1);
    clearTimeout(timeoutId2);
    resizeObserver.disconnect();
  };
}, [isSidebarCollapsed, isAgentPanelCollapsed, mapInitialized]);

  return (
     <div className="delivery-map relative" style={{ height: "100%", width: "100%" }}>
    <div ref={mapContainer} style={{ height: "100%", width: "100%" }} />
    
    {/* Filter Button */}
    <button
      onClick={() => setShowFilters(!showFilters)}
      className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg z-10 hover:bg-gray-50 transition-colors"
      aria-label="Filter map"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    </button>
    
    {/* Filter Dropdown */}
    {showFilters && (
      <FilterDropdown
        filters={filters}
        onFilterChange={handleFilterChange}
        onClose={() => setShowFilters(false)}
      />
    )}
  </div>
  );
};

export default DeliveryMap;
