'use client'

import axios from 'axios'
import apiClient from '@/lib/apiClient'
import { useFoodStore } from '@/store/useFoodStore'
import type { AnalyzeImageRequest, AskDishRequest } from '@/types'

function extractRetryAfterMs(detail: string): number {
  const match = detail.match(/retry in ([\d.]+)s/i)
  if (match) return Math.ceil(parseFloat(match[1])) * 1000 + 2000
  return 60_000
}

export function useAnalyze() {
  const setResult = useFoodStore((state) => state.setResult)
  const setLoading = useFoodStore((state) => state.setLoading)
  const setError = useFoodStore((state) => state.setError)

  const analyzeImage = async (base64: string): Promise<{ retryAfterMs?: number }> => {
    try {
      setLoading(true)
      setError(null)

      const payload: AnalyzeImageRequest = { base64_image: base64 }
      const response = await apiClient.post('/api/analyze', payload)
      setResult(response.data)
      return {}
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail: string = err.response?.data?.detail ?? ''
        if (detail.includes('RESOURCE_EXHAUSTED') || detail.includes('429')) {
          const retryAfterMs = extractRetryAfterMs(detail)
          console.warn('[FoodLens] Rate limited — retry in', Math.round(retryAfterMs / 1000), 's')
          return { retryAfterMs }
        }
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image'
      setError(errorMessage)
      console.error('[v0] Analyze error:', err)
      return {}
    } finally {
      setLoading(false)
    }
  }

  const askDish = async (dishName: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const payload: AskDishRequest = { dish_name: dishName }
      const response = await apiClient.post('/api/ask', payload)
      setResult(response.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail: string = err.response?.data?.detail ?? ''
        if (detail.includes('RESOURCE_EXHAUSTED') || detail.includes('429')) {
          const retryAfterMs = extractRetryAfterMs(detail)
          console.warn('[FoodLens] Rate limited — retry in', Math.round(retryAfterMs / 1000), 's')
          return
        }
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to get dish info'
      setError(errorMessage)
      console.error('[v0] Ask error:', err)
    } finally {
      setLoading(false)
    }
  }

  return { analyzeImage, askDish }
}
