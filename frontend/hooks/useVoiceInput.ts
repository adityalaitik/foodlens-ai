'use client'

import { useState, useRef, useCallback } from 'react'

interface UseVoiceInputReturn {
  isListening: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  isSupported: boolean
  error: string | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any

export function useVoiceInput(): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<AnyRecognition>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const startListening = useCallback(() => {
    if (!isSupported) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition

    const recognition: AnyRecognition = new SpeechRecognitionAPI()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event: AnyRecognition) => {
      const text: string = event.results[0][0].transcript
      setTranscript(text)
    }

    recognition.onerror = (event: AnyRecognition) => {
      setError(event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
    setError(null)
    setTranscript('')
  }, [isSupported])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, transcript, startListening, stopListening, isSupported, error }
}
