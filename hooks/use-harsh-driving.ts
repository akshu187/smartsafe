import { useEffect, useRef, useState } from "react"

interface HarshEvent {
  type: "harsh_brake" | "harsh_accel" | "speeding"
  timestamp: number
  position: { lat: number; lng: number } | null
  value: number // acceleration in m/s² or speed in km/h
  severity: "LOW" | "MEDIUM" | "HIGH"
}

interface HarshDrivingStats {
  harshBrakeCount: number
  harshAccelCount: number
  speedingCount: number
  events: HarshEvent[]
}

export function useHarshDriving(
  isEnabled: boolean,
  currentSpeed: number,
  position: { lat: number; lng: number } | null,
  speedLimit: number = 60,
  onHarshEvent?: (event: HarshEvent) => void
) {
  const [stats, setStats] = useState<HarshDrivingStats>({
    harshBrakeCount: 0,
    harshAccelCount: 0,
    speedingCount: 0,
    events: [],
  })

  const prevSpeed = useRef(0)
  const prevTime = useRef(Date.now())
  const lastSpeedingAlert = useRef(0)

  useEffect(() => {
    if (!isEnabled) return

    const now = Date.now()
    const timeDiff = (now - prevTime.current) / 1000 // seconds

    if (timeDiff < 1) return // Check every second

    // Only detect harsh events if moving (speed > 5 km/h)
    if (currentSpeed < 5) {
      prevSpeed.current = currentSpeed
      prevTime.current = now
      return
    }

    const speedDiff = currentSpeed - prevSpeed.current // km/h

    // Convert to m/s²
    const acceleration = (speedDiff / 3.6) / timeDiff

    let event: HarshEvent | null = null

    // Harsh braking detection
    if (acceleration < -4) {
      // Very harsh brake
      event = {
        type: "harsh_brake",
        timestamp: now,
        position,
        value: acceleration,
        severity: "HIGH",
      }
      setStats((prev) => ({
        ...prev,
        harshBrakeCount: prev.harshBrakeCount + 1,
        events: [...prev.events, event!],
      }))
    } else if (acceleration < -3) {
      // Moderate harsh brake
      event = {
        type: "harsh_brake",
        timestamp: now,
        position,
        value: acceleration,
        severity: "MEDIUM",
      }
      setStats((prev) => ({
        ...prev,
        harshBrakeCount: prev.harshBrakeCount + 1,
        events: [...prev.events, event!],
      }))
    }

    // Rapid acceleration detection
    if (acceleration > 3) {
      // Very rapid acceleration
      event = {
        type: "harsh_accel",
        timestamp: now,
        position,
        value: acceleration,
        severity: "HIGH",
      }
      setStats((prev) => ({
        ...prev,
        harshAccelCount: prev.harshAccelCount + 1,
        events: [...prev.events, event!],
      }))
    } else if (acceleration > 2.5) {
      // Moderate rapid acceleration
      event = {
        type: "harsh_accel",
        timestamp: now,
        position,
        value: acceleration,
        severity: "MEDIUM",
      }
      setStats((prev) => ({
        ...prev,
        harshAccelCount: prev.harshAccelCount + 1,
        events: [...prev.events, event!],
      }))
    }

    // Speeding detection (check every 10 seconds to avoid spam)
    if (currentSpeed > speedLimit + 10 && now - lastSpeedingAlert.current > 10000) {
      const overspeed = currentSpeed - speedLimit
      event = {
        type: "speeding",
        timestamp: now,
        position,
        value: currentSpeed,
        severity: overspeed > 30 ? "HIGH" : overspeed > 20 ? "MEDIUM" : "LOW",
      }
      setStats((prev) => ({
        ...prev,
        speedingCount: prev.speedingCount + 1,
        events: [...prev.events, event!],
      }))
      lastSpeedingAlert.current = now
    }

    if (event && onHarshEvent) {
      onHarshEvent(event)
    }

    prevSpeed.current = currentSpeed
    prevTime.current = now
  }, [isEnabled, currentSpeed, position, speedLimit, onHarshEvent])

  const resetStats = () => {
    setStats({
      harshBrakeCount: 0,
      harshAccelCount: 0,
      speedingCount: 0,
      events: [],
    })
  }

  return { stats, resetStats }
}
