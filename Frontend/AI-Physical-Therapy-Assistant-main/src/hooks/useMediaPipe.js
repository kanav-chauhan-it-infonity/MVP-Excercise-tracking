import { useRef, useCallback } from 'react';

export const useMediaPipe = () => {
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const isInitializedRef = useRef(false);

  const initializeMediaPipe = useCallback(async (videoElement, canvasElement, onResults) => {
    if (isInitializedRef.current) return true;

    try {
      // Check if MediaPipe is available
      if (typeof window.Pose === 'undefined') {
        console.error('MediaPipe Pose not loaded');
        return false;
      }

      // Add error handler for uncaught errors
      window.addEventListener('error', (event) => {
        console.error('Global error in MediaPipe:', event.error);
      });

      // Initialize with error handling
      const pose = new window.Pose({
        locateFile: (file) => {
          // Use a more reliable CDN and add cache busting
          const cdnUrl = `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.0/${file}`;
          console.log('Loading MediaPipe file:', cdnUrl);
          return cdnUrl;
        }
      });

      // Set options with more conservative settings
      await pose.setOptions({
        modelComplexity: 0,  // Reduced complexity for better performance
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.3  // Lowered for better tracking
      });

      // Add error handler for pose
      pose.onResults(onResults);
      pose.onError(error => {
        console.error('MediaPipe Pose Error:', error);
      });

      // Initialize camera with error handling
      const camera = new window.Camera(videoElement, {
        onFrame: async () => {
          try {
            if (poseRef.current) {
              await poseRef.current.send({ image: videoElement });
            }
          } catch (error) {
            console.error('Error in camera frame processing:', error);
          }
        },
        width: 640,  // Reduced resolution
        height: 480
      });

      // Store references
      poseRef.current = pose;
      cameraRef.current = camera;
      
      // Start camera with error handling
      try {
        await camera.start();
        isInitializedRef.current = true;
        console.log('MediaPipe initialized successfully');
        return true;
      } catch (error) {
        console.error('Failed to start camera:', error);
        return false;
      }
    } catch (error) {
      console.error('Error initializing MediaPipe:', error);
      return false;
    }
  }, []);

  const stopMediaPipe = useCallback(async () => {
    try {
      // Stop camera first
      if (cameraRef.current) {
        await cameraRef.current.stop();
        cameraRef.current = null;
      }
      
      // Close pose detection
      if (poseRef.current) {
        try {
          // Some versions might not have close() method
          if (typeof poseRef.current.close === 'function') {
            await poseRef.current.close();
          }
          // Reset the pose instance
          poseRef.current = null;
        } catch (error) {
          console.error('Error closing pose detection:', error);
        }
      }
      
      // Reset initialization state
      isInitializedRef.current = false;
      console.log('MediaPipe resources released');
      
    } catch (error) {
      console.error('Error during MediaPipe cleanup:', error);
    }
  }, []);

  // Store previous poses for tracer effect
  const poseHistoryRef = useRef([]);
  const MAX_HISTORY = 10; // Number of frames to keep in history

  const drawMediaPipePose = useCallback((results, canvas) => {
    if (!results || !results.poseLandmarks || !canvas) return;

    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Instead of clearing completely, fade out previous frame
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Store current pose in history
    poseHistoryRef.current.push(JSON.parse(JSON.stringify(results.poseLandmarks)));
    
    // Limit history size
    if (poseHistoryRef.current.length > MAX_HISTORY) {
      poseHistoryRef.current.shift();
    }

    // Draw tracers (ghost effect)
    poseHistoryRef.current.forEach((landmarks, historyIndex) => {
      if (!landmarks) return;
      
      // Calculate opacity based on age (newer = more opaque)
      const opacity = 0.15 + (0.85 * (historyIndex / poseHistoryRef.current.length));
      const lineWidth = 2 + (2 * (historyIndex / poseHistoryRef.current.length));
      const pointSize = 2 + (4 * (historyIndex / poseHistoryRef.current.length));

      // Draw connections with fading effect
      if (window.drawConnectors && window.POSE_CONNECTIONS) {
        window.drawConnectors(ctx, landmarks, window.POSE_CONNECTIONS, {
          color: `rgba(0, 255, 0, ${opacity * 0.5})`,
          lineWidth: lineWidth * 0.8
        });
      }

      // Draw landmarks with fading effect
      if (window.drawLandmarks) {
        window.drawLandmarks(ctx, landmarks, {
          color: `rgba(255, 0, 0, ${opacity * 0.7})`,
          lineWidth: lineWidth * 0.5,
          radius: pointSize
        });
      }
    });

    // Draw current pose (most prominent)
    if (results.poseLandmarks) {
      // Draw connections
      if (window.drawConnectors && window.POSE_CONNECTIONS) {
        window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 4,
          lineCap: 'round',
          lineJoin: 'round'
        });
      }

      // Draw landmarks
      if (window.drawLandmarks) {
        window.drawLandmarks(ctx, results.poseLandmarks, {
          color: '#FF0000',
          lineWidth: 2,
          radius: 6
        });
      }
    }
  }, []);

  return {
    initializeMediaPipe,
    stopMediaPipe,
    drawMediaPipePose,
    isInitialized: isInitializedRef.current
  };
};
