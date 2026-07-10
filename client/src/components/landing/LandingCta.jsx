import { motion } from 'framer-motion'
import { ArrowRight, Bot, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const LandingCta = () => {
  return (
    <section className="relative bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500 px-6 py-16 text-white shadow-[0_20px_50px_rgba(79,70,229,0.2)] sm:px-12 md:py-20"
        >
          {/* Glowing background highlights */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_35%)]" />
          
          <div className="relative z-10 grid gap-10 lg:grid-cols-12 lg:items-center">
            
            {/* CTA Copy */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-100 bg-white/10 border border-white/10 px-3 py-1 rounded-full">
                Get Started
              </span>
              <h2 
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Find Your Perfect Roommate Harmony
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-indigo-50/90 max-w-xl">
                Ready to skip the brokers and connect directly? Sign up now to post your property as an owner or create your tenant compatibility profile.
              </p>
            </div>

            {/* CTA Actions */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 justify-end">
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-indigo-700 shadow-md hover:bg-slate-50 hover:scale-[1.02] transition-all duration-200"
              >
                <Bot className="h-4 w-4" />
                <span>Join as Tenant</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/15 hover:scale-[1.02] transition-all duration-200"
              >
                <Building2 className="h-4 w-4" />
                <span>List Property</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>

        </motion.div>
      </div>
    </section>
  )
}

export default LandingCta