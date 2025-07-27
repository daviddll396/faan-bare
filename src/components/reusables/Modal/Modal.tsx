import React from "react";
import FaanLogo from "/images/faan-logo.svg";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showHeader?: boolean;
  headerTitle?: string;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  showHeader = false,
  headerTitle = "",
  className = "",
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal-container ${className}`}>
        {/* Close Button */}
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {/* Optional Header */}
        {showHeader && (
          <div className="modal-header">
            <div className="modal-logo">
              <img src={FaanLogo} alt="FAAN Logo" />
            </div>
            {headerTitle && (
              <div className="modal-header-title">{headerTitle}</div>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
