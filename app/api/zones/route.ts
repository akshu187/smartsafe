import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371 // km
  const toRad = (v: number) => (v * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get("lat") || "0")
    const lng = parseFloat(searchParams.get("lng") || "0")
    const radiusKm = parseFloat(searchParams.get("radius") || "50") // default 50km radius

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude required" }, { status: 400 })
    }

    // Fetch all active zones from database
    const allZones = await prisma.accidentZone.findMany({
      where: { isActive: true },
    })

    // Filter zones within radius
    const nearbyZones = allZones
      .map((zone) => ({
        id: zone.zoneId,
        name: zone.name,
        lat: zone.lat,
        lng: zone.lng,
        radiusMeters: zone.radiusMeters,
        severity: zone.severity as "LOW" | "MEDIUM" | "HIGH",
        message: zone.message,
        city: zone.city,
        state: zone.state,
        distance: haversineDistanceKm(lat, lng, zone.lat, zone.lng),
      }))
      .filter((zone) => zone.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)

    const response = NextResponse.json({
      zones: nearbyZones,
      count: nearbyZones.length,
      userLocation: { lat, lng },
      searchRadius: radiusKm,
    })
    
    // Cache for 10 minutes (zones don't change frequently)
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
    
    return response
  } catch (error) {
    console.error("Error fetching zones:", error)
    return NextResponse.json({ error: "Failed to fetch zones" }, { status: 500 })
  }
}
