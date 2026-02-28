"use client"

import React from "react"
import { School, Hospital, Church, ShoppingBag, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { POIType } from "@/hooks/use-poi-detection"

interface POIAlertModalProps {
  isOpen: boolean
  type: POIType
  name: string
  message: string
  speedLimit?: number
  onDismiss: () => void
}

export function POIAlertModal({
  isOpen,
  type,
  name,
  message,
  speedLimit,
  onDismiss,
}: POIAlertModalProps) {
  React.useEffect(() => {
    // Auto-dismiss after 8 seconds only if open
    if (!isOpen) return
    
    const timer = setTimeout(() => {
      onDismiss()
    }, 8000)

    return () => clearTimeout(timer)
  }, [isOpen, onDismiss])

  // ✅ Early return AFTER hooks
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case "school":
        return <School className="h-12 w-12 text-yellow-400" />
      case "hospital":
        return <Hospital className="h-12 w-12 text-red-400" />
      case "religious":
        return <Church className="h-12 w-12 text-purple-400" />
      case "market":
        return <ShoppingBag className="h-12 w-12 text-blue-400" />
      default:
        return <AlertTriangle className="h-12 w-12 text-yellow-400" />
    }
  }

  const getColor = () => {
    switch (type) {
      case "school":
        return "from-yellow-900/95 to-yellow-950/95 border-yellow-500"
      case "hospital":
        return "from-red-900/95 to-red-950/95 border-red-500"
      case "religious":
        return "from-purple-900/95 to-purple-950/95 border-purple-500"
      case "market":
        return "from-blue-900/95 to-blue-950/95 border-blue-500"
      default:
        return "from-slate-900/95 to-slate-950/95 border-slate-500"
    }
  }

  const getTitle = () => {
    switch (type) {
      case "school":
        return "🏫 School Zone"
      case "hospital":
        return "🏥 Hospital Zone"
      case "religious":
        return "🕌 Religious Place"
      case "market":
        return "🛒 Market Area"
      default:
        return "⚠️ Alert"
    }
  }

  return (
    <div
      className="fixed top-20 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4 animate-in slide-in-from-top-5 duration-500"
      onClick={onDismiss}
    >
      <div
        className={`relative rounded-2xl border-2 bg-gradient-to-br p-6 shadow-2xl ${getColor()}`}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden rounded-t-2xl bg-white/10">
          <div className="h-full w-full origin-left animate-[shrink_8s_linear] bg-white/50" />
        </div>

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">{getIcon()}</div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="mb-1 text-lg font-bold text-white">{getTitle()}</h3>
            <p className="mb-2 text-sm font-medium text-slate-200">{name}</p>
            <p className="text-sm text-slate-300">{message}</p>

            {speedLimit && (
              <div className="mt-3 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white backdrop-blur-sm"
                >
                  Speed Limit: {speedLimit} km/h
                </Badge>
              </div>
            )}

            {/* Special warnings */}
            {type === "school" && (
              <div className="mt-3 flex items-center gap-2 text-xs text-yellow-200">
                <AlertTriangle className="h-3 w-3" />
                <span>Watch for children crossing the road</span>
              </div>
            )}

            {type === "hospital" && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-200">
                <AlertTriangle className="h-3 w-3" />
                <span>No horn - Silence zone</span>
              </div>
            )}
          </div>
        </div>

        {/* Tap to dismiss hint */}
        <p className="mt-3 text-center text-xs text-white/60">Tap to dismiss</p>
      </div>
    </div>
  )
}

// Add this to your global CSS for the shrink animation
// @keyframes shrink {
//   from { transform: scaleX(1); }
//   to { transform: scaleX(0); }
// }
