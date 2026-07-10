import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading.jsx'
import { stats } from './landingData.js'

const LandingStats = () => {
  return (
    <section className="relative border-y border-slate-200/60 bg-white py-20" id="about">
      {/* Decorative details */}
      <div className="absolute top-0 right-1/4 h-32 w-32 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Proven Impact"
          title="Connecting Pune's Tenant Community"
          description="We take the stress out of room hunting by showing you the metrics that matter. Real users, verified owners, and intelligent compatibility."
          center
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 p-6 hover:bg-slate-50 hover:border-slate-200/80 transition-all duration-300 group"
              >
                {/* Subtle shine on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />

                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-indigo-50/80 border border-indigo-100/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                    Active
                  </span>
                </div>

                <div className="mt-6">
                  <div
                    className="text-4xl font-extrabold text-slate-900 tracking-tight"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {stat.value}
                  </div>
                  <div className="mt-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                    {stat.label}
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {stat.desc}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default LandingStats