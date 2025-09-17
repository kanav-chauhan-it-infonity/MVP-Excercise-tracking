class PhysicalTherapyApp {
    constructor() {
        this.poseDetector = new PoseDetector();
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.recordedVideoBlob = null;
        this.isRecording = false;
        this.recordingTimer = null;
        this.recordingDuration = 30; // seconds
        this.currentExerciseType = 'quadruped';
        this.postureCheckPassed = false;
        this.analysisData = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeApp();
    }

    initializeElements() {
        // Video elements
        this.webcamVideo = document.getElementById('webcam');
        this.outputCanvas = document.getElementById('output-canvas');
        
        // Control elements
        this.startRecordingBtn = document.getElementById('start-recording');
        this.stopRecordingBtn = document.getElementById('stop-recording');
        this.playRecordingBtn = document.getElementById('play-recording');
        this.skipPoseCheckBtn = document.getElementById('skip-pose-check');
        this.exerciseSelect = document.getElementById('exercise-type');
        
        // UI elements
        this.videoOverlay = document.getElementById('video-overlay');
        this.postureStatus = document.getElementById('posture-status');
        this.statusDetails = document.getElementById('status-details');
        this.recordingTimer = document.getElementById('recording-timer');
        this.timerText = document.getElementById('timer-text');
        this.feedbackSection = document.getElementById('feedback-section');
        this.feedbackContent = document.getElementById('feedback-content');
        this.performanceStats = document.getElementById('performance-stats');
    }

    setupEventListeners() {
        this.startRecordingBtn.addEventListener('click', () => this.startRecording());
        this.stopRecordingBtn.addEventListener('click', () => this.stopRecording());
        this.playRecordingBtn.addEventListener('click', () => this.playRecordedVideo());
        this.skipPoseCheckBtn.addEventListener('click', () => this.skipPoseCheck());
        this.exerciseSelect.addEventListener('change', (e) => {
            this.currentExerciseType = e.target.value;
            this.resetPostureCheck();
        });
    }

    async initializeApp() {
        try {
            // Set canvas size to match video
            this.outputCanvas.width = 1280;
            this.outputCanvas.height = 720;
            
            // Check camera availability first
            await this.checkCameraAvailability();
            
            // Initialize pose detection
            await this.poseDetector.initialize(
                this.webcamVideo,
                this.outputCanvas,
                (results) => this.onPoseResults(results)
            );
            
            // Enable skip button immediately
            this.skipPoseCheckBtn.disabled = false;
            
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.handleCameraError(error);
            // Enable skip button even if camera fails
            this.skipPoseCheckBtn.disabled = false;
        }
    }
    
    async checkCameraAvailability() {
        try {
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API not supported in this browser');
            }
            
            // Check available devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            if (videoDevices.length === 0) {
                throw new Error('No camera devices found');
            }
            
            console.log(`Found ${videoDevices.length} camera device(s)`);
            
            // Test camera access with minimal constraints
            const testStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' } 
            });
            
            // Stop test stream immediately
            testStream.getTracks().forEach(track => track.stop());
            
            console.log('Camera access test successful');
            
        } catch (error) {
            console.error('Camera availability check failed:', error);
            throw error;
        }
    }
    
    handleCameraError(error) {
        let errorMessage = 'Camera access failed. ';
        let suggestions = [];
        
        if (error.name === 'NotAllowedError') {
            errorMessage += 'Camera permission denied.';
            suggestions = [
                '1. Click the camera icon in your browser\'s address bar',
                '2. Select "Allow" for camera access',
                '3. Refresh the page and try again'
            ];
        } else if (error.name === 'NotFoundError') {
            errorMessage += 'No camera found.';
            suggestions = [
                '1. Make sure your camera is connected',
                '2. Check if other apps are using the camera',
                '3. Try refreshing the page'
            ];
        } else if (error.name === 'NotSupportedError') {
            errorMessage += 'Camera not supported.';
            suggestions = [
                '1. Try using Chrome, Firefox, or Safari',
                '2. Make sure you\'re using HTTPS (not HTTP)',
                '3. Update your browser to the latest version'
            ];
        } else if (error.message.includes('Camera API not supported')) {
            errorMessage += 'Browser doesn\'t support camera access.';
            suggestions = [
                '1. Use a modern browser (Chrome, Firefox, Safari)',
                '2. Make sure you\'re accessing via HTTPS',
                '3. Update your browser'
            ];
        } else {
            errorMessage += 'Unknown camera error.';
            suggestions = [
                '1. Refresh the page and try again',
                '2. Check browser permissions',
                '3. Try a different browser'
            ];
        }
        
        // Show detailed error with suggestions
        const errorHTML = `
            <div class="feedback-item warning">
                <strong>⚠️ ${errorMessage}</strong>
                <div style="margin-top: 10px;">
                    <strong>Try these solutions:</strong>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        ${suggestions.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
                <div style="margin-top: 10px;">
                    <button onclick="location.reload()" class="btn btn-primary" style="margin-right: 10px;">Refresh Page</button>
                    <button onclick="window.app.skipPoseCheck()" class="btn btn-outline">Skip Camera & Continue</button>
                </div>
            </div>
        `;
        
        this.feedbackSection.style.display = 'block';
        this.feedbackContent.innerHTML = errorHTML;
    }

    onPoseResults(results) {
        if (!results.poseLandmarks) {
            this.updatePostureStatus(false, "Please position yourself in view of the camera", []);
            return;
        }

        // Check posture if not recording
        if (!this.isRecording) {
            const postureCheck = this.poseDetector.checkStartingPosture(
                results.poseLandmarks, 
                this.currentExerciseType
            );
            
            this.updatePostureStatus(
                postureCheck.isCorrect,
                postureCheck.message,
                postureCheck.details
            );
            
            if (postureCheck.isCorrect && !this.postureCheckPassed) {
                this.postureCheckPassed = true;
                this.startRecordingBtn.disabled = false;
                setTimeout(() => {
                    this.hideOverlay();
                }, 2000);
            } else if (!postureCheck.isCorrect && this.postureCheckPassed) {
                this.postureCheckPassed = false;
                this.startRecordingBtn.disabled = true;
                this.showOverlay();
            }
        }

        // Analyze pose during recording
        if (this.isRecording) {
            const analysis = this.poseDetector.analyzePoseForm(
                results.poseLandmarks,
                this.currentExerciseType
            );
            
            // Store frame data with relative timestamp for playback synchronization
            const recordingStartTime = this.recordingStartTime || Date.now();
            const frameData = {
                timestamp: Date.now(),
                relativeTime: (Date.now() - recordingStartTime) / 1000, // seconds from start
                landmarks: results.poseLandmarks ? JSON.parse(JSON.stringify(results.poseLandmarks)) : null,
                analysis: analysis
            };
            this.analysisData.push(frameData);
            
            // Debug: Log every 30th frame to verify data is being stored
            if (this.analysisData.length % 30 === 0) {
                console.log(`Stored frame ${this.analysisData.length}, time: ${frameData.relativeTime.toFixed(2)}s, has landmarks: ${!!frameData.landmarks}`);
            }
        }
    }

    updatePostureStatus(isCorrect, message, details) {
        const statusMessage = this.postureStatus.querySelector('.status-message');
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${isCorrect ? 'success' : 'warning'}`;
        
        this.statusDetails.innerHTML = details.map(detail => 
            `<div class="status-detail">${detail}</div>`
        ).join('');
    }

    showOverlay() {
        this.videoOverlay.classList.remove('hidden');
    }

    hideOverlay() {
        this.videoOverlay.classList.add('hidden');
    }

    resetPostureCheck() {
        this.postureCheckPassed = false;
        this.startRecordingBtn.disabled = true;
        this.showOverlay();
        this.updatePostureStatus(false, "Position yourself in the starting pose...", []);
    }

    async startRecording() {
        try {
            // Check if MediaRecorder is supported
            if (!window.MediaRecorder) {
                throw new Error('MediaRecorder not supported in this browser');
            }
            
            // Get video stream from webcam
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 }, 
                    height: { ideal: 720 },
                    facingMode: 'user'
                }, 
                audio: false 
            });
            
            // Check supported MIME types
            let mimeType = 'video/webm;codecs=vp9';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm;codecs=vp8';
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = 'video/webm';
                    if (!MediaRecorder.isTypeSupported(mimeType)) {
                        mimeType = 'video/mp4';
                    }
                }
            }
            
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: mimeType
            });
            
            this.recordedChunks = [];
            this.analysisData = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.recordedVideoBlob = new Blob(this.recordedChunks, {
                    type: mimeType
                });
                this.onRecordingComplete();
            };
            
            this.mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event.error);
                this.showError('Recording error occurred. Please try again.');
                this.stopRecording();
            };
            
            // Start recording
            this.mediaRecorder.start(1000); // Record in 1-second chunks
            this.isRecording = true;
            this.recordingStartTime = Date.now(); // Store start time for synchronization
            
            // Update UI
            this.startRecordingBtn.disabled = true;
            this.stopRecordingBtn.disabled = false;
            this.playRecordingBtn.disabled = true;
            this.recordingTimer.style.display = 'block';
            
            // Hide feedback section during recording
            this.feedbackSection.style.display = 'none';
            
            // Start countdown timer
            this.startRecordingTimer();
            
            console.log(`Recording started with MIME type: ${mimeType}`);
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            let errorMessage = 'Failed to start recording. ';
            
            if (error.name === 'NotAllowedError') {
                errorMessage += 'Please allow camera access and try again.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No camera found. Please connect a camera and try again.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage += 'Recording not supported in this browser.';
            } else {
                errorMessage += 'Please check camera permissions and try again.';
            }
            
            this.showError(errorMessage);
        }
    }

    startRecordingTimer() {
        let timeLeft = this.recordingDuration;
        this.timerText.textContent = timeLeft;
        
        this.recordingTimerInterval = setInterval(() => {
            timeLeft--;
            this.timerText.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                this.stopRecording();
            }
        }, 1000);
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Clear timer
            if (this.recordingTimerInterval) {
                clearInterval(this.recordingTimerInterval);
            }
            
            // Update UI
            this.startRecordingBtn.disabled = false;
            this.stopRecordingBtn.disabled = true;
            this.recordingTimer.style.display = 'none';
            
            // Stop all video tracks
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    }

    onRecordingComplete() {
        console.log('Recording complete, analyzing...');
        this.analyzeRecording();
        this.playRecordingBtn.disabled = false;
        
        // Show analysis results immediately
        this.feedbackSection.style.display = 'block';
        this.feedbackSection.scrollIntoView({ behavior: 'smooth' });
    }

    analyzeRecording() {
        if (this.analysisData.length === 0) {
            this.showFeedback(['No pose data recorded'], [], 0);
            return;
        }

        // Calculate overall performance
        const scores = this.analysisData.map(frame => frame.analysis.score);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        
        // Collect all issues and strengths
        const allIssues = [];
        const allStrengths = [];
        
        this.analysisData.forEach(frame => {
            allIssues.push(...frame.analysis.issues);
            allStrengths.push(...frame.analysis.strengths);
        });
        
        // Count frequency of issues and strengths
        const issueFrequency = this.countFrequency(allIssues);
        const strengthFrequency = this.countFrequency(allStrengths);
        
        // Get most common issues and strengths
        const topIssues = Object.entries(issueFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([issue]) => issue);
            
        const topStrengths = Object.entries(strengthFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([strength]) => strength);

        this.showFeedback(topIssues, topStrengths, averageScore);
    }

    countFrequency(items) {
        return items.reduce((freq, item) => {
            freq[item] = (freq[item] || 0) + 1;
            return freq;
        }, {});
    }

    showFeedback(issues, strengths, score) {
        this.feedbackSection.style.display = 'block';
        
        let feedbackHTML = '';
        
        // Show strengths first (positive reinforcement)
        if (strengths.length > 0) {
            strengths.forEach(strength => {
                feedbackHTML += `
                    <div class="feedback-item positive">
                        <strong>✓ ${strength}</strong>
                    </div>
                `;
            });
        }
        
        // Show issues as suggestions (if score < 85%)
        if (score < 85 && issues.length > 0) {
            issues.forEach(issue => {
                feedbackHTML += `
                    <div class="feedback-item suggestion">
                        <strong>💡 ${issue}</strong>
                    </div>
                `;
            });
        } else if (score >= 85 && issues.length === 0) {
            // Perfect performance
            feedbackHTML += `
                <div class="feedback-item positive">
                    <strong>🎉 Perfect form! Keep up the excellent work!</strong>
                </div>
            `;
        }
        
        this.feedbackContent.innerHTML = feedbackHTML;
        
        // Show performance stats only if score > 85%
        if (score > 85) {
            this.showPerformanceStats(score, issues.length);
        } else {
            this.performanceStats.style.display = 'none';
        }
    }

    showPerformanceStats(score, formBreaks) {
        const statsHTML = `
            <h4>Performance Statistics</h4>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${Math.round(score)}%</span>
                    <div class="stat-label">Form Accuracy</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${formBreaks}</span>
                    <div class="stat-label">Form Breaks</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${score > 90 ? 'Excellent' : 'Good'}</span>
                    <div class="stat-label">Overall Result</div>
                </div>
            </div>
        `;
        
        this.performanceStats.innerHTML = statsHTML;
        this.performanceStats.style.display = 'block';
    }

    async playRecordedVideo() {
        if (!this.recordedVideoBlob) {
            console.error('No recorded video available');
            this.showError('No recorded video available. Please record a video first.');
            return;
        }

        try {
            // Create a new video element for playback
            const playbackVideo = document.createElement('video');
            playbackVideo.src = URL.createObjectURL(this.recordedVideoBlob);
            playbackVideo.controls = true;
            playbackVideo.style.width = '100%';
            playbackVideo.style.height = '100%';
            playbackVideo.style.objectFit = 'cover';
            playbackVideo.style.transform = 'scaleX(-1)'; // Mirror like webcam
            playbackVideo.style.borderRadius = '12px';
            
            // Create a canvas for pose overlay during playback
            const playbackCanvas = document.createElement('canvas');
            playbackCanvas.width = 1280;
            playbackCanvas.height = 720;
            playbackCanvas.style.position = 'absolute';
            playbackCanvas.style.top = '0';
            playbackCanvas.style.left = '0';
            playbackCanvas.style.width = '100%';
            playbackCanvas.style.height = '100%';
            playbackCanvas.style.transform = 'scaleX(-1)';
            playbackCanvas.style.pointerEvents = 'none';
            playbackCanvas.style.zIndex = '10';
            playbackCanvas.style.border = '2px solid red'; // Debug: Make canvas visible
            playbackCanvas.id = 'playback-pose-canvas';
            
            const playbackCtx = playbackCanvas.getContext('2d');
            
            // Replace webcam video with playback video temporarily
            const videoContainer = this.webcamVideo.parentElement;
            const originalVideo = this.webcamVideo;
            const originalCanvas = this.outputCanvas;
            
            // Hide original canvas
            originalCanvas.style.display = 'none';
            
            videoContainer.replaceChild(playbackVideo, originalVideo);
            videoContainer.appendChild(playbackCanvas);
            
            // Update button states
            this.playRecordingBtn.disabled = true;
            this.startRecordingBtn.disabled = true;
            
            // Set up pose overlay synchronization
            let animationFrame;
            const updatePoseOverlay = () => {
                if (playbackVideo.paused || playbackVideo.ended) {
                    return;
                }
                
                const currentTime = playbackVideo.currentTime;
                this.drawPoseAtTime(playbackCtx, playbackCanvas, currentTime);
                animationFrame = requestAnimationFrame(updatePoseOverlay);
            };
            
            // Debug: Log analysis data availability
            console.log('Analysis data frames:', this.analysisData ? this.analysisData.length : 0);
            if (this.analysisData && this.analysisData.length > 0) {
                console.log('First frame time:', this.analysisData[0].relativeTime);
                console.log('Last frame time:', this.analysisData[this.analysisData.length - 1].relativeTime);
                console.log('Sample landmarks:', this.analysisData[0].landmarks ? 'Available' : 'Missing');
            } else {
                console.log('No analysis data available - make sure to record a video first');
            }
            
            // Add event listeners
            playbackVideo.addEventListener('play', () => {
                updatePoseOverlay();
            });
            
            playbackVideo.addEventListener('pause', () => {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                }
                
                // Allow user to restart webcam if they pause
                const restoreBtn = document.createElement('button');
                restoreBtn.textContent = 'Return to Live Camera';
                restoreBtn.className = 'btn btn-outline';
                restoreBtn.style.position = 'absolute';
                restoreBtn.style.top = '10px';
                restoreBtn.style.right = '10px';
                restoreBtn.style.zIndex = '1000';
                
                restoreBtn.addEventListener('click', () => {
                    this.restoreOriginalVideo(playbackVideo, originalVideo, videoContainer, playbackCanvas, animationFrame);
                    restoreBtn.remove();
                });
                
                videoContainer.appendChild(restoreBtn);
            });
            
            playbackVideo.addEventListener('ended', () => {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                }
                this.restoreOriginalVideo(playbackVideo, originalVideo, videoContainer, playbackCanvas, animationFrame);
            });
            
            playbackVideo.addEventListener('seeked', () => {
                const currentTime = playbackVideo.currentTime;
                console.log('Video seeked to:', currentTime);
                this.drawPoseAtTime(playbackCtx, playbackCanvas, currentTime);
            });
            
            // Initial pose draw when video loads
            playbackVideo.addEventListener('loadeddata', () => {
                console.log('Video loaded, drawing initial pose');
                this.drawPoseAtTime(playbackCtx, playbackCanvas, 0);
            });
            
            // Play the video
            await playbackVideo.play();
            
        } catch (error) {
            console.error('Error playing recorded video:', error);
            this.showError('Failed to play recorded video. Please try recording again.');
        }
    }
    
    restoreOriginalVideo(playbackVideo, originalVideo, videoContainer, playbackCanvas = null, animationFrame = null) {
        // Cancel animation frame if running
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
        
        // Restore original video and canvas
        videoContainer.replaceChild(originalVideo, playbackVideo);
        
        // Remove playback canvas if it exists
        if (playbackCanvas && playbackCanvas.parentNode) {
            playbackCanvas.parentNode.removeChild(playbackCanvas);
        }
        
        // Show original canvas
        this.outputCanvas.style.display = 'block';
        
        // Clean up
        URL.revokeObjectURL(playbackVideo.src);
        
        // Restore button states
        this.playRecordingBtn.disabled = false;
        this.startRecordingBtn.disabled = !this.postureCheckPassed;
        
        // Remove any restore buttons
        const restoreBtn = videoContainer.querySelector('.btn-outline');
        if (restoreBtn) {
            restoreBtn.remove();
        }
    }
    
    drawPoseAtTime(ctx, canvas, currentTime) {
        try {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (!this.analysisData || this.analysisData.length === 0) {
                console.log('No analysis data available for pose drawing');
                return;
            }
            
            // Find the closest pose data for the current time
            let closestFrame = null;
            let minTimeDiff = Infinity;
            
            for (const frame of this.analysisData) {
                const timeDiff = Math.abs(frame.relativeTime - currentTime);
                if (timeDiff < minTimeDiff) {
                    minTimeDiff = timeDiff;
                    closestFrame = frame;
                }
            }
            
            // Draw pose if we found a close enough frame (within 0.2 seconds for better coverage)
            if (closestFrame && minTimeDiff < 0.2 && closestFrame.landmarks) {
                console.log(`Drawing pose at time ${currentTime.toFixed(2)}s, frame time ${closestFrame.relativeTime.toFixed(2)}s, landmarks count: ${closestFrame.landmarks.length}`);
                this.drawPoseOnCanvas(ctx, closestFrame.landmarks);
            } else {
                console.log(`No pose data for time ${currentTime.toFixed(2)}s - closest: ${closestFrame ? closestFrame.relativeTime.toFixed(2) : 'none'}, diff: ${minTimeDiff.toFixed(2)}s`);
            }
        } catch (error) {
            console.error('Error in drawPoseAtTime:', error);
        }
    }
    
    drawPoseOnCanvas(ctx, landmarks) {
        try {
            if (!landmarks || landmarks.length === 0) {
                console.log('No landmarks to draw');
                return;
            }
            
            console.log(`Drawing ${landmarks.length} landmarks on ${ctx.canvas.width}x${ctx.canvas.height} canvas`);
        
        // Clear the canvas first
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw a test rectangle to verify canvas is working
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(10, 10, 100, 50);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('POSE OVERLAY', 15, 35);
        
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        
        // Define pose connections manually (MediaPipe POSE_CONNECTIONS equivalent)
        const connections = [
            // Face
            [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
            // Arms
            [9, 10], [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
            [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
            // Body
            [11, 23], [12, 24], [23, 24],
            // Legs
            [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
            [24, 26], [26, 28], [28, 30], [28, 32], [30, 32]
        ];
        
        // Draw connections (bright green lines)
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 6; // Make lines thicker
        ctx.lineCap = 'round';
        ctx.shadowColor = '#00FF00';
        ctx.shadowBlur = 3;
        
        connections.forEach(([startIdx, endIdx]) => {
            if (landmarks[startIdx] && landmarks[endIdx]) {
                const start = landmarks[startIdx];
                const end = landmarks[endIdx];
                
                // Convert normalized coordinates to canvas coordinates
                const startX = start.x * canvasWidth;
                const startY = start.y * canvasHeight;
                const endX = end.x * canvasWidth;
                const endY = end.y * canvasHeight;
                
                // Draw connections with lower visibility threshold for better coverage
                if ((start.visibility || 1) > 0.3 && (end.visibility || 1) > 0.3) {
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
            }
        });
        
        // Draw landmarks (bright red circles)
        ctx.fillStyle = '#FF0000';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 2;
        
        landmarks.forEach((landmark, index) => {
            if (landmark && (landmark.visibility || 1) > 0.3) {
                const x = landmark.x * canvasWidth;
                const y = landmark.y * canvasHeight;
                
                // Draw landmark point (bigger and brighter)
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
        });
        
            console.log('Pose drawing completed');
        } catch (error) {
            console.error('Error in drawPoseOnCanvas:', error);
        }
    }

    skipPoseCheck() {
        console.log('Skip pose check clicked');
        this.postureCheckPassed = true;
        this.startRecordingBtn.disabled = false;
        this.hideOverlay();
        this.updatePostureStatus(true, "Ready to record! Click Start Recording button.", ["✓ Pose check bypassed"]);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'feedback-item warning';
        errorDiv.innerHTML = `<strong>⚠️ ${message}</strong>`;
        
        this.feedbackSection.style.display = 'block';
        this.feedbackContent.innerHTML = '';
        this.feedbackContent.appendChild(errorDiv);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PhysicalTherapyApp();
});
