"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Newspaper, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface WeatherImpactNewsProps {
  locationName: string
}

export default function WeatherImpactNews({ locationName }: WeatherImpactNewsProps) {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchWeatherNews = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/weather-news?location=${encodeURIComponent(locationName)}`)
        const data = await response.json()

        if (data.articles && data.articles.length > 0) {
          setNews(data.articles.slice(0, 5)) // Limit to 5 articles
        }
      } catch (error) {
        console.error("Error fetching weather news:", error)
      } finally {
        setLoading(false)
      }
    }

    if (locationName) {
      fetchWeatherNews()
    }

    return () => {
      setNews([])
    }
  }, [locationName])

  // Auto cycle through news articles
  useEffect(() => {
    if (news.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [news.length])

  if (loading) {
    return (
      <div className="bg-black/30 backdrop-blur-md rounded-lg p-3 border border-[#3c2a21]/20 h-32 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-6 h-6 border-2 border-t-[#8B4513] border-r-transparent border-b-transparent border-l-transparent rounded-full"
        />
      </div>
    )
  }

  if (news.length === 0) {
    return null
  }

  const currentArticle = news[currentIndex]

  // Format publication date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-lg p-3 border border-[#3c2a21]/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Newspaper className="h-4 w-4 mr-2 text-[#8B4513]" />
          <div className="text-xs text-[#8B4513]">Weather News</div>
        </div>
        {news.length > 1 && (
          <div className="text-xs text-[#d5bdaf]">
            {currentIndex + 1} of {news.length}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentArticle.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h4 className="text-sm font-medium text-[#d5bdaf] line-clamp-2 mb-1">{currentArticle.title}</h4>
          <p className="text-xs text-[#d5bdaf]/70 line-clamp-2 mb-2">{currentArticle.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8B4513]">{formatDate(currentArticle.publishedAt)}</span>
            <a
              href={currentArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#8B4513] hover:text-[#d5bdaf] flex items-center transition-colors"
            >
              Read more <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-2 pt-2 border-t border-[#3c2a21]/30 flex justify-center">
        <Link href="/news" passHref>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-[#8B4513] hover:text-[#d5bdaf] hover:bg-[#3c2a21]/50"
          >
            View All Weather News
          </Button>
        </Link>
      </div>
    </div>
  )
}

