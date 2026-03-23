import { useState, useRef, useEffect } from 'react'

export default function VoiceRecorder({ onResult }) {
  const [recording, setRecording] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1]
      if (last.isFinal) {
        onResult(last[0].transcript)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setRecording(false)
    }

    recognition.onend = () => {
      setRecording(false)
    }

    recognitionRef.current = recognition

    return () => {
      try { recognition.abort() } catch {}
    }
  }, [])

  const toggleRecording = () => {
    if (!recognitionRef.current) return

    if (recording) {
      recognitionRef.current.stop()
      setRecording(false)
    } else {
      try {
        recognitionRef.current.start()
        setRecording(true)
      } catch (err) {
        console.error('Failed to start recognition:', err)
      }
    }
  }

  if (!supported) return null

  return (
    <button
      onClick={toggleRecording}
      type="button"
      className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
        recording
          ? 'bg-red-500/20 text-red-400'
          : 'bg-white/[0.06] text-white/30 hover:text-white/50 hover:bg-white/[0.1]'
      }`}
      title={recording ? 'Stop recording' : 'Start voice input'}
    >
      {recording && (
        <span className="absolute inset-0 rounded-lg bg-red-500/20 pulse-ring" />
      )}
      <svg className="w-4 h-4 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
    </button>
  )
}
