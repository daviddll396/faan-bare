import React, { useState } from "react";
import FaanLogo from "/images/faan-logo.svg";
import GradientButton from "../GradientButton/GradientButton";
import "./PaymentModal.css";

interface PaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  onPaymentSubmit: () => void;
  amount: number;
  accountNumber: string;
  bankName: string;
  accountName: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isVisible,
  onClose,
  onPaymentSubmit,
  amount,
  accountNumber,
  bankName,
  accountName,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">(
    "transfer"
  );
  const [cardNumber, setCardNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  // Responsive window width
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isVisible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPaymentSubmit();
  };

  const formatAmount = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  // Responsive modal styles
  const isMobile = windowWidth <= 768;
  const modalContainerStyle: React.CSSProperties = {
    borderRadius: isMobile ? 12 : 16,
    boxShadow: "0 4px 32px var(--shadow-0-1)",
    padding: isMobile ? 20 : 36,
    width: isMobile ? "100%" : 686,
    maxWidth: isMobile ? "100vw" : "95vw",
    minWidth: isMobile ? undefined : 480,
    margin: isMobile ? 8 : undefined,
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  return (
    <div className="customer-modal-backdrop">
      <div className="payment-modal-center">
        <div style={modalContainerStyle}>
          <button
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
                color: "var(--text-222)",
            }}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>

          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 18,
              justifyContent: "flex-start",
            }}
          >
            <img
              src={FaanLogo}
              alt="FAAN Logo"
              style={{ width: isMobile ? 48 : 72, height: isMobile ? 48 : 72, borderRadius: 8 }}
            />
            <div
              style={{
                fontWeight: isMobile ? 600 : 700,
                fontSize: isMobile ? 13 : 18,
                color: "var(--color-text-primary)",
                letterSpacing: 0.2,
                textAlign: "left",
              }}
            >
              FEDERAL AIRPORT AUTHORITY OF NIGERIA
            </div>
          </div>

            <div style={{ width: "100%", marginBottom: 8 }}>
            <div
              style={{
                color: "var(--color-text-primary)",
                fontWeight: 600,
                fontSize: isMobile ? 13 : 16,
                marginBottom: 8,
                textAlign: "left",
              }}
            >
              Payment:
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            {/* Payment Details */}
            <div
              style={{
                width: "100%",
                background: "var(--green-007948-0d)",
                borderRadius: 12,
                padding: isMobile ? "10px" : "14px",
                marginBottom: 24,
              }}
            >
              <div style={{ marginBottom: 10 }}>
                <span
                  style={{ color: "var(--color-text-secondary)", fontWeight: 500, fontSize: 14 }}
                >
                  Amount
                </span>
                <span
                  style={{
                    color: "var(--color-text-primary)",
                    fontWeight: 600,
                    fontSize: isMobile ? 13 : 16,
                    float: "right",
                  }}
                >
                  {formatAmount(amount)}
                </span>
              </div>

              {paymentMethod === "transfer" && (
                <>
                  <div style={{ marginBottom: 12 }}>
                <span
                  style={{
                    color: "var(--color-text-secondary)",
                    fontWeight: 500,
                    fontSize: isMobile ? 13 : 14,
                  }}
                >
                      Account Number
                    </span>
                    <span
                      style={{
                        color: "var(--color-text-primary)",
                        fontWeight: 600,
                        fontSize: isMobile ? 13 : 16,
                        float: "right",
                      }}
                    >
                      {accountNumber}
                    </span>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <span
                      style={{
                        color: "var(--color-text-secondary)",
                        fontWeight: 500,
                        fontSize: isMobile ? 13 : 14,
                      }}
                    >
                      Bank
                    </span>
                    <span
                      style={{
                        color: "var(--color-text-primary)",
                        fontWeight: 600,
                        fontSize: isMobile ? 13 : 16,
                        float: "right",
                      }}
                    >
                      {bankName}
                    </span>
                  </div>
                  <div>
                    <span
                      style={{
                        color: "var(--color-text-secondary)",
                        fontWeight: 500,
                        fontSize: isMobile ? 13 : 14,
                      }}
                    >
                      Name
                    </span>
                    <span
                      style={{
                        color: "var(--color-text-primary)",
                        fontWeight: 600,
                        fontSize: isMobile ? 13 : 16,
                        float: "right",
                      }}
                    >
                      {accountName}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Payment Method Selection */}
            <div style={{ width: "100%", marginBottom: 24 }}>
            <div
              style={{
                color: "var(--color-text-primary)",
                fontWeight: 600,
                fontSize: isMobile ? 13 : 16,
                marginBottom: 12,
              }}
            >
                Pay With:
              </div>
              <div style={{ display: "flex", gap: 24 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    style={{ display: "none" }}
                  />
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      border: `2px solid ${paymentMethod === "card" ? "var(--green)" : "var(--border-d1)"}`,
                      borderRadius: "50%",
                      position: "relative",
                      background:
                        paymentMethod === "card" ? "var(--green)" : "transparent",
                    }}
                  >
                    {paymentMethod === "card" && (
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 6,
                          height: 6,
                          background: "white",
                          borderRadius: "50%",
                        }}
                      />
                    )}
                  </div>
                  <span
                    style={{ fontSize: isMobile ? 13 : 14, fontWeight: 500, color: "var(--color-text-primary)" }}
                  >
                    Card
                  </span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="transfer"
                    checked={paymentMethod === "transfer"}
                    onChange={() => setPaymentMethod("transfer")}
                    style={{ display: "none" }}
                  />
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      border: `2px solid ${paymentMethod === "transfer" ? "var(--green)" : "var(--border-d1)"}`,
                      borderRadius: "50%",
                      position: "relative",
                      background:
                        paymentMethod === "transfer"
                          ? "var(--green)"
                          : "transparent",
                    }}
                  >
                    {paymentMethod === "transfer" && (
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 6,
                          height: 6,
                          background: "white",
                          borderRadius: "50%",
                        }}
                      />
                    )}
                  </div>
                  <span
                    style={{ fontSize: isMobile ? 13 : 14, fontWeight: 500, color: "var(--color-text-primary)" }}
                  >
                    Transfer
                  </span>
                </label>
              </div>
            </div>

            {/* Card Details */}
            <div style={{ width: "100%", marginBottom: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: 6,
                  }}
                >
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Enter card number"
                  maxLength={16}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1.5px solid var(--color-e4e4e7)",
                    borderRadius: 8,
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: 500,
                    background: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    outline: "none",
                  }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 12,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      marginBottom: 6,
                    }}
                  >
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1.5px solid var(--color-e4e4e7)",
                      borderRadius: 8,
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      background: "var(--color-surface)",
                      color: "var(--color-text-primary)",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      marginBottom: 6,
                    }}
                  >
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1.5px solid var(--color-e4e4e7)",
                      borderRadius: 8,
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      background: "var(--color-surface)",
                      color: "var(--color-text-primary)",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  style={{ display: "none" }}
                />
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: `2px solid ${saveCard ? "var(--green)" : "var(--border-d1)"}`,
                    borderRadius: 4,
                    position: "relative",
                    background: saveCard ? "var(--green)" : "transparent",
                  }}
                >
                  {saveCard && (
                    <span
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                          color: "var(--color-surface)",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
                <span
                  style={{ fontSize: isMobile ? 13 : 14, fontWeight: 500, color: "var(--color-text-primary)" }}
                >
                  Save card details
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <GradientButton type="submit" fullWidth size="large">
              PAY
            </GradientButton>

            {/* Privacy Policy */}
            <p
              style={{
                fontSize: isMobile ? 10 : 12,
                color: "var(--gray-acacac)",
                textAlign: "center",
                lineHeight: 1.5,
                marginTop: "15px",
              }}
            >
              Your personal data will be used to process your order, support
              your experience throughout this website, and for other purposes
              described in our{" "}
              <a
                href="#"
                style={{ color: "var(--green)", textDecoration: "underline" }}
              >
                privacy policy
              </a>
              .
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
