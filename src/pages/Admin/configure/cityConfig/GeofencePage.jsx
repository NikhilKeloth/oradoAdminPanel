  import React, { useEffect, useRef, useState } from "react";
  import mapboxgl from "mapbox-gl";
  import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
  import { useNavigate } from "react-router-dom";
  import { deleteGeofence, getGeofences } from "../../../../apis/adminApis/geoFenceApi";
  import "mapbox-gl/dist/mapbox-gl.css";
  import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import DeliveryHeatmap from "../../../../components/admin/analytics/DeliveryHeatmap";

  mapboxgl.accessToken = "pk.eyJ1IjoiYW1hcm5hZGg2NSIsImEiOiJjbWJ3NmlhcXgwdTh1MmlzMWNuNnNvYmZ3In0.kXrgLZhaz0cmbuCvyxOd6w";

  const GeofencePage = () => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [geofences, setGeofences] = useState([]);
    const [activeGeofence, setActiveGeofence] = useState(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchGeofences = async () => {
      setIsLoading(true);
      try {
        const { data } = await getGeofences();
        const transformed = data.map((item) => ({
          id: item._id,
          _id: item._id,
          name: item.regionName,
          description: item.regionDescription,
          points: item.geometry.coordinates[0],
          lastUpdated: new Date(item.updatedAt).toLocaleDateString(),
          showMenu: false
        }));
        setGeofences(transformed);
      } catch (err) {
        console.error("Failed to fetch geofences", err);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchGeofences();
    }, []);

    // Initialize map
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [76.2673, 9.9312],
      zoom: 13,
    });

    mapRef.current = map;

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    // Add geocoder
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: "Search for a location",
      countries: "IN",
      marker: false,
    });

    map.addControl(geocoder, "top-left");

    // Geocoder result flyTo
    geocoder.on("result", (e) => {
      const { center } = e.result;
      map.flyTo({ center, zoom: 14 });
    });

    // On map load — mark it as loaded
    map.on('load', () => {
      setIsMapLoaded(true);
    });

    return () => {
      map.remove();
      setIsMapLoaded(false);
    };
  }, []);

    // Draw geofences on the map
    const drawGeofences = () => {
      if (!mapRef.current || !isMapLoaded) return;

      // Clear existing geofence layers
      geofences.forEach((_, index) => {
        if (mapRef.current.getLayer(`geofence-${index}`)) {
          mapRef.current.removeLayer(`geofence-${index}`);
        }
        if (mapRef.current.getSource(`geofence-${index}`)) {
          mapRef.current.removeSource(`geofence-${index}`);
        }
      });

      // Draw each geofence
      geofences.forEach((geofence, index) => {
        mapRef.current.addSource(`geofence-${index}`, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [geofence.points],
            },
            properties: {
              name: geofence.name,
              description: geofence.description
            }
          },
        });

        mapRef.current.addLayer({
          id: `geofence-${index}`,
          type: "fill",
          source: `geofence-${index}`,
          layout: {},
          paint: {
            "fill-color": index === activeGeofence ? "#3b82f6" : "#f59e0b",
            "fill-opacity": 0.4,
            "fill-outline-color": index === activeGeofence ? "#1d4ed8" : "#b45309",
          },
        });

        // Add hover effect
        mapRef.current.on('mouseenter', `geofence-${index}`, () => {
          mapRef.current.getCanvas().style.cursor = 'pointer';
        });

        mapRef.current.on('mouseleave', `geofence-${index}`, () => {
          mapRef.current.getCanvas().style.cursor = '';
        });
      });
    };
  useEffect(() => {
    if (isMapLoaded) {
      drawGeofences();
    }
  }, [geofences, activeGeofence, isMapLoaded])

    useEffect(() => {
      const handleClickOutside = () => {
        setGeofences(prev => prev.map(g => ({ ...g, showMenu: false })));
      };
      
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }, []);

    const handleAddGeofence = () => {
      navigate("/admin/dashboard/geofence/add");
    };

    const handleEditGeofence = (id) => {
      navigate(`/admin/dashboard/geofence/edit/${id}`);
    };

    const handleDeleteGeofence = async (index) => {
      try {
        const geofenceToDelete = geofences[index];
        await deleteGeofence(geofenceToDelete.id);
        setGeofences((prev) => prev.filter((_, i) => i !== index));
        if (activeGeofence === index) setActiveGeofence(null);
      } catch (error) {
        console.error("Error deleting geofence:", error);
      }
    };

    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
        <div className="flex items-center p-4 border-b bg-white shadow-sm">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 16V12L7 10L9 8V4M15 16V12L17 10L15 8V4M8 12H16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold ml-3 text-gray-800">Geofence Management</h2>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Geofence List */}
          <div className="w-full lg:w-1/3 p-4 bg-white border-r overflow-y-auto">
            <div className="mb-6">
              <p className="text-gray-600 mb-4 text-sm">
                Geofences define virtual boundaries for real-world areas. Create and manage geographic regions to monitor or restrict activities within specific locations.
              </p>

              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">
                  {geofences.length} {geofences.length === 1 ? 'Geofence' : 'Geofences'}
                </h3>
                <button
                  onClick={handleAddGeofence}
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Geofence
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : geofences.length === 0 ? (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No geofences found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new geofence.</p>
                <div className="mt-6">
                  <button
                    onClick={handleAddGeofence}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Geofence
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {geofences.map((geofence, index) => (
                  <div
                    key={geofence._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 relative ${
                      activeGeofence === index
                        ? "border-blue-300 bg-blue-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    onClick={() => {
                      setActiveGeofence(index);
                      if (geofence.points?.length > 0) {
                        const bounds = new mapboxgl.LngLatBounds();
                        geofence.points.forEach((coord) => {
                          bounds.extend(coord);
                        });
                        mapRef.current.fitBounds(bounds, {
                          padding: 60,
                          maxZoom: 15,
                          duration: 1000,
                        });
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 flex items-center">
                          {geofence.name}
                       
                        </h3>
                        {geofence.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {geofence.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveGeofence(index);
                            const updatedGeofences = geofences.map((g, i) => ({
                              ...g,
                              showMenu: i === index ? !g.showMenu : false
                            }));
                            setGeofences(updatedGeofences);
                          }}
                          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        
                        {geofence.showMenu && (
                          <div 
                            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="py-1">
                              <button
                                onClick={() => handleEditGeofence(geofence.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to delete this geofence?")) {
                                    handleDeleteGeofence(index);
                                  }
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center text-xs text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Updated: {geofence.lastUpdated}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


 


          {/* Map */}
          <div className="w-full lg:w-2/3 lg:h-full relative">
            <div ref={mapContainerRef} className="w-full h-full" />
            {isMapLoaded && (
              <div className="absolute bottom-4 left-4 bg-white p-2 rounded-lg shadow-md text-xs text-gray-600">

              </div>
            )}
          </div>
        </div>

      </div>
    );
  };

  export default GeofencePage;