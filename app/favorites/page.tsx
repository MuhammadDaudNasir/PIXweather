"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, MapPin, Trash2, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import LoadingState from "@/components/loading-state"
import AnimatedTitle from "@/components/animated-title"
import { useToast } from "@/hooks/use-toast"
// Import the useInView hook
import { useInView } from "react-intersection-observer"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [imagesData, setImagesData] = useState({})
  const { toast } = useToast()

  // Create refs for each card
  const cardRefs = useRef([])

  useEffect(() => {
    // Load favorites from localStorage
    const loadFavorites = () => {
      const savedFavorites = JSON.parse(localStorage.getItem("pixweather-favorites") || "[]")
      setFavorites(savedFavorites)

      // Fetch images for each favorite location
      savedFavorites.forEach((location) => {
        fetchImageForLocation(location.name)
      })

      setLoading(false)
    }

    loadFavorites()
  }, [])

  const fetchImageForLocation = async (locationName) => {
    try {
      const response = await fetch(`/api/images?query=${locationName}`)
      const data = await response.json()

      if (data.hits && data.hits.length > 0) {
        setImagesData((prev) => ({
          ...prev,
          [locationName]: data.hits[0].largeImageURL,
        }))
      }
    } catch (error) {
      console.error(`Error fetching image for ${locationName}:`, error)
    }
  }

  const removeFromFavorites = (locationName) => {
    const updatedFavorites = favorites.filter((fav) => fav.name !== locationName)
    localStorage.setItem("pixweather-favorites", JSON.stringify(updatedFavorites))
    setFavorites(updatedFavorites)

    toast({
      title: "Removed from favorites",
      description: `${locationName} has been removed from your favorites`,
      variant: "default",
    })
  }

  // Add this animation variant function
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.3,
      },
    },
  }

  return (
    <div className="min-h-screen bg-black text-[#d5bdaf]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#3c2a21] bg-black/80 backdrop-blur-md px-safe">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-1 sm:mr-2 h-9 w-9 sm:h-10 sm:w-10">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#8B4513]" />
            </Button>
          </Link>
          <div className="flex items-center">
            <div className="h-7 w-7 mr-1.5 relative flex-shrink-0">
              <Image src="/icons/logo.png" alt="PixWeather Logo" fill className="object-contain" />
            </div>
            <AnimatedTitle />
            <span className="ml-1 sm:ml-2 text-xl sm:text-2xl font-bold text-[#8B4513] truncate">| Favorites</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-16">
        {loading ? (
          <LoadingState />
        ) : (
          <>
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-[#3c2a21]/30 text-center max-w-md">
                  <Heart className="h-12 w-12 text-[#8B4513] mx-auto mb-4 opacity-50" />
                  <h2 className="text-xl font-bold text-[#d5bdaf] mb-2">No favorites yet</h2>
                  <p className="text-[#d5bdaf]/80 mb-4">
                    Add locations to your favorites by tapping the heart icon while exploring.
                  </p>
                  <Link href="/">
                    <Button className="bg-[#8B4513] hover:bg-[#6d3710] text-white">Explore Locations</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {favorites.map((location, index) => {
                    // Initialize useInView for each card
                    const [ref, inView] = useInView({
                      triggerOnce: true,
                      threshold: 0.1,
                    })

                    // Store the ref in the cardRefs array
                    useEffect(() => {
                      cardRefs.current[index] = ref
                    }, [ref, index])

                    return (
                      <motion.div
                        ref={ref}
                        key={location.name}
                        custom={index}
                        variants={cardVariants}
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                        exit="exit"
                        layoutId={`favorite-${location.name}`}
                      >
                        <Card className="overflow-hidden border-0 bg-black/40 backdrop-blur-xl border border-[#3c2a21]/30 h-full hover:shadow-lg transition-all duration-300 hover:shadow-[#8B4513]/20">
                          <div className="relative aspect-video">
                            <Image
                              src={imagesData[location.name] || "/placeholder.svg?height=400&width=600"}
                              alt={location.name}
                              fill
                              className="object-cover transition-transform duration-700 hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-3 xs:p-4">
                              <h2 className="text-lg xs:text-xl font-bold text-white">{location.name}</h2>
                              <div className="flex items-center text-[#d5bdaf]/80">
                                <MapPin className="h-3 w-3 mr-1 text-[#8B4513]" />
                                <span className="text-xs xs:text-sm">
                                  {location.country}, {location.continent}
                                </span>
                              </div>
                            </div>
                          </div>
                          <CardContent className="p-3 xs:p-4">
                            <p className="text-xs xs:text-sm text-[#d5bdaf]/80 mb-3 xs:mb-4 line-clamp-2">
                              {location.description}
                            </p>
                            <div className="flex justify-between items-center">
                              <Link href={`/?location=${encodeURIComponent(location.name)}`}>
                                <Button className="bg-[#8B4513] hover:bg-[#6d3710] text-white text-xs xs:text-sm py-1 xs:py-1.5 h-auto">
                                  View Location
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFromFavorites(location.name)}
                                className="rounded-full bg-black/40 backdrop-blur-md border border-[#3c2a21]/30 text-[#d5bdaf] hover:bg-[#3c2a21]/50 h-8 w-8 xs:h-9 xs:w-9"
                              >
                                <Trash2 className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 py-2 bg-black/80 backdrop-blur-md border-t border-[#3c2a21] px-safe">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <p className="text-xs sm:text-sm text-[#d5bdaf]">© Muhammad Daud Nasir</p>
          <p className="text-xs text-[#8B4513]">Powered by Pineapple Technologies LLC</p>
        </div>
      </footer>
    </div>
  )
}

