'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useVoiceOutput, buildSpeechText } from '@/hooks/useVoiceOutput'
import type { Allergen, Confidence, FoodAnalysis } from '@/types'

interface LiveOverlayProps {
  result: FoodAnalysis | null
  isLoading: boolean
  error?: string | null
}

const CONFIDENCE_COLORS: Record<Confidence, string> = {
  high: 'bg-green-500/20 text-green-300 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  low: 'bg-red-500/20 text-red-300 border-red-500/30',
}

const ALLERGEN_EMOJIS: Record<Allergen, string> = {
  dairy: '🥛',
  nuts: '🥜',
  gluten: '🌾',
  soy: '🫘',
  eggs: '🥚',
}

export function LiveOverlay({ result, isLoading }: LiveOverlayProps) {
  const showScanning = isLoading && !result
  const showResult = result !== null
  const { speak, stop, isSpeaking, isSupported: ttsSupported } = useVoiceOutput()

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0">
      <AnimatePresence mode="wait">
        {showResult ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="bg-gradient-to-t from-black/95 via-black/80 to-transparent px-4 pb-4 pt-10 backdrop-blur-sm"
          >
            {/* Row 1: Dish name + confidence + speak button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="mb-2 flex items-start justify-between gap-2"
            >
              <h2 className="text-xl font-bold leading-tight text-white">{result.dish_name}</h2>
              <div className="flex items-center gap-2">
                {ttsSupported && (
                  <button
                    type="button"
                    onClick={() => (isSpeaking ? stop() : speak(buildSpeechText(result)))}
                    className={`pointer-events-auto rounded-full p-1 transition ${
                      isSpeaking
                        ? 'animate-pulse text-green-400'
                        : 'text-white/50 hover:text-white'
                    }`}
                    title={isSpeaking ? 'Stop' : 'Read aloud'}
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                )}
                <Badge
                  className={`shrink-0 rounded-full border text-xs capitalize ${CONFIDENCE_COLORS[result.confidence]}`}
                >
                  {result.confidence}
                </Badge>
              </div>
            </motion.div>

            {/* Row 2: Quick nutrition stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-2 flex flex-wrap gap-x-3 gap-y-1"
            >
              <StatChip icon="🔥" value={`${result.nutrition.calories}`} unit="kcal" />
              <StatChip icon="💪" value={`${result.nutrition.protein_g}g`} unit="protein" />
              <StatChip icon="🌾" value={`${result.nutrition.carbs_g}g`} unit="carbs" />
              <StatChip icon="🧈" value={`${result.nutrition.fat_g}g`} unit="fat" />
            </motion.div>

            {/* Row 3: Present allergens */}
            {result.allergens.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-1"
              >
                <span className="text-xs text-white/50">Contains:</span>
                {result.allergens.map((a) => (
                  <span key={a} title={a} className="text-base">
                    {ALLERGEN_EMOJIS[a]}
                  </span>
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : showScanning ? (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex justify-center pb-6"
          >
            <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 backdrop-blur-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              <span className="text-xs font-medium text-white/80">Analyzing...</span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function StatChip({ icon, value, unit }: { icon: string; value: string; unit: string }) {
  return (
    <span className="flex items-baseline gap-1 text-sm">
      <span>{icon}</span>
      <span className="font-semibold text-white">{value}</span>
      <span className="text-white/50">{unit}</span>
    </span>
  )
}
