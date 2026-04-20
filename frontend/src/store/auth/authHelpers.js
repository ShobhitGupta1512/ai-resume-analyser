// ─────────────────────────────────────────────────────────────
// 🔑 Token Helpers
// Centralises all localStorage token read/write/remove logic.
// Import these instead of calling localStorage directly anywhere.
// ─────────────────────────────────────────────────────────────

const TOKEN_KEY = "accessToken"

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token)

export const removeToken = () => localStorage.removeItem(TOKEN_KEY)