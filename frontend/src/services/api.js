import axios from "axios"

// ─── Base Axios Client ─────────────────────────────────────────
const api = axios.create({
  baseURL: "/api", // Vite proxy → http://localhost:5000/api
  timeout: 60000,  // 60s timeout for AI processing
})

// ─── Request Interceptor (Auth support) ────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor (Error normalization) ────────────────
api.interceptors.response.use(
  (response) => response.data,

  (error) => {

    if (!error.response) {
      return Promise.reject({
        message: "Cannot reach server. Make sure backend is running.",
        status: 0
      })
    }

    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      error.message ||
      "Something went wrong"

    const status = error.response.status

    return Promise.reject({ message, status })
  }
)


// ─── API METHODS ──────────────────────────────────────────────

/**
 * POST /api/upload
 * Upload resume and optionally job description
 */
export async function uploadResume(file, jobDescription = "") {

  const form = new FormData()
  form.append("resume", file)

  if (jobDescription.trim()) {
    form.append("jobDescription", jobDescription.trim())
  }

  return api.post("/upload", form)
}


/**
 * POST /api/match
 * Compare resume text with job description
 */
export async function matchJob(resumeText, jobDescription) {

  return api.post("/match", {
    resumeText,
    jobDescription
  })
}


/**
 * POST /api/feedback
 * Generate AI feedback
 */
export async function getFeedback(resumeText) {

  return api.post("/feedback", {
    resumeText
  })
}

export default api