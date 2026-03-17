/**
 * utils/tokens.js
 * AI Resume Analyser — JWT Token Utilities
 *
 * Access token  → short-lived (15min), lives in memory (JS variable, never localStorage)
 * Refresh token → long-lived (7d),  lives in httpOnly cookie (not readable by JS)
 */

import jwt from 'jsonwebtoken'
import crypto from 'crypto'

// ── Generate access token (sent in response body → stored in memory) ──
export function generateAccessToken(userId, role = 'user') {
  return jwt.sign(
    { sub: userId, role, type: 'access' },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  )
}

// ── Generate refresh token (opaque random string → stored in DB + cookie) ──
export function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex')
}

// ── Verify access token → returns payload or throws ──
export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
}

// ── Set refresh token as httpOnly cookie ──
export function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000,  // 7 days
    path:     '/api/auth',               // cookie only sent to auth routes
  })
}

// ── Clear refresh cookie on logout ──
export function clearRefreshCookie(res) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path:     '/api/auth',
  })
}