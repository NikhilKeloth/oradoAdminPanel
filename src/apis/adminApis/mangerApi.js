import apiClient from "../apiClient/apiClient";



// ✅ Get all managers (with optional pagination params)
export const getAllManagers = async (params = {}) => {
  try {
    const response = await apiClient.get("/admin/manager", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching managers:", error);
    throw error.response?.data || { message: "Error fetching managers" };
  }
};

// ✅ Get manager by ID
export const getManagerById = async (id) => {
  try {
    const response = await apiClient.get(`/admin/manager/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching manager:", error);
    throw error.response?.data || { message: "Error fetching manager" };
  }
};

// ✅ Update manager by ID
export const updateManager = async (id, managerData) => {
  try {
    const response = await apiClient.put(`/admin/manager/${id}`, managerData);
    return response.data;
  } catch (error) {
    console.error("Error updating manager:", error);
    throw error.response?.data || { message: "Error updating manager" };
  }
};

// ✅ Delete manager by ID
export const deleteManager = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/manager/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting manager:", error);
    throw error.response?.data || { message: "Error deleting manager" };
  }
};


export const createManager = async (managerData) => {
  try {
    const response = await apiClient.post("/admin/manager", managerData);
    return response.data;
  } catch (error) {
    console.error("Error creating manager:", error);
    throw error.response?.data || { message: "Error creating manager" };
  }
};