import "./App.css"
import FeatureCard from "./components/FeatureCard"
import HowItWorksStep from "./components/HowItWorksStep"
import BestResults from "./components/BestResults"
import CTAButton from "./components/CTAButton"

function Homes ()
{
  const features = [
    {
      icon: "shield",
      title: "Accurate Feedback",
      description: "Advanced AI technology provides precise feedback on your exercise form.",
    },
    {
      icon: "zap",
      title: "Real-time Analysis",
      description: "Get instant feedback as you perform your exercises, no waiting.",
    },
    {
      icon: "activity",
      title: "Progress Tracking",
      description: "Monitor your improvement over time with detailed session summaries.",
    },
  ]

  const steps = [
    {
      number: 1,
      title: "Camera Setup",
      description: "Allow camera access for real-time feedback",
    },
    {
      number: 2,
      title: "Position Check",
      description: "Get into the correct starting position",
    },
    {
      number: 3,
      title: "Exercise Guidance",
      description: "Receive real-time form corrections",
    },
    {
      number: 4,
      title: "Performance Review",
      description: "Get a detailed summary of your session",
    },
  ]

  const bestResultsTips = [
    "Get into the correct starting position",
    "Wear clothing that allows your joints to be visible",
    "Position your camera so your full body is in frame",
    "Clear enough space to perform the exercises safely",
  ]

  return (
    <div className="App">
      <main className="main-container">
        <div className="container">

          <h1 className="main-title">
            AI-Powered
            <span className="title-highlight">Physical Therapy Assistant</span>
          </h1>

          <p className="subtitle">
            Get real-time feedback on your exercises with advanced AI pose detection technology.
          </p>

          <div className="features-container">
            <div className="features-grid">
              { features.map( ( feature, index ) => (
                <FeatureCard key={ index } icon={ feature.icon } title={ feature.title } description={ feature.description } />
              ) ) }
            </div>

            <div className="how-it-works">
              <h2 className="how-it-works-title">How it works:</h2>
              <div className="steps-grid">
                { steps.map( ( step ) => (
                  <HowItWorksStep
                    key={ step.number }
                    number={ step.number }
                    title={ step.title }
                    description={ step.description }
                  />
                ) ) }
              </div>
            </div>

            <BestResults tips={ bestResultsTips } />

            <CTAButton />

            <p className="no-login">No account or login required</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Homes 