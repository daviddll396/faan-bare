import React from "react";
import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  isVisible: boolean;
  message?: string;
}

const SEGMENTS = 10;
const INTERVAL = 60; // ms (60fps)

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  isVisible,
  message = "Loading...",
}) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SEGMENTS);
    }, INTERVAL);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="loading-spinner-backdrop">
      <div className="loading-spinner-container">
        <div className="loading-spinner">
          <svg
            className="segmented-spinner"
            width="40"
            height="40"
            viewBox="0 0 40 40"
            xmlns="http://www.w3.org/2000/svg"
          >
            {Array.from({ length: SEGMENTS }).map((_, i) => {
              // 3 consecutive green segments
              const greenIndices = [
                activeIndex,
                (activeIndex + 1) % SEGMENTS,
                (activeIndex + 2) % SEGMENTS,
              ];
              const trailIndices = [
                (activeIndex - 1 + SEGMENTS) % SEGMENTS,
                (activeIndex - 2 + SEGMENTS) % SEGMENTS,
                (activeIndex - 3 + SEGMENTS) % SEGMENTS,
              ];
              let stroke = "#e4e4e4";
              let opacity = 0.6;
              if (greenIndices.includes(i)) {
                stroke = "#007948";
                opacity = 1;
              } else if (trailIndices.includes(i)) {
                stroke = "#b0b0b0";
                opacity = 0.8;
              }
              const angle = i * 36 * (Math.PI / 180); // 36° per segment
              const r1 = 13;
              const r2 = 18;
              const x1 = 20 + r1 * Math.cos(angle);
              const y1 = 20 + r1 * Math.sin(angle);
              const x2 = 20 + r2 * Math.cos(angle);
              const y2 = 20 + r2 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={stroke}
                  strokeWidth={3}
                  strokeLinecap="round"
                  opacity={opacity}
                />
              );
            })}
          </svg>
        </div>
        {message && <div className="loading-spinner-message">{message}</div>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
