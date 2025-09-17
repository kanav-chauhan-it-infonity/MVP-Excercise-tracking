"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import "./Video.css"
import { useMediaPipe } from './hooks/useMediaPipe'
// Using local POSE_CONNECTIONS definition instead of import
// import { POSE_CONNECTIONS } from './pose_connections';

// API endpoint configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
// Return URL (e.g., Squarespace homepage)
const RETURN_URL = process.env.REACT_APP_RETURN_URL || '/';

function Video() {
    const [view, setView] = useState("idle") // idle, cameraReady, recording, recorded, analyzing, feedbackReady, positionCheck
    const [selectedFacingMode, setSelectedFacingMode] = useState("user")
    const [recordingDuration, setRecordingDuration] = useState(0)
    const [analysisResult, setAnalysisResult] = useState(null)
    const [recordedBlob, setRecordedBlob] = useState(null)
    const [selectedExercise, setSelectedExercise] = useState("quadruped") // Only using quadruped
    const [startPositionFeedback, setStartPositionFeedback] = useState(null)
    const [isPositionCorrect, setIsPositionCorrect] = useState(false)
    const [analysisDuration, setAnalysisDuration] = useState(0)
    const [poseDetection, setPoseDetection] = useState(null);
    const [positionGuidance, setPositionGuidance] = useState(null);
    const [detectedPose, setDetectedPose] = useState(null);
    const [lightingQuality, setLightingQuality] = useState("unknown"); // "good", "poor", "unknown"
    const [error, setError] = useState(null);
    const [startPositionDetails, setStartPositionDetails] = useState(null);
    const [startPositionChecked, setStartPositionChecked] = useState(false);
    const [showExerciseSelector, setShowExerciseSelector] = useState(true);
    
    // MediaPipe integration
    const { initializeMediaPipe, stopMediaPipe, drawMediaPipePose } = useMediaPipe();
    
    const liveCameraRef = useRef(null)
    const playbackVideoRef = useRef(null)
    const canvasRef = useRef(null)
    const positionCanvasRef = useRef(null)
    const recordCanvasRef = useRef(null)
    const streamRef = useRef(null)
    const mediaRecorderRef = useRef(null)
    const recordingIntervalRef = useRef(null)
    const animationFrameRef = useRef(null)
    const positionCheckIntervalRef = useRef(null)
    const analysisTimerRef = useRef(null)
    const chunksRef = useRef([])
    const poseDetectionRef = useRef(null);
    const lightingCheckTimeoutRef = useRef(null);
    const recordPoseHistoryRef = useRef([]);
    const MAX_RECORD_HISTORY = 12;

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
            if (positionCheckIntervalRef.current) clearInterval(positionCheckIntervalRef.current)
            if (analysisTimerRef.current) clearInterval(analysisTimerRef.current)
            if (lightingCheckTimeoutRef.current) clearTimeout(lightingCheckTimeoutRef.current);
        }
    }, [])
    
    const startCamera = async (facingMode = "user") => {
        try {
            // Stop any existing stream
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            
            // Set up camera with specified facing mode
            const constraints = {
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            
            if (liveCameraRef.current) {
                liveCameraRef.current.srcObject = stream;
                await liveCameraRef.current.play();
                
                // Let CSS handle the sizing for responsive design
                // No need to set explicit height based on aspect ratio
                
                // Initialize MediaPipe for real-time pose detection (non-conflicting approach)
                setTimeout(() => {
                    if (positionCanvasRef.current && liveCameraRef.current && window.Pose) {
                        try {
                            const pose = new window.Pose({
                                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
                            });

                            pose.setOptions({
                                modelComplexity: 1,
                                smoothLandmarks: true,
                                enableSegmentation: false,
                                smoothSegmentation: true,
                                minDetectionConfidence: 0.5,
                                minTrackingConfidence: 0.5
                            });

                            pose.onResults((results) => {
                                if (positionCanvasRef.current && results.poseLandmarks) {
                                    const canvas = positionCanvasRef.current;
                                    const ctx = canvas.getContext('2d');
                                    
                                    // Set canvas size to match video display
                                    const video = liveCameraRef.current;
                                    canvas.width = video.clientWidth || 640;
                                    canvas.height = video.clientHeight || 480;
                                    
                                    // Clear canvas
                                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                                    
                                    // Draw pose using MediaPipe drawing utils
                                    if (window.drawConnectors && window.drawLandmarks && window.POSE_CONNECTIONS) {
                                        window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
                                            color: '#00FF00',
                                            lineWidth: 4
                                        });
                                        
                                        window.drawLandmarks(ctx, results.poseLandmarks, {
                                            color: '#FF0000',
                                            lineWidth: 2,
                                            radius: 6
                                        });
                                    }
                                }

                                // Draw to recording canvas (composited frame with tracers)
                                if (recordCanvasRef.current && liveCameraRef.current && results.poseLandmarks) {
                                    const rCanvas = recordCanvasRef.current;
                                    const rCtx = rCanvas.getContext('2d');
                                    const video = liveCameraRef.current;
                                    // Size to actual video pixels for best quality
                                    const w = video.videoWidth || video.clientWidth || 640;
                                    const h = video.videoHeight || video.clientHeight || 480;
                                    if (rCanvas.width !== w || rCanvas.height !== h) {
                                        rCanvas.width = w;
                                        rCanvas.height = h;
                                    }

                                    // Draw base video frame
                                    rCtx.drawImage(video, 0, 0, w, h);

                                    // Maintain short history for trail
                                    recordPoseHistoryRef.current.push(JSON.parse(JSON.stringify(results.poseLandmarks)));
                                    if (recordPoseHistoryRef.current.length > MAX_RECORD_HISTORY) {
                                        recordPoseHistoryRef.current.shift();
                                    }

                                    // Draw trails
                                    const connections = POSE_CONNECTIONS;
                                    recordPoseHistoryRef.current.forEach((landmarks, idx) => {
                                        const alpha = 0.15 + 0.85 * (idx / recordPoseHistoryRef.current.length);
                                        const lineWidth = 2 + 2 * (idx / recordPoseHistoryRef.current.length);
                                        // Lines
                                        connections.forEach(([s, e]) => {
                                            const a = landmarks[s];
                                            const b = landmarks[e];
                                            if (a && b) {
                                                rCtx.strokeStyle = `rgba(0, 255, 0, ${alpha * 0.5})`;
                                                rCtx.lineWidth = lineWidth * 0.8;
                                                rCtx.beginPath();
                                                rCtx.moveTo(a.x * w, a.y * h);
                                                rCtx.lineTo(b.x * w, b.y * h);
                                                rCtx.stroke();
                                            }
                                        });
                                        // Points
                                        landmarks.forEach((k) => {
                                            rCtx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.7})`;
                                            rCtx.beginPath();
                                            rCtx.arc(k.x * w, k.y * h, 2 + 4 * (idx / recordPoseHistoryRef.current.length), 0, Math.PI * 2);
                                            rCtx.fill();
                                        });
                                    });
                                }
                            });

                            // Process frames manually without MediaPipe Camera
                            const processFrame = async () => {
                                if (liveCameraRef.current && pose) {
                                    await pose.send({ image: liveCameraRef.current });
                                }
                                if (view === 'cameraReady' || view === 'recording' || view === 'positionCheck') {
                                    requestAnimationFrame(processFrame);
                                }
                            };
                            
                            processFrame();
                        } catch (error) {
                            console.error('MediaPipe initialization error:', error);
                        }
                    }
                }, 1000); // Delay to ensure video is ready
            }
            
            setSelectedFacingMode(facingMode);
            setView("cameraReady");
        } catch (err) {
            console.error("Error accessing camera:", err);
            
            // Try with any available camera as fallback
            try {
                const fallbackStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });
                
                streamRef.current = fallbackStream;
                
                if (liveCameraRef.current) {
                    liveCameraRef.current.srcObject = fallbackStream;
                    await liveCameraRef.current.play();
                    
                    // Initialize MediaPipe for fallback camera too
                    setTimeout(() => {
                        if (positionCanvasRef.current && liveCameraRef.current && window.Pose) {
                            try {
                                const pose = new window.Pose({
                                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
                                });

                                pose.setOptions({
                                    modelComplexity: 1,
                                    smoothLandmarks: true,
                                    enableSegmentation: false,
                                    smoothSegmentation: true,
                                    minDetectionConfidence: 0.5,
                                    minTrackingConfidence: 0.5
                                });

                                pose.onResults((results) => {
                                    if (positionCanvasRef.current && results.poseLandmarks) {
                                        const canvas = positionCanvasRef.current;
                                        const ctx = canvas.getContext('2d');
                                        
                                        // Set canvas size to match video display
                                        const video = liveCameraRef.current;
                                        canvas.width = video.clientWidth || 640;
                                        canvas.height = video.clientHeight || 480;
                                        
                                        // Clear canvas
                                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                                        
                                        // Draw pose using MediaPipe drawing utils
                                        if (window.drawConnectors && window.drawLandmarks && window.POSE_CONNECTIONS) {
                                            window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
                                                color: '#00FF00',
                                                lineWidth: 4
                                            });
                                            
                                            window.drawLandmarks(ctx, results.poseLandmarks, {
                                                color: '#FF0000',
                                                lineWidth: 2,
                                                radius: 6
                                            });
                                        }
                                    }
                                });

                                // Process frames manually without MediaPipe Camera
                                const processFrame = async () => {
                                    if (liveCameraRef.current && pose) {
                                        await pose.send({ image: liveCameraRef.current });
                                    }
                                    if (view === 'cameraReady' || view === 'recording' || view === 'positionCheck') {
                                        requestAnimationFrame(processFrame);
                                    }
                                };
                                
                                processFrame();
                            } catch (error) {
                                console.error('MediaPipe initialization error:', error);
                            }
                        }
                    }, 1000);
                }
                
                setSelectedFacingMode("user");
                setView("cameraReady");
            } catch (fallbackErr) {
                console.error("Fallback camera access failed:", fallbackErr);
                alert("Unable to access camera. Please ensure camera permissions are granted and try again.");
            }
        }
    };
    
    const handleToggleCamera = () => {
        const newFacingMode = selectedFacingMode === "user" ? "environment" : "user";
        console.log(`Switching camera from ${selectedFacingMode} to ${newFacingMode}`);
        startCamera(newFacingMode);
    };

    const handleSetupCamera = () => {
        // For mobile devices, start with back camera by default
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        startCamera(isMobile ? "environment" : "user");
    };

    const handleCloseCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        
        if (liveCameraRef.current) {
            liveCameraRef.current.srcObject = null;
        }
        
        // Stop MediaPipe when closing camera
        stopMediaPipe();
        
        setView("idle");
    };
    
    const handleExerciseChange = (exercise) => {
        setSelectedExercise(exercise);
    }

    const checkLightingConditions = useCallback(() => {
        if (!liveCameraRef.current || !streamRef.current) return;
        
        try {
            const video = liveCameraRef.current;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = 100; // Small sample for efficiency
            canvas.height = 100;
            
            // Draw current video frame to canvas
            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, 100, 100);
            
            // Get image data for analysis
            const imageData = ctx.getImageData(0, 0, 100, 100);
            const data = imageData.data;
            
            // Calculate average brightness
            let totalBrightness = 0;
            for (let i = 0; i < data.length; i += 4) {
                // Simple average of RGB for brightness
                const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                totalBrightness += brightness;
            }
            
            const avgBrightness = totalBrightness / (data.length / 4);
            
            // Determine lighting quality
            if (avgBrightness < 50) {
                setLightingQuality("poor");
                // Show warning if lighting is poor
                setStartPositionFeedback("⚠️ Lighting seems dim. Consider moving to a brighter area.");
            } else if (avgBrightness > 220) {
                setLightingQuality("poor");
                // Show warning if too bright/washed out
                setStartPositionFeedback("⚠️ Too much light/glare. Try adjusting camera angle.");
            } else {
                setLightingQuality("good");
            }
            
            // Also check for blur/focus issues (simplified version)
            // Calculating variance of pixel values as a rough blur detection
            let variance = 0;
            for (let i = 0; i < data.length; i += 4) {
                const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                variance += Math.pow(brightness - avgBrightness, 2);
            }
            variance /= (data.length / 4);
            
            // Low variance often means blurry or uniform image
            if (variance < 100 && avgBrightness > 50) {
                setLightingQuality("poor");
                setStartPositionFeedback("⚠️ Image may be blurry or uniform. Try adjusting focus or camera angle.");
            }
            
        } catch (error) {
            console.error("Error checking lighting:", error);
        }
    }, []);
    
    const checkStartPosition = () => {
        setView("positionCheck");
        setStartPositionFeedback("Getting ready to check your position...");
        setIsPositionCorrect(false);
        setStartPositionChecked(false);
        
        // Draw position guide to help user align
        drawPositionGuide();
        
        // Reset error count for position check
        let errorCount = 0;
        const maxErrors = 5;
        
        // Create interval to check position every second
        positionCheckIntervalRef.current = setInterval(() => {
            try {
                if (!liveCameraRef.current) return;
                
                const canvas = document.createElement('canvas');
                const video = liveCameraRef.current;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Convert to blob and send to server
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        const formData = new FormData();
                        formData.append('image', blob, 'position_check.jpg');
                        formData.append('exercise_type', selectedExercise);
                        
                        try {
                            if (!checkVisibilityIssues()) {
                                return; // Don't proceed if visibility issues detected
                            }
                            
                            const response = await fetch(`${API_BASE_URL}/api/check-position`, {
                                method: 'POST',
                                body: formData,
                            });
                            
                            if (!response.ok) {
                                throw new Error(`HTTP error! Status: ${response.status}`);
                            }
                            
                            const data = await response.json();
                            console.log("Position check results:", data);
                            
                            // Update position details
                            if (data.position_details) {
                                setStartPositionDetails(data.position_details);
                                setStartPositionChecked(true);
                            }
                            
                            // Handle the response
                            if (data.is_position_correct) {
                                // Position is correct, update UI
                                const feedback = generatePositionFeedback(data.position_details);
                                setStartPositionFeedback(feedback || data.feedback || "✅ Position looks good! You may proceed.");
                                setIsPositionCorrect(true);
                                
                                // Clear the interval to stop further checks
                                clearInterval(positionCheckIntervalRef.current);
                                positionCheckIntervalRef.current = null;
                            } else if (startPositionChecked && data.position_details) {
                                // Position incorrect but we have details, provide specific feedback
                                const feedback = generatePositionFeedback(data.position_details);
                                setStartPositionFeedback(feedback || data.feedback || "Adjust your position and try again.");
                            } else {
                                setStartPositionFeedback(data.feedback || "Checking position... please hold still.");
                            }
                        } catch (error) {
                            console.error("Error checking position:", error);
                            errorCount++;
                            
                            if (errorCount >= maxErrors) {
                                // After multiple failures, assume position is acceptable
                                setStartPositionFeedback("Position verification had issues. You may proceed with the exercise.");
                                setIsPositionCorrect(true);
                                
                                // Clear the interval to stop further checks
                                clearInterval(positionCheckIntervalRef.current);
                                positionCheckIntervalRef.current = null;
                            }
                        }
                    }
                }, 'image/jpeg', 0.8);
            } catch (error) {
                console.error("Error capturing frame:", error);
                errorCount++;
                
                if (errorCount >= maxErrors) {
                    // After multiple failures, assume position is acceptable
                    setStartPositionFeedback("Position verification had issues. You may proceed with the exercise.");
                    setIsPositionCorrect(true);
                    
                    // Clear the interval to stop further checks
                    clearInterval(positionCheckIntervalRef.current);
                    positionCheckIntervalRef.current = null;
                }
            }
        }, 1000); // Check position every second
    }
    
    const startRecording = () => {
        if (streamRef.current) {
            setRecordedBlob(null)
            setAnalysisResult(null)
            chunksRef.current = []

            // Prefer recording from the composite record canvas so tracers are baked into the video
            let recordStream = null;
            if (recordCanvasRef.current && recordCanvasRef.current.captureStream) {
                recordStream = recordCanvasRef.current.captureStream(30);
            }
            const mediaRecorder = new MediaRecorder(recordStream || streamRef.current)
            mediaRecorderRef.current = mediaRecorder
            
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }
            
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' })
                setRecordedBlob(blob)
                chunksRef.current = []
            }
            
            mediaRecorder.start()
            setView("recording")
            
            setRecordingDuration(0)
            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1)
            }, 1000)
        }
    }
    
    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop()
            setView("recorded")
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current)
            }
        }
    }

    const handleRetake = () => {
        setRecordedBlob(null);
        setAnalysisResult(null);
        setView("cameraReady");
    }

    const handleAnalysisError = (errorMessage) => {
        // Stop the timer
        if (analysisTimerRef.current) {
            clearInterval(analysisTimerRef.current);
            analysisTimerRef.current = null;
        }
        
        // Set error view with specific message
        setView("analysisError");
        setStartPositionFeedback(errorMessage || "Analysis failed. Please try again with better lighting or positioning.");
    };

    const handleQuickRetry = () => {
        // Reset analysis state but keep camera open
        setRecordedBlob(null);
        setAnalysisResult(null);
        
        // Go back to camera ready state
        setView("cameraReady");
    };

    // Initialize pose detection with proper settings
    const initPoseDetection = async () => {
        try {
            // Ensure TFJS is ready and a backend is set
            if (window.tf && window.tf.ready) {
                await window.tf.ready();
                // Prefer webgl if available for speed
                if (window.tf.getBackend && window.tf.getBackend() !== 'webgl' && window.tf.setBackend) {
                    try { await window.tf.setBackend('webgl'); } catch (e) { /* no-op */ }
                }
            }

            // Check if poseDetection is available
            if (!window.poseDetection || !window.poseDetection.SupportedModels) {
                console.log("Pose detection library not loaded yet");
                return null;
            }

            // Load the pose detection model
            const model = window.poseDetection.SupportedModels.BlazePose;
            const detectorConfig = {
                runtime: 'tfjs',
                enableSmoothing: true,
                modelType: 'full'
            };

            const detector = await window.poseDetection.createDetector(model, detectorConfig);
            setPoseDetection(detector);
            
            return detector;
        } catch (error) {
            console.error("Error initializing pose detection:", error);
            return null;
        }
    };

    // Optimize drawPose for better performance
    const drawPose = (pose, ctx, videoElement, feedbackHighlights = {}) => {
        if (!pose || !pose.keypoints || !ctx || !videoElement) {
            console.error("Missing required parameters for drawPose:", { 
                hasPose: !!pose, 
                hasKeypoints: pose && !!pose.keypoints, 
                hasContext: !!ctx,
                hasVideo: !!videoElement 
            });
            return;
        }
        
        // Clear canvas before drawing
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Batch drawing operations for better performance
        ctx.save();
        
        // Get video dimensions
        const videoWidth = videoElement.videoWidth || videoElement.clientWidth || 640;
        const videoHeight = videoElement.videoHeight || videoElement.clientHeight || 480;
        
        // Set canvas dimensions to match video display size precisely
        const displayWidth = videoElement.clientWidth;
        const displayHeight = videoElement.clientHeight;
        
        // Update canvas dimensions to match the displayed video size exactly
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }
        
        // Calculate scale factors to map pose coordinates to canvas precisely
        const scaleX = displayWidth / videoWidth;
        const scaleY = displayHeight / videoHeight;
        
        // Define body part groups for highlighting with more precise landmark indices
        const bodyPartGroups = {
            shoulders: [11, 12], // Left and right shoulders
            arms: [11, 13, 15, 12, 14, 16], // Shoulders, elbows, wrists
            hips: [23, 24], // Left and right hips
            knees: [25, 26], // Left and right knees
            ankles: [27, 28], // Left and right ankles
            spine: [11, 12, 23, 24], // Shoulders and hips (forming the torso)
            head: [0, 1, 2, 3, 4], // Nose and eyes
            feet: [27, 28, 29, 30, 31, 32] // Ankles, feet, heels
        };
        
        // Improved connection style - thinner lines with better visibility
        ctx.lineWidth = 4; // Reduced from 8 to 4 for better clarity
        ctx.lineCap = 'round';  // Round line caps for smoother appearance
        ctx.lineJoin = 'round'; // Round line joins for smoother appearance
        ctx.shadowBlur = 8;    // Reduced shadow blur
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // Lighter shadow for better contrast
        
        // Draw connections between keypoints
        const connections = POSE_CONNECTIONS;
        connections.forEach(([startIdx, endIdx]) => {
            if (startIdx < pose.keypoints.length && endIdx < pose.keypoints.length) {
                const startPoint = pose.keypoints[startIdx];
                const endPoint = pose.keypoints[endIdx];
                
                if (startPoint && endPoint && startPoint.score > 0.1 && endPoint.score > 0.1) { // Lower threshold for more visibility
                    // Determine if this connection is part of a highlighted body part
                    let isHighlighted = false;
                    let highlightType = '';
                    
                    // Check if this connection belongs to a highlighted body part
                    Object.entries(feedbackHighlights).forEach(([part, type]) => {
                        if (bodyPartGroups[part] && 
                            bodyPartGroups[part].includes(startIdx) && 
                            bodyPartGroups[part].includes(endIdx)) {
                            isHighlighted = true;
                            highlightType = type;
                        }
                    });
                    
                    // Set line style based on highlight status with more vibrant colors
                    if (isHighlighted) {
                        if (highlightType === 'warning') {
                            ctx.strokeStyle = 'rgba(255, 180, 20, 1)'; // Brighter amber for warnings
                            ctx.lineWidth = 6; // Reduced from 10 to 6
                            ctx.shadowBlur = 10;
                            ctx.shadowColor = 'rgba(255, 180, 20, 0.8)';
                        } else if (highlightType === 'negative') {
                            ctx.strokeStyle = 'rgba(255, 90, 90, 1)'; // Brighter red for errors
                            ctx.lineWidth = 6; // Reduced from 10 to 6
                            ctx.shadowBlur = 10;
                            ctx.shadowColor = 'rgba(255, 90, 90, 0.8)';
                        } else if (highlightType === 'positive') {
                            ctx.strokeStyle = 'rgba(44, 227, 104, 1)'; // Brighter green for positive
                            ctx.lineWidth = 6; // Reduced from 10 to 6
                            ctx.shadowBlur = 10;
                            ctx.shadowColor = 'rgba(44, 227, 104, 0.8)';
                        }
                    } else {
                        // Brighter default color for better visibility
                        ctx.strokeStyle = 'rgba(120, 122, 255, 1)'; // Brighter indigo
                        ctx.lineWidth = 4; // Reduced from 8 to 4
                    }
                    
                    // Draw the connection line
                    ctx.beginPath();
                    ctx.moveTo(startPoint.x * scaleX, startPoint.y * scaleY);
                    ctx.lineTo(endPoint.x * scaleX, endPoint.y * scaleY);
                    ctx.stroke();
                }
            }
        });
        
        // Draw keypoints on top of connections with improved visibility
        pose.keypoints.forEach((keypoint, idx) => {
            if (keypoint.score > 0.1) { // Lower threshold for more visibility
                let isHighlighted = false;
                let highlightType = '';
                
                // Check if this keypoint belongs to a highlighted body part
                Object.entries(feedbackHighlights).forEach(([part, type]) => {
                    if (bodyPartGroups[part] && bodyPartGroups[part].includes(idx)) {
                        isHighlighted = true;
                        highlightType = type;
                    }
                });
                
                // Set point style based on highlight status with more vibrant colors and white outline
                ctx.shadowBlur = isHighlighted ? 10 : 5; // Reduced shadow blur
                
                if (isHighlighted) {
                    if (highlightType === 'warning') {
                        ctx.fillStyle = 'rgba(255, 180, 20, 1)'; // Brighter amber
                        ctx.shadowColor = 'rgba(255, 180, 20, 0.8)';
                    } else if (highlightType === 'negative') {
                        ctx.fillStyle = 'rgba(255, 90, 90, 1)'; // Brighter red
                        ctx.shadowColor = 'rgba(255, 90, 90, 0.8)';
                    } else if (highlightType === 'positive') {
                        ctx.fillStyle = 'rgba(44, 227, 104, 1)'; // Brighter green
                        ctx.shadowColor = 'rgba(44, 227, 104, 0.8)';
                    }
                    
                    // Draw points for highlighted areas with white border
                    ctx.beginPath();
                    ctx.arc(keypoint.x * scaleX, keypoint.y * scaleY, 8, 0, 2 * Math.PI); // Reduced from 14 to 8
                    ctx.fill();
                    
                    // Add white outline for better visibility
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                } else {
                    // Regular points - make with white border
                    ctx.fillStyle = 'rgba(120, 122, 255, 1)'; // Brighter indigo
                    ctx.shadowColor = 'rgba(120, 122, 255, 0.8)';
                    ctx.beginPath();
                    ctx.arc(keypoint.x * scaleX, keypoint.y * scaleY, 7, 0, 2 * Math.PI); // Reduced from 12 to 7
                    ctx.fill();
                    
                    // Add white outline
                    ctx.strokeStyle = 'rgba(255, 255, 255, 1)'; // Solid white for better contrast
                    ctx.lineWidth = 1.5; // Reduced from 2.5 to 1.5
                    ctx.stroke();
                }
            }
        });
        
        ctx.restore();
    };

    // Lightweight trail renderer for recorded playback
    const drawPoseTrail = (poseHistory, ctx, videoElement) => {
        if (!Array.isArray(poseHistory) || poseHistory.length === 0 || !ctx || !videoElement) return;

        const canvas = ctx.canvas;
        const videoWidth = videoElement.videoWidth || videoElement.clientWidth || 640;
        const videoHeight = videoElement.videoHeight || videoElement.clientHeight || 480;

        const displayWidth = videoElement.clientWidth;
        const displayHeight = videoElement.clientHeight;
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }

        const scaleX = displayWidth / videoWidth;
        const scaleY = displayHeight / videoHeight;

        const connections = POSE_CONNECTIONS;
        const maxIndex = poseHistory.length - 1;

        // Fade older frames
        poseHistory.forEach((p, idx) => {
            if (!p || !p.keypoints) return;
            const age = (idx + 1) / (maxIndex + 1);
            const lineAlpha = 0.2 * age; // 0 -> old, 0.2 -> newest in trail
            const pointAlpha = 0.25 * age;

            // Lines
            connections.forEach(([startIdx, endIdx]) => {
                if (startIdx < p.keypoints.length && endIdx < p.keypoints.length) {
                    const s = p.keypoints[startIdx];
                    const e = p.keypoints[endIdx];
                    if (s && e && s.score > 0.1 && e.score > 0.1) {
                        ctx.strokeStyle = `rgba(34, 197, 94, ${lineAlpha})`; // green-ish
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(s.x * scaleX, s.y * scaleY);
                        ctx.lineTo(e.x * scaleX, e.y * scaleY);
                        ctx.stroke();
                    }
                }
            });

            // Points
            p.keypoints.forEach(k => {
                if (k && k.score > 0.1) {
                    ctx.fillStyle = `rgba(239, 68, 68, ${pointAlpha})`; // red-ish
                    ctx.beginPath();
                    ctx.arc(k.x * scaleX, k.y * scaleY, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        });
    };

    // Set video source when recordedBlob changes
    useEffect(() => {
        if (recordedBlob && playbackVideoRef.current) {
            const videoUrl = URL.createObjectURL(recordedBlob);
            playbackVideoRef.current.src = videoUrl;
            playbackVideoRef.current.load();
        }
    }, [recordedBlob]);

    // Helper function to extract body part highlights from feedback
    const extractFeedbackHighlights = (feedback) => {
        const highlights = {};
        
        if (!feedback || !Array.isArray(feedback)) return highlights;
        
        // Keywords to look for in feedback and their associated body parts
        const bodyPartKeywords = {
            'shoulder': 'shoulders',
            'shoulders': 'shoulders',
            'arm': 'arms',
            'arms': 'arms',
            'elbow': 'arms',
            'wrist': 'arms',
            'hip': 'hips',
            'hips': 'hips',
            'knee': 'knees',
            'knees': 'knees',
            'ankle': 'ankles',
            'ankles': 'ankles',
            'foot': 'feet',
            'feet': 'feet',
            'back': 'spine',
            'spine': 'spine',
            'head': 'head',
            'neck': 'head'
        };
        
        feedback.forEach(item => {
            // Determine feedback type
            let type = 'neutral';
            if (item.startsWith('✅')) {
                type = 'positive';
            } else if (item.startsWith('❌')) {
                type = 'negative';
            } else if (item.startsWith('⚠️')) {
                type = 'warning';
            }
            
            // Remove emoji for text analysis
            const cleanText = item.replace(/^[✅❌⚠️]\s*/, '').toLowerCase();
            
            // Check for body part mentions
            Object.entries(bodyPartKeywords).forEach(([keyword, bodyPart]) => {
                if (cleanText.includes(keyword)) {
                    highlights[bodyPart] = type;
                }
            });
        });
        
        return highlights;
    };

    // Improved function to handle video playback and pose drawing
    const handleVideoPlayback = () => {
        if (!playbackVideoRef.current || !canvasRef.current || !analysisResult) {
            console.log("Missing required refs or analysis result");
            return;
        }
        
        console.log("Setting up video playback with pose data");
        
        const video = playbackVideoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Only draw poses when in feedbackReady state
        if (view !== "feedbackReady") {
            return;
        }
        
        // Create cached array of poses sorted by timestamp for faster lookup
        const sortedPoses = analysisResult.poses ? 
            [...analysisResult.poses].sort((a, b) => a.timestamp - b.timestamp) : 
            [];
        
        // Keep track of the last frame drawn to avoid redundant drawing
        let lastFrameTime = -1;

        // Keep a short history for tracer effect
        const poseHistory = [];
        const MAX_TRAIL = 12; // ~0.4s at 30fps
        
        // Get feedback highlights once for consistent rendering
        const feedbackHighlights = extractFeedbackHighlights(analysisResult.feedback);
        
        // Local state for client-side inference during playback
        let inferenceInFlight = false;
        let latestDetectedPose = null;
        
        // Handle video time updates to sync pose data with video
        const handleTimeUpdate = async () => {
            if (!sortedPoses.length || view !== "feedbackReady" || !video.duration) {
                // If we have a detector, still try to draw from client-side inference
                if (poseDetection && video.readyState >= 2) {
                    if (!inferenceInFlight) {
                        inferenceInFlight = true;
                        try {
                            const poses = await poseDetection.estimatePoses(video, { flipHorizontal: false });
                            latestDetectedPose = poses && poses[0] ? {
                                keypoints: poses[0].keypoints.map(k => ({ x: k.x, y: k.y, score: k.score || 0.5 }))
                            } : null;
                        } finally {
                            inferenceInFlight = false;
                        }
                    }
                    if (latestDetectedPose) {
                        // Maintain trail history
                        poseHistory.push(latestDetectedPose);
                        if (poseHistory.length > MAX_TRAIL) poseHistory.shift();
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        drawPoseTrail(poseHistory.slice(0, -1), ctx, video);
                        drawPose(latestDetectedPose, ctx, video, feedbackHighlights);
                    }
                }
                return;
            }
            
            // Skip redundant draws if video hasn't moved significantly
            const currentTime = video.currentTime;
            
            // Validate currentTime before proceeding
            if (!isFinite(currentTime) || currentTime < 0 || !video.duration || !isFinite(video.duration)) {
                return;
            }
            
            if (Math.abs(currentTime - lastFrameTime) < 0.01) {
                return;
            }
            
            lastFrameTime = currentTime;
            
            // Find the pose data closest to the current video time using binary search for performance
            let closestPose = null;
            let left = 0;
            let right = sortedPoses.length - 1;
            
            // Normalize timestamps based on video duration for more accurate matching
            const normalizedCurrentTime = currentTime / video.duration;
            
            while (left <= right) {
                const mid = Math.floor((left + right) / 2);
                const pose = sortedPoses[mid];
                // Normalize pose timestamp for comparison
                const normalizedTimestamp = pose.timestamp / video.duration;
                
                if (mid === 0 || mid === sortedPoses.length - 1 || 
                    Math.abs(normalizedTimestamp - normalizedCurrentTime) < 0.01) {
                    closestPose = pose;
                    break;
                }
                
                if (normalizedTimestamp < normalizedCurrentTime) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
            
            // If binary search didn't find a close match, use linear search as fallback
            if (!closestPose) {
                let minTimeDiff = Infinity;
                sortedPoses.forEach(poseData => {
                    if (poseData.timestamp && isFinite(poseData.timestamp)) {
                        const timeDiff = Math.abs(poseData.timestamp - currentTime);
                        if (timeDiff < minTimeDiff) {
                            minTimeDiff = timeDiff;
                            closestPose = poseData;
                        }
                    }
                });
            }
            
            if (closestPose && closestPose.pose) {
                // Update history
                poseHistory.push(closestPose.pose);
                if (poseHistory.length > MAX_TRAIL) poseHistory.shift();

                // Clear previous drawing
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw trail first, then the current pose on top
                drawPoseTrail(poseHistory.slice(0, -1), ctx, video);
                drawPose(closestPose.pose, ctx, video, feedbackHighlights);
            } else if (poseDetection) {
                // Fallback: run client-side inference if backend poses are not aligned
                if (!inferenceInFlight) {
                    inferenceInFlight = true;
                    try {
                        const poses = await poseDetection.estimatePoses(video, { flipHorizontal: false });
                        latestDetectedPose = poses && poses[0] ? {
                            keypoints: poses[0].keypoints.map(k => ({ x: k.x, y: k.y, score: k.score || 0.5 }))
                        } : null;
                    } finally {
                        inferenceInFlight = false;
                    }
                }
                if (latestDetectedPose) {
                    poseHistory.push(latestDetectedPose);
                    if (poseHistory.length > MAX_TRAIL) poseHistory.shift();
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    drawPoseTrail(poseHistory.slice(0, -1), ctx, video);
                    drawPose(latestDetectedPose, ctx, video, feedbackHighlights);
                }
            }
        };
        
        // Ensure canvas is properly sized
        const resizeCanvas = () => {
            if (video && canvas) {
                const videoRect = video.getBoundingClientRect();
                canvas.width = videoRect.width;
                canvas.height = videoRect.height;
                
                // Force redraw after resize only if in feedbackReady state
                if (view === "feedbackReady") {
                    requestAnimationFrame(handleTimeUpdate);
                }
            }
        };
        
        // Initial resize
        resizeCanvas();
        
        // Listen for resize events with debouncing
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 100);
        };
        window.addEventListener('resize', handleResize);
        
        // Ensure the video element is playable for TFJS frame reads
        video.crossOrigin = 'anonymous';
        video.muted = true; // required for autoplay policies
        video.playsInline = true;

        // Add event listeners for accurate synchronization using requestAnimationFrame
        let animationFrameId = null;
        const updateFrame = () => {
            // Use promises to allow async handleTimeUpdate without blocking RAF cadence
            Promise.resolve(handleTimeUpdate());
            animationFrameId = requestAnimationFrame(updateFrame);
        };
        
        // Start the animation loop once metadata is ready
        const startLoop = () => {
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(updateFrame);
            }
        };
        if (video.readyState >= 2) startLoop();
        else video.addEventListener('loadedmetadata', startLoop, { once: true });
        
        // Add specific event listeners for seeking
        video.addEventListener('seeking', handleTimeUpdate);
        video.addEventListener('seeked', handleTimeUpdate);
        video.addEventListener('play', handleTimeUpdate);
        video.addEventListener('loadedmetadata', resizeCanvas);
        
        // Clean up event listeners when component unmounts
        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            video.removeEventListener('seeking', handleTimeUpdate);
            video.removeEventListener('seeked', handleTimeUpdate);
            video.removeEventListener('play', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', resizeCanvas);
            window.removeEventListener('resize', handleResize);
        };
    };

    // Use effect to initialize pose detection and handle video playback
    useEffect(() => {
        if (view === 'feedbackReady' && analysisResult) {
            console.log("Setting up feedback view with pose visualization");
            
            // Initialize pose detection if needed
            if (!poseDetection) {
                initPoseDetection();
            }
            
            // Set up video playback and pose drawing
            const cleanup = handleVideoPlayback();
            
            // Add additional event listener for when the video is fully loaded
            const videoElement = playbackVideoRef.current;
            if (videoElement) {
                const handleVideoLoaded = () => {
                    console.log("Video loaded, initializing pose drawing");
                    if (canvasRef.current && analysisResult.poses && analysisResult.poses.length > 0 && view === "feedbackReady") {
                        const canvas = canvasRef.current;
                        const ctx = canvas.getContext('2d');
                        
                        // Set initial dimensions
                        canvas.width = videoElement.clientWidth || 640;
                        canvas.height = videoElement.clientHeight || 480;
                        
                        // Only draw pose if we're in feedback ready state to prevent flickering
                        if (view === "feedbackReady") {
                            // Clear canvas first
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            
                            // Create simple highlights from feedback
                            const feedbackHighlights = {};
                            try {
                                if (analysisResult.feedback && Array.isArray(analysisResult.feedback)) {
                                    // Simple extraction for reduced processing
                                    const feedback = analysisResult.feedback;
                                    // Extract basic highlights without complex processing
                                    feedback.forEach(item => {
                                        if (item.toLowerCase().includes('shoulder') || item.toLowerCase().includes('arm'))
                                            feedbackHighlights[item.startsWith('✅') ? 'positive' : item.startsWith('❌') ? 'negative' : 'warning'] = true;
                                    });
                                }
                                
                                // Draw pose with simplified highlight approach
                                drawPose(analysisResult.poses[0].pose, ctx, videoElement, feedbackHighlights);
                            } catch (error) {
                                console.error("Simplified pose drawing error:", error);
                                // On error, just draw without highlights
                                drawPose(analysisResult.poses[0].pose, ctx, videoElement, {});
                            }
                        }
                    }
                };
                
                // Add event listener with passive option for better performance
                videoElement.addEventListener('loadeddata', handleVideoLoaded, {passive: true});
                
                // If video is already loaded and we're in the right state, trigger handler
                if (videoElement.readyState >= 2 && view === "feedbackReady") {
                    handleVideoLoaded();
                }
                
                return () => {
                    videoElement.removeEventListener('loadeddata', handleVideoLoaded);
                    if (cleanup) cleanup();
                };
            }
            
            return cleanup;
        }
    }, [view, analysisResult, poseDetection]);

    // Define pose connections for drawing skeleton
    const POSE_CONNECTIONS = [
        // Torso
        [11, 12], // Left shoulder to right shoulder
        [12, 24], // Right shoulder to right hip
        [24, 23], // Right hip to left hip
        [23, 11], // Left hip to left shoulder
        
        // Right arm
        [12, 14], // Shoulder to elbow
        [14, 16], // Elbow to wrist
        
        // Left arm
        [11, 13], // Shoulder to elbow
        [13, 15], // Elbow to wrist
        
        // Right leg
        [24, 26], // Hip to knee
        [26, 28], // Knee to ankle
        
        // Left leg
        [23, 25], // Hip to knee
        [25, 27], // Knee to ankle
        
        // Face
        [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
        
        // Neck
        [0, 11], // Nose to left shoulder
        [0, 12]  // Nose to right shoulder
    ];

    // Add a function to manually bypass position check
    const skipPositionCheck = () => {
        setStartPositionFeedback("✅ Position check manually skipped. You may proceed with recording.");
        setIsPositionCorrect(true);
        
        // Clear the interval to stop further checks
        if (positionCheckIntervalRef.current) {
            clearInterval(positionCheckIntervalRef.current);
            positionCheckIntervalRef.current = null;
        }
    }

    // Add a function to draw position guide during position check
    const drawPositionGuide = useCallback(() => {
        const canvas = positionCanvasRef.current;
        if (!canvas || !liveCameraRef.current) return;
        
        const video = liveCameraRef.current;
        const ctx = canvas.getContext('2d');
        
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (selectedExercise === 'quadruped') {
            // Draw guide for quadruped position
            const width = canvas.width;
            const height = canvas.height;
            
            // Transparent overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, width, height);
            
            // Draw guide shapes for body alignment
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            
            // Draw guide for hands and knees position
            const centerY = height * 0.6;
            const handWidth = width * 0.4;
            const kneeWidth = width * 0.4;
            
            // Hands guide (top rectangle)
            ctx.beginPath();
            ctx.rect(width/2 - handWidth/2, centerY - height * 0.2, handWidth, height * 0.1);
            ctx.stroke();
            ctx.fill();
            
            // Knees guide (bottom rectangle)
            ctx.beginPath();
            ctx.rect(width/2 - kneeWidth/2, centerY + height * 0.1, kneeWidth, height * 0.1);
            ctx.stroke();
            ctx.fill();
            
            // Feet guide (add new visual guide for flattened feet)
            ctx.beginPath();
            ctx.rect(width/2 - kneeWidth/2, centerY + height * 0.2, kneeWidth, height * 0.05);
            ctx.strokeStyle = 'rgba(255, 255, 150, 0.8)'; // Highlight the feet area
            ctx.stroke();
            ctx.fillStyle = 'rgba(255, 255, 150, 0.2)';
            ctx.fill();
            
            // Draw text labels
            ctx.font = '16px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('Place hands here', width/2, centerY - height * 0.25);
            ctx.fillText('Place knees here', width/2, centerY + height * 0.3);
            ctx.fillStyle = 'rgba(255, 255, 150, 0.9)';
            ctx.fillText('Flatten tops of feet here', width/2, centerY + height * 0.3 + 45);
            
            // Draw back alignment guide
            ctx.beginPath();
            ctx.moveTo(width/2, centerY - height * 0.15);
            ctx.lineTo(width/2, centerY + height * 0.15);
            ctx.stroke();
            
            ctx.fillText('Keep back straight', width/2 + 100, centerY);
        } else if (selectedExercise === 'toeDrive') {
            // Draw guide for toe drive position (similar with added toe emphasis)
            const width = canvas.width;
            const height = canvas.height;
            
            // Transparent overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, width, height);
            
            // Draw guide shapes
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            
            const centerY = height * 0.6;
            const handWidth = width * 0.4;
            const kneeWidth = width * 0.4;
            
            // Hands guide
            ctx.beginPath();
            ctx.rect(width/2 - handWidth/2, centerY - height * 0.2, handWidth, height * 0.1);
            ctx.stroke();
            ctx.fill();
            
            // Knees guide
            ctx.beginPath();
            ctx.rect(width/2 - kneeWidth/2, centerY + height * 0.1, kneeWidth, height * 0.1);
            ctx.stroke();
            ctx.fill();
            
            // Toes emphasis (highlight)
            ctx.beginPath();
            ctx.arc(width/2, centerY + height * 0.25, 30, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 193, 7, 0.3)';
            ctx.fill();
            ctx.stroke();
            
            // Draw text labels
            ctx.font = '16px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('Place hands here', width/2, centerY - height * 0.25);
            ctx.fillText('Place knees here', width/2, centerY + height * 0.3);
            ctx.fillText('Point toes down', width/2, centerY + height * 0.35);
        }
    }, [selectedExercise]);

    // Add effect to draw position guide when in position check mode
    useEffect(() => {
        if (view === 'positionCheck') {
            drawPositionGuide();
            
            // Redraw on window resize
            const handleResize = () => {
                drawPositionGuide();
            };
            
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [view, drawPositionGuide]);

    // Function to generate helpful position feedback based on position details
    const generatePositionFeedback = (details) => {
        if (!details) {
            return "Position your body according to the guide.";
        }
        
        // Prioritize feedback about feet flattening
        let feedback = [];
        
        // For quadruped exercise, ALWAYS emphasize feet flattening regardless of detection
        if (selectedExercise === "quadruped") {
            feedback.push("✅ IMPORTANT: Flatten the tops of your feet and ankles against the ground — press them down actively.");
        }
        
        // Check for hands under shoulders
        if (!details.hands_under_shoulders) {
            feedback.push("Position your hands directly under your shoulders.");
        }
        
        // Check for knees under hips
        if (!details.knees_under_hips) {
            feedback.push("Position your knees directly under your hips.");
        }
        
        // Extra emphasis on feet flattening - high priority when not correct
        if (details.feet_flattened === false) {
            feedback.push("❌ The tops of your feet must be flat against the floor. Press your ankles down firmly.");
        }
        
        // Check for back alignment
        if (!details.back_alignment) {
            feedback.push("Keep your back flat and parallel to the floor.");
        }
        
        // Check for feet position
        if (!details.feet_position_correct) {
            if (selectedExercise === "toeDrive") {
                feedback.push("Point your toes downward for proper toe drive position.");
            } else {
                feedback.push("Position your feet hip-width apart.");
            }
        }
        
        // If everything is good
        if (feedback.length === 0) {
            return "Great starting position! You're ready to begin.";
        }
        
        // Return first two feedback items for more comprehensive guidance
        if (feedback.length > 1) {
            return `${feedback[0]} ${feedback[1]}`;
        }
        
        // Return the first (highest priority) feedback item
        return feedback[0];
    };

    // Function to render feedback items with appropriate styling
    const renderFeedbackItems = (feedbackItems) => {
        if (!feedbackItems || !Array.isArray(feedbackItems)) return null;
        
        return feedbackItems.map((item, index) => {
            // Determine feedback type based on the first character
            let feedbackClass = 'neutral';
            let cleanText = item;
            let icon = null;
            
            // Check for emoji at the beginning and set the class and icon accordingly
            if (item.startsWith('✅')) {
                feedbackClass = 'positive';
                // Remove the emoji from the text to avoid duplication
                cleanText = item.substring(2).trim();
                icon = <span className="feedback-icon positive">✓</span>;
            } else if (item.startsWith('❌')) {
                feedbackClass = 'negative';
                cleanText = item.substring(2).trim();
                icon = <span className="feedback-icon negative">✗</span>;
            } else if (item.startsWith('⚠️')) {
                feedbackClass = 'warning';
                cleanText = item.substring(2).trim();
                icon = <span className="feedback-icon warning">⚠</span>;
            }
            
            // Capitalize first letter of feedback for better readability
            if (cleanText.length > 0) {
                cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
            }
            
            return (
                <li key={index} className={`feedback-item ${feedbackClass}`}>
                    <div className="feedback-icon-container">
                        {icon}
                    </div>
                    <div className="feedback-text">
                        {cleanText}
                    </div>
                </li>
            );
        });
    };

    // Helper function for color coding based on quality score
    const getQualityColor = (value) => {
        if (value >= 80) return '#22C55E'; // Green for good
        if (value >= 60) return '#F59E0B'; // Amber for medium
        return '#EF4444'; // Red for poor
    };

    // Set exercise type to quadruped only
    useEffect(() => {
        // Default to quadruped exercise if none selected
        if (!selectedExercise) {
            setSelectedExercise("quadruped");
        }
    }, []);

    // Enhance the analyzeVideo function to include pose data for playback
    const analyzeVideo = () => {
        // Stop the camera stream if it's still active
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        
        // Pause the video to prevent flickering during analysis
        if (playbackVideoRef.current) {
            playbackVideoRef.current.pause();
        }
        
        setView("analyzing");
        setAnalysisDuration(0);
        
        // Start the analysis timer with a smoother update rate
        const startTime = Date.now();
        analysisTimerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000 * 10);
            // Use a more gradual progression that slows down as it approaches 100%
            const smoothProgress = Math.min(95, elapsed); // Cap at 95% until results are ready
            setAnalysisDuration(smoothProgress);
        }, 200); // Lower update frequency for smoother animation
        
        if (!recordedBlob) {
            handleAnalysisError("No video recording found to analyze.");
            return;
        }
        
        // Create form data for API request
        const formData = new FormData();
        formData.append('video', recordedBlob, 'exercise_video.mp4');
        formData.append('exercise_type', selectedExercise);
        
        // Send to backend API
        fetch(`${API_BASE_URL}/api/analyze`, {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            clearInterval(analysisTimerRef.current);
            
            // Use real feedback from backend analysis
            let processedFeedback = data.feedback || [];
            
            // Only add fallback feedback if backend provides no feedback at all
            if (!processedFeedback.length) {
                processedFeedback = [
                    "⚠️ Analysis completed but no specific feedback available.",
                    "✅ Please try recording again with better lighting and positioning."
                ];
            }
            
            // Store the complete analysis result including pose data for playback
            const analysisData = {
                feedback: processedFeedback,
                summary: {
                    total_time: data.summary?.total_time || "00:30",
                    repetitions: data.summary?.repetitions || 1,
                    form_quality: data.summary?.form_quality || 60,
                    positive_feedback_percent: data.summary?.positive_feedback_percent || 25
                },
                poses: data.landmarks ? data.landmarks.map((landmarks, index) => ({
                    timestamp: index * (1/30), // Assuming 30fps
                    pose: landmarks ? {
                        keypoints: landmarks.map(lm => ({
                            x: lm.x,
                            y: lm.y,
                            score: lm.visibility || 0.5
                        }))
                    } : null
                })).filter(p => p.pose) : [],
                fps: data.fps || 30
            };

            // Set the analysis result with real backend data
            setAnalysisResult(analysisData);
            setAnalysisDuration(100);
            setView("feedbackReady");
        })
        .catch(error => {
            clearInterval(analysisTimerRef.current);
            console.error("Error analyzing video:", error);
            handleAnalysisError(`Failed to analyze video: ${error.message}`);
        });
    };

    // Add this function to enhance feedback with specific issues
    const enhanceFeedbackWithSpecificIssues = (feedback, data) => {
        if (!data || !Array.isArray(feedback)) return feedback;
        
        // Define exercise-specific feedback based on common issues with more variety
        const specificIssues = {
            'quadruped': [
                // Critical feet positioning feedback - always include this for quadruped
                { 
                    condition: true, 
                    feedback: "⚠️ Flatten the tops of your feet and ankles against the ground — press them down actively.",
                    priority: 10 // High priority
                },
                { 
                    // Check if the backend explicitly detected foot lift issues
                    condition: data.foot_lift_detected === true, 
                    feedback: "❌ Feet lifted from ground during movement. Keep the tops of your feet flat against the floor.",
                    priority: 9
                },
                { 
                    // Check for ankle positioning issues
                    condition: data.ankle_collapse === true, 
                    feedback: "❌ Ankles rolled inward or outward. Press ankles firmly against the floor.",
                    priority: 8
                },
                // Use more dynamic conditions based on actual metrics
                { 
                    // Detect spine instability from backend data
                    condition: data.spine_instability === true, 
                    feedback: "❌ Unstable spine movement detected. Maintain a neutral spine position.",
                    priority: 7
                },
                { 
                    // Check if the backend detected back arching
                    condition: data.back_arching === true, 
                    feedback: "❌ Excessive back arching observed. Keep your back flat and engage your core.",
                    priority: 7
                },
                { 
                    // Check if the backend detected back rounding
                    condition: data.back_rounding === true, 
                    feedback: "❌ Back rounding detected. Focus on maintaining a neutral spine position.",
                    priority: 7
                },
                // Head positioning
                { 
                    // Check if the backend detected head dropping
                    condition: data.head_drop_detected === true, 
                    feedback: "❌ Head dropped below spine alignment. Keep your head aligned with your spine, gaze toward the floor.",
                    priority: 6
                },
                { 
                    // Check if the backend detected head raising
                    condition: data.head_up_detected === true, 
                    feedback: "❌ Head raised too high. Keep your neck in line with your spine, avoid looking up.",
                    priority: 6
                },
                // Use scores from backend when available
                { 
                    // Check feet flattening score if available
                    condition: data.feet_flattening_score !== undefined && data.feet_flattening_score < 70, 
                    feedback: "❌ Inconsistent feet position. Keep the tops of feet and ankles pressed against the floor.",
                    priority: 8
                },
                { 
                    // Check core engagement score if available
                    condition: data.core_engagement_score !== undefined && data.core_engagement_score < 70, 
                    feedback: "⚠️ Core could be more engaged. Draw navel toward spine throughout movement.",
                    priority: 4
                },
                { 
                    // Check balance score if available
                    condition: data.balance_score !== undefined && data.balance_score < 70, 
                    feedback: "⚠️ Balance fluctuations observed. Focus on stability in the starting position.",
                    priority: 4
                },
                // Extract issues from backend feedback array if available
                { 
                    condition: Array.isArray(data.feedback) && 
                              data.feedback.some(item => item.toLowerCase().includes("spine") && 
                                               (item.toLowerCase().includes("unstable") || item.toLowerCase().includes("inconsistent"))), 
                    feedback: "❌ Spine position inconsistent. Focus on keeping your back flat throughout the movement.",
                    priority: 7
                },
                { 
                    condition: Array.isArray(data.feedback) && 
                              data.feedback.some(item => item.toLowerCase().includes("repetition") && 
                                               item.toLowerCase().includes("consistent")), 
                    feedback: "⚠️ Movement speed varied between repetitions. Aim for a smooth, consistent pace.",
                    priority: 5
                },
            ],
            'toeDrive': [
                // Include similar patterns for toeDrive with appropriate variations
                { 
                    condition: true, 
                    feedback: "⚠️ Press your toes firmly into the ground during the movement for proper activation.",
                    priority: 10
                },
                { 
                    // Check if the backend detected insufficient toe drive
                    condition: data.insufficient_toe_drive === true, 
                    feedback: "❌ Not enough toe pressure detected. Press your toes more firmly into the floor.",
                    priority: 9
                },
                { 
                    // Check if the backend detected spine instability
                    condition: data.spine_instability === true, 
                    feedback: "⚠️ Maintain a more stable spine throughout the exercise.",
                    priority: 7
                },
                { 
                    // Check if the backend detected head dropping
                    condition: data.head_drop_detected === true, 
                    feedback: "⚠️ Keep your head aligned with your spine, gaze toward the floor.",
                    priority: 6
                },
            ]
        };
        
        // Use actual data from backend when available, otherwise provide reasonable defaults
        const formMetrics = {
            feet_flattening: data.feet_flattening_score || (data.foot_lift_detected ? 50 : 85),
            spine_stability: data.spine_stability_score || (data.spine_instability ? 60 : 85),
            head_alignment: data.head_alignment_score || (data.head_drop_detected || data.head_up_detected ? 65 : 90),
            shoulder_hip_alignment: data.alignment_score || 80,
            movement_quality: data.movement_quality_score || 75,
        };
        
        // Calculate overall form score based on actual metrics when available
        let formQuality = data.form_quality;
        if (!formQuality) {
            const scores = Object.values(formMetrics);
            const avgScore = scores.reduce((sum, val) => sum + val, 0) / scores.length;
            formQuality = Math.round(avgScore);
        }
        
        // Add exercise-specific feedback based on detected issues
        const exerciseType = selectedExercise || 'quadruped';
        const issues = specificIssues[exerciseType] || specificIssues['quadruped'];
        
        let detectedIssues = [];
        
        // Process backend feedback array if available
        if (Array.isArray(data.feedback) && data.feedback.length > 0) {
            data.feedback.forEach(item => {
                // Extract feedback type and message
                let type = 'neutral';
                if (item.startsWith('✅')) type = 'positive';
                else if (item.startsWith('❌')) type = 'negative';
                else if (item.startsWith('⚠️')) type = 'warning';
                
                // Add backend feedback with appropriate priority
                if (type === 'negative') {
                    detectedIssues.push({
                        feedback: item,
                        priority: 8,  // High priority for negative feedback
                        fromBackend: true
                    });
                } else if (type === 'warning') {
                    detectedIssues.push({
                        feedback: item,
                        priority: 6,  // Medium priority for warnings
                        fromBackend: true
                    });
                } else if (type === 'positive') {
                    detectedIssues.push({
                        feedback: item,
                        priority: 3,  // Lower priority for positive feedback
                        fromBackend: true
                    });
                }
            });
        }
        
        // Filter issues that are actually detected
        issues.forEach(issue => {
            // Use actual data values when available
            let isDetected = false;
            
            if (typeof issue.condition === 'boolean') {
                isDetected = issue.condition;
            } else if (issue.condition === true) {
                isDetected = true; // Always include items with condition: true
            }
            
            // Collect all detected issues with their priority
            if (isDetected) {
                detectedIssues.push({
                    feedback: issue.feedback,
                    priority: issue.priority,
                    fromBackend: false
                });
            }
        });
        
        // Sort by priority (higher priority first)
        detectedIssues.sort((a, b) => b.priority - a.priority);
        
        // Start with a fresh feedback array ensuring it's not repetitive
        let enhancedFeedback = [];
        
        // Always include foot flattening instruction for quadruped exercise
        if (exerciseType === 'quadruped') {
            const feetInstruction = "⚠️ Flatten the tops of your feet and ankles against the ground — press them down actively.";
            enhancedFeedback.push(feetInstruction);
        }
        
        // Include backend feedback with higher priority
        const backendFeedback = detectedIssues.filter(issue => issue.fromBackend);
        for (let i = 0; i < Math.min(backendFeedback.length, 3); i++) {
            if (!enhancedFeedback.some(f => f.toLowerCase().includes(backendFeedback[i].feedback.toLowerCase().substring(2)))) {
                enhancedFeedback.push(backendFeedback[i].feedback);
            }
        }
        
        // Add high priority issues (up to 3)
        let highPriorityIssues = detectedIssues.filter(issue => !issue.fromBackend && issue.priority >= 7);
        for (let i = 0; i < Math.min(highPriorityIssues.length, 2); i++) {
            if (!enhancedFeedback.some(f => f.toLowerCase().includes(highPriorityIssues[i].feedback.toLowerCase().substring(2)))) {
                enhancedFeedback.push(highPriorityIssues[i].feedback);
            }
        }
        
        // Add some medium priority issues (up to 2)
        let mediumPriorityIssues = detectedIssues.filter(issue => !issue.fromBackend && issue.priority >= 4 && issue.priority < 7);
        for (let i = 0; i < Math.min(mediumPriorityIssues.length, 1); i++) {
            if (!enhancedFeedback.some(f => f.toLowerCase().includes(mediumPriorityIssues[i].feedback.toLowerCase().substring(2)))) {
                enhancedFeedback.push(mediumPriorityIssues[i].feedback);
            }
        }
        
        // Add positive feedback based on form quality
        if (formQuality > 85) {
            enhancedFeedback.push("✅ Excellent overall form! Your movement pattern is consistent and controlled.");
        } else if (formQuality > 70) {
            enhancedFeedback.push("✅ Good effort! Your form is developing well with a few areas to refine.");
        } else {
            // For lower scores, add an encouraging note
            enhancedFeedback.push("⚠️ Keep practicing! Focus on the specific feedback to improve your form.");
        }
        
        // Add repetition count if available
        if (data.repetitions && data.repetitions > 0) {
            enhancedFeedback.push(`✅ You completed ${data.repetitions} repetition${data.repetitions > 1 ? 's' : ''}.`);
        }
        
        // Remove duplicates
        enhancedFeedback = [...new Set(enhancedFeedback)];
        
        // Ensure we have at least 3 feedback items
        if (enhancedFeedback.length < 3) {
            if (!enhancedFeedback.some(f => f.toLowerCase().includes("spine"))) {
                enhancedFeedback.push("⚠️ Focus on maintaining a neutral spine throughout the exercise.");
            }
            if (!enhancedFeedback.some(f => f.toLowerCase().includes("breath"))) {
                enhancedFeedback.push("⚠️ Remember to breathe naturally throughout the movement.");
            }
        }
        
        return enhancedFeedback;
    };

    // Add a function to check for visibility issues
    const checkVisibilityIssues = () => {
        if (!liveCameraRef.current) return;
        
        // Check if enough time has passed since mounting (give camera time to adjust)
        if (lightingQuality === "poor") {
            setStartPositionFeedback("⚠️ We're having trouble seeing you clearly. Please check your lighting or move to a brighter area.");
            return false;
        }
        
        // If key body parts aren't visible
        if (detectedPose && detectedPose.visibility) {
            const keyParts = ['feet', 'ankles', 'knees', 'hips'];
            const hasVisibilityIssues = keyParts.some(part => 
                detectedPose.visibility[part] && detectedPose.visibility[part] < 0.4
            );
            
            if (hasVisibilityIssues) {
                setStartPositionFeedback("⚠️ We had trouble seeing your feet clearly. Adjust camera angle so your full body is visible and try again.");
                return false;
            }
        }
        
        return true;
    };

    return (
        <div className="exercise-page">
            <header className="exercise-header">
                <h1>
                    {"Quadruped Rocking"}
                </h1>
                <div className="header-controls">
                    {/* View mode button removed */}
                </div>
            </header>

            <main className="exercise-content">
                {/* Add exercise selector at the top of the video section */}
                <div className="exercise-selector-container">
                    <h3>Select Exercise:</h3>
                    <div className="exercise-options">
                        <div 
                            className={`exercise-option ${selectedExercise === 'quadruped' ? 'selected' : ''}`}
                            onClick={() => handleExerciseChange('quadruped')}
                        >
                            <strong>Quadruped Rock</strong>
                            <p>Standard rocking on hands and knees</p>
                        </div>
                        <div 
                            className={`exercise-option ${selectedExercise === 'toeDrive' ? 'selected' : ''}`}
                            onClick={() => handleExerciseChange('toeDrive')}
                        >
                            <strong>Toe Drive Rock</strong>
                            <p>Pressing toes into floor during rocking</p>
                        </div>
                    </div>
                </div>
                
                {/* Add prop reminder above the video */}
                <div className="prop-reminder">
                    <p>🟦 Recommended Props:</p>
                    <p>A small towel can be placed under your knees for comfort if needed.</p>
                </div>
                
                <div className="video-container">
                    <div className="video-player">
                        {(view === 'cameraReady' || view === 'recording' || view === 'positionCheck') && (
                            <div className="video-container">
                                <video
                                    ref={liveCameraRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="live-camera"
                                />
                                {startPositionFeedback && (
                                    <div className="position-feedback">
                                        {startPositionFeedback}
                                    </div>
                                )}
                                <canvas 
                                    ref={positionCanvasRef} 
                                    className="pose-overlay-canvas"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        pointerEvents: 'none',
                                        zIndex: 15
                                    }}
                                />
                                {/* Hidden composite canvas used for recording with tracers */}
                                <canvas
                                    ref={recordCanvasRef}
                                    style={{
                                        position: 'absolute',
                                        left: '-99999px',
                                        width: '1px',
                                        height: '1px',
                                        opacity: 0,
                                        pointerEvents: 'none'
                                    }}
                                />
                            </div>
                        )}
                        {/* Video Playback for Analysis */}
                        <video
                            ref={playbackVideoRef}
                            controls
                            playsInline
                            preload="metadata"
                            className={(view === 'recorded' || view === 'feedbackReady' || view === 'analyzing') ? '' : 'hidden'}
                            style={{ display: (view === 'recorded' || view === 'feedbackReady' || view === 'analyzing') ? 'block' : 'none' }}
                            onLoadedData={() => {
                                if (view === 'feedbackReady' && canvasRef.current && analysisResult?.poses?.length > 0) {
                                    const canvas = canvasRef.current;
                                    const ctx = canvas.getContext('2d');
                                    canvas.width = playbackVideoRef.current.clientWidth;
                                    canvas.height = playbackVideoRef.current.clientHeight;
                                    
                                    // Draw without highlights to avoid reference errors
                                    drawPose(analysisResult.poses[0].pose, ctx, playbackVideoRef.current, {});
                                }
                            }}
                        />

                        {/* Analysis overlay - removed from inside the video container */}
                        {/* Overlay canvas for pose visualization - only show after analysis is complete */}
                        {view === 'feedbackReady' && (
                            <canvas 
                                ref={canvasRef} 
                                className="pose-overlay-canvas"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    pointerEvents: 'none',
                                    zIndex: 10
                                }}
                            />
                        )}
                {view === 'feedbackReady' && (
                    <a
                        href={RETURN_URL}
                        className="return-link"
                        style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '12px',
                            background: 'rgba(17,24,39,0.7)',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            zIndex: 20
                        }}
                        target="_self"
                        rel="noopener noreferrer"
                    >
                        ↩ Return to Site
                    </a>
                )}
                        
                        {view === 'idle' && (
                            <div className="video-placeholder">
                                <div className="placeholder-text">Click "Begin Exercise" to start</div>
                            </div>
                        )}
                    </div>

                    {/* Simplified analyzing status UI */}
                    {view === 'analyzing' && (
                        <div className="analyzing-status-container">
                            <h3>Analyzing Your Movement</h3>
                            <div className="analysis-progress-bar">
                                <div className="analysis-progress-fill" style={{ width: `${analysisDuration}%` }}></div>
                            </div>
                            <div className="analysis-status-text">
                                Processing movement patterns...
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="controls-container">
                    {view === 'idle' && (
                        <div className="button-group">
                            <button className="begin-button" onClick={handleSetupCamera}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polygon points="10 8 16 12 10 16 10 8"></polygon>
                                </svg>
                                Begin Exercise
                            </button>
                        </div>
                    )}
                    
                    {view === 'cameraReady' && (
                        <div className="button-group">
                            <button className="begin-button" onClick={checkStartPosition}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                Check Starting Position
                            </button>
                            <button className="camera-toggle" onClick={handleToggleCamera} aria-label="Switch Camera">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14.5 2.5l-3 3h-3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2v-10a2 2 0 00-2-2h-3l-3-3z" />
                                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                                    <path d="M4 18l-1-1a2 2 0 010-2.8l4-4.2.8.8" />
                                    <path d="M1 10l1 1" />
                                </svg>
                                <span className="camera-toggle-text">Switch Camera</span>
                            </button>
                            <button className="close-camera-button" onClick={handleCloseCamera}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                                Close Camera
                            </button>
                        </div>
                    )}
                    
                    {view === 'positionCheck' && (
                        <div className="button-group">
                            {isPositionCorrect ? (
                                <button className="begin-button" onClick={startRecording}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
                                    </svg>
                                    Start Recording
                                </button>
                            ) : (
                                <button className="begin-button" disabled>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="16"></line>
                                        <line x1="8" y1="12" x2="16" y2="12"></line>
                                    </svg>
                                    Adjust Position
                                </button>
                            )}
                            <button className="skip-button" onClick={skipPositionCheck}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="5 4 15 12 5 20 5 4"></polygon>
                                    <line x1="19" y1="5" x2="19" y2="19"></line>
                                </svg>
                                Skip Check
                            </button>
                            <button className="close-camera-button" onClick={() => setView("cameraReady")}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5"></path>
                                    <polyline points="12 19 5 12 12 5"></polyline>
                                </svg>
                                Back
                            </button>
                        </div>
                    )}
                    
                    {view === 'recording' && (
                        <div className="button-group">
                            <button className="stop-button" onClick={handleStopRecording}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="6" y="6" width="12" height="12" rx="1"></rect>
                                </svg>
                                Stop Recording
                            </button>
                            <div className="recording-duration">
                                {String(Math.floor(recordingDuration / 60)).padStart(2, '0')}:{String(recordingDuration % 60).padStart(2, '0')}
                            </div>
                        </div>
                    )}
                    
                    {view === 'recorded' && (
                        <div className="button-group">
                            <button className="analyze-button" onClick={analyzeVideo}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                </svg>
                                Analyze Exercise
                            </button>
                            <button className="begin-button" onClick={handleRetake}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 4v6h6"></path>
                                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                                </svg>
                                Record Again
                            </button>
                        </div>
                    )}
                    
                    {view === 'feedbackReady' && (
                        <div className="button-group">
                            <button className="begin-button" onClick={() => {
                                // Reset state for a new exercise
                                setRecordedBlob(null);
                                setAnalysisResult(null);
                                setView("cameraReady");
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                    <circle cx="12" cy="13" r="4"></circle>
                                </svg>
                                Record New Exercise
                            </button>
                        </div>
                    )}
                </div>
                
                {view === 'feedbackReady' && analysisResult && (
                    <div className="results-container">
                        <div className="feedback-section">
                            <h2>AI Movement Feedback</h2>
                            <ul className="feedback-list">
                                {renderFeedbackItems(analysisResult.feedback)}
                            </ul>
                        </div>
                        
                        <div className="metrics-container">
                            <h2>Session Summary</h2>
                            <ul className="metrics-list">
                                <li>
                                    <strong>Total Time</strong> 
                                    {(() => {
                                        try {
                                            if (analysisResult.summary && 
                                                typeof analysisResult.summary.total_time === 'string' &&
                                                /^\d+:\d{2}$/.test(analysisResult.summary.total_time)) {
                                                return <span className="progress-value">{analysisResult.summary.total_time}</span>;
                                            }
                                            
                                            if (recordedBlob && recordingDuration) {
                                                const minutes = Math.floor(recordingDuration / 60);
                                                const seconds = recordingDuration % 60;
                                                return <span className="progress-value">{`${minutes}:${seconds.toString().padStart(2, '0')}`}</span>;
                                            }
                                            
                                            return <span className="progress-value">0:00</span>;
                                        } catch (e) {
                                            console.error("Error formatting time:", e);
                                            return <span className="progress-value">0:00</span>;
                                        }
                                    })()}
                                </li>
                                <li>
                                    <strong>Repetitions</strong>
                                    <span className="progress-value">{analysisResult.summary?.repetitions || 1}</span>
                                </li>
                                <li>
                                    <strong>Form Quality</strong> 
                                    <div className="progress-bar-container">
                                        <div 
                                            className="progress-bar" 
                                            style={{
                                                width: `${analysisResult.summary?.form_quality || 80}%`, 
                                                backgroundColor: getQualityColor(analysisResult.summary?.form_quality || 80)
                                            }}
                                        ></div>
                                    </div>
                                    <span className="progress-value">{analysisResult.summary?.form_quality || 80}%</span>
                                </li>
                                <li>
                                    <strong>Positive Feedback</strong>
                                    <div className="progress-bar-container">
                                        <div 
                                            className="progress-bar" 
                                            style={{
                                                width: `${analysisResult.summary?.positive_feedback_percent || 70}%`, 
                                                backgroundColor: getQualityColor(analysisResult.summary?.positive_feedback_percent || 70)
                                            }}
                                        ></div>
                                    </div>
                                    <span className="progress-value">{analysisResult.summary?.positive_feedback_percent || 70}%</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {view === 'idle' && showExerciseSelector && (
                    <div className="exercise-selector">
                        <h2>Select Exercise</h2>
                        <div className="exercise-options">
                            <button 
                                className={`exercise-option ${selectedExercise === 'quadruped' ? 'selected' : ''}`} 
                                onClick={() => setSelectedExercise('quadruped')}
                            >
                                <div className="exercise-option-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="4" y="8" width="16" height="8" rx="2"></rect>
                                        <path d="M4 16v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"></path>
                                        <path d="M4 8V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                </div>
                                <div className="exercise-option-title">Quadruped Rock</div>
                                <div className="exercise-option-desc">Standard rocking on hands and knees</div>
                            </button>
                            <button 
                                className={`exercise-option ${selectedExercise === 'toeDrive' ? 'selected' : ''}`} 
                                onClick={() => setSelectedExercise('toeDrive')}
                            >
                                <div className="exercise-option-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 5v4"></path>
                                        <path d="M6 5v14"></path>
                                        <path d="M18 10a5 5 0 0 1 0 10H6"></path>
                                    </svg>
                                </div>
                                <div className="exercise-option-title">Toe Drive Rock</div>
                                <div className="exercise-option-desc">Pressing toes into floor during rocking</div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Add this prop reminder element in the UI where appropriate */}
                {view === 'cameraReady' && (
                    <div className="prop-reminder">
                        <h3>Recommended Props</h3>
                        <div className="prop-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                                <rect x="9" y="9" width="6" height="6"></rect>
                            </svg>
                            <span>A small towel can be placed under your knees for comfort if needed</span>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Video;
