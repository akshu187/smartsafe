import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("email")

    if (!userEmail) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.json({ trips: [] })
    }

    // Fetch user's trips with events (optimized - only necessary fields)
    const trips = await prisma.trip.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        distance: true,
        duration: true,
        avgSpeed: true,
        maxSpeed: true,
        safetyScore: true,
        harshBrakeCount: true,
        harshAccelCount: true,
        speedingCount: true,
        riskZonesEncountered: true,
        weatherCondition: true,
        isActive: true,
        events: {
          select: {
            eventType: true,
            timestamp: true,
            severity: true,
            details: true,
          },
          orderBy: { timestamp: "desc" },
          take: 5, // Last 5 events per trip
        },
      },
      orderBy: { startTime: "desc" },
      take: 20, // Last 20 trips
    })

    const formattedTrips = trips.map((trip) => ({
      id: trip.id,
      startTime: trip.startTime.toISOString(),
      endTime: trip.endTime?.toISOString() || null,
      distance: trip.distance,
      duration: trip.duration,
      avgSpeed: trip.avgSpeed,
      maxSpeed: trip.maxSpeed,
      safetyScore: trip.safetyScore,
      harshBrakeCount: trip.harshBrakeCount,
      harshAccelCount: trip.harshAccelCount,
      speedingCount: trip.speedingCount,
      riskZonesEncountered: trip.riskZonesEncountered,
      weatherCondition: trip.weatherCondition,
      isActive: trip.isActive,
      events: trip.events.map((event) => ({
        type: event.eventType,
        timestamp: event.timestamp.toISOString(),
        severity: event.severity,
        details: event.details,
      })),
    }))

    const response = NextResponse.json({ trips: formattedTrips })
    
    // Cache for 30 seconds (trips update frequently during active trip)
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
    
    return response
  } catch (error) {
    console.error("Error fetching trips:", error)
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 })
  }
}
