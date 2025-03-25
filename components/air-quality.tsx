"use client"

import { motion } from "framer-motion"
import { Wind } from "lucide-react"

interface AirQualityProps {
  aqi: number
}

export default function AirQuality({ aqi }: AirQualityProps) {
  // Determine AQI level and color
  const getAqiInfo = (aqi: number) => {
    if (aqi <= 50) {
      return {
        level: "Good",
        color: "bg-green-500",
        textColor: "text-green-500",
        description: "Air quality is satisfactory, and air pollution poses little or no risk.",
      }
    } else if (aqi <= 100) {
      return {
        level: "Moderate",
        color: "bg-yellow-500",
        textColor: "text-yellow-500",
        description:
          "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.",
      }
    } else if (aqi <= 150) {
      return {
        level: "Unhealthy for Sensitive Groups",
        color: "bg-orange-500",
        textColor: "text-orange-500",
        description:
          "Members of sensitive groups may experience health effects. The general public is less likely to be affected.",
      }
    } else if (aqi <= 200) {
      return {
        level: "Unhealthy",
        color: "bg-red-500",
        textColor: "text-red-500",
        description:
          "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.",
      }
    } else if (aqi <= 300) {
      return {
        level: "Very Unhealthy",
        color: "bg-purple-500",
        textColor: "text-purple-500",
        description: "Health alert: The risk of health effects is increased for everyone.",
      }
    } else {
      return {
        level: "Hazardous",
        color: "bg-rose-700",
        textColor: "text-rose-700",
        description: "Health warning of emergency conditions: everyone is more likely to be affected.",
      }
    }
  }

  const { level, color, textColor, description } = getAqiInfo(aqi)

  // Calculate percentage for progress bar (0-500 scale for AQI)
  const percentage = Math.min((aqi / 500) * 100, 100)

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-lg p-3 border border-[#3c2a21]/20">
      <div className="flex items-center mb-2">
        <Wind className="h-4 w-4 mr-2 text-[#8B4513]" />
        <div>
          <div className="text-xs text-[#8B4513]">Air Quality</div>
          <div className="text-sm text-[#d5bdaf] flex items-center">
            <span className={`font-medium ${textColor}`}>{level}</span>
            <span className="mx-1">•</span>
            <span>AQI {aqi}</span>
          </div>
        </div>
      </div>

      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <p className="text-xs text-[#d5bdaf]/70 mt-2">{description}</p>
    </div>
  )
}

