import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get("page") || "1"
    const pageSize = "10"

    const apiKey = "af4dad20374e47fca29a3593adf00eb2"
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&category=general&page=${page}&pageSize=${pageSize}&apiKey=${apiKey}`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )

    if (!response.ok) {
      throw new Error(`News API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json({ error: "Failed to fetch news", articles: [] }, { status: 500 })
  }
}

