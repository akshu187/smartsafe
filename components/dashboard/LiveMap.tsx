"use client"

import React from "react"
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// Custom icons for different severity levels
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

const userIcon = L.divIcon({
  className: "user-marker",
  html: `<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3), 0 2px 8px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div>
  <style>
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3), 0 2px 8px rgba(0,0,0,0.3); }
      50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.1), 0 2px 8px rgba(0,0,0,0.3); }
    }
  </style>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

interface Zone {
  id: string
  name: string
  lat: number
  lng: number
  radiusMeters: number
  severity: "LOW" | "MEDIUM" | "HIGH"
  message: string
  city?: string
  state?: string
  distance: number
}

interface LiveMapProps {
  userPosition: { lat: number; lng: number } | null
  zones: Zone[]
  currentZoneId: string | null
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  React.useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

export function LiveMap({ userPosition, zones, currentZoneId }: LiveMapProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !userPosition) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-900 rounded-2xl border border-slate-800">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-sm text-slate-400">
            {!userPosition ? "Waiting for GPS location..." : "Loading map..."}
          </p>
        </div>
      </div>
    )
  }

  const center: [number, number] = [userPosition.lat, userPosition.lng]

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-800 relative">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />

        {/* User's current location */}
        <Marker position={center} icon={userIcon}>
          <Popup>
            <div className="text-sm">
              <strong className="text-emerald-600">Your Location</strong>
              <p className="text-xs text-slate-600 mt-1">
                {userPosition.lat.toFixed(5)}°, {userPosition.lng.toFixed(5)}°
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Accident zones */}
        {zones.map((zone) => {
          const isActive = zone.id === currentZoneId
          const color =
            zone.severity === "HIGH"
              ? "#ef4444"
              : zone.severity === "MEDIUM"
              ? "#f59e0b"
              : "#10b981"

          const fillColor =
            zone.severity === "HIGH"
              ? "rgba(239, 68, 68, 0.2)"
              : zone.severity === "MEDIUM"
              ? "rgba(245, 158, 11, 0.2)"
              : "rgba(16, 185, 129, 0.2)"

          return (
            <React.Fragment key={zone.id}>
              <Circle
                center={[zone.lat, zone.lng]}
                radius={zone.radiusMeters}
                pathOptions={{
                  color: color,
                  fillColor: fillColor,
                  fillOpacity: isActive ? 0.4 : 0.2,
                  weight: isActive ? 3 : 2,
                }}
              />
              <Marker position={[zone.lat, zone.lng]} icon={createCustomIcon(color)}>
                <Popup>
                  <div className="text-sm max-w-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          zone.severity === "HIGH"
                            ? "bg-red-100 text-red-700"
                            : zone.severity === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {zone.severity}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <strong className="text-slate-900">{zone.name}</strong>
                    {zone.city && (
                      <p className="text-xs text-slate-500 mt-1">
                        {zone.city}, {zone.state}
                      </p>
                    )}
                    <p className="text-xs text-slate-600 mt-2">{zone.message}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Distance: {zone.distance.toFixed(2)} km
                    </p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          )
        })}
      </MapContainer>

      {/* Map legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000] text-xs">
        <div className="font-semibold text-slate-900 mb-2">Risk Zones</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-slate-700">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-slate-700">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-700">Low Risk</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-slate-700">Your Location</span>
          </div>
        </div>
      </div>
    </div>
  )
}
