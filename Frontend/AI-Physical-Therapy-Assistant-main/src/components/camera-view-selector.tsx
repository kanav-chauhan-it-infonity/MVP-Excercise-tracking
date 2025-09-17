"use client"

import { useState } from "react"
import { Camera, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CameraViewSelector() {
  const [selectedView, setSelectedView] = useState<"rear" | "side">("rear")

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-2">
        <Camera className="text-blue-600 w-5 h-5" />
        <h2 className="font-bold text-lg">Choose Your Camera View</h2>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
        <div className="flex w-full sm:w-auto">
          <Button
            variant={selectedView === "rear" ? "default" : "outline"}
            className={`rounded-r-none ${selectedView === "rear" ? "bg-blue-600" : ""}`}
            onClick={() => setSelectedView("rear")}
          >
            Rear View
          </Button>
          <Button
            variant={selectedView === "side" ? "default" : "outline"}
            className={`rounded-l-none ${selectedView === "side" ? "bg-blue-600" : ""}`}
            onClick={() => setSelectedView("side")}
          >
            Side View
          </Button>
        </div>

        <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          BEGIN EXERCISE <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
