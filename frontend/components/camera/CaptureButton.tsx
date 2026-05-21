'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface CaptureButtonProps {
  onCapture: () => void
  isLoading: boolean
}

export function CaptureButton({ onCapture, isLoading }: CaptureButtonProps) {
  const flashRef = useRef<HTMLDivElement>(null)

  const handleCapture = () => {
    // Flash animation
    if (flashRef.current) {
      flashRef.current.classList.add('animate-pulse')
      setTimeout(() => {
        flashRef.current?.classList.remove('animate-pulse')
      }, 150)
    }
    onCapture()
  }

  return (
    <>
      <div
        ref={flashRef}
        className="pointer-events-none fixed inset-0 opacity-0"
        style={{
          backgroundColor: 'white',
          transition: 'opacity 150ms ease-out',
        }}
      />
      <Button
        onClick={handleCapture}
        disabled={isLoading}
        className="h-20 w-20 rounded-full bg-white p-1 text-black hover:bg-white/90 disabled:opacity-50"
      >
        <div className="h-full w-full rounded-full border-4 border-white bg-black/10" />
        {isLoading && <Spinner className="absolute h-8 w-8" />}
      </Button>
    </>
  )
}
