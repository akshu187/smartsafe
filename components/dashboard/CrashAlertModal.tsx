"use client"

import React, { useEffect, useState } from "react"
import { AlertTriangle, Phone, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CrashAlertModalProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
  countdown: number
  crashType?: "frontal" | "side" | "rear" | "rollover" | "unknown"
  confidence?: number
}

export function CrashAlertModal({ isOpen, onCancel, onConfirm, countdown, crashType = "unknown", confidence }: CrashAlertModalProps) {
  if (!isOpen) return null

  const crashTypeText = {
    frontal: "FRONTAL IMPACT",
    side: "SIDE IMPACT",
    rear: "REAR IMPACT",
    rollover: "ROLLOVER DETECTED",
    unknown: "CRASH DETECTED"
  }[crashType]

  const crashTypeEmoji = {
    frontal: "💥",
    side: "⚠️",
    rear: "🚗",
    rollover: "🔄",
    unknown: "🚨"
  }[crashType]

  const confidenceColor = confidence && confidence >= 80 ? "text-red-200" : 
                          confidence && confidence >= 60 ? "text-yellow-200" : 
                          "text-orange-200"

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-full max-w-md animate-pulse rounded-3xl border-4 border-red-500 bg-gradient-to-br from-red-600 to-red-800 p-8 shadow-2xl">
        {/* Pulsing effect */}
        <div className="absolute inset-0 animate-ping rounded-3xl border-4 border-red-500 opacity-20"></div>

        <div className="relative z-10 text-center text-white">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <AlertTriangle className="h-16 w-16 animate-bounce text-white" />
          </div>

          {/* Title */}
          <h1 className="mb-2 text-4xl font-black uppercase tracking-tight">
            {crashTypeEmoji} {crashTypeText}
          </h1>
          {crashType !== "unknown" && (
            <p className="mb-2 text-sm font-medium opacity-90">
              {crashType === "rollover" ? "Vehicle rollover detected" : `${crashType.charAt(0).toUpperCase() + crashType.slice(1)} collision detected`}
            </p>
          )}
          {confidence && (
            <p className={`mb-4 text-xs font-semibold ${confidenceColor}`}>
              Detection Confidence: {Math.round(confidence)}%
            </p>
          )}

          {/* Message */}
          <p className="mb-6 text-xl font-semibold">Are you okay?</p>

          {/* Countdown */}
          <div className="mb-8">
            <div className="mx-auto mb-3 flex h-32 w-32 items-center justify-center rounded-full border-8 border-white bg-red-900">
              <span className="text-6xl font-black">{countdown}</span>
            </div>
            <p className="text-lg">Calling emergency services in {countdown} seconds</p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onCancel}
              size="lg"
              className="w-full rounded-full bg-green-500 py-6 text-xl font-bold text-white hover:bg-green-600"
            >
              <X className="mr-2 h-6 w-6" />
              I'M OKAY - CANCEL
            </Button>
            <Button
              onClick={onConfirm}
              size="lg"
              variant="outline"
              className="w-full rounded-full border-2 border-white bg-transparent py-6 text-xl font-bold text-white hover:bg-white/20"
            >
              <Phone className="mr-2 h-6 w-6" />
              CALL HELP NOW
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
