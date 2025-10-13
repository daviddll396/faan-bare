import React from "react";
import AirplaneIcon from "/icons/airplane-icon.svg";
import "./EmptyState.css";

interface EmptyStateProps {
  title: string;
  message: string;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  className = "",
}) => {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-icon">
        <img
          src={AirplaneIcon}
          alt="No data"
          width={48}
          height={48}
          className="desktop-icon"
        />
        <img
          src={AirplaneIcon}
          alt="No data"
          width={36}
          height={36}
          className="mobile-icon"
        />
      </div>
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-message">{message}</div>
    </div>
  );
};

export default EmptyState;
