import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage   from './pages/LandingPage'
import AnalysisPage  from './pages/AnalysisPage'
import DashboardPage from './pages/DashboardPage'
import NotFound      from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<LandingPage />}   />
        <Route path="/analyse"   element={<AnalysisPage />}  />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*"          element={<NotFound />}      />
      </Routes>
    </BrowserRouter>
  )
}