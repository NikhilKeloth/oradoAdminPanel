import apiClient from "../apiClient/apiClient";

export const getAdminOrders = async (page = 1, limit = 10) => {
  try {
    const response = await apiClient.get(`/admin/order-list?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw error;
  }
};
export const getAdminOrderDetails = async (orderId) => {
  try {
    const response = await apiClient.get(`/admin/order-details/${orderId}`);
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch order details:", error);
    throw error;
  }
};




export const fetchSingleCustomerDetails = async (customerId) => {
  try {
    const response = await apiClient.get(`/admin/customer/${customerId}/details`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching customer details:", error.response?.data?.message || error.message);
    throw error;
  }
};


export const addCity = async (cityData) => {
  try {
    const response = await apiClient.post(`/city/cities`, cityData);
    return response.data;
  } catch (error) {
    console.error("Failed to add city:", error.response?.data || error.message);
    throw error;
  }
};



export const getOrdersByCustomerForAdmin = async (params) => {
  try {
    const response = await apiClient.get(`/admin/orders/by-customer`, { params });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch customer orders:", error);
    throw error;
  }
};



export const getAllCities = async () => {
  try {
    const response = await apiClient.get('/city/cities');
    return response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

// Create city delivery fee setting
export const createCityDeliveryFeeSetting = async (data) => {
  try {
    const response = await apiClient.post('/city/city-delivery-fee-settings', data);
    return response.data;
  } catch (error) {
    console.error('Error creating city delivery fee:', error);
    throw error;
  }
};

// Get city delivery fee settings
export const getCityDeliveryFeeSettings = async (cityId) => {
  try {
    const response = await apiClient.get(`/city/city-delivery-fee-settings`, {
      params: { city: cityId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching city delivery fee:', error);
    throw error;
  }
};


// Get city delivery fee settings
export const updateDeliveryFeeSettings = async (cityId) => {
  try {
    const response = await apiClient.get(`/city/city-delivery-fee-settings`, {
      params: { city: cityId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching city delivery fee:', error);
    throw error;
  }
};








export const getSingleCityDeliveryFeeSetting = async (params) => {
  try {
    const response = await apiClient.get(`/city/city-delivery-fee-settings`, {
      params
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching city delivery fee setting:", error);
    throw error;
  }
}




export const fetchRestaurantsDropdown = async () => {
  try {
    const result = await apiClient.get("/admin/restaurants/dropdown-list");
    return result.data;
  } catch (error) {
    console.error("Error fetching restaurant dropdown:", error);
    return []; // or null / undefined / throw — depending on your preference
  }
}




export const fetchPromos = async (params = {}) => {
  try {
    const response = await apiClient.get("/promo", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching promos:", error);
    throw error;
  }
};


export const getLoyalitySettings = async (params = {}) => {
  try {
    const response = await apiClient.get("/loyality", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching promos:", error);
    throw error;
  }
};

export const createLoyaltySettings = async (data) => {
  try {
    const response = await apiClient.post("/loyality", data);
    return response.data;
  } catch (error) {
    console.error("Error saving loyalty settings:", error);
    throw error;
  }
};



export const updatePromo = async (promoId, data) => {
  try {
    const response = await apiClient.put(`/promo/${promoId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating promo:", error);
    throw error;
  }
};

// ✅ Delete promo
export const deletePromo = async (promoId) => {
  try {
    const response = await apiClient.delete(`/promo/${promoId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting promo:", error);
    throw error;
  }
};



export const restaurantTableList = async () => {
  try {
    const response = await apiClient.get("/admin/restaurants/table-list");
    return response.data;
  } catch (error) {
    console.error("error on fecthin restaurant list", error);
    throw error;
  }
};


export const fetchRestauantsLocationForMap = async () => {
  try {
    const response = await apiClient.get("/admin/restaurants/location-map");
    return response.data;
  } catch (error) {
    console.error("error on fecthin restaurant list", error);
    throw error;
  }
};


export const fetchOrdersLocationForMap = async () => {
  try {
    const response = await apiClient.get("/admin/orders/location-map");
    return response.data;
  } catch (error) {
    console.error("error on fecthin order location", error);
    throw error;
  }
};





export const fetchSingleRestaurantDetails = async (restaurantId) => {
  try {
    const response = await apiClient.get(`/admin/restaurants/details/${restaurantId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching restaurant details:", error.response?.data?.message || error.message);
    throw error;
  }
};







export const updateRestaurantProfile = async (restaurantId, updateData, imageFiles = []) => {
  try {
    const formData = new FormData();

    // Append text fields from updateData object
    for (const key in updateData) {
      formData.append(key, updateData[key]);
    }

    // Append images
    imageFiles.forEach(file => {
      formData.append("images", file);
    });

    const response = await apiClient.put(
      `/admin/edit/restaurant/${restaurantId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;

  } catch (error) {
    console.error("Error updating restaurant:", error.response?.data?.message || error.message);
    throw error;
  }
};



export const fetchRestaurantCategories = async (restaurantId) => {
  try {
    const response = await apiClient.get(`/admin/restaurant/${restaurantId}/category`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching restaurant categories:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const fetchCategoryProducts = async (restaurantId, categoryId, status = '', search = '') => {
  try {
    const params = new URLSearchParams();
    // if (status) params.append("status", status);
    if (search) params.append("search", search);

    const response = await apiClient.get(
      `/admin/restaurant/${restaurantId}/category/${categoryId}?${params.toString()}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching category products:", error.response?.data?.message || error.message);
    throw error;
  }
};


export const addCategory = async (restaurantId, categoryData) => {
  try {
    const formData = new FormData();
    formData.append("name", categoryData.name);
    formData.append("restaurantId", restaurantId);
    formData.append("active", categoryData.active);
    formData.append("autoOnOff", categoryData.autoOnOff);
    formData.append("description", categoryData.description);

    // Append images if any
    if (categoryData.images && categoryData.images.length > 0) {
      categoryData.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    const response = await apiClient.post(
      `/admin/restaurant/${restaurantId}/category`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating category:", error.response?.data?.message || error.message);
    throw error;
  }
};



export const addProduct = async (restaurantId, productData) => {
  try {
    const formData = new FormData();

    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("price", productData.price);
    formData.append("categoryId", productData.categoryId);
    formData.append("foodType", productData.foodType);
    formData.append("unit", productData.unit || "piece");
    formData.append("stock", productData.stock);
    formData.append("reorderLevel", productData.reorderLevel);

    formData.append(
      "revenueShare",
      JSON.stringify(productData.revenueShare || { type: "percentage", value: 10 })
    );

    if (productData.addOns) {
      formData.append("addOns", JSON.stringify(productData.addOns));
    }

    if (productData.attributes) {
      formData.append("attributes", JSON.stringify(productData.attributes));
    }

    // ✅ New Fields
    if (productData.minQty !== undefined) {
      formData.append("minQty", productData.minQty);
    }

    if (productData.maxQty !== undefined) {
      formData.append("maxQty", productData.maxQty);
    }

    if (productData.costPrice !== undefined) {
      formData.append("costPrice", productData.costPrice);
    }

    if (productData.preparationTime !== undefined) {
      formData.append("preparationTime", productData.preparationTime);
    }

    formData.append("isRecurring", productData.isRecurring ? "true" : "false");

    if (productData.availability) {
      formData.append("availability", JSON.stringify(productData.availability));
    }

    // Upload images
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    const response = await apiClient.post(
      `/admin/restaurant/${restaurantId}/product`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding product:", error.response?.data?.message || error.message);
    throw error;
  }
};




export const saveFcmToken = async ({  token,  platform = 'web' }) => {
  try {
    const response = await apiClient.post('/admin/save-fcm-token', {
    token,
      platform,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving FCM token:", error.response?.data?.message || error.message);
    throw error;
  }
}