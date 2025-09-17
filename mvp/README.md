# AI Physical Therapy Assistant MVP

A browser-based application that uses MediaPipe pose detection to guide and assess users during physical therapy exercises.

## Features

✅ **Real-time Pose Detection**: Uses MediaPipe to detect and overlay skeleton joints on webcam feed
✅ **Posture Validation**: Checks for correct starting position before allowing recording
✅ **Video Recording**: Records 20-30 seconds of exercise with real-time pose analysis
✅ **Smart Feedback**: Provides encouragement or suggestions based on form analysis
✅ **Performance Stats**: Shows detailed statistics only when performance >85%
✅ **Two Exercise Types**: Basic rock/sit-back and toe drive movements
✅ **Modern UI**: YouTube-like interface with clean design
✅ **Squarespace Integration**: Return button for seamless site integration

## How to Run

### Option 1: Simple File Server
```bash
# Navigate to the mvp directory
cd /Users/mac/Downloads/MVP/mvp

# Start a simple HTTP server (Python 3)
python3 -m http.server 8080

# Or if you have Node.js installed
npx http-server -p 8080

# Then open http://localhost:8080 in your browser
```

### Option 2: Direct File Access
Simply open `index.html` directly in your browser. Note: Some browsers may block camera access for file:// URLs, so using a local server is recommended.

## Usage Instructions

1. **Grant Camera Permission**: Allow the browser to access your webcam when prompted
2. **Select Exercise Type**: Choose between "Basic Rock/Sit-back Movement" or "Toe Drive Movement"
3. **Position Check**: Get into the starting quadruped position:
   - Hands under shoulders
   - Knees under hips
   - Feet flat on ground
4. **Start Recording**: Once positioned correctly, the "Start Recording" button will enable
5. **Exercise**: Perform the exercise for 20-30 seconds while the app analyzes your form
6. **Review Results**: Get personalized feedback and performance statistics
7. **Playback**: Watch your recorded video with analysis overlay

## Technical Details

- **Pose Detection**: MediaPipe Pose with real-time landmark detection
- **Recording**: WebRTC MediaRecorder API for video capture
- **Analysis**: Frame-by-frame pose analysis with form scoring
- **Feedback**: Intelligent suggestions based on common form issues
- **Browser Support**: Modern browsers with WebRTC support

## Customization

- Update the Squarespace URL in `index.html` (line 68)
- Modify exercise criteria in `pose-detection.js`
- Adjust recording duration in `app.js` (recordingDuration variable)
- Customize feedback messages and thresholds as needed

## Browser Requirements

- Modern browser (Chrome, Firefox, Safari, Edge)
- Camera access permissions
- JavaScript enabled
- WebRTC support for video recording
