"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import CollapsibleWidget from "@/components/collapsible-widget"

interface WeatherTimelineProps {
  forecastData: any
}

export default function WeatherTimeline({ forecastData }: WeatherTimelineProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Check if scrolling is possible
  const checkScrollPosition = () => {
    if (!timelineRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = timelineRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5) // 5px buffer
  }

  useEffect(() => {
    checkScrollPosition()
  }, [])

  const scroll = (direction: number) => {
    if (!timelineRef.current) return

    const scrollAmount = 150 * direction
    timelineRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })

    // Update scroll position after scrolling
    setTimeout(() => {
      if (!timelineRef.current) return
      setScrollPosition(timelineRef.current.scrollLeft)
      checkScrollPosition()
    }, 300)
  }

  if (!forecastData || !forecastData.forecast || !forecastData.forecast.forecastday) {
    return null
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      day: date.toLocaleDateString([], { weekday: "short" }),
      date: date.getDate(),
    }
  }

  return (
    <CollapsibleWidget
      title="7-Day Weather Timeline"
      icon={<Calendar className="h-3 w-3 xs:h-4 xs:w-4" />}
      badge={
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            className="h-5 w-5 rounded-full bg-[#3c2a21]/50 text-[#d5bdaf] hover:bg-[#8B4513]/70 disabled:opacity-30"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            className="h-5 w-5 rounded-full bg-[#3c2a21]/50 text-[#d5bdaf] hover:bg-[#8B4513]/70 disabled:opacity-30"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      }
    >
      <div
        ref={timelineRef}
        className="overflow-x-auto scrollbar-hide enhanced-scrollbar"
        onScroll={() => {
          setScrollPosition(timelineRef.current?.scrollLeft || 0)
          checkScrollPosition()
        }}
      >
        <div className="flex min-w-max">
          {forecastData.forecast.forecastday.map((day: any, index: number) => {
            const { day: dayName, date } = formatDate(day.date)
            const maxTemp = day.day.maxtemp_c
            const minTemp = day.day.mintemp_c

            // Calculate the height of the temperature bar (normalized)
            const tempRange = forecastData.forecast.forecastday.reduce(
              (acc: any, d: any) => {
                acc.max = Math.max(acc.max, d.day.maxtemp_c)
                acc.min = Math.min(acc.min, d.day.mintemp_c)
                return acc
              },
              { max: -100, min: 100 },
            )

            const maxHeight = 60 // max height in pixels
            const maxTempHeight = ((maxTemp - tempRange.min) / (tempRange.max - tempRange.min)) * maxHeight
            const minTempHeight = ((minTemp - tempRange.min) / (tempRange.max - tempRange.min)) * maxHeight

            return (
              <div key={index} className="flex flex-col items-center mx-1.5 xs:mx-2 w-12 xs:w-14">
                <div className="text-[10px] text-[#d5bdaf] mb-0.5">{dayName}</div>
                <div className="text-[10px] font-medium text-[#d5bdaf] mb-1">{date}</div>

                <div className="flex items-end justify-center h-14 mb-0.5">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-[#d5bdaf] mb-0.5">{maxTemp}°</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: maxTempHeight }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="w-3 bg-gradient-to-t from-[#8B4513]/50 to-[#8B4513] rounded-t-sm"
                    />
                  </div>
                  <div className="mx-0.5 h-full flex items-end">
                    <div className="w-px h-full bg-[#3c2a21]/30" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-[#d5bdaf] mb-0.5">{minTemp}°</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: minTempHeight }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="w-3 bg-gradient-to-t from-[#d5bdaf]/30 to-[#d5bdaf]/70 rounded-t-sm"
                    />
                  </div>
                </div>

                <div className="w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center">
                  <img
                    src={day.day.condition.icon || "/placeholder.svg"}
                    alt={day.day.condition.text}
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
                <div className="text-[10px] text-[#d5bdaf]/70 text-center line-clamp-1 w-full">
                  {day.day.condition.text}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </CollapsibleWidget>
  )
}

