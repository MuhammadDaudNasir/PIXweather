"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import {
  MapPin,
  Cloud,
  Wind,
  Droplets,
  Thermometer,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Calendar,
  AlertTriangle,
} from "lucide-react"
import FavoritesButton from "@/components/favorites-button"
import WeatherForecast from "@/components/weather-forecast"
import WeatherAnimation from "@/components/weather-animation"
import DynamicBackground from "@/components/dynamic-background"
import WeatherAlert from "@/components/weather-alert"
import AirQuality from "@/components/air-quality"
import WeatherRecommendation from "@/components/weather-recommendation"
import HourlyForecastAnimation from "@/components/hourly-forecast-animation"
import WeatherImpactNews from "@/components/weather-impact-news"
import WeatherTimeline from "@/components/weather-timeline"
import GeolocationDetector from "@/components/geolocation-detector"
import PollenReport from "@/components/pollen-report"
import CrowdsourcedWeather from "@/components/crowdsourced-weather"
import UVMap from "@/components/uv-map"

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
          className={`relative z-10 h-full flex flex-col justify-end p-2 xs:p-3 sm:p-4 pb-16 sm:pb-20 overflow-y-auto scrollbar-hide compact-ui`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-xl rounded-xl p-3 xs:p-4 sm:p-5 max-w-2xl mx-auto w-full border border-[#3c2a21]/30 space-y-3 xs:space-y-4"
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
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 xs:gap-3 sm:gap-4">
                    <div>
                      <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-[#8B4513] line-clamp-2">
                        {location.name}
                      </h2>
                      <div className="flex items-center text-[#d5bdaf]">
                        <MapPin className="h-3 w-3 mr-1 text-[#8B4513]" />
                        <span className="text-xs xs:text-sm">
                          {location.country}, {location.continent}
                        </span>
                      </div>
                    </div>

                    {weatherData?.current && (
                      <div className="flex items-center bg-black/60 backdrop-blur-md rounded-lg p-2 shadow-lg border border-[#3c2a21]/30 self-start">
                        <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 mr-2 relative">
                          <WeatherAnimation condition={weatherData.current.condition.text} isDay={isDay} />
                        </div>
                        <div>
                          <div className="text-lg xs:text-xl sm:text-2xl font-bold text-[#d5bdaf]">
                            {weatherData.current.temp_c}°C
                          </div>
                          <div className="text-xs text-[#8B4513]">{weatherData.current.condition.text}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-xs xs:text-sm text-[#d5bdaf] line-clamp-3">{location.description}</p>

                  {/* Weather recommendation */}
                  {weatherData?.current && <WeatherRecommendation weather={weatherData} />}

                  {/* Main weather stats */}
                  {weatherData?.current && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="flex items-center bg-black/50 backdrop-blur-md rounded-lg p-2 border border-[#3c2a21]/30">
                        <Wind className="h-4 w-4 mr-2 text-[#8B4513]" />
                        <div>
                          <div className="text-xs text-[#8B4513]">Wind</div>
                          <div className="text-xs xs:text-sm text-[#d5bdaf]">{weatherData.current.wind_kph} km/h</div>
                        </div>
                      </div>
                      <div className="flex items-center bg-black/50 backdrop-blur-md rounded-lg p-2 border border-[#3c2a21]/30">
                        <Droplets className="h-4 w-4 mr-2 text-[#8B4513]" />
                        <div>
                          <div className="text-xs text-[#8B4513]">Humidity</div>
                          <div className="text-xs xs:text-sm text-[#d5bdaf]">{weatherData.current.humidity}%</div>
                        </div>
                      </div>
                      <div className="flex items-center bg-black/50 backdrop-blur-md rounded-lg p-2 border border-[#3c2a21]/30">
                        <Thermometer className="h-4 w-4 mr-2 text-[#8B4513]" />
                        <div>
                          <div className="text-xs text-[#8B4513]">Feels Like</div>
                          <div className="text-xs xs:text-sm text-[#d5bdaf]">{weatherData.current.feelslike_c}°C</div>
                        </div>
                      </div>
                      <div className="flex items-center bg-black/50 backdrop-blur-md rounded-lg p-2 border border-[#3c2a21]/30">
                        <Cloud className="h-4 w-4 mr-2 text-[#8B4513]" />
                        <div>
                          <div className="text-xs text-[#8B4513]">Cloud</div>
                          <div className="text-xs xs:text-sm text-[#d5bdaf]">{weatherData.current.cloud}%</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NEW FEATURE: UV Map */}
                  {weatherData?.current && weatherData?.location && (
                    <UVMap
                      uvIndex={weatherData.current.uv}
                      lat={weatherData.location.lat}
                      lon={weatherData.location.lon}
                    />
                  )}

                  {/* NEW FEATURE: Hourly Forecast Animation */}
                  {forecast && forecast.forecast && (
                    <HourlyForecastAnimation hourlyData={forecast.forecast.forecastday[0].hour} metric="temp" />
                  )}

                  {/* Air Quality section if available */}
                  {airQuality && <AirQuality aqi={airQuality} />}

                  {/* NEW FEATURE: Weather Timeline */}
                  {forecast && <WeatherTimeline forecastData={forecast} />}

                  {/* NEW FEATURE: Weather Impact News */}
                  <WeatherImpactNews locationName={location.name} />

                  {/* Weather Forecast Section */}
                  {weatherData?.current && (
                    <div>
                      <button
                        onClick={toggleForecast}
                        className="flex items-center justify-center w-full py-1.5 xs:py-2 bg-black/30 backdrop-blur-md rounded-lg border border-[#3c2a21]/30 text-[#d5bdaf] hover:bg-[#3c2a21]/30 transition-colors text-xs xs:text-sm"
                      >
                        {loadingForecast ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="mr-2"
                          >
                            <RefreshCw className="h-3 w-3 xs:h-4 xs:w-4" />
                          </motion.div>
                        ) : (
                          <Calendar className="h-3 w-3 xs:h-4 xs:w-4 mr-2" />
                        )}
                        <span>{showForecast ? "Hide Forecast" : "Show 7-Day Forecast"}</span>
                      </button>

                      {showForecast && forecast && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3"
                        >
                          <WeatherForecast forecast={forecast} locationName={location.name} />
                        </motion.div>
                      )}
                    </div>
                  )}
                </>
              )
            )}

            {/* Show more/less button */}
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex items-center justify-center w-full py-1.5 xs:py-2 bg-black/30 backdrop-blur-md rounded-lg border border-[#3c2a21]/30 text-[#d5bdaf] hover:bg-[#3c2a21]/30 transition-colors mt-3 xs:mt-4 text-xs xs:text-sm"
            >
              {showMore ? "Show Less" : "Show More Features"}
            </button>

            {/* Advanced features (shown when "Show More" is clicked) */}
            {showMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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

            <div className="flex justify-center space-x-2 pt-2">
              {!isFirst && (
                <button
                  onClick={onPrevious}
                  className="flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full bg-[#8B4513] text-white cursor-pointer"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              )}

              {/* Favorites Button */}
              <FavoritesButton location={location} />

              {!isLast ? (
                <button
                  onClick={onNext}
                  className="flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full bg-[#8B4513] text-white cursor-pointer"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              ) : isLoading ? (
                <button
                  className="flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full bg-[#8B4513] text-white"
                  disabled
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <RefreshCw className="h-4 w-4" />
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

