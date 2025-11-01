import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { FaMapMarkerAlt } from 'react-icons/fa';

const containerStyle = {
  width: '100%',
  height: '100vh'
};

const center = {
  lat: 51.5080, // Charing Cross
  lng: -0.1246
};

const MapWithOverlayInfo = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY' // Replace with actual key
  });

  return isLoaded ? (
    <div className="relative w-full h-screen">
      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={16}
      >
        <Marker position={center} />
      </GoogleMap>

      {/* Business Info Card (bottom left corner) */}
      <div className="absolute bottom-10 left-10 bg-gray-900 text-white p-6 rounded-xl max-w-sm shadow-xl">
        <h2 className="text-xl font-bold">
          McDonald<span className="text-white">’</span>s
        </h2>
        <p className="text-orange-500 font-semibold">South London</p>
        <p className="text-sm mt-2">
          Lorem St, London Bridge, London SE1 2TF,<br />
          United Kingdom
        </p>
        <p className="mt-4 font-semibold text-sm">Phone number</p>
        <p className="text-red-500 font-semibold text-sm">+93444443–43</p>
      </div>

      {/* Floating Location Label (right center) */}
      <div className="absolute right-10 top-1/2 transform -translate-y-1/2 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
        <FaMapMarkerAlt className="text-orange-500 text-xl" />
        <div className="text-sm">
          <p className="font-semibold">McDonald's</p>
          <p className="text-gray-500 text-xs">South London</p>
        </div>
      </div>
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default MapWithOverlayInfo;
