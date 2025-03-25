"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, ChevronLeft, Calendar, Droplets, Wind, Thermometer, Sun } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
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
    <Card className="bg-black/40 backdrop-blur-xl border border-[#3c2a21]/30 overflow-hidden">
      <CardContent className="p-2 xs:p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4">
          <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-[#8B4513]">{locationName} Forecast</h3>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevDay}
              disabled={currentDay === 0}
              className="h-6 w-6 xs:h-7 xs:w-7 rounded-full bg-[#3c2a21]/50 text-[#d5bdaf] hover:bg-[#8B4513]/70"
            >
              <ChevronLeft className="h-3 w-3 xs:h-4 xs:w-4" />
            </Button>
            <span className="text-xs xs:text-sm text-[#d5bdaf] flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(currentForecast.date)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextDay}
              disabled={currentDay === days.length - 1}
              className="h-6 w-6 xs:h-7 xs:w-7 rounded-full bg-[#3c2a21]/50 text-[#d5bdaf] hover:bg-[#8B4513]/70"
            >
              <ChevronRight className="h-3 w-3 xs:h-4 xs:w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center mb-3 xs:mb-4">
          <div className="mr-2 xs:mr-3">
            <img
              src={currentForecast.day.condition.icon || "/placeholder.svg"}
              alt={currentForecast.day.condition.text}
              width={40}
              height={40}
              className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12"
            />
          </div>
          <div>
            <div className="text-lg xs:text-xl sm:text-2xl font-bold text-[#d5bdaf]">
              {currentForecast.day.avgtemp_c}°C
            </div>
            <div className="text-xs xs:text-sm text-[#8B4513]">{currentForecast.day.condition.text}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center bg-black/30 backdrop-blur-md rounded-lg p-2 border border-[#3c2a21]/20">
            <Thermometer className="h-3 w-3 xs:h-4 xs:w-4 mr-2 text-[#8B4513]" />
            <div>
              <div className="text-xs text-[#8B4513]">Min/Max</div>
              <div className="text-xs xs:text-sm text-[#d5bdaf]">
                {currentForecast.day.mintemp_c}°C / {currentForecast.day.maxtemp_c}°C
              </div>
            </div>
          </div>
          <div className="flex items-center bg-black/30 backdrop-blur-md rounded-lg p-2 border border-[#3c2a21]/20">
            <Droplets className="h-3 w-3 xs:h-4 xs:w-4 mr-2 text-[#8B4513]" />
            <div>
              <div className="text-xs text-[#8B4513]">Precipitation</div>
              <div className="text-xs xs:text-sm text-[#d5bdaf]">{currentForecast.day.totalprecip_mm} mm</div>
            </div>
          </div>
          <div className="flex items-center bg-black/30 backdrop-blur-md rounded-lg p-2 border border-[#3c2a21]/20">
            <Wind className="h-3 w-3 xs:h-4 xs:w-4 mr-2 text-[#8B4513]" />
            <div>
              <div className="text-xs text-[#8B4513]">Max Wind</div>
              <div className="text-xs xs:text-sm text-[#d5bdaf]">{currentForecast.day.maxwind_kph} km/h</div>
            </div>
          </div>
          <div className="flex items-center bg-black/30 backdrop-blur-md rounded-lg p-2 border border-[#3c2a21]/20">
            <Sun className="h-3 w-3 xs:h-4 xs:w-4 mr-2 text-[#8B4513]" />
            <div>
              <div className="text-xs text-[#8B4513]">UV Index</div>
              <div className="text-xs xs:text-sm text-[#d5bdaf]">{currentForecast.day.uv}</div>
            </div>
          </div>
        </div>

        {/* Hourly forecast */}
        <div className="mt-3 xs:mt-4">
          <h4 className="text-xs xs:text-sm font-medium text-[#8B4513] mb-2">Hourly Forecast</h4>
          <div className="flex overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex-shrink-0 w-12 xs:w-14 sm:w-16 flex flex-col items-center mr-2 bg-black/20 rounded-lg p-1 xs:p-2"
                  >
                    <span className="text-xs text-[#d5bdaf] mb-1">{formattedHour}</span>
                    <img
                      src={hour.condition.icon || "/placeholder.svg"}
                      alt={hour.condition.text}
                      width={24}
                      height={24}
                      className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 my-1"
                    />
                    <span className="text-xs font-medium text-[#d5bdaf]">{hour.temp_c}°C</span>
                  </motion.div>
                )
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

