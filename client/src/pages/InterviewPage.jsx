import { useState, useEffect, useCallback } from 'react'
import VoiceRecorder from '../components/VoiceRecorder'
import { speak, stopSpeaking } from '../utils/speech'

export default function InterviewPage({ sessionData, onComplete }) {
  const [question, setQuestion] = useState(sessionData.question)
  const [questionNumber, setQuestionNumber] = useState(sessionData.questionNumber)
  const [totalQuestions] = useState(sessionData.totalQuestions)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isVoiceMode, setIsVoiceMode] = useState(() => localStorage.getItem('interviewer_voice_mode') === 'true')
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)

  // Persist Voice Mode
  useEffect(() => {
    localStorage.setItem('interviewer_voice_mode', isVoiceMode)
  }, [isVoiceMode])

  const progress = (questionNumber / totalQuestions) * 100

  // Handle auto-reading of questions
  useEffect(() => {
    if (isVoiceMode && question) {
      setIsAiSpeaking(true)
      speak(question, () => {
        setIsAiSpeaking(false)
      })
    }
    return () => stopSpeaking()
  }, [question, isVoiceMode])

  const handleVoiceResult = (transcript) => {
    setAnswer((prev) => (prev ? prev + ' ' + transcript : transcript))
  }

  const handleSubmit = useCallback(async (currentAnswer = answer) => {
    const finalAnswer = currentAnswer || answer
    if (!finalAnswer.trim()) {
      if (!isVoiceMode) setError('Please provide an answer to continue')
      return
    }

    setLoading(true)
    setError('')
    stopSpeaking()

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          answer: finalAnswer.trim(),
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
  }, [answer, isVoiceMode, onComplete, sessionData.sessionId])

  const handleSilence = () => {
    if (isVoiceMode && answer.trim().length > 10 && !loading && !isAiSpeaking) {
      handleSubmit()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit()
    }
  }

  return (
    <div className="w-full max-w-2xl animate-fadeInUp">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-10 stagger-1">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Interview Progress</span>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              {questionNumber} / {totalQuestions}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/[0.03]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(99,102,241,0.3)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Voice Mode Toggle */}
        <div className="ml-8 flex flex-col items-end gap-2">
          <span className="text-[9px] uppercase font-black tracking-widest text-text-muted">AI Voice Mode</span>
          <button
            onClick={() => {
              setIsVoiceMode(!isVoiceMode)
              if (isVoiceMode) stopSpeaking()
            }}
            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
              isVoiceMode ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/10'
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${
              isVoiceMode ? 'left-6' : 'left-1'
            }`} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Question Card */}
        <div className={`glass-card rounded-3xl p-8 stagger-2 border-indigo-500/10 transition-all duration-500 ${
          isAiSpeaking ? 'ring-2 ring-indigo-500/30' : ''
        }`}>
          <div className="flex items-start gap-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-colors duration-500 ${
              isAiSpeaking ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10 text-indigo-400'
            }`}>
               {isAiSpeaking ? (
                 <div className="flex gap-1 items-end h-4">
                   <div className="w-1 bg-white animate-[pulse_1s_infinite_0s] h-2"></div>
                   <div className="w-1 bg-white animate-[pulse_1s_infinite_0.2s] h-4"></div>
                   <div className="w-1 bg-white animate-[pulse_1s_infinite_0.4s] h-3"></div>
                 </div>
               ) : (
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                 </svg>
               )}
            </div>
            <div className="flex-1 space-y-2">
              <span className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest">Question {questionNumber}</span>
              <p className="text-white text-lg leading-relaxed font-semibold">{question}</p>
            </div>
          </div>
        </div>

        {/* Answer Section */}
        <div className="glass-card rounded-3xl p-8 stagger-3">
          <div className="flex items-center justify-between mb-5">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Your Professional Response</label>
            <div className="flex items-center gap-3">
              {isVoiceMode && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Listening</span>
                </div>
              )}
              <div className="text-[10px] text-text-muted flex items-center gap-1.5 font-medium">
                <span className="w-1 h-1 rounded-full bg-indigo-500/40"></span>
                AI Evaluating Live
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isVoiceMode ? "Listening for your response..." : "Structure your answer clearly. Focus on results and specific examples..."}
              rows={7}
              className={`glass-input w-full px-6 py-5 pr-16 rounded-2xl text-white placeholder-white/10 text-sm focus:outline-none resize-none leading-relaxed transition-all duration-300 ${
                isVoiceMode && !isAiSpeaking ? 'ring-1 ring-indigo-500/20' : ''
              }`}
            />
            <div className="absolute right-4 top-4">
              <VoiceRecorder 
                onResult={handleVoiceResult} 
                isActive={isVoiceMode && !isAiSpeaking}
                onSilence={handleSilence}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-5">
            <p className="text-[10px] text-text-muted flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px]">Ctrl</kbd> + <kbd className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px]">Enter</kbd> to submit manually
            </p>
            
            <button
              onClick={() => handleSubmit()}
              disabled={loading || !answer.trim()}
              className="btn-premium px-10 py-3.5 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2.5"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing
                </>
              ) : questionNumber >= totalQuestions ? (
                'Finalize Interview'
              ) : (
                <>
                  Analyze & Next
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 text-red-400 text-xs bg-red-500/5 border border-red-500/10 rounded-2xl px-5 py-4 animate-fadeInUp">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}
