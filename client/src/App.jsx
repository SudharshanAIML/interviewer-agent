import { useState, useEffect } from 'react'
import UploadPage from './pages/UploadPage'
import InterviewPage from './pages/InterviewPage'
import ResultsPage from './pages/ResultsPage'
import './index.css'

function App() {
  const [page, setPage] = useState(() => localStorage.getItem('interviewer_page') || 'upload')
  const [sessionData, setSessionData] = useState(() => {
    const saved = localStorage.getItem('interviewer_session')
    return saved ? JSON.parse(saved) : {
      sessionId: null,
      question: null,
      questionNumber: 1,
      totalQuestions: 5,
      role: '',
    }
  })
  const [results, setResults] = useState(() => {
    const saved = localStorage.getItem('interviewer_results')
    return saved ? JSON.parse(saved) : null
  })

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('interviewer_page', page)
  }, [page])

  useEffect(() => {
    localStorage.setItem('interviewer_session', JSON.stringify(sessionData))
  }, [sessionData])

  useEffect(() => {
    localStorage.setItem('interviewer_results', JSON.stringify(results))
  }, [results])

  const handleUploadComplete = (data) => {
    setSessionData(data)
    setPage('interview')
  }

  const handleInterviewComplete = (sessionId) => {
    setSessionData((prev) => ({ ...prev, sessionId }))
    setPage('results')
  }

  const handleResultsLoaded = (data) => {
    setResults(data)
  }

  const handleRestart = () => {
    localStorage.removeItem('interviewer_page')
    localStorage.removeItem('interviewer_session')
    localStorage.removeItem('interviewer_results')
    setSessionData({
      sessionId: null,
      question: null,
      questionNumber: 1,
      totalQuestions: 5,
      role: '',
    })
    setResults(null)
    setPage('upload')
  }

  return (
    <div className="flex-1 flex flex-col items-center relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 glass-card border-x-0 border-t-0 flex items-center px-8 z-50">
        <div className="flex items-center gap-2.5 group cursor-pointer" onClick={handleRestart}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white/90">
            Interview<span className="text-indigo-400">AI</span>
          </h1>
        </div>
        
        <div className="ml-auto">
          {page !== 'upload' && (
            <button
              onClick={handleRestart}
              className="text-[10px] uppercase font-black tracking-widest text-text-muted hover:text-white transition-colors cursor-pointer"
            >
              New Session
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl flex items-center justify-center px-4 pt-20 pb-12">
        <div className="w-full h-full flex flex-col items-center justify-center">
          {page === 'upload' && <UploadPage onComplete={handleUploadComplete} />}
          {page === 'interview' && (
            <InterviewPage
              sessionData={sessionData}
              onComplete={handleInterviewComplete}
            />
          )}
          {page === 'results' && (
            <ResultsPage
              sessionId={sessionData.sessionId}
              role={sessionData.role}
              results={results}
              onResultsLoaded={handleResultsLoaded}
              onRestart={handleRestart}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
