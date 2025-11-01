import axios from 'axios';
import apiClient from './apiClient/apiClient';

export const createSurgeArea = async (surgeData) => {
  try {
    const response = await apiClient.post('/admin/surge/add', surgeData)
 


    return response.data;

  } catch (error) {
    console.error('Error in createSurgeArea API:', error);
    throw error;
  }
};





export const getAllSurgeAreas = async () => {
  try {
    const response = await apiClient.get('/admin/surge-list');

    return response.data;

  } catch (error) {
    console.error('Error in createSurgeArea API:', error);
    throw error;
  }
};

