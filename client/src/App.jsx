import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RoleProtectedRoute from './components/RoleProtectedRoute.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import OwnerDashboard from './pages/owner/OwnerDashboard.jsx'
import AddListing from './pages/owner/AddListing.jsx'
import EditListing from './pages/owner/EditListing.jsx'
import MyListings from './pages/owner/MyListings.jsx'
import BrowseListings from './pages/tenant/BrowseListings.jsx'
import ProfilePage from './pages/tenant/ProfilePage.jsx'
import Settings from './pages/Settings.jsx'
import MyInterests from './pages/tenant/MyInterests.jsx'
import InterestRequests from './pages/owner/InterestRequests.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
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
          path="/dashboard/settings"
          element={
            <RoleProtectedRoute allowedRoles={['tenant', 'owner', 'admin']}>
              <Settings />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/owner"
          element={
            <RoleProtectedRoute allowedRoles={['owner', 'admin']}>
              <OwnerDashboard />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
