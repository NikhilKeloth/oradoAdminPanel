import apiClient from '../apiClient/apiClient';

// Get restaurant ID by name
export const getRestaurantIdByName = async (restaurantName) => {
  try {
    const response = await apiClient.get('/restaurants', { 
      params: { name: restaurantName } 
    });
    if (response.data && response.data.length > 0) {
      return response.data[0]._id;
    }
    return null;
  } catch (error) {
    console.error("Error fetching restaurant ID:", error);
    return null;
  }
};

// Get commission settings
export const getCommissionSettings = async (restaurantId, storeType) => {
  try {
    const params = {};
    if (restaurantId) params.restaurantId = restaurantId;
    if (storeType) params.storeType = storeType;
    
    const response = await apiClient.get('/commission/settings', { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching commission settings:", error);
    throw error;
  }
};

// Save commission settings
export const saveCommissionSettings = async (settingsData) => {
  try {
    const response = await apiClient.post('/commission/settings', settingsData);
    return response.data;
  } catch (error) {
    console.error("Error saving commission settings:", error);
    throw error;
  }
};

// Get all commission settings (for admin panel) - using the existing endpoint
export const getAllCommissionSettings = async () => {
  try {
    const response = await apiClient.get('/commission/settings');
    return response.data;
  } catch (error) {
    console.error("Error fetching all commission settings:", error);
    throw error;
  }
};

// Update commission setting
export const updateCommissionSetting = async (settingId, settingsData) => {
  try {
    const response = await apiClient.put(`/commission/settings/${settingId}`, settingsData);
    return response.data;
  } catch (error) {
    console.error("Error updating commission setting:", error);
    throw error;
  }
};

// Delete commission setting
export const deleteCommissionSetting = async (settingId) => {
  try {
    const response = await apiClient.delete(`/commission/settings/${settingId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting commission setting:", error);
    throw error;
  }
};



export const getCommissionDetails = async (params) => {
  try {
    // Build query parameters for filtering to match backend expectations
    const queryParams = {};
    
    // Backend expects restaurantId (ObjectId), not merchant name
    if (params.merchant && params.merchant !== "All Merchants") {
      // Convert merchant name to restaurantId
      const restaurantId = await getRestaurantIdByName(params.merchant);
      if (restaurantId) {
        queryParams.restaurantId = restaurantId;
      } else {
        console.warn(`Restaurant not found for name: ${params.merchant}`);
      }
    }
    
    // Backend expects startDate/endDate, not dateFrom/dateTo
    if (params.dateFrom) {
      queryParams.startDate = params.dateFrom;
    }
    
    if (params.dateTo) {
      queryParams.endDate = params.dateTo;
    }
    
    // Add pagination parameters
    queryParams.page = params.page || 1;
    queryParams.limit = params.limit || 20;
    
    // Note: Backend doesn't support search parameter yet
    // You can add search functionality to backend if needed
    
    console.log('Sending commission details request with params:', queryParams);
    
    const response = await apiClient.get('commission/summary', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error("Error fetching commission details:", error);
    throw error;
  }
};