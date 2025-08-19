import React, { useState } from "react";
import SearchInput from "../../reusables/SearchInput/SearchInput";
import BorderButton from "../../reusables/BorderButton/BorderButton";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import LoadingSpinner from "../../reusables/LoadingSpinner/LoadingSpinner";
import DataTable from "../../reusables/DataTable/DataTable";
import Modal from "../../reusables/Modal/Modal";
// icons intentionally not used here (invoice modal uses compact summary)
import CheckCircle from "/icons/check-circle.svg";
import { FiInfo, FiEye } from "react-icons/fi";
import { useAuth } from "../../../contexts/AuthContext";
import "./paymentpage.css";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import PaymentsIcon from "/icons/nav-payment-icon.svg";
import SlideIndicator from "../../reusables/SlideIndicator/SlideIndicator";

const tabs = ["All", "Pending", "Completed", "Cancelled/Abandoned"];

const statusColors = {
  CANCELLED: "cancelled",
  PENDING: "processing",
  COMPLETED: "completed",
};

interface PaymentItem {
  billNo: string;
  service: string;
  amount: string;
  status: string;
  date: string;
  customerName?: string;
  action: string;
  actionType: string;
}

interface PaymentPageProps {
  role?: string;
}

const PaymentPage: React.FC<PaymentPageProps> = () => {
  const { getTransactionHistory, getAdminTransactionHistory, user } = useAuth();
  const [activeTab, setActiveTab] = useState("All");
  const [searchName, setSearchName] = useState("");
  const [searchBillNo, setSearchBillNo] = useState("");
  const [appliedSearchName, setAppliedSearchName] = useState("");
  const [appliedSearchBillNo, setAppliedSearchBillNo] = useState("");
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<{
    type: "invoice" | "receipt" | "reason";
    data: PaymentItem;
  } | null>(null);

  // Responsive window width
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  // Fetch transaction history on component mount
  React.useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        let transactions;

        // Use admin transaction history for admin users, regular history for customers
        if (user?.role === "Admin") {
          console.log(
            "🔐 Admin user detected, fetching admin transaction history"
          );
          transactions = await getAdminTransactionHistory();
        } else {
          console.log(
            "👤 Customer user detected, fetching regular transaction history"
          );
          const endDate = new Date();
          const startDate = new Date();
          startDate.setMonth(endDate.getMonth() - 6);
          const format = (d: Date) => d.toISOString().slice(0, 10);

          transactions = await getTransactionHistory(
            format(startDate),
            format(endDate)
          );
        }

        if (transactions) {
          console.log("📄 Raw transaction data from API:", transactions);

          // Map API response to PaymentItem format (normalize unknown shapes)
          const txs = transactions as unknown as Array<Record<string, unknown>>;
          const mappedPayments: PaymentItem[] = txs.map((txn) => {
            const billNo = String(txn["id"] ?? txn["billNo"] ?? "");
            const service = String(
              txn["tariffName"] ?? txn["service"] ?? "Unknown Service"
            );
            const amountVal = txn["amount"] ?? txn["price"] ?? 0;
            const amountNum =
              typeof amountVal === "number"
                ? amountVal
                : Number(String(amountVal || 0));
            const amountStr = `₦${amountNum.toLocaleString()}`;
            const status = String(txn["status"] ?? "PENDING");
            const createdAt = txn["createdAt"];
            const date =
              typeof createdAt === "string" || typeof createdAt === "number"
                ? new Date(createdAt as string | number).toLocaleDateString()
                : new Date().toLocaleDateString();
            const customerName = String(
              txn["customerName"] ?? txn["customerId"] ?? "Unknown Customer"
            );

            const paymentItem: PaymentItem = {
              billNo,
              service,
              amount: amountStr,
              status,
              date,
              customerName,
              action:
                status === "COMPLETED"
                  ? "View Receipt"
                  : status === "PENDING"
                  ? "View Invoice"
                  : "View Reason",
              actionType:
                status === "COMPLETED"
                  ? "receipt"
                  : status === "PENDING"
                  ? "invoice"
                  : "reason",
            };

            console.log(`🔍 Mapped transaction ${billNo}:`, {
              original: txn,
              mapped: paymentItem,
            });
            return paymentItem;
          });

          // Append realistic-looking dummy pending & cancelled transactions for demo
          const sampleServices = [
            { name: "VIP lounge International", amount: 5000 },
            { name: "International Departure", amount: 7000 },
            { name: "Protocol Lounge Port Harcourt", amount: 1000000 },
            { name: "Protocol Car Park Porthacourt", amount: 120000 },
            { name: "Extra ODC", amount: 300000 },
            { name: "Abuja International OneOff", amount: 10000 },
            { name: "International Arrival", amount: 7000 },
            { name: "Test Airport Service 1", amount: 500 },
          ];

          const makeFake = (
            prefix: string,
            svc: { name: string; amount: number },
            idx: number,
            status: "PENDING" | "CANCELLED"
          ): PaymentItem => {
            const daysAgo = idx + 1 + Math.floor(Math.random() * 5);
            const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
            const idPart = Math.floor(100000 + Math.random() * 899999);
            const billNo = `${prefix}-${d
              .toISOString()
              .slice(0, 10)
              .replace(/-/g, "")}-${idPart}`;
            return {
              billNo,
              service: svc.name,
              amount: `₦${svc.amount.toLocaleString()}`,
              status,
              date: d.toLocaleDateString(),
              customerName:
                user?.role === "Admin"
                  ? `CUST-${Math.floor(1000 + Math.random() * 8999)}`
                  : undefined,
              action: status === "PENDING" ? "View Invoice" : "View Reason",
              actionType: status === "PENDING" ? "invoice" : "reason",
            };
          };

          const dummyTransactions: PaymentItem[] = [];
          // add 8 pending and 8 cancelled
          for (let i = 0; i < 8; i++) {
            const svc = sampleServices[i % sampleServices.length];
            dummyTransactions.push(makeFake("D-PEND", svc, i, "PENDING"));
          }
          for (let i = 0; i < 8; i++) {
            const svc = sampleServices[(i + 3) % sampleServices.length];
            dummyTransactions.push(makeFake("D-CANC", svc, i, "CANCELLED"));
          }

          for (const d of dummyTransactions) {
            if (!mappedPayments.find((m) => m.billNo === d.billNo))
              mappedPayments.push(d);
          }

          console.log("✅ Final mapped payments:", mappedPayments);
          setPayments(mappedPayments);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [getTransactionHistory, getAdminTransactionHistory, user?.role]);

  const handleSearch = () => {
    console.log("Search triggered:", { searchName, searchBillNo });
    setAppliedSearchName(searchName);
    setAppliedSearchBillNo(searchBillNo);
  };

  const handleClearSearch = () => {
    setSearchName("");
    setSearchBillNo("");
    setAppliedSearchName("");
    setAppliedSearchBillNo("");
  };

  const filteredPayments = payments.filter((p) => {
    let matchesTab = false;
    if (activeTab === "All") matchesTab = true;
    else if (activeTab === "Cancelled/Abandoned") {
      const s = (p.status || "").toLowerCase();
      matchesTab = s.includes("cancel") || s.includes("abandon");
    } else {
      matchesTab = p.status.toLowerCase() === activeTab.toLowerCase();
    }
    const matchesName =
      !appliedSearchName ||
      p.service.toLowerCase().includes(appliedSearchName.toLowerCase());
    const matchesBillNo =
      !appliedSearchBillNo || p.billNo.includes(appliedSearchBillNo);

    // Debug logging
    if (appliedSearchName || appliedSearchBillNo) {
      console.log("Search debug:", {
        payment: p,
        searchName: appliedSearchName,
        searchBillNo: appliedSearchBillNo,
        matchesTab,
        matchesName,
        matchesBillNo,
        result: matchesTab && matchesName && matchesBillNo,
      });
    }

    return matchesTab && matchesName && matchesBillNo;
  });

  // Debug logging for search state
  console.log("Search state:", {
    searchName,
    searchBillNo,
    appliedSearchName,
    appliedSearchBillNo,
    totalPayments: payments.length,
    filteredPayments: filteredPayments.length,
  });

  return (
    <div className="payment-page">
      <LoadingSpinner isVisible={isLoading} message="Loading transactions..." />
      {/* Mobile PageTitle for 768px and below */}
      {isMobile && <PageTitle icon={PaymentsIcon} title="Payments" />}
      {/* Tabs row only for desktop/tablet */}
      {windowWidth > 768 && (
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
      )}
      <div className="payment-search-row">
        <SearchInput
          placeholder="Search name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <SearchInput
            placeholder="Bill No."
            value={searchBillNo}
            onChange={(e) => setSearchBillNo(e.target.value)}
          />
          <BorderButton
            text="Search"
            onClick={handleSearch}
            className="border-button-paymentpage"
          />
          <BorderButton
            text="Clear"
            onClick={handleClearSearch}
            className="border-button-paymentpage"
          />
        </div>
      </div>
      {!isLoading && (
        <DataTable
          headers={
            user?.role === "Admin"
              ? [
                  "Bill No.",
                  "Customer ID",
                  "Service",
                  "Amount",
                  "Status",
                  "Date",
                  "Actions",
                ]
              : ["Bill No.", "Service", "Amount", "Status", "Date", "Actions"]
          }
          data={filteredPayments.map((p) => {
            const baseData = [
              p.billNo,
              p.service,
              p.amount,
              <span
                key="status"
                className={`payment-status-badge ${
                  statusColors[p.status as keyof typeof statusColors]
                }`}
              >
                {p.status}
              </span>,
              p.date,
              <div key="actions">
                {p.actionType === "reason" && (
                  <button
                    className="payment-action-btn reason"
                    onClick={() => setModal({ type: "reason", data: p })}
                  >
                    <FiInfo className="payment-action-icon" />
                    <span>View Reason</span>
                  </button>
                )}
                {p.actionType === "receipt" && (
                  <button
                    className="payment-action-btn receipt"
                    onClick={() => setModal({ type: "receipt", data: p })}
                  >
                    <FiEye className="payment-action-icon" />
                    <span>View Receipt</span>
                  </button>
                )}
                {p.actionType === "invoice" && (
                  <button
                    className="payment-action-btn invoice"
                    onClick={() => setModal({ type: "invoice", data: p })}
                  >
                    <FiEye className="payment-action-icon" />
                    <span>View Invoice</span>
                  </button>
                )}
                {p.actionType === "view" && (
                  <button className="payment-action-btn view">
                    <FiEye className="payment-action-icon" />
                  </button>
                )}
              </div>,
            ];

            // Insert customer name after bill no for admin users
            if (user?.role === "Admin") {
              baseData.splice(1, 0, p.customerName || "Unknown Customer");
            }

            return baseData;
          })}
          className="payment-table"
        />
      )}
      {windowWidth <= 768 && <SlideIndicator />}

      {/* Invoice Modal */}
      <Modal
        isOpen={modal?.type === "invoice"}
        onClose={() => setModal(null)}
        showHeader={true}
        headerTitle="FEDERAL AIRPORT AUTHORITY OF NIGERIA"
        className="payment-invoice-modal"
      >
        {modal?.type === "invoice" && (
          <div className="modal-content">
            <h2 style={{ color: "#111827" }}>Invoice Summary</h2>

            {modal.data && (
              <div
                className="booking-summary-card invoice-modal-summary"
                aria-live="polite"
              >
                {/* single-line item (payment page uses single service per item) */}
                <div className="booking-summary-row">
                  <span style={{ color: "#111827" }}>
                    {modal.data.service} x1
                  </span>
                  <span style={{ color: "#111827" }}>{modal.data.amount}</span>
                </div>

                {/* parse amount and compute VAT */}
                {(() => {
                  const raw = String(modal.data.amount || "").replace(
                    /[^0-9]/g,
                    ""
                  );
                  const subtotal = raw ? Number(raw) : 0;
                  const vatRate = 0.075;
                  const vatAmount = Math.round(subtotal * vatRate);
                  const total = subtotal + vatAmount;
                  return (
                    <>
                      <div className="booking-summary-row">
                        <span style={{ color: "#6b7280" }}>SUB-TOTAL</span>
                        <span style={{ color: "#111827" }}>
                          ₦{subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="booking-summary-row">
                        <span style={{ color: "#6b7280" }}>
                          VAT ({(vatRate * 100).toFixed(2)}%)
                        </span>
                        <span style={{ color: "#111827" }}>
                          ₦{vatAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="booking-summary-row">
                        <span style={{ color: "#6b7280" }}>OTHER CHARGES</span>
                        <span style={{ color: "#111827" }}>₦0</span>
                      </div>
                      <div className="booking-summary-row total">
                        <span style={{ color: "#111827" }}>TOTAL</span>
                        <span style={{ color: "#111827" }}>
                          ₦{total.toLocaleString()}
                        </span>
                      </div>
                    </>
                  );
                })()}

                <div style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}>
                  <strong style={{ color: "#374151" }}>Invoice:</strong>{" "}
                  {modal.data.billNo}
                </div>

                {modal.data.customerName && (
                  <div style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
                    <strong style={{ color: "#374151" }}>Customer:</strong>{" "}
                    {modal.data.customerName}
                  </div>
                )}

                <div style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
                  <strong style={{ color: "#374151" }}>Created:</strong>{" "}
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            )}

            <div className="modal-actions" style={{ width: "100%" }}>
              <GradientButton
                onClick={() => {
                  setModal(null);
                }}
                fullWidth
              >
                PAY
              </GradientButton>
            </div>

            {/* Notice about payment method (wallet-only) */}
            <div className="wallet-note" role="status">
              Your wallet will be used to pay this invoice automatically.
            </div>
          </div>
        )}
      </Modal>

      {/* Receipt Modal */}
      <Modal
        isOpen={modal?.type === "receipt"}
        onClose={() => setModal(null)}
        showHeader={true}
        headerTitle="PAYMENT RECEIPT"
        className="payment-receipt-modal"
      >
        {modal?.type === "receipt" && (
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
                <span>Transaction ID</span>
                <span className="mono">{modal.data.billNo}</span>
              </div>
              <div className="meta-row">
                <span>Payment Date</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>
            <div className="receipt-items">
              <div className="thead">
                <span>Item</span>
                <span className="right">Amount</span>
              </div>
              <div className="row">
                <span>{modal.data.service}</span>
                <span className="right mono">{modal.data.amount}</span>
              </div>
              <div className="total">
                <span>Total</span>
                <span className="right mono">{modal.data.amount}</span>
              </div>
            </div>
            <div className="receipt-download" style={{ marginTop: 12 }}>
              <GradientButton
                fullWidth
                onClick={() => {
                  const html = `<!doctype html><html><head><meta charset='utf-8'><title>Receipt ${
                    modal.data.billNo
                  }</title>
                  <style>
                    @page { margin: 10mm; }
                    body{background:#eef2f7;margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#111827}
                    .receipt-paper{position:relative;max-width:720px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 2px 10px rgba(17,24,39,0.06);padding:24px;color:#111827}
                    .receipt-paper:before{content:"";position:absolute;left:0;right:0;top:-8px;height:16px;background:radial-gradient(circle at 8px 8px,#fff 8px,transparent 8px) left top/16px 16px repeat-x,linear-gradient(#e5e7eb,#e5e7eb)}
                    .receipt-head{text-align:center;margin:8px 0}
                    .receipt-brand{font-weight:700;color:#374151;font-size:14px}
                    .receipt-title{font-size:16px;font-weight:800;color:#111827;letter-spacing:0.06em;margin-top:2px}
                    .receipt-sub{font-size:12px;color:#6b7280;margin-top:2px}
                    .receipt-meta{border:1px dashed #e5e7eb;border-radius:10px;padding:12px 14px;margin:12px 0 16px 0}
                    .receipt-meta .meta-row{display:flex;justify-content:space-between;align-items:center;padding:8px 4px;border-bottom:1px dashed #e5e7eb}
                    .receipt-meta .meta-row:last-child{border-bottom:none}
                    .receipt-meta .meta-row span:first-child{color:#6b7280;font-size:12px}
                    .mono{font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;font-weight:700}
                    .receipt-items{border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb}
                    .receipt-items .thead,.receipt-items .row,.receipt-items .total{display:grid;grid-template-columns:1fr 160px;gap:12px;padding:10px 0}
                    .receipt-items .thead{color:#6b7280;font-size:12px}
                    .receipt-items .row{border-top:1px dashed #e5e7eb}
                    .right{text-align:right}
                    .receipt-items .total{border-top:2px solid #e5e7eb;font-weight:800}
                  </style>
                  </head><body>
                    <div class='receipt-paper'>
                      <div class='receipt-head'>
                        <div class='receipt-brand'>Federal Airports Authority of Nigeria</div>
                        <div class='receipt-title'>PAYMENT RECEIPT</div>
                        <div class='receipt-sub'>Thank you for your payment.</div>
                      </div>
                      <div class='receipt-meta'>
                        <div class='meta-row'><span>Transaction ID</span><span class='mono'>${
                          modal.data.billNo
                        }</span></div>
                        <div class='meta-row'><span>Payment Date</span><span>${new Date().toLocaleString()}</span></div>
                      </div>
                      <div class='receipt-items'>
                        <div class='thead'><span>Item</span><span class='right'>Amount</span></div>
                        <div class='row'><span>${
                          modal.data.service
                        }</span><span class='right mono'>${
                    modal.data.amount
                  }</span></div>
                        <div class='total'><span>Total</span><span class='right mono'>${
                          modal.data.amount
                        }</span></div>
                      </div>
                    </div>
                    <script>
                      window.onload = function(){ setTimeout(function(){ window.print(); window.close(); }, 250); };
                    </script>
                  </body></html>`;
                  const win = window.open("", "_blank");
                  if (win) {
                    win.document.open();
                    win.document.write(html);
                    win.document.close();
                  }
                }}
              >
                Download PDF
              </GradientButton>
            </div>
          </div>
        )}
      </Modal>

      {/* Reason Modal */}
      <Modal
        isOpen={modal?.type === "reason"}
        onClose={() => setModal(null)}
        showHeader={true}
        headerTitle="CANCELLATION REASON"
        className="payment-reason-modal"
      >
        {modal?.type === "reason" && (
          <div className="payment-reason-content">
            <div className="payment-reason-message">
              Payment failed due to insufficient funds.
            </div>
            <div className="payment-reason-details">
              <div className="payment-reason-detail">
                <div className="payment-reason-label">Bill No.</div>
                <div className="payment-reason-value">{modal.data.billNo}</div>
              </div>
              <div className="payment-reason-detail">
                <div className="payment-reason-label">Service</div>
                <div className="payment-reason-value">{modal.data.service}</div>
              </div>
            </div>
            <div className="payment-reason-actions">
              <GradientButton onClick={() => setModal(null)} fullWidth>
                CLOSE
              </GradientButton>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Success Modal */}
      <Modal
        isOpen={showPaymentSuccess}
        onClose={() => setShowPaymentSuccess(false)}
        showHeader={false}
        className="payment-success-modal"
      >
        <div className="payment-success-content">
          <div className="customer-success-icon-wrap">
            <img
              src={CheckCircle}
              alt="success"
              className="customer-success-icon"
            />
          </div>
          <div className="customer-success-title">Payment Success!</div>
          <div className="customer-success-desc">
            Your payment has been made successfully.
          </div>
          <GradientButton
            onClick={() => setShowPaymentSuccess(false)}
            fullWidth
          >
            CLOSE
          </GradientButton>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentPage;
