"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, Clock, ExternalLink, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import LoadingState from "@/components/loading-state"
import AnimatedTitle from "@/components/animated-title"

export default function NewsPage() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef(null)
  const loadingRef = useRef(null)

  const fetchNews = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const response = await fetch(`/api/news?page=${pageNum}`)
      const data = await response.json()

      if (data.articles && data.articles.length > 0) {
        if (append) {
          setNews((prev) => [...prev, ...data.articles])
        } else {
          setNews(data.articles)
        }

        // Check if we have more articles to load
        setHasMore(data.articles.length >= 10) // Assuming 10 articles per page
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error fetching news:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )

    const currentObserverRef = loadingRef.current
    if (currentObserverRef) {
      observer.observe(currentObserverRef)
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef)
      }
    }
  }, [loadingRef, hasMore, loadingMore])

  // Initial data fetch
  useEffect(() => {
    fetchNews()
  }, [])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchNews(nextPage, true)
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
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
            <span className="ml-1 sm:ml-2 text-xl sm:text-2xl font-bold text-[#8B4513] truncate">| News</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-16">
        {loading ? (
          <LoadingState />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((article, index) => (
                <motion.div
                  key={`${article.title}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 1) }}
                >
                  <Card className="overflow-hidden border-0 bg-black/40 backdrop-blur-xl border border-[#3c2a21]/30 h-full flex flex-col">
                    <div className="relative aspect-video">
                      <Image
                        src={article.urlToImage || "/placeholder.svg?height=400&width=600"}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-4 flex-grow flex flex-col">
                      <h2 className="text-xl font-bold text-[#d5bdaf] mb-2 line-clamp-2">{article.title}</h2>

                      <div className="flex items-center text-xs text-[#8B4513] mb-3">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span className="mr-3">{formatDate(article.publishedAt)}</span>
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatTime(article.publishedAt)}</span>
                      </div>

                      <p className="text-sm text-[#d5bdaf]/80 mb-4 line-clamp-3 flex-grow">{article.description}</p>

                      <div className="flex justify-between items-center mt-auto">
                        <span className="text-xs text-[#8B4513]">{article.source?.name || "Unknown Source"}</span>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-[#8B4513] hover:text-[#d5bdaf] transition-colors"
                        >
                          Read more <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Loading indicator */}
            <div ref={loadingRef} className="mt-8 flex justify-center items-center py-4">
              {loadingMore && (
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <RefreshCw className="h-5 w-5 text-[#8B4513]" />
                  </motion.div>
                  <span className="text-[#d5bdaf]">Loading more articles...</span>
                </div>
              )}

              {!hasMore && news.length > 0 && (
                <p className="text-[#8B4513] text-sm">You've reached the end of the news feed</p>
              )}
            </div>
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

