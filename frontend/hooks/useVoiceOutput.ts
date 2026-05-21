'use client'

import { useState, useCallback } from 'react'
import type { FoodAnalysis } from '@/types'

interface UseVoiceOutputReturn {
  speak: (text: string) => void
  stop: () => void
  isSpeaking: boolean
  isSupported: boolean
}

export function buildSpeechText(result: FoodAnalysis): string {
  const parts = [
    `Dish: ${result.dish_name}.`,
    `Calories: ${result.nutrition.calories}.`,
    `Protein: ${result.nutrition.protein_g} grams.`,
    `Carbs: ${result.nutrition.carbs_g} grams.`,
    `Fat: ${result.nutrition.fat_g} grams.`,
  ]

  if (result.allergens.length > 0) {
    parts.push(`Contains allergens: ${result.allergens.join(', ')}.`)
  } else {
    parts.push('No allergens detected.')
  }

  parts.push(`Confidence: ${result.confidence}.`)

  return parts.join(' ')
}

export function useVoiceOutput(): UseVoiceOutputReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) return

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.lang = 'en-US'

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    },
    [isSupported],
  )

  const stop = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [isSupported])

  return { speak, stop, isSpeaking, isSupported }
}
