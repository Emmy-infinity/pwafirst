// src/api.js
import axios from "axios";

// Flag to prevent multiple refresh requests at the same time
let isRefreshing = false;
// Queue to hold pending requests while token is being refreshed
let refreshQueue = [];

const api = axios.create({
  baseURL: "https://django-ecommerce-backend-4u8q.onrender.com",
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// ─── Request Interceptor ──────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── Response Interceptor (Auto Token Refresh) ──────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If not a 401 or already retried → reject
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    // Start the refresh flow
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem("REFRESH_TOKEN");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(
        "https://django-ecommerce-backend-4u8q.onrender.com/api/token/refresh/",
        { refresh: refreshToken }
      );

      const newAccessToken = response.data.access;
      localStorage.setItem("ACCESS_TOKEN", newAccessToken);

      // Update Authorization header for the original request
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // Process queued requests with the new token
      refreshQueue.forEach(({ resolve, reject, config }) => {
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        api(config).then(resolve).catch(reject);
      });
      refreshQueue = [];

      // Retry the original request
      return api(originalRequest);

    } catch (refreshError) {
      // Refresh failed → force logout
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("REFRESH_TOKEN");
      // Redirect to login page
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
