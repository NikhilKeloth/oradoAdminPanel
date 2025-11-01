import apiClient from "../apiClient/apiClient";
export const updateDeliveryFeeSettings = async (settingsData) => {
  try {
    const response = await apiClient.put(
      '/admin/settings/delivery-fee',
      settingsData
    );
    return response;
  } catch (error) {
    console.error('Error updating delivery fee settings:', error);
    throw error.response ? error.response.data : error;
  }
};




export const getCurrentDeliveryFeeSettings = async (settingsData) => {
  try {
    const response = await apiClient.get(
      '/admin/settings/delivery-fee',
    );
    return response;
  } catch (error) {
    console.error('Error updating delivery fee settings:', error);
    throw error.response ? error.response.data : error;
  }
};
