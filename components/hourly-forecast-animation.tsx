"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Thermometer, Wind } from "lucide-react"

interface HourlyForecastAnimationProps {
  hourlyData: any[]
  metric: "temp" | "wind"
}

export default function HourlyForecastAnimation({ hourlyData, metric }: HourlyForecastAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto cycle through hours
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % hourlyData.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [hourlyData.length])

  if (!hourlyData || hourlyData.length === 0) return null

  // Format time for display
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Get min and max values for scaling
  const values = hourlyData.map((hour) => (metric === "temp" ? hour.temp_c : hour.wind_kph))
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  // Calculate normalized value (0 to 1) for animation
  const getNormalizedValue = (value: number) => {
    if (maxValue === minValue) return 0.5
    return (value - minValue) / (maxValue - minValue)
  }

  // Dynamic colors based on values
  const getColor = (value: number) => {
    if (metric === "temp") {
      if (value > 30) return "#ef4444" // hot
      if (value > 20) return "#f97316" // warm
      if (value > 10) return "#22c55e" // mild
      return "#3b82f6" // cold
    } else {
      if (value > 40) return "#ef4444" // strong wind
      if (value > 25) return "#f97316" // moderate wind
      if (value > 10) return "#22c55e" // light wind
      return "#3b82f6" // calm
    }
  }

  const currentHour = hourlyData[currentIndex]
  const currentValue = metric === "temp" ? currentHour.temp_c : currentHour.wind_kph
  const normalizedValue = getNormalizedValue(currentValue)
  const color = getColor(currentValue)

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-lg p-3 border border-[#3c2a21]/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {metric === "temp" ? (
            <Thermometer className="h-4 w-4 mr-2 text-[#8B4513]" />
          ) : (
            <Wind className="h-4 w-4 mr-2 text-[#8B4513]" />
          )}
          <div className="text-xs text-[#8B4513]">{metric === "temp" ? "Temperature" : "Wind Speed"} Forecast</div>
        </div>
        <div className="text-xs text-[#d5bdaf]">{formatTime(currentHour.time)}</div>
      </div>

      <div className="w-full h-16 relative mb-2">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-700 rounded-full"></div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center absolute bottom-2 text-center"
            style={{ left: `${normalizedValue * 100}%`, transform: "translateX(-50%)" }}
          >
            <motion.div
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="rounded-full w-10 h-10 flex items-center justify-center"
              style={{ backgroundColor: `${color}30` }}
            >
              <span className="text-sm font-bold" style={{ color }}>
                {metric === "temp" ? `${currentValue}°C` : `${currentValue} km/h`}
              </span>
            </motion.div>

            <motion.div
              className="absolute bottom-0 w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
              animate={{ y: [-5, 0, -5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-5 gap-1 text-xs text-[#d5bdaf]/70">
        {hourlyData
          .filter((_, i) => i % Math.ceil(hourlyData.length / 5) === 0)
          .slice(0, 5)
          .map((hour, i) => (
            <div key={i} className="text-center">
              {formatTime(hour.time)}
            </div>
          ))}
      </div>
    </div>
  )
}

