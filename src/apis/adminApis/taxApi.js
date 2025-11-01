import apiClient from "../apiClient/apiClient";
export const getAllTaxes = async () => {
  try {
    const response = await apiClient.get('/admin/taxes');  
    console.log('Fetched taxes:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching taxes:', error);
    throw error;
  }
};



export const addTax = async (taxData) => {
  try {
    const response = await apiClient.post('/admin/taxes', taxData);
    console.log('Tax added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding tax:', error);
    throw error;
  }
};


export const deleteTax = async (taxId) => {
  try {
    const response = await apiClient.delete(`/admin/taxes/${taxId}`);
    console.log('Tax deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting tax:', error);
    throw error;
  }
};


export const editTax = async (taxData) => {
  try {
    const response = await apiClient.patch(`/admin/taxes/${taxData._id}`,
        {
            name:taxData.name,
            applicableFor:taxData.applicableFor,
            percentage:taxData.percentage

        }
    );
    console.log('Tax deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting tax:', error);
    throw error;
  }
};


 export const toggleTaxStatus = async (taxId) => {
  try {
    const response = await apiClient.patch(`/admin/taxes/${taxId}/toggle`);
    console.log("API Response:", response.data);
    return response.data; // Now contains { success, message, data: { _id, active } }
  } catch (error) {
    console.error("Error toggling tax status:", error);
    throw error.response ? error.response.data : { message: "Network error" };
  }
};