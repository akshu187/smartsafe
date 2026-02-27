import * as React from "react"

interface GeoPosition {
  lat: number
  lng: number
  accuracy: number
  speed: number | null // meters per second (from GPS chip)
  heading: number | null // degrees (direction of travel)
  altitude: number | null // meters
  hybridSpeed: number | null // km/h - hybrid calculated speed (more accurate)
}

interface UseGeolocationState {
  position: GeoPosition | null
  error: string | null
  watching: boolean
}

interface PositionHistory {
  lat: number
  lng: number
  timestamp: number
  gpsSpeed: number | null // m/s from GPS chip
}

// Haversine distance formula to calculate distance between two GPS coordinates
function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371 // Earth's radius in km
  const toRad = (v: number) => (v * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function useGeolocation() {
  const [state, setState] = React.useState<UseGeolocationState>({
    position: null,
    error: null,
    watching: false,
  })

  const watchIdRef = React.useRef<number | null>(null)
  const positionHistoryRef = React.useRef<PositionHistory[]>([])
  const speedHistoryRef = React.useRef<number[]>([])

  const start = React.useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported in this browser.",
      }))
      return
    }

    if (watchIdRef.current != null) return

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now()
        const currentLat = pos.coords.latitude
        const currentLng = pos.coords.longitude
        const gpsSpeed = pos.coords.speed // m/s from GPS chip (can be null)

        // Add to position history
        positionHistoryRef.current.push({
          lat: currentLat,
          lng: currentLng,
          timestamp: now,
          gpsSpeed,
        })

        // Keep only last 5 positions for moving average
        if (positionHistoryRef.current.length > 5) {
          positionHistoryRef.current.shift()
        }

        // Calculate hybrid speed
        let hybridSpeedKmh: number | null = null

        if (positionHistoryRef.current.length >= 2) {
          const history = positionHistoryRef.current
          const prev = history[history.length - 2]
          const current = history[history.length - 1]

          const timeDiffSeconds = (current.timestamp - prev.timestamp) / 1000

          // Only calculate if at least 1 second has passed
          if (timeDiffSeconds >= 1) {
            // 1. Calculate speed from position change (60% weight)
            const distanceKm = haversineDistanceKm(prev.lat, prev.lng, current.lat, current.lng)
            const calculatedSpeedKmh = (distanceKm / timeDiffSeconds) * 3600

            // 2. Get GPS speed (40% weight)
            let gpsSpeedKmh = 0
            if (current.gpsSpeed !== null && current.gpsSpeed >= 0) {
              gpsSpeedKmh = current.gpsSpeed * 3.6 // Convert m/s to km/h
            }

            // 3. Combine with weighted average (60% calculated, 40% GPS)
            let combinedSpeed = calculatedSpeedKmh * 0.6 + gpsSpeedKmh * 0.4

            // 4. Outlier rejection - reject if change > 50 km/h in 1 second
            if (speedHistoryRef.current.length > 0) {
              const lastSpeed = speedHistoryRef.current[speedHistoryRef.current.length - 1]
              const speedChange = Math.abs(combinedSpeed - lastSpeed)
              
              if (speedChange > 50) {
                // Outlier detected - use previous speed instead
                combinedSpeed = lastSpeed
              }
            }

            // 5. Add to speed history for moving average
            speedHistoryRef.current.push(combinedSpeed)
            if (speedHistoryRef.current.length > 5) {
              speedHistoryRef.current.shift()
            }

            // 6. Calculate moving average of last 5 readings
            const avgSpeed = speedHistoryRef.current.reduce((sum, s) => sum + s, 0) / speedHistoryRef.current.length

            // 7. Cap at realistic maximum (200 km/h)
            hybridSpeedKmh = Math.min(avgSpeed, 200)

            // 8. Set to 0 if very low (< 1 km/h) to avoid jitter when stationary
            if (hybridSpeedKmh < 1) {
              hybridSpeedKmh = 0
            }
          }
        }

        setState({
          position: {
            lat: currentLat,
            lng: currentLng,
            accuracy: pos.coords.accuracy,
            speed: gpsSpeed, // Original GPS chip speed (m/s)
            heading: pos.coords.heading,
            altitude: pos.coords.altitude,
            hybridSpeed: hybridSpeedKmh, // New hybrid speed (km/h)
          },
          error: null,
          watching: true,
        })
      },
      (err) => {
        setState((prev) => ({
          ...prev,
          error: err.message || "Unable to read GPS location.",
          watching: false,
        }))
        watchIdRef.current = null
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    )

    watchIdRef.current = id
    setState((prev) => ({ ...prev, watching: true }))
  }, [])

  const stop = React.useCallback(() => {
    if (typeof window === "undefined") return
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    // Clear history when stopping
    positionHistoryRef.current = []
    speedHistoryRef.current = []
    setState((prev) => ({ ...prev, watching: false }))
  }, [])

  React.useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return {
    position: state.position,
    error: state.error,
    watching: state.watching,
    start,
    stop,
  }
}

