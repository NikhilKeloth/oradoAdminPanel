import apiClient from "../apiClient/apiClient";

export const createOffer = async (offerData) => {
  try {
    const response = await apiClient.post('/offer-and-discount/offers', offerData);
    return response.data;
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error;
  }
};

export const updateOffer = async (offerId, updateData) => {
  try {
    const response = await apiClient.put(`/offer-and-discount/offers/${offerId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating offer:', error);
    throw error;
  }
};

export const deleteOffer = async (offerId) => {
  try {
    const response = await apiClient.delete(`/offer-and-discount/offers/${offerId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting offer:', error);
    throw error;
  }
};

export const toggleOfferStatus = async (offerId) => {
  try {
    const response = await apiClient.patch(`/offer-and-discount/offers/${offerId}/toggle`);
    return response.data;
  } catch (error) {
    console.error('Error toggling offer status:', error);
    throw error;
  }
};

export const getAllOffers = async (filters = {}) => {
  try {
    // filters can include restaurantId, productId, isActive
    const response = await apiClient.get('/offer-and-discount/offers', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching offers:', error);
    throw error;
  }
};

export const getOfferById = async (offerId) => {
  try {
    const response = await apiClient.get(`/admin/offers/${offerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching offer:', error);
    throw error;
  }
};