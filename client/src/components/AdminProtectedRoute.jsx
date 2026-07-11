import RoleProtectedRoute from './RoleProtectedRoute.jsx'

const AdminProtectedRoute = ({ children }) => {
  return <RoleProtectedRoute allowedRoles={['admin']}>{children}</RoleProtectedRoute>
}

export default AdminProtectedRoute