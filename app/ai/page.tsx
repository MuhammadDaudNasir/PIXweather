"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sun,
  Newspaper,
  Calendar,
  MapPin,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import AnimatedTitle from "@/components/animated-title"
import { useToast } from "@/hooks/use-toast"
import SwipeableWidgets from "@/components/swipeable-widgets"
import AIChatSummarizer from "@/components/ai-chat-summarizer"
import UVMap from "@/components/uv-map"
import WeatherImpactNews from "@/components/weather-impact-news"
import WeatherForecast from "@/components/weather-forecast"
import PageTransition from "@/components/page-transition"

export default function AIPage() {
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState<string>("London")
  const [offlineMode, setOfflineMode] = useState(false)
  const { toast } = useToast()
  const [activeWidgetIndex, setActiveWidgetIndex] = useState(0)

  // Use the API key provided by the user
  const apiKey = "sk-abcdef1234567890abcdef1234567890abcdef12"

  // Enable scrolling on this page
  useEffect(() => {
    document.body.style.overflow = "auto"
    document.documentElement.style.overflow = "auto"

    return () => {
      // Reset to default when leaving the page
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"
    }
  }, [])

  // Fetch weather data for the widgets
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/weather?query=${location}&forecast=true&aqi=true&alerts=true`)
        const data = await response.json()

        if (data._notice) {
          setOfflineMode(true)
          toast({
            title: "Weather API Notice",
            description: data._notice,
            variant: "default",
          })
        }

        if (data.error) {
          throw new Error(data.error)
        }

        setWeather(data)
      } catch (error) {
        console.error("Error fetching weather data:", error)
        toast({
          title: "Error",
          description: "Failed to load weather data. Please try again.",
          variant: "default",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [location, toast])

  // Widget definitions
  const widgets = [
    {
      id: "location-info",
      title: "Location Information",
      icon: <MapPin className="h-4 w-4 mr-2" />,
      component:
        weather && weather.location ? (
          <div className="p-4 bg-black/20 rounded-b-lg">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-[#8B4513]/20 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-[#8B4513]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#d5bdaf]">{weather.location.name}</h3>
                  <p className="text-sm text-[#d5bdaf]/70">{weather.location.country}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/30 p-3 rounded-lg">
                  <p className="text-xs text-[#8B4513]">Region</p>
                  <p className="text-sm text-[#d5bdaf]">{weather.location.region || "N/A"}</p>
                </div>
                <div className="bg-black/30 p-3 rounded-lg">
                  <p className="text-xs text-[#8B4513]">Local Time</p>
                  <p className="text-sm text-[#d5bdaf]">{weather.location.localtime || "N/A"}</p>
                </div>
                <div className="bg-black/30 p-3 rounded-lg">
                  <p className="text-xs text-[#8B4513]">Latitude</p>
                  <p className="text-sm text-[#d5bdaf]">{weather.location.lat || "N/A"}</p>
                </div>
                <div className="bg-black/30 p-3 rounded-lg">
                  <p className="text-xs text-[#8B4513]">Longitude</p>
                  <p className="text-sm text-[#d5bdaf]">{weather.location.lon || "N/A"}</p>
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
        ) : (
          <div className="flex items-center justify-center h-64 bg-black/20 rounded-lg">
            <RefreshCw className="h-6 w-6 text-[#8B4513] animate-spin" />
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
      component: weather ? (
        <WeatherImpactNews locationName={weather.location?.name || location} />
      ) : (
        <div className="flex items-center justify-center h-64 bg-black/20 rounded-lg">
          <RefreshCw className="h-6 w-6 text-[#8B4513] animate-spin" />
        </div>
      ),
    },
    {
      id: "forecast",
      title: "7-Day Forecast",
      icon: <Calendar className="h-4 w-4 mr-2" />,
      component:
        weather && weather.forecast ? (
          <WeatherForecast forecast={weather} locationName={weather.location?.name || location} />
        ) : (
          <div className="flex items-center justify-center h-64 bg-black/20 rounded-lg">
            <RefreshCw className="h-6 w-6 text-[#8B4513] animate-spin" />
          </div>
        ),
    },
  ]

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-[#d5bdaf]">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#3c2a21] bg-black/80 backdrop-blur-md px-safe">
          <div className="container mx-auto px-4 h-16 flex items-center">
            <Link href="/">
              <Button variant="ghost" size="icon" className="mr-2 h-10 w-10">
                <ArrowLeft className="h-5 w-5 text-[#8B4513]" />
              </Button>
            </Link>
            <div className="flex items-center">
              <div className="h-7 w-7 mr-1.5 relative flex-shrink-0">
                <Image src="/icons/logo.png" alt="PixWeather Logo" fill className="object-contain" />
              </div>
              <AnimatedTitle />
              <span className="ml-2 text-2xl font-bold text-[#8B4513] truncate flex items-center">
                | <Sparkles className="h-5 w-5 mx-2 text-[#8B4513]" /> AI Tools
              </span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-4xl mx-auto">
            {/* Always show the offline mode banner since we're using a placeholder API key */}
            <div className="bg-yellow-500/20 backdrop-blur-md rounded-lg p-4 border border-yellow-500/30 mb-6">
              <div className="flex items-center text-yellow-500 mb-2">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <h3 className="font-medium text-lg">AI Features - Limited Functionality</h3>
              </div>
              <p className="text-sm text-[#d5bdaf] mb-2">
                The AI features are currently operating with limited functionality due to API connection issues.
                Responses are being simulated locally rather than using the OpenAI API.
              </p>
              <p className="text-xs text-[#d5bdaf]/70">
                You can still explore the interface and features, but responses will be generated locally rather than
                using the full AI capabilities.
              </p>
            </div>

            {/* Location Search */}
            <section className="mb-6">
              <div className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-[#3c2a21]/30">
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter location (e.g., London, Tokyo)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-black/20 border-[#3c2a21]/30 text-[#d5bdaf]"
                  />
                  <Button
                    onClick={() => {
                      if (location.trim()) {
                        setLoading(true)
                        // This will trigger the useEffect to fetch weather data
                      } else {
                        toast({
                          title: "Location required",
                          description: "Please enter a location name",
                          variant: "default",
                        })
                      }
                    }}
                    className="bg-[#8B4513] hover:bg-[#6d3710] text-white"
                  >
                    Update
                  </Button>
                </div>
              </div>
            </section>

            {/* Swipeable Widgets Section */}
            <section className="mb-8">
              <div className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-[#3c2a21]/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#8B4513] flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-[#8B4513]" />
                    Smart Widgets
                  </h2>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setActiveWidgetIndex((prev) => (prev === 0 ? widgets.length - 1 : prev - 1))}
                      className="h-8 w-8 rounded-full bg-[#3c2a21]/50 text-[#d5bdaf] hover:bg-[#8B4513]/70"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-[#d5bdaf]">
                      {activeWidgetIndex + 1} / {widgets.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setActiveWidgetIndex((prev) => (prev === widgets.length - 1 ? 0 : prev + 1))}
                      className="h-8 w-8 rounded-full bg-[#3c2a21]/50 text-[#d5bdaf] hover:bg-[#8B4513]/70"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-[#d5bdaf]/80 mb-6">
                  Swipe left or right to navigate between widgets. Each widget provides AI-enhanced information about
                  weather and related data.
                </p>

                <SwipeableWidgets
                  widgets={widgets.length > 0 ? widgets : []}
                  activeIndex={activeWidgetIndex}
                  setActiveIndex={setActiveWidgetIndex}
                />
              </div>
            </section>

            {/* AI Chat & Summarizer Section */}
            <section>
              <div className="bg-black/40 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-[#3c2a21]/30">
                <h2 className="text-xl sm:text-2xl font-bold text-[#8B4513] mb-4 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-[#8B4513]" />
                  AI Assistant
                </h2>
                <p className="text-sm text-[#d5bdaf]/80 mb-6">
                  Chat with our AI assistant or paste an article URL/text to get a summary. Ask questions about weather,
                  travel, or get article summaries.
                </p>

                {/* Pass the API key to the AIChatSummarizer component */}
                <AIChatSummarizer apiKey={apiKey} />
              </div>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 z-40 py-2 bg-black/80 backdrop-blur-md border-t border-[#3c2a21] px-safe">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <p className="text-xs sm:text-sm text-[#d5bdaf]">© Muhammad Daud Nasir</p>
            <p className="text-xs text-[#8B4513]">Powered by Pineapple Technologies LLC</p>
          </div>
        </footer>
      </div>
    </PageTransition>
  )
}

