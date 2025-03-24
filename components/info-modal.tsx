"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"

interface InfoModalProps {
  open: boolean
  onClose: () => void
}

export default function InfoModal({ open, onClose }: InfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 backdrop-blur-xl border border-[#3c2a21] text-[#d5bdaf] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#8B4513] text-xl flex items-center">
            <div className="h-6 w-6 mr-2 relative">
              <Image src="/icons/logo.png" alt="PixWeather Logo" fill className="object-contain" />
            </div>
            About PixWeather
          </DialogTitle>
          <DialogDescription className="text-[#d5bdaf]/80">Information about this application</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 p-1">
            <div>
              <h3 className="font-semibold text-[#8B4513] mb-1">Application</h3>
              <p className="text-sm">PixWeather Explorer v1.0</p>
            </div>

            <div>
              <h3 className="font-semibold text-[#8B4513] mb-1">Created By</h3>
              <p className="text-sm">© Muhammad Daud Nasir</p>
            </div>

            <div>
              <h3 className="font-semibold text-[#8B4513] mb-1">Company</h3>
              <p className="text-sm">Powered by Pineapple Technologies LLC</p>
            </div>

            <div>
              <h3 className="font-semibold text-[#8B4513] mb-1">Hosting</h3>
              <p className="text-sm">Running on Netlify</p>
            </div>

            <div>
              <h3 className="font-semibold text-[#8B4513] mb-1">Data Sources</h3>
              <ul className="text-sm list-disc list-inside space-y-1">
                <li>Weather information provided by WeatherAPI</li>
                <li>Images provided by Pixabay API</li>
                <li>News content provided by News API</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#8B4513] mb-1">Technologies</h3>
              <ul className="text-sm list-disc list-inside space-y-1">
                <li>Next.js 14</li>
                <li>React</li>
                <li>Tailwind CSS</li>
                <li>Framer Motion</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#8B4513] mb-1">Features</h3>
              <ul className="text-sm list-disc list-inside space-y-1">
                <li>Progressive Web App (PWA) support</li>
                <li>Offline capabilities</li>
                <li>Location-based weather information</li>
                <li>Latest news updates</li>
                <li>Social sharing</li>
              </ul>
            </div>

            <div className="pt-2">
              <p className="text-xs text-[#d5bdaf]/60 text-center">© 2023 Muhammad Daud Nasir. All rights reserved.</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

