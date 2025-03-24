"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

interface LocationGalleryProps {
  images: any[]
}

export default function LocationGallery({ images }: LocationGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {images.slice(0, 6).map((image, index) => (
          <motion.div key={image.id} variants={item}>
            <Card
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 bg-white"
              onClick={() => setSelectedImage(image.largeImageURL)}
            >
              <CardContent className="p-0 relative aspect-[4/3]">
                <Image
                  src={image.webformatURL || "/placeholder.svg"}
                  alt={`Location image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="text-white">
                    <p className="text-sm">Photo by {image.user}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none">
          {selectedImage && (
            <div className="relative w-full aspect-[16/9]">
              <Image src={selectedImage || "/placeholder.svg"} alt="Location image" fill className="object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

