'use client'

import { ErrorCard } from '@/components/ui/ErrorCard'
import { LiveOverlay } from './LiveOverlay'
import type { FoodAnalysis } from '@/types'

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>
  error: string | null
  liveResult?: FoodAnalysis | null
  isLiveLoading?: boolean
  liveError?: string | null
}

export function CameraView({ videoRef, error, liveResult, isLiveLoading, liveError }: CameraViewProps) {
  if (error) {
    return <ErrorCard message={`Camera Error: ${error}`} />
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-[70vh] w-full object-cover"
      />
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur">
        <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span className="text-xs font-semibold text-white">LIVE</span>
      </div>
      <LiveOverlay
        result={liveResult ?? null}
        isLoading={isLiveLoading ?? false}
        error={liveError}
      />
    </div>
  )
}
