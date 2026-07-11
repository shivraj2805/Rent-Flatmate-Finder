import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import AdminSidebar from '../components/admin/AdminSidebar.jsx'

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="mx-auto flex w-full max-w-[1600px]">
        <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="min-w-0 flex-1 p-4 lg:p-8">
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Admin Panel</p>
              <p className="text-sm font-semibold text-slate-900">RoomSync control center</p>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout