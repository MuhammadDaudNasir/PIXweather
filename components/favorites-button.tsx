"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface FavoritesButtonProps {
  location: {
    name: string
    country: string
    continent: string
    description: string
  }
}

export default function FavoritesButton({ location }: FavoritesButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const { toast } = useToast()

  // Check if location is in favorites on mount
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("pixweather-favorites") || "[]")
    const isInFavorites = favorites.some((fav) => fav.name === location.name)
    setIsFavorite(isInFavorites)
  }, [location.name])

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("pixweather-favorites") || "[]")

    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter((fav) => fav.name !== location.name)
      localStorage.setItem("pixweather-favorites", JSON.stringify(updatedFavorites))
      setIsFavorite(false)

      toast({
        title: "Removed from favorites",
        description: `${location.name} has been removed from your favorites`,
        variant: "default",
      })
    } else {
      // Add to favorites
      const updatedFavorites = [...favorites, location]
      localStorage.setItem("pixweather-favorites", JSON.stringify(updatedFavorites))
      setIsFavorite(true)

      toast({
        title: "Added to favorites",
        description: `${location.name} has been added to your favorites`,
        variant: "default",
      })
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFavorite}
      className={`rounded-full ${
        isFavorite
          ? "bg-[#8B4513] text-white hover:bg-[#6d3710]"
          : "bg-black/40 backdrop-blur-md border border-[#3c2a21]/30 text-[#d5bdaf] hover:bg-[#3c2a21]/50"
      } w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10`}
    >
      <motion.div animate={isFavorite ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
        <Heart className={`h-4 w-4 ${isFavorite ? "fill-white" : ""}`} />
      </motion.div>
    </Button>
  )
}

