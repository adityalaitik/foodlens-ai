'use client'

import { useState } from 'react'
import { Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useCamera } from '@/hooks/useCamera'
import { useFrameCapture } from '@/hooks/useFrameCapture'
import { useAnalyze } from '@/hooks/useAnalyze'
import { useFoodStore } from '@/store/useFoodStore'
import { CameraView } from '@/components/camera/CameraView'
import { CaptureButton } from '@/components/camera/CaptureButton'
import { AskMode } from '@/components/ask/AskMode'
import { ResultPanel } from '@/components/results/ResultPanel'
import { TabSwitcher } from '@/components/ui/TabSwitcher'
import { ScanSubToggle } from '@/components/scan/ScanSubToggle'
import { VoiceScanMode } from '@/components/scan/VoiceScanMode'
import type { AppMode } from '@/types'
import type { ScanSubMode } from '@/components/scan/ScanSubToggle'

export default function ScannerPage() {
  const { videoRef, isReady, error: cameraError } = useCamera()
  const { captureFrame } = useFrameCapture(videoRef)
  const { analyzeImage, askDish } = useAnalyze()
  const { result, isLoading, error, mode, setMode, clearResult } = useFoodStore()
  const [scanSubMode, setScanSubMode] = useState<ScanSubMode>('video')

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode)
    clearResult()
  }

  const handleScanSubModeChange = (sub: ScanSubMode) => {
    setScanSubMode(sub)
    clearResult()
  }

  const handleCapture = async () => {
    const frame = captureFrame()
    if (frame) await analyzeImage(frame)
  }

  const handleSearch = async (dishName: string) => {
    await askDish(dishName)
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-black/10 dark:border-white/10 px-4 py-4">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span>🍎</span>
          <span>FoodLens AI</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button className="rounded-full p-2 text-foreground/60 hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground transition">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="px-4 py-4">
        <TabSwitcher activeTab={mode} onTabChange={handleModeChange} />
      </div>

      {/* Scan sub-mode toggle — scan tab only */}
      {mode === 'scan' && (
        <div className="flex justify-center pb-3">
          <ScanSubToggle active={scanSubMode} onChange={handleScanSubModeChange} />
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 px-4 pb-28">
        {mode === 'scan' ? (
          scanSubMode === 'video' ? (
            <CameraView
              videoRef={videoRef}
              error={cameraError}
              liveResult={result}
              isLiveLoading={isLoading}
              liveError={error}
            />
          ) : (
            <VoiceScanMode
              onSearch={handleSearch}
              isLoading={isLoading}
              result={result}
            />
          )
        ) : (
          <AskMode onSearch={handleSearch} isLoading={isLoading} />
        )}
      </div>

      {/* Capture button — scan video mode only */}
      {mode === 'scan' && scanSubMode === 'video' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
          <CaptureButton onCapture={handleCapture} isLoading={isLoading} />
        </div>
      )}

      {/* Result Panel — Ask mode only */}
      {mode === 'ask' && (
        <ResultPanel result={result} isLoading={isLoading} onClose={clearResult} />
      )}
    </main>
  )
}
