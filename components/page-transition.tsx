"use client"

import { type ReactNode, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"

interface PageTransitionProps {
  children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [isFirstMount, setIsFirstMount] = useState(true)

  useEffect(() => {
    setIsFirstMount(false)
  }, [])

  // Add this to the PageTransition component to fix scrolling issues
  useEffect(() => {
    // Enable scrolling on specific pages
    if (pathname === "/news" || pathname === "/ai" || pathname === "/favorites") {
      document.body.classList.add("scroll-enabled")
      document.documentElement.classList.add("scroll-enabled")
    } else {
      document.body.classList.remove("scroll-enabled")
      document.documentElement.classList.remove("scroll-enabled")
    }

    return () => {
      document.body.classList.remove("scroll-enabled")
      document.documentElement.classList.remove("scroll-enabled")
    }
  }, [pathname])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={isFirstMount ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

