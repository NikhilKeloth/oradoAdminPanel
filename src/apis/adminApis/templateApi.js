import axios from "axios";
import apiClient from "../apiClient/apiClient";

// ✅ Create Template
export const createTemplate = async (templateData) => {
  try {
    const response = await apiClient.post("/templates", {
      ...templateData,
      // Ensure pricingRules are properly formatted
      pricingRules: templateData.pricingRules.map(rule => ({
        ...rule,
        // Convert range data to backend format
        ranges: rule.ranges?.map(range => ({
          fromDistance: 0,
          toDistance: range.isDefault ? null : parseFloat(range.distanceLimit),
          baseFare: parseFloat(range.basefare) || 0,
          durationFare: parseFloat(range.duration.charge) || 0,
          distanceFare: parseFloat(range.distance.fare) || 0,
          waitingFare: parseFloat(range.waitingTime.fare) || 0,
          baseDuration: parseFloat(range.duration.baseDuration) || 0,
          baseDistance: parseFloat(range.distance.baseDistance) || 0,
          baseWaitingTime: parseFloat(range.waitingTime.baseWaiting) || 0,
          surgeEnabled: range.surge.dynamic,
          surgeRule: range.surge.selectedRule || null
        }))
      }))
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create template:", error);
    throw error.response?.data || { message: "Something went wrong." };
  }
};
// ✅ Update Template by ID
export const updateTemplate = async (templateId, updateData) => {
  try {
    const response = await apiClient.put(`/templates/${templateId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Failed to update template:", error);
    throw error.response?.data || { message: "Something went wrong." };
  }
};

// ✅ Get All Templates
export const getAllTemplates = async () => {
  try {
    const response = await apiClient.get("/templates");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    throw error.response?.data || { message: "Something went wrong." };
  }
};

// ✅ Get Template by ID
export const getTemplateById = async (templateId) => {
  try {
    const response = await apiClient.get(`/templates/${templateId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch template:", error);
    throw error.response?.data || { message: "Something went wrong." };
  }
};
