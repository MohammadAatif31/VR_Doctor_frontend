import axios from "axios";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// ===============================
// 🔐 BASE URL (ENV SAFE)
// ===============================
const BASE_URL =
  import.meta.env.VITE_API_URL || "https://vr-doctor-backend.onrender.com/bot/v1";

// 🔒 ENV VALIDATION (important)
if (!import.meta.env.VITE_API_URL) {
  console.warn("⚠️ VITE_API_URL missing, using fallback localhost");
}

// ===============================
// ⚙️ AXIOS INSTANCE
// ===============================
const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // ⏱️ request timeout
});

// ===============================
// ⚙️ NPROGRESS CONFIG
// ===============================
NProgress.configure({
  showSpinner: false,
  speed: 400,
  minimum: 0.2,
});

// ===============================
// 🔥 GLOBAL LOADER CONTROL
// ===============================
let startLoader = null;
let stopLoader = null;

export const setLoader = (start, stop) => {
  startLoader = start;
  stopLoader = stop;
};

// ===============================
// 🚀 REQUEST INTERCEPTOR
// ===============================
API.interceptors.request.use(
  (config) => {
    // ✅ Skip loader option
    if (!config.skipLoader) {
      NProgress.start();
      startLoader?.();
    }

    // ===============================
    // 🔐 FUTURE TOKEN SUPPORT (SAFE)
    // ===============================
    // const token = localStorage.getItem("token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => {
    NProgress.done();
    stopLoader?.();
    return Promise.reject(error);
  }
);

// ===============================
// 🚀 RESPONSE INTERCEPTOR
// ===============================
API.interceptors.response.use(
  (response) => {
    if (!response.config?.skipLoader) {
      NProgress.done();
      stopLoader?.();
    }

    return response;
  },
  (error) => {
    if (!error.config?.skipLoader) {
      NProgress.done();
      stopLoader?.();
    }

    // ===============================
    // ❌ GLOBAL ERROR HANDLING
    // ===============================
    if (error.response) {
      const status = error.response.status;

      // 🔒 Unauthorized
      if (status === 401) {
        console.warn("🔐 Unauthorized - login required");
      }

      // 🚫 Forbidden
      if (status === 403) {
        console.warn("🚫 Access denied");
      }

      // 💥 Server error
      if (status >= 500) {
        console.error("💥 Server error");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("⏱️ Request timeout");
    } else {
      console.error("🌐 Network error");
    }

    return Promise.reject(error);
  }
);

export default API;