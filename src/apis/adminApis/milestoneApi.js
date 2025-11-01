

// ✅ Create milestone

import apiClient from "../apiClient/apiClient";


export const createMilestone = async (milestoneData) => {
  try {
    const response = await apiClient.post("/admin/milestones", milestoneData);
    return response.data;
  } catch (error) {
    console.error("Error creating milestone:", error);
    throw error.response?.data || { message: "Error creating milestone" };
  }
};

// ✅ Get all milestones
export const getAllMilestones = async () => {
  try {
    const response = await apiClient.get("/admin/milestones");
    return response.data;
  } catch (error) {
    console.error("Error fetching milestones:", error);
    throw error.response?.data || { message: "Error fetching milestones" };
  }
};

// ✅ Get milestone by ID
export const getMilestoneById = async (id) => {
  try {
    const response = await apiClient.get(`/admin/milestones/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching milestone:", error);
    throw error.response?.data || { message: "Error fetching milestone" };
  }
};

// ✅ Update milestone
export const updateMilestone = async (id, updatedData) => {
  try {
    const response = await apiClient.put(`/admin/milestones/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Error updating milestone:", error);
    throw error.response?.data || { message: "Error updating milestone" };
  }
};

// ✅ Delete milestone
export const deleteMilestone = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/milestones/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting milestone:", error);
    throw error.response?.data || { message: "Error deleting milestone" };
  }
};