'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TabSwitcherProps {
  activeTab: 'scan' | 'ask'
  onTabChange: (tab: 'scan' | 'ask') => void
}

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as 'scan' | 'ask')}>
      <TabsList className="grid w-full grid-cols-2 rounded-full bg-black/5 dark:bg-white/5">
        <TabsTrigger value="scan" className="rounded-full">
          📷 Scan Food
        </TabsTrigger>
        <TabsTrigger value="ask" className="rounded-full">
          💬 Ask AI
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
