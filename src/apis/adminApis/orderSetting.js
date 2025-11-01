


/**
 * Fetch global order settings
 */
// export const getGlobalOrderSettings = async () => {
//   try {
//     const response = await apiClient.get("/order-settings");
//     return response.data;
//   } catch (error) {
//     console.error("Failed to fetch global order settings:", error);
//     throw error.response?.data || { message: "Something went wrong." };
//   }
// };

import apiClient from "../apiClient/apiClient";

// /**
//  * Create or update global order settings
//  * @param {Object} settingsData
//  */
// export const createOrUpdateGlobalOrderSettings = async (settingsData) => {
//   try {
//     const response = await apiClient.post("/order-settings", settingsData);
//     return response.data;
//   } catch (error) {
//     console.error("Failed to save global order settings:", error);
//     throw error.response?.data || { message: "Something went wrong." };
//   }
// };
// your existing axios client

// =======================
// Restaurant Order Settings
// =======================

// Create or Update Order Settings for a restaurant
export const createOrUpdateOrderSettings = async (payload) => {
  try {
    const response = await apiClient.post("/order-settings", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating/updating order settings:", error);
    throw error;
  }
};

// Get Order Settings for a restaurant
export const getOrderSettings = async (restaurantId) => {
  try {
    const response = await apiClient.get(`/order-settings/${restaurantId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order settings:", error);
    throw error;
  }
};

// =======================
// Global Order Settings
// =======================

// Create or Update Global Order Settings
export const createOrUpdateGlobalOrderSettings = async (payload) => {
  try {
    const response = await apiClient.post("/global-order-settings", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating/updating global order settings:", error);
    throw error;
  }
};

// Get Global Order Settings
export const getGlobalOrderSettings = async () => {
  try {                                       
    const response = await apiClient.get("/global-order-settings");
    return response.data;
  } catch (error) {
    console.error("Error fetching global order settings:", error);
    throw error;
  }
};
