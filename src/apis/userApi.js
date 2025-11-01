import apiClient from "./apiClient/apiClient"; // Adjust path as needed

export const getAddress = async (userId) => {
  try {
    const response = await apiClient.get(`/user/adderss/${userId}`);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching address:", error.response?.data || error.message);
    throw error;
  }
};

export const updateAddress = async (userId, addressId, updatedAddress) => {
  try {
    const response = await apiClient.put(`/user/${userId}/addresses/${addressId}`, updatedAddress);
    console.log("Address updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating address:", error.response?.data || error.message);
    throw error;
  }
};




export const addAddress = async (userId, addressData) => {
  try {
    const response = await apiClient.post("/user/address", {
      userId:userId,
      type: addressData.type,
      street: addressData.street,
      city: addressData.city,
      state: addressData.state,
      zip: addressData.zip,
      longitude: addressData.location.longitude,
      latitude: addressData.location.latitude,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to add address:", error);
    throw error;
  }
};
