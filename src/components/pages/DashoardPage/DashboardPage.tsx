import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import MetricsCards from "./MetricCard/MetricsCards";
import ChartSection from "./ChartSection/ChartSection";
import TransactionsTable from "./TransactionsTable/TransactionsTable";
import MessageToast from "../../reusables/MessageToast/MessageToast";
import Modal from "../../reusables/Modal/Modal";
import "./dashboardpage.css";
import WalletIcon from "/icons/dashboard-wallet-icon.svg";
import BorderButton from "../../reusables/BorderButton/BorderButton";
import CheckCircle from "/icons/check-circle.svg";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import { Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "../../reusables/LoadingSpinner/LoadingSpinner";

interface DashboardPageProps {
  role?: string;
}

// Type matching what TransactionsTable expects and AuthContext returns
interface Transaction {
  id: number;
  tariffName?: string;
  service?: string;
  amount?: number;
  price?: string;
  status?: string;
  createdAt?: string;
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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
      if (txns) setTransactions(txns as Transaction[]);
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
    // Close the modal when loading starts
    setShowFundWallet(false);

    try {
      const success = await fundWallet(amount);

      if (success) {
        setShowFundLoading(false);
        setShowFundSuccess(true);
        // Reopen modal to show success state
        setShowFundWallet(true);
        showToast("Wallet funded successfully!", "success");
        // Note: The wallet balance will be automatically updated by the AuthContext
      } else {
        setShowFundLoading(false);
        // Reopen modal to show error state
        setShowFundWallet(true);
        showToast("Failed to fund wallet. Please try again.", "error");
      }
    } catch (error) {
      console.error("Fund wallet error:", error);
      setShowFundLoading(false);
      // Reopen modal to show error state
      setShowFundWallet(true);
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

      {/* Loading Spinner - Full Screen Overlay */}
      {showFundLoading && (
        <LoadingSpinner isVisible={true} message="Processing payment..." />
      )}

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

      {/* Fund Wallet Modal */}
      <Modal
        isOpen={showFundWallet}
        onClose={handleCloseFundWallet}
        showHeader={false}
      >
        {/* Success Modal */}
        {showFundSuccess && (
          <div className="fund-wallet-success-content">
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
          <div className="fund-wallet-content">
            <div className="fund-wallet-title">Fund Wallet:</div>
            <div className="fund-wallet-divider" />
            <form className="fund-wallet-form" onSubmit={handleFund}>
              <label className="fund-wallet-label">Enter an Amount</label>
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
                disabled={!fundAmount || parseFloat(fundAmount) < 200000}
                className="fund-wallet-submit-btn"
              >
                FUND WALLET
              </GradientButton>
            </form>
          </div>
        )}
      </Modal>

      {/* All Transactions Modal */}
      <Modal
        isOpen={showAllTransactions}
        onClose={() => setShowAllTransactions(false)}
        showHeader={true}
        headerTitle="All Transactions"
        className="all-transactions-modal"
      >
        <div className="all-transactions-table-container">
          <TransactionsTable expanded hideTitle transactions={transactions} />
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;
