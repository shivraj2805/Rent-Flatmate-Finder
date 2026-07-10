import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading.jsx'
import { featureItems } from './landingData.js'

const LandingFeatures = () => {
  return (
    <section id="features" className="relative bg-slate-50/30 py-24 border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Key Features"
          title="Designed for Stress-Free Living"
          description="Everything you need to discover apartments, connect with premium owners, and find flatmates that fit your lifestyle seamlessly."
          center
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featureItems.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_30px_rgba(79,70,229,0.06)] hover:border-slate-200/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  {/* Icon with gradient circle */}
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-md shadow-indigo-500/10`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  
                  <h3 
                    className="mt-5 text-lg font-semibold text-slate-900"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
                    {feature.description}
                  </p>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default LandingFeatures