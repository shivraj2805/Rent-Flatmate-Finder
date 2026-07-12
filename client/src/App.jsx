import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RoleProtectedRoute from './components/RoleProtectedRoute.jsx'
import GuestRoute from './components/GuestRoute.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import AddListing from './pages/owner/AddListing.jsx'
import EditListing from './pages/owner/EditListing.jsx'
import MyListings from './pages/owner/MyListings.jsx'
import BrowseListings from './pages/tenant/BrowseListings.jsx'
import ProfilePage from './pages/tenant/ProfilePage.jsx'
import Settings from './pages/Settings.jsx'
import MyInterests from './pages/tenant/MyInterests.jsx'
import InterestRequests from './pages/owner/InterestRequests.jsx'
import ChatsPage from './pages/ChatsPage.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/" element={<Landing />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/dashboard/tenant/browse"
          element={
            <RoleProtectedRoute allowedRoles={['tenant', 'admin', 'owner']}>
              <BrowseListings />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/tenant/profile"
          element={
            <RoleProtectedRoute allowedRoles={['tenant', 'admin']}>
              <ProfilePage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/tenant/interests"
          element={
            <RoleProtectedRoute allowedRoles={['tenant', 'admin']}>
              <MyInterests />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/tenant/chats"
          element={
            <RoleProtectedRoute allowedRoles={['tenant', 'owner', 'admin']}>
              <ChatsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <RoleProtectedRoute allowedRoles={['tenant', 'owner', 'admin']}>
              <Settings />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/dashboard/owner/interests"
          element={
            <RoleProtectedRoute allowedRoles={['owner', 'admin']}>
              <InterestRequests />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/owner/listings"
          element={
            <RoleProtectedRoute allowedRoles={['owner', 'admin']}>
              <MyListings />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/owner/listings/new"
          element={
            <RoleProtectedRoute allowedRoles={['owner', 'admin']}>
              <AddListing />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/owner/listings/:listingId/edit"
          element={
            <RoleProtectedRoute allowedRoles={['owner', 'admin']}>
              <EditListing />
            </RoleProtectedRoute>
          }
        />
      </Route>
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminDashboard />} />
        <Route path="listings" element={<AdminDashboard />} />
        <Route path="interests" element={<AdminDashboard />} />
        <Route path="chats" element={<AdminDashboard />} />
        <Route path="activity" element={<AdminDashboard />} />
        <Route path="settings" element={<AdminDashboard />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
