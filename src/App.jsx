import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'
import { ThemeProvider } from './context/ThemeContext'

// Public site
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import About from './components/About/About'
import Services from './components/Services/Services'
import Team from './components/Team/Team'
import Footer from './components/Footer/Footer'

// Admin
import AdminLogin from './pages/Admin/AdminLogin'
import AdminLayout from './pages/Admin/AdminLayout'
import Dashboard from './pages/Admin/Dashboard'
import ManagePhotos from './pages/Admin/ManagePhotos'
import ManageServices from './pages/Admin/ManageServices'
import ManageTeam from './pages/Admin/ManageTeam'

import './App.css'

function ProtectedRoute({ children }) {
  const { isAuth } = useAdminAuth()
  return isAuth ? children : <Navigate to="/admin/login" replace />
}

function PublicSite() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <div id="home"><Hero /></div>
        <div id="about"><About /></div>
        <div id="services"><Services /></div>
        <div id="team"><Team /></div>
      </main>
      <Footer />
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public website */}
      <Route path="/" element={<PublicSite />} />

      {/* Admin login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected admin panel */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="photos" element={<ManagePhotos />} />
        <Route path="services" element={<ManageServices />} />
        <Route path="team" element={<ManageTeam />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AdminAuthProvider>
          <AppRoutes />
        </AdminAuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
