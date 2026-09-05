import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PlaceholderPage from './pages/PlaceholderPage'
import { EMPLOYEE_PORTAL, HR_PORTAL } from './config/navConfig'

// Pages
import SplashScreen from './pages/SplashScreen'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/Dashboard'
import ApplyLeave from './pages/ApplyLeave'
import Profile from './pages/Profile'
import MyRequests from './pages/MyRequests'
import LeaveLedger from './pages/LeaveLedger'
import RequestDetails from './pages/RequestDetails'
import ManagerDashboard from './pages/ManagerDashboard'
import ApprovalInbox from './pages/manager/ApprovalInbox'
import TeamCalendar from './pages/manager/TeamCalendar'
import TeamMembers from './pages/manager/TeamMembers'
import DelegationManagement from './pages/manager/DelegationManagement'
import HRDashboard from './pages/HRDashboard'
import HREmployeeManagement from './pages/HREmployeeManagement'
import HRLeavePolicies from './pages/HRLeavePolicies'
import HRLeaveCategories from './pages/HRLeaveCategories'
import NotFound from './pages/error/NotFound'
import ServerError from './pages/error/ServerError'
import CompOff from './pages/CompOff'
import HolidayCalendar from './pages/HolidayCalendar'
import Notifications from './pages/Notifications'

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
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
          />

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
          <Route path="/manager/team-calendar" element={<ProtectedRoute><TeamCalendar /></ProtectedRoute>} />
          <Route path="/manager/team-members" element={<ProtectedRoute><TeamMembers /></ProtectedRoute>} />
          <Route path="/manager/delegation" element={<ProtectedRoute><DelegationManagement /></ProtectedRoute>} />
          <Route
            path="/manager/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* HR portal */}
          <Route
            path="/hr/dashboard"
            element={
              <ProtectedRoute>
                <HRDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/employees"
            element={
              <ProtectedRoute>
                <HREmployeeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/leave-policies"
            element={
              <ProtectedRoute>
                <HRLeavePolicies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/leave-categories"
            element={
              <ProtectedRoute>
                <HRLeaveCategories />
              </ProtectedRoute>
            }
          />
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
