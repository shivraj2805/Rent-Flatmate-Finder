import { Mail, House } from 'lucide-react'
import { Link } from 'react-router-dom'

const LandingFooter = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Footer Top Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Column 1: Brand details */}
          <div className="lg:col-span-2 space-y-5 text-left">
            <Link to="/" className="flex items-center gap-2.5 text-white group">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white">
                <House className="h-5 w-5" />
              </span>
              <span 
                className="text-xl font-bold tracking-tight text-white"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                RoomSync
              </span>
            </Link>
            
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              Connecting Pune's owners and tenants directly through smart profiles, AI-powered compatibility matching, and secure real-time messaging.
            </p>
            
            <div className="flex items-center gap-3">
              {[
                {
                  label: 'Twitter',
                  svg: (
                    <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )
                },
                {
                  label: 'GitHub',
                  svg: (
                    <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  )
                },
                {
                  label: 'Instagram',
                  svg: (
                    <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  )
                }
              ].map((social, index) => {
                return (
                  <a
                    key={index}
                    href="#"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-slate-400 transition-all hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-white"
                  >
                    {social.svg}
                  </a>
                )
              })}
            </div>
          </div>

          {/* Column 2: Product links */}
          <div className="text-left">
            <h3 
              className="text-xs font-bold uppercase tracking-widest text-white"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Product
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#features" className="hover:text-indigo-400 transition-colors duration-200">Features</a></li>
              <li><a href="#ai-showcase" className="hover:text-indigo-400 transition-colors duration-200">AI Compatibility</a></li>
              <li><a href="#listings" className="hover:text-indigo-400 transition-colors duration-200">Room Listings</a></li>
              <li><a href="#how-it-works" className="hover:text-indigo-400 transition-colors duration-200">How It Works</a></li>
            </ul>
          </div>

          {/* Column 3: Company / Safety */}
          <div className="text-left">
            <h3 
              className="text-xs font-bold uppercase tracking-widest text-white"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Company
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#about" className="hover:text-indigo-400 transition-colors duration-200">About Us</a></li>
              <li><a href="#testimonials" className="hover:text-indigo-400 transition-colors duration-200">Testimonials</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors duration-200">Safety Policy</a></li>
              <li><a href="#faq" className="hover:text-indigo-400 transition-colors duration-200">FAQ Help</a></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="text-left">
            <h3 
              className="text-xs font-bold uppercase tracking-widest text-white"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Contact Support
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-400" />
                <span>support@roomsync.in</span>
              </li>
              <li>
                <span className="block text-slate-300 font-semibold">Pune Office</span>
                <span className="text-xs text-slate-500">Koregaon Park, Pune, MH, India</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Divider */}
        <div className="mt-12 border-t border-slate-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p className="text-slate-600">
            © {new Date().getFullYear()} RoomSync (Rent & Flatmate Finder). All rights reserved.
          </p>
          <div className="flex gap-4 text-slate-600">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <span>·</span>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default LandingFooter