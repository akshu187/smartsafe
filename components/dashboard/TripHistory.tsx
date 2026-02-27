"use client"

import React from "react"
import { Clock, MapPin, Gauge, AlertTriangle, TrendingUp, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TripEvent {
  type: string
  timestamp: string
  severity: string
  details: string | null
}

interface Trip {
  id: number
  startTime: string
  endTime: string | null
  distance: number
  duration: number
  avgSpeed: number
  maxSpeed: number
  safetyScore: number
  harshBrakeCount: number
  harshAccelCount: number
  speedingCount: number
  riskZonesEncountered: number
  weatherCondition: string | null
  isActive: boolean
  events: TripEvent[]
}

export function TripHistory() {
  const [trips, setTrips] = React.useState<Trip[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchTrips = async () => {
      try {
        const email = localStorage.getItem("smartsafe_user_email")
        if (!email) return

        const res = await fetch(`/api/trips?email=${encodeURIComponent(email)}`)
        if (res.ok) {
          const data = await res.json()
          setTrips(data.trips || [])
        }
      } catch (error) {
        console.error("Failed to fetch trips:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [])

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getSafetyColor = (score: number) => {
    if (score >= 90) return "text-emerald-500"
    if (score >= 70) return "text-yellow-500"
    return "text-red-500"
  }

  const getSafetyBadge = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 70) return "Good"
    if (score >= 50) return "Fair"
    return "Poor"
  }

  if (loading) {
    return (
      <Card className="border-slate-800 bg-slate-900">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (trips.length === 0) {
    return (
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white">Trip History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No trips recorded yet</p>
            <p className="text-sm mt-1">Start a trip to see your history here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-800 bg-slate-900">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-400" />
          Trip History
          <Badge variant="outline" className="ml-auto">
            {trips.length} trips
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-300">
                    {formatDate(trip.startTime)}
                  </span>
                  {trip.isActive && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>{trip.distance.toFixed(1)} km</span>
                  <span>{formatDuration(trip.duration)}</span>
                  <span>{trip.avgSpeed.toFixed(0)} km/h avg</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getSafetyColor(trip.safetyScore)}`}>
                  {trip.safetyScore}
                </div>
                <div className="text-xs text-slate-400">{getSafetyBadge(trip.safetyScore)}</div>
              </div>
            </div>

            {/* Trip Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div className="text-center p-2 rounded-lg bg-slate-900/50">
                <div className="text-xs text-slate-400">Max Speed</div>
                <div className="text-sm font-semibold text-white">
                  {trip.maxSpeed.toFixed(0)}
                </div>
              </div>
              <div className="text-center p-2 rounded-lg bg-slate-900/50">
                <div className="text-xs text-slate-400">Harsh Brake</div>
                <div className="text-sm font-semibold text-yellow-400">
                  {trip.harshBrakeCount}
                </div>
              </div>
              <div className="text-center p-2 rounded-lg bg-slate-900/50">
                <div className="text-xs text-slate-400">Speeding</div>
                <div className="text-sm font-semibold text-red-400">
                  {trip.speedingCount}
                </div>
              </div>
              <div className="text-center p-2 rounded-lg bg-slate-900/50">
                <div className="text-xs text-slate-400">Risk Zones</div>
                <div className="text-sm font-semibold text-orange-400">
                  {trip.riskZonesEncountered}
                </div>
              </div>
            </div>

            {/* Recent Events */}
            {trip.events.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-slate-400 mb-2">Recent Events:</div>
                {trip.events.slice(0, 3).map((event, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/30 rounded px-2 py-1"
                  >
                    <AlertTriangle className="h-3 w-3 text-yellow-400" />
                    <span className="capitalize">{event.type.replace(/_/g, " ")}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
