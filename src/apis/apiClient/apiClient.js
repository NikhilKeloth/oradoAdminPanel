import axios from "axios";
import store from "../../store/store";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/";

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
});

// Attach token automatically to every request
apiClient.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("adminToken");
    const customerToken = localStorage.getItem("token");

    const token = adminToken || customerToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        `%c🔐 Token attached:`,
        "color: green; font-weight: bold;",
        token
      );
      console.log(
        `%c📡 Request URL:`,
        "color: blue; font-weight: bold;",
        config.baseURL + config.url
      );
    } else {
      console.warn(
        `%c⚠️ No token found for request to:`,
        "color: orange; font-weight: bold;",
        config.baseURL + config.url
      );
    }

    return config;
  },
  (error) => {
    console.error("⛔️ Error in request interceptor:", error);
    return Promise.reject(error);
  }
);

export default apiClient;

// Handle auth failures globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      try {
        // Clear admin keys
        localStorage.removeItem("adminToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        localStorage.removeItem("permissions");
        // Clear manager keys
        localStorage.removeItem("managerToken");
        localStorage.removeItem("managerRole");
        localStorage.removeItem("managerPermissions");
        localStorage.removeItem("assignedRestaurants");
        localStorage.removeItem("assignedBrands");

        const currentPath = window.location.pathname || "";
        const isManagerArea = currentPath.startsWith("/manager") || currentPath.includes("/manger");
        const loginPath = isManagerArea ? "/manger/login" : "/admin/login";
        if (!currentPath.startsWith(loginPath)) {
          window.location.replace(loginPath);
        }
      } catch (e) {
        // no-op
      }
    }
    return Promise.reject(error);
  }
);
