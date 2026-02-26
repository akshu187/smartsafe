import { PrismaClient } from "../generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import Database from "better-sqlite3"
import "dotenv/config"

const connectionString = process.env.DATABASE_URL || "file:./dev.db"
const db = new Database(connectionString.replace("file:", ""))
const adapter = new PrismaBetterSqlite3({ url: connectionString })
const prisma = new PrismaClient({ adapter })

const zones = [
  // Gurugram zones
  {
    zoneId: "nh48-sector-45",
    name: "NH 48 – Sector 45 junction",
    lat: 28.4595,
    lng: 77.0266,
    radiusMeters: 600,
    severity: "HIGH",
    message: "Dense junction ahead. Stay below 40 km/h and watch for merging traffic.",
    city: "Gurugram",
    state: "Haryana",
  },
  {
    zoneId: "sohna-road",
    name: "Sohna Road curve",
    lat: 28.4265,
    lng: 77.041,
    radiusMeters: 500,
    severity: "MEDIUM",
    message: "Accident-prone curve ahead. Avoid sudden lane changes.",
    city: "Gurugram",
    state: "Haryana",
  },
  {
    zoneId: "rajiv-chowk",
    name: "Rajiv Chowk circle",
    lat: 28.454,
    lng: 77.031,
    radiusMeters: 700,
    severity: "HIGH",
    message: "Busy roundabout. Maintain lane discipline and reduce speed.",
    city: "Gurugram",
    state: "Haryana",
  },
  // Mandi zones
  {
    zoneId: "mandi-town-bridge",
    name: "Mandi town bridge section",
    lat: 31.708,
    lng: 76.932,
    radiusMeters: 500,
    severity: "MEDIUM",
    message: "Narrow bridge and town traffic ahead. Slow down and keep safe distance.",
    city: "Mandi",
    state: "Himachal Pradesh",
  },
  {
    zoneId: "pandoh-dam-bend",
    name: "Pandoh dam bends on NH",
    lat: 31.77,
    lng: 76.99,
    radiusMeters: 800,
    severity: "HIGH",
    message: "Steep bends near Pandoh dam. Use lower gear, avoid overtaking and keep speed under 40 km/h.",
    city: "Mandi",
    state: "Himachal Pradesh",
  },
  {
    zoneId: "jogini-mod",
    name: "Jogini Mod section",
    lat: 31.75,
    lng: 77.02,
    radiusMeters: 600,
    severity: "HIGH",
    message: "Accident-prone hairpin curves ahead. Honk before blind turns and stay in your lane.",
    city: "Mandi",
    state: "Himachal Pradesh",
  },
  {
    zoneId: "kalkhar-gorge",
    name: "Kalkhar gorge stretch",
    lat: 31.69,
    lng: 76.90,
    radiusMeters: 700,
    severity: "MEDIUM",
    message: "Deep valley on roadside. Keep left, avoid distraction and maintain safe speed especially at night.",
    city: "Mandi",
    state: "Himachal Pradesh",
  },
  {
    zoneId: "sundernagar-town-curve",
    name: "Sundernagar town entry curves",
    lat: 31.53,
    lng: 76.90,
    radiusMeters: 600,
    severity: "MEDIUM",
    message: "Curvy approach into Sundernagar town. Watch for local traffic and pedestrians, keep speed under 35 km/h.",
    city: "Sundernagar",
    state: "Himachal Pradesh",
  },
  {
    zoneId: "sundernagar-lake-stretch",
    name: "Sundernagar lake-side stretch",
    lat: 31.52,
    lng: 76.89,
    radiusMeters: 500,
    severity: "HIGH",
    message: "Lake-side highway with limited shoulders. Avoid overtaking, maintain lane and be extra careful at night or in rain.",
    city: "Sundernagar",
    state: "Himachal Pradesh",
  },
  // Roorkee zones
  {
    zoneId: "roorkee-nh58-bypass",
    name: "Roorkee NH-58 Bypass junction",
    lat: 29.8543,
    lng: 77.8880,
    radiusMeters: 700,
    severity: "HIGH",
    message: "Heavy truck traffic junction. Stay alert, maintain safe distance and avoid sudden lane changes.",
    city: "Roorkee",
    state: "Uttarakhand",
  },
  {
    zoneId: "roorkee-haridwar-road",
    name: "Roorkee-Haridwar Road stretch",
    lat: 29.8833,
    lng: 77.8833,
    radiusMeters: 800,
    severity: "MEDIUM",
    message: "High-speed corridor with frequent overtaking. Keep left, use indicators and watch for slow-moving vehicles.",
    city: "Roorkee",
    state: "Uttarakhand",
  },
  {
    zoneId: "roorkee-civil-lines",
    name: "Civil Lines crossing",
    lat: 29.8626,
    lng: 77.8958,
    radiusMeters: 500,
    severity: "MEDIUM",
    message: "Busy market area with pedestrian crossing. Reduce speed to 30 km/h and watch for two-wheelers.",
    city: "Roorkee",
    state: "Uttarakhand",
  },
  {
    zoneId: "roorkee-iit-gate",
    name: "IIT Roorkee main gate area",
    lat: 29.8664,
    lng: 77.8964,
    radiusMeters: 400,
    severity: "LOW",
    message: "Student crossing zone. Drive slowly, watch for pedestrians and cyclists.",
    city: "Roorkee",
    state: "Uttarakhand",
  },
  {
    zoneId: "roorkee-delhi-road",
    name: "Roorkee-Delhi Road (NH-58)",
    lat: 29.8400,
    lng: 77.8700,
    radiusMeters: 900,
    severity: "HIGH",
    message: "National highway with mixed traffic. Maintain 60 km/h, avoid night driving in fog season.",
    city: "Roorkee",
    state: "Uttarakhand",
  },
]

async function main() {
  console.log("Starting seed...")

  for (const zone of zones) {
    await prisma.accidentZone.upsert({
      where: { zoneId: zone.zoneId },
      update: zone,
      create: zone,
    })
    console.log(`✓ Seeded zone: ${zone.name}`)
  }

  console.log("Seed completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
