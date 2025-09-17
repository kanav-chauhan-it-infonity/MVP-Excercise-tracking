import React from 'react';

function BestResults({ tips }) {
  return (
    <div className="best-results">
      <div className="best-results-header">
        <svg className="best-results-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10M7.835 4.697C8.73294 4.28057 9.36457 3.49803 9.5 2.572C9.5 2.572 9.942 2 12 2C14.058 2 14.5 2.572 14.5 2.572C14.6354 3.49803 15.2671 4.28057 16.165 4.697C16.165 4.697 17 5.072 18 6.5C19 7.928 18.289 8.85 18.289 8.85C17.7396 9.6489 17.6218 10.6739 17.97 11.572C17.97 11.572 18.4 13 17.5 15C16.6 17 15.5 17 15.5 17C14.6331 17.0056 13.8282 17.4795 13.387 18.234C13.387 18.234 13 19 12 21C11 19 10.613 18.234 10.613 18.234C10.1718 17.4795 9.36689 17.0056 8.5 17C8.5 17 7.4 17 6.5 15C5.6 13 6.03 11.572 6.03 11.572C6.37819 10.6739 6.26038 9.6489 5.711 8.85C5.711 8.85 5 7.928 6 6.5C7 5.072 7.835 4.697 7.835 4.697Z" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h3 className="best-results-title">For best results:</h3>
      </div>
      <ul className="best-results-list">
        {tips.map((tip, index) => (
          <li className="best-results-item" key={index}>{tip}</li>
        ))}
      </ul>
    </div>
  );
}

export default BestResults;
