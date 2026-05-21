'use client'

import { Camera, Mic } from 'lucide-react'

export type ScanSubMode = 'video' | 'mic'

interface ScanSubToggleProps {
  active: ScanSubMode
  onChange: (mode: ScanSubMode) => void
}

export function ScanSubToggle({ active, onChange }: ScanSubToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-1">
      <button
        type="button"
        onClick={() => onChange('video')}
        className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
          active === 'video'
            ? 'bg-foreground text-background'
            : 'text-foreground/50 hover:text-foreground'
        }`}
      >
        <Camera className="h-3.5 w-3.5" />
        Video
      </button>
      <button
        type="button"
        onClick={() => onChange('mic')}
        className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
          active === 'mic'
            ? 'bg-foreground text-background'
            : 'text-foreground/50 hover:text-foreground'
        }`}
      >
        <Mic className="h-3.5 w-3.5" />
        Voice
      </button>
    </div>
  )
}
