import apiClient from "../apiClient/apiClient";

export const createTaxOrCharge = async (data) => {
  try {
    const response = await apiClient.post("/tax-and-charge", data);
    console.log("Tax/Charge created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating Tax/Charge:", error);
    throw error.response ? error.response.data : { message: "Network error" };
  }
};


export const getAllTaxesAndCharges = async (filters = {}) => {
  try {
    // Build query params string from filters object
    const queryParams = new URLSearchParams(filters).toString();

    const response = await apiClient.get(`/tax-and-charge${queryParams ? `?${queryParams}` : ""}`);
    
    return response.data.data;
  } catch (error) {
    console.error("Error fetching taxes/charges:", error);
    throw error.response ? error.response.data : { message: "Network error" };
  }
};


export const deleteTaxOrCharge = async (id) => {
  try {
    const response = await apiClient.delete(`/tax-and-charge/${id}`);
    console.log("Deleted Tax/Charge:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting Tax/Charge:", error);
    throw error.response ? error.response.data : { message: "Network error" };
  }
};

// ✅ Toggle Tax/Charge Status by ID
export const toggleTaxOrChargeStatus = async (id) => {
  try {
    const response = await apiClient.patch(`/tax-and-charge/${id}/toggle`);
    console.log("Toggled Tax/Charge status:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error toggling Tax/Charge status:", error);
    throw error.response ? error.response.data : { message: "Network error" };
  }
};


export const updateTaxOrCharge = async (id, updatedData) => {
  try {
    const response = await apiClient.patch(`/tax-and-charge/${id}`, updatedData);
    console.log("Tax/Charge updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating Tax/Charge:", error);
    throw error.response ? error.response.data : { message: "Network error" };
  }
};