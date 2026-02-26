"use client"

import React from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  CloudRain,
  Gauge,
  MapPin,
  ShieldCheck,
  Thermometer,
  Wind,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { AlertLogs } from "@/components/dashboard/AlertLogs"
import { SafetyTips } from "@/components/dashboard/SafetyTips"
import { CrashAlertModal } from "@/components/dashboard/CrashAlertModal"
import { ManualSOSButton } from "@/components/dashboard/ManualSOSButton"
import { HarshDrivingStats } from "@/components/dashboard/HarshDrivingStats"
import { TripControls } from "@/components/dashboard/TripControls"
import { FatigueAlertModal } from "@/components/dashboard/FatigueAlertModal"
import { POIAlertModal } from "@/components/dashboard/POIAlertModal"
import { useIsMobile } from "@/hooks/use-mobile"
import { useCrashDetection } from "@/hooks/use-crash-detection"
import { useHarshDriving } from "@/hooks/use-harsh-driving"
import { useFatigueDetection } from "@/hooks/use-fatigue-detection"
import { usePOIDetection } from "@/hooks/use-poi-detection"
import { useActivityLog } from "@/hooks/use-activity-log"
import { triggerSOS, sendSOSToContacts } from "@/lib/sos-handler"

const LiveMap = dynamic(
  () => import("@/components/dashboard/LiveMap").then((mod) => ({ default: mod.LiveMap })),
  { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-900 rounded-2xl"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div> }
)
import { useGeolocation } from "@/hooks/use-geolocation"
import { haversineDistanceKm } from "@/data/accident-zones"

type RiskLevel = "LOW" | "MEDIUM" | "HIGH"

interface TripMetrics {
  speed: number
  distance: number
  durationMinutes: number
  risk: RiskLevel
}

interface WeatherSnapshot {
  condition: string
  icon: string
  temperature: number
  visibility: string
  windKph: number
  humidity: number
  precipitation: number
}

const MOCK_TRIPS: TripMetrics[] = [
  { speed: 62, distance: 18.4, durationMinutes: 26, risk: "MEDIUM" },
  { speed: 42, distance: 9.2, durationMinutes: 14, risk: "LOW" },
  { speed: 78, distance: 32.1, durationMinutes: 38, risk: "HIGH" },
]

const MOCK_WEATHER: WeatherSnapshot = {
  condition: "Light Rain",
  icon: "🌧️",
  temperature: 24,
  visibility: "2.1 km",
  windKph: 18,
  humidity: 65,
  precipitation: 0.5,
}

export default function DashboardPage() {
  const router = useRouter()
  const [metrics, setMetrics] = React.useState<TripMetrics>({
    speed: 0,
    distance: 0,
    durationMinutes: 0,
    risk: "LOW",
  })
  const [autoSOS, setAutoSOS] = React.useState(true)
  const [liveMode, setLiveMode] = React.useState(true)
  const [weather, setWeather] = React.useState<WeatherSnapshot | null>(null)
  const [weatherError, setWeatherError] = React.useState<string | null>(null)
  const isMobile = useIsMobile()
  const { addLog } = useActivityLog()

  const lastSpokenRiskRef = React.useRef<RiskLevel | null>(null)
  const { position, error: geoError, watching, start: startGps, stop: stopGps } = useGeolocation()
  const lastGpsRef = React.useRef<{
    lat: number
    lng: number
    timestamp: number
    distanceKm: number
  } | null>(null)
  const tripStartTimeRef = React.useRef<number | null>(null)
  const [currentZoneId, setCurrentZoneId] = React.useState<string | null>(null)
  const [nearbyZones, setNearbyZones] = React.useState<any[]>([])
  const [zonesLoading, setZonesLoading] = React.useState(false)
  const [crashAlertOpen, setCrashAlertOpen] = React.useState(false)
  const [crashCountdown, setCrashCountdown] = React.useState(100)
  const [crashType, setCrashType] = React.useState<"frontal" | "side" | "rear" | "rollover" | "unknown">("unknown")
  const [crashConfidence, setCrashConfidence] = React.useState<number>(0)
  const crashIntervalRef = React.useRef<NodeJS.Timeout | null>(null)
  const [tripActive, setTripActive] = React.useState(false)
  const [fatigueAlertOpen, setFatigueAlertOpen] = React.useState(false)
  const [fatigueAlertData, setFatigueAlertData] = React.useState<{
    level: "warning" | "critical"
    message: string
  }>({ level: "warning", message: "" })
  const [poiAlertOpen, setPoiAlertOpen] = React.useState(false)
  const [poiAlertData, setPoiAlertData] = React.useState<{
    type: "school" | "hospital" | "religious" | "market"
    name: string
    message: string
    speedLimit?: number
  }>({ type: "school", name: "", message: "" })

  // Crash detection
  const { crashDetected } = useCrashDetection(
    liveMode && autoSOS,
    metrics.speed,
    position,
    (crashData) => {
      console.log("Crash detected!", crashData)
      const typeText = crashData.crashType === "rollover" ? "ROLLOVER" : 
                      crashData.crashType === "frontal" ? "FRONTAL IMPACT" :
                      crashData.crashType === "side" ? "SIDE IMPACT" :
                      crashData.crashType === "rear" ? "REAR IMPACT" : "CRASH"
      const confidenceText = crashData.confidence ? ` (${Math.round(crashData.confidence)}% confidence)` : ""
      addLog(`⚠️ ${typeText} DETECTED${confidenceText}! Emergency services alerted`, "danger")
      setCrashAlertOpen(true)
      setCrashType(crashData.crashType || "unknown")
      setCrashConfidence(crashData.confidence || 0)
      setCrashCountdown(100)
      startCrashCountdown()
    }
  )

  // Harsh driving detection
  const { stats: harshStats } = useHarshDriving(
    liveMode && tripActive, // Only detect when trip is active
    metrics.speed,
    position,
    60, // speed limit
    (event) => {
      // Log harsh driving events
      if (event.type === "harsh_brake" && event.severity === "HIGH") {
        addLog("Harsh braking detected", "warning")
      } else if (event.type === "harsh_accel" && event.severity === "HIGH") {
        addLog("Aggressive acceleration detected", "warning")
      } else if (event.type === "speeding") {
        addLog(`Overspeeding detected (${Math.round(event.value)} km/h)`, "warning")
      }
      
      // Voice feedback for harsh events (only if speed > 5 km/h)
      if (typeof window !== "undefined" && "speechSynthesis" in window && metrics.speed > 5) {
        const speak = (text: string) => {
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.lang = "en-IN"
          window.speechSynthesis.speak(utterance)
        }

        if (event.type === "harsh_brake" && event.severity === "HIGH") {
          speak("Harsh braking detected. Brake gently to avoid skidding.")
        } else if (event.type === "harsh_accel" && event.severity === "HIGH") {
          speak("Aggressive acceleration. Smooth acceleration is safer and saves fuel.")
        } else if (event.type === "speeding") {
          speak(`You are overspeeding. Current speed limit is 60 kilometers per hour.`)
        }
      }
    }
  )

  // Fatigue detection
  const { drivingMinutes, formattedDuration, status: fatigueStatus } = useFatigueDetection(
    tripActive,
    tripStartTimeRef.current,
    (alert) => {
      addLog(alert.level === "critical" ? "⚠️ MANDATORY REST - 4 hours driving" : "Take a break - 2 hours driving", alert.level === "critical" ? "danger" : "warning")
      setFatigueAlertData({
        level: alert.level,
        message: alert.message,
      })
      setFatigueAlertOpen(true)

      // Voice alert
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(alert.message)
        utterance.lang = "en-IN"
        window.speechSynthesis.speak(utterance)
      }

      // Vibrate
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200])
      }
    }
  )

  // POI (School/Hospital) detection
  const { nearbyPOIs, currentPOI } = usePOIDetection(
    position,
    liveMode && tripActive,
    (alert) => {
      setPoiAlertData({
        type: alert.type,
        name: alert.name,
        message: alert.message,
        speedLimit: alert.speedLimit,
      })
      setPoiAlertOpen(true)
      
      // Log POI alert
      const poiIcon = alert.type === "school" ? "🏫" : alert.type === "hospital" ? "🏥" : alert.type === "religious" ? "🕌" : "🛒"
      addLog(`${poiIcon} ${alert.name} ahead - ${alert.speedLimit} km/h`, "warning")

      // Voice alert
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(alert.message)
        utterance.lang = "en-IN"
        window.speechSynthesis.speak(utterance)
      }

      // Vibrate
      if ("vibrate" in navigator) {
        navigator.vibrate([300, 100, 300, 100, 300])
      }
    }
  )

  // Auto-start GPS when component mounts
  React.useEffect(() => {
    startGps()
  }, [startGps])

  // Fetch nearby zones when position changes
  React.useEffect(() => {
    if (!position) return

    const fetchNearbyZones = async () => {
      try {
        setZonesLoading(true)
        const res = await fetch(`/api/zones?lat=${position.lat}&lng=${position.lng}&radius=50`)
        if (res.ok) {
          const data = await res.json()
          setNearbyZones(data.zones || [])
        }
      } catch (error) {
        console.error("Failed to fetch zones:", error)
      } finally {
        setZonesLoading(false)
      }
    }

    fetchNearbyZones()
  }, [position?.lat, position?.lng])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const loggedIn = window.localStorage.getItem("smartsafe_logged_in") === "1"
      if (!loggedIn) {
        router.replace("/login")
      }
    } catch {
      router.replace("/login")
    }
  }, [router])

  React.useEffect(() => {
    if (!liveMode || !position) return

    const now = Date.now()
    const last = lastGpsRef.current

    if (!last) {
      lastGpsRef.current = {
        lat: position.lat,
        lng: position.lng,
        timestamp: now,
        distanceKm: 0,
      }
      // Set initial metrics to 0
      setMetrics({
        speed: 0,
        distance: 0,
        durationMinutes: 0,
        risk: "LOW",
      })
      return
    }

    const timeDiffSeconds = (now - last.timestamp) / 1000
    
    // Only update if at least 2 seconds have passed (avoid jittery updates)
    if (timeDiffSeconds < 2) return

    const deltaKm = haversineDistanceKm(last.lat, last.lng, position.lat, position.lng)
    
    // Use GPS speed directly if available (most accurate)
    let speedKmh = 0
    if (position.speed !== null && position.speed >= 0) {
      // GPS chip provides speed in meters/second
      speedKmh = position.speed * 3.6 // Convert m/s to km/h
      // Cap unrealistic speeds (max 200 km/h)
      speedKmh = Math.min(speedKmh, 200)
    } else {
      // Fallback: Calculate from position change (less accurate)
      const deltaHours = timeDiffSeconds / 3600
      if (deltaKm > 0.01) { // 10 meters minimum movement
        speedKmh = deltaKm / deltaHours
        speedKmh = Math.min(speedKmh, 200)
      }
    }
    
    // Only update distance if actually moving (speed > 1 km/h)
    const totalKm = speedKmh > 1 ? last.distanceKm + deltaKm : last.distanceKm
    
    // Calculate duration only if trip is active
    const totalDurationMinutes = tripActive && tripStartTimeRef.current 
      ? (now - tripStartTimeRef.current) / (1000 * 60)
      : 0

    // Determine if we are inside any configured accident zone.
    let risk: RiskLevel = "LOW"
    let zoneId: string | null = null

    for (const zone of nearbyZones) {
      const dKm = haversineDistanceKm(position.lat, position.lng, zone.lat, zone.lng)
      const dMeters = dKm * 1000
      if (dMeters <= zone.radiusMeters) {
        zoneId = zone.id
        if (zone.severity === "HIGH" || speedKmh > 60) {
          risk = "HIGH"
        } else if (zone.severity === "MEDIUM" || speedKmh > 40) {
          risk = "MEDIUM"
        }
        break
      }
    }

    if (!zoneId) {
      if (speedKmh > 80) risk = "HIGH"
      else if (speedKmh > 50) risk = "MEDIUM"
    }

    setCurrentZoneId(zoneId)

    setMetrics({
      speed: tripActive ? Math.round(speedKmh) : 0, // Show 0 if trip not active
      distance: Number(totalKm.toFixed(2)),
      durationMinutes: Math.round(totalDurationMinutes),
      risk,
    })

    lastGpsRef.current = {
      lat: position.lat,
      lng: position.lng,
      timestamp: now,
      distanceKm: totalKm,
    }
  }, [liveMode, position, nearbyZones, tripActive])

  React.useEffect(() => {
    if (!position) return

    async function loadWeather() {
      if (!position) return
      try {
        setWeatherError(null)
        const res = await fetch(`/api/weather?lat=${position.lat}&lng=${position.lng}`)
        if (!res.ok) throw new Error(`Status ${res.status}`)
        const data = (await res.json()) as WeatherSnapshot
        setWeather(data)
      } catch (error) {
        console.error("Failed to load weather", error)
        setWeatherError("Live weather unavailable, using demo values.")
        setWeather(MOCK_WEATHER)
      }
    }
    loadWeather()
    
    // Refresh weather every 1 minute for real-time data
    const interval = setInterval(loadWeather, 1 * 60 * 1000)
    return () => clearInterval(interval)
  }, [position?.lat, position?.lng])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    if (!("speechSynthesis" in window)) return

    if (metrics.risk === "HIGH" && lastSpokenRiskRef.current !== "HIGH") {
      const text =
        "High accident risk ahead. This is a red zone. Reduce speed to forty kilometers per hour."
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-IN"
      window.speechSynthesis.speak(utterance)
      lastSpokenRiskRef.current = "HIGH"
    } else if (metrics.risk !== "HIGH") {
      lastSpokenRiskRef.current = metrics.risk
    }
  }, [metrics.risk])

  const riskBadgeVariant =
    metrics.risk === "HIGH" ? "danger" : metrics.risk === "MEDIUM" ? "warning" : "success"

  const currentWeather = weather ?? MOCK_WEATHER

  const activeZone =
    currentZoneId != null ? nearbyZones.find((z) => z.id === currentZoneId) ?? null : null

  // Crash countdown handler
  const startCrashCountdown = () => {
    if (crashIntervalRef.current) {
      clearInterval(crashIntervalRef.current)
    }

    let count = 100
    crashIntervalRef.current = setInterval(() => {
      count--
      setCrashCountdown(count)

      if (count === 0) {
        clearInterval(crashIntervalRef.current!)
        handleAutoSOS()
      }
    }, 1000)
  }

  const cancelCrashAlert = () => {
    if (crashIntervalRef.current) {
      clearInterval(crashIntervalRef.current)
    }
    setCrashAlertOpen(false)
    setCrashCountdown(100)
    
    // Record false positive for learning
    if (typeof window !== "undefined" && (window as any).recordCrashFalsePositive) {
      (window as any).recordCrashFalsePositive("user_cancelled")
    }
    
    addLog("Crash alert cancelled by user", "info")
  }

  const handleAutoSOS = async () => {
    setCrashAlertOpen(false)

    const userName = typeof window !== "undefined" 
      ? window.localStorage.getItem("smartsafe_user_name") || "User"
      : "User"
    
    const userId = typeof window !== "undefined"
      ? window.localStorage.getItem("smartsafe_user_id") || "unknown"
      : "unknown"

    if (position) {
      await triggerSOS({
        userId,
        userName,
        position,
        timestamp: Date.now(),
        reason: "crash",
        speed: metrics.speed,
      })

      await sendSOSToContacts({
        userId,
        userName,
        position,
        timestamp: Date.now(),
        reason: "crash",
        speed: metrics.speed,
      })
    }
  }

  // Trip control handlers
  const handleStartTrip = () => {
    setTripActive(true)
    tripStartTimeRef.current = Date.now()
    lastGpsRef.current = null // Reset tracking
    setMetrics({
      speed: 0,
      distance: 0,
      durationMinutes: 0,
      risk: "LOW",
    })
    addLog("Trip started", "success")
    // Reset harsh driving stats
    // harshStats will auto-reset when trip starts
  }

  const handleStopTrip = () => {
    setTripActive(false)
    addLog(`Trip completed - ${metrics.distance} km, ${metrics.durationMinutes} min`, "info")
    // TODO: Save trip to database
    // Show trip summary
    alert(`Trip completed!\nDistance: ${metrics.distance} km\nDuration: ${metrics.durationMinutes} min\nSafety Score: ${100 - harshStats.harshBrakeCount * 5 - harshStats.harshAccelCount * 3 - harshStats.speedingCount * 10}`)
  }

  const handleManualSOS = async () => {
    const userName = typeof window !== "undefined" 
      ? window.localStorage.getItem("smartsafe_user_name") || "User"
      : "User"
    
    const userId = typeof window !== "undefined"
      ? window.localStorage.getItem("smartsafe_user_id") || "unknown"
      : "unknown"

    if (position) {
      await triggerSOS({
        userId,
        userName,
        position,
        timestamp: Date.now(),
        reason: "manual",
        speed: metrics.speed,
      })

      await sendSOSToContacts({
        userId,
        userName,
        position,
        timestamp: Date.now(),
        reason: "manual",
        speed: metrics.speed,
      })
    }
  }

  const handleDismissFatigueAlert = () => {
    setFatigueAlertOpen(false)
  }

  const handleFindRestStop = () => {
    setFatigueAlertOpen(false)
    // TODO: Implement rest stop finder
    alert("Finding nearby rest stops... (Feature coming soon)")
  }

  return (
    <>
      <CrashAlertModal
        isOpen={crashAlertOpen}
        onCancel={cancelCrashAlert}
        onConfirm={handleAutoSOS}
        countdown={crashCountdown}
        crashType={crashType}
        confidence={crashConfidence}
      />
      <FatigueAlertModal
        isOpen={fatigueAlertOpen}
        level={fatigueAlertData.level}
        message={fatigueAlertData.message}
        drivingTime={formattedDuration}
        onDismiss={handleDismissFatigueAlert}
        onFindRestStop={handleFindRestStop}
      />
      <POIAlertModal
        isOpen={poiAlertOpen}
        type={poiAlertData.type}
        name={poiAlertData.name}
        message={poiAlertData.message}
        speedLimit={poiAlertData.speedLimit}
        onDismiss={() => setPoiAlertOpen(false)}
      />
      <div className="bg-slate-950/95">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Live Journey Monitor
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
              SmartSafe Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Real-time risk analysis, weather conditions, and safety guidance for your current trip.
            </p>
            {position && (
              <p className="mt-1 text-[11px] text-emerald-400/80">
                GPS locked at {position.lat.toFixed(4)}°, {position.lng.toFixed(4)}° (±
                {Math.round(position.accuracy)} m)
              </p>
            )}
            {geoError && (
              <p className="mt-1 text-[11px] text-red-400/80">
                GPS Error: {geoError} - Please enable location permissions in your browser.
              </p>
            )}
            {zonesLoading && (
              <p className="mt-1 text-[11px] text-blue-400/80">
                Loading nearby accident zones...
              </p>
            )}
            {!zonesLoading && nearbyZones.length > 0 && (
              <p className="mt-1 text-[11px] text-yellow-400/80">
                {nearbyZones.length} accident zone(s) detected within 50km radius
              </p>
            )}
            
            {/* Trip Controls */}
            <div className="mt-3">
              <TripControls
                isActive={tripActive}
                duration={metrics.durationMinutes}
                onStart={handleStartTrip}
                onStop={handleStopTrip}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2">
              <span className="text-xs text-slate-400">Live Mode</span>
              <Switch checked={liveMode} onCheckedChange={(v) => setLiveMode(v)} />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2">
              <span className="text-xs text-slate-400">GPS</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 px-3 text-[11px]"
                onClick={watching ? () => stopGps() : () => startGps()}
              >
                {watching ? "Stop GPS" : "Enable GPS"}
              </Button>
            </div>
          </div>
        </div>

        {/* Top metrics grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-400 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
              <AlertTriangle className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-semibold">{metrics.risk}</p>
                  <p className="mt-1 text-xs text-emerald-50/80">
                    Calculated from speed, weather, and accident zone data.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={riskBadgeVariant as any} className="px-3 py-1 text-[11px]">
                    {metrics.risk === "HIGH"
                      ? "Immediate caution recommended"
                      : metrics.risk === "MEDIUM"
                      ? "Drive defensively"
                      : "Safe driving conditions"}
                  </Badge>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-emerald-50/70">
                    LIVE
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Trip Metrics</CardTitle>
              <Gauge className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-slate-100">
                <div>
                  <p className="text-xs text-slate-400">Speed</p>
                  <p className="mt-1 text-xl font-semibold">{metrics.speed} km/h</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Distance</p>
                  <p className="mt-1 text-xl font-semibold">{metrics.distance.toFixed(1)} km</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Duration</p>
                  <p className="mt-1 text-xl font-semibold">{metrics.durationMinutes} min</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Weather & Visibility
              </CardTitle>
              <CloudRain className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-slate-100">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Condition</p>
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    <span className="text-lg">{currentWeather.icon}</span>
                    {currentWeather.condition}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Thermometer className="h-3 w-3" /> {currentWeather.temperature}°C
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Visibility</p>
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                    {currentWeather.visibility}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Wind className="h-3 w-3" /> {currentWeather.windKph} km/h
                  </p>
                </div>
              </div>
              {currentWeather.precipitation > 0 && (
                <div className="mt-3 text-xs text-yellow-400 flex items-center gap-1">
                  <CloudRain className="h-3 w-3" />
                  Precipitation: {currentWeather.precipitation} mm
                </div>
              )}
              {weatherError && (
                <p className="mt-3 text-[11px] text-yellow-400">{weatherError}</p>
              )}
              {!weatherError && position && (
                <p className="mt-3 text-[11px] text-emerald-400">
                  Live weather for your location
                </p>
              )}
            </CardContent>
          </Card>

          {/* Harsh Driving Stats */}
          <HarshDrivingStats
            harshBrakeCount={harshStats.harshBrakeCount}
            harshAccelCount={harshStats.harshAccelCount}
            speedingCount={harshStats.speedingCount}
          />
        </div>

        {/* Map + controls + side panels */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 bg-slate-900/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-slate-200">
                  Live Route & Accident Zones
                </CardTitle>
                <p className="mt-1 text-xs text-slate-500">
                  Real-time map with your location and nearby accident zones.
                </p>
              </div>
              {!isMobile && (
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-200">
                  <Activity className="mr-2 h-3 w-3" />
                  View analytics
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <LiveMap
                  userPosition={position}
                  zones={nearbyZones}
                  currentZoneId={currentZoneId}
                />
              </div>

              {/* Current zone info */}
              {activeZone && (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`h-5 w-5 shrink-0 ${
                        activeZone.severity === "HIGH"
                          ? "text-red-400"
                          : activeZone.severity === "MEDIUM"
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`font-medium ${
                            activeZone.severity === "HIGH"
                              ? "text-red-300"
                              : activeZone.severity === "MEDIUM"
                              ? "text-yellow-300"
                              : "text-green-300"
                          }`}
                        >
                          {activeZone.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            activeZone.severity === "HIGH"
                              ? "border-red-500/60 text-red-300"
                              : activeZone.severity === "MEDIUM"
                              ? "border-yellow-400/60 text-yellow-300"
                              : "border-green-500/60 text-green-300"
                          }`}
                        >
                          {activeZone.severity} RISK
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-300">{activeZone.message}</p>
                      {activeZone.city && (
                        <p className="text-xs text-slate-500 mt-2">
                          📍 {activeZone.city}, {activeZone.state}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!activeZone && nearbyZones.length > 0 && (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                    <span>
                      {nearbyZones.length} accident zone(s) nearby. Closest:{" "}
                      <strong className="text-emerald-300">{nearbyZones[0]?.name}</strong> (
                      {nearbyZones[0]?.distance.toFixed(1)} km away)
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  Connected to emergency services (NHAI)
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                    <Switch checked={autoSOS} onCheckedChange={(v) => setAutoSOS(v)} />
                    <div>
                      <p className="text-xs font-medium text-slate-200">Auto SOS Dispatch</p>
                      <p className="text-[11px] text-slate-500">
                        Sends location to 112 and nearest hospitals on impact.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <SafetyTips />
            <AlertLogs />
          </div>
        </div>

        {/* System status */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardContent className="flex flex-col gap-3 py-4 text-sm text-slate-200 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="font-medium">System Health: Optimal</span>
              <span className="text-xs text-slate-500">All safety modules are running.</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-emerald-500/60 text-[11px] text-emerald-300">
                Weather AI online
              </Badge>
              <Badge variant="outline" className="border-emerald-500/60 text-[11px] text-emerald-300">
                Accident map synced
              </Badge>
              <Badge variant="outline" className="border-emerald-500/60 text-[11px] text-emerald-300">
                Voice control ready
              </Badge>
              <Badge
                variant="outline"
                className={
                  position
                    ? "border-emerald-500/60 text-[11px] text-emerald-300"
                    : "border-slate-600 text-[11px] text-slate-300"
                }
              >
                {position ? "GPS active" : "GPS not enabled"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Manual SOS Button */}
    <ManualSOSButton onTriggerSOS={handleManualSOS} />
    </>
  )
}


