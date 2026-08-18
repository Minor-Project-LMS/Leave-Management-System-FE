import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PlaceholderPage from './pages/PlaceholderPage'
import { EMPLOYEE_PORTAL, MANAGER_PORTAL } from './config/navConfig'

// Pages
import SplashScreen from './pages/SplashScreen'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/Dashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import NotFound from './pages/error/NotFound'
import ServerError from './pages/error/ServerError'

// Wraps a placeholder page in the route guard + correct portal shell
const guardedPlaceholder = (title, portal, icon) => (
  <ProtectedRoute>
    <PlaceholderPage title={title} portal={portal} icon={icon} />
  </ProtectedRoute>
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Employee portal */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/apply-leave" element={guardedPlaceholder('Apply Leave', EMPLOYEE_PORTAL)} />
          <Route path="/my-requests" element={guardedPlaceholder('My Requests', EMPLOYEE_PORTAL)} />
          <Route path="/leave-ledger" element={guardedPlaceholder('Leave Ledger', EMPLOYEE_PORTAL)} />
          <Route path="/comp-off" element={guardedPlaceholder('Comp-Off', EMPLOYEE_PORTAL)} />
          <Route path="/holiday-calendar" element={guardedPlaceholder('Holiday Calendar', EMPLOYEE_PORTAL)} />
          <Route path="/notifications" element={guardedPlaceholder('Notifications', EMPLOYEE_PORTAL)} />
          <Route path="/profile" element={guardedPlaceholder('Profile', EMPLOYEE_PORTAL)} />

          {/* Manager portal */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/manager/approval-inbox" element={guardedPlaceholder('Approval Inbox', MANAGER_PORTAL)} />
          <Route path="/manager/team-calendar" element={guardedPlaceholder('Team Calendar', MANAGER_PORTAL)} />
          <Route path="/manager/team-members" element={guardedPlaceholder('Team Members', MANAGER_PORTAL)} />
          <Route path="/manager/delegation" element={guardedPlaceholder('Delegation', MANAGER_PORTAL)} />
          <Route path="/manager/reports" element={guardedPlaceholder('Reports & Analytics', MANAGER_PORTAL)} />
          <Route path="/manager/settings" element={guardedPlaceholder('Settings', MANAGER_PORTAL)} />

          <Route path="/404" element={<NotFound />} />
          <Route path="/server-error" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
