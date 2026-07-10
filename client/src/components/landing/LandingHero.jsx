import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Bot, Sparkles, Check, Heart, Shield, MessageCircle } from 'lucide-react'
import useAuth from '../../hooks/useAuth.jsx'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const floatingCardVariants = {
  float1: {
    y: [0, -12, 0],
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
  },
  float2: {
    y: [0, 10, 0],
    transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
  },
  float3: {
    y: [0, -8, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 },
  },
}

const LandingHero = () => {
  const { isAuthenticated } = useAuth()

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-slate-50 pt-28 pb-16 flex items-center"
    >
      {/* Background blobs / mesh gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute top-[40%] right-[15%] h-[30%] w-[30%] rounded-full bg-emerald-500/5 blur-[100px]" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Hero Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Pill Badge */}
            <motion.div variants={itemVariants} className="inline-flex">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/50 backdrop-blur-sm px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
                <Bot className="h-3.5 w-3.5" />
                <span>AI-Powered Room Discovery</span>
                <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Find Your Perfect <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500">
                Room & Flatmate
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl"
            >
              Stop scrolling endlessly. Our AI-driven compatibility engine connects you with flatmates and rooms that match your lifestyle, budget, and habits perfectly.
            </motion.p>

            {/* Action buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-2">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:scale-[1.02] transition-all duration-300"
              >
                Start Finding Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={isAuthenticated ? '/dashboard/owner/listings/new' : '/login'}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-300"
              >
                List Your Property
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-slate-200/60"
            >
              {[
                'Free to use, 0 brokerage',
                '100% Verified profiles',
                'AI scoring logic',
              ].map((badge) => (
                <div key={badge} className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{badge}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Right Visuals (Interactive Floorplan SVG & Floating Cards) */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0 flex justify-center">
            
            {/* SVG Floorplan container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative w-full max-w-[420px] aspect-[10/11] rounded-[2.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
            >
              {/* Grid Background in card */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-[linear-gradient(135deg,#fcfcfd_0%,#f8fafc_100%)] z-0" />

              {/* Styled Isometric SVG Floorplan */}
              <svg viewBox="0 0 400 440" className="relative z-10 w-full h-full">
                {/* Isometric Grid lines */}
                <path d="M 200 40 L 360 120 L 200 200 L 40 120 Z" fill="#EEF2FF" opacity="0.6" stroke="#E2E8F0" strokeWidth="1.5" />
                <path d="M 200 200 L 360 280 L 200 360 L 40 280 Z" fill="#EEF2FF" opacity="0.4" stroke="#E2E8F0" strokeWidth="1.5" />

                {/* Isometric Walls */}
                {/* Core apartment block */}
                <polygon points="200,80 340,150 200,220 60,150" fill="#FFFFFF" stroke="#C7D2FE" strokeWidth="2" />
                <polygon points="60,150 200,220 200,280 60,210" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
                <polygon points="340,150 200,220 200,280 340,210" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />

                {/* Living Area (Blue room highlighted) */}
                <polygon points="200,80 270,115 200,150 130,115" fill="#EEF2FF" stroke="#A5B4FC" strokeWidth="1.5" />
                {/* Bedroom Area (Emerald room highlighted) */}
                <polygon points="270,115 340,150 270,185 200,150" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="1.5" />

                {/* Isometric Furniture outlines (Stylized) */}
                {/* Sofa */}
                <path d="M 160 120 L 180 130 L 195 122 L 175 112 Z" fill="#C7D2FE" />
                <path d="M 160 120 L 175 112 L 175 117 L 160 125 Z" fill="#818CF8" />
                {/* Bed */}
                <path d="M 280,140 L 320,160 L 305,168 L 265,148 Z" fill="#A7F3D0" />
                <path d="M 280,135 L 295,142 L 290,145 L 275,138 Z" fill="#34D399" /> {/* Pillow */}

                {/* AI Score Node overlay */}
                <g transform="translate(200, 160)">
                  <circle cx="0" cy="0" r="28" fill="#4F46E5" className="animate-pulse" opacity="0.15" />
                  <circle cx="0" cy="0" r="18" fill="url(#heroCircleGrad)" shadow="0 10px 20px rgba(79,70,229,0.3)" />
                  <text x="0" y="4" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">AI</text>
                </g>

                {/* Connection rays */}
                <line x1="200" y1="160" x2="270" y2="110" stroke="#818CF8" strokeWidth="2" strokeDasharray="4 3" />
                <line x1="200" y1="160" x2="130" y2="200" stroke="#34D399" strokeWidth="2" strokeDasharray="4 3" />

                {/* Dynamic elements in visual */}
                <defs>
                  <linearGradient id="heroCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>

              {/* FLOATING CARD 1: AI Match Score */}
              <motion.div
                variants={floatingCardVariants}
                animate="float1"
                className="absolute top-8 -left-12 z-20 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 shadow-xl shadow-slate-200/50 backdrop-blur-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm">
                  96%
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match Accuracy</div>
                  <div className="text-xs font-semibold text-slate-800">Perfect flatmate found</div>
                </div>
              </motion.div>

              {/* FLOATING CARD 2: Chat Status */}
              <motion.div
                variants={floatingCardVariants}
                animate="float2"
                className="absolute bottom-16 -right-12 z-20 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 shadow-xl shadow-slate-200/50 backdrop-blur-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Owner Status</div>
                  <div className="text-xs font-semibold text-slate-800">Interest Approved!</div>
                </div>
              </motion.div>

              {/* FLOATING CARD 3: Location preference check */}
              <motion.div
                variants={floatingCardVariants}
                animate="float3"
                className="absolute top-2/3 -left-8 z-20 flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-2.5 shadow-lg shadow-slate-200/40 backdrop-blur-md"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-white">
                  <Check className="h-2.5 w-2.5" />
                </span>
                <span className="text-xs font-semibold text-slate-700">Kothrud, Pune</span>
              </motion.div>

            </motion.div>
          </div>

        </div>
      </div>
      
      {/* Bottom subtle divider gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  )
}

export default LandingHero