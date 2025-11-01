import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"

mapboxgl.accessToken = "pk.eyJ1IjoiYW1hcm5hZGg2NSIsImEiOiJjbWJ3NmlhcXgwdTh1MmlzMWNuNnNvYmZ3In0.kXrgLZhaz0cmbuCvyxOd6w";

const LocationPicker = ({ onSelectLocation }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Reverse geocoding API call
  const reverseGeocode = useCallback(async (lng, lat) => {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`,
        {
          params: {
            access_token: mapboxgl.accessToken,
            types: "address,place,locality,neighborhood,region,postcode",
          },
        }
      );

      const place = response.data.features[0];
      const context = place?.context || [];

      const locationDetails = {
        latitude: lat,
        longitude: lng,
        street: place?.place_name || "",
        city: context.find((c) => c.id.includes("place"))?.text || "",
        state: context.find((c) => c.id.includes("region"))?.text || "",
        zip: context.find((c) => c.id.includes("postcode"))?.text || "",
      };

      setSelectedLocation(locationDetails);
    } catch (error) {
      console.error("Reverse geocoding failed", error);
    }
  }, []);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [76.2673, 9.9312],
      zoom: 13,
    });

    mapRef.current = map;

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: "Search for a location",
      countries: "IN",
      marker: false,
    });

    map.addControl(geocoder, "top-left");

    geocoder.on("result", (e) => {
      const { center } = e.result;

      if (markerRef.current) markerRef.current.remove();

      const marker = new mapboxgl.Marker().setLngLat(center).addTo(map);
      markerRef.current = marker;

      map.flyTo({ center, zoom: 14 });
      reverseGeocode(center[0], center[1]);
    });

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;

      if (markerRef.current) {
        markerRef.current.remove();
      }

      const marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
      markerRef.current = marker;

      reverseGeocode(lng, lat);
      console.log("MAPBOX TOKEN:", mapboxgl.accessToken);
    });

    return () => {
      map.remove();
    };
  }, [reverseGeocode]);

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation);
    } else {
      alert("Please select a location on the map first.");
    }
  };

  return (
    <div className="w-full rounded overflow-hidden border relative">
      {/* Confirm Button */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button
          onClick={handleConfirmLocation}
          className="bg-green-600 text-white px-3 py-1 rounded shadow hover:bg-green-700 transition-colors text-sm"
        >
          ✅ Use This Location
        </button>
      </div>

      {/* Map */}
      <div ref={mapContainerRef} className="w-full h-[400px]" />

      {/* Selected Address Preview */}
      <div className="p-3 border-t text-sm bg-gray-50">
        {selectedLocation ? (
          <div>
            <strong>📍 Selected Address:</strong><br />
            {selectedLocation.street}<br />
            {selectedLocation.city}, {selectedLocation.state} {selectedLocation.zip}
          </div>
        ) : (
          <span className="text-gray-500">Click or search on the map to select a location</span>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
