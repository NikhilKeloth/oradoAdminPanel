import apiClient from "./apiClient/apiClient";


export const createIncentivePlan = async (data) => {
  try {
    const response = await apiClient .post('/incentive', data);
    return response.data;
  } catch (error) {
    console.error('Error creating incentive plan:', error.response?.data || error.message);
    throw error;
  }
};


export const fetchIncentivePlans = async () => {
  try {
    const response = await apiClient.get('/incentive'); // Update with your actual API base path if needed
    return response.data;
  } catch (error) {
    console.error('Error fetching incentive plans:', error);
    throw error; // Re-throw to let the calling component handle it (optional)
  }
};