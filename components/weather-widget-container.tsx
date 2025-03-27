"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface WidgetProps {
  id: string
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

export default function WeatherWidgetContainer({ id, title, icon, children }: WidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(0)

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.scrollHeight)
    }
  }, [children])

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="mb-4">
      <motion.div
        className="bg-black/30 backdrop-blur-md rounded-lg border border-[#3c2a21]/20 overflow-hidden"
        animate={{
          height: isExpanded ? "auto" : "min-content",
          transition: { duration: 0.3, ease: "easeInOut" },
        }}
      >
        {/* Widget Header */}
        <div className="p-3 flex items-center justify-between cursor-pointer" onClick={toggleExpand}>
          <div className="flex items-center">
            <div className="mr-2 text-[#8B4513]">{icon}</div>
            <div className="text-sm font-medium text-[#8B4513]">{title}</div>
          </div>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="h-4 w-4 text-[#d5bdaf]" />
          </motion.div>
        </div>

        {/* Widget Content */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              ref={containerRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-3 pt-0 border-t border-[#3c2a21]/20">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

