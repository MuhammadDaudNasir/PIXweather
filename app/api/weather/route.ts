import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory cache to reduce API calls
const cache = new Map()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes in milliseconds

// Add this mock data function at the top of the file, before the GET function
function getMockWeatherData(query: string) {
  // Create realistic mock data for the location
  const now = new Date()
  const location = {
    name: query,
    region: "Mock Region",
    country: "Mock Country",
    lat: 40.7128,
    lon: -74.006,
    localtime: now.toLocaleString(),
  }

  // Generate random but realistic weather data
  const temp_c = Math.round(15 + Math.random() * 15)
  const temp_f = Math.round((temp_c * 9) / 5 + 32)
  const condition = {
    text: ["Sunny", "Partly cloudy", "Cloudy", "Overcast", "Light rain"][Math.floor(Math.random() * 5)],
    icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
  }

  return {
    location,
    current: {
      last_updated: now.toISOString(),
      temp_c,
      temp_f,
      is_day: 1,
      condition,
      wind_mph: Math.round(5 + Math.random() * 15),
      wind_kph: Math.round(8 + Math.random() * 24),
      humidity: Math.round(40 + Math.random() * 40),
      cloud: Math.round(Math.random() * 100),
      feelslike_c: temp_c - 2 + Math.round(Math.random() * 4),
      feelslike_f: temp_f - 3 + Math.round(Math.random() * 6),
      uv: Math.round(1 + Math.random() * 10),
      precip_mm: Math.random() * 5,
      precip_in: Math.random() * 0.2,
    },
    forecast: {
      forecastday: Array.from({ length: 7 }, (_, i) => {
        const forecastDate = new Date(now)
        forecastDate.setDate(forecastDate.getDate() + i)

        return {
          date: forecastDate.toISOString().split("T")[0],
          day: {
            maxtemp_c: temp_c + Math.round(Math.random() * 5),
            maxtemp_f: temp_f + Math.round(Math.random() * 9),
            mintemp_c: temp_c - Math.round(Math.random() * 5),
            mintemp_f: temp_f - Math.round(Math.random() * 9),
            avgtemp_c: temp_c,
            avgtemp_f: temp_f,
            condition: condition,
            uv: Math.round(1 + Math.random() * 10),
            maxwind_kph: Math.round(10 + Math.random() * 30),
            maxwind_mph: Math.round(6 + Math.random() * 18),
            totalprecip_mm: Math.random() * 10,
            totalprecip_in: Math.random() * 0.4,
            daily_chance_of_rain: Math.round(Math.random() * 100),
          },
          astro: {
            sunrise: "06:45 AM",
            sunset: "07:30 PM",
            moonrise: "09:15 PM",
            moonset: "07:30 AM",
            moon_phase: "Waxing Gibbous",
          },
          hour: Array.from({ length: 24 }, (_, j) => {
            const hourTime = new Date(forecastDate)
            hourTime.setHours(j)

            return {
              time: hourTime.toISOString(),
              temp_c: temp_c - 5 + Math.round(Math.random() * 10 + j / 2),
              temp_f: temp_f - 9 + Math.round(Math.random() * 18 + j / 2),
              condition: condition,
              wind_kph: Math.round(5 + Math.random() * 20),
              wind_mph: Math.round(3 + Math.random() * 12),
              humidity: Math.round(40 + Math.random() * 40),
              precip_mm: Math.random() * 2,
              precip_in: Math.random() * 0.08,
            }
          }),
        }
      }),
    },
  }
}

// Update the GET function to handle API key issues and use mock data
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

      // Check for API key issues (disabled, invalid, etc.)
      if (response.status === 403 || errorText.includes("API key has been disabled")) {
        console.log("Using mock weather data due to API key issue")
        const mockData = getMockWeatherData(query)

        // Store mock data in cache
        cache.set(cacheKey, {
          data: mockData,
          timestamp: Date.now(),
          isMock: true,
        })

        return NextResponse.json({
          ...mockData,
          _notice: "Using simulated weather data due to API limitations",
        })
      }

      // Handle rate limiting specifically
      if (response.status === 429) {
        const mockData = getMockWeatherData(query)
        return NextResponse.json(
          {
            ...mockData,
            _notice: "Using simulated weather data due to rate limiting",
          },
          { status: 200 },
        )
      }

      return NextResponse.json(
        {
          error: `Weather API error: ${response.statusText}`,
          mockData: getMockWeatherData(query),
        },
        { status: 200 }, // Return 200 with mock data instead of error status
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

    // Return mock data on any error
    const mockData = getMockWeatherData(query)
    return NextResponse.json(
      {
        ...mockData,
        _notice: "Using simulated weather data due to an error",
      },
      { status: 200 },
    )
  }
}

