"use client"

import React from "react"
import { ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EnableAllFeaturesButtonProps {
  onAllEnabled: () => void
}

export function EnableAllFeaturesButton({ onAllEnabled }: EnableAllFeaturesButtonProps) {
  const [showCard, setShowCard] = React.useState(true)

  // ✅ CRITICAL: Early return MUST come BEFORE any other hooks
  if (!showCard) return null

  return <EnableAllFeaturesButtonInner onAllEnabled={onAllEnabled} setShowCard={setShowCard} />
}

function EnableAllFeaturesButtonInner({ 
  onAllEnabled, 
  setShowCard 
}: { 
  onAllEnabled: () => void
  setShowCard: (show: boolean) => void
}) {
  const [isEnabling, setIsEnabling] = React.useState(false)
  const [status, setStatus] = React.useState<{
    gps: boolean
    motion: boolean
    notification: boolean
  }>({
    gps: false,
    motion: false,
    notification: false,
  })

  React.useEffect(() => {
    // Check if already enabled
    if (typeof window !== "undefined") {
      const alreadyEnabled = localStorage.getItem("smartsafe_all_features_enabled")
      if (alreadyEnabled === "true") {
        setShowCard(false)
      }
    }
  }, [])

  const enableAllFeatures = async () => {
    setIsEnabling(true)
    const newStatus = { gps: false, motion: false, notification: false }

    try {
      // 1. Request GPS/Location permission
      if ("geolocation" in navigator) {
        try {
          await new Promise<void>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              () => {
                newStatus.gps = true
                resolve()
              },
              (error) => {
                console.warn("GPS permission denied:", error)
                reject(error)
              }
            )
          })
        } catch (error) {
          console.warn("GPS not granted")
        }
      }

      // 2. Request Motion/Accelerometer permission (for crash detection)
      if (typeof DeviceMotionEvent !== "undefined" && "requestPermission" in DeviceMotionEvent) {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission()
          newStatus.motion = permission === "granted"
        } catch (error) {
          console.warn("Motion permission denied:", error)
        }
      } else {
        // Desktop or already granted
        newStatus.motion = true
      }

      // 3. Request Notification permission (for alerts)
      if ("Notification" in window) {
        try {
          const permission = await Notification.requestPermission()
          newStatus.notification = permission === "granted"
        } catch (error) {
          console.warn("Notification permission denied:", error)
        }
      }

      setStatus(newStatus)

      // If all granted, hide card and save preference
      if (newStatus.gps && newStatus.motion && newStatus.notification) {
        localStorage.setItem("smartsafe_all_features_enabled", "true")
        setTimeout(() => {
          setShowCard(false)
          onAllEnabled()
        }, 2000)
      }
    } catch (error) {
      console.error("Error enabling features:", error)
    } finally {
      setIsEnabling(false)
    }
  }

  const allEnabled = status.gps && status.motion && status.notification

  return (
    <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 mb-6">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 p-3">
            <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Enable All Safety Features
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Grant permissions for GPS tracking, crash detection sensors, and emergency alerts to unlock full protection.
            </p>

            {isEnabling && (
              <div className="space-y-2 mb-4">
                <PermissionStatus label="GPS Location" granted={status.gps} />
                <PermissionStatus label="Motion Sensors" granted={status.motion} />
                <PermissionStatus label="Notifications" granted={status.notification} />
              </div>
            )}

            {allEnabled ? (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-5 w-5" />
                <span>All features enabled! You're fully protected.</span>
              </div>
            ) : (
              <Button
                onClick={enableAllFeatures}
                disabled={isEnabling}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isEnabling ? "Enabling..." : "Enable All Features"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PermissionStatus({ label, granted }: { label: string; granted: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {granted ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <AlertCircle className="h-4 w-4 text-slate-400" />
      )}
      <span className={granted ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}>
        {label}
      </span>
    </div>
  )
}
