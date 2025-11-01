import apiClient from "../apiClient/apiClient";
// ✅ Create or Update full terminology for a language
export const saveTerminology = async (language, terms) => {
  try {
    const response = await apiClient.post("/terminology", { language, terms });
    console.log("Terminology saved successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error saving terminology:", error);
    throw error;
  }
};

// ✅ Get terminology by language
export const getTerminologyByLanguage = async (language) => {
  try {
    const response = await apiClient.get(`/terminology/${language}`);
    console.log("Terminology fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching terminology:", error);
    throw error;
  }
};
