"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface CollapsibleWidgetProps {
  title: string
  icon: React.ReactNode
  isDefaultOpen?: boolean
  mobileCollapsible?: boolean
  badge?: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  children: React.ReactNode
}

export default function CollapsibleWidget({
  title,
  icon,
  isDefaultOpen = true,
  mobileCollapsible = true,
  badge,
  className,
  headerClassName,
  contentClassName,
  children,
}: CollapsibleWidgetProps) {
  const [isOpen, setIsOpen] = useState(isDefaultOpen)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-black/30 backdrop-blur-md rounded-lg border border-[#3c2a21]/20 text-sm sm:text-base",
        className,
      )}
    >
      <div
        onClick={() => mobileCollapsible && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between p-1.5 xs:p-2 sm:p-2.5",
          mobileCollapsible ? "cursor-pointer" : "cursor-default",
          headerClassName,
        )}
      >
        <div className="flex items-center">
          <div className="mr-1 xs:mr-1.5 sm:mr-2 text-[#8B4513]">{icon}</div>
          <div className="text-[10px] xs:text-xs sm:text-sm text-[#8B4513]">{title}</div>
        </div>
        <div className="flex items-center">
          {badge && <div className="mr-1.5">{badge}</div>}
          {mobileCollapsible && (
            <motion.div initial={{ rotate: 0 }} animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 text-[#d5bdaf]" />
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={cn("px-1.5 pb-1.5 xs:px-2 xs:pb-2 sm:px-2.5 sm:pb-2.5", contentClassName)}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

