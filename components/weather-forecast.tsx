"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, ChevronLeft, Droplets, Wind, Thermometer, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WeatherForecastProps {
  forecast: any
  locationName: string
}

export default function WeatherForecast({ forecast, locationName }: WeatherForecastProps) {
  const [currentDay, setCurrentDay] = useState(0)

  if (!forecast || !forecast.forecast || !forecast.forecast.forecastday) {
    return null
  }

  const days = forecast.forecast.forecastday

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  const handlePrevDay = () => {
    setCurrentDay((prev) => Math.max(0, prev - 1))
  }

  const handleNextDay = () => {
    setCurrentDay((prev) => Math.min(days.length - 1, prev + 1))
  }

  const currentForecast = days[currentDay]

  return (
    <div className="bg-black/20 backdrop-blur-md rounded-lg overflow-hidden border border-[#3c2a21]/30">
      <div className="p-1.5 xs:p-2 sm:p-3">
        <div className="flex items-center justify-between mb-1 xs:mb-2">
          <div className="flex items-center gap-1 xs:gap-2">
            <img
              src={currentForecast.day.condition.icon || "/placeholder.svg"}
              alt={currentForecast.day.condition.text}
              width={24}
              height={24}
              className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7"
            />
            <div>
              <div className="text-[10px] xs:text-xs sm:text-sm font-bold text-[#d5bdaf]">
                {currentForecast.day.avgtemp_c}°C
              </div>
              <div className="text-[8px] xs:text-[10px] sm:text-xs text-[#8B4513]">
                {currentForecast.day.condition.text}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevDay}
              disabled={currentDay === 0}
              className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 rounded-full bg-[#3c2a21]/50 text-[#d5bdaf] hover:bg-[#8B4513]/70"
            >
              <ChevronLeft className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3" />
            </Button>
            <span className="text-[8px] xs:text-[10px] sm:text-xs text-[#d5bdaf] px-1">
              {formatDate(currentForecast.date)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextDay}
              disabled={currentDay === days.length - 1}
              className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 rounded-full bg-[#3c2a21]/50 text-[#d5bdaf] hover:bg-[#8B4513]/70"
            >
              <ChevronRight className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 xs:gap-1.5 sm:gap-2 mb-1 xs:mb-2">
          <div className="flex items-center bg-black/30 backdrop-blur-md rounded-md p-1 xs:p-1.5 sm:p-2 border border-[#3c2a21]/20">
            <Thermometer className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3 mr-1 xs:mr-1.5 text-[#8B4513]" />
            <div>
              <div className="text-[8px] xs:text-[9px] sm:text-[10px] text-[#8B4513]">Min/Max</div>
              <div className="text-[8px] xs:text-[9px] sm:text-xs text-[#d5bdaf]">
                {currentForecast.day.mintemp_c}°C / {currentForecast.day.maxtemp_c}°C
              </div>
            </div>
          </div>
          <div className="flex items-center bg-black/30 backdrop-blur-md rounded-md p-1 xs:p-1.5 sm:p-2 border border-[#3c2a21]/20">
            <Droplets className="h-2.5 w-2.5 xs:h-3 xs:w-3 mr-1.5 text-[#8B4513]" />
            <div>
              <div className="text-[10px] text-[#8B4513]">Precipitation</div>
              <div className="text-[10px] xs:text-xs text-[#d5bdaf]">{currentForecast.day.totalprecip_mm} mm</div>
            </div>
          </div>
          <div className="flex items-center bg-black/30 backdrop-blur-md rounded-md p-1 xs:p-1.5 sm:p-2 border border-[#3c2a21]/20">
            <Wind className="h-2.5 w-2.5 xs:h-3 xs:w-3 mr-1.5 text-[#8B4513]" />
            <div>
              <div className="text-[10px] text-[#8B4513]">Max Wind</div>
              <div className="text-[10px] xs:text-xs text-[#d5bdaf]">{currentForecast.day.maxwind_kph} km/h</div>
            </div>
          </div>
          <div className="flex items-center bg-black/30 backdrop-blur-md rounded-md p-1 xs:p-1.5 sm:p-2 border border-[#3c2a21]/20">
            <Sun className="h-2.5 w-2.5 xs:h-3 xs:w-3 mr-1.5 text-[#8B4513]" />
            <div>
              <div className="text-[10px] text-[#8B4513]">UV Index</div>
              <div className="text-[10px] xs:text-xs text-[#d5bdaf]">{currentForecast.day.uv}</div>
            </div>
          </div>
        </div>

        {/* Hourly forecast - more compact */}
        <div className="mt-1 xs:mt-1.5 sm:mt-2 pt-1 xs:pt-1.5 sm:pt-2 border-t border-[#3c2a21]/20">
          <div className="text-[8px] xs:text-[9px] sm:text-xs font-medium text-[#8B4513] mb-0.5 xs:mb-1">
            Hourly Forecast
          </div>
          <div className="flex overflow-x-auto pb-1 -mx-1.5 px-1.5 scrollbar-hide">
            {currentForecast.hour
              .filter((_, i) => i % 3 === 0) // Show every 3 hours
              .map((hour, index) => {
                const hourTime = new Date(hour.time).getHours()
                const formattedHour =
                  hourTime === 0
                    ? "12 AM"
                    : hourTime === 12
                      ? "12 PM"
                      : hourTime > 12
                        ? `${hourTime - 12} PM`
                        : `${hourTime} AM`

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex-shrink-0 w-8 xs:w-9 sm:w-10 flex flex-col items-center mr-1 bg-black/20 rounded-md p-0.5 xs:p-1"
                  >
                    <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-[#d5bdaf]">{formattedHour}</span>
                    <img
                      src={hour.condition.icon || "/placeholder.svg"}
                      alt={hour.condition.text}
                      width={16}
                      height={16}
                      className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 my-0.5"
                    />
                    <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-medium text-[#d5bdaf]">
                      {hour.temp_c}°C
                    </span>
                  </motion.div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}

