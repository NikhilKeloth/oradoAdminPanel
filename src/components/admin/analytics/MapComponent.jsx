import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiYW1hcm5hZGg2NSIsImEiOiJjbWJ3NmlhcXgwdTh1MmlzMWNuNnNvYmZ3In0.kXrgLZhaz0cmbuCvyxOd6w'; // Replace with your Mapbox public access token

const MapComponent = ({ selectedDateRange, mapStyle }) => { // Removed 'orders' prop
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(77.209); // Default center for India (Delhi)
    const [lat, setLat] = useState(28.6139);
    const [zoom, setZoom] = useState(9);

    // State for local mock order data
    const [localOrders, setLocalOrders] = useState([]);

    // State for tooltip
    const [tooltipContent, setTooltipContent] = useState(null);
    const [tooltipCoords, setTooltipCoords] = useState({ x: 0, y: 0 });

    // Simulate fetching order data directly within this component
    useEffect(() => {
        const dummyOrders = [
            { id: 'ORD001', latitude: 28.6139, longitude: 77.2090, timestamp: '2025-07-15T10:00:00Z', itemCount: 3 },
            { id: 'ORD002', latitude: 28.6200, longitude: 77.2150, timestamp: '2025-07-15T11:30:00Z', itemCount: 1 },
            { id: 'ORD003', latitude: 28.5900, longitude: 77.2000, timestamp: '2025-07-14T09:00:00Z', itemCount: 5 },
            { id: 'ORD004', latitude: 28.6000, longitude: 77.2200, timestamp: '2025-07-16T14:00:00Z', itemCount: 2 },
            { id: 'ORD005', latitude: 28.6300, longitude: 77.2050, timestamp: '2025-07-16T16:45:00Z', itemCount: 4 },
            { id: 'ORD006', latitude: 28.6180, longitude: 77.2100, timestamp: '2025-07-16T17:15:00Z', itemCount: 1 },
            { id: 'ORD007', latitude: 28.6130, longitude: 77.2085, timestamp: '2025-07-16T18:00:00Z', itemCount: 2 },
            { id: 'ORD008', latitude: 28.6150, longitude: 77.2095, timestamp: '2025-07-16T19:00:00Z', itemCount: 3 },
            { id: 'ORD009', latitude: 28.6250, longitude: 77.2180, timestamp: '2025-07-13T10:00:00Z', itemCount: 1 },
            { id: 'ORD010', latitude: 28.5800, longitude: 77.2300, timestamp: '2025-07-16T20:00:00Z', itemCount: 2 },
        ];
        setLocalOrders(dummyOrders);
    }, []); // Empty dependency array means this runs once on mount

    const createTooltip = useCallback((features, e) => {
        if (!features.length) {
            setTooltipContent(null);
            return;
        }

        const feature = features[0];
        let content = '';

        // If your heatmap data has a 'point_count' property for aggregated points
        if (feature.properties.point_count) {
            content = `Orders: ${feature.properties.point_count}`;
        } else {
            // For individual order points
            content = `Order ID: ${feature.properties.orderId || 'N/A'}`;
            // Add more details here, e.g., content += `<br/>Items: ${feature.properties.weight}`;
        }

        setTooltipContent(content);
        setTooltipCoords({ x: e.originalEvent.clientX, y: e.originalEvent.clientY });
    }, []);

    useEffect(() => {
        if (map.current) return; // Initialize map only once

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: mapStyle, // Use the passed map style
            center: [lng, lat],
            zoom: zoom,
        });

        map.current.on('move', () => {
            setLng(map.current.getCenter().lng.toFixed(4));
            setLat(map.current.getCenter().lat.toFixed(4));
            setZoom(map.current.getZoom().toFixed(2));
        });

        map.current.on('load', () => {
            // Add initial source and layer
            map.current.addSource('orders', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [] // Initial empty features
                }
            });

            map.current.addLayer({
                id: 'orders-heatmap',
                type: 'heatmap',
                source: 'orders',
                maxzoom: 15,
                paint: {
                    'heatmap-weight': [
                        'interpolate',
                        ['linear'],
                        ['get', 'weight'],
                        0, 0,
                        1, 1
                    ],
                    'heatmap-intensity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0, 1,
                        15, 3
                    ],
                    'heatmap-color': [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0, 'rgba(33,102,172,0)',
                        0.2, 'rgb(103,169,207)',
                        0.4, 'rgb(209,229,240)',
                        0.6, 'rgb(253,219,199)',
                        0.8, 'rgb(239,138,98)',
                        1, 'rgb(178,24,43)'
                    ],
                    'heatmap-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0, 2,
                        9, 20
                    ],
                    'heatmap-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        14, 1,
                        15, 0
                    ],
                }
            }, 'waterway-label');

            map.current.addLayer({
                id: 'orders-point',
                type: 'circle',
                source: 'orders',
                minzoom: 14,
                paint: {
                    'circle-radius': 5,
                    'circle-color': '#007cbf',
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-width': 1,
                    'circle-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        14, 0,
                        15, 1
                    ]
                }
            });

            map.current.on('mousemove', 'orders-heatmap', (e) => {
                createTooltip(e.features, e);
            });

            map.current.on('mouseleave', 'orders-heatmap', () => {
                setTooltipContent(null);
            });

            map.current.on('mousemove', 'orders-point', (e) => {
                createTooltip(e.features, e);
            });

            map.current.on('mouseleave', 'orders-point', () => {
                setTooltipContent(null);
            });
        });

        // Cleanup
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [mapStyle, createTooltip]); // Re-initialize map if mapStyle changes

    // Effect to update map data when `localOrders` or `selectedDateRange` changes
    useEffect(() => {
        if (!map.current || !map.current.isStyleLoaded()) return;

        // Filter orders based on selectedDateRange
        const filteredOrders = localOrders.filter(order => {
            const orderDate = new Date(order.timestamp);
            const start = selectedDateRange.start ? new Date(selectedDateRange.start) : null;
            const end = selectedDateRange.end ? new Date(selectedDateRange.end) : null;

            if (start && orderDate < start) return false;
            if (end && orderDate > end) return false;
            return true;
        });

        const geojson = {
            type: 'FeatureCollection',
            features: filteredOrders.map(order => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [order.longitude, order.latitude]
                },
                properties: {
                    orderId: order.id,
                    weight: order.itemCount || 1, // Example: use item count as weight
                }
            }))
        };

        if (map.current.getSource('orders')) {
            map.current.getSource('orders').setData(geojson);
        }
    }, [localOrders, selectedDateRange]); // Now depends on localOrders

    // Effect to change map style
    useEffect(() => {
        if (map.current && map.current.isStyleLoaded() && map.current.getStyle().sprite !== mapStyle) {
            const currentCenter = map.current.getCenter();
            const currentZoom = map.current.getZoom();
            const currentBearing = map.current.getBearing();
            const currentPitch = map.current.getPitch();

            map.current.setStyle(mapStyle);

            map.current.once('style.load', () => {
                map.current.setCenter(currentCenter);
                map.current.setZoom(currentZoom);
                map.current.setBearing(currentBearing);
                map.current.setPitch(currentPitch);

                // Re-add layers after style load if they were removed
                if (!map.current.getLayer('orders-heatmap')) {
                    map.current.addLayer({
                        id: 'orders-heatmap',
                        type: 'heatmap',
                        source: 'orders',
                        maxzoom: 15,
                        paint: {
                            'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 1, 1],
                            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
                            'heatmap-color': [
                                'interpolate', ['linear'], ['heatmap-density'],
                                0, 'rgba(33,102,172,0)', 0.2, 'rgb(103,169,207)',
                                0.4, 'rgb(209,229,240)', 0.6, 'rgb(253,219,199)',
                                0.8, 'rgb(239,138,98)', 1, 'rgb(178,24,43)'
                            ],
                            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
                            'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 14, 1, 15, 0],
                        },
                    }, 'waterway-label');
                }
                if (!map.current.getLayer('orders-point')) {
                    map.current.addLayer({
                        id: 'orders-point',
                        type: 'circle',
                        source: 'orders',
                        minzoom: 14,
                        paint: {
                            'circle-radius': 5, 'circle-color': '#007cbf',
                            'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1,
                            'circle-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, 1]
                        },
                    });
                }
                // Ensure data is reloaded after style change using localOrders
                const geojson = {
                    type: 'FeatureCollection',
                    features: localOrders.map(order => ({
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [order.longitude, order.latitude] },
                        properties: { orderId: order.id, weight: order.itemCount || 1 }
                    }))
                };
                if (map.current.getSource('orders')) {
                    map.current.getSource('orders').setData(geojson);
                }
            });
        }
    }, [mapStyle, localOrders]); // Now depends on localOrders

    return (
        <div className="relative w-full h-full">
            <div ref={mapContainer} className="w-full h-full" />
            <div className="absolute top-2 left-2 bg-white p-2 rounded-lg shadow-md z-10 text-sm">
                Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
            {tooltipContent && (
                <div
                    className="absolute bg-black text-white text-xs p-2 rounded-lg pointer-events-none"
                    style={{ left: tooltipCoords.x + 10, top: tooltipCoords.y + 10 }}
                >
                    {tooltipContent}
                </div>
            )}
        </div>
    );
};

export default MapComponent;