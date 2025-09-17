"use client"
import
{
  Calendar,
  Clock,
  BarChart3,
  Repeat,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  User,
  ArrowLeft,
  ExternalLink,
} from "./components/Icons"
import "./ExerciseSummary.css"
import { Link } from 'react-router-dom';
function ExerciseSummary ()
{
  const sessionData = {
    date: "Friday, May 23, 2025 At 2:57 PM",
    duration: "25:20",
    feedbackCount: "134 Times",
    repetitions: "120",
    positivePercentage: "75%",
  }

  const positivePoints = [ "Good hip hinge movement", "Excellent back alignment", "Great toe pressure" ]

  const improvementAreas = [
    "Keep your ankles stable",
    "Try to look at the floor instead of forward",
    "Remember to hinge at your hips, not your back",
  ]

  const recommendations = [
    {
      number: "1",
      title: "Practice Regularly",
      description: "Practice the exercise 2-3 times per week for best results",
    },
    {
      number: "2",
      title: "Focus on Form",
      description: "Maintain proper form throughout the movement for maximum benefit",
    },
    {
      number: "3",
      title: "Follow Up",
      description: "Consider scheduling a follow-up with your physical therapist",
    },
  ]

  return (
    <div className="exercise-summary-page">
      {/* Header */ }
      <header className="summary-header">
        <h1>Exercise Session Summary</h1>
        <button className="profile-button">
          <User />
        </button>
      </header>

      <div className="summary-content">
        {/* Session Details */ }
        <section className="session-details">
          <h2>Session Details</h2>
          <div className="details-grid">
            <div className="detail-card">
              <div className="detail-icon">
                <Calendar />
                <span className="detail-label">Session Date</span>
              </div>
              <div className="detail-content">
                <span className="detail-value">{ sessionData.date }</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <Clock />
                <span className="detail-label">Exercise Duration</span>
              </div>
              <div className="detail-content">
                <span className="detail-value">{ sessionData.duration }</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <BarChart3 />
                <span className="detail-label">Feedback Provided</span>
              </div>
              <div className="detail-content">
                <span className="detail-value">{ sessionData.feedbackCount }</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <Repeat />
                <span className="detail-label">Repetitions</span>
              </div>
              <div className="detail-content">
                <span className="detail-value">{ sessionData.repetitions }</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <TrendingUp />
                <span className="detail-label">Positive Feedback</span>
              </div>
              <div className="detail-content">
                <span className="detail-value">{ sessionData.positivePercentage }</span>
              </div>
            </div>
          </div>
        </section>

        {/* What You Did Well */ }
        <section className="feedback-section positive-feedback">
          <div className="section-header">
            <CheckCircle className="section-icon" />
            <h2>What You Did Well</h2>
          </div>
          <div className="feedback-grid">
            { positivePoints.map( ( point, index ) => (
              <div key={ index } className="feedback-item positive">
                <CheckCircle className="feedback-icon" />
                <span>{ point }</span>
              </div>
            ) ) }
          </div>
        </section>

        {/* Areas for Improvement */ }
        <section className="feedback-section improvement-feedback">
          <div className="section-header">
            <AlertTriangle className="section-icon" />
            <h2>Areas for Improvement</h2>
          </div>
          <div className="feedback-grid">
            { improvementAreas.map( ( area, index ) => (
              <div key={ index } className="feedback-item improvement">
                <AlertTriangle className="feedback-icon" />
                <span>{ area }</span>
              </div>
            ) ) }
          </div>
        </section>

        {/* Recommendations */ }
        <section className="recommendations-section">
          <div className="recommendations-grid">
            { recommendations.map( ( rec, index ) => (
              <div key={ index } className="recommendation-card">
                <div className="recommendation-number">{ rec.number }</div>
                <div className="recommendation-content">
                  <h3>{ rec.title }</h3>
                  <p>{ rec.description }</p>
                </div>
              </div>
            ) ) }
          </div>
        </section>

        {/* Footer Actions */ }
        <footer className="summary-footer">
          <Link to="/video-tutorial" style={ { color: "#000000", textDecoration: "none" } }>
            <button className="secondary-button">
              <ArrowLeft />
              Start New Session
            </button>
          </Link>
          <button className="primary-button">
            Return to Site
            <ExternalLink />
          </button>
        </footer>
      </div>
    </div>
  )
}

export default ExerciseSummary
