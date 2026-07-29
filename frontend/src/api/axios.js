import axios from "axios";

// Dev: Vite proxies /api → http://localhost:5001
// Production (file:// protocol): Render deployed backend
const isProduction =
  typeof window !== "undefined" && window.location.protocol === "file:";

const baseURL = isProduction
  ? "https://invoice-desktop-app-1.onrender.com/api"
  : "/api";

const api = axios.create({
  baseURL,
  timeout: isProduction ? 60000 : 10000,
});

// Request interceptor — attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on login page
      if (!window.location.hash.includes("/login")) {
        window.location.hash = "#/login";
      }
      // Mark as auth error so components skip the toast
      error._isAuthError = true;
    }
    return Promise.reject(error);
  }
);

export default api;
