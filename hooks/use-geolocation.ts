import * as React from "react"

interface GeoPosition {
  lat: number
  lng: number
  accuracy: number
  speed: number | null // meters per second (from GPS chip)
  heading: number | null // degrees (direction of travel)
  altitude: number | null // meters
}

interface UseGeolocationState {
  position: GeoPosition | null
  error: string | null
  watching: boolean
}

export function useGeolocation() {
  const [state, setState] = React.useState<UseGeolocationState>({
    position: null,
    error: null,
    watching: false,
  })

  const watchIdRef = React.useRef<number | null>(null)

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
        setState({
          position: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed, // Direct from GPS chip (m/s)
            heading: pos.coords.heading, // Direction of travel
            altitude: pos.coords.altitude, // Elevation
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

