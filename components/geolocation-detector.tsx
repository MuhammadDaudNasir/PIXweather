"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MapPin, X, Check, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface GeolocationDetectorProps {
  onLocationDetected: (location: { lat: number; lon: number; name: string; isFallback?: boolean }) => void
}

export default function GeolocationDetector({ onLocationDetected }: GeolocationDetectorProps) {
  const [detecting, setDetecting] = useState(false)
  const [locationName, setLocationName] = useState<string | null>(null)
  const [denied, setDenied] = useState(false)
  const { toast } = useToast()

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location detection",
        variant: "default",
      })
      return
    }

    setDetecting(true)

    try {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permissionStatus) => {
          if (permissionStatus.state === "denied") {
            handleGeolocationError({ code: 1, message: "Permission denied" })
            return
          }

          const geolocationOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }

          navigator.geolocation.getCurrentPosition(handleGeolocationSuccess, handleGeolocationError, geolocationOptions)
        })
        .catch((error) => {
          // Handle case where permissions API is not available
          // Try geolocation directly as fallback
          navigator.geolocation.getCurrentPosition(handleGeolocationSuccess, handleGeolocationError)
        })
    } catch (error) {
      // Final fallback if permissions query throws an error
      handleFallbackLocation()
    }
  }

  const handleGeolocationSuccess = async (position) => {
    try {
      const { latitude, longitude } = position.coords

      // Reverse geocode to get location name
      const response = await fetch(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}`)
      const data = await response.json()

      if (data.name) {
        setLocationName(data.name)
        onLocationDetected({
          lat: latitude,
          lon: longitude,
          name: data.name,
        })

        toast({
          title: "Location detected",
          description: `Weather for ${data.name}`,
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error detecting location:", error)
      handleFallbackLocation()
    } finally {
      setDetecting(false)
    }
  }

  const handleGeolocationError = (error) => {
    console.error("Geolocation error:", error)
    setDetecting(false)

    if (error.code === 1 || error.message?.includes("permission")) {
      setDenied(true)
      toast({
        title: "Location access denied",
        description: "Please enable location access in your browser settings or search for a location manually",
        variant: "default",
      })
    } else if (error.message?.includes("disabled") || error.message?.includes("permissions policy")) {
      toast({
        title: "Location access restricted",
        description: "Geolocation is disabled by permissions policy. Try searching for a location instead.",
        variant: "default",
      })
      handleFallbackLocation()
    } else {
      toast({
        title: "Location detection failed",
        description: error.message || "Could not determine your location",
        variant: "default",
      })
      handleFallbackLocation()
    }
  }

  const handleFallbackLocation = async () => {
    try {
      // Use IP-based location as fallback
      const response = await fetch("/api/ip-location")
      const data = await response.json()

      if (data.name) {
        toast({
          title: "Using approximate location",
          description: `We're showing weather for ${data.name} as we couldn't access your precise location`,
          variant: "default",
        })

        setLocationName(data.name)
        onLocationDetected({
          name: data.name,
          lat: data.lat,
          lon: data.lon,
          isFallback: true,
        })
      }
    } catch (error) {
      console.error("Error getting fallback location:", error)
      // If even the fallback fails, don't show any location detection UI
      setDenied(true)
    }
  }

  // Auto-detect on first load
  useEffect(() => {
    const hasDetectedBefore = localStorage.getItem("pixweather-location-detected")
    if (!hasDetectedBefore && !denied) {
      // Add a slight delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        detectLocation()
        localStorage.setItem("pixweather-location-detected", "true")
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [denied])

  return (
    <>
      {locationName ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/30 backdrop-blur-md rounded-lg p-3 border border-[#3c2a21]/20 flex items-center justify-between"
        >
          <div className="flex items-center">
            <div className="rounded-full bg-[#8B4513]/20 w-8 h-8 flex items-center justify-center mr-3">
              <Check className="h-4 w-4 text-[#8B4513]" />
            </div>
            <div>
              <div className="text-xs text-[#8B4513]">Current Location</div>
              <div className="text-sm text-[#d5bdaf] flex items-center">
                <MapPin className="h-3 w-3 mr-1 text-[#8B4513]" />
                {locationName}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocationName(null)}
            className="h-6 w-6 rounded-full bg-[#3c2a21]/50 p-0"
          >
            <X className="h-3 w-3 text-[#d5bdaf]" />
          </Button>
        </motion.div>
      ) : denied ? (
        <div className="bg-black/30 backdrop-blur-md rounded-lg p-3 border border-[#3c2a21]/20">
          <div className="flex items-center text-[#d5bdaf] mb-2">
            <AlertTriangle className="h-4 w-4 mr-2 text-[#8B4513]" />
            <p className="text-sm">Location access is not available</p>
          </div>
          <p className="text-xs text-[#d5bdaf]/70 mb-3">
            Please use the search bar at the top to find weather for specific locations.
          </p>
        </div>
      ) : (
        <Button
          onClick={detectLocation}
          disabled={detecting}
          className="bg-[#8B4513] hover:bg-[#6d3710] text-white w-full flex items-center justify-center rounded-lg py-2"
        >
          {detecting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="mr-2"
              >
                <MapPin className="h-4 w-4" />
              </motion.div>
              Detecting location...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" />
              Use my current location
            </>
          )}
        </Button>
      )}
    </>
  )
}

