import React from "react";
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

interface DashboardPageProps {
  role?: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ role }) => {
  const { user, fundWallet } = useAuth();
  const [showFundWallet, setShowFundWallet] = React.useState(false);
  const [fundAmount, setFundAmount] = React.useState("");
  const [showFundLoading, setShowFundLoading] = React.useState(false);
  const [showFundSuccess, setShowFundSuccess] = React.useState(false);
  const [toast, setToast] = React.useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  // Use wallet balance from user data, fallback to 0
  const walletBalance = user?.walletBalance || 0;
  const [localWalletBalance, setLocalWalletBalance] =
    React.useState(walletBalance);

  // Update local wallet balance when user data changes
  React.useEffect(() => {
    setLocalWalletBalance(walletBalance);
  }, [walletBalance]);

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
                <div className="wallet-balance">
                  ₦{localWalletBalance.toLocaleString()}
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
        <TransactionsTable />
      </div>
    </div>
  );
};

export default DashboardPage;
