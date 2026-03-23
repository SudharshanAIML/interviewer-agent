import { useState, useEffect } from 'react'
import VoiceRecorder from '../components/VoiceRecorder'

export default function InterviewPage({ sessionData, onComplete }) {
  const [question, setQuestion] = useState(sessionData.question)
  const [questionNumber, setQuestionNumber] = useState(sessionData.questionNumber)
  const [totalQuestions] = useState(sessionData.totalQuestions)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const progress = (questionNumber / totalQuestions) * 100

  const handleVoiceResult = (transcript) => {
    setAnswer((prev) => (prev ? prev + ' ' + transcript : transcript))
  }

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setError('Please provide an answer to continue')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          answer: answer.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit answer')
      }

      if (data.completed) {
        onComplete(sessionData.sessionId)
      } else {
        setQuestion(data.question)
        setQuestionNumber(data.questionNumber)
        setAnswer('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit()
    }
  }

  return (
    <div className="w-full max-w-2xl animate-fadeInUp">
      {/* Progress */}
      <div className="mb-10 stagger-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Interview Progress</span>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              {questionNumber} / {totalQuestions}
            </span>
          </div>
          <span className="text-xs font-bold text-white/50">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/[0.03]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(99,102,241,0.3)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* Question Card */}
        <div className="glass-card rounded-3xl p-8 stagger-2 border-indigo-500/10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 shadow-inner">
               <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
               </svg>
            </div>
            <div className="flex-1 space-y-2">
              <span className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest">Question {questionNumber}</span>
              <p className="text-white text-base leading-relaxed font-medium">{question}</p>
            </div>
          </div>
        </div>

        {/* Answer Section */}
        <div className="glass-card rounded-3xl p-8 stagger-3">
          <div className="flex items-center justify-between mb-4">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.1em] ml-1">Your Professional Response</label>
            <div className="text-[10px] text-text-muted flex items-center gap-1.5">
               <span className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"></span>
               AI evaluating live
            </div>
          </div>
          
          <div className="relative group">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Structure your answer clearly. Focus on results and specific examples..."
              rows={6}
              className="glass-input w-full px-5 py-4 pr-14 rounded-2xl text-white placeholder-white/10 text-sm focus:outline-none resize-none leading-relaxed"
            />
            <div className="absolute right-3 top-3">
              <VoiceRecorder onResult={handleVoiceResult} />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <p className="text-[10px] text-text-muted flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">Enter</kbd> to submit
            </p>
            
            <button
              onClick={handleSubmit}
              disabled={loading || !answer.trim()}
              className="btn-premium px-8 py-3 rounded-2xl text-white text-xs font-bold shadow-lg shadow-indigo-600/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : questionNumber >= totalQuestions ? (
                'Finalize Interview'
              ) : (
                <>
                  Analyze & Next
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 text-red-400 text-xs bg-red-500/5 border border-red-500/10 rounded-2xl px-4 py-3.5 animate-fadeInUp">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}
