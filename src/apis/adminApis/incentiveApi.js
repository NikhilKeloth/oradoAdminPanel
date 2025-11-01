import apiClient from "../apiClient/apiClient";


// Create an incentive plan
export const createIncentivePlan = async (planData) => {
  try {
    const response = await apiClient.post(`/incentive`, planData);
    return response.data;
  } catch (error) {
    console.error('Error creating incentive plan:', error);
    throw error.response?.data || { message: 'Failed to create plan' };
  }
};

// Fetch incentive plans (with optional filters)
export const getIncentivePlans = async ({ period, isActive } = {}) => {
  try {
    const params = {};
    if (period) params.period = period;
    if (isActive !== undefined) params.isActive = isActive;

    const response = await apiClient.get(`/incentive`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching incentive plans:', error);
    throw error.response?.data || { message: 'Failed to fetch plans' };
  }
};



export const togglePlanStatus = async (planId) => {
  try {
  
    const response = await apiClient.patch(`/incentive/${planId}/toggle`);
    return response.data;
  } catch (error) {
    console.error('Error toggling plan status:', error);
    throw error.response?.data || {
      success: false,
      message: 'Failed to toggle plan status'
    };
  }
}


export const deleteIncentivePlan = async (planId) => {
  try {
    const response = await apiClient.delete(`/incentive/${planId}`);
    return {
      success: true,
      data: response.data,
      error: null
    };
  } catch (error) {
    console.error('Error deleting incentive plan:', error);
    return {
      success: false,
      data: null,
      error: error.response?.data || {
        message: 'Failed to delete incentive plan'
      }
    };
  }
};
