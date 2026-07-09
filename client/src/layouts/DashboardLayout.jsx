import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl lg:grid-cols-[280px_1fr]">
        <Sidebar />

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout