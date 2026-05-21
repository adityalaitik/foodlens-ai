'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface CalorieCardProps {
  calories: number
}

export function CalorieCard({ calories }: CalorieCardProps) {
  // Assume max calories per serving is 1000 for percentage calculation
  const maxCalories = 1000
  const percentage = Math.min((calories / maxCalories) * 100, 100)

  const circumference = 2 * Math.PI * 45

  return (
    <div className="flex items-center justify-center">
      <div className="relative h-40 w-40">
        <svg
          className="absolute inset-0 h-full w-full -rotate-90 transform"
          viewBox="0 0 120 120"
        >
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="url(#calGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (circumference * percentage) / 100 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
          <defs>
            <linearGradient id="calGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{calories}</div>
            <div className="text-xs text-white/60">kcal</div>
          </div>
        </div>
      </div>
      <div className="ml-6 text-sm text-white/70">
        <div className="font-semibold text-white">per serving</div>
      </div>
    </div>
  )
}
