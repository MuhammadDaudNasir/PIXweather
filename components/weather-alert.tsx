"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WeatherAlertProps {
  alerts: any[]
  locationName: string
}

export default function WeatherAlert({ alerts, locationName }: WeatherAlertProps) {
  const [currentAlert, setCurrentAlert] = useState(0)
  const [dismissed, setDismissed] = useState<string[]>([])

  // Filter out dismissed alerts
  const activeAlerts = alerts?.filter((alert) => !dismissed.includes(alert.headline)) || []

  // Auto-rotate through alerts
  useEffect(() => {
    if (activeAlerts.length <= 1) return

    const interval = setInterval(() => {
      setCurrentAlert((prev) => (prev + 1) % activeAlerts.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [activeAlerts.length])

  // Dismiss an alert
  const handleDismiss = (headline: string) => {
    setDismissed((prev) => [...prev, headline])
  }

  if (!activeAlerts || activeAlerts.length === 0) return null

  const alert = activeAlerts[currentAlert]

  // Determine alert severity color
  const getSeverityColor = (severity: string) => {
    const sev = severity?.toLowerCase() || ""
    if (sev.includes("extreme") || sev.includes("severe")) return "text-red-500 bg-red-500/20"
    if (sev.includes("moderate")) return "text-orange-500 bg-orange-500/20"
    return "text-yellow-500 bg-yellow-500/20"
  }

  const alertColor = getSeverityColor(alert.severity)

  return (
    <AnimatePresence>
      <motion.div
        key={alert.headline}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`rounded-lg p-3 mb-4 border ${alertColor} border-opacity-30`}
      >
        <div className="flex items-start">
          <AlertTriangle className={`h-5 w-5 mr-2 flex-shrink-0 ${alertColor.split(" ")[0]}`} />
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <h4 className={`font-medium text-sm ${alertColor.split(" ")[0]}`}>{locationName} Weather Alert</h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 -mt-1 -mr-1 text-gray-400 hover:text-gray-300"
                onClick={() => handleDismiss(alert.headline)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-[#d5bdaf] mt-1">{alert.headline}</p>
            {activeAlerts.length > 1 && (
              <div className="flex justify-between items-center mt-2 text-xs text-[#d5bdaf]/70">
                <span>
                  <Bell className="h-3 w-3 inline mr-1" />
                  {activeAlerts.length} active alerts
                </span>
                <span>
                  {currentAlert + 1} of {activeAlerts.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

