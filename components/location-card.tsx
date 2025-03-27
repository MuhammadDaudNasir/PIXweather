"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { MapPin, ChevronDown, ChevronUp, RefreshCw, Calendar, AlertTriangle, Sun, Newspaper } from "lucide-react"
import FavoritesButton from "@/components/favorites-button"
import WeatherForecast from "@/components/weather-forecast"
import WeatherAnimation from "@/components/weather-animation"
import DynamicBackground from "@/components/dynamic-background"
import WeatherAlert from "@/components/weather-alert"
import HourlyForecastAnimation from "@/components/hourly-forecast-animation"
import WeatherImpactNews from "@/components/weather-impact-news"
import GeolocationDetector from "@/components/geolocation-detector"
import PollenReport from "@/components/pollen-report"
import CrowdsourcedWeather from "@/components/crowdsourced-weather"
import UVMap from "@/components/uv-map"
import SwipeableWidgets from "@/components/swipeable-widgets"

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
  onLocationDetected?: (location: any) => void
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
  onLocationDetected,
}: LocationCardProps) {
  const [forecast, setForecast] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [showForecast, setShowForecast] = useState(false)
  const [loadingForecast, setLoadingForecast] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [detectedLocation, setDetectedLocation] = useState<any>(null)
  const [dragEnabled, setDragEnabled] = useState(true)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [activeWidgetIndex, setActiveWidgetIndex] = useState(0)

  // Check if there's an error in the weather data
  const hasError = weather?.error === true

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640)
    }

    // Initial check
    checkScreenSize()

    // Add event listener
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  useEffect(() => {
    // Reset state when location changes
    setForecast(null)
    setShowForecast(false)
    setShowMore(false)
    setWeatherData(weather)
  }, [location.name, weather])

  if (!location) return null

  // Handle swipe gestures with improved sensitivity
  const handleDragEnd = (e, { offset, velocity }) => {
    if (!dragEnabled) return

    const swipeThreshold = 80 // Increased threshold

    if (offset.y < -swipeThreshold && !isLast) {
      onNext()
      // Temporarily disable dragging to prevent accidental double swipes
      setDragEnabled(false)
      setTimeout(() => setDragEnabled(true), 700)
    } else if (offset.y > swipeThreshold && !isFirst) {
      onPrevious()
      // Temporarily disable dragging to prevent accidental double swipes
      setDragEnabled(false)
      setTimeout(() => setDragEnabled(true), 700)
    }
  }

  const toggleForecast = async () => {
    setShowForecast(!showForecast)

    // Fetch forecast data if not already loaded
    if (!forecast && !loadingForecast) {
      setLoadingForecast(true)
      try {
        const response = await fetch(`/api/weather?query=${location.name}&forecast=true&aqi=true&alerts=true`)
        const data = await response.json()
        setForecast(data)
        setWeatherData(data) // Update weather data with more complete information
      } catch (error) {
        console.error("Error fetching forecast:", error)
      } finally {
        setLoadingForecast(false)
      }
    }
  }

  // Handle detected location
  const handleLocationDetected = (loc) => {
    if (!loc) return

    setDetectedLocation(loc)

    if (onLocationDetected) {
      onLocationDetected(loc)
    }
  }

  // Check if it's daytime
  const isDay = weatherData?.current?.is_day === 1

  // Get weather condition
  const weatherCondition = weatherData?.current?.condition?.text || ""

  // Get air quality if available
  const airQuality = weatherData?.current?.air_quality?.["us-epa-index"] || null

  // Get alerts if available
  const alerts = weatherData?.alerts?.alert || []

  const getWidgets = () => {
    if (!weather || !weather.current) return []

    return [
      {
        id: "location-info",
        title: "Location Information",
        icon: <MapPin className="h-4 w-4 mr-2" />,
        component: (
          <div className="p-4 bg-black/20 rounded-b-lg">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-[#8B4513]/20 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-[#8B4513]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#d5bdaf]">{location.name}</h3>
                  <p className="text-sm text-[#d5bdaf]/70">{location.country}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/30 p-3 rounded-lg">
                  <p className="text-xs text-[#8B4513]">Region</p>
                  <p className="text-sm text-[#d5bdaf]">{weather.location?.region || location.continent}</p>
                </div>
                <div className="bg-black/30 p-3 rounded-lg">
                  <p className="text-xs text-[#8B4513]">Local Time</p>
                  <p className="text-sm text-[#d5bdaf]">{weather.location?.localtime || "N/A"}</p>
                </div>
                <div className="bg-black/30 p-3 rounded-lg">
                  <p className="text-xs text-[#8B4513]">Latitude</p>
                  <p className="text-sm text-[#d5bdaf]">{weather.location?.lat || "N/A"}</p>
                </div>
                <div className="bg-black/30 p-3 rounded-lg">
                  <p className="text-xs text-[#8B4513]">Longitude</p>
                  <p className="text-sm text-[#d5bdaf]">{weather.location?.lon || "N/A"}</p>
                </div>
              </div>

              <div className="bg-black/30 p-3 rounded-lg">
                <p className="text-xs text-[#8B4513] mb-1">Current Weather</p>
                <div className="flex items-center">
                  {weather.current && (
                    <>
                      <img
                        src={weather.current.condition?.icon || "/placeholder.svg"}
                        alt={weather.current.condition?.text || "Weather"}
                        className="w-10 h-10 mr-3"
                      />
                      <div>
                        <p className="text-lg font-bold text-[#d5bdaf]">{weather.current.temp_c}°C</p>
                        <p className="text-sm text-[#d5bdaf]/70">{weather.current.condition?.text}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <p className="text-xs text-[#d5bdaf]/50 text-center">Swipe left or right to see more information</p>
            </div>
          </div>
        ),
      },
      {
        id: "uv-forecast",
        title: "UV Forecast",
        icon: <Sun className="h-4 w-4 mr-2" />,
        component:
          weather && weather.current && weather.location ? (
            <UVMap uvIndex={weather.current.uv} lat={weather.location.lat} lon={weather.location.lon} />
          ) : (
            <div className="flex items-center justify-center h-64 bg-black/20 rounded-lg">
              <RefreshCw className="h-6 w-6 text-[#8B4513] animate-spin" />
            </div>
          ),
      },
      {
        id: "weather-news",
        title: "Weather News",
        icon: <Newspaper className="h-4 w-4 mr-2" />,
        component: <WeatherImpactNews locationName={location.name} />,
      },
      {
        id: "forecast",
        title: "7-Day Forecast",
        icon: <Calendar className="h-4 w-4 mr-2" />,
        component:
          weather && weather.forecast ? (
            <WeatherForecast forecast={weather} locationName={location.name} />
          ) : (
            <div className="flex items-center justify-center h-64 bg-black/20 rounded-lg">
              <RefreshCw className="h-6 w-6 text-[#8B4513] animate-spin" />
            </div>
          ),
      },
    ]
  }

  return (
    <motion.div
      className="relative w-full h-full"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1} // Reduced elasticity
      onDragEnd={handleDragEnd}
      dragMomentum={false} // Disable momentum for more control
    >
      {/* Dynamic background based on weather and time of day */}
      <DynamicBackground weatherCondition={weatherCondition} isDay={isDay}>
        {/* Background Image with reduced opacity */}
        <div className="absolute inset-0 z-0 opacity-40">
          <Image src={image || "/placeholder.svg"} alt={location.name} fill className="object-cover" priority />
        </div>

        {/* Content */}
        <div
          className={`relative z-10 h-full flex flex-col justify-end p-1.5 xs:p-2 sm:p-3 md:p-4 pb-12 xs:pb-14 sm:pb-16 md:pb-20 overflow-y-auto scrollbar-hide compact-ui`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-xl rounded-xl p-2 xs:p-3 sm:p-4 md:p-5 max-w-xl mx-auto w-full border border-[#3c2a21]/30 space-y-2 xs:space-y-3 sm:space-y-4 transform scale-[0.85] origin-top"
          >
            {/* Geolocation detector - only show on the first card */}
            {isFirst && !detectedLocation && <GeolocationDetector onLocationDetected={handleLocationDetected} />}

            {/* Location information */}
            {detectedLocation && detectedLocation.name === location.name && !detectedLocation.isFallback && (
              <div className="bg-black/30 backdrop-blur-md rounded-lg p-2 xs:p-3 border border-[#3c2a21]/20 flex items-center">
                <div className="rounded-full bg-[#8B4513]/20 w-6 h-6 xs:w-8 xs:h-8 flex items-center justify-center mr-2 xs:mr-3">
                  <MapPin className="h-3 w-3 xs:h-4 xs:w-4 text-[#8B4513]" />
                </div>
                <div>
                  <div className="text-xs text-[#8B4513]">Your Current Location</div>
                  <div className="text-xs xs:text-sm text-[#d5bdaf] flex items-center">
                    <MapPin className="h-2 w-2 xs:h-3 xs:w-3 mr-1 text-[#8B4513]" />
                    {detectedLocation.name}
                  </div>
                </div>
              </div>
            )}

            {/* Weather alerts section */}
            {alerts && alerts.length > 0 && <WeatherAlert alerts={alerts} locationName={location.name} />}

            {weatherData?._notice && (
              <div className="bg-yellow-500/20 backdrop-blur-md rounded-lg p-2 xs:p-3 border border-yellow-500/30 mb-2 xs:mb-3">
                <div className="flex items-center text-yellow-500 mb-1">
                  <AlertTriangle className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                  <h3 className="font-medium text-xs xs:text-sm">Weather API Notice</h3>
                </div>
                <p className="text-[10px] xs:text-xs text-[#d5bdaf]">{weatherData._notice}</p>
              </div>
            )}

            {/* Weather data display */}
            {hasError ? (
              <div className="bg-black/60 backdrop-blur-md rounded-lg p-3 xs:p-4 border border-red-500/30 mb-3 xs:mb-4">
                <div className="flex items-center text-red-400 mb-2">
                  <AlertTriangle className="h-4 w-4 xs:h-5 xs:w-5 mr-2" />
                  <h3 className="font-medium text-sm xs:text-base">Weather data unavailable</h3>
                </div>
                <p className="text-xs xs:text-sm text-[#d5bdaf]">
                  {weather?.errorMessage || "Could not load weather data for this location. Please try again later."}
                </p>
              </div>
            ) : (
              weatherData?.current && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 xs:gap-2 sm:gap-3 md:gap-4">
                    <div>
                      <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-[#8B4513] line-clamp-2">
                        {location.name}
                      </h2>
                      <div className="flex items-center text-[#d5bdaf]">
                        <MapPin className="h-2.5 w-2.5 xs:h-3 xs:w-3 mr-0.5 xs:mr-1 text-[#8B4513]" />
                        <span className="text-[10px] xs:text-xs sm:text-sm">
                          {location.country}, {location.continent}
                        </span>
                      </div>
                    </div>

                    {weatherData?.current && (
                      <div className="flex items-center bg-black/60 backdrop-blur-md rounded-lg p-1.5 xs:p-2 shadow-lg border border-[#3c2a21]/30 self-start">
                        <div className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mr-1.5 xs:mr-2 relative">
                          <WeatherAnimation condition={weatherData.current.condition.text} isDay={isDay} />
                        </div>
                        <div>
                          <div className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-[#d5bdaf]">
                            {weatherData.current.temp_c}°C
                          </div>
                          <div className="text-[10px] xs:text-xs text-[#8B4513]">
                            {weatherData.current.condition.text}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-xs xs:text-sm text-[#d5bdaf] line-clamp-3">{location.description}</p>

                  {/* Replace all the existing widgets with the SwipeableWidgets component */}
                  <div className="mt-4">
                    {getWidgets().length > 0 && (
                      <SwipeableWidgets
                        widgets={getWidgets()}
                        activeIndex={activeWidgetIndex}
                        setActiveIndex={setActiveWidgetIndex}
                      />
                    )}
                  </div>
                </>
              )
            )}

            {/* Show more/less button */}
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex items-center justify-center w-full py-1 xs:py-1.5 sm:py-2 bg-black/30 backdrop-blur-md rounded-lg border border-[#3c2a21]/30 text-[#d5bdaf] hover:bg-[#3c2a21]/30 transition-colors mt-2 xs:mt-3 sm:mt-4 text-[10px] xs:text-xs sm:text-sm"
            >
              {showMore ? (
                <>
                  <ChevronUp className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4 mr-1 xs:mr-1.5" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4 mr-1 xs:mr-1.5" />
                  Show More Features
                </>
              )}
            </button>

            {/* Advanced features (shown when "Show More" is clicked) */}
            {showMore && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-3 xs:space-y-4"
              >
                {/* NEW FEATURE: Wind Speed Animation */}
                {forecast && forecast.forecast && (
                  <HourlyForecastAnimation hourlyData={forecast.forecast.forecastday[0].hour} metric="wind" />
                )}

                {/* NEW FEATURE: Pollen Report */}
                {weatherData?.location && (
                  <PollenReport lat={weatherData.location.lat} lon={weatherData.location.lon} />
                )}

                {/* NEW FEATURE: Crowdsourced Weather */}
                <CrowdsourcedWeather locationName={location.name} />
              </motion.div>
            )}

            <div className="flex justify-center space-x-1.5 xs:space-x-2 pt-1.5 xs:pt-2">
              {!isFirst && (
                <button
                  onClick={onPrevious}
                  className="flex items-center justify-center w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-[#8B4513] text-white cursor-pointer"
                >
                  <ChevronUp className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
                </button>
              )}

              {/* Favorites Button */}
              <FavoritesButton location={location} />

              {!isLast ? (
                <button
                  onClick={onNext}
                  className="flex items-center justify-center w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-[#8B4513] text-white cursor-pointer"
                >
                  <ChevronDown className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
                </button>
              ) : isLoading ? (
                <button
                  className="flex items-center justify-center w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-[#8B4513] text-white"
                  disabled
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <RefreshCw className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
                  </motion.div>
                </button>
              ) : null}
            </div>
          </motion.div>
        </div>
      </DynamicBackground>
    </motion.div>
  )
}

