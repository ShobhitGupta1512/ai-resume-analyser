import axios from "axios";

// ══════════════════════════════════════════════════════════════
// 🌐 Base Axios Client
// ══════════════════════════════════════════════════════════════
const api = axios.create({
  /**
   * FIX: The guide specifies the backend runs on http://localhost:5000/api.
   * If you are using a Vite proxy, "/api" is correct. 
   * If NOT using a proxy, use "http://localhost:5000/api".
   */
  baseURL: "/api", 
  timeout: 60000,   // 60s for AI processing
  withCredentials: true, // Send httpOnly refresh-token cookie
});

// ══════════════════════════════════════════════════════════════
// 🔒 Request Interceptor — Attach JWT Access Token
// ══════════════════════════════════════════════════════════════
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; //
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ══════════════════════════════════════════════════════════════
// ⚠️ Response Interceptor — Normalise Errors & Data
// ══════════════════════════════════════════════════════════════
api.interceptors.response.use(
  (response) => response.data, // Unwrap .data for cleaner components
  (error) => {
    if (!error.response) {
      return Promise.reject({
        message: "Cannot reach server. Make sure the backend is running.",
        status: 0,
      });
    }

    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      "Something went wrong.";

    const status = error.response.status;
    return Promise.reject({ message, status });
  }
);

// ══════════════════════════════════════════════════════════════
// 📄 RESUME ROUTES
// ══════════════════════════════════════════════════════════════

/**
 * POST /api/upload
 * IMPORTANT: The guide states the key must be exactly "resume".
 */
export async function uploadResume(file, jobDescription = "") {
  const form = new FormData();

  // FIX: Field key must be "resume" according to Common Errors section.
  form.append("resume", file); 

  if (jobDescription.trim()) {
    // Standardized key for JD
    form.append("jobDescription", jobDescription.trim());
  }

  return api.post("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" }, //
  });
}

export async function matchJob(data) {
  return api.post("/match", data); //
}

export async function getFeedback(data) {
  return api.post("/feedback", data); //
}

export async function getHistory() {
  return api.get("/history"); //
}

export async function deleteHistory(id) {
  return api.delete(`/history/${id}`); //
}

// ══════════════════════════════════════════════════════════════
// 🔐 AUTH ROUTES
// ══════════════════════════════════════════════════════════════

export async function register(data) {
  return api.post("/auth/register", data); //
}

export async function verifyEmail(data) {
  return api.post("/auth/verify-email", data); //
}

export async function resendOtp(data) {
  return api.post("/auth/resend-otp", data); //
}

export async function login(data) {
  return api.post("/auth/login", data); //
}

export async function verifyLogin(data) {
  return api.post("/auth/verify-login", data); //
}

export async function refreshToken() {
  return api.post("/auth/refresh"); //
}

export async function logout() {
  return api.post("/auth/logout"); //
}

export async function getMe() {
  return api.get("/auth/me"); //
}

// ══════════════════════════════════════════════════════════════
// 🛠️ UTILITY ROUTES
// ══════════════════════════════════════════════════════════════

export async function healthCheck() {
  return api.get("/health"); //
}

export default api;