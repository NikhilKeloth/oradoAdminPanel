import apiClient from "../apiClient/apiClient";



/**
 * Fetch global delivery settings
 */
export const getGlobalDeliverySettings = async () => {
  try {
    const response = await apiClient.get("/delivey-settings");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch global delivery settings:", error);
    throw error.response?.data || { message: "Something went wrong." };
  }
};

/**
 * Create or update global delivery settings
 * @param {Object} settingsData
 */
export const createOrUpdateGlobalDeliverySettings = async (settingsData) => {
  try {
    const response = await apiClient.post("/delivey-settings", settingsData);
    return response.data;
  } catch (error) {
    console.error("Failed to save global delivery settings:", error);
    throw error.response?.data || { message: "Something went wrong." };
  }
};
