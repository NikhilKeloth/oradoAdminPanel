import apiClient from "../apiClient/apiClient";



// Create a tax
export const createTax = async (payload) => {
  try {
    const res = await apiClient.post("/taxes", payload);
    return res.data;
  } catch (error) {
    console.error("Failed to create tax:", error);
    throw error;
  }
};

// Get all taxes
export const getTaxes = async (taxType) => {
  try {
    const res = await apiClient.get("/taxes", {
      params: taxType ? { taxType } : {},
    });
    return res.data;
  } catch (error) {
    console.error("Failed to fetch taxes:", error);
    throw error;
  }
};

// Get tax by ID
export const getTaxById = async (id) => {
  try {
    const res = await apiClient.get(`/taxes/${id}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch tax:", error);
    throw error;
  }
};

// Update tax by ID
export const updateTax = async (id, payload) => {
  try {
    const res = await apiClient.put(`/taxes/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Failed to update tax:", error);
    throw error;
  }
};

// Delete tax by ID
export const deleteTax = async (id) => {
  try {
    const res = await apiClient.delete(`/taxes/${id}`);
    return res.data;
  } catch (error) {
    console.error("Failed to delete tax:", error);
    throw error;
  }
};

// Toggle tax status by ID
export const toggleTaxStatus = async (id) => {
  try {
    const res = await apiClient.put(`/taxes/toggle/${id}`);
    return res.data;
  } catch (error) {
    console.error("Failed to toggle tax status:", error);
    throw error;
  }
};
