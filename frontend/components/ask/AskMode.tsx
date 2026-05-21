'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Mic, MicOff } from 'lucide-react'
import { useVoiceInput } from '@/hooks/useVoiceInput'

interface AskModeProps {
  onSearch: (dishName: string) => void
  isLoading: boolean
}

export function AskMode({ onSearch, isLoading }: AskModeProps) {
  const [dishName, setDishName] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const { isListening, transcript, startListening, stopListening, isSupported: micSupported } = useVoiceInput()

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches')
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    if (transcript) {
      setDishName(transcript)
      handleSearch(transcript)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript])

  const handleSearch = (query: string = dishName) => {
    if (query.trim()) {
      onSearch(query)
      const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
      setDishName('')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12">
      <div className="text-6xl">🍽️</div>

      <div className="w-full max-w-xs space-y-3">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Type or speak a dish name..."
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="rounded-full border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-2 text-foreground placeholder:text-foreground/40"
          />
          {micSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`shrink-0 rounded-full p-2 transition ${
                isListening
                  ? 'bg-red-500/20 text-red-400 animate-pulse'
                  : 'bg-black/5 dark:bg-white/5 text-foreground/50 hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground'
              }`}
              title={isListening ? 'Stop listening' : 'Speak dish name'}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          )}
        </div>

        {isListening && (
          <div className="flex items-center gap-2 text-xs text-red-400">
            <div className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
            Listening...
          </div>
        )}

        <Button
          onClick={() => handleSearch()}
          disabled={isLoading || !dishName.trim()}
          className="w-full rounded-full bg-green-500 hover:bg-green-600 disabled:opacity-50"
        >
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      {recentSearches.length > 0 && (
        <div className="w-full max-w-xs space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-foreground/50 uppercase tracking-wide">Recent Searches</p>
            <button
              type="button"
              onClick={() => {
                setRecentSearches([])
                localStorage.removeItem('recentSearches')
              }}
              className="text-xs text-foreground/40 hover:text-red-400 transition"
            >
              Clear
            </button>
          </div>
          <div className="space-y-2">
            {recentSearches.map((search, i) => (
              <button
                key={i}
                onClick={() => handleSearch(search)}
                className="block w-full rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-2 text-left text-sm text-foreground/80 transition hover:bg-black/10 dark:hover:bg-white/10"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
