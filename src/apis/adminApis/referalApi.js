import apiClient from "../apiClient/apiClient";


export const getReferralPromotionSettings = async () => {
  try {
    const response = await apiClient.get("/referal/referral-promotions");
    return response.data;
  } catch (error) {
    console.error("Error fetching referral promotion settings:", error);
    throw error; // rethrow so caller can handle if needed
  }
};

// ✅ Create or update referral promotion settings
export const saveReferralPromotionSettings = async (payload) => {
  try {
    const response = await apiClient.post("/referal/referral-promotions", payload);
    return response.data;
  } catch (error) {
    console.error("Error saving referral promotion settings:", error);
    throw error; // rethrow so caller can handle if needed
  }
};