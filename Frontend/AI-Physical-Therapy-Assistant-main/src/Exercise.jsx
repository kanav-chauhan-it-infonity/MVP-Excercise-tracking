"use client"

import { useState, useRef, useEffect } from "react"
import {  Clock, Repeat,
  BarChart3, TrendingUp, RotateCcw, ArrowRight,
  SummarySessionIcon, ArrowLeft, Pause
} from "./components/Icons"
import { Button } from "./components/ui/button"
import { Link } from 'react-router-dom'
import "./Video.css"

function Exercise() {
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showInstruction, setShowInstruction] = useState(true)
  const [showSummary, setShowSummary] = useState(false)
  const videoRef = useRef(null)
  const cameraRef = useRef(null)

  const sessionMetrics = {
    duration: "11:10 hrs",
    repetitions: "120",
    formQuality: "85%",
    overallFeedback: "75%",
  }

 useEffect(() => {
  const timer = setTimeout(() => {
    setShowInstruction(false)
    startLiveCamera()
  }, 5000)

  return () => clearTimeout(timer)
}, [])

const startLiveCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }, // or "environment" for rear
      audio: false,
    })

    if (cameraRef.current) {
      cameraRef.current.srcObject = stream
      cameraRef.current.play()
      setIsPlaying(true)
    }
  } catch (error) {
    console.error("Camera error:", error)
    alert("Unable to access camera. Please check permissions.")
  }
}

  const handleVideoEnded = () => {
    setIsPlaying(false)
    setShowSummary(true)
  }

  return (
    <div className="exercise-page">
      <header className="exercise-header">
        <h1>Exercise Session</h1>
        <div className="status-badge">Side View</div>
      </header>

      {/* Main Content */}
      <div className="exercise-content">
        <div
          className="video-container"
          style={{
            backgroundColor: "#111827",
            height: "500px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            color: "white",
            borderRadius: "12px",
          }}
        >
          {/* AI Analyzing Indicator */}
          <div
            style={{
              position: "absolute",
              top: "2rem",
              left: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#10b981",
                borderRadius: "50%",
              }}
            ></div>
            <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
              AI ANALYZING
            </span>
          </div>

          {/* Dynamic Center Content */}
          {showInstruction ? (
            <div style={{ textAlign: "center" }}>
              <h2
                style={{
                  fontSize: "1.875rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                Get into starting position
              </h2>
              <p style={{ color: "#9ca3af" }}>AI is detecting your position...</p>
            </div>
          ) : (
           <video
  ref={cameraRef}
  autoPlay
  muted
  playsInline
  style={{
    width: "100%",
    height: "100%",
    borderRadius: "12px",
    objectFit: "cover",
  }}
/>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #e5e7eb",
          padding: "1.5rem",
        }}
      >
        <Link to="/video-tutorial" style={{ color: "#6B7280", textDecoration: "none" }}>
          <Button
            variant="ghost"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
              padding: "12px 22px",
              background: "none",
            }}
          >
            <ArrowLeft />
            Back
          </Button>
        </Link>
        <Link to="/AiAnalyze" style={{ color: "#FFF", textDecoration: "none" }}>
          <Button
            variant="outline"
            style={{
              borderColor: "#FCA5A5",
              color: "#B91C1C",
              background: "#FEF2F2",
              borderRadius: "10px",
              padding: "12px 22px",
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <Pause style={{ marginRight: "0.5rem" }} />
            Finish Early
          </Button>
        </Link>
      </div>

      {/* Session Summary Section */}
      {showSummary && (
        <section className="session-metric" style={{ margin: "1.5rem" }}>
          <div className="metric-header">
            <SummarySessionIcon />
            <h2>Session Summary</h2>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">
                <Clock />
              </div>
              <div className="metric-label">Total Time</div>
              <div className="metric-value">{sessionMetrics.duration}</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <Repeat />
              </div>
              <div className="metric-label">Repetitions</div>
              <div className="metric-value">{sessionMetrics.repetitions}</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <BarChart3 />
              </div>
              <div className="metric-label">Form Quality</div>
              <div className="metric-value">{sessionMetrics.formQuality}</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <TrendingUp />
              </div>
              <div className="metric-label">Positive Feedback</div>
              <div className="metric-value">{sessionMetrics.overallFeedback}</div>
            </div>
          </div>
        </section>
      )}

      {/* Action Buttons */}
      {showSummary && (
        <div className="action-buttons" style={{ margin: "1.5rem" }}>
          <button className="secondary-button">
            <RotateCcw />
            Try Another Session
          </button>
          <Link to="/exercise-summary" style={{ color: "#FFFFFF", textDecoration: "none" }}>
            <button className="primary-button">
              Full Summary
              <ArrowRight />
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default Exercise
