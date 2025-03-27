"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"

interface AnimatedListProps {
  items: React.ReactNode[]
  direction?: "up" | "down" | "left" | "right"
  staggerDelay?: number
  duration?: number
  className?: string
  itemClassName?: string
}

export default function AnimatedList({
  items,
  direction = "up",
  staggerDelay = 0.05,
  duration = 0.5,
  className,
  itemClassName,
}: AnimatedListProps) {
  const [inViewRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const getInitialAnimation = () => {
    switch (direction) {
      case "up":
        return { y: 20, opacity: 0 }
      case "down":
        return { y: -20, opacity: 0 }
      case "left":
        return { x: 20, opacity: 0 }
      case "right":
        return { x: -20, opacity: 0 }
      default:
        return { y: 20, opacity: 0 }
    }
  }

  const getFinalAnimation = () => {
    switch (direction) {
      case "up":
      case "down":
        return { y: 0, opacity: 1 }
      case "left":
      case "right":
        return { x: 0, opacity: 1 }
      default:
        return { y: 0, opacity: 1 }
    }
  }

  return (
    <div ref={inViewRef} className={className}>
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={index}
            className={itemClassName}
            initial={getInitialAnimation()}
            animate={inView ? getFinalAnimation() : getInitialAnimation()}
            transition={{
              duration,
              delay: inView ? index * staggerDelay : 0,
              ease: "easeOut",
            }}
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

