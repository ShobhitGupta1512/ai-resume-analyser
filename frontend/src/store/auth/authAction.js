import {
  login,
  verifyLogin,
  register,
  verifyEmail,
  resendOtp,
  getMe,
  logout as apiLogout,
} from "../../services/api";

import { saveToken, removeToken, getToken } from "./authHelpers";

// ── Fetch Current User ────────────────────────────────────────
export const fetchUser = (set, get) => async () => {
  if (!getToken()) {
    set({ user: null, isAuthenticated: false });
    return;
  }
  try {
    set({ loading: true });
    const res = await getMe();
    // In api.js interceptor, we already returned res.data, 
    // so res here is the actual response body.
    set({ user: res.user, isAuthenticated: true, loading: false });
  } catch (err) {
    console.error("fetchUser failed:", err);
    removeToken();
    set({ user: null, token: null, isAuthenticated: false, loading: false });
  }
};

// ── Set Token ─────────────────────────────────────────────────
export const setToken = (set) => (token) => {
  saveToken(token);
  set({ token, isAuthenticated: !!token });
};

// ── Register ──────────────────────────────────────────────────
export const registerUser = (set) => async (data) => {
  try {
    set({ loading: true, error: null });
    const res = await register(data);
    set({ loading: false });
    return res;
  } catch (err) {
    // api.js response interceptor already normalized this to err.message
    set({ error: err.message, loading: false });
    throw err;
  }
};

// ── Verify Email OTP ──────────────────────────────────────────
export const verifyEmailOTP = (set, get) => async (data) => {
  try {
    set({ loading: true, error: null });
    const res = await verifyEmail(data);
    const token = res.accessToken;
    
    saveToken(token);
    set({ token });
    
    // Use the action from the store to update user data
    await get().fetchUser();
    
    set({ loading: false });
    return res;
  } catch (err) {
    set({ error: err.message, loading: false });
    throw err;
  }
};

// ── Login Step 1 ──────────────────────────────────────────────
export const loginUser = (set) => async (data) => {
  try {
    set({ loading: true, error: null });
    const res = await login(data);
    set({ loading: false });
    return res;
  } catch (err) {
    set({ error: err.message, loading: false });
    throw err;
  }
};

// ── Verify Login OTP Step 2 ───────────────────────────────────
export const verifyLoginOTP = (set, get) => async (data) => {
  try {
    set({ loading: true, error: null });
    const res = await verifyLogin(data);
    const token = res.accessToken;
    
    saveToken(token);
    set({ token });
    
    await get().fetchUser();
    
    set({ loading: false });
    return res;
  } catch (err) {
    set({ error: err.message, loading: false });
    throw err;
  }
};

// ── Resend OTP ────────────────────────────────────────────────
export const resendOtpAction = (set) => async (data) => {
  try {
    set({ error: null });
    const res = await resendOtp(data);
    return res;
  } catch (err) {
    set({ error: err.message });
    throw err;
  }
};

// ── Logout ────────────────────────────────────────────────────
export const logoutUser = (set) => async () => {
  try {
    await apiLogout();
  } catch (err) {
    console.warn("Logout API call failed (safe to ignore):", err.message);
  }
  removeToken();
  set({ user: null, token: null, isAuthenticated: false });
};

// ── Clear Error ───────────────────────────────────────────────
export const clearError = (set) => () => set({ error: null });