import React from "react";
import "./feedbackcard.css";
import SolidButton from "../SolidButton/SolidButton";

interface FeedbackCardProps {
  id?: string | number;
  category: string;
  message: string;
  status: "Submitted" | "Under Review" | "Resolved";
  createdAt: string;
  onViewDetails?: () => void;
  className?: string;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({
  id,
  category,
  message,
  status,
  createdAt,
  onViewDetails,
  className = "",
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateMessage = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  return (
    <div
      className={`feedback-card ${status
        .toLowerCase()
        .replace(" ", "-")} ${className}`}
      data-id={id}
    >
      {/* Feedback Header */}
      <div className="feedback-header">
        <div className="feedback-category">{category}</div>
        <div
          className={`status-badge ${status.toLowerCase().replace(" ", "-")}`}
        >
          {status}
        </div>
      </div>

      {/* Feedback Content Area */}
      <div className="feedback-content-area">
        {/* Feedback Message */}
        <div className="feedback-message">
          <div className="feedback-message-text">
            {truncateMessage(message)}
          </div>
        </div>

        {/* Feedback Details */}
        <div className="feedback-details">
          <div>
            <strong>Date:</strong> {formatDate(createdAt)}
          </div>
        </div>
      </div>

      {/* Feedback Actions */}
      <div className="feedback-actions">
        {onViewDetails && (
          <SolidButton
            text="View Details"
            size="small"
            variant="secondary"
            onClick={onViewDetails}
          />
        )}
      </div>
    </div>
  );
};

export default FeedbackCard;
