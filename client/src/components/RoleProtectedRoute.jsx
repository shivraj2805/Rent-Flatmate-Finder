import { Link, Navigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth.jsx'

const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          <p className="text-sm font-medium text-slate-500">Checking permissions…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-7.43 12.8A2 2 0 004.58 20h14.84a2 2 0 001.72-3.34l-7.43-12.8a2 2 0 00-3.44 0z" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">Access denied</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your account does not have permission to open this page. This route is available only to: {allowedRoles.join(', ')}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-500"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return children
}

export default RoleProtectedRoute