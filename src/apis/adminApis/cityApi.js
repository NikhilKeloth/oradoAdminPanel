import apiClient from "../apiClient/apiClient";

export const createCity = async (cityData) => {
  try {
    const response = await apiClient.post(`/city/cities`, cityData);
    return response.data;
  } catch (error) {
    console.error("Error creating city:", error);
    throw error.response?.data || { message: "Server error while creating city" };
  }
};

// ✅ Get all Cities
export const getCities = async () => {
  try {
    const response = await apiClient.get(`/city/cities`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cities:", error);
    throw error.response?.data || { message: "Server error while fetching cities" };
  }
};

export const toggleCityStatus = async (id) => {
  try {
    const response = await apiClient.patch(`/city/cities/${id}/status`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cities:", error);
    throw error.response?.data || { message: "Server error while fetching cities" };
  }
};




export const deleteCity = async (cityId) => {
  try {
    const response = await apiClient.delete(`/city/cities/${cityId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete city:", error);
    throw error.response?.data || { message: "Something went wrong" };
  }
};


export const updateCity = async (cityId, updatedData) => {
  try {
    const response = await apiClient.patch(`/city/cities/${cityId}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Failed to update city:", error);
    throw error.response?.data || { message: "Something went wrong" };
  }
};






export const getCityDeliveryFeeSetting = async (cityId) => {
  try {
    const response = await apiClient.get(`/city/cities/${cityId}/delivery-fee-setting`);
    console.log('Raw API response:', response.data);
    // The backend returns { success: true, data: cityDeliveryFeeSetting }
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch city delivery fee setting:", error);
    throw error;
  }
};

export const updateCityDeliveryFeeSetting = async (cityId, payload) => {
  try {
    // Send the payload directly (not nested under cityDeliveryFeeSetting)
    const response = await apiClient.put(`/city/cities/${cityId}/delivery-fee-setting`, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to update city delivery fee setting:", error);
    throw error;
  }
};

export const createCityDeliveryFeeSetting = async (cityId, payload) => {
  try {
    const response = await apiClient.post(`/city/cities/${cityId}/delivery-fee-setting`, {
      cityDeliveryFeeSetting: payload
    });
    return response.data.data;
  } catch (error) {
    console.error("Failed to create city delivery fee setting:", error);
    throw error;
  }
};