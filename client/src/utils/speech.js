/**
 * Simple Speech Utility using Web Speech API
 */

export const speak = (text, onEnd) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported')
    return
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  
  // Try to find a high-quality female or professional voice
  const voices = window.speechSynthesis.getVoices()
  const preferredVoice = voices.find(v => 
    v.name.includes('Google') || v.name.includes('Female') || v.name.includes('Samantha')
  ) || voices[0]

  if (preferredVoice) utterance.voice = preferredVoice
  
  utterance.pitch = 1
  utterance.rate = 1
  utterance.volume = 1

  utterance.onend = () => {
    if (onEnd) onEnd()
  }

  window.speechSynthesis.speak(utterance)
}

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}
