
import { Routes, Route} from 'react-router';
import Homes from './Homes';
import Video from './Video';
import AiAnalyze from './AiAnalyze';
import ExerciseSession from './Exercise';
import ExerciseSummary from "./ExerciseSummary"
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Homes />} />
        <Route path="/video-tutorial" element={<Video />} />
        <Route path="/AiAnalyze" element={<AiAnalyze />} />
        <Route path="/exercise-session" element={<ExerciseSession />} />
        <Route path="/exercise-summary" element={<ExerciseSummary />} />
      </Routes>
    </>
  )
}
export default App