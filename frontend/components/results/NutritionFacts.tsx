'use client'

import { motion } from 'framer-motion'
import type { NutritionFacts as NutritionFactsType } from '@/types'

interface NutritionFactsProps {
  nutrition: NutritionFactsType
}

const NUTRIENTS = [
  { key: 'calories',   label: 'Calories',      unit: 'kcal', daily: 2000,  color: '#f97316' },
  { key: 'protein_g',  label: 'Protein',        unit: 'g',    daily: 50,    color: '#3b82f6' },
  { key: 'carbs_g',    label: 'Carbohydrates',  unit: 'g',    daily: 275,   color: '#a855f7' },
  { key: 'fat_g',      label: 'Total Fat',       unit: 'g',    daily: 78,    color: '#eab308' },
  { key: 'fiber_g',    label: 'Dietary Fiber',  unit: 'g',    daily: 28,    color: '#22c55e' },
  { key: 'sugar_g',    label: 'Sugar',           unit: 'g',    daily: 50,    color: '#ec4899' },
  { key: 'sodium_mg',  label: 'Sodium',          unit: 'mg',   daily: 2300,  color: '#06b6d4' },
] as const

export function NutritionFacts({ nutrition }: NutritionFactsProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Per Serving</p>
      {NUTRIENTS.map(({ key, label, unit, daily, color }, i) => {
        const value = nutrition[key]
        const pct = Math.min(Math.round((value / daily) * 100), 100)
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">{label}</span>
              <span className="font-semibold text-white">
                {value % 1 === 0 ? value : value.toFixed(1)}{unit}
                <span className="ml-2 text-xs text-white/40">{pct}% DV</span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )
      })}
      <p className="pt-1 text-xs text-white/30">
        * % Daily Values based on a 2,000 kcal diet
      </p>
    </div>
  )
}
