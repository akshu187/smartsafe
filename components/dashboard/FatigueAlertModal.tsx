"use client"

import React from "react"
import { Coffee, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FatigueAlertModalProps {
  isOpen: boolean
  level: "warning" | "critical"
  message: string
  drivingTime: string
  onDismiss: () => void
  onFindRestStop: () => void
}

export function FatigueAlertModal({
  isOpen,
  level,
  message,
  drivingTime,
  onDismiss,
  onFindRestStop,
}: FatigueAlertModalProps) {
  if (!isOpen) return null

  const isCritical = level === "critical"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-md rounded-3xl border-2 p-8 shadow-2xl ${
          isCritical
            ? "border-red-500 bg-gradient-to-br from-red-900/90 to-red-950/90"
            : "border-yellow-500 bg-gradient-to-br from-yellow-900/90 to-yellow-950/90"
        }`}
      >
        <div className="text-center">
          {/* Icon */}
          <div
            className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
              isCritical ? "bg-red-500/20" : "bg-yellow-500/20"
            }`}
          >
            {isCritical ? (
              <AlertTriangle className="h-10 w-10 animate-pulse text-red-400" />
            ) : (
              <Coffee className="h-10 w-10 text-yellow-400" />
            )}
          </div>

          {/* Title */}
          <h2
            className={`mb-2 text-2xl font-bold ${
              isCritical ? "text-red-300" : "text-yellow-300"
            }`}
          >
            {isCritical ? "⚠️ MANDATORY REST" : "☕ Take a Break"}
          </h2>

          {/* Driving Time */}
          <p className="mb-4 text-3xl font-bold text-white">{drivingTime}</p>

          {/* Message */}
          <p className="mb-6 text-slate-200">{message}</p>

          {/* Tips */}
          <div className="mb-6 rounded-lg bg-black/30 p-4 text-left text-sm text-slate-300">
            <p className="mb-2 font-semibold">Safety Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Park safely off the road</li>
              <li>• Stretch your legs for 5-10 minutes</li>
              <li>• Drink water or coffee</li>
              <li>• Rest your eyes</li>
              {isCritical && <li className="text-red-300">• Take at least 15 minutes break</li>}
            </ul>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onFindRestStop}
              className={`w-full rounded-full py-6 text-white ${
                isCritical
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            >
              <Coffee className="mr-2 h-5 w-5" />
              Find Nearby Rest Stops
            </Button>
            {!isCritical && (
              <Button
                onClick={onDismiss}
                variant="outline"
                className="w-full rounded-full border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <X className="mr-2 h-4 w-4" />
                I'll Take a Break Soon
              </Button>
            )}
          </div>

          {isCritical && (
            <p className="mt-4 text-xs text-red-300">
              ⚠️ Continuing to drive while fatigued is dangerous and illegal in many regions
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
