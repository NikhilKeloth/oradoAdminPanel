import apiClient from "../apiClient/apiClient";


export const fetchCustomersList = async (page = 1, limit = 20, search = '') => {
  try {
    const response = await apiClient.get('/admin/customer-list', {
      params: {
        page,
        limit,
        search,
      },
    });
    

    return response.data; // returns the API response data directly

  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};