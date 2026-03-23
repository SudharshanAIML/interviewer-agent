import { useState, useRef } from 'react'

export default function UploadPage({ onComplete }) {
  const [role, setRole] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [file, setFile] = useState(null)
  const [inputMode, setInputMode] = useState('pdf') // 'pdf' or 'text'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile)
      setError('')
    } else {
      setError('Please upload a PDF file')
    }
  }

  const handleFileSelect = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      setError('')
    }
  }

  const handleSubmit = async () => {
    if (!role.trim()) {
      setError('Please enter the target job role')
      return
    }
    if (inputMode === 'pdf' && !file) {
      setError('Please upload your resume PDF')
      return
    }
    if (inputMode === 'text' && !resumeText.trim()) {
      setError('Please paste your resume content')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('role', role.trim())

      if (inputMode === 'pdf') {
        formData.append('resume', file)
      } else {
        formData.append('resumeText', resumeText.trim())
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      onComplete({
        sessionId: data.sessionId,
        question: data.question,
        questionNumber: data.questionNumber,
        totalQuestions: data.totalQuestions,
        role: role.trim(),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto animate-fadeInUp">
      
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold tracking-tight text-white mb-3 stagger-1">
          Prepare for Success
        </h2>
        <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed stagger-2">
          Upload your resume and specify your target role. Our AI will tailor the interview to your experience.
        </p>
      </div>

      {/* Card */}
      <div className="glass-card rounded-3xl px-8 py-9 space-y-8 stagger-3">

        {/* Role */}
        <div className="space-y-3">
          <label className="text-[11px] font-semibold text-text-muted uppercase tracking-widest ml-1">
            Target Job Role
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            className="glass-input w-full px-5 py-4 rounded-2xl text-white placeholder-white/30 text-sm focus:outline-none"
          />
        </div>

        {/* Toggle */}
        <div className="space-y-4">
          <label className="text-[11px] font-semibold text-text-muted uppercase tracking-widest ml-1">
            Resume Source
          </label>

          <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-2xl p-1">
            <button
              onClick={() => setInputMode('pdf')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                inputMode === 'pdf'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              PDF Document
            </button>

            <button
              onClick={() => setInputMode('text')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                inputMode === 'text'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              Plain Text
            </button>
          </div>

          {/* Upload Area */}
          {inputMode === 'pdf' ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`group border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : file
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {file ? (
                <div className="flex flex-col items-center gap-2 animate-fadeInUp">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-1">
                    <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-emerald-300">{file.name}</p>
                  <p className="text-xs text-emerald-400/60">Click to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white/70 transition">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white/70">Upload Resume</p>
                  <p className="text-xs text-text-muted">Drag & drop or click to browse</p>
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your experience, skills, and projects..."
              rows={7}
              className="glass-input w-full px-5 py-4 rounded-2xl text-white placeholder-white/30 text-sm resize-none focus:outline-none"
            />
          )}
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

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-premium w-full py-4 rounded-2xl text-white text-sm font-bold tracking-wide shadow-xl shadow-indigo-600/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2.5">
              <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating Session...
            </span>
          ) : "Get Started"}
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-text-muted mt-8 italic stagger-4">
        Your data is processed securely and used only for the mock interview experience.
      </p>
    </div>
  )
}