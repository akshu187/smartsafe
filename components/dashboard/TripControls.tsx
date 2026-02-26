"use client"

import React from "react"
import { Play, Square, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TripControlsProps {
  isActive: boolean
  duration: number // in minutes
  onStart: () => void
  onStop: () => void
}

export function TripControls({ isActive, duration, onStart, onStop }: TripControlsProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className="flex items-center gap-3">
      {isActive ? (
        <>
          {/* Duration Display */}
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
            <Clock className="h-4 w-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-xs text-emerald-400">Trip Duration</span>
              <span className="text-sm font-bold text-emerald-300">{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Stop Button */}
          <Button
            onClick={onStop}
            variant="outline"
            className="rounded-full border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
          >
            <Square className="mr-2 h-4 w-4" />
            End Trip
          </Button>
        </>
      ) : (
        <>
          {/* Start Button */}
          <Button
            onClick={onStart}
            className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <Play className="mr-2 h-4 w-4" />
            Start Trip
          </Button>
          <p className="text-xs text-slate-500">Start tracking your journey</p>
        </>
      )}
    </div>
  )
}
