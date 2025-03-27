"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sunrise, Sunset, Clock, Sun } from "lucide-react"
import CollapsibleWidget from "./collapsible-widget"

interface SolarInfoProps {
  weather: any
}

export default function SolarInfo({ weather }: SolarInfoProps) {
  const [timeOfDay, setTimeOfDay] = useState<string>("day")
  const [sunPosition, setSunPosition] = useState<number>(50) // 0-100 representing sun's position in the sky

  useEffect(() => {
    if (!weather || !weather.forecast || !weather.forecast.forecastday || !weather.forecast.forecastday[0]) return

    const { sunrise, sunset } = weather.forecast.forecastday[0].astro
    const currentTime = new Date()

    // Convert sunrise/sunset to Date objects for comparison
    const sunriseTime = parseAstroTime(sunrise, currentTime)
    const sunsetTime = parseAstroTime(sunset, currentTime)

    // Determine time of day
    if (currentTime < sunriseTime) {
      setTimeOfDay("dawn")
    } else if (currentTime > sunsetTime) {
      setTimeOfDay("dusk")
    } else {
      setTimeOfDay("day")
    }

    // Calculate sun position as percentage of journey across the sky
    if (currentTime >= sunriseTime && currentTime <= sunsetTime) {
      const totalDayTime = sunsetTime.getTime() - sunriseTime.getTime()
      const elapsedDayTime = currentTime.getTime() - sunriseTime.getTime()
      const position = Math.min(100, Math.max(0, (elapsedDayTime / totalDayTime) * 100))
      setSunPosition(position)
    } else {
      setSunPosition(currentTime < sunriseTime ? 0 : 100)
    }
  }, [weather])

  // Helper function to parse times like "06:45 AM" into Date objects
  const parseAstroTime = (timeStr: string, dateRef: Date): Date => {
    const [time, period] = timeStr.split(" ")
    const [hours, minutes] = time.split(":").map(Number)

    const date = new Date(dateRef)
    date.setHours(
      period.toLowerCase() === "pm" && hours < 12
        ? hours + 12
        : period.toLowerCase() === "am" && hours === 12
          ? 0
          : hours,
    )
    date.setMinutes(minutes)
    date.setSeconds(0)
    date.setMilliseconds(0)

    return date
  }

  // Format time to 12-hour format
  const formatTime = (timeStr: string): string => {
    if (!timeStr) return "--:--"
    return timeStr
  }

  // Calculate solar exposure based on UV index and time of day
  const calculateExposureTime = (uvIndex: number): string => {
    if (!uvIndex || uvIndex === 0) return "No risk"

    // Time until skin damage based on UV index for skin type II (fair)
    // In minutes
    const exposureTimes = {
      1: 200,
      2: 100,
      3: 67,
      4: 50,
      5: 40,
      6: 33,
      7: 29,
      8: 25,
      9: 22,
      10: 20,
      11: 18,
      12: 17,
      13: 15,
      14: 14,
      15: 13,
    }

    const time = exposureTimes[Math.min(15, Math.max(1, Math.round(uvIndex)))] || 30

    if (time >= 60) {
      return `${Math.floor(time / 60)} hr ${time % 60} min`
    }
    return `${time} min`
  }

  if (!weather || !weather.forecast || !weather.forecast.forecastday || !weather.forecast.forecastday[0]) {
    return null
  }

  const { astro } = weather.forecast.forecastday[0]
  const uvIndex = weather.current?.uv || 0

  return (
    <CollapsibleWidget
      title="Solar Information"
      icon={<Sun className="h-3 w-3 xs:h-4 xs:w-4" />}
      className="solar-info-widget"
    >
      <div className="space-y-3">
        {/* Sun Journey Visualization */}
        <div className="relative h-12 xs:h-14 sm:h-16 mb-1">
          <div className="absolute inset-x-0 bottom-0 h-px bg-[#3c2a21]/50" />

          {/* Sky arc */}
          <div className="absolute inset-x-0 bottom-0 h-8 xs:h-10 sm:h-12 overflow-hidden">
            <div className="w-full h-24 xs:h-28 sm:h-32 bg-gradient-to-b from-[#3498db]/10 to-transparent rounded-full transform translate-y-1/2" />
          </div>

          {/* Sun position */}
          <motion.div
            className="absolute bottom-0"
            style={{ left: `${sunPosition}%` }}
            initial={{ y: 20, opacity: 0 }}
            animate={{
              y: -Math.sin((sunPosition / 100) * Math.PI) * 30,
              opacity: 1,
              scale: [0.9, 1, 0.9],
            }}
            transition={{
              y: { duration: 0.5 },
              opacity: { duration: 0.3 },
              scale: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            }}
          >
            <div className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50 flex items-center justify-center">
              <Sun className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3 text-yellow-100" />
            </div>
          </motion.div>

          {/* Sunrise marker */}
          <div className="absolute bottom-0 left-0 flex flex-col items-center">
            <Sunrise className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3 text-[#8B4513] mb-0.5 xs:mb-1" />
            <div className="w-px h-2 xs:h-2.5 sm:h-3 bg-[#3c2a21]/50" />
          </div>

          {/* Sunset marker */}
          <div className="absolute bottom-0 right-0 flex flex-col items-center">
            <Sunset className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3 text-[#8B4513] mb-0.5 xs:mb-1" />
            <div className="w-px h-2 xs:h-2.5 sm:h-3 bg-[#3c2a21]/50" />
          </div>
        </div>

        {/* Solar info details */}
        <div className="grid grid-cols-2 gap-1 xs:gap-1.5 sm:gap-2 text-[#d5bdaf] text-[8px] xs:text-[9px] sm:text-xs">
          <div className="flex items-center">
            <Sunrise className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3 mr-0.5 xs:mr-1 text-[#8B4513]" />
            <span>Sunrise: {formatTime(astro.sunrise)}</span>
          </div>
          <div className="flex items-center">
            <Sunset className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3 mr-0.5 xs:mr-1 text-[#8B4513]" />
            <span>Sunset: {formatTime(astro.sunset)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3 mr-0.5 xs:mr-1 text-[#8B4513]" />
            <span>Moonrise: {formatTime(astro.moonrise)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3 mr-0.5 xs:mr-1 text-[#8B4513]" />
            <span>Moonset: {formatTime(astro.moonset)}</span>
          </div>
        </div>

        {/* UV Exposure Information */}
        <div className="mt-1 xs:mt-1.5 sm:mt-2 pt-1 xs:pt-1.5 sm:pt-2 border-t border-[#3c2a21]/30">
          <div className="flex justify-between items-center mb-0.5 xs:mb-1">
            <div className="text-[8px] xs:text-[9px] sm:text-xs text-[#d5bdaf]">Safe Exposure Time:</div>
            <div className="text-[8px] xs:text-[9px] sm:text-xs font-medium text-yellow-400">
              {calculateExposureTime(uvIndex)}
            </div>
          </div>
          <p className="text-[6px] xs:text-[8px] sm:text-[10px] text-[#d5bdaf]/70">
            Maximum recommended sun exposure for fair skin without sun protection. Wear sunscreen to extend this time.
          </p>
        </div>
      </div>
    </CollapsibleWidget>
  )
}

