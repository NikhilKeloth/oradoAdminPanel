 import apiClient from "../apis/apiClient/apiClient"

export const loginUser = async (email, password) => {
  try {
    const res = await apiClient.post("/user/login", {
      email,
      password,
    });
    return res.data;
  } catch (err) {
    // Safer fallback if `err.response` is undefined
    throw err.response?.data || { message: "Login failed" };
  }
};
