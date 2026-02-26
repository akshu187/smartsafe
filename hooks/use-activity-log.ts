import { create } from 'zustand'

export interface ActivityLog {
  id: string
  time: string
  event: string
  type: 'info' | 'warning' | 'danger' | 'success'
  timestamp: number
}

interface ActivityLogStore {
  logs: ActivityLog[]
  addLog: (event: string, type: ActivityLog['type']) => void
  clearLogs: () => void
}

export const useActivityLog = create<ActivityLogStore>((set) => ({
  logs: [],
  addLog: (event, type) => {
    const now = new Date()
    const time = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
    
    const log: ActivityLog = {
      id: `${Date.now()}-${Math.random()}`,
      time,
      event,
      type,
      timestamp: Date.now(),
    }
    
    set((state) => ({
      logs: [log, ...state.logs].slice(0, 10) // Keep only last 10 logs
    }))
  },
  clearLogs: () => set({ logs: [] }),
}))
