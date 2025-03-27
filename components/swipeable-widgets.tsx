"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Widget {
  id: string
  title: string
  icon: React.ReactNode
  component: React.ReactNode
}

interface SwipeableWidgetsProps {
  widgets: Widget[]
  activeIndex: number
  setActiveIndex: (index: number) => void
}

export default function SwipeableWidgets({ widgets, activeIndex, setActiveIndex }: SwipeableWidgetsProps) {
  const [dragDirection, setDragDirection] = useState<"left" | "right" | null>(null)
  const [dragDistance, setDragDistance] = useState(0)
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const [hasMounted, setHasMounted] = useState(false)

  // Add a check to make sure widgets exist and the activeIndex is valid
  // This goes at the top of the component, after all the useStates

  // Update the check at the beginning of the component
  if (!widgets || !Array.isArray(widgets) || widgets.length === 0) {
    return null // Don't render anything if there are no widgets
  }

  // Ensure activeIndex is within bounds
  const safeActiveIndex = Math.min(Math.max(0, activeIndex || 0), widgets.length - 1)

  // Update container width on resize
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout

    const updateDimensions = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        if (containerRef) {
          setContainerWidth(containerRef.offsetWidth)
        }
      }, 100) // Debounce the resize event
      setIsMobile(window.innerWidth < 768)
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    setHasMounted(true)

    return () => {
      window.removeEventListener("resize", updateDimensions)
      clearTimeout(resizeTimeout) // Clear the timeout on unmount
    }
  }, [])

  // Enhance the touch handling to be more responsive
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
    // Prevent default to avoid browser scrolling interference
    e.preventDefault()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isAnimating) return

    const touchX = e.touches[0].clientX
    const distance = touchX - touchStartX
    setDragDistance(distance)

    if (distance > 0) {
      setDragDirection("right")
    } else if (distance < 0) {
      setDragDirection("left")
    }

    // Prevent default to avoid browser scrolling interference
    e.preventDefault()
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isAnimating) return

    const touchEndX = e.changedTouches[0].clientX
    const distance = touchEndX - touchStartX
    const threshold = containerWidth * 0.15

    if (distance > threshold && safeActiveIndex > 0) {
      // Swiped right - go to previous
      setIsAnimating(true)
      setActiveIndex(safeActiveIndex - 1)
      setTimeout(() => setIsAnimating(false), 300)
    } else if (distance < -threshold && safeActiveIndex < widgets.length - 1) {
      // Swiped left - go to next
      setIsAnimating(true)
      setActiveIndex(safeActiveIndex + 1)
      setTimeout(() => setIsAnimating(false), 300)
    }

    setDragDirection(null)
    setDragDistance(0)
  }

  const handlePrev = () => {
    if (safeActiveIndex > 0 && !isAnimating) {
      setIsAnimating(true)
      setActiveIndex(safeActiveIndex - 1)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  const handleNext = () => {
    if (safeActiveIndex < widgets.length - 1 && !isAnimating) {
      setIsAnimating(true)
      setActiveIndex(safeActiveIndex + 1)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  // Calculate the opacity for the navigation indicators
  const getIndicatorOpacity = (index: number) => {
    if (index === safeActiveIndex) return 1
    return 0.4
  }

  // Add a debug message to help troubleshoot
  useEffect(() => {
    console.log("SwipeableWidgets mounted, container width:", containerWidth)
  }, [containerWidth])

  return (
    <div className="relative">
      {/* Widget Container */}
      <div
        ref={(node) => {
          setContainerRef(node)
        }}
        className="relative overflow-hidden rounded-lg"
        style={{ minHeight: "300px" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Update the AnimatePresence section to use safeActiveIndex and add a safety check */}
        <AnimatePresence initial={false} mode="wait">
          {widgets[safeActiveIndex] && widgets[safeActiveIndex].component ? (
            <motion.div
              key={widgets[safeActiveIndex].id}
              initial={{
                opacity: 0,
                x: dragDirection === "left" ? 100 : dragDirection === "right" ? -100 : 0,
              }}
              animate={{
                opacity: 1,
                x: dragDistance,
              }}
              exit={{
                opacity: 0,
                x: dragDirection === "left" ? -100 : dragDirection === "right" ? 100 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                opacity: { duration: 0.2 },
              }}
              className="w-full"
            >
              {/* Widget Title */}
              <div className="bg-black/40 backdrop-blur-md rounded-t-lg p-2 border-b border-[#3c2a21]/30 flex items-center">
                {widgets[safeActiveIndex].icon}
                <h3 className="text-base font-medium text-[#8B4513]">{widgets[safeActiveIndex].title}</h3>
              </div>

              {/* Widget Content */}
              <div className="bg-black/20 backdrop-blur-md rounded-b-lg">{widgets[safeActiveIndex].component}</div>
            </motion.div>
          ) : (
            <div className="bg-black/20 backdrop-blur-md rounded-lg p-4 flex items-center justify-center">
              <p className="text-sm text-[#d5bdaf]/70">Widget content unavailable</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Swipe Instructions */}
      <div className="text-center mt-1.5 text-[10px] text-[#d5bdaf]/60">
        Swipe left or right to navigate between widgets
      </div>

      {/* Update the navigation indicators section to use safeActiveIndex */}
      <div className="flex justify-center mt-3 space-x-1.5">
        {widgets.map((widget, index) => (
          <motion.div
            key={widget.id}
            className="w-1.5 h-1.5 rounded-full bg-[#8B4513] cursor-pointer"
            style={{ opacity: getIndicatorOpacity(index) }}
            animate={{ opacity: getIndicatorOpacity(index) }}
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true)
                setActiveIndex(index)
                setTimeout(() => setIsAnimating(false), 300)
              }
            }}
          />
        ))}
      </div>

      {/* Also update the navigation buttons to use safeActiveIndex */}
      {!isMobile && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={safeActiveIndex === 0 || isAnimating}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 text-white hover:bg-[#8B4513]/70 z-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={safeActiveIndex === widgets.length - 1 || isAnimating}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 text-white hover:bg-[#8B4513]/70 z-10"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}
    </div>
  )
}

