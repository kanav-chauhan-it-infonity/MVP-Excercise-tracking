// Camera handling utility for recording and analysis

// API endpoint configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const handleCameraRecording = () => {
  const openCameraModal = async (e, {
    setShowModal,
    setError,
    setFeedback,
    setVideoStatus,
    setRecordedVideoUrl,
    setRecordedBlob,
    videoRef,
    streamRef,
    chunksRef
  }) => {
    e.preventDefault();
    setShowModal(true);
    setError(null);
    setFeedback([]);
    setVideoStatus("initial");
    setRecordedVideoUrl(null);
    setRecordedBlob(null);
    chunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Set status to ready after camera access is granted
      setVideoStatus("ready");
      
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Could not access camera. Please ensure camera permissions are granted.");
    }
  };
  
  const startRecording = ({
    streamRef,
    setError,
    setRecording,
    setVideoStatus,
    mediaRecorderRef,
    chunksRef,
    recordedVideoRef,
    setRecordedVideoUrl,
    setRecordedBlob
  }) => {
    if (!streamRef.current) {
      setError("Camera stream not available. Please refresh and try again.");
      return;
    }
    
    setRecording(true);
    setVideoStatus("recording");
    
    try {
      // Create MediaRecorder only when we have a valid stream
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
          const videoUrl = URL.createObjectURL(videoBlob);
          setRecordedVideoUrl(videoUrl);
          setRecordedBlob(videoBlob); // Save the blob for later use
          setVideoStatus("stopped");
          
          // Set the recorded video to the video element
          if (recordedVideoRef.current) {
            recordedVideoRef.current.src = videoUrl;
          }
        } else {
          setError("No video data was captured. Please try again.");
        }
      };
      
      // Start recording
      mediaRecorder.start(100); // Collect data in 100ms chunks for better performance
      console.log("MediaRecorder started", mediaRecorder.state);
      
    } catch (err) {
      console.error("Error starting MediaRecorder:", err);
      setError(`Failed to start recording: ${err.message}`);
      setRecording(false);
      setVideoStatus("ready");
    }
  };
  
  const stopRecording = ({ 
    mediaRecorderRef, 
    setRecording 
  }) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      console.log("Stopping MediaRecorder");
      mediaRecorderRef.current.stop();
      setRecording(false);
    } else {
      console.warn("MediaRecorder not in recording state or not initialized");
    }
  };
  
  const analyzeVideo = ({
    recordedBlob,
    setError,
    setProcessingVideo,
    sendToAnalyzeEndpoint
  }) => {
    if (!recordedBlob) {
      setError("No video recording available for analysis.");
      return;
    }
    
    setProcessingVideo(true);
    sendToAnalyzeEndpoint(recordedBlob);
  };
  
  const sendToAnalyzeEndpoint = async (
    videoBlob, 
    { setFeedback, setProcessingVideo, setVideoStatus, setError }
  ) => {
    try {
      const formData = new FormData();
      formData.append('video', videoBlob, 'recording.webm');
      
      console.log("Sending video to backend for analysis...");
      const response = await fetch(`${API_BASE_URL}/analyze-video`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Received feedback:", data.feedback);
      
      setFeedback(data.feedback || []);
      setProcessingVideo(false);
      setVideoStatus("analyzed");
      
    } catch (error) {
      console.error("Error sending video for analysis:", error);
      setError("Error processing video. Please try again.");
      setProcessingVideo(false);
    }
  };
  
  const closeModal = ({
    streamRef,
    videoRef,
    recordedVideoUrl,
    setShowModal,
    setRecording,
    setCountdown,
    setProcessingVideo,
    setRecordedVideoUrl,
    setRecordedBlob,
    setFeedback,
    setVideoStatus
  }) => {
    // Release any resources
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (recordedVideoUrl) {
      URL.createObjectURL(recordedVideoUrl);
    }
    
    setShowModal(false);
    setRecording(false);
    if (setCountdown) setCountdown(null);
    setProcessingVideo(false);
    setRecordedVideoUrl(null);
    setRecordedBlob(null);
    setFeedback([]);
    setVideoStatus("initial");
  };

  return {
    openCameraModal,
    startRecording,
    stopRecording,
    analyzeVideo,
    sendToAnalyzeEndpoint,
    closeModal
  };
};

export default handleCameraRecording; 