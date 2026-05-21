'use client'

import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ErrorCardProps {
  message: string
}

export function ErrorCard({ message }: ErrorCardProps) {
  return (
    <Alert variant="destructive" className="rounded-2xl border-red-500/20">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
