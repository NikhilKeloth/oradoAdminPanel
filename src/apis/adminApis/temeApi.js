import apiClient from "../apiClient/apiClient";

export const getMyThemeSettings = async () => {
  try {
    const response = await apiClient.get("/theme-settings/my-theme");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch theme settings:", error);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// ✅ Create or update current user's theme settings
export const createOrUpdateMyThemeSettings = async (themeData) => {
  try {
    const response = await apiClient.post("/theme-settings/my-theme", themeData);
    return response.data;
  } catch (error) {
    console.error("Failed to save theme settings:", error);
    throw error.response?.data || { message: "Something went wrong" };
  }
};