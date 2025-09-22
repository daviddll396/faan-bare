import React from "react";
import { AlertTriangle } from "lucide-react";
import SolidButton from "../SolidButton/SolidButton";
import "./ConfirmationModal.css";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "warning",
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="confirmation-modal-backdrop" onClick={handleBackdropClick}>
      <div className="confirmation-modal-center">
        <div className="confirmation-modal">
          <button
            className="confirmation-modal-close"
            onClick={onCancel}
            aria-label="Close"
          >
            ×
          </button>

          <div className={`confirmation-modal-icon-wrap ${variant}`}>
            <AlertTriangle className="confirmation-modal-icon" />
          </div>

          <h3 className="confirmation-modal-title">{title}</h3>
          <p className="confirmation-modal-message">{message}</p>

          <div className="confirmation-modal-actions">
            <SolidButton
              variant="secondary"
              size="medium"
              onClick={onCancel}
              className="confirmation-modal-btn-spacing"
            >
              {cancelText}
            </SolidButton>
            <SolidButton
              variant={variant === "danger" ? "danger" : "primary"}
              size="medium"
              onClick={onConfirm}
              className="confirmation-modal-btn-spacing"
            >
              {confirmText}
            </SolidButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
