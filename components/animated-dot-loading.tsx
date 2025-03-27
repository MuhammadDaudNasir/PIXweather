"use client"

import { motion } from "framer-motion"

interface AnimatedDotLoadingProps {
  color?: string
  size?: number
  count?: number
  className?: string
}

export default function AnimatedDotLoading({
  color = "#8B4513",
  size = 4,
  count = 3,
  className,
}: AnimatedDotLoadingProps) {
  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="rounded-full"
          style={{
            backgroundColor: color,
            width: size,
            height: size,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  )
}

