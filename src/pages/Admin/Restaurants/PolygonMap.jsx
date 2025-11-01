import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1IjoiYW1hcm5hZGg2NSIsImEiOiJjbWJ3NmlhcXgwdTh1MmlzMWNuNnNvYmZ3In0.kXrgLZhaz0cmbuCvyxOd6w";

const PolygonMap = ({ serviceArea, restaurantLocation, restaurantName }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Determine map center
    let initialCenter = restaurantLocation || [0, 0];
    if (serviceArea.type === "Polygon" && serviceArea.area?.coordinates) {
      const coords = serviceArea.area.coordinates[0];
      const lats = coords.map(c => c[1]);
      const lngs = coords.map(c => c[0]);
      initialCenter = [
        (Math.min(...lngs) + Math.max(...lngs)) / 2,
        (Math.min(...lats) + Math.max(...lats)) / 2,
      ];
    } else if (serviceArea.type === "Circle" && serviceArea.center) {
      initialCenter = serviceArea.center;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCenter,
      zoom: 12,
    });

    map.current.on("load", () => {
      // Polygon
      if (serviceArea.type === "Polygon" && serviceArea.area?.coordinates) {
        map.current.addSource("polygon-area", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: serviceArea.area.coordinates,
            },
          },
        });

        map.current.addLayer({
          id: "polygon-fill",
          type: "fill",
          source: "polygon-area",
          paint: { "fill-color": "#FF5722", "fill-opacity": 0.4 },
        });

        map.current.addLayer({
          id: "polygon-outline",
          type: "line",
          source: "polygon-area",
          paint: { "line-color": "#FF5722", "line-width": 2 },
        });
      }

      // Circle
      if (serviceArea.type === "Circle" && serviceArea.center && serviceArea.radius) {
        const circleFeature = turf.circle(serviceArea.center, serviceArea.radius, {
          steps: 64,
          units: "meters",
        });

        map.current.addSource("circle-area", {
          type: "geojson",
          data: circleFeature,
        });

        map.current.addLayer({
          id: "circle-fill",
          type: "fill",
          source: "circle-area",
          paint: { "fill-color": "#2196F3", "fill-opacity": 0.3 },
        });

        map.current.addLayer({
          id: "circle-outline",
          type: "line",
          source: "circle-area",
          paint: { "line-color": "#2196F3", "line-width": 2 },
        });
      }

      // Restaurant marker
      if (restaurantLocation?.length === 2) {
        new mapboxgl.Marker({ color: "green" })
          .setLngLat(restaurantLocation)
          .setPopup(new mapboxgl.Popup().setText(restaurantName))
          .addTo(map.current);
      }
    });

    return () => map.current?.remove();
  }, [serviceArea, restaurantLocation, restaurantName]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
};

export default PolygonMap;
