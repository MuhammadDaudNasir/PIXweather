"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Linkedin, Copy, Check, Share2 } from "lucide-react"
import Image from "next/image"

interface ShareModalProps {
  open: boolean
  onClose: () => void
  location: any
}

export default function ShareModal({ open, onClose, location }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  if (!location) return null

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}?location=${encodeURIComponent(location.name)}` : ""

  const shareTitle = `Check out ${location.name} on PixWeather Explorer!`
  const shareText = `I'm exploring ${location.name} on PixWeather Explorer. ${location.description}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    }
  }

  const openShareWindow = (url) => {
    window.open(url, "_blank", "width=600,height=400")
  }

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    openShareWindow(url)
  }

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    openShareWindow(url)
  }

  const shareOnLinkedin = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    openShareWindow(url)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 backdrop-blur-xl border border-[#3c2a21] text-[#d5bdaf] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#8B4513] text-xl flex items-center">
            <div className="h-6 w-6 mr-2 relative">
              <Image src="/icons/logo.png" alt="PixWeather Logo" fill className="object-contain" />
            </div>
            Share {location.name}
          </DialogTitle>
          <DialogDescription className="text-[#d5bdaf]/80">Share this location with your friends</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input value={shareUrl} readOnly className="bg-[#121212] border-[#3c2a21] text-[#d5bdaf]" />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              className="border-[#3c2a21] text-[#8B4513] hover:text-[#d5bdaf] hover:bg-[#3c2a21]"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={shareOnFacebook}
              className="rounded-full border-[#3c2a21] text-[#8B4513] hover:text-[#d5bdaf] hover:bg-[#3c2a21]"
            >
              <Facebook className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={shareOnTwitter}
              className="rounded-full border-[#3c2a21] text-[#8B4513] hover:text-[#d5bdaf] hover:bg-[#3c2a21]"
            >
              <Twitter className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={shareOnLinkedin}
              className="rounded-full border-[#3c2a21] text-[#8B4513] hover:text-[#d5bdaf] hover:bg-[#3c2a21]"
            >
              <Linkedin className="h-5 w-5" />
            </Button>
          </div>

          {navigator.share && (
            <Button
              variant="default"
              onClick={handleShare}
              className="w-full bg-[#8B4513] hover:bg-[#6d3710] text-white"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share via device
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

