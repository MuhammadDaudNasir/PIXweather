import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude parameters are required" }, { status: 400 })
  }

  try {
    const apiKey = process.env.WEATHERAPI_KEY
    const response = await fetch(
      `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${lat},${lon}`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // WeatherAPI returns an array of closest locations
    if (data && data.length > 0) {
      return NextResponse.json({
        name: data[0].name,
        region: data[0].region,
        country: data[0].country,
        lat: data[0].lat,
        lon: data[0].lon,
      })
    } else {
      return NextResponse.json({ error: "No location found for the provided coordinates" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error reverse geocoding:", error)
    return NextResponse.json({ error: "Failed to reverse geocode location" }, { status: 500 })
  }
}

