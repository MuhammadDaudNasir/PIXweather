"use client"

import { motion } from "framer-motion"

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-2xl font-medium text-[#8B4513] mb-8">Loading amazing places...</h2>

        <div className="flex justify-center">
          <div className="relative w-16 h-16">
            {[0, 1, 2].map((index) => (
              <motion.span
                key={index}
                className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-[#8B4513] opacity-0"
                animate={{
                  scale: [1, 1.5, 1.5],
                  opacity: [0.8, 0.2, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
            <motion.span
              className="absolute top-0 left-0 w-full h-full rounded-full bg-[#8B4513]"
              animate={{ scale: [0.8, 1, 0.8] }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

