import { useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import useAuthStore from "./store/auth/authStore.js"
import ProtectedRoute from "./components/ProtectedRoute"

import LandingPage from "./pages/LandingPage"
import DashboardPage from "./pages/DashboardPage"
import AnalysisPage from "./pages/AnalysisPage"
import NotFound from "./pages/NotFound"

function App() {
  const fetchUser = useAuthStore((state) => state.fetchUser)

  useEffect(() => {
    fetchUser() // 🔥 auto login on refresh
  }, [])

  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<LandingPage />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analysis"
          element={
            <ProtectedRoute>
              <AnalysisPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App