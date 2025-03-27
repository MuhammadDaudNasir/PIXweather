"use client"

import { useState, useEffect } from "react"
import { Sparkles, RefreshCw, Cloud, Umbrella, Sun, Wind } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AIWeatherInsightsProps {
  weather: any
  apiKey: string
}

export default function AIWeatherInsights({ weather, apiKey }: AIWeatherInsightsProps) {
  const [insights, setInsights] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const generateInsights = async () => {
      if (!weather || !weather.current || !weather.forecast) {
        return
      }

      try {
        setLoading(true)

        // Prepare weather data for the AI
        const weatherData = {
          current: {
            temp_c: weather.current.temp_c,
            condition: weather.current.condition.text,
            wind_kph: weather.current.wind_kph,
            humidity: weather.current.humidity,
            uv: weather.current.uv,
            precip_mm: weather.current.precip_mm,
          },
          forecast: weather.forecast.forecastday.map((day: any) => ({
            date: day.date,
            maxtemp_c: day.day.maxtemp_c,
            mintemp_c: day.day.mintemp_c,
            condition: day.day.condition.text,
            daily_chance_of_rain: day.day.daily_chance_of_rain,
          })),
          location: {
            name: weather.location.name,
            country: weather.location.country,
          },
        }

        // Call OpenAI API for insights
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful weather assistant that provides insightful analysis of weather patterns. Keep your response concise, under 150 words.",
              },
              {
                role: "user",
                content: `Analyze this weather data and provide interesting insights, patterns, or recommendations for ${weather.location.name}:\n\n${JSON.stringify(weatherData, null, 2)}`,
              },
            ],
            max_tokens: 200,
            temperature: 0.7,
          }),
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()
        setInsights(data.choices[0].message.content.trim())
      } catch (error) {
        console.error("Error generating weather insights:", error)
        setInsights("Unable to generate weather insights at this time.")
      } finally {
        setLoading(false)
      }
    }

    if (weather) {
      generateInsights()
    }
  }, [weather, apiKey])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <RefreshCw className="h-6 w-6 text-[#8B4513] animate-spin mr-2" />
        <span className="text-sm text-[#d5bdaf]">Analyzing weather patterns...</span>
      </div>
    )
  }

  // Choose an icon based on the current weather condition
  const getWeatherIcon = () => {
    const condition = weather?.current?.condition?.text?.toLowerCase() || ""

    if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("shower")) {
      return <Umbrella className="h-5 w-5 text-blue-400" />
    } else if (condition.includes("cloud") || condition.includes("overcast")) {
      return <Cloud className="h-5 w-5 text-gray-400" />
    } else if (condition.includes("sun") || condition.includes("clear")) {
      return <Sun className="h-5 w-5 text-yellow-400" />
    } else {
      return <Wind className="h-5 w-5 text-teal-400" />
    }
  }

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-lg p-4 border border-[#3c2a21]/20">
      <div className="flex items-center mb-3">
        <Sparkles className="h-4 w-4 mr-2 text-[#8B4513]" />
        <h3 className="text-base font-medium text-[#8B4513]">AI Weather Insights</h3>
      </div>

      <div className="flex items-start">
        <div className="mr-3 mt-1">{getWeatherIcon()}</div>
        <p className="text-sm text-[#d5bdaf]">{insights}</p>
      </div>
    </div>
  )
}

