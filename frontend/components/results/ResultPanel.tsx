'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { X, Volume2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { IngredientList } from './IngredientList'
import { NutritionFacts } from './NutritionFacts'
import { AllergenBadges } from './AllergenBadges'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useVoiceOutput, buildSpeechText } from '@/hooks/useVoiceOutput'
import type { FoodAnalysis, Confidence } from '@/types'

interface ResultPanelProps {
  result: FoodAnalysis | null
  isLoading: boolean
  onClose: () => void
}

const CONFIDENCE_COLORS: Record<Confidence, string> = {
  high: 'bg-green-500/20 text-green-200',
  medium: 'bg-yellow-500/20 text-yellow-200',
  low: 'bg-red-500/20 text-red-200',
}

export function ResultPanel({ result, isLoading, onClose }: ResultPanelProps) {
  const { speak, stop, isSpeaking, isSupported: ttsSupported } = useVoiceOutput()
  if (!result && !isLoading) return null

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-black/10 dark:border-white/10 bg-background/95 dark:bg-gradient-to-b dark:from-white/5 dark:to-white/[0.02] px-4 py-6 backdrop-blur-lg"
    >
      {/* Drag Handle */}
      <div className="mb-4 flex justify-center">
        <div className="h-1 w-12 rounded-full bg-white/20" />
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-6 rounded-full p-2 hover:bg-black/10 dark:hover:bg-white/10"
      >
        <X className="h-5 w-5 text-foreground/70" />
      </button>

      <ScrollArea className="h-[calc(100vh-200px)] pr-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : result ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="flex-1 text-2xl font-bold text-foreground">{result.dish_name}</h2>
                {ttsSupported && (
                  <button
                    type="button"
                    onClick={() => (isSpeaking ? stop() : speak(buildSpeechText(result)))}
                    className={`rounded-full p-2 transition ${
                      isSpeaking
                        ? 'animate-pulse bg-green-500/20 text-green-400'
                        : 'bg-black/5 dark:bg-white/5 text-foreground/50 hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground'
                    }`}
                    title={isSpeaking ? 'Stop' : 'Read aloud'}
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                )}
              </div>
              <Badge className={`w-fit rounded-full capitalize ${CONFIDENCE_COLORS[result.confidence]}`}>
                {result.confidence} Confidence
              </Badge>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="ingredients" className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-full bg-white/5">
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                <TabsTrigger value="allergens">Allergens</TabsTrigger>
              </TabsList>

              <TabsContent value="ingredients" className="py-4">
                <IngredientList ingredients={result.ingredients} />
              </TabsContent>

              <TabsContent value="nutrition" className="py-4">
                <NutritionFacts nutrition={result.nutrition} />
              </TabsContent>

              <TabsContent value="allergens" className="py-4">
                <AllergenBadges allergens={result.allergens} />
              </TabsContent>
            </Tabs>
          </motion.div>
        ) : null}
      </ScrollArea>
    </motion.div>
  )
}
