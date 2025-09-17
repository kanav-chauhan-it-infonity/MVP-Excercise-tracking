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

      pose.onResults(onResults);

      const camera = new window.Camera(videoElement, {
        onFrame: async () => {
          await pose.send({ image: videoElement });
        },
        width: 1280,
        height: 720
      });

      poseRef.current = pose;
      cameraRef.current = camera;
      
      await camera.start();
      isInitializedRef.current = true;
      
      return true;
    } catch (error) {
      console.error('Error initializing MediaPipe:', error);
      return false;
    }
  }, []);

  const stopMediaPipe = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
    isInitializedRef.current = false;
  }, []);

  const drawMediaPipePose = useCallback((results, canvas) => {
    if (!results || !results.poseLandmarks || !canvas) return;

    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw pose landmarks
    if (results.poseLandmarks) {
      // Draw connections
      window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 4
      });

      // Draw landmarks
      window.drawLandmarks(ctx, results.poseLandmarks, {
        color: '#FF0000',
        lineWidth: 2,
        radius: 6
      });
    }
  }, []);

  return {
    initializeMediaPipe,
    stopMediaPipe,
    drawMediaPipePose,
    isInitialized: isInitializedRef.current
  };
};
