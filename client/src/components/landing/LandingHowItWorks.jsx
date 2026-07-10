import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'
import { timelineSteps } from './landingData.js'

const LandingHowItWorks = () => {
  return (
    <section 
      id="how-it-works" 
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 py-24 text-white"
    >
      {/* Dynamic Background Blurs */}
      <div className="absolute top-1/3 left-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Step-by-step"
          title="How RoomSync Works"
          description="A direct, simple process designed to help you find roommate compatibility or list rooms with zero friction."
          center
          light
        />

        <div className="relative mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Connector lines between cards on desktop */}
          <div className="absolute top-1/2 left-4 right-4 hidden h-[2px] -translate-y-1/2 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-emerald-500/20 lg:block z-0" />

          {timelineSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative z-10 flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-xl hover:border-indigo-500/30 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    {/* Icon container */}
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    
                    {/* Big Step Number */}
                    <span 
                      className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400/20 to-violet-400/20"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 
                    className="mt-6 text-lg font-semibold text-white"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Continue</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default LandingHowItWorks