"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { MapPin, Cloud, Wind, Droplets, Thermometer, ChevronDown, ChevronUp, RefreshCw } from "lucide-react"

interface LocationCardProps {
  location: {
    name: string
    country: string
    continent: string
    description: string
  }
  weather: any
  image: string
  onNext: () => void
  onPrevious: () => void
  isLast: boolean
  isFirst: boolean
  isLoading?: boolean
}

export default function LocationCard({
  location,
  weather,
  image,
  onNext,
  onPrevious,
  isLast,
  isFirst,
  isLoading = false,
}: LocationCardProps) {
  if (!location) return null

  // Handle swipe gestures
  const handleDragEnd = (e, { offset, velocity }) => {
    const swipeThreshold = 50

    if (offset.y < -swipeThreshold && !isLast) {
      onNext()
    } else if (offset.y > swipeThreshold && !isFirst) {
      onPrevious()
    }
  }

  return (
    <motion.div
      className="relative w-full h-full"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src={image || "/placeholder.svg"} alt={location.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-6 pb-16 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-xl rounded-xl p-4 sm:p-6 max-w-2xl mx-auto w-full border border-[#3c2a21]/30"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#8B4513]">{location.name}</h2>
              <div className="flex items-center text-[#d5bdaf]">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-[#8B4513]" />
                <span className="text-sm sm:text-base">
                  {location.country}, {location.continent}
                </span>
              </div>
            </div>

            {weather?.current && (
              <div className="flex items-center bg-black/60 backdrop-blur-md rounded-lg p-2 shadow-lg border border-[#3c2a21]/30">
                <img
                  src={weather.current.condition.icon || "/placeholder.svg"}
                  alt={weather.current.condition.text}
                  width={40}
                  height={40}
                  className="mr-2 w-8 h-8 sm:w-10 sm:h-10"
                />
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-[#d5bdaf]">{weather.current.temp_c}°C</div>
                  <div className="text-xs text-[#8B4513]">{weather.current.condition.text}</div>
                </div>
              </div>
            )}
          </div>

          <p className="text-sm sm:text-base text-[#d5bdaf] mb-4">{location.description}</p>

          {weather?.current && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
              <div className="flex items-center bg-black/50 backdrop-blur-md rounded-lg p-2 border border-[#3c2a21]/30">
                <Wind className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#8B4513]" />
                <div>
                  <div className="text-xs text-[#8B4513]">Wind</div>
                  <div className="text-sm text-[#d5bdaf]">{weather.current.wind_kph} km/h</div>
                </div>
              </div>
              <div className="flex items-center bg-black/50 backdrop-blur-md rounded-lg p-2 border border-[#3c2a21]/30">
                <Droplets className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#8B4513]" />
                <div>
                  <div className="text-xs text-[#8B4513]">Humidity</div>
                  <div className="text-sm text-[#d5bdaf]">{weather.current.humidity}%</div>
                </div>
              </div>
              <div className="flex items-center bg-black/50 backdrop-blur-md rounded-lg p-2 border border-[#3c2a21]/30">
                <Thermometer className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#8B4513]" />
                <div>
                  <div className="text-xs text-[#8B4513]">Feels Like</div>
                  <div className="text-sm text-[#d5bdaf]">{weather.current.feelslike_c}°C</div>
                </div>
              </div>
              <div className="flex items-center bg-black/50 backdrop-blur-md rounded-lg p-2 border border-[#3c2a21]/30">
                <Cloud className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#8B4513]" />
                <div>
                  <div className="text-xs text-[#8B4513]">Cloud</div>
                  <div className="text-sm text-[#d5bdaf]">{weather.current.cloud}%</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-2">
            {!isFirst && (
              <button
                onClick={onPrevious}
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#8B4513] text-white"
              >
                <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
            {!isLast ? (
              <button
                onClick={onNext}
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#8B4513] text-white"
              >
                <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            ) : isLoading ? (
              <button
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#8B4513] text-white"
                disabled
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.div>
              </button>
            ) : null}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

