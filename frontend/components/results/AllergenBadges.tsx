'use client'

import { AlertCircle, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Allergen } from '@/types'

interface AllergenBadgesProps {
  allergens: Allergen[]
}

const ALLERGEN_INFO: Record<Allergen, { emoji: string; label: string }> = {
  dairy: { emoji: '🥛', label: 'Dairy' },
  nuts: { emoji: '🥜', label: 'Nuts' },
  gluten: { emoji: '🌾', label: 'Gluten' },
  soy: { emoji: '🫘', label: 'Soy' },
  eggs: { emoji: '🥚', label: 'Eggs' },
}

const ALL_ALLERGENS: Allergen[] = ['dairy', 'nuts', 'gluten', 'soy', 'eggs']

export function AllergenBadges({ allergens }: AllergenBadgesProps) {
  return (
    <div className="space-y-3">
      {ALL_ALLERGENS.map((allergen) => {
        const isPresent = allergens.includes(allergen)
        const info = ALLERGEN_INFO[allergen]

        return (
          <div key={allergen} className="flex items-center gap-2">
            <Badge
              variant={isPresent ? 'destructive' : 'secondary'}
              className={`flex items-center gap-2 rounded-full px-3 py-2 ${
                isPresent
                  ? 'bg-red-500/20 text-red-200'
                  : 'bg-green-500/20 text-green-200'
              }`}
            >
              <span>{info.emoji}</span>
              <span>{info.label}</span>
              {isPresent ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Badge>
          </div>
        )
      })}
    </div>
  )
}
