"use client"

import { useState, useRef } from "react"
import "./ExercisePage.css"
import { Play, Camera, ArrowRight } from "./Icons"

function ExercisePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedView, setSelectedView] = useState("rear")
  const videoRef = useRef(null)

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
    <div className="exercise-page">
      <header className="exercise-header">
        <h1>Camera Ready</h1>
        <button className="camera-button">
          <Camera />
        </button>
      </header>

      <main className="exercise-content">
        {/* Video Player */}
        <div className="video-container">
          <div className="video-player">
            <video
              ref={videoRef}
              className="hidden-video"
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            >
              <source src="/exercise-video.mp4" type="video/mp4" />
            </video>

            {/* Placeholder image */}
            <div className="video-placeholder">
              {/* This would be replaced with your actual 3D model */}
              <div className="model-container">
                {/* Arrow indicators */}
                <div className="arrow left-arrow"></div>
                <div className="arrow right-arrow"></div>
              </div>
            </div>

            {/* Play button */}
            <button onClick={togglePlay} className={`play-button ${isPlaying ? "hidden" : ""}`}>
              <Play />
            </button>
          </div>

          {/* Video controls */}
          <div className="video-controls">
            <span className="time-display">00:00</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="time-display">02:00</span>
          </div>
        </div>

        {/* Camera View Selector */}
        <div className="camera-view-section">
          <div className="section-header">
            <Camera className="section-icon" />
            <h2>Choose Your Camera View</h2>
          </div>

          <div className="camera-controls">
            <div className="view-toggle">
              <button
                className={`view-button ${selectedView === "rear" ? "active" : ""}`}
                onClick={() => setSelectedView("rear")}
              >
                Rear View
              </button>
              <button
                className={`view-button ${selectedView === "side" ? "active" : ""}`}
                onClick={() => setSelectedView("side")}
              >
                Side View
              </button>
            </div>

            <button className="begin-button">
              BEGIN EXERCISE <ArrowRight />
            </button>
          </div>
        </div>

        {/* Starting Position Guide */}
        <div className="position-guide-section">
          <h2>Correct Starting Position</h2>

          <div className="position-items">
            <div className="position-item">
              <div className="position-number">1</div>
              <p>Hands under shoulders, knees under hips (90° angles)</p>
            </div>
            <div className="position-item">
              <div className="position-number">2</div>
              <p>Front of foot flat, toes inward, heels outward</p>
            </div>
            <div className="position-item">
              <div className="position-number">3</div>
              <p>Back straight, neutral spine position</p>
            </div>
            <div className="position-item">
              <div className="position-number">4</div>
              <p>Head aligned with spine, looking at the floor</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ExercisePage
