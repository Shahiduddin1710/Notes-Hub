import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/auth`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (data) => API.post("/login", data);
export const signup = (data) => API.post("/register", data);
export const googleAuth = (idToken) => API.post("/google-auth", { idToken });
export const sendResetOtp = (data) => API.post("/forgot-password", data);
export const verifyOtp = (email, otp) => API.post(`/verify-otp/${email}`, { otp });
export const resetPassword = (email, data) => API.post(`/change-password/${email}`, data);
