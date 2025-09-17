class PoseDetector {
    constructor() {
        this.pose = null;
        this.camera = null;
        this.isInitialized = false;
        this.onResultsCallback = null;
        this.landmarks = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
    }

    async initialize(videoElement, canvasElement, onResults) {
        try {
            this.videoElement = videoElement;
            this.canvasElement = canvasElement;
            this.canvasCtx = canvasElement.getContext('2d');
            this.onResultsCallback = onResults;

            // Check if MediaPipe libraries are loaded
            if (!window.Pose || !window.Camera) {
                throw new Error('MediaPipe libraries not loaded. Please refresh the page.');
            }

            // Initialize MediaPipe Pose
            this.pose = new window.Pose({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                }
            });

            this.pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                enableSegmentation: false,
                smoothSegmentation: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.pose.onResults((results) => {
                this.onPoseResults(results);
            });

            // Initialize camera with error handling
            this.camera = new window.Camera(videoElement, {
                onFrame: async () => {
                    try {
                        if (this.pose && videoElement.readyState >= 2) {
                            await this.pose.send({ image: videoElement });
                        }
                    } catch (error) {
                        console.warn('Pose detection frame error:', error);
                    }
                },
                width: 1280,
                height: 720
            });

            // Wait for camera to start
            await this.camera.start();
            
            // Verify camera is working
            if (!videoElement.srcObject) {
                throw new Error('Camera failed to start');
            }
            
            this.isInitialized = true;
            console.log('Pose detector initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize pose detector:', error);
            this.isInitialized = false;
            throw error;
        }
    }

    onPoseResults(results) {
        try {
            this.landmarks = results.poseLandmarks;
            
            // Ensure canvas context is available
            if (!this.canvasCtx || !this.canvasElement) {
                return;
            }
            
            // Clear canvas
            this.canvasCtx.save();
            this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
            
            // Draw pose landmarks
            if (results.poseLandmarks && results.poseLandmarks.length > 0) {
                this.drawPose(results.poseLandmarks);
            }
            
            this.canvasCtx.restore();
            
            // Call external callback
            if (this.onResultsCallback) {
                this.onResultsCallback(results);
            }
        } catch (error) {
            console.warn('Error processing pose results:', error);
        }
    }

    drawPose(landmarks) {
        // Draw connections
        if (window.drawConnectors && window.POSE_CONNECTIONS) {
            window.drawConnectors(this.canvasCtx, landmarks, window.POSE_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 4
            });
        }
        
        // Draw landmarks
        if (window.drawLandmarks) {
            window.drawLandmarks(this.canvasCtx, landmarks, {
                color: '#FF0000',
                lineWidth: 2,
                radius: 6
            });
        }
    }

    // Check if person is in correct starting posture
    checkStartingPosture(landmarks, exerciseType = 'quadruped') {
        if (!landmarks || landmarks.length < 33) {
            return {
                isCorrect: false,
                message: "Please position yourself in view of the camera",
                details: []
            };
        }

        const checks = [];
        const issues = [];

        // Get key landmarks
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftElbow = landmarks[13];
        const rightElbow = landmarks[14];
        const leftWrist = landmarks[15];
        const rightWrist = landmarks[16];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];
        const leftKnee = landmarks[25];
        const rightKnee = landmarks[26];
        const leftAnkle = landmarks[27];
        const rightAnkle = landmarks[28];
        const leftFootIndex = landmarks[31];
        const rightFootIndex = landmarks[32];

        // Check 1: Hands under shoulders (quadruped position)
        const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
        const wristMidX = (leftWrist.x + rightWrist.x) / 2;
        const handShoulderAlignment = Math.abs(shoulderMidX - wristMidX) < 0.1;
        
        if (handShoulderAlignment) {
            checks.push("✓ Hands positioned under shoulders");
        } else {
            issues.push("Position hands directly under shoulders");
        }

        // Check 2: Knees under hips
        const hipMidX = (leftHip.x + rightHip.x) / 2;
        const kneeMidX = (leftKnee.x + rightKnee.x) / 2;
        const kneeHipAlignment = Math.abs(hipMidX - kneeMidX) < 0.1;
        
        if (kneeHipAlignment) {
            checks.push("✓ Knees positioned under hips");
        } else {
            issues.push("Position knees directly under hips");
        }

        // Check 3: Feet flat on ground (ankles and foot indices at similar height)
        const leftFootFlat = Math.abs(leftAnkle.y - leftFootIndex.y) < 0.05;
        const rightFootFlat = Math.abs(rightAnkle.y - rightFootIndex.y) < 0.05;
        
        if (leftFootFlat && rightFootFlat) {
            checks.push("✓ Feet flat on the ground");
        } else {
            issues.push("Keep feet flat on the ground");
        }

        // Check 4: General quadruped position (hands and knees on ground)
        const isQuadruped = leftWrist.y > leftShoulder.y && rightWrist.y > rightShoulder.y &&
                           leftKnee.y > leftHip.y && rightKnee.y > rightHip.y;
        
        if (isQuadruped) {
            checks.push("✓ In quadruped position");
        } else {
            issues.push("Get into hands and knees position");
        }

        const isCorrect = issues.length === 0;
        
        return {
            isCorrect,
            message: isCorrect ? "Perfect! You can start the exercise" : "Adjust your position",
            details: isCorrect ? checks : issues,
            checks,
            issues
        };
    }

    // Analyze pose during exercise with reference movement comparison
    analyzePoseForm(landmarks, exerciseType = 'quadruped', frameIndex = 0) {
        if (!landmarks || landmarks.length < 33) {
            return {
                score: 0,
                issues: ['No pose detected'],
                strengths: []
            };
        }

        const issues = [];
        const strengths = [];
        let score = 100;

        // Get key landmarks
        const leftAnkle = landmarks[27];
        const rightAnkle = landmarks[28];
        const leftKnee = landmarks[25];
        const rightKnee = landmarks[26];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];
        const nose = landmarks[0];
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftWrist = landmarks[15];
        const rightWrist = landmarks[16];

        // Quadruped rocking motion analysis
        if (exerciseType === 'quadruped') {
            const rockingAnalysis = this.analyzeRockingMotion(landmarks, frameIndex);
            
            // Check rocking range and smoothness
            if (rockingAnalysis.range < 0.1) {
                issues.push("Rock back further - increase range of motion");
                score -= 20;
            } else if (rockingAnalysis.range > 0.4) {
                issues.push("Don't rock too far - maintain control");
                score -= 15;
            } else {
                strengths.push("Perfect rocking range!");
            }

            // Check movement smoothness
            if (rockingAnalysis.smoothness < 0.7) {
                issues.push("Make the movement smoother and more controlled");
                score -= 15;
            } else {
                strengths.push("Excellent smooth movement!");
            }

            // Check if maintaining quadruped position during rocking
            if (!rockingAnalysis.maintainsForm) {
                issues.push("Keep hands and knees planted during rocking");
                score -= 25;
            } else {
                strengths.push("Great form maintenance!");
            }
        }

        // Check ankle stability (prevent collapse)
        const ankleStability = this.checkAnkleStability(leftAnkle, rightAnkle, leftKnee, rightKnee);
        if (!ankleStability.stable) {
            issues.push("Keep ankles stable - don't let them collapse inward");
            score -= 20;
        } else {
            strengths.push("Great ankle stability!");
        }

        // Check knee alignment
        const kneeAlignment = this.checkKneeAlignment(leftKnee, rightKnee, leftHip, rightHip);
        if (!kneeAlignment.aligned) {
            issues.push("Keep knees directly under hips");
            score -= 15;
        } else {
            strengths.push("Excellent knee alignment!");
        }

        // Check head alignment
        const headAlignment = this.checkHeadAlignment(nose, leftShoulder, rightShoulder);
        if (!headAlignment.aligned) {
            issues.push("Keep head in neutral position - don't look up or down");
            score -= 10;
        } else {
            strengths.push("Perfect head alignment!");
        }

        return {
            score: Math.max(0, score),
            issues,
            strengths
        };
    }

    checkAnkleStability(leftAnkle, rightAnkle, leftKnee, rightKnee) {
        // Check if ankles are collapsing inward
        const ankleWidth = Math.abs(leftAnkle.x - rightAnkle.x);
        const kneeWidth = Math.abs(leftKnee.x - rightKnee.x);
        const ratio = ankleWidth / kneeWidth;
        
        return {
            stable: ratio > 0.8, // Ankles should maintain width relative to knees
            ratio
        };
    }

    checkKneeAlignment(leftKnee, rightKnee, leftHip, rightHip) {
        const kneeMidX = (leftKnee.x + rightKnee.x) / 2;
        const hipMidX = (leftHip.x + rightHip.x) / 2;
        const alignment = Math.abs(kneeMidX - hipMidX);
        
        return {
            aligned: alignment < 0.1,
            alignment
        };
    }

    checkHeadAlignment(nose, leftShoulder, rightShoulder) {
        const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
        const headAlignment = Math.abs(nose.x - shoulderMidX);
        
        return {
            aligned: headAlignment < 0.1,
            alignment: headAlignment
        };
    }

    checkToeEngagement(landmarks) {
        // This is a simplified check - in reality, toe engagement is hard to detect
        // We'll use foot positioning as a proxy
        const leftFootIndex = landmarks[31];
        const rightFootIndex = landmarks[32];
        const leftAnkle = landmarks[27];
        const rightAnkle = landmarks[28];
        
        // Check if toes are pressed down (foot indices lower than ankles)
        const leftEngaged = leftFootIndex.y > leftAnkle.y;
        const rightEngaged = rightFootIndex.y > rightAnkle.y;
        
        return {
            engaged: leftEngaged && rightEngaged
        };
    }

    // Analyze rocking motion based on reference video patterns
    analyzeRockingMotion(landmarks, frameIndex) {
        // Initialize movement history if not exists
        if (!this.movementHistory) {
            this.movementHistory = [];
        }

        // Get hip position as reference point for rocking motion
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];
        const hipMidpoint = {
            x: (leftHip.x + rightHip.x) / 2,
            y: (leftHip.y + rightHip.y) / 2
        };

        // Store current position
        this.movementHistory.push({
            frame: frameIndex,
            hipPosition: hipMidpoint,
            timestamp: Date.now()
        });

        // Keep only last 60 frames (2 seconds at 30fps)
        if (this.movementHistory.length > 60) {
            this.movementHistory.shift();
        }

        // Calculate rocking metrics
        let range = 0;
        let smoothness = 1;
        let maintainsForm = true;

        if (this.movementHistory.length > 10) {
            // Calculate range of motion (forward/backward movement)
            const yPositions = this.movementHistory.map(h => h.hipPosition.y);
            const minY = Math.min(...yPositions);
            const maxY = Math.max(...yPositions);
            range = maxY - minY;

            // Calculate smoothness (less variation = smoother)
            let totalVariation = 0;
            for (let i = 1; i < this.movementHistory.length; i++) {
                const diff = Math.abs(
                    this.movementHistory[i].hipPosition.y - 
                    this.movementHistory[i-1].hipPosition.y
                );
                totalVariation += diff;
            }
            smoothness = Math.max(0, 1 - (totalVariation * 10));

            // Check if maintaining quadruped form
            const leftWrist = landmarks[15];
            const rightWrist = landmarks[16];
            const leftKnee = landmarks[25];
            const rightKnee = landmarks[26];
            
            // Hands should stay planted (minimal x movement)
            const handStability = Math.abs(leftWrist.x - rightWrist.x) > 0.1 && 
                                 leftWrist.y > landmarks[11].y && rightWrist.y > landmarks[12].y;
            
            // Knees should stay planted
            const kneeStability = leftKnee.y > landmarks[23].y && rightKnee.y > landmarks[24].y;
            
            maintainsForm = handStability && kneeStability;
        }

        return {
            range,
            smoothness,
            maintainsForm,
            currentPosition: hipMidpoint
        };
    }

    // Reference movement pattern based on YouTube video analysis
    getReferenceMovementPattern(frameIndex, totalFrames) {
        // Simulate ideal rocking pattern: smooth sinusoidal movement
        const cycleProgress = (frameIndex / totalFrames) * Math.PI * 2; // Complete cycle
        const idealHipY = 0.5 + (Math.sin(cycleProgress) * 0.15); // Rock between 0.35-0.65
        
        return {
            idealHipY,
            phase: cycleProgress < Math.PI ? 'rocking_back' : 'rocking_forward',
            cycleProgress
        };
    }

    stop() {
        try {
            if (this.camera) {
                this.camera.stop();
            }
            
            // Stop video tracks
            if (this.videoElement && this.videoElement.srcObject) {
                const tracks = this.videoElement.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
            
            // Clear movement history
            this.movementHistory = [];
            this.isInitialized = false;
            
            console.log('Pose detector stopped');
        } catch (error) {
            console.warn('Error stopping pose detector:', error);
        }
    }
}

// Export for use in other files
window.PoseDetector = PoseDetector;
