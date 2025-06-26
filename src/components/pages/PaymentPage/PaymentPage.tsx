import React, { useState } from "react";
import { Eye } from "lucide-react";
import SearchInput from "../../reusables/SearchInput/SearchInput";
import FaanLogo from "../../../../public/images/faan-logo.svg";
import InvoiceFormIcon from "../../../../public/icons/invoice-form-icon.svg";
import IdFormIcon from "../../../../public/icons/id-form-icon.svg";
import InvoiceAmountFormIcon from "../../../../public/icons/invoice-amount-form-icon.svg";
import CheckCircle from "../../../../public/icons/check-circle.svg";
import { FiInfo, FiEye } from "react-icons/fi";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import "./paymentpage.css";

const tabs = ["All", "Processing", "Completed", "Cancelled"];

const staticPayments = [
  {
    billNo: "2189020",
    service: "International Arrival",
    amount: "₦12,000",
    status: "Cancelled",
    date: "12-08-2024 @11:32pm",
    action: "View Reason",
    actionType: "reason",
  },
  {
    billNo: "2189020",
    service: "VIP Lounge International",
    amount: "₦12,000",
    status: "Processing",
    date: "12-08-2024 @11:32pm",
    action: "",
    actionType: "view",
  },
  {
    billNo: "2189020",
    service: "International Arrival",
    amount: "₦12,000",
    status: "Cancelled",
    date: "12-08-2024 @11:32pm",
    action: "View Reason",
    actionType: "reason",
  },
  {
    billNo: "2189020",
    service: "VIP Lounge International",
    amount: "₦12,000",
    status: "Completed",
    date: "12-08-2024 @11:32pm",
    action: "View Receipt",
    actionType: "receipt",
  },
  {
    billNo: "2189020",
    service: "International Arrival",
    amount: "₦12,000",
    status: "Cancelled",
    date: "12-08-2024 @11:32pm",
    action: "View Reason",
    actionType: "reason",
  },
  {
    billNo: "2189020",
    service: "VIP Lounge International",
    amount: "₦12,000",
    status: "Processing",
    date: "12-08-2024 @11:32pm",
    action: "View Invoice",
    actionType: "invoice",
  },
  {
    billNo: "2189020",
    service: "International Arrival",
    amount: "₦12,000",
    status: "Cancelled",
    date: "12-08-2024 @11:32pm",
    action: "View Reason",
    actionType: "reason",
  },
  {
    billNo: "2189020",
    service: "VIP Lounge International",
    amount: "₦12,000",
    status: "Completed",
    date: "12-08-2024 @11:32pm",
    action: "View Receipt",
    actionType: "receipt",
  },
  {
    billNo: "2189020",
    service: "International Arrival",
    amount: "₦12,000",
    status: "Cancelled",
    date: "12-08-2024 @11:32pm",
    action: "View Reason",
    actionType: "reason",
  },
];

const statusColors = {
  Cancelled: "cancelled",
  Processing: "processing",
  Completed: "completed",
};

const PaymentPage = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [searchName, setSearchName] = useState("");
  const [searchBillNo, setSearchBillNo] = useState("");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentLoading, setShowPaymentLoading] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  const filteredPayments = staticPayments.filter((p) => {
    const matchesTab =
      activeTab === "All" || p.status.toLowerCase() === activeTab.toLowerCase();
    const matchesName =
      !searchName || p.service.toLowerCase().includes(searchName.toLowerCase());
    const matchesBillNo = !searchBillNo || p.billNo.includes(searchBillNo);
    return matchesTab && matchesName && matchesBillNo;
  });

  return (
    <div className="payment-page">
      <div className="payment-tabs-row">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`payment-tab${activeTab === tab ? " active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>
      <div className="payment-search-row">
        <SearchInput
          placeholder="Search name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <SearchInput
          placeholder="Bill No."
          value={searchBillNo}
          onChange={(e) => setSearchBillNo(e.target.value)}
        />
      </div>
      <div className="payment-table-card">
        <table className="payment-table">
          <thead>
            <tr>
              <th className="table-header-item">Bill No.</th>
              <th className="table-header-item">Service</th>
              <th className="table-header-item">Amount</th>
              <th className="table-header-item">Status</th>
              <th className="table-header-item">Bill Date/Time</th>
              <th className="table-header-item">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((p, idx) => (
              <tr key={idx} className={idx % 2 === 1 ? "alt-row" : ""}>
                <td className="table-data-item">{p.billNo}</td>
                <td className="table-data-item">{p.service}</td>
                <td className="table-data-item">{p.amount}</td>
                <td className="table-data-item">
                  <span className={`payment-status-badge ${statusColors[p.status]}`}>
                    {p.status}
                  </span>
                </td>
                <td className="table-data-item">{p.date}</td>
                <td className="table-data-item">
                  {p.actionType === "reason" && (
                    <button className="action-btn reason">
                      <FiInfo className="action-icon" />
                      <span>View Reason</span>
                    </button>
                  )}
                  {p.actionType === "receipt" && (
                    <button className="action-btn receipt">
                      <FiEye className="action-icon" />
                      <span>View Receipt</span>
                    </button>
                  )}
                  {p.actionType === "invoice" && (
                    <button className="action-btn invoice">
                      <FiEye className="action-icon" />
                      <span>View Invoice</span>
                    </button>
                  )}
                  {p.actionType === "view" && (
                    <button className="action-btn view">
                      <FiEye className="action-icon" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Invoice Modal Overlay */}
      {showInvoiceModal && (
        <div className="customer-modal-backdrop">
          <div className="customer-modal-center">
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 4px 32px rgba(34, 43, 69, 0.1)",
                padding: 36,
                minWidth: 520,
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
                onClick={() => setShowInvoiceModal(false)}
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
                  Invoice Details:
                </div>
              </div>
              <div
                style={{
                  width: "100%",
                  marginBottom: 18,
                  display: "flex",
                  gap: 18,
                  justifyContent: "center",
                }}
              >
                <div
                  className="bill-customer-card"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    minWidth: 140,
                    padding: "18px 24px",
                    gap: 16,
                  }}
                >
                  <div className="bill-customer-icon-bg">
                    <img
                      src={InvoiceFormIcon}
                      alt="Invoice Number"
                      className="bill-customer-icon"
                    />
                  </div>
                  <div
                    className="bill-customer-info-col"
                    style={{ alignItems: "center" }}
                  >
                    <div
                      className="bill-customer-label"
                      style={{
                        color: "#6c7278",
                        fontWeight: 500,
                        fontSize: 15,
                      }}
                    >
                      Invoice Number
                    </div>
                    <div
                      className="bill-customer-value highlight"
                      style={{
                        color: "#007948",
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      {invoiceNumber}
                    </div>
                  </div>
                </div>
                <div
                  className="bill-customer-card"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    minWidth: 140,
                    padding: "18px 24px",
                    gap: 16,
                  }}
                >
                  <div className="bill-customer-icon-bg">
                    <img
                      src={IdFormIcon}
                      alt="Customer ID"
                      className="bill-customer-icon"
                    />
                  </div>
                  <div
                    className="bill-customer-info-col"
                    style={{ alignItems: "center" }}
                  >
                    <div
                      className="bill-customer-label"
                      style={{
                        color: "#6c7278",
                        fontWeight: 500,
                        fontSize: 15,
                      }}
                    >
                      Customer ID
                    </div>
                    <div
                      className="bill-customer-value highlight"
                      style={{
                        color: "#009a34",
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      {invoiceCustomerId}
                    </div>
                  </div>
                </div>
                <div
                  className="bill-customer-card"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    minWidth: 140,
                    padding: "18px 24px",
                    gap: 16,
                  }}
                >
                  <div className="bill-customer-icon-bg">
                    <img
                      src={InvoiceAmountFormIcon}
                      alt="Invoice Amount"
                      className="bill-customer-icon"
                    />
                  </div>
                  <div
                    className="bill-customer-info-col"
                    style={{ alignItems: "center" }}
                  >
                    <div
                      className="bill-customer-label"
                      style={{
                        color: "#6c7278",
                        fontWeight: 500,
                        fontSize: 15,
                      }}
                    >
                      Invoice Amount
                    </div>
                    <div
                      className="bill-customer-value highlight"
                      style={{
                        color: "#009a34",
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      ₦{invoiceAmount}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ width: "100%", marginBottom: 18 }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 15,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      <th className="table-header-item">ID</th>
                      <th className="table-header-item">Item Name</th>
                      <th className="table-header-item">Qty</th>
                      <th className="table-header-item">Amount</th>
                      <th className="table-header-item">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item, idx) => (
                      <tr
                        key={item.id}
                        style={{
                          background: idx % 2 === 1 ? "#f7f7f7" : "#fff",
                        }}
                      >
                        <td
                          style={{ padding: "8px 8px" }}
                          className="table-data-item"
                        >
                          {item.id}
                        </td>
                        <td
                          style={{ padding: "8px 8px" }}
                          className="table-data-item"
                        >
                          {item.name}
                        </td>
                        <td
                          style={{ padding: "8px 8px" }}
                          className="table-data-item"
                        >
                          {item.qty}
                        </td>
                        <td
                          style={{ padding: "8px 8px" }}
                          className="table-data-item"
                        >
                          ₦{item.amount}
                        </td>
                        <td
                          style={{ padding: "8px 8px" }}
                          className="table-data-item"
                        >
                          ₦{item.total}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#222b45",
                          padding: "10px 8px",
                        }}
                      >
                        TOTAL
                      </td>
                      <td
                        style={{
                          fontWeight: 700,
                          color: "#070600",
                          padding: "10px 8px",
                        }}
                      >
                        ₦{invoiceTotal}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button
                style={{
                  width: "100%",
                  background:
                    "linear-gradient(180deg, #007948 0%, #007948 100%)",
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 700,
                  border: "none",
                  borderRadius: 10,
                  padding: "16px 0",
                  cursor: "pointer",
                  letterSpacing: 1,
                  marginTop: 8,
                }}
                onClick={() => {
                  setShowPaymentLoading(true);
                  setShowInvoiceModal(false);
                  setTimeout(() => {
                    setShowPaymentLoading(false);
                    setShowPaymentSuccess(true);
                  }, 2000);
                }}
              >
                PAY
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Payment Loading Spinner Overlay */}
      {showPaymentLoading && (
        <div className="customer-modal-backdrop">
          <div className="customer-modal-center">
            <div className="customer-loader-spinner">
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="24"
                  stroke="#e4e4e4"
                  strokeWidth="6"
                  fill="none"
                  opacity="0.4"
                />
                <path
                  d="M56 32a24 24 0 0 1-24 24"
                  stroke="#007948"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 32 32"
                    to="360 32 32"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
              </svg>
            </div>
          </div>
        </div>
      )}
      {/* Payment Success Modal Overlay */}
      {showPaymentSuccess && (
        <div className="customer-modal-backdrop">
          <div className="customer-modal-center">
            <div className="customer-success-modal">
              <div className="customer-success-icon-wrap">
                <img
                  src={CheckCircle}
                  alt="success"
                  className="customer-success-icon"
                />
              </div>
              <div className="customer-success-title">Payment Success!</div>
              <div className="customer-success-desc">
                Your payment has been successfully done.
              </div>
              <div className="customer-success-actions">
                <button
                  className="customer-success-btn create-bill"
                  onClick={() => setShowPaymentSuccess(false)}
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
