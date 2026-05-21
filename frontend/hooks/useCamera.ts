'use client'

import { useEffect, useRef, useState } from 'react'

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>
  isReady: boolean
  error: string | null
  startCamera: () => Promise<void>
  stopCamera: () => void
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      setError(null)

      let stream: MediaStream | null = null

      // Try back camera first (mobile), fall back to any available camera (desktop/MacBook)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
      }

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setIsReady(true)
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to access camera'
      setError(errorMessage)
      console.error('[v0] Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsReady(false)
  }

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  return { videoRef, isReady, error, startCamera, stopCamera }
}
