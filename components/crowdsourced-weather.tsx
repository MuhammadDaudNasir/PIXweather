"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Send, CloudRain, Wind, Sun, Thermometer, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import CollapsibleWidget from "@/components/collapsible-widget"

interface CrowdsourcedWeatherProps {
  locationName: string
}

export default function CrowdsourcedWeather({ locationName }: CrowdsourcedWeatherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [userReport, setUserReport] = useState({
    condition: "",
    tempFeel: "",
    comment: "",
  })
  const { toast } = useToast()

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/crowdsourced-weather?location=${encodeURIComponent(locationName)}`)
      const data = await response.json()

      if (data.reports) {
        setReports(data.reports)
      }
    } catch (error) {
      console.error("Error fetching community reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const submitReport = async () => {
    if (!userReport.condition) {
      toast({
        title: "Missing information",
        description: "Please select a weather condition",
        variant: "default",
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/crowdsourced-weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: locationName,
          ...userReport,
          timestamp: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Report submitted",
          description: "Thank you for contributing to the community weather report!",
          variant: "default",
        })
        setUserReport({ condition: "", tempFeel: "", comment: "" })
        fetchReports()
        setIsOpen(false)
      } else {
        throw new Error(data.error || "Failed to submit report")
      }
    } catch (error) {
      console.error("Error submitting report:", error)
      toast({
        title: "Submission failed",
        description: "Could not submit your weather report",
        variant: "default",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch reports when component mounts or location changes
  useState(() => {
    if (locationName) {
      fetchReports()
    }
  }, [locationName])

  const weatherConditions = [
    { value: "sunny", icon: <Sun className="h-4 w-4" />, label: "Sunny" },
    { value: "cloudy", icon: <CloudRain className="h-4 w-4" />, label: "Cloudy" },
    { value: "rainy", icon: <CloudRain className="h-4 w-4" />, label: "Rainy" },
    { value: "windy", icon: <Wind className="h-4 w-4" />, label: "Windy" },
  ]

  const tempFeelings = [
    { value: "cold", label: "Cold" },
    { value: "cool", label: "Cool" },
    { value: "mild", label: "Mild" },
    { value: "warm", label: "Warm" },
    { value: "hot", label: "Hot" },
  ]

  return (
    <CollapsibleWidget
      title="Community Weather Reports"
      icon={<Users className="h-3 w-3 xs:h-4 xs:w-4" />}
      badge={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-5 px-2 rounded-full bg-[#3c2a21]/50 text-[#d5bdaf] hover:bg-[#8B4513]/70 text-[10px] xs:text-xs"
        >
          {isOpen ? "Cancel" : "Add Report"}
        </Button>
      }
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-black/20 rounded-lg p-2 xs:p-3 mb-2 xs:mb-3 border border-[#3c2a21]/20"
          >
            <div className="text-xs text-[#d5bdaf] mb-2">What's the weather like in {locationName}?</div>

            <div className="mb-3">
              <div className="text-xs text-[#8B4513] mb-1">Current condition</div>
              <div className="flex flex-wrap gap-1">
                {weatherConditions.map((condition) => (
                  <Button
                    key={condition.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => setUserReport({ ...userReport, condition: condition.value })}
                    className={cn(
                      "h-7 px-2 rounded-full text-xs",
                      userReport.condition === condition.value
                        ? "bg-[#8B4513] text-white hover:bg-[#6d3710]"
                        : "bg-black/30 text-[#d5bdaf] hover:bg-[#3c2a21]/50",
                    )}
                  >
                    {condition.icon}
                    <span className="ml-1">{condition.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-[#8B4513] mb-1">How does it feel?</div>
              <div className="flex flex-wrap gap-1">
                {tempFeelings.map((temp) => (
                  <Button
                    key={temp.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => setUserReport({ ...userReport, tempFeel: temp.value })}
                    className={cn(
                      "h-6 px-2 rounded-full text-xs",
                      userReport.tempFeel === temp.value
                        ? "bg-[#8B4513] text-white hover:bg-[#6d3710]"
                        : "bg-black/30 text-[#d5bdaf] hover:bg-[#3c2a21]/50",
                    )}
                  >
                    {temp.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-[#8B4513] mb-1">Additional comments (optional)</div>
              <Input
                value={userReport.comment}
                onChange={(e) => setUserReport({ ...userReport, comment: e.target.value })}
                placeholder="E.g., Heavy wind gusts, sudden temperature drop..."
                className="bg-black/20 border-[#3c2a21]/30 text-[#d5bdaf] text-xs"
              />
            </div>

            <Button
              onClick={submitReport}
              disabled={loading || !userReport.condition}
              className="bg-[#8B4513] hover:bg-[#6d3710] text-white w-full flex items-center justify-center rounded-lg text-xs py-1"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="mr-1"
                >
                  <Send className="h-3 w-3" />
                </motion.div>
              ) : (
                <Send className="h-3 w-3 mr-1" />
              )}
              Submit Report
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {reports.length === 0 ? (
        <div className="text-[10px] xs:text-xs text-[#d5bdaf]/70 py-2 text-center">
          No community reports yet for {locationName}
        </div>
      ) : (
        <div className="space-y-2 max-h-36 overflow-y-auto">
          {reports.map((report, index) => {
            const time = new Date(report.timestamp)
            const timeAgo = getTimeAgo(time)

            return (
              <div key={index} className="bg-black/20 rounded-lg p-2 border border-[#3c2a21]/10">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      {report.condition === "sunny" && <Sun className="h-3 w-3 text-yellow-500" />}
                      {report.condition === "cloudy" && <CloudRain className="h-3 w-3 text-gray-400" />}
                      {report.condition === "rainy" && <CloudRain className="h-3 w-3 text-blue-400" />}
                      {report.condition === "windy" && <Wind className="h-3 w-3 text-teal-400" />}
                      <span className="text-xs text-[#d5bdaf] ml-1 capitalize">{report.condition}</span>
                    </div>
                    {report.tempFeel && (
                      <div className="flex items-center">
                        <Thermometer className="h-3 w-3 text-[#8B4513]" />
                        <span className="text-xs text-[#d5bdaf] ml-1 capitalize">{report.tempFeel}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-[#8B4513]">{timeAgo}</span>
                </div>
                {report.comment && (
                  <div className="flex items-start mt-1">
                    <MessageSquare className="h-3 w-3 text-[#8B4513] mt-0.5 mr-1" />
                    <p className="text-xs text-[#d5bdaf]/70">{report.comment}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </CollapsibleWidget>
  )
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + " years ago"

  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + " months ago"

  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + " days ago"

  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + " hours ago"

  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + " minutes ago"

  return Math.floor(seconds) + " seconds ago"
}

