import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const location = searchParams.get("location")

  if (!location) {
    return NextResponse.json({ error: "Location parameter is required" }, { status: 400 })
  }

  try {
    // This endpoint would normally use a news API key
    // Using the existing one from the project
    const apiKey = "af4dad20374e47fca29a3593adf00eb2"

    // Construct a search query with weather-related terms
    const query = `${location} weather OR climate OR storm OR temperature OR forecast`

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )

    if (!response.ok) {
      throw new Error(`News API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching weather news:", error)
    return NextResponse.json({ error: "Failed to fetch weather news", articles: [] }, { status: 500 })
  }
}

