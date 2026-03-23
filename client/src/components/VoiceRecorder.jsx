import { useState, useRef, useEffect } from 'react'

export default function VoiceRecorder({ onResult, isActive, onSilence }) {
  const [recording, setRecording] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef(null)
  const silenceTimerRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      // Reset silence timer on any speech
      if (onSilence) {
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = setTimeout(() => {
          onSilence()
        }, 3000) // 3 seconds of silence to trigger submission
      }

      const last = event.results[event.results.length - 1]
      if (last.isFinal) {
        onResult(last[0].transcript)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      if (event.error !== 'no-speech') {
        setRecording(false)
      }
    }

    recognition.onend = () => {
      // If isActive is true (Voice Mode), restart automatically if stopped
      if (isActive && recording) {
        try { recognition.start() } catch {}
      } else {
        setRecording(false)
      }
    }

    recognitionRef.current = recognition

    return () => {
      clearTimeout(silenceTimerRef.current)
      try { recognition.abort() } catch {}
    }
  }, [isActive, recording, onResult, onSilence])

  // External control for Voice Mode
  useEffect(() => {
    if (isActive && !recording) {
      startRecording()
    } else if (!isActive && recording) {
      stopRecording()
    }
  }, [isActive])

  const startRecording = () => {
    if (!recognitionRef.current) return
    try {
      recognitionRef.current.start()
      setRecording(true)
    } catch (err) {
      console.warn('Recognition already started or error:', err.message)
    }
  }

  const stopRecording = () => {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
    setRecording(false)
    clearTimeout(silenceTimerRef.current)
  }

  if (!supported) return null

  return (
    <button
      onClick={recording ? stopRecording : startRecording}
      type="button"
      className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
        recording
          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40'
          : 'bg-white/[0.04] text-white/30 hover:text-white/50 hover:bg-white/[0.08] border border-white/[0.06]'
      }`}
      title={recording ? 'Pause listening' : 'Start voice input'}
    >
      {recording && (
        <>
          <span className="absolute inset-0 rounded-2xl bg-indigo-500/40 animate-ping opacity-20" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-400 rounded-full border-2 border-[#0a0a0f] animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
        </>
      )}
      <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
    </button>
  )
}
