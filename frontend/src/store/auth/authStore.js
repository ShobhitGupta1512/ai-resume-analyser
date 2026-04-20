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

  register:    registerUser(set),
  // ✅ Wrap in arrow so get() is called at invocation time, not creation time
  verifyEmail: (data) => verifyEmailOTP(set, get)(data),
  login:       loginUser(set),
  verifyLogin: (data) => verifyLoginOTP(set, get)(data),
  resendOtp:   resendOtpAction(set),
  logout:      logoutUser(set),
  clearError:  clearError(set),
  fetchUser:   (args) => fetchUser(set, get)(args),
  setToken:    setToken(set),
}));

export default useAuthStore;