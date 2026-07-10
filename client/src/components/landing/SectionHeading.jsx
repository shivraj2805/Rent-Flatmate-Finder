import { motion } from 'framer-motion'

const SectionHeading = ({ eyebrow, title, description, center = false, light = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`max-w-3xl ${center ? 'mx-auto text-center' : ''}`}
    >
      {eyebrow && (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${
            light
              ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
              : 'bg-indigo-50 text-indigo-600 border border-indigo-100/80'
          }`}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={`mt-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl ${
          light ? 'text-white' : 'text-slate-950'
        }`}
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-base leading-relaxed sm:text-lg ${
            light ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {description}
        </p>
      )}
    </motion.div>
  )
}

export default SectionHeading