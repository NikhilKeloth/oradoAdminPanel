import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapComponent = ({ latitude, longitude, onSave }) => {
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);

  const [isEditable, setIsEditable] = useState(false);
  const [currentCoords, setCurrentCoords] = useState([longitude, latitude]);

  useEffect(() => {
    if (!latitude || !longitude) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [longitude, latitude],
      zoom: 13,
    });

    map.addControl(new mapboxgl.NavigationControl());

    // Marker
    const marker = new mapboxgl.Marker({ draggable: false })
      .setLngLat([longitude, latitude])
      .addTo(map);

    markerRef.current = marker;

    // Geocoder (search box)
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: "Search for address",
    });
    geocoderRef.current = geocoder;
    map.addControl(geocoder, "top-left");

    geocoder.on("result", (e) => {
      const coords = e.result.center;
      marker.setLngLat(coords);
      setCurrentCoords(coords);
      if (!isEditable) map.flyTo({ center: coords, zoom: 15 });
    });

    return () => {
      marker.remove();
      map.remove();
    };
  }, [latitude, longitude]);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setDraggable(isEditable);
      if (isEditable) {
        markerRef.current.on("dragend", () => {
          const lngLat = markerRef.current.getLngLat();
          setCurrentCoords([lngLat.lng, lngLat.lat]);
        });
      }
    }
  }, [isEditable]);

  const handleSave = () => {
    setIsEditable(false);
    if (onSave) onSave({ longitude: currentCoords[0], latitude: currentCoords[1] });
  };

  const handleCancel = () => {
    setIsEditable(false);
    if (markerRef.current) {
      markerRef.current.setLngLat([longitude, latitude]);
      setCurrentCoords([longitude, latitude]);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div ref={mapContainerRef} className="w-full h-64 rounded-lg mb-4" />

      <div className="flex flex-wrap items-center gap-2 mb-2">
        {!isEditable ? (
          <button
            onClick={() => setIsEditable(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </>
        )}

        <p className="text-sm text-gray-600 ml-auto">
          Current Coordinates:{" "}
          <span className="font-medium">
            {currentCoords[1].toFixed(6)}, {currentCoords[0].toFixed(6)}
          </span>
        </p>
      </div>
    </div>
  );
};

export default MapComponent;
