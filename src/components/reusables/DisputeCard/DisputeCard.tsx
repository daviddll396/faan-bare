import React from "react";
import SolidButton from "../SolidButton/SolidButton";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import "./disputecard.css";

interface DisputeCardProps {
  reference: string;
  type: "Invoice" | "Payment";
  reason: string;
  category: string;
  status: "Pending" | "In Review" | "Resolved" | "Closed";
  createdAt: string;
  customerId?: string;
  isAdmin?: boolean;
  onViewDetails: () => void;
}

const DisputeCard: React.FC<DisputeCardProps> = ({
  reference,
  type,
  reason,
  category,
  status,
  createdAt,
  customerId,
  isAdmin = false,
  onViewDetails,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock size={16} className="status-icon pending" />;
      case "In Review":
        return <AlertCircle size={16} className="status-icon review" />;
      case "Resolved":
        return <CheckCircle size={16} className="status-icon resolved" />;
      case "Closed":
        return <XCircle size={16} className="status-icon closed" />;
      default:
        return <Clock size={16} className="status-icon" />;
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get reason class for color coding (reason is shown in header)
  const getReasonClass = (reason: string) => {
    const normalizedReason = reason.toUpperCase();
    // Map dispute reasons to color classes
    switch (normalizedReason) {
      case "INCORRECT AMOUNT":
        return "category-incorrect-amount";
      case "SERVICE NOT RECEIVED":
        return "category-service-not-received";
      case "PAYMENT NOT PROCESSED":
        return "category-payment-not-processed";
      case "DUPLICATE CHARGE":
        return "category-duplicate-charge";
      case "REFUND NOT RECEIVED":
        return "category-refund-not-received";
      case "TECHNICAL ERROR":
        return "category-technical-error";
      case "OTHER":
        return "category-other";
      default:
        // For any other reason, create a class based on the reason name
        return `category-${normalizedReason.toLowerCase().replace(/\s+/g, "-")}`;
    }
  };

  const reasonClass = getReasonClass(reason);

  return (
    <div className={`dispute-card ${reasonClass} ${isAdmin ? "admin-view" : ""}`}>
      <div className="dispute-header">
        <div className="dispute-reference">{reason}</div>
        {!isAdmin && (
          <div
            className={`status-badge ${status.toLowerCase().replace(" ", "-")}`}
          >
            {getStatusIcon(status)}
            {status}
          </div>
        )}
      </div>

      <div className="dispute-content-area">
        <div className="dispute-details">
          {customerId && (
            <div className="dispute-detail-item">
              <span className="detail-label">Customer ID:</span>
              <span className="detail-value">{customerId}</span>
            </div>
          )}
          <div className="dispute-detail-item">
            <span className="detail-label">Type:</span>
            <span className="detail-value">{type}</span>
          </div>
          <div className="dispute-detail-item">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{category}</span>
          </div>
          <div className="dispute-detail-item">
            <span className="detail-label">Created:</span>
            <span className="detail-value">{formatDate(createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="dispute-actions">
        <SolidButton
          text="View Details"
          onClick={onViewDetails}
          size="small"
          variant="secondary"
        />
      </div>
    </div>
  );
};

export default DisputeCard;
