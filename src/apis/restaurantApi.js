import apiClient from "./apiClient/apiClient";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";


// Fetch restaurant menu
export const getRestaurantMenu = async (restaurantId, options = {}) => {
  try {
    const response = await apiClient.get(`/restaurants/${restaurantId}/menu`, {
      params: {
        categoryLimit: options.categoryLimit || 10,
        productPage: options.productPage || 10,
        productLimit: options.productLimit || 30,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching restaurant menu:", error);
    throw error;
  }
};

// Fetch recommended restaurants nearby
export const getRecommendedRestaurants = async (latitude, longitude) => {
  try {
    const response = await apiClient.get("/location/nearby-restaurants/recommended", {
      params: { latitude, longitude },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching recommended restaurants:", error);
    throw error;
  }
};

// Fetch nearby categories
export const getNearbyCategories = async (latitude, longitude) => {
  try {
    const response = await apiClient.get("/location/nearby-categories", {
      params: { latitude, longitude },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching nearby categories:", error);
    throw error;
  }
};

// Fetch restaurant details by ID
export const getRestaurantById = async (restaurantId) => {
  try {
    const response = await apiClient.get(`/restaurants/${restaurantId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch restaurant by ID:", error);
    throw error;
  }
};




export const createRestaurant = async (formData) => {
  try {
    const response = await apiClient.post('/admin/creat-restaurant', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log("Restaurant created:", response.data);
    return response.data;

  } catch (error) {
    console.error("Error creating restaurant:", error.response?.data || error.message);
    throw error;
  }
};


// create api
export const createRestaurantByAdmin = async (restaurantData, documents = {}, images = []) => {
  const formData = new FormData();

  // Basic info
  formData.append("name", restaurantData.name);
  formData.append("ownerName", restaurantData.ownerName);
  formData.append("phone", restaurantData.phone);
  formData.append("email", restaurantData.email);
  formData.append("password", restaurantData.password);

  // Business details
  formData.append("fssaiNumber", restaurantData.fssaiNumber);
  formData.append("gstNumber", restaurantData.gstNumber);
  formData.append("aadharNumber", restaurantData.aadharNumber);
  formData.append("foodType", restaurantData.foodType);
  formData.append("minOrderAmount", restaurantData.minOrderAmount);
  formData.append("paymentMethods", restaurantData.paymentMethods.join(','));

  // Address fields (flattened like in your form)
  const { address } = restaurantData;
  if (address) {
    formData.append("address[street]", address.street);
    formData.append("address[city]", address.city);
    formData.append("address[state]", address.state);
    formData.append("address[pincode]", address.pincode);
    formData.append("address[latitude]", address.latitude);
    formData.append("address[longitude]", address.longitude);
  }

  // Opening hours (JSON string)
  formData.append("openingHours", JSON.stringify(restaurantData.openingHours));

  // Documents (individual file fields)
  if (documents.fssaiDoc) formData.append("fssaiDoc", documents.fssaiDoc);
  if (documents.gstDoc) formData.append("gstDoc", documents.gstDoc);
  if (documents.aadharDoc) formData.append("aadharDoc", documents.aadharDoc);

  // Images (multiple files)
  images.forEach((image) => {
    formData.append("images", image);
  });

  try {
    const response = await axios.post(`${BASE_URL}/admin/create-restaurant`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

