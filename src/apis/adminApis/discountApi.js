import apiClient from "../apiClient/apiClient";


// 📌 Create Restaurant Discount
export const createRestaurantDiscount = async (data) => {
  try {
    const response = await apiClient.post("/discounts/restaurant", data);
    return response.data;
  } catch (error) {
    console.error("Failed to create restaurant discount:", error);
    throw error.response?.data || { message: "Server error while creating restaurant discount" };
  }
};

// 📌 Get Restaurant Discounts
export const getRestaurantDiscounts = async (restaurantId) => {
  try {
    const response = await apiClient.get(`/discounts/restaurant/${restaurantId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch restaurant discounts:", error);
    throw error.response?.data || { message: "Server error while fetching restaurant discounts" };
  }
};

// 📌 Create Product Discount
export const createProductDiscount = async (data) => {
  try {
    const response = await apiClient.post("/discounts/product", data);
    return response.data;
  } catch (error) {
    console.error("Failed to create product discount:", error);
    throw error.response?.data || { message: "Server error while creating product discount" };
  }
};

// 📌 Get Product Discounts
export const getProductDiscounts = async (productId) => {
  try {
    const response = await apiClient.get(`/discounts/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch product discounts:", error);
    throw error.response?.data || { message: "Server error while fetching product discounts" };
  }
};
