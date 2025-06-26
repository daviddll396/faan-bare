import React from "react";
import MetricsCards from "./MetricCard/MetricsCards";
import ChartSection from "./ChartSection/ChartSection";
import TransactionsTable from "./TransactionsTable/TransactionsTable";
import "./dashboardpage.css";
import WalletIcon from "/icons/dashboard-wallet-icon.svg";
import BorderButton from "../../reusables/BorderButton/BorderButton";
import CheckCircle from "/icons/check-circle.svg";

interface DashboardPageProps {
  role?: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ role }) => {
  const [showFundWallet, setShowFundWallet] = React.useState(false);
  const [fundAmount, setFundAmount] = React.useState("");
  const [showFundLoading, setShowFundLoading] = React.useState(false);
  const [showFundSuccess, setShowFundSuccess] = React.useState(false);

  const handleOpenFundWallet = () => setShowFundWallet(true);
  const handleCloseFundWallet = () => {
    setShowFundWallet(false);
    setFundAmount("");
    setShowFundLoading(false);
    setShowFundSuccess(false);
  };
  const handleFund = (e: React.FormEvent) => {
    e.preventDefault();
    setShowFundLoading(true);
    setTimeout(() => {
      setShowFundLoading(false);
      setShowFundSuccess(true);
    }, 1800);
  };

  return (
    <div className="dashboard-page-content">
      {role === "Customer" && (
        <div className="customer-dashboard-top">
          <div className="wallet-card">
            <div className="wallet-info">
              <img src={WalletIcon} alt="Wallet" className="wallet-icon" />
              <div>
                <div className="wallet-label">Wallet Balance</div>
                <div className="wallet-balance">₦600,000</div>
              </div>
            </div>
            <BorderButton
              text="FUND WALLET"
              className="fund-wallet-btn"
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
                    <button
                      className="fund-wallet-submit-btn"
                      onClick={handleCloseFundWallet}
                    >
                      CLOSE
                    </button>
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
                          min="0"
                          value={fundAmount}
                          onChange={(e) => setFundAmount(e.target.value)}
                          placeholder="0"
                          className="fund-wallet-input"
                          required
                        />
                      </div>
                      <button className="fund-wallet-submit-btn" type="submit">
                        FUND WALLET
                      </button>
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
