"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ArrowDown, Info, Share2, Newspaper, RefreshCw, Heart } from "lucide-react"
import { Input } from "@/components/ui/input"
import LocationCard from "@/components/location-card"
import LoadingState from "@/components/loading-state"
import InfoModal from "@/components/info-modal"
import ShareModal from "@/components/share-modal"
import { getRandomLocations } from "@/lib/locations"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import AnimatedTitle from "@/components/animated-title"
import Image from "next/image"

// Add this function at the top of the file, outside the component
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function HomePage() {
  const [locations, setLocations] = useState([])
  const [weatherData, setWeatherData] = useState({})
  const [imagesData, setImagesData] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [detectedLocation, setDetectedLocation] = useState(null)
  const containerRef = useRef(null)
  const loadMoreThreshold = 2 // Load more when user is this many items from the end

  // Add these refs for scroll handling
  const scrollTimeoutRef = useRef(null)
  const lastScrollTimeRef = useRef(0)
  const scrollCooldownRef = useRef(false)
  const accumulatedDeltaRef = useRef(0)

  // Then update the fetchLocationsData function inside the HomePage component:

  const fetchLocationsData = async (isInitial = true) => {
    if (isInitial) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    // Get random locations
    const randomLocations = getRandomLocations(isInitial ? 3 : 2) // Reduce the number of locations to fetch

    // If initial load, replace locations, otherwise append
    if (isInitial) {
      setLocations(randomLocations)
    } else {
      setLocations((prev) => [...prev, ...randomLocations])
    }

    try {
      // Fetch weather and images for all locations with throttling
      for (let i = 0; i < randomLocations.length; i++) {
        const location = randomLocations[i]

        // Add a delay between requests to avoid rate limiting
        if (i > 0) {
          await delay(1000) // 1 second delay between requests
        }

        try {
          const weatherResponse = await fetch(`/api/weather?query=${location.name}`)

          // Handle rate limiting
          if (weatherResponse.status === 429) {
            console.log("Rate limited, waiting before retry...")
            await delay(2000) // Wait 2 seconds before retry
            continue // Skip this iteration and try the next location
          }

          const weatherData = await weatherResponse.json()

          // If there's an error in the response, log it but continue
          if (weatherData.error) {
            console.error(`Error fetching weather for ${location.name}:`, weatherData.error)
            continue
          }

          // Update weather data for this location
          setWeatherData((prev) => ({
            ...prev,
            [location.name]: weatherData,
          }))

          // Fetch images for this location
          const imagesResponse = await fetch(`/api/images?query=${location.name}`)
          const imagesData = await imagesResponse.json()

          // Update images data for this location
          setImagesData((prev) => ({
            ...prev,
            [location.name]: imagesData,
          }))
        } catch (error) {
          console.error(`Error fetching data for ${location.name}:`, error)
          // Continue with the next location
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      if (isInitial) {
        setLoading(false)
      } else {
        setLoadingMore(false)
      }
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setLoading(true)
      setIsSearchMode(true)

      // Set a custom location based on search
      const searchLocation = {
        name: searchQuery,
        country: "Searched Location",
        continent: "Unknown",
        description: `Discover the beauty and culture of ${searchQuery}.`,
      }

      setLocations([searchLocation])

      try {
        // Fetch weather data first
        const weatherResponse = await fetch(`/api/weather?query=${searchQuery}`)

        // Handle non-OK responses
        if (!weatherResponse.ok) {
          if (weatherResponse.status === 429) {
            throw new Error("Too many requests. Please try again later.")
          }
          throw new Error(`Weather API error: ${weatherResponse.statusText}`)
        }

        const weatherData = await weatherResponse.json()

        // Check for errors in the response
        if (weatherData.error) {
          throw new Error(weatherData.error)
        }

        // Fetch images data
        const imagesResponse = await fetch(`/api/images?query=${searchQuery}`)
        const imagesData = await imagesResponse.json()

        // Update state
        setWeatherData({ [searchQuery]: weatherData })
        setImagesData({ [searchQuery]: imagesData })
        setCurrentIndex(0)
      } catch (error) {
        console.error("Error fetching data:", error)
        // Show a fallback location card with error message
        setWeatherData({
          [searchQuery]: {
            error: true,
            errorMessage: error.message || "Failed to load weather data",
          },
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleShare = () => {
    if (locations[currentIndex]) {
      setShareModalOpen(true)
    }
  }

  const handleReset = () => {
    setSearchQuery("")
    setIsSearchMode(false)
    setCurrentIndex(0)
    fetchLocationsData()
  }

  const handleLocationDetection = async (location) => {
    try {
      setLoading(true)

      // Create a custom location object
      const customLocation = {
        name: location.name,
        country: "Detected Location",
        continent: "Current Position",
        description: `This is your current location. The weather information is based on coordinates near ${location.name}.`,
      }

      setLocations([customLocation, ...locations])

      // Fetch weather and images for the detected location
      const [weatherData, imagesData] = await Promise.all([
        fetch(`/api/weather?query=${location.name}&forecast=true&aqi=true&alerts=true`).then((res) => res.json()),
        fetch(`/api/images?query=${location.name}`).then((res) => res.json()),
      ])

      // Update state
      setWeatherData((prev) => ({ [location.name]: weatherData, ...prev }))
      setImagesData((prev) => ({ [location.name]: imagesData, ...prev }))
      setCurrentIndex(0)
      setDetectedLocation(location)
    } catch (error) {
      console.error("Error setting up detected location:", error)
    } finally {
      setLoading(false)
    }
  }

  // Check if we need to load more data
  const checkLoadMore = () => {
    // If we're in search mode, don't load more
    if (isSearchMode) return

    // If we're close to the end of the list, load more data
    if (currentIndex >= locations.length - loadMoreThreshold && !loadingMore) {
      fetchLocationsData(false)
    }
  }

  useEffect(() => {
    fetchLocationsData()

    // Register service worker for PWA
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("ServiceWorker registration successful with scope: ", registration.scope)
          },
          (err) => {
            console.log("ServiceWorker registration failed: ", err)
          },
        )
      })
    }
  }, [])

  // Check if we need to load more when currentIndex changes
  useEffect(() => {
    checkLoadMore()
  }, [currentIndex])

  // Improved wheel event handler with debouncing and thresholds
  useEffect(() => {
    const handleWheel = (e) => {
      if (loading || scrollCooldownRef.current) return

      // Prevent default to avoid browser scrolling
      e.preventDefault()

      // Accumulate delta for smoother scrolling
      accumulatedDeltaRef.current += e.deltaY

      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Set a timeout to process the scroll after a short delay
      scrollTimeoutRef.current = setTimeout(() => {
        // Check if we've accumulated enough delta to trigger a page change
        const threshold = 100 // Higher threshold for trackpads

        if (accumulatedDeltaRef.current > threshold && currentIndex < locations.length - 1) {
          // Scrolling down
          setCurrentIndex((prev) => prev + 1)
          // Set cooldown to prevent rapid scrolling
          scrollCooldownRef.current = true
          setTimeout(() => {
            scrollCooldownRef.current = false
          }, 700) // 700ms cooldown between page changes
        } else if (accumulatedDeltaRef.current < -threshold && currentIndex > 0) {
          // Scrolling up
          setCurrentIndex((prev) => prev - 1)
          // Set cooldown to prevent rapid scrolling
          scrollCooldownRef.current = true
          setTimeout(() => {
            scrollCooldownRef.current = false
          }, 700) // 700ms cooldown between page changes
        }

        // Reset accumulated delta
        accumulatedDeltaRef.current = 0
      }, 50) // Short delay to collect scroll events
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel)
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [currentIndex, locations.length, loading])

  // Add touch event handlers for mobile swipe
  useEffect(() => {
    let touchStartY = 0
    let touchEndY = 0

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchMove = (e) => {
      // Prevent default to avoid browser scrolling
      e.preventDefault()
    }

    const handleTouchEnd = (e) => {
      if (loading || scrollCooldownRef.current) return

      touchEndY = e.changedTouches[0].clientY

      // Calculate swipe distance
      const swipeDistance = touchEndY - touchStartY
      const swipeThreshold = 80 // Higher threshold for touch

      if (swipeDistance < -swipeThreshold && currentIndex < locations.length - 1) {
        // Swipe up - go to next
        setCurrentIndex((prev) => prev + 1)
        scrollCooldownRef.current = true
        setTimeout(() => {
          scrollCooldownRef.current = false
        }, 700)
      } else if (swipeDistance > swipeThreshold && currentIndex > 0) {
        // Swipe down - go to previous
        setCurrentIndex((prev) => prev - 1)
        scrollCooldownRef.current = true
        setTimeout(() => {
          scrollCooldownRef.current = false
        }, 700)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("touchstart", handleTouchStart)
      container.addEventListener("touchmove", handleTouchMove, { passive: false })
      container.addEventListener("touchend", handleTouchEnd)
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart)
        container.removeEventListener("touchmove", handleTouchMove)
        container.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [currentIndex, locations.length, loading])

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-[#d5bdaf] overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#3c2a21] bg-black/80 backdrop-blur-md px-safe">
        <div className="container mx-auto px-2 xs:px-3 sm:px-4 h-12 xs:h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 mr-1 xs:mr-1.5 relative flex-shrink-0">
              <Image src="/icons/logo.png" alt="PixWeather Logo" fill className="object-contain" />
            </div>
            <AnimatedTitle />
          </div>

          <form onSubmit={handleSearch} className="relative w-full max-w-xs sm:max-w-md mx-2 hidden sm:block">
            <Input
              type="text"
              placeholder="Search locations..."
              className="w-full bg-[#121212] border-[#3c2a21] text-[#d5bdaf] pl-8 pr-3 py-1.5 text-sm rounded-full focus:ring-[#8B4513] focus:border-[#8B4513]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-[#8B4513] h-3.5 w-3.5" />
          </form>

          <div className="flex items-center space-x-1 sm:space-x-1.5">
            {isSearchMode && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-[#3c2a21] text-[#d5bdaf] hover:bg-[#8B4513] h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9"
                onClick={handleReset}
              >
                <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}
            <Link href="/favorites">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-[#3c2a21] text-[#d5bdaf] hover:bg-[#8B4513] h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9"
              >
                <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </Link>
            <Link href="/news">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-[#3c2a21] text-[#d5bdaf] hover:bg-[#8B4513] h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9"
              >
                <Newspaper className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-[#3c2a21] text-[#d5bdaf] hover:bg-[#8B4513] h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9"
              onClick={handleShare}
            >
              <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-[#3c2a21] text-[#d5bdaf] hover:bg-[#8B4513] h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9"
              onClick={() => setInfoModalOpen(true)}
            >
              <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile search bar - more compact */}
        <div className="sm:hidden px-2 xs:px-3 pb-1.5">
          <form onSubmit={handleSearch} className="relative w-full">
            <Input
              type="text"
              placeholder="Search locations..."
              className="w-full bg-[#121212] border-[#3c2a21] text-[#d5bdaf] pl-8 pr-3 py-1.5 rounded-full focus:ring-[#8B4513] focus:border-[#8B4513] text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-[#8B4513] h-3.5 w-3.5" />
          </form>
        </div>
      </header>

      <main className="pt-16 sm:pt-16 h-screen">
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingState key="loading" />
          ) : (
            <div className="relative h-[calc(100vh-4rem)] overflow-hidden">
              {locations.map((location, index) => {
                const weather = weatherData[location.name]
                const images = imagesData[location.name]?.hits || []
                const image = images.length > 0 ? images[0].largeImageURL : "/placeholder.svg?height=800&width=1200"

                return (
                  <motion.div
                    key={`${location.name}-${index}`}
                    className="absolute inset-0 w-full h-full"
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{
                      opacity: currentIndex === index ? 1 : 0,
                      y: currentIndex === index ? 0 : currentIndex > index ? "-100%" : "100%",
                      pointerEvents: currentIndex === index ? "auto" : "none",
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <LocationCard
                      location={location}
                      weather={weatherData[location.name]}
                      image={image}
                      onNext={() => {
                        if (index < locations.length - 1 && !scrollCooldownRef.current) {
                          setCurrentIndex(index + 1)
                          scrollCooldownRef.current = true
                          setTimeout(() => {
                            scrollCooldownRef.current = false
                          }, 700)
                        }
                      }}
                      onPrevious={() => {
                        if (index > 0 && !scrollCooldownRef.current) {
                          setCurrentIndex(index - 1)
                          scrollCooldownRef.current = true
                          setTimeout(() => {
                            scrollCooldownRef.current = false
                          }, 700)
                        }
                      }}
                      isLast={index === locations.length - 1}
                      isFirst={index === 0}
                      isLoading={loadingMore && index === locations.length - 1}
                      onLocationDetected={handleLocationDetection}
                    />
                  </motion.div>
                )
              })}

              {/* Loading more indicator */}
              {loadingMore && (
                <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-black/60 backdrop-blur-md rounded-full px-4 py-2 flex items-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="mr-2"
                    >
                      <RefreshCw className="h-4 w-4 text-[#8B4513]" />
                    </motion.div>
                    <span className="text-sm text-[#d5bdaf]">Loading more places...</span>
                  </motion.div>
                </div>
              )}

              {/* Scroll indicator */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                >
                  <ArrowDown className="h-6 w-6 text-white drop-shadow-lg" />
                </motion.div>
              </div>

              {/* Page indicator */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-2">
                {locations.length > 10 ? (
                  // Show simplified indicator for many locations
                  <div className="bg-black/40 backdrop-blur-md rounded-full px-2 py-1 text-xs text-[#d5bdaf]">
                    {currentIndex + 1}/{locations.length}
                  </div>
                ) : (
                  // Show dots for fewer locations
                  locations.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${currentIndex === idx ? "bg-[#8B4513]" : "bg-white/50"}`}
                      onClick={() => setCurrentIndex(idx)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 py-1.5 xs:py-2 bg-black/80 backdrop-blur-md border-t border-[#3c2a21] px-safe">
        <div className="container mx-auto px-2 xs:px-3 sm:px-4 flex justify-between items-center">
          <p className="text-[10px] xs:text-xs sm:text-sm text-[#d5bdaf]">© Muhammad Daud Nasir</p>
          <p className="text-[10px] xs:text-xs text-[#8B4513]">Powered by Pineapple Technologies LLC</p>
        </div>
      </footer>

      {/* Info Modal */}
      <InfoModal open={infoModalOpen} onClose={() => setInfoModalOpen(false)} />

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        location={locations[currentIndex] || null}
      />
    </div>
  )
}

