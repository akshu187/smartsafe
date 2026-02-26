export type AccidentSeverity = "LOW" | "MEDIUM" | "HIGH"

export interface AccidentZone {
  id: string
  name: string
  lat: number
  lng: number
  radiusMeters: number
  severity: AccidentSeverity
  message: string
}

// Approximate real-world coordinates around Gurugram (NH 48 corridor).
// In a production deployment this list should come from an official
// accident database or open-data feed.
export const ACCIDENT_ZONES: AccidentZone[] = [
  {
    id: "nh48-sector-45",
    name: "NH 48 – Sector 45 junction",
    lat: 28.4595,
    lng: 77.0266,
    radiusMeters: 600,
    severity: "HIGH",
    message: "Dense junction ahead. Stay below 40 km/h and watch for merging traffic.",
  },
  {
    id: "sohna-road",
    name: "Sohna Road curve",
    lat: 28.4265,
    lng: 77.041,
    radiusMeters: 500,
    severity: "MEDIUM",
    message: "Accident-prone curve ahead. Avoid sudden lane changes.",
  },
  {
    id: "rajiv-chowk",
    name: "Rajiv Chowk circle",
    lat: 28.454,
    lng: 77.031,
    radiusMeters: 700,
    severity: "HIGH",
    message: "Busy roundabout. Maintain lane discipline and reduce speed.",
  },
  // Himachal Pradesh – Mandi district (approximate coordinates)
  {
    id: "mandi-town-bridge",
    name: "Mandi town bridge section",
    lat: 31.708,
    lng: 76.932,
    radiusMeters: 500,
    severity: "MEDIUM",
    message: "Narrow bridge and town traffic ahead. Slow down and keep safe distance.",
  },
  {
    id: "pandoh-dam-bend",
    name: "Pandoh dam bends on NH",
    lat: 31.77,
    lng: 76.99,
    radiusMeters: 800,
    severity: "HIGH",
    message:
      "Steep bends near Pandoh dam. Use lower gear, avoid overtaking and keep speed under 40 km/h.",
  },
  {
    id: "jogini-mod",
    name: "Jogini Mod section",
    lat: 31.75,
    lng: 77.02,
    radiusMeters: 600,
    severity: "HIGH",
    message:
      "Accident-prone hairpin curves ahead. Honk before blind turns and stay in your lane.",
  },
  {
    id: "kalkhar-gorge",
    name: "Kalkhar gorge stretch",
    lat: 31.69,
    lng: 76.90,
    radiusMeters: 700,
    severity: "MEDIUM",
    message:
      "Deep valley on roadside. Keep left, avoid distraction and maintain safe speed especially at night.",
  },
  // Sundernagar area (Mandi district, approximate)
  {
    id: "sundernagar-town-curve",
    name: "Sundernagar town entry curves",
    lat: 31.53,
    lng: 76.90,
    radiusMeters: 600,
    severity: "MEDIUM",
    message:
      "Curvy approach into Sundernagar town. Watch for local traffic and pedestrians, keep speed under 35 km/h.",
  },
  {
    id: "sundernagar-lake-stretch",
    name: "Sundernagar lake-side stretch",
    lat: 31.52,
    lng: 76.89,
    radiusMeters: 500,
    severity: "HIGH",
    message:
      "Lake-side highway with limited shoulders. Avoid overtaking, maintain lane and be extra careful at night or in rain.",
  },
  // Roorkee area (Uttarakhand)
  {
    id: "roorkee-nh58-bypass",
    name: "Roorkee NH-58 Bypass junction",
    lat: 29.8543,
    lng: 77.8880,
    radiusMeters: 700,
    severity: "HIGH",
    message:
      "Heavy truck traffic junction. Stay alert, maintain safe distance and avoid sudden lane changes.",
  },
  {
    id: "roorkee-haridwar-road",
    name: "Roorkee-Haridwar Road stretch",
    lat: 29.8833,
    lng: 77.8833,
    radiusMeters: 800,
    severity: "MEDIUM",
    message:
      "High-speed corridor with frequent overtaking. Keep left, use indicators and watch for slow-moving vehicles.",
  },
  {
    id: "roorkee-civil-lines",
    name: "Civil Lines crossing",
    lat: 29.8626,
    lng: 77.8958,
    radiusMeters: 500,
    severity: "MEDIUM",
    message:
      "Busy market area with pedestrian crossing. Reduce speed to 30 km/h and watch for two-wheelers.",
  },
  {
    id: "roorkee-iit-gate",
    name: "IIT Roorkee main gate area",
    lat: 29.8664,
    lng: 77.8964,
    radiusMeters: 400,
    severity: "LOW",
    message:
      "Student crossing zone. Drive slowly, watch for pedestrians and cyclists.",
  },
  {
    id: "roorkee-delhi-road",
    name: "Roorkee-Delhi Road (NH-58)",
    lat: 29.8400,
    lng: 77.8700,
    radiusMeters: 900,
    severity: "HIGH",
    message:
      "National highway with mixed traffic. Maintain 60 km/h, avoid night driving in fog season.",
  },
]

export function haversineDistanceKm(
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

