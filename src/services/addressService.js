import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://orado.online/backend';

// Get auth token - use the same key as apiClient
const getAuthToken = () => localStorage.getItem('adminToken'); // Changed from 'authToken' to 'adminToken'

// API service for address operations
export const addressService = {
  // Add address for customer (admin)
  async addCustomerAddress(userId, addressData) {
    try {
      const token = getAuthToken();
      console.log('🔐 Token being used:', token ? 'Present' : 'Missing');
      
      const response = await axios.post(
        `${API_BASE_URL}/admin/customers/${userId}/addresses`,
        addressData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  },

  // Update customer address (admin)
  // Update customer address (admin)
async updateCustomerAddress(userId, addressId, addressData) {
  try {
    const token = getAuthToken();
    console.log('🔐 Update Address - Token:', token ? 'Present' : 'Missing');
    console.log('📦 Update Address - Data:', { userId, addressId, addressData });
    
    const response = await axios.put(
      `${API_BASE_URL}/admin/customers/${userId}/addresses/${addressId}`,
      addressData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Update Address Response:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error updating address:', error);
    
    // Enhanced error logging
    if (error.response) {
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    throw error;
  }
},

  // Delete customer address (admin)
  async deleteCustomerAddress(userId, addressId) {
    try {
      const token = getAuthToken();
      console.log('🔐 Token being used:', token ? 'Present' : 'Missing');
      
      const response = await axios.delete(
        `${API_BASE_URL}/admin/customers/${userId}/addresses/${addressId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },

  // Get customer addresses
  async getCustomerAddresses(userId) {
    try {
      const token = getAuthToken();
      console.log('🔐 Token being used:', token ? 'Present' : 'Missing');
      
      const response = await axios.get(
        `${API_BASE_URL}/admin/customer/${userId}/details`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching customer addresses:', error);
      throw error;
    }
  }
};