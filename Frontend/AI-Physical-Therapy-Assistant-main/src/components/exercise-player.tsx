"use client"

import { useState, useRef } from "react"
import { Play } from "lucide-react"

export default function ExercisePlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(progress)
    }
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200">
      <div className="bg-gray-200 aspect-video flex items-center justify-center relative">
        {/* This would be a real video in a production app */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-0"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        >
          <source src="/exercise-video.mp4" type="video/mp4" />
        </video>

        {/* Placeholder 3D model image */}
        <img
          src="/placeholder.svg?height=400&width=800"
          alt="Exercise demonstration"
          className="w-full h-full object-cover"
        />

        {/* Play button overlay */}
        <button
          onClick={togglePlay}
          className={`absolute z-10 rounded-full bg-blue-600 bg-opacity-80 w-16 h-16 flex items-center justify-center transition-opacity ${isPlaying ? "opacity-0" : "opacity-100"}`}
        >
          <Play className="w-8 h-8 text-white fill-white" />
        </button>

        {/* Arrows indicating movement */}
        <div className="absolute left-1/3 top-1/2 h-24 w-2">
          <div className="w-2 h-24 bg-black opacity-70 rounded-full"></div>
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[16px] border-t-black opacity-70 absolute -bottom-4 left-1/2 transform -translate-x-1/2"></div>
        </div>

        <div className="absolute right-1/3 top-1/2 h-24 w-2">
          <div className="w-2 h-24 bg-black opacity-70 rounded-full"></div>
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[16px] border-t-black opacity-70 absolute -bottom-4 left-1/2 transform -translate-x-1/2"></div>
        </div>
      </div>

      {/* Video controls */}
      <div className="bg-gray-900 text-white p-2 flex items-center">
        <span className="text-xs">00:00</span>
        <div className="mx-2 flex-1 h-1 bg-gray-700 rounded-full">
          <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="text-xs">02:00</span>
      </div>
    </div>
  )
}
