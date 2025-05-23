"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Lightbulb, Umbrella, Thermometer, Wind, Sun, Droplets, CloudSnow } from "lucide-react"
import CollapsibleWidget from "@/components/collapsible-widget"

interface WeatherRecommendationProps {
  weather: any
}

export default function WeatherRecommendation({ weather }: WeatherRecommendationProps) {
  const [recommendation, setRecommendation] = useState<{
    text: string
    icon: React.ReactNode
    color: string
  } | null>(null)

  useEffect(() => {
    if (!weather || !weather.current) return

    const { current } = weather
    const condition = current.condition.text.toLowerCase()
    const temp = current.temp_c
    const feelsLike = current.feelslike_c
    const humidity = current.humidity
    const windKph = current.wind_kph
    const precipMm = current.precip_mm
    const uv = current.uv

    // Generate recommendation based on weather conditions
    if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("shower")) {
      setRecommendation({
        text: "Take an umbrella with you today.",
        icon: <Umbrella className="h-5 w-5" />,
        color: "text-blue-400",
      })
    } else if (condition.includes("snow") || condition.includes("sleet") || condition.includes("ice")) {
      setRecommendation({
        text: "Dress warmly and wear boots with good traction.",
        icon: <CloudSnow className="h-5 w-5" />,
        color: "text-blue-200",
      })
    } else if (temp > 30) {
      setRecommendation({
        text: "Stay hydrated and seek shade during peak hours.",
        icon: <Thermometer className="h-5 w-5" />,
        color: "text-red-400",
      })
    } else if (temp < 5) {
      setRecommendation({
        text: "Bundle up with layers to stay warm today.",
        icon: <Thermometer className="h-5 w-5" />,
        color: "text-blue-400",
      })
    } else if (windKph > 30) {
      setRecommendation({
        text: "Secure loose items outdoors due to strong winds.",
        icon: <Wind className="h-5 w-5" />,
        color: "text-teal-400",
      })
    } else if (uv > 7) {
      setRecommendation({
        text: "Apply sunscreen and wear protective clothing.",
        icon: <Sun className="h-5 w-5" />,
        color: "text-yellow-400",
      })
    } else if (humidity > 80) {
      setRecommendation({
        text: "High humidity today. Dress in light, breathable clothing.",
        icon: <Droplets className="h-5 w-5" />,
        color: "text-blue-400",
      })
    } else if (condition.includes("clear") || condition.includes("sunny")) {
      setRecommendation({
        text: "Great day for outdoor activities!",
        icon: <Sun className="h-5 w-5" />,
        color: "text-yellow-400",
      })
    } else {
      setRecommendation({
        text: "Check the forecast before heading out today.",
        icon: <Lightbulb className="h-5 w-5" />,
        color: "text-amber-400",
      })
    }
  }, [weather])

  if (!recommendation) return null

  return (
    <CollapsibleWidget
      title="Weather Recommendation"
      icon={<Lightbulb className="h-3 w-3 xs:h-4 xs:w-4" />}
      isDefaultOpen={true}
    >
      <div className="flex items-center">
        <div className={`mr-2 ${recommendation.color}`}>{recommendation.icon}</div>
        <p className="text-xs xs:text-sm text-[#d5bdaf]">{recommendation.text}</p>
      </div>
    </CollapsibleWidget>
  )
}

