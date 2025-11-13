import React from "react";
import "./feedbackcard.css";
import SolidButton from "../SolidButton/SolidButton";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

interface FeedbackCardProps {
  id?: string | number;
  category: string;
  message: string;
  status: "Submitted" | "In Review" | "Resolved";
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Submitted":
        return <Clock size={16} className="status-icon submitted" />;
      case "In Review":
        return <AlertCircle size={16} className="status-icon review" />;
      case "Resolved":
        return <CheckCircle size={16} className="status-icon resolved" />;
      default:
        return <Clock size={16} className="status-icon" />;
    }
  };

  const statusClass = (status || "").toLowerCase().replace(/\s+/g, "-");
  
  // Get category class for color coding
  const getCategoryClass = (category: string) => {
    const normalizedCategory = category.toUpperCase();
    switch (normalizedCategory) {
      case "GENERAL":
        return "category-general";
      case "PAYMENT":
        return "category-payment";
      case "FUNDING":
        return "category-funding";
      case "TECHNICAL":
        return "category-technical";
      case "OTHER":
        return "category-other";
      default:
        return "category-general";
    }
  };

  const categoryClass = getCategoryClass(category);

  return (
    <div className={`dispute-card feedback-card ${categoryClass} ${className}`} data-id={id}>
      <div className="dispute-header">
        <div className="dispute-reference">{category}</div>
        <div className={`status-badge ${statusClass}`}>
          {getStatusIcon(status || "")}
          {status}
        </div>
      </div>

      <div className="dispute-content-area">
        <div className="dispute-details">
          <div className="dispute-detail-item">
            <span className="detail-label">Message:</span>
            <span className="detail-value">{truncateMessage(message)}</span>
          </div>

          <div className="dispute-detail-item">
            <span className="detail-label">Submitted:</span>
            <span className="detail-value">{formatDate(createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="dispute-actions">
        {onViewDetails && (
          <SolidButton
            text="View Details"
            onClick={onViewDetails}
            size="small"
            variant="secondary"
          />
        )}
      </div>
    </div>
  );
};

export default FeedbackCard;
