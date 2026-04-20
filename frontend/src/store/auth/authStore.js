import { create } from "zustand";
import authState from "./authState";
import {
  fetchUser,
  setToken,
  registerUser,
  verifyEmailOTP,
  loginUser,
  verifyLoginOTP,
  resendOtpAction,
  logoutUser,
  clearError,
} from "./authAction"; //

const useAuthStore = create((set, get) => ({
  ...authState,

  // Map the long action names to the short names used in your AuthModal
  register:       registerUser(set), 
  verifyEmail:    verifyEmailOTP(set, get),
  login:          loginUser(set),
  verifyLogin:    verifyLoginOTP(set, get),
  resendOtp:      resendOtpAction(set),
  logout:         logoutUser(set),
  clearError:     clearError(set),
  fetchUser:      fetchUser(set, get),
  setToken:       setToken(set),
}));

export default useAuthStore;