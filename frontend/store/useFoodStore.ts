'use client'

import { create } from 'zustand'
import type { FoodAnalysis, AppMode } from '@/types'

interface FoodStore {
  result: FoodAnalysis | null
  isLoading: boolean
  error: string | null
  mode: AppMode
  setResult: (result: FoodAnalysis) => void
  setLoading: (val: boolean) => void
  setError: (msg: string | null) => void
  setMode: (mode: AppMode) => void
  clearResult: () => void
}

export const useFoodStore = create<FoodStore>((set) => ({
  result: null,
  isLoading: false,
  error: null,
  mode: 'scan',
  setResult: (result) => set({ result, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setMode: (mode) => set({ mode }),
  clearResult: () => set({ result: null, error: null }),
}))
