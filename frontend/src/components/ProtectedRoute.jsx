import { Navigate, useLocation } from "react-router-dom"
import useAuthStore from "../store/auth/authStore"

/**
 * 🔐 ProtectedRoute Component
 *
 * Purpose:
 * - Prevent unauthorized access to protected pages
 * - Ensure user is authenticated before rendering children
 *
 * Flow:
 * 1. Check loading → show loader
 * 2. Check token → if missing → redirect
 * 3. Check user → if missing → redirect
 * 4. Otherwise → render protected content
 */

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const loading = useAuthStore((state) => state.loading)

  const location = useLocation()

  // 🟡 1. While fetching user → prevent flicker
  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.loader}>Loading...</div>
      </div>
    )
  }

  // 🔴 2. No token → definitely not logged in
  if (!token) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  // 🔴 3. Token exists but user not fetched (invalid/expired token)
  if (!user) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  // ✅ 4. Authorized → render page
  return children
}

export default ProtectedRoute


// ─────────────────────────────────────────────
// 🎨 Simple Loader Styles (optional)
// ─────────────────────────────────────────────
const styles = {
  loaderContainer: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    fontSize: "18px",
    fontWeight: "500",
  },
}