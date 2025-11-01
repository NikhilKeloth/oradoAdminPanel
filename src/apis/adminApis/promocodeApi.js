import apiClient from "../apiClient/apiClient";

// Fetch all promo codes (with optional filters as query params)


export const getPromoCodes = async (params = {}) => {
  try {
    const response = await apiClient.get('/promo-code', { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    throw error.response?.data || error;
  }
};

// Create a new promo code
export const createPromoCode = async (promoData) => {
  try {
    const response = await apiClient.post('/promo-code', promoData);
    return response.data;
  } catch (error) {
    console.error("Error creating promo code:", error);
    throw error.response?.data || error;
  }
};

// // Update an existing promo code
// export const updatePromoCode = async (promoId, promoData) => {
//   try {
//     const response = await apiClient.put(`/promo-code${promoId}`, promoData);
//     return response.data;
//   } catch (error) {
//     console.error("Error updating promo code:", error);
//     throw error.response?.data || error;
//   }
// };

// // Toggle active status of a promo code
// export const togglePromoStatus = async (promoId) => {
//   try {
//     const response = await apiClient.patch(`/promo-code${promoId}/toggle`);
//     return response.data;
//   } catch (error) {
//     console.error("Error toggling promo code status:", error);
//     throw error.response?.data || error;
//   }
// };

// // Delete a promo code
// export const deletePromoCode = async (promoId) => {
//   try {
//     const response = await apiClient.delete(`/promo-code${promoId}`);
//     return response.data;
//   } catch (error) {
//     console.error("Error deleting promo code:", error);
//     throw error.response?.data || error;
//   }
// };




export const togglePromoCodeStatus = async (promoId) => {
  try {
    const response = await apiClient.patch(`/promo-code/${promoId}/toggle`);
    return response.data;
  } catch (error) {
    console.error("Error toggling promo code status:", error);
    throw error.response?.data || error;
  }
};

// Delete a promo code
export const deletePromoCode = async (promoId) => {
  try {
    const response = await apiClient.delete(`/promo-code/${promoId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting promo code:", error);
    throw error.response?.data || error;
  }
};



export const updatePromoCode = async (promoId, updateData) => {
  try {
    const response = await apiClient.put(`/promo-code/${promoId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating promo code:", error);
    throw error.response?.data || error;
  }
};