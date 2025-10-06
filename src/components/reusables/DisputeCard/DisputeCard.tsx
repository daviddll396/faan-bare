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
  onViewDetails: () => void;
}

const DisputeCard: React.FC<DisputeCardProps> = ({
  reference,
  type,
  reason,
  category,
  status,
  createdAt,
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

  return (
    <div className="dispute-card">
      <div className="dispute-header">
        <div className="dispute-reference">{reference}</div>
        <div
          className={`status-badge ${status.toLowerCase().replace(" ", "-")}`}
        >
          {getStatusIcon(status)}
          {status}
        </div>
      </div>

      <div className="dispute-content-area">
        <div className="dispute-details">
          <div className="dispute-detail-item">
            <span className="detail-label">Type:</span>
            <span className="detail-value">{type}</span>
          </div>
          <div className="dispute-detail-item">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{category}</span>
          </div>
          <div className="dispute-detail-item">
            <span className="detail-label">Reason:</span>
            <span className="detail-value">{truncateText(reason)}</span>
          </div>
          <div className="dispute-detail-item">
            <span className="detail-label">Created:</span>
            <span className="detail-value">
              {new Date(createdAt).toLocaleDateString()}
            </span>
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
