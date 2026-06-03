import axios from "axios";

// Dev: Vite proxies /api → http://localhost:5001
// Production (file:// protocol): must use full URL
const baseURL =
  typeof window !== "undefined" && window.location.protocol === "file:"
    ? "http://localhost:5001/api"
    : "/api";

const api = axios.create({
  baseURL,
  timeout: 10000,
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
      window.location.hash = "#/login";
    }
    return Promise.reject(error);
  }
);

export default api;
