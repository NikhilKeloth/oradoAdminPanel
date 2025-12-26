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

// In restaurantApi.js - ADD THESE FUNCTIONS:

// Get business hours
export const getBusinessHours = async (restaurantId) => {
  try {
    const response = await apiClient.get(
      `/admin/restaurant/${restaurantId}/business-hours`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching business hours:", error);
    throw error;
  }
};

// Update business hours
export const updateBusinessHours = async (restaurantId, businessHoursData) => {
  try {
    const response = await apiClient.put(
      `/admin/restaurant/${restaurantId}/business-hours`,
      { businessHours: businessHoursData }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating business hours:", error);
    throw error;
  }
};

export const updateOrderSettings = async (merchantId, data) => {
  try {
    const response = await apiClient.patch(`/admin/restaurant/${merchantId}/order-settings`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOrderSettings = async (merchantId) => {
  try {
    const response = await apiClient.get(`/admin/restaurant/${merchantId}/order-settings`);
    return response.data;
  } catch (error) {
    throw error;
  }
};