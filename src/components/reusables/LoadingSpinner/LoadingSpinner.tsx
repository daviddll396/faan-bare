import React from "react";
import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  isVisible: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  isVisible,
  message = "Loading...",
}) => {
  if (!isVisible) return null;

  return (
    <div className="loading-spinner-backdrop">
      <div className="loading-spinner-container">
        <div className="loading-spinner">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="24"
              stroke="#e4e4e4"
              strokeWidth="6"
              fill="none"
              opacity="0.4"
            />
            <path
              d="M56 32a24 24 0 0 1-24 24"
              stroke="#007948"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 32 32"
                to="360 32 32"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>
        {message && <div className="loading-spinner-message">{message}</div>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
