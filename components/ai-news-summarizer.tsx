"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Sparkles, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface AINewsSummarizerProps {
  locationName: string
  apiKey: string
}

export default function AINewsSummarizer({ locationName, apiKey }: AINewsSummarizerProps) {
  const [news, setNews] = useState<any[]>([])
  const [summaries, setSummaries] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [summarizing, setSummarizing] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/weather-news?location=${encodeURIComponent(locationName)}`)
        const data = await response.json()

        if (data.articles && data.articles.length > 0) {
          setNews(data.articles.slice(0, 3)) // Limit to 3 articles
        }
      } catch (error) {
        console.error("Error fetching news:", error)
        toast({
          title: "Error",
          description: "Failed to load news articles",
          variant: "default",
        })
      } finally {
        setLoading(false)
      }
    }

    if (locationName) {
      fetchNews()
    }
  }, [locationName, toast])

  const summarizeArticle = async (articleId: string, articleContent: string) => {
    try {
      setSummarizing((prev) => ({ ...prev, [articleId]: true }))

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputType: "text",
          content: articleContent,
          apiKey,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setSummaries((prev) => ({ ...prev, [articleId]: data.summary }))
    } catch (error) {
      console.error("Error summarizing article:", error)
      toast({
        title: "Summarization failed",
        description: "There was an error summarizing the article",
        variant: "default",
      })
    } finally {
      setSummarizing((prev) => ({ ...prev, [articleId]: false }))
    }
  }

  // Format publication date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 text-[#8B4513] animate-spin" />
      </div>
    )
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-[#d5bdaf]/70">No weather news available for {locationName}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {news.map((article) => (
        <div key={article.url} className="bg-black/20 backdrop-blur-md rounded-lg p-3 border border-[#3c2a21]/20">
          <h3 className="text-sm font-medium text-[#d5bdaf] mb-2">{article.title}</h3>

          <div className="flex justify-between items-center text-xs text-[#8B4513] mb-3">
            <span>{formatDate(article.publishedAt)}</span>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-[#d5bdaf] transition-colors"
            >
              Source <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>

          {summaries[article.url] ? (
            <div className="bg-black/30 p-3 rounded-md">
              <div className="flex items-center mb-2">
                <Sparkles className="h-3 w-3 mr-1 text-[#8B4513]" />
                <span className="text-xs font-medium text-[#8B4513]">AI Summary</span>
              </div>
              <p className="text-xs text-[#d5bdaf]/90">{summaries[article.url]}</p>
            </div>
          ) : (
            <Button
              onClick={() => summarizeArticle(article.url, article.description || article.title)}
              disabled={summarizing[article.url]}
              size="sm"
              className="w-full bg-[#3c2a21]/50 hover:bg-[#8B4513]/70 text-[#d5bdaf] text-xs"
            >
              {summarizing[article.url] ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-1.5" />
                  Generate AI Summary
                </>
              )}
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

