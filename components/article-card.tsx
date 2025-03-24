"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Cloud, Thermometer } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ArticleCardProps {
  article: {
    id: string
    title: string
    excerpt: string
    image: string
    weather?: any
    featured?: boolean
  }
  featured?: boolean
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="overflow-hidden border-0 bg-gray-900 hover:bg-gray-800 transition-colors duration-300">
        <CardContent className="p-0">
          <div className={`relative ${featured ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
            <Image
              src={article.image || "/placeholder.svg?height=600&width=800"}
              alt={article.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className={`font-bold text-white mb-2 ${featured ? "text-3xl" : "text-xl"}`}>{article.title}</h2>

              <p className="text-gray-300 line-clamp-2 mb-4">{article.excerpt}</p>

              {article.weather && (
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                  <div className="flex items-center">
                    <Thermometer className="h-4 w-4 mr-1 text-pink-500" />
                    <span>{article.weather.temp_c}°C</span>
                  </div>
                  <div className="flex items-center">
                    <Cloud className="h-4 w-4 mr-1 text-pink-500" />
                    <span>{article.weather.condition.text}</span>
                  </div>
                </div>
              )}

              <button className="mt-4 text-pink-500 font-medium text-sm hover:text-pink-400 transition-colors duration-300">
                Read more →
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

