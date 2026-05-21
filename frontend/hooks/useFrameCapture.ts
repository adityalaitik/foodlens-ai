'use client'

import { useCallback } from 'react'
import { canvasToBase64 } from '@/lib/imageUtils'

interface UseFrameCaptureReturn {
  captureFrame: () => string | null
}

export function useFrameCapture(
  videoRef: React.RefObject<HTMLVideoElement>
): UseFrameCaptureReturn {
  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current) return null

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(videoRef.current, 0, 0)

    return canvasToBase64(canvas)
  }, [videoRef])

  return { captureFrame }
}
