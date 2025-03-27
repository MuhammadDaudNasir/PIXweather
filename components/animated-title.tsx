"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Array of font families to cycle through
const fonts = ["font-serif", "font-mono", "font-sans", "font-cursive", "font-fantasy"]

// Array of animation variants
const animations = [
  {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.2 },
  },
  {
    initial: { opacity: 0, rotate: -10 },
    animate: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: 10 },
  },
  {
    initial: { opacity: 0, filter: "blur(8px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(8px)" },
  },
]

// Array of color combinations
const colorSchemes = [
  "text-[#8B4513]", // Default brown
  "text-amber-500",
  "text-yellow-500",
  "text-rose-500",
  "text-sky-500",
]

export default function AnimatedTitle() {
  const [currentFontIndex, setCurrentFontIndex] = useState(0)
  const [currentAnimIndex, setCurrentAnimIndex] = useState(0)
  const [currentColorIndex, setCurrentColorIndex] = useState(0)
  const [key, setKey] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      // Generate new random indices
      const newFontIndex = Math.floor(Math.random() * fonts.length)
      const newAnimIndex = Math.floor(Math.random() * animations.length)
      const newColorIndex = Math.floor(Math.random() * colorSchemes.length)

      // Update state
      setCurrentFontIndex(newFontIndex)
      setCurrentAnimIndex(newAnimIndex)
      setCurrentColorIndex(newColorIndex)
      setKey((prev) => prev + 1)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const currentFont = fonts[currentFontIndex]
  const currentAnim = animations[currentAnimIndex]
  const currentColor = colorSchemes[currentColorIndex]

  // Add letterSpacing animation to make the transition more dynamic
  const letterSpacing = {
    animate: {
      letterSpacing: ["-0.05em", "0.02em", "0em"],
      transition: { duration: 1, times: [0, 0.6, 1] },
    },
  }

  return (
    <div className="relative h-8 sm:h-10 flex items-center">
      <AnimatePresence mode="wait">
        <motion.div key={key} className="overflow-hidden">
          <motion.h1
            className={`text-xl sm:text-2xl font-bold ${currentFont} ${currentColor} truncate`}
            initial={currentAnim.initial}
            animate={{
              ...currentAnim.animate,
              ...letterSpacing.animate,
            }}
            exit={currentAnim.exit}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              duration: 0.5,
            }}
          >
            PixWeather
          </motion.h1>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

