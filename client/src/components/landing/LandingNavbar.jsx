import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { House, Menu, X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuth from '../../hooks/useAuth.jsx'
import { navLinks } from './landingData.js'

const LandingNavbar = () => {
  const { isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'py-3 bg-white/70 backdrop-blur-md border-b border-slate-200/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)]'
          : 'py-5 bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-slate-900 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <House className="h-5 w-5" />
          </span>
          <span
            className="text-xl font-bold tracking-tight text-slate-900"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            RoomSync
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative text-sm font-medium text-slate-600 transition hover:text-indigo-600 py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden items-center gap-4 lg:flex">
          {!isAuthenticated && (
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition duration-200"
            >
              Log In
            </Link>
          )}
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all duration-300"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-700 shadow-sm hover:bg-slate-50 lg:hidden focus:outline-none transition-colors duration-200"
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 right-0 top-full border-b border-slate-200 bg-white/95 backdrop-blur-lg px-4 pb-6 pt-2 shadow-lg lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2.5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 px-4 pt-4 border-t border-slate-100">
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 transition duration-200"
                  >
                    Log In
                  </Link>
                )}
                <Link
                  to={isAuthenticated ? '/dashboard' : '/register'}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/20"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default LandingNavbar