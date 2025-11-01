import apiClient from "../apiClient/apiClient";

// src/api/managerApi.js


export const loginManager = async (email, password) => {
  try {
    const response = await apiClient.post('/manager/login', { email, password });
    return response.data;
  } catch (error) {
    // Normalize error response for consistent handling
    if (error.response) {
      // Backend returned an error response (4xx/5xx)
      const { status, data } = error.response;
      
      // Create normalized error object
      const normalizedError = {
        message: data.message || 'Login failed',
        status,
        errors: data.errors || null,
        isNetworkError: false
      };
      
      throw normalizedError;
    } else if (error.request) {
      // Request was made but no response received
      throw {
        message: 'Network error - please check your connection',
        status: null,
        errors: null,
        isNetworkError: true
      };
    } else {
      // Something else went wrong
      throw {
        message: 'An unexpected error occurred',
        status: null,
        errors: null,
        isNetworkError: false
      };
    }
  }
};