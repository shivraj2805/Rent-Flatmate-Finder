import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RoleProtectedRoute from './components/RoleProtectedRoute.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import OwnerDashboard from './pages/owner/OwnerDashboard.jsx'
import AddListing from './pages/owner/AddListing.jsx'
import EditListing from './pages/owner/EditListing.jsx'
import MyListings from './pages/owner/MyListings.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/dashboard/owner"
          element={
            <RoleProtectedRoute allowedRoles={['owner', 'admin']}>
              <OwnerDashboard />
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
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
