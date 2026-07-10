import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'
import { testimonials } from './landingData.js'

const LandingTestimonials = () => {
  return (
    <section id="testimonials" className="relative py-24 bg-white">
      {/* Background decoration */}
      <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Reviews"
          title="Loved by Pune's Tenants & Owners"
          description="Read experiences from people who skipped the brokers and found flatmates or rooms that fit them perfectly."
          center
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial, index) => (
            <motion.article
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/40 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:bg-white hover:border-slate-200/60 hover:shadow-xl hover:shadow-slate-200/30 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Decorative Quote Icon */}
              <div className="absolute right-6 top-6 text-slate-100 group-hover:text-indigo-50 transition-colors duration-300 pointer-events-none">
                <Quote className="h-10 w-10 fill-current" />
              </div>

              <div className="relative z-10 space-y-4">
                {/* Stars */}
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                    <Star key={`${testimonial.name}-star-${starIndex}`} className="h-4 w-4 fill-current" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-sm leading-relaxed text-slate-600 italic">
                  "{testimonial.quote}"
                </p>
              </div>

              {/* Author footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                {/* Profile Circle fallbacks (in case unsplash images block/rate limit) */}
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/10">
                  {testimonial.image ? (
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="h-full w-full object-cover" 
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : null}
                  <span className="absolute">{testimonial.name.split(' ').map(n => n[0]).join('')}</span>
                </div>

                <div>
                  <h4 
                    className="text-sm font-bold text-slate-900"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {testimonial.name}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LandingTestimonials