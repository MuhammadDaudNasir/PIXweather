import { type NextRequest, NextResponse } from "next/server"

// In a real application, this would be stored in a database
// For demo purposes, we'll use a simple in-memory store
let weatherReports: any[] = []

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const location = searchParams.get("location")

  if (!location) {
    return NextResponse.json({ error: "Location parameter is required" }, { status: 400 })
  }

  try {
    // Filter reports by location and sort by timestamp (newest first)
    const locationReports = weatherReports
      .filter((report) => report.location.toLowerCase() === location.toLowerCase())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({ reports: locationReports })
  } catch (error) {
    console.error("Error fetching community reports:", error)
    return NextResponse.json({ error: "Failed to fetch community reports", reports: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.location || !body.condition) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create report object
    const report = {
      id: Date.now().toString(), // Simple unique ID
      location: body.location,
      condition: body.condition,
      tempFeel: body.tempFeel || "",
      comment: body.comment || "",
      timestamp: body.timestamp || new Date().toISOString(),
    }

    // Add to our in-memory store
    weatherReports.push(report)

    // Limit the number of reports we store in memory (for demo purposes)
    if (weatherReports.length > 100) {
      weatherReports = weatherReports.slice(-100)
    }

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error("Error submitting weather report:", error)
    return NextResponse.json({ error: "Failed to submit weather report" }, { status: 500 })
  }
}

