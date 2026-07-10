import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'
import { faqs } from './landingData.js'

const LandingFaq = () => {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="relative py-24 bg-slate-50/50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        <SectionHeading
          eyebrow="Help Desk"
          title="Frequently Asked Questions"
          description="Have questions about matching, listing ownership, or chat permissions? We have answers."
          center
        />

        <div className="mt-16 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? 'border-indigo-100 bg-white shadow-md'
                    : 'border-slate-100 bg-white/70 hover:border-slate-200 hover:bg-white shadow-sm'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isOpen ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <HelpCircle className="h-4 w-4" />
                    </span>
                    <span 
                      className={`font-semibold text-slate-900 transition-colors ${isOpen ? 'text-indigo-600' : ''}`}
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {faq.question}
                    </span>
                  </div>
                  
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                    isOpen ? 'bg-indigo-50 text-indigo-600 rotate-180' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="border-t border-slate-50 px-6 pb-6 pt-4 text-sm leading-relaxed text-slate-500 pl-15">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default LandingFaq