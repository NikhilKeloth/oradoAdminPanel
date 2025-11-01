import apiClient from "./apiClient/apiClient"; 

export const updateCart = async (restaurantId, userId, productId, quantity) => {
  try {
    const payload = {
      restaurantId,
      userId,
      products: [
        {
          productId,
          quantity,
        },
      ],
    };

    const res = await apiClient.post("/cart/add", payload);
    console.log(res);
    return res.data;
  } catch (error) {
    console.error("Error updating cart:", error);
    throw error;
  }
};

export const getCart = async () => {
  try {
    const res = await apiClient.get("/cart");
    console.log("getCart response:", res.data);
    
    return res.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};