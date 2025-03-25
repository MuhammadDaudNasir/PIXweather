"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseOver = (e: MouseEvent) => {
      if (
        (e.target as HTMLElement).tagName === "BUTTON" ||
        (e.target as HTMLElement).tagName === "A" ||
        (e.target as HTMLElement).closest("button") ||
        (e.target as HTMLElement).closest("a") ||
        (e.target as HTMLElement).classList.contains("cursor-pointer")
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseover", handleMouseOver)
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseover", handleMouseOver)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [isVisible])

  // Only show custom cursor on desktop
  const isMobile = typeof window !== "undefined" ? window.innerWidth <= 768 : false

  if (isMobile) return null

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 rounded-full bg-[#8B4513] mix-blend-difference pointer-events-none z-50"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
          scale: isHovering ? 1.5 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: "spring",
          mass: 0.2,
          stiffness: 800,
          damping: 30,
          scale: { duration: 0.15 },
          opacity: { duration: 0.2 },
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-32 h-32 rounded-full border border-[#8B4513] opacity-20 pointer-events-none z-40"
        animate={{
          x: mousePosition.x - 64,
          y: mousePosition.y - 64,
          opacity: isVisible ? 0.2 : 0,
        }}
        transition={{
          type: "spring",
          mass: 0.5,
          stiffness: 200,
          damping: 50,
          opacity: { duration: 0.2 },
        }}
      />
    </>
  )
}

