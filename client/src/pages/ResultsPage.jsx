import { useState, useEffect } from 'react'
import { buildApiUrl } from '../utils/api'

export default function ResultsPage({ sessionId, role, results, onResultsLoaded, onRestart }) {
  const [loading, setLoading] = useState(!results)
  const [error, setError] = useState('')
  const [data, setData] = useState(results)

  useEffect(() => {
    if (results) return

    const fetchResults = async () => {
      try {
        const res = await fetch(buildApiUrl('/api/results'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        const json = await res.json()

        if (!res.ok) {
          throw new Error(json.error || 'Failed to load results')
        }

        setData(json.results)
        onResultsLoaded(json.results)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [sessionId, results])

  if (loading) {
    return (
      <div className="w-full max-w-lg animate-fadeInUp flex flex-col items-center py-20">
        <div className="relative w-16 h-16 mb-6">
           <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10"></div>
           <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        </div>
        <h3 className="text-white font-bold mb-1">Expert Analysis in Progress</h3>
        <p className="text-text-muted text-xs">Evaluating your responses for the {role} role...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-lg animate-fadeInUp text-center py-16">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-red-400 text-sm mb-6 font-medium">{error}</p>
        <button onClick={onRestart} className="btn-premium px-8 py-3 rounded-2xl text-xs font-bold cursor-pointer">
          Return to Setup
        </button>
      </div>
    )
  }

  if (!data) return null

  const getScoreInfo = (score) => {
    if (score >= 8) return { color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', stroke: '#10b981' }
    if (score >= 6) return { color: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'bg-indigo-500/5', stroke: '#6b66ff' }
    if (score >= 4) return { color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5', stroke: '#f59e0b' }
    return { color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5', stroke: '#ef4444' }
  }

  const scoreInfo = getScoreInfo(data.overallScore)
  const circumference = 2 * Math.PI * 45
  const dashOffset = circumference - (data.overallScore / 10) * circumference

  return (
    <div className="w-full max-w-3xl animate-fadeInUp pb-24">
      {/* Header */}
      <div className="text-center mb-10 stagger-1">
        <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Interview Performance</h2>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
           <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Candidate Profile</span>
           <span className="w-1 h-1 rounded-full bg-white/20"></span>
           <span className="text-[11px] font-bold text-indigo-300">{role}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Score Card */}
        <div className="md:col-span-1 glass-card rounded-3xl p-8 flex flex-col items-center justify-center stagger-2">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke={scoreInfo.stroke}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="score-circle"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-black ${scoreInfo.color}`}>{data.overallScore}</span>
                <span className="text-[10px] font-bold text-text-muted">SCORE</span>
              </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full ${scoreInfo.bg} ${scoreInfo.border} border`}>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${scoreInfo.color}`}>
                   {data.overallScore >= 8 ? 'Exceptional' : data.overallScore >= 6 ? 'Strong' : data.overallScore >= 4 ? 'Needs Review' : 'Critical'}
                </span>
            </div>
        </div>

        {/* Assessment Card */}
        <div className="md:col-span-2 glass-card rounded-3xl p-8 stagger-3">
          <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Executive Summary</h3>
          <p className="text-sm text-white/90 leading-relaxed font-medium">
            {data.overallFeedback}
          </p>
          {data.roleInsights && (
             <div className="mt-6 pt-6 border-t border-white/5">
                <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">Role Insights</h4>
                <p className="text-xs text-text-secondary leading-relaxed italic">
                  "{data.roleInsights}"
                </p>
             </div>
          )}
        </div>
      </div>

      {/* S & W Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="glass-card rounded-3xl p-6 stagger-4 border-emerald-500/10">
          <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Key Strengths
          </h3>
          <ul className="space-y-3">
            {data.strengths?.map((s, i) => (
              <li key={i} className="text-xs text-white/70 flex items-start gap-3 leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 mt-1.5 shrink-0"></div>
                {s}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="glass-card rounded-3xl p-6 stagger-4 border-amber-500/10">
          <h3 className="text-[11px] font-black text-amber-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Growth Areas
          </h3>
          <ul className="space-y-3">
            {data.weaknesses?.map((w, i) => (
              <li key={i} className="text-xs text-white/70 flex items-start gap-3 leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40 mt-1.5 shrink-0"></div>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question Breakdown */}
      <div className="space-y-4 mb-12">
        <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Question Breakdown</h3>
        <div className="space-y-4">
          {data.perQuestion?.map((pq, i) => {
            const qInfo = getScoreInfo(pq.score)
            return (
              <div key={i} className="glass-card rounded-3xl p-6 hover:border-white/10 transition-colors group">
                <div className="flex items-start justify-between gap-6 mb-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-[10px] font-bold text-text-muted group-hover:text-indigo-400 transition-colors">
                      {i + 1}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white/90 leading-snug">{pq.question}</p>
                      <p className="text-xs text-text-muted italic leading-relaxed">"{pq.answer}"</p>
                    </div>
                  </div>
                  <div className={`shrink-0 flex flex-col items-end`}>
                     <span className={`text-lg font-black ${qInfo.color}`}>{pq.score}<span className="text-[10px] text-text-muted">/10</span></span>
                  </div>
                </div>
                
                <div className={`p-4 rounded-2xl ${qInfo.bg} ${qInfo.border} border`}>
                   <div className="flex items-start gap-3">
                      <svg className={`w-4 h-4 mt-0.5 ${qInfo.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="space-y-1.5">
                         <p className="text-xs font-bold text-white/80">Feedback</p>
                         <p className="text-xs text-white/60 leading-relaxed font-medium">{pq.feedback}</p>
                         {pq.marksLostReason && (
                           <p className="text-[10px] text-red-400/80 mt-2 font-medium bg-red-500/5 inline-block px-2 py-0.5 rounded border border-red-500/10">
                             <span className="font-bold">Deduction:</span> {pq.marksLostReason}
                           </p>
                         )}
                      </div>
                   </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recommendations */}
      {data.suggestions?.length > 0 && (
        <div className="glass-card rounded-3xl p-8 mb-12 border-indigo-500/20 bg-indigo-500/[0.02]">
          <h3 className="text-[11px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Expert Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white/3 border border-white/5">
                <span className="text-xs font-black text-indigo-400/40 mt-0.5">{i + 1}</span>
                <p className="text-xs text-white/70 leading-relaxed font-medium">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onRestart}
          className="btn-premium px-12 py-4 rounded-2xl text-white text-sm font-bold shadow-2xl shadow-indigo-600/20"
        >
          Begin New Interview Session
        </button>
        <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase">
          Continuous Improvement is Key to Success
        </p>
      </div>
    </div>
  )
}
