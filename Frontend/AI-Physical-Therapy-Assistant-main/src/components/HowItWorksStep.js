const HowItWorksStep = ({ number, title, description }) => {
  return (
    <div className="step">
      <div className="step-number">{number}</div>
      <div className="step-content">
        <h3 className="step-title">{title}</h3>
        <p className="step-description">{description}</p>
      </div>
    </div>
  )
}

export default HowItWorksStep
