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

// Add this after the imports
const fadeInUpItem = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay,
      ease: "easeOut",
    },
  },
})

export default function NewsPage() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef(null)
  const loadingRef = useRef(null)

  // Intersection observer setup for each article
  const articleRefs = useRef<Array<HTMLElement | null>>([])
  const [articleInView, setArticleInView] = useState<boolean[]>([])

  // Add this at the top of the component, after the useState declarations
  useEffect(() => {
    // Enable scrolling on this page
    document.body.style.overflow = "auto"
    document.documentElement.style.overflow = "auto"

    return () => {
      // Reset to default when leaving the page
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"
    }
  }, [])

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

  useEffect(() => {
    articleRefs.current = articleRefs.current.slice(0, news.length)
    setArticleInView(Array(news.length).fill(false))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = articleRefs.current.findIndex((ref) => ref === entry.target)
          if (entry.isIntersecting) {
            setArticleInView((prev) => {
              const next = [...prev]
              next[index] = true
              return next
            })
          }
        })
      },
      { threshold: 0.1 },
    )

    articleRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref)
      }
    })

    return () => {
      articleRefs.current.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref)
        }
      })
    }
  }, [news])

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
              {news.map((article, index) => {
                return (
                  <motion.div
                    ref={(el) => (articleRefs.current[index] = el)}
                    key={`${article.title}-${index}`}
                    variants={fadeInUpItem(index * 0.05)}
                    initial="hidden"
                    animate={articleInView[index] ? "visible" : "hidden"}
                    className="relative"
                  >
                    <Card className="overflow-hidden border-0 bg-black/40 backdrop-blur-xl border border-[#3c2a21]/30 h-full flex flex-col transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg">
                      <div className="relative aspect-video">
                        <Image
                          src={article.urlToImage || "/placeholder.svg?height=400&width=600"}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <CardContent className="p-3 xs:p-4 flex-grow flex flex-col">
                        <h2 className="text-sm xs:text-base sm:text-lg font-bold text-[#d5bdaf] mb-2 line-clamp-2">
                          {article.title}
                        </h2>

                        <div className="flex items-center text-[10px] xs:text-xs text-[#8B4513] mb-2">
                          <Calendar className="h-2.5 w-2.5 mr-1" />
                          <span className="mr-3">{formatDate(article.publishedAt)}</span>
                          <Clock className="h-2.5 w-2.5 mr-1" />
                          <span>{formatTime(article.publishedAt)}</span>
                        </div>

                        <p className="text-[10px] xs:text-xs text-[#d5bdaf]/80 mb-3 line-clamp-3 flex-grow">
                          {article.description}
                        </p>

                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-[10px] xs:text-xs text-[#8B4513]">
                            {article.source?.name || "Unknown Source"}
                          </span>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-[10px] xs:text-xs text-[#8B4513] hover:text-[#d5bdaf] transition-colors"
                          >
                            Read more <ExternalLink className="h-2.5 w-2.5 ml-1" />
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Loading indicator */}
            <div ref={loadingRef} className="mt-6 xs:mt-8 flex justify-center items-center py-4">
              {loadingMore && (
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{
                      rotate: 360,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      rotate: { duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                      scale: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                    }}
                  >
                    <RefreshCw className="h-4 w-4 xs:h-5 xs:w-5 text-[#8B4513]" />
                  </motion.div>
                  <span className="text-xs xs:text-sm text-[#d5bdaf]">Loading more articles...</span>
                </div>
              )}

              {!hasMore && news.length > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-xs xs:text-sm text-[#8B4513]"
                >
                  You've reached the end of the news feed
                </motion.p>
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

