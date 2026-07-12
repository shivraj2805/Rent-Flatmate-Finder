import { Sparkles, Check, AlertCircle, IndianRupee, MapPin, Calendar, Building2 } from 'lucide-react'

const CompatibilityDetailCard = ({ compatibility, loading, error }) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-200 rounded w-1/4" />
          </div>
        </div>
        <div className="h-12 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 bg-slate-200 rounded-xl" />
          <div className="h-10 bg-slate-200 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 flex items-start gap-2.5 shadow-sm">
        <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Scoring Evaluation Error</span>
          <p className="mt-0.5">{error}</p>
        </div>
      </div>
    )
  }

  if (!compatibility) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-400">
        No compatibility details available for this room match.
      </div>
    )
  }

  const {
    score = 0,
    explanation = 'No evaluation text available.',
    strengths = [],
    weaknesses = [],
    scoringBreakdown = { budgetScore: 0, locationScore: 0, dateScore: 0, roomTypeScore: 0 },
    scoringMethod = 'Rule-Based',
    llmProvider = null,
  } = compatibility

  // Determine theme colors based on score
  const isHighMatch = score >= 80
  const isMediumMatch = score >= 50
  const scoreColor = isHighMatch ? 'text-emerald-600' : isMediumMatch ? 'text-amber-500' : 'text-rose-500'
  const scoreBg = isHighMatch ? 'bg-emerald-50 border-emerald-100' : isMediumMatch ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100'
  const ringColor = isHighMatch ? '#059669' : isMediumMatch ? '#d97706' : '#dc2626'

  // Circular Progress Ring Calculations
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className={`rounded-2xl border ${scoreBg} p-5 space-y-4 shadow-sm transition-all duration-300`}>
      {/* Header Match Ring & Info */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Circular SVG Ring */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r={radius}
                className="stroke-slate-200/50"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r={radius}
                stroke={ringColor}
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className={`absolute text-xs font-black ${scoreColor}`}>
              {score}%
            </span>
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
              Room Compatibility
            </h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Evaluated via {scoringMethod === 'LLM' ? `${llmProvider || 'AI'} Engine` : 'Deterministic Rules'}
            </p>
          </div>
        </div>
      </div>

      {/* Explanation Text */}
      <p className="text-xs text-slate-700 leading-relaxed bg-white/70 border border-slate-100 rounded-xl p-3.5 shadow-sm font-medium">
        {explanation}
      </p>

      {/* Category Breakdown (Step 10 requirement) */}
      <div className="space-y-2.5 pt-1">
        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scoring Category Breakdown</h5>
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Budget Progress (Max 40) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <IndianRupee className="h-3 w-3 text-slate-400" />
                Budget Fit
              </span>
              <span>{scoringBreakdown.budgetScore} / 40</span>
            </div>
            <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(scoringBreakdown.budgetScore / 40) * 100}%` }}
              />
            </div>
          </div>

          {/* Location Progress (Max 30) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-400" />
                Location Match
              </span>
              <span>{scoringBreakdown.locationScore} / 30</span>
            </div>
            <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(scoringBreakdown.locationScore / 30) * 100}%` }}
              />
            </div>
          </div>

          {/* Move-In Date Progress (Max 20) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                Timeline Match
              </span>
              <span>{scoringBreakdown.dateScore} / 20</span>
            </div>
            <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(scoringBreakdown.dateScore / 20) * 100}%` }}
              />
            </div>
          </div>

          {/* Room Type Progress (Max 10) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3 text-slate-400" />
                Preferences Match
              </span>
              <span>{scoringBreakdown.roomTypeScore} / 10</span>
            </div>
            <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(scoringBreakdown.roomTypeScore / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses (LLM specific additions) */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-200/55">
          {/* Strengths */}
          {strengths.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Key Match Strengths</span>
              <ul className="space-y-1">
                {strengths.map((str, idx) => (
                  <li key={idx} className="text-[10px] font-semibold text-emerald-800 flex items-start gap-1">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {weaknesses.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Areas of Friction</span>
              <ul className="space-y-1">
                {weaknesses.map((weak, idx) => (
                  <li key={idx} className="text-[10px] font-semibold text-rose-800 flex items-start gap-1">
                    <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CompatibilityDetailCard
