"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Cloud, Wind, Droplets, Thermometer, Sun, Umbrella } from "lucide-react"

interface WeatherInfoProps {
  weather: any
}

export default function WeatherInfo({ weather }: WeatherInfoProps) {
  if (!weather || !weather.current) {
    return (
      <div className="text-center text-gray-300">
        <p>Weather information is not available at the moment.</p>
      </div>
    )
  }

  const { current } = weather

  const weatherItems = [
    {
      icon: <Thermometer className="h-8 w-8 text-[#8B4513]" />,
      label: "Temperature",
      value: `${current.temp_c}°C / ${current.temp_f}°F`,
    },
    {
      icon: <Cloud className="h-8 w-8 text-[#8B4513]" />,
      label: "Condition",
      value: current.condition.text,
    },
    {
      icon: <Wind className="h-8 w-8 text-[#8B4513]" />,
      label: "Wind",
      value: `${current.wind_kph} km/h`,
    },
    {
      icon: <Droplets className="h-8 w-8 text-[#8B4513]" />,
      label: "Humidity",
      value: `${current.humidity}%`,
    },
    {
      icon: <Umbrella className="h-8 w-8 text-[#8B4513]" />,
      label: "Precipitation",
      value: `${current.precip_mm} mm`,
    },
    {
      icon: <Sun className="h-8 w-8 text-[#8B4513]" />,
      label: "UV Index",
      value: current.uv,
    },
  ]

  return (
    <Card className="bg-[#262626] border-none shadow-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center">
            <div className="mr-6">
              <img
                src={current.condition.icon || "/placeholder.svg"}
                alt={current.condition.text}
                width={80}
                height={80}
                className="w-20 h-20"
              />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white">{current.temp_c}°C</h3>
              <p className="text-gray-300">{current.condition.text}</p>
              <p className="text-gray-400 text-sm">Feels like {current.feelslike_c}°C</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {weatherItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center"
              >
                <div className="mr-3">{item.icon}</div>
                <div>
                  <p className="text-sm text-gray-400">{item.label}</p>
                  <p className="text-white font-medium">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

