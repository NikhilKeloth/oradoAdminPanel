
import apiClient from "../apiClient/apiClient";
export const createGeofence = async (geofenceData) => {
  try {
    const res = await apiClient.post("/geofences", geofenceData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to create geofence" };
  }
};

// 📌 Get All Geofences
export const getGeofences = async () => {
  try {
    const res = await apiClient.get("/geofences");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch geofences" };
  }
};



export const deleteGeofence = async (id) => {
  try {
    const response = await apiClient.delete(`/geofences/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete geofence:", error);
    throw error.response?.data || { message: "Server error" };
  }
};