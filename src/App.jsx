import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PlaceholderPage from './pages/PlaceholderPage'
import { EMPLOYEE_PORTAL, MANAGER_PORTAL, HR_PORTAL } from './config/navConfig'

// Pages
import SplashScreen from './pages/SplashScreen'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/Dashboard'
import ApplyLeave from './pages/ApplyLeave'
import MyRequests from './pages/MyRequests'
import LeaveLedger from './pages/LeaveLedger'
import RequestDetails from './pages/RequestDetails'
import ManagerDashboard from './pages/ManagerDashboard'
import ApprovalInbox from './pages/manager/ApprovalInbox'
import HRDashboard from './pages/HRDashboard'
import NotFound from './pages/error/NotFound'
import ServerError from './pages/error/ServerError'
import CompOff from './pages/CompOff'
import HolidayCalendar from './pages/HolidayCalendar'

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
          <Route
            path="/apply-leave"
            element={
              <ProtectedRoute>
                <ApplyLeave />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute>
                <MyRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-requests/:requestId"
            element={
              <ProtectedRoute>
                <RequestDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-ledger"
            element={
              <ProtectedRoute>
                <LeaveLedger />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comp-off"
            element={
              <ProtectedRoute>
                <CompOff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/holiday-calendar"
            element={
              <ProtectedRoute>
                <HolidayCalendar />
              </ProtectedRoute>
            }
          />
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
          <Route
            path="/manager/approval-inbox"
            element={
              <ProtectedRoute>
                <ApprovalInbox />
              </ProtectedRoute>
            }
          />
          <Route path="/manager/team-calendar" element={guardedPlaceholder('Team Calendar', MANAGER_PORTAL)} />
          <Route path="/manager/team-members" element={guardedPlaceholder('Team Members', MANAGER_PORTAL)} />
          <Route path="/manager/delegation" element={guardedPlaceholder('Delegation', MANAGER_PORTAL)} />
          <Route path="/manager/reports" element={guardedPlaceholder('Reports & Analytics', MANAGER_PORTAL)} />
          <Route path="/manager/settings" element={guardedPlaceholder('Settings', MANAGER_PORTAL)} />

          {/* HR portal */}
          <Route
            path="/hr/dashboard"
            element={
              <ProtectedRoute>
                <HRDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/hr/employees" element={guardedPlaceholder('Employee Management', HR_PORTAL)} />
          <Route path="/hr/leave-policies" element={guardedPlaceholder('Leave Policies', HR_PORTAL)} />
          <Route path="/hr/leave-categories" element={guardedPlaceholder('Leave Categories', HR_PORTAL)} />
          <Route path="/hr/holiday-calendar" element={guardedPlaceholder('Holiday Calendar', HR_PORTAL)} />
          <Route path="/hr/reports" element={guardedPlaceholder('Reports & Analytics', HR_PORTAL)} />
          <Route path="/hr/audit-trail" element={guardedPlaceholder('Audit Trail', HR_PORTAL)} />
          <Route path="/hr/notification-queue" element={guardedPlaceholder('Notification Queue', HR_PORTAL)} />
          <Route path="/hr/settings" element={guardedPlaceholder('Settings', HR_PORTAL)} />

          <Route path="/404" element={<NotFound />} />
          <Route path="/server-error" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
