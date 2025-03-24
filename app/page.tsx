"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ArrowDown, Info, Share2, Newspaper, RefreshCw } from "lucide-react"
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
  const containerRef = useRef(null)
  const loadMoreThreshold = 2 // Load more when user is this many items from the end

  const fetchLocationsData = async (isInitial = true) => {
    if (isInitial) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    // Get random locations
    const randomLocations = getRandomLocations(5)

    // If initial load, replace locations, otherwise append
    if (isInitial) {
      setLocations(randomLocations)
    } else {
      setLocations((prev) => [...prev, ...randomLocations])
    }

    try {
      // Fetch weather and images for all locations in parallel
      const weatherPromises = randomLocations.map((location) =>
        fetch(`/api/weather?query=${location.name}`).then((res) => res.json()),
      )

      const imagesPromises = randomLocations.map((location) =>
        fetch(`/api/images?query=${location.name}`).then((res) => res.json()),
      )

      const weatherResults = await Promise.all(weatherPromises)
      const imagesResults = await Promise.all(imagesPromises)

      // Create lookup objects for weather and images
      const newWeatherLookup = {}
      const newImagesLookup = {}

      randomLocations.forEach((location, index) => {
        newWeatherLookup[location.name] = weatherResults[index]
        newImagesLookup[location.name] = imagesResults[index]
      })

      // Update state - merge with existing data if not initial load
      setWeatherData((prev) => (isInitial ? newWeatherLookup : { ...prev, ...newWeatherLookup }))
      setImagesData((prev) => (isInitial ? newImagesLookup : { ...prev, ...newImagesLookup }))
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

  const handleSearch = (e) => {
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

      // Fetch data for the searched location
      Promise.all([
        fetch(`/api/weather?query=${searchQuery}`).then((res) => res.json()),
        fetch(`/api/images?query=${searchQuery}`).then((res) => res.json()),
      ])
        .then(([weatherData, imagesData]) => {
          setWeatherData({ [searchQuery]: weatherData })
          setImagesData({ [searchQuery]: imagesData })
          setCurrentIndex(0)
          setLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching data:", error)
          setLoading(false)
        })
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

  // Handle wheel events for custom scrolling
  useEffect(() => {
    const handleWheel = (e) => {
      if (loading) return

      // Determine scroll direction
      if (e.deltaY > 0 && currentIndex < locations.length - 1) {
        // Scrolling down
        setCurrentIndex((prev) => prev + 1)
      } else if (e.deltaY < 0 && currentIndex > 0) {
        // Scrolling up
        setCurrentIndex((prev) => prev - 1)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("wheel", handleWheel)
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel)
      }
    }
  }, [currentIndex, locations.length, loading])

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-[#d5bdaf]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#3c2a21] bg-black/80 backdrop-blur-md px-safe">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-7 w-7 mr-1.5 relative flex-shrink-0">
              <Image src="/icons/logo.png" alt="PixWeather Logo" fill className="object-contain" />
            </div>
            <AnimatedTitle />
          </div>

          <form onSubmit={handleSearch} className="relative w-full max-w-md mx-2 hidden sm:block">
            <Input
              type="text"
              placeholder="Search locations..."
              className="w-full bg-[#121212] border-[#3c2a21] text-[#d5bdaf] pl-10 pr-4 py-2 rounded-full focus:ring-[#8B4513] focus:border-[#8B4513]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] h-4 w-4" />
          </form>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {isSearchMode && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-[#3c2a21] text-[#d5bdaf] hover:bg-[#8B4513] h-9 w-9 sm:h-10 sm:w-10"
                onClick={handleReset}
              >
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
            <Link href="/news">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-[#3c2a21] text-[#d5bdaf] hover:bg-[#8B4513] h-9 w-9 sm:h-10 sm:w-10"
              >
                <Newspaper className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-[#3c2a21] text-[#d5bdaf] hover:bg-[#8B4513] h-9 w-9 sm:h-10 sm:w-10"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-[#3c2a21] text-[#d5bdaf] hover:bg-[#8B4513] h-9 w-9 sm:h-10 sm:w-10"
              onClick={() => setInfoModalOpen(true)}
            >
              <Info className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="sm:hidden px-4 pb-2">
          <form onSubmit={handleSearch} className="relative w-full">
            <Input
              type="text"
              placeholder="Search locations..."
              className="w-full bg-[#121212] border-[#3c2a21] text-[#d5bdaf] pl-10 pr-4 py-2 rounded-full focus:ring-[#8B4513] focus:border-[#8B4513] text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] h-4 w-4" />
          </form>
        </div>
      </header>

      <main className="pt-16 h-screen">
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
                      weather={weather}
                      image={image}
                      onNext={() => {
                        if (index < locations.length - 1) {
                          setCurrentIndex(index + 1)
                        }
                      }}
                      onPrevious={() => {
                        if (index > 0) {
                          setCurrentIndex(index - 1)
                        }
                      }}
                      isLast={index === locations.length - 1}
                      isFirst={index === 0}
                      isLoading={loadingMore && index === locations.length - 1}
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
      <footer className="fixed bottom-0 left-0 right-0 z-40 py-2 bg-black/80 backdrop-blur-md border-t border-[#3c2a21] px-safe">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <p className="text-xs sm:text-sm text-[#d5bdaf]">© Muhammad Daud Nasir</p>
          <p className="text-xs text-[#8B4513]">Powered by Pineapple Technologies LLC</p>
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

