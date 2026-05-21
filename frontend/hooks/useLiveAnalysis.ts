'use client'

import { useEffect, useRef } from 'react'
import { useFrameCapture } from './useFrameCapture'
import { useAnalyze } from './useAnalyze'

interface UseLiveAnalysisParams {
  videoRef: React.RefObject<HTMLVideoElement>
  isReady: boolean
  isActive: boolean
}

const BASE_COOLDOWN_MS = 10_000

export function useLiveAnalysis({ videoRef, isReady, isActive }: UseLiveAnalysisParams): void {
  const { captureFrame } = useFrameCapture(videoRef)
  const { analyzeImage } = useAnalyze()
  const inFlightRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isActive || !isReady) return

    let cancelled = false

    const runLoop = async () => {
      if (cancelled || inFlightRef.current) return

      const frame = captureFrame()
      if (!frame) {
        timeoutRef.current = setTimeout(runLoop, 500)
        return
      }

      inFlightRef.current = true
      const { retryAfterMs } = await analyzeImage(frame)
      inFlightRef.current = false

      if (!cancelled) {
        const delay = retryAfterMs ?? BASE_COOLDOWN_MS
        timeoutRef.current = setTimeout(runLoop, delay)
      }
    }

    runLoop()

    return () => {
      cancelled = true
      inFlightRef.current = false
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isActive, isReady])
}
