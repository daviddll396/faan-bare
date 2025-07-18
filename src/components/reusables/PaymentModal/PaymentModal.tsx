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

  if (!isVisible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPaymentSubmit();
  };

  const formatAmount = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="customer-modal-backdrop">
      <div className="payment-modal-center">
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 32px rgba(34, 43, 69, 0.1)",
            padding: 36,
            width: 686,
            maxWidth: "95vw",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <button
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#222",
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
              style={{ width: 72, height: 72, borderRadius: 8 }}
            />
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: "#222b45",
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
                color: "#222b45",
                fontWeight: 600,
                fontSize: 16,
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
                background: "#0079480D",
                
                borderRadius: 12,
                padding: "14px",
                marginBottom: 24,
              }}
            >
              <div style={{ marginBottom: 10 }}>
                <span
                  style={{ color: "#6C7278", fontWeight: 500, fontSize: 14 }}
                >
                  Amount
                </span>
                <span
                  style={{
                    color: "#222b45",
                    fontWeight: 600,
                    fontSize: 16,
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
                        color: "#64748b",
                        fontWeight: 500,
                        fontSize: 14,
                      }}
                    >
                      Account Number
                    </span>
                    <span
                      style={{
                        color: "#222b45",
                        fontWeight: 600,
                        fontSize: 16,
                        float: "right",
                      }}
                    >
                      {accountNumber}
                    </span>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <span
                      style={{
                        color: "#64748b",
                        fontWeight: 500,
                        fontSize: 14,
                      }}
                    >
                      Bank
                    </span>
                    <span
                      style={{
                        color: "#222b45",
                        fontWeight: 600,
                        fontSize: 16,
                        float: "right",
                      }}
                    >
                      {bankName}
                    </span>
                  </div>
                  <div>
                    <span
                      style={{
                        color: "#64748b",
                        fontWeight: 500,
                        fontSize: 14,
                      }}
                    >
                      Name
                    </span>
                    <span
                      style={{
                        color: "#222b45",
                        fontWeight: 600,
                        fontSize: 16,
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
                  color: "#222b45",
                  fontWeight: 600,
                  fontSize: 16,
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
                      border: `2px solid ${
                        paymentMethod === "card" ? "#007948" : "#d1d5db"
                      }`,
                      borderRadius: "50%",
                      position: "relative",
                      background:
                        paymentMethod === "card" ? "#007948" : "transparent",
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
                    style={{ fontSize: 14, fontWeight: 500, color: "#222b45" }}
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
                      border: `2px solid ${
                        paymentMethod === "transfer" ? "#007948" : "#d1d5db"
                      }`,
                      borderRadius: "50%",
                      position: "relative",
                      background:
                        paymentMethod === "transfer"
                          ? "#007948"
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
                    style={{ fontSize: 14, fontWeight: 500, color: "#222b45" }}
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
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#222b45",
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
                    border: "1.5px solid #e4e4e7",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    background: "#fff",
                    color: "#18181b",
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
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#222b45",
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
                      border: "1.5px solid #e4e4e7",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 500,
                      background: "#fff",
                      color: "#18181b",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#222b45",
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
                      border: "1.5px solid #e4e4e7",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 500,
                      background: "#fff",
                      color: "#18181b",
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
                    border: `2px solid ${saveCard ? "#007948" : "#d1d5db"}`,
                    borderRadius: 4,
                    position: "relative",
                    background: saveCard ? "#007948" : "transparent",
                  }}
                >
                  {saveCard && (
                    <span
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "white",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
                <span
                  style={{ fontSize: 14, fontWeight: 500, color: "#222b45" }}
                >
                  Save card details
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <GradientButton
              type="submit"
              fullWidth
              size="large"
             
            >
              PAY
            </GradientButton>

            {/* Privacy Policy */}
            <p
              style={{
                fontSize: 12,
                color: "#ACACAC",
                textAlign: "center",
                lineHeight: 1.5,
                marginTop: "15px"
              }}
            >
              Your personal data will be used to process your order, support
              your experience throughout this website, and for other purposes
              described in our{" "}
              <a
                href="#"
                style={{ color: "#007948", textDecoration: "underline", }}
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
