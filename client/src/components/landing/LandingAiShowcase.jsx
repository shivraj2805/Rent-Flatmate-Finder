import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useAnimation } from 'framer-motion'
import { Bot, Sparkles, CheckCircle2, User, Moon, Trash2, Heart, ArrowRight } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'

const LandingAiShowcase = () => {
  // Lifestyle sliders (0 to 100)
  const [sleep, setSleep] = useState(90)
  const [cleanliness, setCleanliness] = useState(85)
  const [social, setSocial] = useState(70)
  const [food, setFood] = useState(95)
  const [overallScore, setOverallScore] = useState(85)

  // Recalculate score based on input sliders
  useEffect(() => {
    const avg = Math.round((sleep + cleanliness + social + food) / 4)
    setOverallScore(avg)
  }, [sleep, cleanliness, social, food])

  // SVG Gauge calculations
  const radius = 60
  const stroke = 10
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (overallScore / 100) * circumference

  // Get dynamic evaluation message
  const getFeedbackMessage = (score) => {
    if (score >= 90) return { text: 'Excellent compatibility. Minimal friction points, ideal for sharing a space!', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' }
    if (score >= 75) return { text: 'Great fit! Highly compatible with manageable compromises.', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' }
    return { text: 'Moderate match. Potential lifestyle differences that require discussion.', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' }
  }

  const feedback = getFeedbackMessage(overallScore)

  return (
    <section id="ai-showcase" className="relative py-24 bg-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-0 h-96 w-96 rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Interactive Demo"
          title="See How AI Matches Flatmates"
          description="Adjust the lifestyle preferences below to simulate how our matching engine calculates compatibility percentages in real-time."
          center
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Interactive sliders column (Left) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Bot className="h-4.5 w-4.5" />
                </span>
                <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Lifestyle Preferences</span>
              </div>

              {/* Slider 1: Sleep */}
              <div className="space-y-2.5 mb-6">
                <div className="flex justify-between text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5"><Moon className="h-4 w-4 text-indigo-500" /> Sleep Schedule Alignment</span>
                  <span>{sleep}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={sleep}
                  onChange={(e) => setSleep(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-slate-200 appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Opposite Schedules</span>
                  <span>Perfect Sync</span>
                </div>
              </div>

              {/* Slider 2: Cleanliness */}
              <div className="space-y-2.5 mb-6">
                <div className="flex justify-between text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5"><Trash2 className="h-4 w-4 text-emerald-500" /> Cleanliness Standards</span>
                  <span>{cleanliness}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={cleanliness}
                  onChange={(e) => setCleanliness(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-slate-200 appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Relaxed Cleanliness</span>
                  <span>Extremely Neat</span>
                </div>
              </div>

              {/* Slider 3: Social Habits */}
              <div className="space-y-2.5 mb-6">
                <div className="flex justify-between text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-violet-500" /> Social Activity</span>
                  <span>{social}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={social}
                  onChange={(e) => setSocial(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-slate-200 appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Introvert Haven</span>
                  <span>Party Friendly</span>
                </div>
              </div>

              {/* Slider 4: Food Habits */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-amber-500" /> Diet Preferences</span>
                  <span>{food}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={food}
                  onChange={(e) => setFood(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-slate-200 appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Vastly Different</span>
                  <span>Highly Aligned</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Score result display column (Right) */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-center">
            
            {/* Live gauge Card */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col items-center sm:flex-row gap-6">
              
              {/* SVG Gauge */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg
                  width={radius * 2 + stroke * 2}
                  height={radius * 2 + stroke * 2}
                  className="-rotate-90"
                >
                  <circle
                    stroke="#F1F5F9"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={radius}
                    cx={radius + stroke}
                    cy={radius + stroke}
                  />
                  <motion.circle
                    stroke="url(#aiGaugeGrad)"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    r={radius}
                    cx={radius + stroke}
                    cy={radius + stroke}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="aiGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center score */}
                <div className="absolute text-center">
                  <span 
                    className="text-3xl font-extrabold text-slate-900 leading-none"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {overallScore}%
                  </span>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Match</div>
                </div>
              </div>

              {/* Dynamic message and explanation */}
              <div className="space-y-3 text-center sm:text-left">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" /> compatibility explanation
                </span>
                <h3 
                  className="text-xl font-bold text-slate-900"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  Calculated Fit Overview
                </h3>
                
                {/* Dynamic alert comment box */}
                <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${feedback.bg} ${feedback.color} transition-all duration-300`}>
                  {feedback.text}
                </div>
              </div>

            </div>

            {/* Platform bullet factors */}
            <div className="space-y-4 pt-2">
              <h4 
                className="text-lg font-bold text-slate-900"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Why compatibility scoring matters
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  'Reduces roommate friction by 90%',
                  'Secures tenant privacy first',
                  'Stores scores directly in profiles',
                  'Simplifies tenant interest flows',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-slate-600">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                      <Heart className="h-3 w-3 fill-current" />
                    </span>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 group"
                >
                  <span>Build your compatibility profile</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}

export default LandingAiShowcase