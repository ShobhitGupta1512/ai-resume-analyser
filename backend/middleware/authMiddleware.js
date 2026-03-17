/**
 * middleware/authMiddleware.js
 * AI Resume Analyser — Route Protection Middleware
 *
 * Usage:
 *   import { protect, requireAdmin } from '../middleware/authMiddleware.js'
 *   router.get('/profile', protect, handler)
 *   router.get('/admin',   protect, requireAdmin, handler)
 */

import { verifyAccessToken } from '../utils/tokens.js'
import User from '../models/user.js'

// ── protect — verifies access token from Authorization: Bearer <token> ──────
export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No access token provided' })
    }

    const token   = header.split(' ')[1]
    const payload = verifyAccessToken(token)        // throws if expired / invalid

    // Attach minimal user info — avoids DB hit on every request
    req.user = { id: payload.sub, role: payload.role }
    next()

  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Access token expired'
      : 'Invalid access token'
    return res.status(401).json({ success: false, error: msg })
  }
}

// ── requireAdmin — use after protect ────────────────────────────────────────
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' })
  }
  next()
}

// ── loadUser — attaches full user document (use sparingly, hits DB) ──────────
export async function loadUser(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -refreshTokens')
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Account not found or disabled' })
    }
    req.fullUser = user
    next()
  } catch (err) {
    next(err)
  }
}