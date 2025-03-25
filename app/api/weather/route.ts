import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory cache to reduce API calls
const cache = new Map()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes in milliseconds

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")
  const forecast = searchParams.get("forecast") === "true"
  const aqi = searchParams.get("aqi") === "true"
  const alerts = searchParams.get("alerts") === "true"

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  // Create a cache key based on the request parameters
  const cacheKey = `${query}-${forecast}-${aqi}-${alerts}`

  // Check if we have a valid cached response
  const cachedData = cache.get(cacheKey)
  if (cachedData && cachedData.timestamp > Date.now() - CACHE_TTL) {
    return NextResponse.json(cachedData.data)
  }

  try {
    const apiKey = process.env.WEATHERAPI_KEY
    let endpoint = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(query)}`

    // Add optional parameters
    if (aqi) {
      endpoint += "&aqi=yes"
    }

    if (forecast) {
      endpoint += "&days=7"
    }

    if (alerts) {
      endpoint += "&alerts=yes"
    }

    // Determine which API endpoint to use based on parameters
    const apiEndpoint = forecast
      ? `https://api.weatherapi.com/v1/forecast.json${endpoint.substring(endpoint.indexOf("?"))}`
      : endpoint

    const response = await fetch(apiEndpoint)

    // Handle non-OK responses properly
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Weather API error (${response.status}): ${errorText}`)

      // Handle rate limiting specifically
      if (response.status === 429) {
        return NextResponse.json(
          {
            error: "Too many requests to weather API. Please try again later.",
            isRateLimited: true,
          },
          { status: 429 },
        )
      }

      return NextResponse.json(
        {
          error: `Weather API error: ${response.statusText}`,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Store in cache
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching weather data:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}

