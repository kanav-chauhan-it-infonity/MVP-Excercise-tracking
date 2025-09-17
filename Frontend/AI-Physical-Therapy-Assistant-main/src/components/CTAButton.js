import React from 'react';
import './CTAButton.css';
import { Link } from 'react-router-dom';

const CTAButton = () => {
  // Make this a simple informational link to the video tutorial page
  return (
    <Link to="/video-tutorial" className="cta-button" style={{ textDecoration: "none" }}>
      <span style={{ color: "#FFFFFF" }}>
        For best results:
        <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14"></path>
          <path d="M12 5l7 7-7 7"></path>
        </svg>
      </span>
    </Link>
  );
};

export default CTAButton;
