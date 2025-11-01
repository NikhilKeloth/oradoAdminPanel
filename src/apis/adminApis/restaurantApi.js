import apiClient from "../apiClient/apiClient";

export const fetchProductsByRestaurant = async (restaurantId) => {
  try {
    const response = await apiClient.get(`/admin/products/by-restaurant/${restaurantId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};





export const getServiceAreas = async (restaurantId) => {
  try {
    const response = await apiClient.get(`/restaurants/${restaurantId}/service-areas`);
    console.log("Fetched service areas:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching service areas:", error);
    throw error;
  }
};




export const getOpeningHours = async (restaurantId) => {
  try {
    const response = await apiClient.get(`/admin/restaurant/${restaurantId}/opening-hours`);
    return response
  } catch (error) {
    console.error("Error fetching opening hours:", error);
    throw error;
  }
}




export const updateOpeningHours = async (restaurantId, openingHoursData) => {
  try {
    const response = await apiClient.put(
      `/admin/restaurant/${restaurantId}/opening-hours`,
      { openingHours: openingHoursData }
    );
   
    return response.data;
  } catch (error) {
    console.error("Error updating opening hours:", error);
    throw error;
  }
};