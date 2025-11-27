import React, { useState } from "react";
import FieldButton from "../../reusables/FieldButton/FieldButton";
import SolidButton from "../../reusables/SolidButton/SolidButton";
import LoadingSpinner from "../../reusables/LoadingSpinner/LoadingSpinner";
import DataTable from "../../reusables/DataTable/DataTable";
import Modal from "../../reusables/Modal/Modal";
import ReceiptModal from "../../reusables/ReceiptModal/ReceiptModal";
// icons intentionally not used here (invoice modal uses compact summary)
import CheckCircle from "/icons/check-circle.svg";
import { FiInfo, FiEye } from "react-icons/fi";
import { Download } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import "./paymentpage.css";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import PaymentsIcon from "/icons/nav-payment-icon.svg";
import SlideIndicator from "../../reusables/SlideIndicator/SlideIndicator";
import SwitchingTabs from "../../reusables/SwitchingTabs/SwitchingTabs";

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
  isRealData?: boolean; // Flag to distinguish real data from mock data
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
  const [showPrintableReceipt, setShowPrintableReceipt] = useState(false);

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
          // console.log("📄 Raw transaction data from API:", transactions);

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
              isRealData: true, // Mark as real data
            };

            // console.log(`🔍 Mapped transaction ${billNo}:`, {
            //   original: txn,
            //   mapped: paymentItem,
            // });
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
              isRealData: false, // Mark as mock data
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

          // Combine real data and mock data
          // Ensure real data always appears first by sorting
          const finalPayments: PaymentItem[] = [];

          // Add all data
          finalPayments.push(...mappedPayments);
          for (const d of dummyTransactions) {
            if (!mappedPayments.find((m) => m.billNo === d.billNo)) {
              finalPayments.push(d);
            }
          }

          // Sort to ensure real data comes first after DataTable reverses
          // Since DataTable reverses, we sort so real data is LAST before reversal
          finalPayments.sort((a, b) => {
            const aIsReal = a.isRealData === true ? 1 : 0;
            const bIsReal = b.isRealData === true ? 1 : 0;
            return aIsReal - bIsReal; // Mock (0) comes before real (1), so after reverse, real comes first
          });

          // console.log("✅ Final mapped payments:", finalPayments);
          setPayments(finalPayments);
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
    // console.log("Search triggered:", { searchName, searchBillNo });
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

  // Export filtered payments to CSV
  const handleExport = () => {
    const header = ["Bill No", "Customer Name", "Service", "Amount", "Status", "Date"];
    const rows = [header, ...filteredPayments.map((p) => [p.billNo, p.customerName ?? "", p.service, p.amount, p.status, p.date])];
    const csvContent = rows
      .map((r) =>
        r
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments-export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
      {isMobile && (
        <PageTitle
          icon={PaymentsIcon}
          title="Payments"
          subtitle={
            "Find transactions by service name or bill number and filter by status using the tabs below."
          }
        />
      )}

      {/* Search header moved above tabs */}
      {windowWidth > 768 && (
        <PageTitle
          icon={PaymentsIcon}
          title="Payments"
          subtitle={
            "Find transactions by service name or bill number and filter by status using the tabs below."
          }
        />
      )}

      {/* Tabs row only for desktop/tablet */}
      {windowWidth > 768 && (
        <div className="payment-tabs-row">
          <SwitchingTabs
            items={tabs.map((t) => ({ id: t, label: t }))}
            activeId={activeTab}
            onChange={(id: string) => setActiveTab(id)}
          />
        </div>
      )}
      <div className="payment-search-row">
        <div className="payment-search-section">
          <div
            className="payment-search-inputs payment-action-buttons"
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <FieldButton
              inputs={[
                {
                  placeholder: "Search name",
                  value: searchName,
                  onChange: (
                    e:
                      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
                      | { target: { value: string } }
                  ) => {
                    const change = e as React.ChangeEvent<
                      HTMLInputElement | HTMLSelectElement
                    >;
                    if (
                      change &&
                      (change.currentTarget || change.nativeEvent)
                    ) {
                      setSearchName(change.currentTarget.value);
                      return;
                    }
                    const fallback = e as { target: { value: string } };
                    setSearchName(fallback.target.value);
                  },
                },
                {
                  placeholder: "Bill No.",
                  value: searchBillNo,
                  onChange: (
                    e:
                      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
                      | { target: { value: string } }
                  ) => {
                    const change = e as React.ChangeEvent<
                      HTMLInputElement | HTMLSelectElement
                    >;
                    if (
                      change &&
                      (change.currentTarget || change.nativeEvent)
                    ) {
                      setSearchBillNo(change.currentTarget.value);
                      return;
                    }
                    const fallback = e as { target: { value: string } };
                    setSearchBillNo(fallback.target.value);
                  },
                },
              ]}
              buttons={[
                {
                  text: "Search",
                  onClick: handleSearch,
                  className: "border-button-paymentpage",
                },
                {
                  text: "Clear",
                  onClick: handleClearSearch,
                  className: "border-button-paymentpage",
                },
              ]}
              className="payment-search-fieldbutton payment-actions-fieldbutton"
            />

            <div style={{ marginLeft: "auto", display: "flex" }}>
              <SolidButton
                text="Export"
                icon={<Download size={16} color="var(--color-text-on-accent)" />}
                onClick={handleExport}
                variant="primary"
                size={windowWidth <= 768 ? "small" : "medium"}
              />
            </div>
          </div>
        </div>
      </div>
      {!isLoading && (
        <DataTable
          header={`${activeTab} Payments`}
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
                className={`status-badge ${
                  statusColors[p.status as keyof typeof statusColors]
                }`}
              >
                {p.status}
              </span>,
              p.date,
              <div key="actions">
                {p.actionType === "reason" && (
                  <button
                    className="view-reason-btn"
                    onClick={() => setModal({ type: "reason", data: p })}
                  >
                    <FiInfo className="payment-action-icon" />
                    <span>View Reason</span>
                  </button>
                )}
                {p.actionType === "receipt" && (
                  <button
                    className="view-receipt-btn"
                    onClick={() => setModal({ type: "receipt", data: p })}
                  >
                    <FiEye className="payment-action-icon" />
                    <span>View Receipt</span>
                  </button>
                )}
                {p.actionType === "invoice" && (
                  <button
                    className="view-receipt-btn"
                    onClick={() => setModal({ type: "invoice", data: p })}
                  >
                    <FiEye className="payment-action-icon" />
                    <span>View Invoice</span>
                  </button>
                )}
                {p.actionType === "view" && (
                  <button className="view-receipt-btn">
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
            <h2 style={{ color: "var(--color-text-primary)" }}>
              Invoice Summary
            </h2>

            {modal.data && (
              <div
                className="booking-summary-card invoice-modal-summary"
                aria-live="polite"
              >
                {/* single-line item (payment page uses single service per item) */}
                <div className="booking-summary-row">
                  <span style={{ color: "var(--color-text-primary)" }}>
                    {modal.data.service} x1
                  </span>
                  <span style={{ color: "var(--color-text-primary)" }}>
                    {modal.data.amount}
                  </span>
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
                        <span style={{ color: "var(--color-text-secondary)" }}>
                          SUB-TOTAL
                        </span>
                        <span style={{ color: "var(--color-text-primary)" }}>
                          ₦{subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="booking-summary-row">
                        <span style={{ color: "var(--color-text-secondary)" }}>
                          VAT ({(vatRate * 100).toFixed(2)}%)
                        </span>
                        <span style={{ color: "var(--color-text-primary)" }}>
                          ₦{vatAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="booking-summary-row">
                        <span style={{ color: "var(--color-text-secondary)" }}>
                          OTHER CHARGES
                        </span>
                        <span style={{ color: "var(--color-text-primary)" }}>
                          ₦0
                        </span>
                      </div>
                      <div className="booking-summary-row total">
                        <span style={{ color: "var(--color-text-primary)" }}>
                          TOTAL
                        </span>
                        <span style={{ color: "var(--color-text-primary)" }}>
                          ₦{total.toLocaleString()}
                        </span>
                      </div>
                    </>
                  );
                })()}

                <div
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <strong style={{ color: "var(--color-text-primary)" }}>
                    Invoice:
                  </strong>{" "}
                  {modal.data.billNo}
                </div>

                {modal.data.customerName && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <strong style={{ color: "var(--color-text-primary)" }}>
                      Customer:
                    </strong>{" "}
                    {modal.data.customerName}
                  </div>
                )}

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <strong style={{ color: "var(--color-text-primary)" }}>
                    Created:
                  </strong>{" "}
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            )}

            <div className="modal-actions" style={{ width: "100%" }}>
              <SolidButton
                text="PAY"
                onClick={() => {
                  setModal(null);
                }}
                fullWidth
              />
            </div>

            {/* Notice about payment method (wallet-only) */}
            <div className="wallet-note" role="status">
              Your wallet will be used to pay this invoice automatically.
            </div>
          </div>
        )}
      </Modal>
      {/* Printable receipt modal */}
      <ReceiptModal
        isOpen={showPrintableReceipt}
        onClose={() => setShowPrintableReceipt(false)}
        receiptData={
          modal && modal.data
            ? {
                invoiceNumber: modal.data.billNo,
                transactionId: modal.data.billNo,
                amount:
                  Number(String(modal.data.amount).replace(/[^0-9.-]+/g, "")) ||
                  0,
                serviceName: modal.data.service,
                customerId: user?.customerId || "",
                paymentDate: new Date().toLocaleString(),
              }
            : null
        }
      />

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
              <div className="meta-row">
                <span>Payment Channel</span>
                <span>Web</span>
              </div>
              <div className="meta-row">
                <span>Payment Method</span>
                <span>Wallet</span>
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
            {user?.customerId && (
              <div className="receipt-foot">Customer ID: {user.customerId}</div>
            )}
            <div className="receipt-download" style={{ marginTop: 12 }}>
              <SolidButton
                text="Download PDF"
                fullWidth
                onClick={() => {
                  setShowPrintableReceipt(true);
                }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Reason Modal */}
      <Modal
        isOpen={modal?.type === "reason"}
        onClose={() => setModal(null)}
        showHeader={true}
        headerTitle="PAYMENT STATUS"
        className="payment-reason-modal"
      >
        {modal?.type === "reason" && (
          <div className="reason-paper">
            <div className="reason-head">
              <div className="reason-brand">
                Federal Airports Authority of Nigeria
              </div>
              <div className="reason-title">PAYMENT STATUS</div>
              <div className="reason-sub">Transaction Details</div>
            </div>
            <div className="reason-meta">
              <div className="meta-row">
                <span>Bill No.</span>
                <span className="mono">{modal.data.billNo}</span>
              </div>
              <div className="meta-row">
                <span>Service</span>
                <span>{modal.data.service}</span>
              </div>
              <div className="meta-row">
                <span>Amount</span>
                <span className="mono">{modal.data.amount}</span>
              </div>
              <div className="meta-row">
                <span>Date</span>
                <span>{modal.data.date}</span>
              </div>
            </div>

            <div className="reason-details">
              <div className="reason-section">
                <div className="reason-label">Reason for Cancellation:</div>
                <div className="reason-message">
                  Payment failed due to insufficient funds in your wallet.
                </div>
              </div>
              <div className="reason-section">
                <div className="reason-help">
                  <strong>What you can do:</strong>
                  <ul>
                    <li>Top up your wallet balance</li>
                    <li>Try the payment again</li>
                    <li>Contact support if the issue persists</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="reason-actions">
              <SolidButton
                text="CLOSE"
                onClick={() => setModal(null)}
                fullWidth
              />
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
          <SolidButton
            text="CLOSE"
            onClick={() => setShowPaymentSuccess(false)}
            fullWidth
          />
        </div>
      </Modal>
    </div>
  );
};

export default PaymentPage;
