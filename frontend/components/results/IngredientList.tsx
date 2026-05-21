'use client'

import { Dot } from 'lucide-react'
import { motion } from 'framer-motion'

interface IngredientListProps {
  ingredients: string[]
}

export function IngredientList({ ingredients }: IngredientListProps) {
  return (
    <div className="space-y-3">
      {ingredients.map((ingredient, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-3"
        >
          <Dot className="h-4 w-4 flex-shrink-0 fill-green-500 text-green-500" />
          <span className="text-sm text-white/90">{ingredient}</span>
        </motion.div>
      ))}
    </div>
  )
}
