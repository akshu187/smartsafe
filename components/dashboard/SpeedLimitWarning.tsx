"use client"

import React from "react"
import { AlertTriangle, Gauge } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

interface SpeedLimitWarningProps {
  currentSpeed: number
  speedLimit: number
  zoneName: string
  isVisible: boolean
}

export function SpeedLimitWarning({
  currentSpeed,
  speedLimit,
  zoneName,
  isVisible,
}: SpeedLimitWarningProps) {
  const [audioPlayed, setAudioPlayed] = React.useState(false)
  const speedExcess = currentSpeed - speedLimit

  React.useEffect(() => {
    if (isVisible && !audioPlayed) {
      // Play audio warning
      try {
        const audio = new Audio("/warning-beep.mp3")
        audio.volume = 0.5
        audio.play().catch(() => {
          // Fallback to speech synthesis if audio file not available
          const utterance = new SpeechSynthesisUtterance(
            `Speed limit exceeded. Reduce speed to ${speedLimit} kilometers per hour`
          )
          utterance.rate = 1.2
          utterance.pitch = 1.1
          window.speechSynthesis.speak(utterance)
        })
        setAudioPlayed(true)
      } catch (error) {
        console.warn("Audio warning failed:", error)
      }
    }

    if (!isVisible) {
      setAudioPlayed(false)
    }
  }, [isVisible, audioPlayed, speedLimit])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-20 left-0 right-0 z-50 mx-4 md:mx-auto md:max-w-2xl"
        >
          <div className="relative overflow-hidden rounded-2xl border-2 border-red-500 bg-red-500/95 backdrop-blur-xl shadow-2xl">
            {/* Animated background pulse */}
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-red-600"
            />

            {/* Content */}
            <div className="relative z-10 p-4 md:p-6">
              <div className="flex items-center gap-4">
                {/* Animated warning icon */}
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="flex-shrink-0"
                >
                  <div className="rounded-full bg-white p-3">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </motion.div>

                {/* Warning text */}
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                    SPEED LIMIT EXCEEDED!
                  </h3>
                  <p className="text-sm md:text-base text-red-100">
                    {zoneName} - Reduce speed immediately
                  </p>
                </div>

                {/* Speed display */}
                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="h-5 w-5 text-white" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-3xl md:text-4xl font-bold text-white"
                    >
                      {Math.round(currentSpeed)}
                    </motion.div>
                  </div>
                  <div className="text-xs md:text-sm text-red-100">
                    Limit: {speedLimit} km/h
                  </div>
                  <div className="text-xs md:text-sm font-semibold text-white">
                    +{speedExcess.toFixed(0)} km/h over
                  </div>
                </div>
              </div>

              {/* Progress bar showing how much over limit */}
              <div className="mt-4 h-2 bg-red-900/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((speedExcess / speedLimit) * 100, 100)}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-white"
                />
              </div>
            </div>

            {/* Animated border glow */}
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 border-4 border-white/30 rounded-2xl pointer-events-none"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
