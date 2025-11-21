import React from "react";
import "./invoicecard.css";
import SolidButton from "../SolidButton/SolidButton";

interface Service {
  name: string;
  price: number;
  quantity?: number;
}

interface InvoiceCardProps {
  id?: string | number;
  invoiceNumber: string;
  status: "pending" | "paid" | "cancelled";
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  services: Service[];
  totalAmount: number;
  createdAt: string;
  expiryWarning?: {
    message: string;
    isUrgent?: boolean;
  };
  onViewDetails?: () => void;
  onPayNow?: () => void;
  onDownloadReceipt?: () => void;
  className?: string;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  id,
  invoiceNumber,
  status,
  customerName,
  customerEmail,
  customerPhone,
  services,
  totalAmount,
  createdAt,
  expiryWarning,
  onViewDetails,
  onPayNow,
  className = "",
}) => {
  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={`invoice-card ${status} ${className}`} data-id={id}>
      {/* Invoice Header */}
      <div className="invoice-header">
        <div className="invoice-number">{invoiceNumber}</div>
        <div className={`invoice-status ${status}`}>{status}</div>
      </div>

      {/* Invoice Content Area */}
      <div className="invoice-content-area">
        {/* Invoice Details */}
        <div className="invoice-details">
          {customerName && (
            <div>
              <strong>Customer:</strong> {customerName}
            </div>
          )}
          {customerEmail && (
            <div>
              <strong>Email:</strong> {customerEmail}
            </div>
          )}
          {customerPhone && (
            <div>
              <strong>Phone:</strong> {customerPhone}
            </div>
          )}
          <div>
            <strong>Date:</strong> {formatDate(createdAt)}
          </div>
        </div>

        {/* Invoice Services */}
        <div className="invoice-services">
          <strong>Services:</strong>
          {services.map((service, index) => (
            <div key={index} className="service-item">
              {service.name} - {formatCurrency(service.price)}
              {service.quantity &&
                service.quantity > 1 &&
                ` x${service.quantity}`}
            </div>
          ))}
        </div>

        {/* Invoice Total */}
        <div className="invoice-total">
          <strong>Total: {formatCurrency(totalAmount)}</strong>
        </div>
      </div>

      {/* Expiry Warning */}
      {expiryWarning && (
        <div
          className={`invoice-expiry-warning ${
            expiryWarning.isUrgent ? "urgent" : ""
          }`}
        >
          {expiryWarning.message}
        </div>
      )}

      {/* Invoice Actions */}
      <div className="invoice-actions">
        {onViewDetails && (
          <SolidButton
            text="View Details"
            size="small"
            variant="secondary"
            onClick={onViewDetails}
          />
        )}
        {status === "pending" && onPayNow && (
          <SolidButton
            text="Pay Now"
            size="small"
            variant="primary"
            onClick={onPayNow}
          />
        )}
      </div>
    </div>
  );
};

export default InvoiceCard;
