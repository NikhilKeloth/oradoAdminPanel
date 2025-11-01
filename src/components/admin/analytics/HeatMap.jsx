import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = "pk.eyJ1IjoiYW1hcm5hZGg2NSIsImEiOiJjbWJ3NmlhcXgwdTh1MmlzMWNuNnNvYmZ3In0.kXrgLZhaz0cmbuCvyxOd6w";

const OrdersHeatmap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loading, setLoading] = useState(true);
  const [showColorInfo, setShowColorInfo] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: 'today',
    from: '',
    to: '',
    status: ''
  });

  const fetchHeatmapData = async (filters) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      
      const response = await fetch(`http://localhost:5000/admin/order/heat-map?${params}`);
      const data = await response.json();
      
      return data;
    } catch (err) {
      console.error('Error loading heatmap data:', err);
      throw err;
    }
  };

  const updateHeatmap = async (newFilters) => {
    try {
      setLoading(true);
      const data = await fetchHeatmapData(newFilters);
      
      if (map.current.getSource('orders')) {
        map.current.getSource('orders').setData(data);
      } else {
        map.current.addSource('orders', {
          type: 'geojson',
          data: data
        });

        map.current.addLayer({
          id: 'orders-heatmap',
          type: 'heatmap',
          source: 'orders',
          maxzoom: 20,
          paint: {
            'heatmap-weight': ['interpolate', ['linear'], ['get', 'orderCount'], 0, 0, 50, 1],
            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 20, 3],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0, 0, 255, 0)',
              0.2, 'blue',
              0.4, 'cyan',
              0.6, 'lime',
              0.8, 'yellow',
              1, 'red'
            ],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 12, 20, 50],
            'heatmap-opacity': 0.75
          }
        });
      }
      setLoading(false);
    } catch (err) {
      console.error('Error updating heatmap:', err);
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    
    if (key === 'dateRange') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (value) {
        case 'today':
          newFilters.from = today.toISOString().split('T')[0];
          newFilters.to = new Date().toISOString().split('T')[0];
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          newFilters.from = weekAgo.toISOString().split('T')[0];
          newFilters.to = new Date().toISOString().split('T')[0];
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          newFilters.from = monthAgo.toISOString().split('T')[0];
          newFilters.to = new Date().toISOString().split('T')[0];
          break;
        case 'custom':
          newFilters.from = '';
          newFilters.to = '';
          break;
        default:
          break;
      }
    }
    
    setFilters(newFilters);
    
    if (map.current && newFilters.dateRange !== 'custom') {
      updateHeatmap(newFilters);
    }
  };

  const handleCustomDateApply = () => {
    if (filters.dateRange === 'custom' && filters.from && filters.to) {
      updateHeatmap(filters);
    }
  };

  const resetFilters = () => {
    const today = new Date().toISOString().split('T')[0];
    const resetFilters = {
      dateRange: 'today',
      from: today,
      to: today,
      status: ''
    };
    setFilters(resetFilters);
    updateHeatmap(resetFilters);
  };

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [76.335, 9.683],
      zoom: 14
    });

    map.current.on('load', () => {
      const today = new Date().toISOString().split('T')[0];
      updateHeatmap({ ...filters, from: today, to: today });
    });
  }, []);

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'preparing': 'Preparing',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  };

  const colorIntensityData = [
    { level: 'Blue', color: 'blue', description: 'Few orders / Low activity', orders: '0-10 orders' },
    { level: 'Cyan', color: 'cyan', description: 'Light activity', orders: '11-20 orders' },
    { level: 'Lime', color: 'lime', description: 'Moderate activity', orders: '21-35 orders' },
    { level: 'Yellow', color: 'yellow', description: 'High activity', orders: '36-50 orders' },
    { level: 'Red', color: 'red', description: 'Very high / Hotspot', orders: '50+ orders' }
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Filter Panel */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(255, 255, 255, 0.98)',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
        zIndex: 2,
        minWidth: '280px',
        maxWidth: '320px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>
            📊 Filter Orders
          </h3>
          <button
            onClick={resetFilters}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              background: '#f1f3f5',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#495057',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#e9ecef'}
            onMouseOut={(e) => e.target.style.background = '#f1f3f5'}
          >
            Reset
          </button>
        </div>
        
        {/* Date Range */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: '#495057' }}>
            📅 Date Range
          </label>
          <select 
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              borderRadius: '8px', 
              border: '2px solid #e9ecef',
              fontSize: '14px',
              cursor: 'pointer',
              background: 'white',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4c6ef5'}
            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Custom Date Inputs */}
        {filters.dateRange === 'custom' && (
          <div style={{ 
            marginBottom: '18px', 
            padding: '15px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#495057' }}>
                From
              </label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px 10px', 
                  borderRadius: '6px', 
                  border: '2px solid #e9ecef',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#495057' }}>
                To
              </label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px 10px', 
                  borderRadius: '6px', 
                  border: '2px solid #e9ecef',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <button
              onClick={handleCustomDateApply}
              disabled={!filters.from || !filters.to}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: filters.from && filters.to ? '#4c6ef5' : '#adb5bd',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: filters.from && filters.to ? 'pointer' : 'not-allowed',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (filters.from && filters.to) e.target.style.backgroundColor = '#4263eb';
              }}
              onMouseOut={(e) => {
                if (filters.from && filters.to) e.target.style.backgroundColor = '#4c6ef5';
              }}
            >
              Apply Custom Range
            </button>
          </div>
        )}

        {/* Status Filter */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: '#495057' }}>
            🎯 Order Status
          </label>
          <select 
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              borderRadius: '8px', 
              border: '2px solid #e9ecef',
              fontSize: '14px',
              cursor: 'pointer',
              background: 'white',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4c6ef5'}
            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
          >
            <option value="">All Status</option>
            <option value="pending">⏳ Pending</option>
            <option value="confirmed">✅ Confirmed</option>
            <option value="preparing">👨‍🍳 Preparing</option>
            <option value="out_for_delivery">🚚 Out for Delivery</option>
            <option value="delivered">📦 Delivered</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>
        </div>

        {/* Active Filters Summary */}
        <div style={{ 
          fontSize: '12px', 
          color: '#868e96', 
          borderTop: '1px solid #e9ecef', 
          paddingTop: '12px',
          background: '#f8f9fa',
          padding: '12px',
          borderRadius: '6px',
          marginTop: '4px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '6px', color: '#495057' }}>Active Filters:</div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ marginRight: '6px' }}>📅</span>
            <span>{filters.dateRange === 'custom' ? `${filters.from} to ${filters.to}` : filters.dateRange.charAt(0).toUpperCase() + filters.dateRange.slice(1)}</span>
          </div>
          {filters.status && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '6px' }}>🎯</span>
              <span>{getStatusLabel(filters.status)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Legend & Map Guide */}
      <div style={{
        position: 'absolute',
        bottom: 30,
        right: 20,
        background: 'rgba(255, 255, 255, 0.98)',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        zIndex: 2,
        backdropFilter: 'blur(10px)',
        minWidth: '280px',
        maxWidth: '320px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '12px' 
        }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>
            🗺️ Order Heatmap Guide
          </div>
          <button
            onClick={() => setShowColorInfo(!showColorInfo)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#4c6ef5',
              padding: '4px',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#f1f3f5'}
            onMouseOut={(e) => e.target.style.background = 'none'}
            title={showColorInfo ? "Hide guide" : "Show guide"}
          >
            {showColorInfo ? '▲' : '▼'}
          </button>
        </div>
        
        {/* Color Gradient Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', color: '#868e96', fontWeight: '500' }}>Low</span>
          <div style={{ 
            width: '160px', 
            height: '14px', 
            borderRadius: '7px',
            background: 'linear-gradient(to right, blue, cyan, lime, yellow, red)',
            border: '1px solid #e9ecef'
          }} />
          <span style={{ fontSize: '11px', color: '#868e96', fontWeight: '500' }}>High</span>
        </div>

        {/* Map Reading Guide */}
        {showColorInfo && (
          <div style={{
            marginTop: '12px',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            
            {/* Classic Heatmap Gradient Section */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#495057', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🎨 Classic Heatmap Gradient
              </div>
              <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.4', marginBottom: '12px' }}>
                <strong>Low → High intensity:</strong><br/>
                <span style={{ fontWeight: '600', color: 'blue' }}>Blue</span> → 
                <span style={{ fontWeight: '600', color: 'cyan' }}> Cyan</span> → 
                <span style={{ fontWeight: '600', color: 'lime' }}> Lime</span> → 
                <span style={{ fontWeight: '600', color: 'yellow' }}> Yellow</span> → 
                <span style={{ fontWeight: '600', color: 'red' }}> Red</span>
              </div>
              
              <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.4', marginBottom: '12px' }}>
                <strong>Meaning:</strong><br/>
                • <span style={{ color: 'blue', fontWeight: '600' }}>Blue</span> = few orders / low activity<br/>
                • <span style={{ color: 'cyan', fontWeight: '600' }}>Cyan</span> = light activity<br/>
                • <span style={{ color: 'lime', fontWeight: '600' }}>Lime</span> = moderate activity<br/>
                • <span style={{ color: 'yellow', fontWeight: '600' }}>Yellow</span> = high activity<br/>
                • <span style={{ color: 'red', fontWeight: '600' }}>Red</span> = very high / hotspot
              </div>

              <div style={{ 
                padding: '10px', 
                background: '#e7f5ff', 
                borderRadius: '6px',
                borderLeft: '3px solid #4c6ef5'
              }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#1864ab', marginBottom: '4px' }}>
                  ✅ Pros: Intuitive and widely recognized
                </div>
                <div style={{ fontSize: '10px', color: '#364fc7', lineHeight: '1.4' }}>
                  This color scheme is universally understood - cool colors for low activity, warm colors for high activity.
                </div>
              </div>
            </div>

            {/* Color Meaning Details */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#495057', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🎯 Color Details
              </div>
              <div style={{ display: 'grid', gap: '6px' }}>
                {colorIntensityData.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid #f1f3f5'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        backgroundColor: item.color,
                        border: '2px solid #fff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: item.color }}>
                          {item.level}
                        </div>
                        <div style={{ fontSize: '10px', color: '#666' }}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '10px', color: '#868e96', fontWeight: '600' }}>
                      {item.orders}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div style={{ 
              padding: '12px', 
              background: 'linear-gradient(135deg, #fff3bf, #ffec99)', 
              borderRadius: '6px',
              border: '1px solid #ffd43b'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#e67700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                💡 Quick Tips
              </div>
              <div style={{ fontSize: '10px', color: '#e67700', lineHeight: '1.4' }}>
                • <strong>Focus on red areas</strong> - these need most attention<br/>
                • <strong>Blue areas</strong> = opportunity for growth<br/>
                • <strong>Use filters</strong> to analyze different time periods
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.9)',
          zIndex: 3,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e9ecef',
            borderTop: '4px solid #4c6ef5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <span style={{ marginTop: '16px', color: '#495057', fontSize: '14px', fontWeight: '500' }}>Loading map data...</span>
        </div>
      )}
      
      {/* Map Container */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
    </div>
  );
};

export default OrdersHeatmap;