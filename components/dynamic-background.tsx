"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface DynamicBackgroundProps {
  weatherCondition: string
  isDay: boolean
  children: React.ReactNode
}

export default function DynamicBackground({ weatherCondition, isDay, children }: DynamicBackgroundProps) {
  const [gradientColors, setGradientColors] = useState<string[]>([])
  const [overlayOpacity, setOverlayOpacity] = useState(0.4)

  useEffect(() => {
    // Normalize the condition text
    const condition = weatherCondition?.toLowerCase() || ""

    // Set gradient colors based on weather and time of day
    if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("shower")) {
      setGradientColors(isDay ? ["#2c3e50", "#3498db", "#2c3e50"] : ["#1a1a2e", "#16213e", "#0f3460"])
      setOverlayOpacity(0.6)
    } else if (condition.includes("snow") || condition.includes("sleet") || condition.includes("ice")) {
      setGradientColors(isDay ? ["#e0e0e0", "#a1c4fd", "#c2e9fb"] : ["#141e30", "#243b55", "#141e30"])
      setOverlayOpacity(0.5)
    } else if (condition.includes("thunder") || condition.includes("lightning") || condition.includes("storm")) {
      setGradientColors(isDay ? ["#4b6cb7", "#182848", "#4b6cb7"] : ["#0f0c29", "#302b63", "#24243e"])
      setOverlayOpacity(0.7)
    } else if (condition.includes("fog") || condition.includes("mist")) {
      setGradientColors(isDay ? ["#d7d2cc", "#bdc3c7", "#d7d2cc"] : ["#2c3e50", "#4ca1af", "#2c3e50"])
      setOverlayOpacity(0.5)
    } else if (condition.includes("cloud") || condition.includes("overcast")) {
      setGradientColors(isDay ? ["#3498db", "#2c3e50", "#3498db"] : ["#0f2027", "#203a43", "#2c5364"])
      setOverlayOpacity(0.5)
    } else if (condition.includes("clear") || condition.includes("sunny")) {
      setGradientColors(isDay ? ["#2980b9", "#6dd5fa", "#ffffff"] : ["#0f2027", "#203a43", "#2c5364"])
      setOverlayOpacity(isDay ? 0.3 : 0.5)
    } else {
      // Default
      setGradientColors(isDay ? ["#2980b9", "#6dd5fa", "#ffffff"] : ["#0f2027", "#203a43", "#2c5364"])
      setOverlayOpacity(isDay ? 0.3 : 0.5)
    }
  }, [weatherCondition, isDay])

  // Create CSS gradient string
  const gradientStyle = {
    background: gradientColors.length > 0 ? `linear-gradient(to bottom, ${gradientColors.join(", ")})` : undefined,
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Dynamic gradient background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={gradientStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Weather-specific overlay effects */}
      <motion.div
        className="absolute inset-0 z-10 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: overlayOpacity }}
        transition={{ duration: 1 }}
      />

      {/* Content */}
      <div className="relative z-20 w-full h-full">{children}</div>
    </div>
  )
}

