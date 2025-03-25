import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude parameters are required" }, { status: 400 })
  }

  try {
    // Note: In a real application, you would use a real pollen API
    // This is a mock implementation for demonstration purposes

    // Generate semi-random but consistent pollen data based on coordinates
    const latNum = Number.parseFloat(lat)
    const lonNum = Number.parseFloat(lon)

    // Use the coordinates to seed a simple random generator
    let seed = (Math.sin(latNum * 10) + Math.cos(lonNum * 10)) * 10000
    const rand = () => {
      const x = Math.sin(seed++) * 10000
      return x - Math.floor(x)
    }

    // Generate pollen levels (0-5 scale, where 0 is none and 5 is very high)
    const grass = Math.floor(rand() * 6)
    const tree = Math.floor(rand() * 6)
    const weed = Math.floor(rand() * 6)

    // Calculate overall level as the highest of the three
    const overall = Math.max(grass, tree, weed)

    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      grass,
      tree,
      weed,
      overall,
      location: {
        lat: latNum,
        lon: lonNum,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching pollen data:", error)
    return NextResponse.json({ error: "Failed to fetch pollen data" }, { status: 500 })
  }
}

