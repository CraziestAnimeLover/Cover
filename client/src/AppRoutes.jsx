import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicLayout from './components/layout/PublicLayout'
import DashboardLayout from './components/layout/DashboardLayout'

// Public Pages
import Home from './pages/shared/Home'
import About from './pages/shared/About'
import RegisterWithPurchase from './pages/auth/RegisterWithPurchase'
import ForgotPassword from './pages/auth/ForgotPassword'

// Admin/Instructor only login
import AdminLogin from './pages/auth/AdminLogin'

// User Pages
import UserDashboard from './pages/user/UserDashboard'
import BrowseCourses from './pages/user/BrowseCourses'
import CourseDetails from './pages/user/CourseDetails'
import MyLearning from './pages/user/MyLearning'
import Cart from './pages/user/Cart'
import Checkout from './pages/user/Checkout'
import MyProgress from './pages/user/MyProgress'
import CoursePlayer from './pages/user/CoursePlayer'
import Certificates from './pages/user/Certificates'
import Referrals from './pages/user/Referrals'
import StudentLogin from './pages/auth/StudentLogin'

// Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard'
import CreateCourse from './pages/agent/CreateCourse'
import EditCourse from './pages/agent/EditCourse'
import Earnings from './pages/agent/Earnings'
import AgentReferrals from './pages/agent/AgentReferrals'
import MyCourses from './pages/agent/MyCourses'
import Analytics from './pages/agent/Analytics'
import ManageCourse from './pages/agent/ManageCourse'

// Affiliate Pages
import AffiliateDashboard from './pages/affiliate/AffiliateDashboard'
import CommissionHistory from './pages/affiliate/CommissionHistory'
import WithdrawalHistory from './pages/affiliate/WithdrawalHistory'
import DownlineTree from './pages/affiliate/DownlineTree'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsers from './pages/admin/ManageUsers'
import ManageBanners from './pages/admin/ManageBanners';
import AdminNetworkExplorer from './pages/admin/AdminNetworkExplorer';
import ManageCourses from './pages/admin/ManageCourses'
import ManagePayouts from './pages/admin/ManagePayouts'
import PendingKYC from './pages/admin/PendingKYC'
import CommissionConfig from './pages/admin/CommissionConfig'

// Shared
import Profile from './pages/shared/Profile'
import Settings from './pages/shared/Settings'   // 👈 ADDED

function AppRoutes() {
  const { user } = useSelector((state) => state.auth)

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<RegisterWithPurchase />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/courses" element={<BrowseCourses />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
      </Route>

      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Student Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/my-learning" element={<MyLearning />} />
          <Route path="/my-progress" element={<MyProgress />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />   {/* 👈 ADDED */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/course-player/:courseId" element={<CoursePlayer />} />
          <Route path="/checkout" element={<Checkout />} />
        </Route>
      </Route>

      {/* Agent & Affiliate Routes */}
      <Route element={<ProtectedRoute allowedRoles={['instructor', 'agent', 'affiliate', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          {/* Agent routes */}
          <Route path="/agent/dashboard" element={<AgentDashboard />} />
          <Route path="/agent/courses" element={<MyCourses />} />
          <Route path="/agent/courses/create" element={<CreateCourse />} />
          <Route path="/agent/courses/:id/edit" element={<EditCourse />} />
          <Route path="/agent/courses/:id/manage" element={<ManageCourse />} />
          <Route path="/agent/earnings" element={<Earnings />} />
          <Route path="/agent/referrals" element={<AgentReferrals />} />
          <Route path="/agent/analytics" element={<Analytics />} />
          <Route path="/agent/settings" element={<Settings />} />   {/* 👈 ADDED */}

          {/* Affiliate routes */}
          <Route path="/affiliate/dashboard" element={<AffiliateDashboard />} />
          <Route path="/affiliate/commissions" element={<CommissionHistory />} />
          <Route path="/affiliate/withdrawals" element={<WithdrawalHistory />} />
          <Route path="/affiliate/downline" element={<DownlineTree />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/banners" element={<ManageBanners />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/courses" element={<ManageCourses />} />
          <Route path="/admin/payouts" element={<ManagePayouts />} />
          <Route path="/admin/pending-kyc" element={<PendingKYC />} />
          <Route path="/admin/network" element={<AdminNetworkExplorer />} />
          <Route path="/admin/commission-config" element={<CommissionConfig />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/settings" element={<Settings />} />   {/* 👈 ADDED */}
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default AppRoutes