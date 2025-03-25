import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get client IP address
    const ip = request.headers.get("x-forwarded-for") || "8.8.8.8" // Default to Google DNS IP if not available

    // For demo purposes, we'll return a fixed location
    // In a production app, you would use a service like ipinfo.io or ipapi.co
    // Example: const response = await fetch(`https://ipapi.co/${ip}/json/`);

    // Simulate a delay for realism
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Return a default location (New York)
    return NextResponse.json({
      name: "New York",
      region: "New York",
      country: "United States",
      lat: 40.7128,
      lon: -74.006,
      isFallback: true,
    })
  } catch (error) {
    console.error("Error getting IP location:", error)
    return NextResponse.json(
      {
        error: "Failed to determine location from IP",
        isFallback: true,
        // Default fallback
        name: "London",
        region: "England",
        country: "United Kingdom",
        lat: 51.5074,
        lon: -0.1278,
      },
      { status: 500 },
    )
  }
}

