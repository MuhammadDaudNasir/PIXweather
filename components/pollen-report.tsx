"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Flower, AlertCircle, Info } from "lucide-react"

interface PollenReportProps {
  lat: number
  lon: number
}

interface PollenData {
  grass: number
  tree: number
  weed: number
  overall: number
}

export default function PollenReport({ lat, lon }: PollenReportProps) {
  const [pollenData, setPollenData] = useState<PollenData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPollenData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/pollen?lat=${lat}&lon=${lon}`)
        const data = await response.json()

        if (data.error) {
          setError(data.error)
        } else {
          setPollenData(data)
        }
      } catch (error) {
        console.error("Error fetching pollen data:", error)
        setError("Failed to load pollen information")
      } finally {
        setLoading(false)
      }
    }

    if (lat && lon) {
      fetchPollenData()
    }
  }, [lat, lon])

  // Helper function to get severity level text and color
  const getSeverityInfo = (level: number) => {
    if (level === 0) return { text: "None", color: "text-green-500", bgColor: "bg-green-500/20" }
    if (level === 1) return { text: "Very Low", color: "text-green-500", bgColor: "bg-green-500/20" }
    if (level === 2) return { text: "Low", color: "text-blue-500", bgColor: "bg-blue-500/20" }
    if (level === 3) return { text: "Moderate", color: "text-yellow-500", bgColor: "bg-yellow-500/20" }
    if (level === 4) return { text: "High", color: "text-orange-500", bgColor: "bg-orange-500/20" }
    return { text: "Very High", color: "text-red-500", bgColor: "bg-red-500/20" }
  }

  if (loading) {
    return (
      <div className="bg-black/30 backdrop-blur-md rounded-lg p-3 border border-[#3c2a21]/20 h-24 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-6 h-6 border-2 border-t-[#8B4513] border-r-transparent border-b-transparent border-l-transparent rounded-full"
        />
      </div>
    )
  }

  if (error || !pollenData) {
    return (
      <div className="bg-black/30 backdrop-blur-md rounded-lg p-3 border border-[#3c2a21]/20">
        <div className="flex items-center mb-2">
          <Flower className="h-4 w-4 mr-2 text-[#8B4513]" />
          <div className="text-xs text-[#8B4513]">Pollen Report</div>
        </div>
        <div className="flex items-center justify-center text-xs text-[#d5bdaf] p-2">
          <Info className="h-4 w-4 mr-1 text-[#8B4513]" />
          {error || "Pollen data unavailable for this location"}
        </div>
      </div>
    )
  }

  const overallInfo = getSeverityInfo(pollenData.overall)

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-lg p-3 border border-[#3c2a21]/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Flower className="h-4 w-4 mr-2 text-[#8B4513]" />
          <div className="text-xs text-[#8B4513]">Pollen & Allergens Report</div>
        </div>
        <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${overallInfo.bgColor} ${overallInfo.color}`}>
          {overallInfo.text}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { name: "Grass", value: pollenData.grass, icon: "🌾" },
          { name: "Tree", value: pollenData.tree, icon: "🌳" },
          { name: "Weed", value: pollenData.weed, icon: "🌿" },
        ].map((item) => {
          const info = getSeverityInfo(item.value)
          return (
            <div key={item.name} className="text-center p-2 rounded-lg bg-black/20 border border-[#3c2a21]/10">
              <div className="text-lg mb-1">{item.icon}</div>
              <div className="text-xs text-[#d5bdaf] mb-1">{item.name}</div>
              <div className={`text-xs font-medium ${info.color}`}>{info.text}</div>
            </div>
          )
        })}
      </div>

      <div className="mt-2 pt-2 border-t border-[#3c2a21]/30">
        <div className="flex items-start">
          <AlertCircle className="h-3 w-3 mr-1 text-[#8B4513] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#d5bdaf]/70">
            People with allergies to these pollen types should take precautions when outdoors.
          </p>
        </div>
      </div>
    </div>
  )
}

