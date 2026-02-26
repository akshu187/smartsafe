import { useEffect, useState, useRef } from "react"

interface FatigueAlert {
  level: "warning" | "critical"
  message: string
  timestamp: number
}

export function useFatigueDetection(
  isEnabled: boolean,
  tripStartTime: number | null,
  onAlert?: (alert: FatigueAlert) => void
) {
  const [drivingMinutes, setDrivingMinutes] = useState(0)
  const [lastAlertTime, setLastAlertTime] = useState(0)
  const onAlertRef = useRef(onAlert)

  // Update ref when callback changes
  useEffect(() => {
    onAlertRef.current = onAlert
  }, [onAlert])

  useEffect(() => {
    if (!isEnabled || !tripStartTime) {
      setDrivingMinutes(0)
      return
    }

    const interval = setInterval(() => {
      const now = Date.now()
      const minutes = Math.floor((now - tripStartTime) / 60000)
      setDrivingMinutes(minutes)

      const timeSinceLastAlert = now - lastAlertTime

      // Check if it's night time (10 PM to 6 AM)
      const hour = new Date().getHours()
      const isNightTime = hour >= 22 || hour <= 6

      // Night time: Alert every 1 hour
      // Day time: Alert every 2 hours
      const alertInterval = isNightTime ? 60 : 120

      // Warning at 2 hours (or 1 hour at night)
      if (minutes >= alertInterval && minutes % 30 === 0 && timeSinceLastAlert > 30 * 60 * 1000) {
        const alert: FatigueAlert = {
          level: "warning",
          message: `You have been driving for ${Math.floor(minutes / 60)} hours. Consider taking a break.`,
          timestamp: now,
        }
        setLastAlertTime(now)
        if (onAlertRef.current) onAlertRef.current(alert)
      }

      // Critical at 4 hours
      if (minutes >= 240 && timeSinceLastAlert > 30 * 60 * 1000) {
        const alert: FatigueAlert = {
          level: "critical",
          message: "MANDATORY REST - You have been driving for 4 hours. Take a 15-minute break immediately.",
          timestamp: now,
        }
        setLastAlertTime(now)
        if (onAlertRef.current) onAlertRef.current(alert)
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [isEnabled, tripStartTime, lastAlertTime]) // Removed onAlert from dependencies

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getStatus = () => {
    if (drivingMinutes < 120) return { level: "safe", color: "green" }
    if (drivingMinutes < 240) return { level: "warning", color: "yellow" }
    return { level: "critical", color: "red" }
  }

  return {
    drivingMinutes,
    formattedDuration: formatDuration(drivingMinutes),
    status: getStatus(),
  }
}
