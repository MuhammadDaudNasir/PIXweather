"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sun, AlertTriangle, Info } from "lucide-react"

interface UVMapProps {
  uvIndex: number
  lat: number
  lon: number
}

export default function UVMap({ uvIndex, lat, lon }: UVMapProps) {
  const [forecast, setForecast] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUVForecast = async () => {
      try {
        setLoading(true)
        // In a real app, you would fetch this from a UV forecast API
        // For demo purposes, we'll generate mock data based on the current UV index

        const mockForecast = Array.from({ length: 24 }, (_, i) => {
          // Create a sine wave pattern for the day
          const hour = i
          const baseUV = uvIndex

          // UV peaks at noon (hour 12)
          const hourFactor = Math.sin((hour / 24) * Math.PI)
          const calculatedUV = Math.max(0, Math.round((baseUV * hourFactor + Number.EPSILON) * 10) / 10)

          return {
            hour,
            uv: calculatedUV,
            time: new Date(new Date().setHours(hour, 0, 0, 0)).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }
        })

        setForecast(mockForecast)
      } catch (error) {
        console.error("Error fetching UV forecast:", error)
      } finally {
        setLoading(false)
      }
    }

    if (uvIndex !== undefined) {
      fetchUVForecast()
    }
  }, [uvIndex, lat, lon])

  // Get UV risk level and color
  const getUVInfo = (uv: number) => {
    if (uv <= 2) return { level: "Low", color: "#3ECF8E", textColor: "text-green-500" }
    if (uv <= 5) return { level: "Moderate", color: "#FFD166", textColor: "text-yellow-500" }
    if (uv <= 7) return { level: "High", color: "#F9A826", textColor: "text-orange-500" }
    if (uv <= 10) return { level: "Very High", color: "#EF4444", textColor: "text-red-500" }
    return { level: "Extreme", color: "#9333EA", textColor: "text-purple-500" }
  }

  const uvInfo = getUVInfo(uvIndex)

  // Get protection time in minutes based on UV index and skin type
  // This is a simplified calculation for demonstration
  const getProtectionTime = (uv: number, skinType = 3) => {
    // Base minutes for different skin types (1-6, fair to dark)
    const baseTimes = [67, 100, 200, 300, 400, 500]
    const baseTime = baseTimes[skinType - 1] || 200

    // Calculate protection time based on UV index
    return Math.round(baseTime / uv)
  }

  const protectionTime = getProtectionTime(uvIndex)

  // Format protection time to hours and minutes
  const formatProtectionTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hours`
  }

  if (loading) {
    return (
      <div className="bg-black/30 backdrop-blur-md rounded-lg p-2 xs:p-3 border border-[#3c2a21]/20 h-[200px] xs:h-[240px] sm:h-[280px] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-5 h-5 xs:w-6 xs:h-6 border-2 border-t-[#8B4513] border-r-transparent border-b-transparent border-l-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-lg p-2 xs:p-3 border border-[#3c2a21]/20">
      <div className="flex items-center justify-between mb-2 xs:mb-3">
        <div className="flex items-center">
          <Sun className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2 text-[#8B4513]" />
          <div className="text-xs text-[#8B4513]">UV Index Map</div>
        </div>
        <div
          className={`text-xs font-medium px-1.5 xs:px-2 py-0.5 rounded-full ${uvInfo.textColor} bg-opacity-20`}
          style={{ backgroundColor: `${uvInfo.color}30` }}
        >
          {uvInfo.level} ({uvIndex})
        </div>
      </div>

      {/* UV Gauge */}
      <div className="relative h-6 xs:h-8 mb-3 xs:mb-4 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-purple-500 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((level) => (
            <div key={level} className="flex-1 border-r border-black/10 relative">
              {level % 3 === 0 && (
                <div className="absolute -bottom-4 xs:-bottom-5 w-full text-center">
                  <span className="text-[10px] xs:text-xs text-[#d5bdaf]/70">{level}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* UV Indicator */}
        <motion.div
          className="absolute top-0 w-3 xs:w-4 h-6 xs:h-8 bg-white rounded-full shadow-lg z-10"
          style={{
            left: `calc(${Math.min(uvIndex / 12, 1) * 100}% - 6px)`,
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>

      {/* UV Forecast Chart - Simplified for smaller screens */}
      <div className="relative h-24 xs:h-28 sm:h-32 mb-2">
        <div className="absolute inset-x-0 bottom-0 h-px bg-[#3c2a21]/30" />

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-4 xs:w-6 flex flex-col justify-between">
          <span className="text-[8px] xs:text-[10px] text-[#d5bdaf]/70">12</span>
          <span className="text-[8px] xs:text-[10px] text-[#d5bdaf]/70">6</span>
          <span className="text-[8px] xs:text-[10px] text-[#d5bdaf]/70">0</span>
        </div>

        {/* Chart */}
        <div className="ml-4 xs:ml-6 h-full flex">
          {forecast.map((item, index) => {
            const height = (item.uv / 12) * 100
            const uvInfo = getUVInfo(item.uv)

            return (
              <div key={index} className="flex-1 flex flex-col items-center justify-end">
                {index % 6 === 0 && (
                  <div className="absolute bottom-[-16px] xs:bottom-[-20px] text-[8px] xs:text-[10px] text-[#d5bdaf]/70">
                    {item.time}
                  </div>
                )}
                <motion.div
                  className="w-1 xs:w-1.5 sm:w-2 rounded-t-sm"
                  style={{
                    height: `${height}%`,
                    backgroundColor: uvInfo.color,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: index * 0.03 }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Protection advice - Simplified */}
      <div className="mt-4 xs:mt-6 pt-2 border-t border-[#3c2a21]/30">
        <div className="flex items-start mb-2">
          <AlertTriangle className="h-3 w-3 mr-1 text-[#8B4513] flex-shrink-0 mt-0.5" />
          <p className="text-[10px] xs:text-xs text-[#d5bdaf]">
            Unprotected skin can burn in approximately{" "}
            <span className="font-medium">{formatProtectionTime(protectionTime)}</span>
          </p>
        </div>

        <div className="flex items-start">
          <Info className="h-3 w-3 mr-1 text-[#8B4513] flex-shrink-0 mt-0.5" />
          <p className="text-[10px] xs:text-xs text-[#d5bdaf]/70">
            {uvIndex <= 2
              ? "Low risk. You can safely enjoy being outside."
              : uvIndex <= 5
                ? "Moderate risk. Seek shade during midday hours."
                : uvIndex <= 7
                  ? "High risk. Reduce time in the sun between 10-4."
                  : uvIndex <= 10
                    ? "Very high risk. Minimize sun exposure."
                    : "Extreme risk. Avoid sun exposure."}
          </p>
        </div>
      </div>
    </div>
  )
}

