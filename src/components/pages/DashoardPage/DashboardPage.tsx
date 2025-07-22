import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import MetricsCards from "./MetricCard/MetricsCards";
import ChartSection from "./ChartSection/ChartSection";
import TransactionsTable from "./TransactionsTable/TransactionsTable";
import MessageToast from "../../reusables/MessageToast/MessageToast";
import "./dashboardpage.css";
import WalletIcon from "/icons/dashboard-wallet-icon.svg";
import BorderButton from "../../reusables/BorderButton/BorderButton";
import CheckCircle from "/icons/check-circle.svg";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import LoadingSpinner from "../../reusables/LoadingSpinner/LoadingSpinner";

interface DashboardPageProps {
  role?: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ role }) => {
  const { user, fundWallet, getTransactionHistory } = useAuth();
  const [showFundWallet, setShowFundWallet] = React.useState(false);
  const [fundAmount, setFundAmount] = React.useState("");
  const [showFundLoading, setShowFundLoading] = React.useState(false);
  const [showFundSuccess, setShowFundSuccess] = React.useState(false);
  const [showBalance, setShowBalance] = React.useState(true);
  const [toast, setToast] = React.useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Use wallet balance from user data, fallback to 0
  const walletBalance = user?.walletBalance || 0;
  const [localWalletBalance, setLocalWalletBalance] =
    React.useState(walletBalance);

  // Update local wallet balance when user data changes
  React.useEffect(() => {
    setLocalWalletBalance(walletBalance);
  }, [walletBalance]);

  // Fetch transactions for the last 6 months on mount
  React.useEffect(() => {
    const fetchTransactions = async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 6);
      const format = (d: Date) => d.toISOString().slice(0, 10);
      const txns = await getTransactionHistory(
        format(startDate),
        format(endDate)
      );
      if (txns) setTransactions(txns);
    };
    fetchTransactions();
  }, [getTransactionHistory]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({
      message,
      type,
      isVisible: true,
    });
  };

  const handleOpenFundWallet = () => setShowFundWallet(true);
  const handleCloseFundWallet = () => {
    setShowFundWallet(false);
    setFundAmount("");
    setShowFundLoading(false);
    setShowFundSuccess(false);
  };

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate minimum amount
    const amount = parseFloat(fundAmount);
    if (amount < 200000) {
      showToast("Minimum fundable amount is ₦200,000", "error");
      return;
    }

    setShowFundLoading(true);

    try {
      const success = await fundWallet(amount);

      if (success) {
        setShowFundLoading(false);
        setShowFundSuccess(true);
        showToast("Wallet funded successfully!", "success");
        // Note: The wallet balance will be automatically updated by the AuthContext
      } else {
        setShowFundLoading(false);
        showToast("Failed to fund wallet. Please try again.", "error");
      }
    } catch (error) {
      console.error("Fund wallet error:", error);
      setShowFundLoading(false);
      showToast(
        "An error occurred while funding wallet. Please try again.",
        "error"
      );
    }
  };

  return (
    <div className="dashboard-page-content">
      <MessageToast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
      {role === "Customer" && (
        <div className="customer-dashboard-top">
          <div className="wallet-card">
            <div className="wallet-info">
              <img src={WalletIcon} alt="Wallet" className="wallet-icon" />
              <div>
                <div className="wallet-label">Wallet Balance</div>
                <div className="wallet-balance-container">
                  <div className="wallet-balance">
                    {showBalance
                      ? `₦${localWalletBalance.toLocaleString()}`
                      : "₦••••••••"}
                  </div>
                  <button
                    type="button"
                    className="balance-toggle-btn mobile-only"
                    onClick={() => setShowBalance(!showBalance)}
                    aria-label={showBalance ? "Hide balance" : "Show balance"}
                  >
                    {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            <BorderButton
              text="FUND WALLET"
              className="fund-wallet-btn-dashboard"
              onClick={handleOpenFundWallet}
            />
          </div>
          {/* Fund Wallet Modal */}
          {showFundWallet && (
            <div
              className="bill-modal-backdrop"
              onClick={handleCloseFundWallet}
            >
              <div className="bill-modal-center">
                {/* Loading Spinner */}
                {showFundLoading && (
                  <div className="bill-loader-spinner">
                    <LoadingSpinner isVisible={true} />
                  </div>
                )}
                {/* Success Modal */}
                {showFundSuccess && (
                  <div className="fund-wallet-success-modal">
                    <button
                      className="fund-wallet-close-btn"
                      onClick={handleCloseFundWallet}
                      aria-label="Close"
                    >
                      ×
                    </button>
                    <div className="fund-wallet-success-icon-wrap">
                      <img
                        src={CheckCircle}
                        alt="success"
                        className="fund-wallet-success-icon"
                      />
                    </div>
                    <div className="fund-wallet-success-title">
                      Wallet Successfully Funded!
                    </div>
                    <div className="fund-wallet-success-desc">
                      Your payment was successful.
                    </div>
                    <GradientButton onClick={handleCloseFundWallet} fullWidth>
                      CLOSE
                    </GradientButton>
                  </div>
                )}
                {/* Fund Wallet Form */}
                {!showFundLoading && !showFundSuccess && (
                  <div
                    className="fund-wallet-modal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="fund-wallet-close-btn"
                      onClick={handleCloseFundWallet}
                      aria-label="Close"
                    >
                      ×
                    </button>
                    <div className="fund-wallet-title">Fund Wallet:</div>
                    <div className="fund-wallet-divider" />
                    <form className="fund-wallet-form" onSubmit={handleFund}>
                      <label className="fund-wallet-label">
                        Enter an Amount
                      </label>
                      <div className="fund-wallet-input-wrapper">
                        <span className="fund-wallet-currency">₦</span>
                        <input
                          type="number"
                          min="200000"
                          value={fundAmount}
                          onChange={(e) => setFundAmount(e.target.value)}
                          placeholder="200,000"
                          className="fund-wallet-input"
                          required
                        />
                      </div>
                      <GradientButton
                        type="submit"
                        fullWidth
                        disabled={
                          !fundAmount || parseFloat(fundAmount) < 200000
                        }
                        className="fund-wallet-submit-btn"
                      >
                        FUND WALLET
                      </GradientButton>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* End Fund Wallet Modal */}
          {/* <div className="booking-cards-row">
            <div className="booking-card total">
              <div className="booking-label">Total Bookings</div>
              <div className="booking-value">50</div>
            </div>
            <div className="booking-card completed">
              <div className="booking-label">Completed Bookings</div>
              <div className="booking-value">47</div>
            </div>
            <div className="booking-card cancelled">
              <div className="booking-label">Cancelled Bookings</div>
              <div className="booking-value">1</div>
            </div>
            <div className="booking-card pending">
              <div className="booking-label">Pending Bookings</div>
              <div className="booking-value">2</div>
            </div>
          </div> */}
        </div>
      )}
      <MetricsCards />
      <div className="dashboard-bottom-grid">
        <ChartSection />
        <TransactionsTable
          onSeeAll={() => setShowAllTransactions(true)}
          transactions={transactions}
        />
      </div>
      {/* Desktop All Transactions Modal */}
      {showAllTransactions && (
        <div
          className="bill-modal-backdrop"
          onClick={() => setShowAllTransactions(false)}
        >
          <div
            className="all-transactions-modal-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                minWidth: 640,
                maxWidth: 800,
                padding: 32,
                position: "relative",
              }}
            >
              <button
                className="fund-wallet-close-btn"
                onClick={() => setShowAllTransactions(false)}
                aria-label="Close"
                style={{
                  position: "absolute",
                  top: 18,
                  right: 18,
                  fontSize: 24,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#222",
                }}
              >
                ×
              </button>
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: 22,
                  color: "#222b45",
                  marginBottom: 18,
                }}
              >
                All Transactions
              </h2>
              <div className="all-transactions-table-container">
                <TransactionsTable
                  expanded
                  hideTitle
                  transactions={transactions}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile All Transactions Modal */}
      {showAllTransactions && (
        <div
          className="mobile-transactions-modal-backdrop mobile-only"
          onClick={() => setShowAllTransactions(false)}
        >
          <div
            className="mobile-transactions-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-transactions-modal-body">
              <div className="mobile-transactions-modal-header">
                <button
                  className="mobile-transactions-back-btn"
                  onClick={() => setShowAllTransactions(false)}
                  aria-label="Go back"
                >
                  <ChevronLeft size={24} />
                </button>
                <h2 className="mobile-transactions-modal-title">
                  All Transactions
                </h2>
              </div>
              <TransactionsTable
                expanded
                hideTitle
                transactions={transactions}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
