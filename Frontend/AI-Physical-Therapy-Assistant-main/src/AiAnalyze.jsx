"use client"

import { useState, useRef, useEffect } from "react"
import "./AiAnalyze.css"
import AiAnayzeImage from './images/aiAnalyze.png'
import { Link } from 'react-router-dom';

function AiAnalyze ()
{
    const [ isPlaying, setIsPlaying ] = useState( false )
    const [ progress, setProgress ] = useState( 0 )
    const [ voiceEnabled, setVoiceEnabled ] = useState( true )
    const [ currentTime, setCurrentTime ] = useState( 0 )
    const [ feedbackMessages, setFeedbackMessages ] = useState([])
    const videoRef = useRef( null )

    useEffect(() => {
        // Retrieve feedback data from sessionStorage if available
        const storedFeedback = sessionStorage.getItem('movementFeedback');
        if (storedFeedback) {
            try {
                const parsedFeedback = JSON.parse(storedFeedback);
                setFeedbackMessages(parsedFeedback);
                // Optional: Update metrics based on feedback
                updateMetricsFromFeedback(parsedFeedback);
            } catch (e) {
                console.error("Error parsing feedback data:", e);
            }
        }
    }, []);

    const duration = 30 // 30 seconds
    const [sessionMetrics, setSessionMetrics] = useState({
        duration: "11:10 hrs",
        repetitions: "120",
        formQuality: "85%",
        overallFeedback: "75%",
    });

    // Update metrics based on feedback
    const updateMetricsFromFeedback = (feedback) => {
        // This is a simple example - in a real app, you might have more sophisticated logic
        if (feedback && feedback.length > 0) {
            // Check if any feedback has negative feedback
            const hasNegativeFeedback = feedback.some(msg => 
                msg.toLowerCase().includes("try to") || 
                msg.toLowerCase().includes("avoid") || 
                msg.toLowerCase().includes("incorrect")
            );

            // Simple algorithm to adjust form quality based on feedback
            const newFormQuality = hasNegativeFeedback ? "70%" : "90%";
            
            setSessionMetrics(prev => ({
                ...prev,
                formQuality: newFormQuality,
                // You could update other metrics here based on the feedback content
            }));
        }
    };

    const togglePlay = () =>
    {
        if ( videoRef.current )
        {
            if ( isPlaying )
            {
                videoRef.current.pause()
            } else
            {
                videoRef.current.play()
            }
            setIsPlaying( !isPlaying )
        }
    }

    const handleTimeUpdate = () =>
    {
        if ( videoRef.current )
        {
            const current = videoRef.current.currentTime
            const total = videoRef.current.duration || duration
            setCurrentTime( current )
            setProgress( ( current / total ) * 100 )
        }
    }

    const formatTime = ( seconds ) =>
    {
        const mins = Math.floor( seconds / 60 )
        const secs = Math.floor( seconds % 60 )
        return `${ mins.toString().padStart( 2, "0" ) }:${ secs.toString().padStart( 2, "0" ) }`
    }

    return (
        <div className="exercise-replay-page">
            {/* Header */ }
            <header className="replay-header">
                <h1>Exercise Replay & Analysis</h1>
                <div className="status-badge">AI Analysis Complete</div>
            </header>

            <div className="replay-content">
                {/* Video Section */ }
                <section className="video-section">
                    <div className="video-header">
                        <div className="video-title">
                            
                            <span>30-Second Replay with AI Feedback</span>
                        </div>
                        <button
                            className={ `voice-toggle ${ voiceEnabled ? "active" : "" }` }
                            onClick={ () => setVoiceEnabled( !voiceEnabled ) }
                        >
                            
                            <span>Voice { voiceEnabled ? "on" : "off" }</span>
                        </button>
                    </div>

                    <div className="video-container">
                        <div className="video-player">
                            {/* AI Analysis Indicator */ }
                            <div className="ai-indicator">
                                <div className="ai-dot"></div>
                                <span>AI ANALYZED</span>
                            </div>

                            {/* Video Element (hidden, using background image) */ }
                            <video
                                ref={ videoRef }
                                className="hidden-video"
                                onTimeUpdate={ handleTimeUpdate }
                                onEnded={ () => setIsPlaying( false ) }
                            >
                                <source src="/exercise-replay.mp4" type="video/mp4" />
                            </video>

                            {/* Exercise Image with Overlay */ }
                            <div className="exercise-display">
                                <img
                                    src={ AiAnayzeImage }
                                    alt="Exercise Analysis"
                                    className="exercise-image"
                                />

                                {/* AI Analysis Overlays */ }
                                <div className="pose-overlay">
                                    {/* Skeletal lines would be dynamically generated */ }
                                    <svg className="pose-lines" viewBox="0 0 640 360">
                                        <line x1="320" y1="120" x2="280" y2="180" stroke="#00ff00" strokeWidth="2" />
                                        <line x1="320" y1="120" x2="360" y2="180" stroke="#00ff00" strokeWidth="2" />
                                        <line x1="280" y1="180" x2="260" y2="240" stroke="#00ff00" strokeWidth="2" />
                                        <line x1="360" y1="180" x2="380" y2="240" stroke="#00ff00" strokeWidth="2" />
                                        <line x1="320" y1="120" x2="320" y2="200" stroke="#ff0000" strokeWidth="2" />
                                        <circle cx="320" cy="100" r="15" fill="#00ff00" opacity="0.7" />
                                        <circle cx="280" cy="180" r="8" fill="#00ff00" opacity="0.7" />
                                        <circle cx="360" cy="180" r="8" fill="#00ff00" opacity="0.7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Play Button Overlay */ }
                            { !isPlaying && (
                                <button className="play-overlay" onClick={ togglePlay }>
                                    
                                </button>
                            ) }
                        </div>

                        {/* Video Controls */ }
                        <div className="video-controls">
                            <span className="time-display">{ formatTime( currentTime ) }</span>
                            <div className="progress-container">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={ { width: `${ progress }%` } }></div>
                                </div>
                            </div>
                            <span className="time-display">{ formatTime( duration ) }</span>
                        </div>
                    </div>
                </section>

                {/* AI Feedback Section */}
                {feedbackMessages.length > 0 && (
                    <section className="ai-feedback-section">
                        <div className="feedback-header">
                            
                            <h2>AI Movement Feedback</h2>
                        </div>
                        <div className="feedback-list">
                            {feedbackMessages.map((feedback, index) => (
                                <div key={index} className="feedback-item">
                                    <div className="feedback-number">{index + 1}</div>
                                    <p>{feedback}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Session Summary */ }
                <section className="session-metric">
                    <div className="metric-header">
                        
                        <h2>Session Summary</h2>
                    </div>

                    <div className="metrics-grid">
                        <div className="metric-card">
                            <div className="metric-icon">
                                
                            </div>
                            <div className="metric-label">Total Time</div>
                            <div className="metric-value">{ sessionMetrics.duration }</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">
                                
                            </div>
                            <div className="metric-label">Repetitions</div>
                            <div className="metric-value">{ sessionMetrics.repetitions }</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">
                                
                            </div>
                            <div className="metric-label">Form Quality</div>
                            <div className="metric-value">{ sessionMetrics.formQuality }</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">
                                
                            </div>
                            <div className="metric-label">Positive Feedback</div>
                            <div className="metric-value">{ sessionMetrics.overallFeedback }</div>
                        </div>
                    </div>
                </section>

                {/* Action Buttons */ }
                <div className="action-buttons">
                    <button className="secondary-button" onClick={() => window.history.back()}>
                        
                        Try Another Session
                    </button>
                    <Link to="/exercise-summary" style={ { color: "#FFFFFF", textDecoration: "none" } }>
                    <button className="primary-button">
                        View Full Report
                        
                    </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default AiAnalyze
