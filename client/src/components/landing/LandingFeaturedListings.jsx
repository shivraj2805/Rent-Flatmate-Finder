import { motion } from 'framer-motion'
import { MapPin, ArrowRight, IndianRupee, BedDouble, Bath, SquareCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeading from './SectionHeading.jsx'
import { featuredListings } from './landingData.js'

const LandingFeaturedListings = () => {
  return (
    <section id="listings" className="relative bg-slate-50/50 py-24 border-y border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <SectionHeading
          eyebrow="Marketplace"
          title="Featured Rooms in Pune"
          description="Explore high-quality flats and shared rooms in prime Pune locations, scored for compatibility based on tenant reviews."
          center
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredListings.map((listing, index) => (
            <motion.article
              key={listing.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
            >
              {/* Image Section */}
              <div className="relative h-52 overflow-hidden shrink-0">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* AI Score Badge (floating left) */}
                <div className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-600 to-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                  <Sparkles className="h-3 w-3" />
                  <span>{listing.score} Match</span>
                </div>

                {/* Listing Tag (floating right) */}
                {listing.tag && (
                  <div className="absolute right-4 top-4 z-10 rounded-lg bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800 border border-slate-200/20">
                    {listing.tag}
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div className="p-6 flex flex-col justify-between flex-grow space-y-4">
                <div>
                  <h3 
                    className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-200"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {listing.title}
                  </h3>
                  
                  <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                    <span>{listing.location}</span>
                  </div>
                </div>

                {/* Specs row */}
                <div className="grid grid-cols-3 gap-2.5 py-2 border-y border-slate-100 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1.5 justify-center">
                    <BedDouble className="h-3.5 w-3.5 text-slate-400" />
                    <span>{listing.beds}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center">
                    <Bath className="h-3.5 w-3.5 text-slate-400" />
                    <span>{listing.baths}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center">
                    <SquareCheck className="h-3.5 w-3.5 text-slate-400" />
                    <span>{listing.area}</span>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Rent</div>
                    <div className="flex items-center text-xl font-extrabold text-slate-900">
                      <span className="text-slate-800 text-sm font-semibold mr-0.5">₹</span>
                      <span style={{ fontFamily: 'Outfit, sans-serif' }}>{listing.rent.replace('₹', '')}</span>
                      <span className="text-xs font-semibold text-slate-400 ml-1">/mo</span>
                    </div>
                  </div>

                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 text-xs font-semibold tracking-wide transition-all duration-200"
                  >
                    <span>View Room</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* View all button */}
        <div className="mt-16 text-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white hover:border-indigo-600 hover:text-indigo-600 px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200"
          >
            <span>Browse All Listings</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}

export default LandingFeaturedListings