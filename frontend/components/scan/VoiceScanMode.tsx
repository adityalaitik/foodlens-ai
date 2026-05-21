'use client'

import { useEffect } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { useVoiceOutput, buildSpeechText } from '@/hooks/useVoiceOutput'
import type { FoodAnalysis, Confidence } from '@/types'

interface VoiceScanModeProps {
  onSearch: (query: string) => void
  isLoading: boolean
  result: FoodAnalysis | null
}

const CONFIDENCE_COLORS: Record<Confidence, string> = {
  high: 'bg-green-500/20 text-green-200',
  medium: 'bg-yellow-500/20 text-yellow-200',
  low: 'bg-red-500/20 text-red-200',
}

export function VoiceScanMode({ onSearch, isLoading, result }: VoiceScanModeProps) {
  const { isListening, transcript, startListening, stopListening, isSupported: micSupported } = useVoiceInput()
  const { speak, stop, isSpeaking, isSupported: ttsSupported } = useVoiceOutput()

  // Auto-search when transcript arrives
  useEffect(() => {
    if (transcript) {
      onSearch(transcript)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript])

  // Auto-read result aloud when it arrives
  useEffect(() => {
    if (result && ttsSupported) {
      speak(buildSpeechText(result))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  const statusText = isListening
    ? 'Listening...'
    : isLoading
      ? 'Analyzing...'
      : result
        ? `Found: ${result.dish_name}`
        : 'Tap to speak'

  return (
    <div className="flex flex-col items-center justify-center gap-10 py-16">
      {/* Mic button with pulse rings */}
      <div className="relative flex items-center justify-center">
        {isListening && (
          <>
            <div className="absolute h-36 w-36 animate-ping rounded-full bg-red-500/10" />
            <div className="absolute h-28 w-28 animate-ping rounded-full bg-red-500/15" style={{ animationDelay: '150ms' }} />
          </>
        )}
        {isLoading && (
          <div className="absolute h-28 w-28 animate-ping rounded-full bg-green-500/15" />
        )}

        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={isListening ? stopListening : startListening}
          disabled={isLoading || !micSupported}
          className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full transition ${
            isListening
              ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]'
              : isLoading
                ? 'bg-green-500/30 cursor-not-allowed'
                : 'bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20'
          }`}
        >
          {isListening ? (
            <MicOff className="h-10 w-10 text-white" />
          ) : (
            <Mic className="h-10 w-10 text-white/80" />
          )}
        </motion.button>
      </div>

      {/* Status text */}
      <motion.p
        key={statusText}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-sm font-medium ${
          isListening
            ? 'text-red-400'
            : isLoading
              ? 'text-green-400'
              : result
                ? 'text-white/70'
                : 'text-white/40'
        }`}
      >
        {statusText}
      </motion.p>

      {/* Result card */}
      <AnimatePresence>
        {result && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="w-full max-w-sm rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-5 backdrop-blur-sm space-y-3"
          >
            {/* Dish + confidence + speak button */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-foreground leading-tight">{result.dish_name}</h3>
              <div className="flex items-center gap-2 shrink-0">
                {ttsSupported && (
                  <button
                    type="button"
                    onClick={() => isSpeaking ? stop() : speak(buildSpeechText(result))}
                    className={`rounded-full p-1 transition ${
                      isSpeaking
                        ? 'animate-pulse text-green-400'
                        : 'text-foreground/40 hover:text-foreground'
                    }`}
                    title={isSpeaking ? 'Stop' : 'Read aloud'}
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                )}
                <Badge className={`rounded-full capitalize text-xs ${CONFIDENCE_COLORS[result.confidence]}`}>
                  {result.confidence}
                </Badge>
              </div>
            </div>

            {/* Nutrition chips */}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <NutritionChip icon="🔥" value={`${result.nutrition.calories}`} unit="kcal" />
              <NutritionChip icon="💪" value={`${result.nutrition.protein_g}g`} unit="protein" />
              <NutritionChip icon="🌾" value={`${result.nutrition.carbs_g}g`} unit="carbs" />
              <NutritionChip icon="🧈" value={`${result.nutrition.fat_g}g`} unit="fat" />
            </div>

            {/* Allergens */}
            {result.allergens.length > 0 && (
              <p className="text-xs text-foreground/50">
                Contains: {result.allergens.join(', ')}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!micSupported && (
        <p className="text-xs text-foreground/30">Voice input is not supported in this browser.</p>
      )}
    </div>
  )
}

function NutritionChip({ icon, value, unit }: { icon: string; value: string; unit: string }) {
  return (
    <span className="flex items-baseline gap-1 text-sm">
      <span>{icon}</span>
      <span className="font-semibold text-foreground">{value}</span>
      <span className="text-foreground/50">{unit}</span>
    </span>
  )
}
