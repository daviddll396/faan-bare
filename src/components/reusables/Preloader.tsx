import React, { useEffect, useState } from "react";
import FaanLogo from "/images/faan-logo.svg";
import "./preloader.css";

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start the animation after a brief delay
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 100);

    // Start exit animation after logo reveal
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2000);

    // Complete the preloader after exit animation
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(timer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`preloader-container ${isExiting ? "exit" : ""}`}>
      <div className="preloader-logo-wrapper">
        <div className={`preloader-logo ${isAnimating ? "animate" : ""}`}>
          <img src={FaanLogo} alt="FAAN Logo" />
        </div>
      </div>
    </div>
  );
};

export default Preloader;
