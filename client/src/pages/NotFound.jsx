import { Link } from 'react-router-dom'
import { ArrowLeft, Home, Compass, ShieldAlert } from 'lucide-react'
import useAuth from '../hooks/useAuth.jsx'

const NotFound = () => {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-6 py-12 text-center text-white relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

      {/* Main Container */}
      <div className="relative z-10 max-w-md w-full">
        {/* Animated Glow Icon Container */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30 animate-pulse">
          <Compass className="h-12 w-12 stroke-[1.5]" />
        </div>

        {/* 404 Title */}
        <h1 
          className="text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-2"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          404
        </h1>
        
        <h2 
          className="text-2xl font-bold tracking-tight text-slate-100 mb-4"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Lost in Space?
        </h2>

        <p className="text-sm text-slate-400 leading-relaxed mb-8">
          The page you are looking for doesn't exist or has been relocated. Let's get you back on track to finding your perfect flatmate!
        </p>

        {/* Actions Button Stack */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          
          {isAuthenticated ? (
            <Link
              to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 shadow-md shadow-indigo-600/20"
            >
              Go to Dashboard
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 shadow-md shadow-indigo-600/20"
            >
              Sign In
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          )}
        </div>
      </div>

      {/* Footer copyright */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} RoomSync. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default NotFound
