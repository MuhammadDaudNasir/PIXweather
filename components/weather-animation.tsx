"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cloud, CloudRain, CloudSnow, CloudLightning, Sun, CloudSun } from "lucide-react"

interface WeatherAnimationProps {
  condition: string
  isDay: boolean
}

export default function WeatherAnimation({ condition, isDay }: WeatherAnimationProps) {
  const [particles, setParticles] = useState<React.ReactNode[]>([])

  // Normalize the condition text to handle various weather API responses
  const normalizedCondition = condition?.toLowerCase() || ""

  // Determine the weather type based on the condition text
  const getWeatherType = () => {
    if (
      normalizedCondition.includes("rain") ||
      normalizedCondition.includes("drizzle") ||
      normalizedCondition.includes("shower")
    ) {
      return "rain"
    } else if (
      normalizedCondition.includes("snow") ||
      normalizedCondition.includes("sleet") ||
      normalizedCondition.includes("ice")
    ) {
      return "snow"
    } else if (
      normalizedCondition.includes("thunder") ||
      normalizedCondition.includes("lightning") ||
      normalizedCondition.includes("storm")
    ) {
      return "thunder"
    } else if (normalizedCondition.includes("fog") || normalizedCondition.includes("mist")) {
      return "fog"
    } else if (normalizedCondition.includes("cloud") || normalizedCondition.includes("overcast")) {
      return isDay ? "cloudy-day" : "cloudy-night"
    } else if (normalizedCondition.includes("clear") || normalizedCondition.includes("sunny")) {
      return isDay ? "clear-day" : "clear-night"
    } else if (normalizedCondition.includes("partly")) {
      return isDay ? "partly-cloudy-day" : "partly-cloudy-night"
    } else {
      return isDay ? "clear-day" : "clear-night" // Default
    }
  }

  const weatherType = getWeatherType()

  // Generate particles based on weather type
  useEffect(() => {
    const newParticles: React.ReactNode[] = []

    if (weatherType === "rain") {
      // Generate rain drops
      for (let i = 0; i < 20; i++) {
        const left = `${Math.random() * 100}%`
        const animationDuration = 0.5 + Math.random() * 1
        const delay = Math.random() * 2
        const opacity = 0.3 + Math.random() * 0.7

        newParticles.push(
          <motion.div
            key={`rain-${i}`}
            className="absolute w-0.5 h-4 bg-blue-300 rounded-full"
            style={{ left }}
            initial={{ y: -20, opacity: 0 }}
            animate={{
              y: ["0%", "100%"],
              opacity: [0, opacity, 0],
            }}
            transition={{
              duration: animationDuration,
              repeat: Number.POSITIVE_INFINITY,
              delay,
              ease: "linear",
            }}
          />,
        )
      }
    } else if (weatherType === "snow") {
      // Generate snowflakes
      for (let i = 0; i < 15; i++) {
        const left = `${Math.random() * 100}%`
        const animationDuration = 3 + Math.random() * 3
        const delay = Math.random() * 5
        const size = 3 + Math.random() * 4

        newParticles.push(
          <motion.div
            key={`snow-${i}`}
            className="absolute bg-white rounded-full"
            style={{
              left,
              width: `${size}px`,
              height: `${size}px`,
            }}
            initial={{ y: -10, opacity: 0 }}
            animate={{
              y: ["0%", "100%"],
              x: ["-5%", "5%", "-5%"],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: animationDuration,
              repeat: Number.POSITIVE_INFINITY,
              delay,
              ease: "linear",
            }}
          />,
        )
      }
    } else if (weatherType === "thunder") {
      // Generate lightning flashes
      for (let i = 0; i < 2; i++) {
        const left = 30 + Math.random() * 40
        const delay = 2 + Math.random() * 5

        newParticles.push(
          <motion.div
            key={`lightning-${i}`}
            className="absolute bg-yellow-100 opacity-0"
            style={{
              left: `${left}%`,
              width: "20%",
              height: "60%",
              top: "20%",
              filter: "blur(8px)",
            }}
            animate={{
              opacity: [0, 0.7, 0.2, 0.9, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Number.POSITIVE_INFINITY,
              delay,
              times: [0, 0.1, 0.2, 0.3, 1],
              ease: "easeOut",
            }}
          />,
        )
      }
    } else if (weatherType === "fog") {
      // Generate fog patches
      for (let i = 0; i < 3; i++) {
        const top = 20 + i * 20
        const delay = i * 2

        newParticles.push(
          <motion.div
            key={`fog-${i}`}
            className="absolute bg-gray-200 opacity-0 rounded-full"
            style={{
              width: "120%",
              height: "30%",
              left: "-10%",
              top: `${top}%`,
              filter: "blur(15px)",
            }}
            animate={{
              opacity: [0, 0.4, 0],
              x: ["-5%", "5%", "-5%"],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              delay,
              ease: "easeInOut",
            }}
          />,
        )
      }
    }

    setParticles(newParticles)
  }, [weatherType])

  // Render the appropriate weather icon
  const renderWeatherIcon = () => {
    switch (weatherType) {
      case "rain":
        return <CloudRain className="h-12 w-12 text-blue-300" />
      case "snow":
        return <CloudSnow className="h-12 w-12 text-blue-100" />
      case "thunder":
        return <CloudLightning className="h-12 w-12 text-yellow-300" />
      case "fog":
        return <Cloud className="h-12 w-12 text-gray-300" />
      case "cloudy-day":
      case "cloudy-night":
        return <Cloud className="h-12 w-12 text-gray-300" />
      case "partly-cloudy-day":
      case "partly-cloudy-night":
        return <CloudSun className="h-12 w-12 text-yellow-300" />
      case "clear-day":
        return <Sun className="h-12 w-12 text-yellow-300" />
      case "clear-night":
        return (
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 bg-gray-300 rounded-full transform translate-x-1"></div>
            <div className="absolute inset-0 bg-[#121212] rounded-full transform -translate-x-1"></div>
          </div>
        )
      default:
        return <Sun className="h-12 w-12 text-yellow-300" />
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Weather particles */}
      {particles}

      {/* Main weather icon with animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={weatherType}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderWeatherIcon()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

