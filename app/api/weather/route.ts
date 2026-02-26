import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get("lat") || "28.4595")
    const lng = parseFloat(searchParams.get("lng") || "77.0266")

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,visibility,wind_speed_10m,weather_code,relative_humidity_2m,precipitation`
    
    // Cache for 1 minute for more real-time data
    const res = await fetch(url, { 
      next: { revalidate: 60 } // 1 minute cache
    })

    if (!res.ok) {
      throw new Error(`Weather request failed with status ${res.status}`)
    }

    const data = await res.json()
    const current = data.current || {}

    const temperature = typeof current.temperature_2m === "number" ? Math.round(current.temperature_2m) : 24
    const visibilityMeters = typeof current.visibility === "number" ? current.visibility : 2100
    const visibilityKm = Math.round((visibilityMeters / 1000) * 10) / 10
    const windKph = typeof current.wind_speed_10m === "number" ? Math.round(current.wind_speed_10m * 3.6) : 18
    const humidity = typeof current.relative_humidity_2m === "number" ? current.relative_humidity_2m : 65
    const precipitation = typeof current.precipitation === "number" ? current.precipitation : 0

    const code = typeof current.weather_code === "number" ? current.weather_code : 0
    let condition = "Clear"
    let icon = "☀️"
    
    if (code >= 51 && code <= 67) {
      condition = "Light Rain"
      icon = "🌧️"
    } else if (code >= 71 && code <= 77) {
      condition = "Snow"
      icon = "❄️"
    } else if (code >= 80 && code <= 82) {
      condition = "Rain showers"
      icon = "🌦️"
    } else if (code >= 95) {
      condition = "Thunderstorm"
      icon = "⛈️"
    } else if (code === 45 || code === 48) {
      condition = "Fog"
      icon = "🌫️"
    } else if (code >= 1 && code <= 3) {
      condition = "Partly Cloudy"
      icon = "⛅"
    }

    const response = NextResponse.json({
      condition,
      icon,
      temperature,
      visibility: `${visibilityKm} km`,
      windKph,
      humidity,
      precipitation,
      location: { lat, lng },
    })
    
    // Add cache headers - 1 minute cache
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    
    return response
  } catch (error) {
    console.error("Weather API error", error)
    return NextResponse.json(
      {
        condition: "Unknown",
        icon: "🌡️",
        temperature: 24,
        visibility: "2.1 km",
        windKph: 18,
        humidity: 65,
        precipitation: 0,
      },
      { status: 200 },
    )
  }
}

