import { useEffect, useState, useRef } from "react"

export type POIType = "school" | "hospital" | "religious" | "market"

export interface POI {
  id: string
  type: POIType
  name: string
  lat: number
  lng: number
  distance: number // in meters
}

interface POIAlert {
  type: POIType
  name: string
  message: string
  speedLimit?: number
  timestamp: number
}

export function usePOIDetection(
  position: { lat: number; lng: number } | null,
  isEnabled: boolean,
  onAlert?: (alert: POIAlert) => void
) {
  const [nearbyPOIs, setNearbyPOIs] = useState<POI[]>([])
  const [currentPOI, setCurrentPOI] = useState<POI | null>(null)
  const lastAlertRef = useRef<{ type: POIType; name: string; time: number } | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const onAlertRef = useRef(onAlert)

  // Update ref when callback changes
  useEffect(() => {
    onAlertRef.current = onAlert
  }, [onAlert])

  useEffect(() => {
    if (!isEnabled || !position) {
      setNearbyPOIs([])
      setCurrentPOI(null)
      return
    }

    const checkNearbyPOIs = async () => {
      try {
        // Use Overpass API to find nearby POIs
        const radius = 500 // 500 meters
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"="school"](around:${radius},${position.lat},${position.lng});
            node["amenity"="hospital"](around:${radius},${position.lat},${position.lng});
            node["amenity"="clinic"](around:${radius},${position.lat},${position.lng});
            node["amenity"="place_of_worship"](around:${radius},${position.lat},${position.lng});
            node["shop"="mall"](around:${radius},${position.lat},${position.lng});
            way["amenity"="school"](around:${radius},${position.lat},${position.lng});
            way["amenity"="hospital"](around:${radius},${position.lat},${position.lng});
            way["amenity"="place_of_worship"](around:${radius},${position.lat},${position.lng});
          );
          out center;
        `

        const response = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
        )

        if (!response.ok) {
          console.error("Overpass API error:", response.status)
          return
        }

        const data = await response.json()
        const pois: POI[] = []

        data.elements.forEach((element: any) => {
          const lat = element.lat || element.center?.lat
          const lng = element.lon || element.center?.lon

          if (!lat || !lng) return

          const distance = haversineDistance(position.lat, position.lng, lat, lng)

          let type: POIType = "market"
          if (element.tags.amenity === "school") type = "school"
          else if (element.tags.amenity === "hospital" || element.tags.amenity === "clinic")
            type = "hospital"
          else if (element.tags.amenity === "place_of_worship") type = "religious"

          const name =
            element.tags.name ||
            element.tags["name:en"] ||
            `${type.charAt(0).toUpperCase() + type.slice(1)}`

          pois.push({
            id: element.id.toString(),
            type,
            name,
            lat,
            lng,
            distance,
          })
        })

        // Sort by distance
        pois.sort((a, b) => a.distance - b.distance)
        setNearbyPOIs(pois)

        // Check if we're near any POI (within 200m)
        const nearestPOI = pois.find((poi) => poi.distance <= 200)

        if (nearestPOI) {
          setCurrentPOI(nearestPOI)

          // Check if we should alert (don't repeat same alert within 2 minutes)
          const now = Date.now()
          const lastAlert = lastAlertRef.current

          if (
            !lastAlert ||
            lastAlert.type !== nearestPOI.type ||
            lastAlert.name !== nearestPOI.name ||
            now - lastAlert.time > 2 * 60 * 1000
          ) {
            // Trigger alert
            const alert = createAlert(nearestPOI)
            if (alert && onAlertRef.current) {
              onAlertRef.current(alert)
              lastAlertRef.current = {
                type: nearestPOI.type,
                name: nearestPOI.name,
                time: now,
              }
            }
          }
        } else {
          setCurrentPOI(null)
        }
      } catch (error) {
        console.error("Failed to fetch POIs:", error)
      }
    }

    // Check immediately
    checkNearbyPOIs()

    // Check every 10 seconds
    checkIntervalRef.current = setInterval(checkNearbyPOIs, 10000)

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [position?.lat, position?.lng, isEnabled]) // Removed onAlert from dependencies

  return {
    nearbyPOIs,
    currentPOI,
  }
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

function createAlert(poi: POI): POIAlert | null {
  switch (poi.type) {
    case "school":
      return {
        type: "school",
        name: poi.name,
        message: `School Zone ahead: ${poi.name}. Reduce speed to 30 km/h. Watch for children crossing.`,
        speedLimit: 30,
        timestamp: Date.now(),
      }

    case "hospital":
      return {
        type: "hospital",
        name: poi.name,
        message: `Hospital Zone: ${poi.name}. No horn. Reduce speed to 20 km/h. Emergency vehicles may be present.`,
        speedLimit: 20,
        timestamp: Date.now(),
      }

    case "religious":
      return {
        type: "religious",
        name: poi.name,
        message: `Religious place ahead: ${poi.name}. Drive slowly and avoid horn. Watch for pedestrians.`,
        speedLimit: 20,
        timestamp: Date.now(),
      }

    case "market":
      return {
        type: "market",
        name: poi.name,
        message: `Market area: ${poi.name}. Heavy pedestrian traffic. Drive carefully.`,
        speedLimit: 30,
        timestamp: Date.now(),
      }

    default:
      return null
  }
}
