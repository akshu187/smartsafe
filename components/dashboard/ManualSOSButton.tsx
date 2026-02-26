"use client"

import React, { useState } from "react"
import { Phone, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ManualSOSButtonProps {
  onTriggerSOS: () => void
}

export function ManualSOSButton({ onTriggerSOS }: ManualSOSButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClick = () => {
    setShowConfirm(true)
    // Vibrate
    if ("vibrate" in navigator) {
      navigator.vibrate(200)
    }
  }

  const handleConfirm = () => {
    setShowConfirm(false)
    onTriggerSOS()
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  return (
    <>
      {/* Floating SOS Button */}
      <button
        onClick={handleClick}
        className="fixed bottom-8 right-8 z-40 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-700 shadow-2xl transition-all hover:scale-110 hover:shadow-red-500/50 active:scale-95"
        aria-label="Emergency SOS"
      >
        <div className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-20"></div>
        <div className="relative flex flex-col items-center">
          <Phone className="h-8 w-8 text-white" />
          <span className="mt-1 text-xs font-bold text-white">SOS</span>
        </div>
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-red-500 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-2xl">
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
                <Phone className="h-10 w-10 text-red-500" />
              </div>

              {/* Title */}
              <h2 className="mb-4 text-2xl font-bold text-white">Send Emergency Alert?</h2>

              {/* Message */}
              <p className="mb-8 text-slate-300">
                This will:
              </p>
              <ul className="mb-8 space-y-2 text-left text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>Call emergency services (112)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>Send your location to emergency contacts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>Show nearby hospitals</span>
                </li>
              </ul>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 rounded-full border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex-1 rounded-full bg-red-600 text-white hover:bg-red-700"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Send SOS
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
