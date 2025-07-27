import React, { useState } from "react";
import SearchInput from "../../reusables/SearchInput/SearchInput";
import BorderButton from "../../reusables/BorderButton/BorderButton";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import LoadingSpinner from "../../reusables/LoadingSpinner/LoadingSpinner";
import Modal from "../../reusables/Modal/Modal";
import FaanLogo from "/images/faan-logo.svg";
import InvoiceFormIcon from "/icons/invoice-form-icon.svg";
import IdFormIcon from "/icons/id-form-icon.svg";
import InvoiceAmountFormIcon from "/icons/invoice-amount-form-icon.svg";
import CheckCircle from "/icons/check-circle.svg";
import { FiInfo, FiEye } from "react-icons/fi";
import { useAuth } from "../../../contexts/AuthContext";
import "./paymentpage.css";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import PaymentsIcon from "/icons/nav-payment-icon.svg";
import SlideIndicator from "../../reusables/SlideIndicator/SlideIndicator";

const tabs = ["All", "Pending", "Completed", "Cancelled"];

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
  action: string;
  actionType: string;
}

interface PaymentPageProps {
  role?: string;
}

const PaymentPage: React.FC<PaymentPageProps> = () => {
  const { getTransactionHistory } = useAuth();
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
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - 6);
        const format = (d: Date) => d.toISOString().slice(0, 10);

        const transactions = await getTransactionHistory(
          format(startDate),
          format(endDate)
        );

        if (transactions) {
          // Map API response to PaymentItem format
          const mappedPayments: PaymentItem[] = transactions.map((txn) => ({
            billNo: txn.id.toString(),
            service: txn.tariffName,
            amount: `₦${txn.amount.toLocaleString()}`,
            status: txn.status,
            date: new Date(txn.createdAt).toLocaleString(),
            action:
              txn.status === "COMPLETED"
                ? "View Receipt"
                : txn.status === "PENDING"
                ? "View Invoice"
                : "View Reason",
            actionType:
              txn.status === "COMPLETED"
                ? "receipt"
                : txn.status === "PENDING"
                ? "invoice"
                : "reason",
          }));
          setPayments(mappedPayments);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [getTransactionHistory]);

  const handleSearch = () => {
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
    const matchesTab =
      activeTab === "All" || p.status.toLowerCase() === activeTab.toLowerCase();
    const matchesName =
      !appliedSearchName ||
      p.service.toLowerCase().includes(appliedSearchName.toLowerCase());
    const matchesBillNo =
      !appliedSearchBillNo || p.billNo.includes(appliedSearchBillNo);
    return matchesTab && matchesName && matchesBillNo;
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
      <div className="payment-table-card">
        {!isLoading && (
          <table className="payment-table ">
            <thead>
              <tr>
                <th className="table-header-item">Bill No.</th>
                <th className="table-header-item">Service</th>
                <th className="table-header-item">Amount</th>
                <th className="table-header-item">Status</th>
                <th className="table-header-item">Date</th>
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
                    <span
                      className={`payment-status-badge ${
                        statusColors[p.status as keyof typeof statusColors]
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="table-data-item">{p.date}</td>
                  <td className="table-data-item">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
          <div className="payment-invoice-content">
            <div className="payment-invoice-details">
              <div className="payment-invoice-details-title">
                Invoice Details:
              </div>
                </div>
            <div className="payment-invoice-cards">
              <div className="bill-customer-card payment-invoice-card">
                  <div className="bill-customer-icon-bg">
                    <img
                      src={InvoiceFormIcon}
                      alt="Invoice Number"
                      className="bill-customer-icon"
                    />
                  </div>
                <div className="bill-customer-info-col">
                  <div className="bill-customer-label">Invoice Number</div>
                  <div className="bill-customer-value highlight">
                      {modal.data.billNo}
                  </div>
                </div>
              </div>
              <div className="bill-customer-card payment-invoice-card">
                  <div className="bill-customer-icon-bg">
                    <img
                      src={IdFormIcon}
                      alt="Customer ID"
                      className="bill-customer-icon"
                    />
                  </div>
                <div className="bill-customer-info-col">
                  <div className="bill-customer-label">Customer ID</div>
                  <div className="bill-customer-value highlight">
                      2012366754
                  </div>
                </div>
              </div>
              <div className="bill-customer-card payment-invoice-card">
                  <div className="bill-customer-icon-bg">
                    <img
                      src={InvoiceAmountFormIcon}
                      alt="Invoice Amount"
                      className="bill-customer-icon"
                    />
                  </div>
                <div className="bill-customer-info-col">
                  <div className="bill-customer-label">Invoice Amount</div>
                  <div className="bill-customer-value highlight">
                      {modal.data.amount}
                  </div>
                </div>
              </div>
            </div>
            <div className="payment-invoice-table">
              <table>
                  <thead>
                  <tr>
                      <th className="table-header-item">ID</th>
                      <th className="table-header-item">Item Name</th>
                      <th className="table-header-item">Qty</th>
                      <th className="table-header-item">Amount</th>
                      <th className="table-header-item">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="table-data-item">1001</td>
                      <td className="table-data-item">{modal.data.service}</td>
                      <td className="table-data-item">1</td>
                      <td className="table-data-item">{modal.data.amount}</td>
                      <td className="table-data-item">{modal.data.amount}</td>
                    </tr>
                    <tr>
                    <td colSpan={4} className="payment-total-label">
                        TOTAL
                      </td>
                    <td className="payment-total-value">{modal.data.amount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            <div className="payment-invoice-actions">
                <GradientButton onClick={() => setModal(null)} fullWidth>
                  PAY
                </GradientButton>
          </div>
        </div>
      )}
      </Modal>

      {/* Receipt Modal */}
      <Modal
        isOpen={modal?.type === "receipt"}
        onClose={() => setModal(null)}
        showHeader={true}
        headerTitle="RECEIPT"
        className="payment-receipt-modal"
      >
        {modal?.type === "receipt" && (
          <div className="payment-receipt-content">
            <div className="payment-receipt-table">
              <table className="no-min-width-table">
                  <thead>
                  <tr>
                    <th className="table-header-item">ID</th>
                      <th className="table-header-item">Item Name</th>
                      <th className="table-header-item">Qty</th>
                      <th className="table-header-item">Amount</th>
                      <th className="table-header-item">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="table-data-item">1001</td>
                      <td className="table-data-item">{modal.data.service}</td>
                      <td className="table-data-item">1</td>
                      <td className="table-data-item">{modal.data.amount}</td>
                      <td className="table-data-item">{modal.data.amount}</td>
                    </tr>
                    <tr>
                    <td colSpan={4} className="payment-total-label">
                        TOTAL
                      </td>
                    <td className="payment-total-value">{modal.data.amount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            <div className="payment-receipt-actions">
                <GradientButton onClick={() => setModal(null)} fullWidth>
                  CLOSE
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
