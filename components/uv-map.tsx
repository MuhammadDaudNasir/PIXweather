"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sun, AlertTriangle, Info } from "lucide-react"
import CollapsibleWidget from "@/components/collapsible-widget"

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

        // Use the OpenUV API for real data
        const response = await fetch(`https://api.openuv.io/api/v1/forecast?lat=${lat}&lng=${lon}`, {
          headers: {
            "x-access-token": "openuv-a2y4rm8qj9aue-io",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch UV forecast")
        }

        const data = await response.json()

        // Format the data for our chart
        if (data && data.result) {
          const formattedForecast = data.result.map((item: any) => {
            const date = new Date(item.uv_time)
            return {
              hour: date.getHours(),
              uv: item.uv,
              time: date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          })

          setForecast(formattedForecast)
        } else {
          // Fallback to mock data if API doesn't return expected format
          generateMockForecast()
        }
      } catch (error) {
        console.error("Error fetching UV forecast:", error)
        // Fallback to mock data on error
        generateMockForecast()
      } finally {
        setLoading(false)
      }
    }

    // Helper function to generate mock data as fallback
    const generateMockForecast = () => {
      const mockForecast = Array.from({ length: 24 }, (_, i) => {
        const hour = i
        const baseUV = uvIndex
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
    <CollapsibleWidget
      title="UV Index Map"
      icon={<Sun className="h-3 w-3 xs:h-4 xs:w-4" />}
      badge={
        <div
          className={`text-xs font-medium px-1.5 xs:px-2 py-0.5 rounded-full ${uvInfo.textColor} bg-opacity-20`}
          style={{ backgroundColor: `${uvInfo.color}30` }}
        >
          {uvInfo.level} ({uvIndex})
        </div>
      }
    >
      {/* UV Gauge */}
      <div className="relative h-4 xs:h-5 sm:h-6 mb-2 xs:mb-3 sm:mb-4 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-purple-500 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((level) => (
            <div key={level} className="flex-1 border-r border-black/10 relative">
              {level % 3 === 0 && (
                <div className="absolute -bottom-3 xs:-bottom-4 w-full text-center">
                  <span className="text-[8px] xs:text-[10px] text-[#d5bdaf]/70">{level}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* UV Indicator */}
        <motion.div
          className="absolute top-0 w-2 xs:w-2.5 sm:w-3 h-4 xs:h-5 sm:h-6 bg-white rounded-full shadow-lg z-10"
          style={{
            left: `calc(${Math.min(uvIndex / 12, 1) * 100}% - 4px)`,
          }}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>

      {/* UV Forecast Chart - Simplified for smaller screens */}
      <div className="relative h-16 xs:h-20 sm:h-24 mb-2">
        <div className="absolute inset-x-0 bottom-0 h-px bg-[#3c2a21]/30" />

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-3 xs:w-4 sm:w-5 flex flex-col justify-between">
          <span className="text-[6px] xs:text-[8px] sm:text-[10px] text-[#d5bdaf]/70">12</span>
          <span className="text-[6px] xs:text-[8px] sm:text-[10px] text-[#d5bdaf]/70">6</span>
          <span className="text-[6px] xs:text-[8px] sm:text-[10px] text-[#d5bdaf]/70">0</span>
        </div>

        {/* Chart */}
        <div className="ml-3 xs:ml-4 sm:ml-5 h-full flex">
          {forecast.map((item, index) => {
            const height = (item.uv / 12) * 100
            const uvInfo = getUVInfo(item.uv)

            return (
              <div key={index} className="flex-1 flex flex-col items-center justify-end">
                {index % 6 === 0 && (
                  <div className="absolute bottom-[-12px] xs:bottom-[-14px] sm:bottom-[-16px] text-[6px] xs:text-[8px] sm:text-[10px] text-[#d5bdaf]/70">
                    {item.time}
                  </div>
                )}
                <motion.div
                  className="w-0.5 xs:w-1 sm:w-1.5 rounded-t-sm"
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
    </CollapsibleWidget>
  )
}

