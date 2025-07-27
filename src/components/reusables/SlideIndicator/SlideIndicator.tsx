import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./SlideIndicator.css";

interface SlideIndicatorProps {
  className?: string;
}

const SlideIndicator: React.FC<SlideIndicatorProps> = ({ className = "" }) => {
  return (
    <div className={`slide-indicator ${className}`}>
      <div className="chevron-group left">
        <ChevronLeft size={16} />
        <ChevronLeft size={16} className="chevron-overlap" />
      </div>
      <span className="slide-text">Slide</span>
      <div className="chevron-group right">
        <ChevronRight size={16} />
        <ChevronRight size={16} className="chevron-overlap" />
      </div>
    </div>
  );
};

export default SlideIndicator;
