import React from "react";
import Modal from "../Modal/Modal";
import SolidButton from "../SolidButton";
import "./ReceiptModal.css";

export interface ReceiptData {
  invoiceNumber: string;
  rrr?: string;
  transactionId: string | number;
  amount: number;
  serviceName: string;
  customerId: string;
  paymentDate: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ReceiptData | null;
  className?: string;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  receiptData,
  className = "printable-receipt-modal",
}) => {
  if (!isOpen || !receiptData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showHeader={true}
      headerTitle="PAYMENT RECEIPT"
      showLogo
      className={className}
    >
      <div className="receipt-paper">
        <div className="receipt-head">
          <div className="receipt-brand">
            Federal Airports Authority of Nigeria
          </div>
          <div className="receipt-title">PAYMENT RECEIPT</div>
          <div className="receipt-sub">Thank you for your payment.</div>
        </div>

        <div className="receipt-meta">
          <div className="meta-row">
            <span>Invoice Number</span>
            <span className="mono">{receiptData.invoiceNumber}</span>
          </div>
          <div className="meta-row">
            <span>Transaction ID</span>
            <span className="mono">{receiptData.transactionId}</span>
          </div>
          <div className="meta-row">
            <span>Payment Date</span>
            <span>{receiptData.paymentDate}</span>
          </div>
        </div>

        <div className="receipt-items">
          <div className="thead">
            <span>Item</span>
            <span className="right">Amount</span>
          </div>
          <div className="row">
            <span>{receiptData.serviceName}</span>
            <span className="right mono">
              ₦{receiptData.amount.toLocaleString()}
            </span>
          </div>
          <div className="total">
            <span>Total</span>
            <span className="right mono">
              ₦{receiptData.amount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="receipt-foot">
          Customer ID: {receiptData.customerId}
        </div>

        <div className="receipt-actions">
          <SolidButton
            text="Print / Save as PDF"
            onClick={() => window.print()}
            fullWidth
          />
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
