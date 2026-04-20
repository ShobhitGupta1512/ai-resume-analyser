import User from '../models/User.js';
import { generateOTP, sendOTPEmail } from '../utils/email/otpMailer.js';
import { generateToken, generateRefreshToken } from '../utils/tokens.js';
import bcrypt from 'bcryptjs';

// Temporary in-memory storage for OTPs (In production, use Redis)
const otpCache = new Map();

/**
 * @desc    Register user & send OTP
 * @route   POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // 2. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // 3. Generate OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // 4. Store pending data in cache
    otpCache.set(email, { name, email, password, otp, otpExpires, purpose: 'verify-email' });

    // 5. Send Email
    await sendOTPEmail(email, otp, name);

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent to email. Please verify to complete registration.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Verify Email OTP & Create User
 * @route   POST /api/auth/verify-email
 */
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const data = otpCache.get(email);

    if (!data || data.otp !== otp || data.purpose !== 'verify-email') {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (Date.now() > data.otpExpires) {
      otpCache.delete(email);
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    // Create actual user
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password, // Ensure your User model hashes this in a pre-save hook
      isVerified: true
    });

    otpCache.delete(email);

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ success: true, accessToken, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Login Step 1 (Password Check)
 * @route   POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const otp = generateOTP();
    otpCache.set(email, { otp, otpExpires: Date.now() + 10 * 60 * 1000, purpose: 'login' });

    await sendOTPEmail(email, otp, user.name);

    res.status(200).json({ success: true, message: 'OTP sent for login verification' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Login Step 2 (Verify OTP)
 * @route   POST /api/auth/verify-login
 */
export const verifyLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const data = otpCache.get(email);

    if (!data || data.otp !== otp || data.purpose !== 'login') {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const user = await User.findOne({ email });
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    otpCache.delete(email);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'none' });
    res.status(200).json({ success: true, accessToken, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Current User Profile
 * @route   GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Logout
 * @route   POST /api/auth/logout
 */
export const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};