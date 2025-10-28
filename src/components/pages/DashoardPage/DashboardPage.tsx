import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { logger } from "../../../utils/logger";
import MetricsCards from "./MetricCard/MetricsCards";
import ChartSection from "./ChartSection/ChartSection";
import TransactionsTable from "./TransactionsTable/TransactionsTable";
import MessageToast from "../../reusables/MessageToast/MessageToast";
import Modal from "../../reusables/Modal/Modal";
import "./dashboardpage.css";
import WalletIcon from "/icons/dashboard-wallet-icon.svg";
import SolidButton from "../../reusables/SolidButton/SolidButton";
import CheckCircle from "/icons/check-circle.svg";
import { Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "../../reusables/LoadingSpinner/LoadingSpinner";
import DataTable from "../../reusables/DataTable/DataTable";

// ITEXPay inline types
type ItexPayOptions = {
  api_key: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  amount: number;
  redirecturl?: string;
  currency: string;
  reference: string;
  onCompleted: (data: unknown) => void;
  onError: (err: unknown) => void;
  onClose?: () => void;
};

interface ItexPayInstance {
  init: () => void;
}

interface ItexPayNS {
  ItexPay: new (opts: ItexPayOptions) => ItexPayInstance;
}

type WindowWithItex = Window & {
  ItexPayNS?: ItexPayNS;
  ITEX_PUBLIC_API_KEY?: string;
};

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
  customerName?: string;
  customerId?: string;
}

// Extended transaction shape for funding records that may include balances/references
interface FundingTransaction extends Transaction {
  reference?: string;
  paymentMethod?: string;
  method?: string;
  balanceBefore?: number;
  balanceAfter?: number;
}

const DashboardPage: React.FC<DashboardPageProps> = () => {
  const {
    user,
    fundWallet,
    getTransactionHistory,
    getAdminTransactionHistory,
    getAdminDashboardStats,
    refreshUserDetails,
  } = useAuth();
  const getTransactionHistoryRef = React.useRef(getTransactionHistory);
  const getAdminTransactionHistoryRef = React.useRef(
    getAdminTransactionHistory
  );
  const refreshUserDetailsRef = React.useRef(refreshUserDetails);
  React.useEffect(() => {
    getTransactionHistoryRef.current = getTransactionHistory;
    getAdminTransactionHistoryRef.current = getAdminTransactionHistory;
    refreshUserDetailsRef.current = refreshUserDetails;
  }, [getTransactionHistory, getAdminTransactionHistory, refreshUserDetails]);
  // On mount, fetch latest wallet amount from server
  React.useEffect(() => {
    refreshUserDetailsRef.current();
  }, []);
  const [showFundWallet, setShowFundWallet] = React.useState(false);
  const [fundAmountDisplay, setFundAmountDisplay] = React.useState("");
  const [fundAmountNum, setFundAmountNum] = React.useState<number | null>(null);
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
  const FUNDING_STORAGE_KEY = "faan_funding_records";
  const [fundingRecords, setFundingRecords] = useState<FundingTransaction[]>(
    []
  );
  const [adminStats, setAdminStats] = useState<{
    status: boolean;
    statusCode: number;
    data: {
      customerProfile: unknown | null;
      walletBalance: number | null;
      transactionStats: {
        total: number; // Total bookings/bills
        completed: number; // Completed/successful payments
        pending: number; // Pending payments
        cancelled: number; // Failed/cancelled payments
      };
    };
    message: string;
  } | null>(null);

  // Payment initialization guards
  const paymentInitializedRef = React.useRef(false);
  const hasProcessedCompletionRef = React.useRef(false);
  const [itexReady, setItexReady] = React.useState(false);

  // Dynamically load ITEXPay script once
  React.useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://checkout.itexpay.com/v1.0.0/itexpay-inline-staging-min.js";
    script.async = true;
    // Expose the VITE env key to window for the ITEX SDK to read if needed
    try {
      const envKey = (
        import.meta as unknown as { env?: { VITE_ITEX_API_KEY?: string } }
      )?.env?.VITE_ITEX_API_KEY;
      if (envKey) {
        (window as WindowWithItex).ITEX_PUBLIC_API_KEY = envKey;
        logger.debug("Payment", "ITEX API key exported to window");
      } else {
        logger.warn("Payment", "VITE_ITEX_API_KEY not set in env");
      }
    } catch (err) {
      logger.warn("Payment", "Failed to export ITEX API key", err);
    }
    let mounted = true;
    const onLoad = () => {
      if (!mounted) return;
      logger.success("Payment", "ITEXPay script loaded");
      setItexReady(true);
      // Log env key and window availability when script loads
      try {
        const envKey = (
          import.meta as unknown as { env?: { VITE_ITEX_API_KEY?: string } }
        )?.env?.VITE_ITEX_API_KEY;
        logger.debug("Payment", "ITEXPay initialized", {
          hasApiKey: !!envKey,
          hasItexPayNS: !!(window as WindowWithItex).ItexPayNS,
        });
      } catch (err) {
        logger.warn("Payment", "Could not read env at script load", err);
      }
    };
    const onError = () => {
      if (!mounted) return;
      logger.error("Payment", "Failed to load ITEXPay script");
      setItexReady(false);
    };

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);
    document.body.appendChild(script);

    return () => {
      mounted = false;
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      try {
        document.body.removeChild(script);
      } catch {
        // ignore
      }
    };
  }, []);

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
      let txns;

      // Use admin transaction history for admin users, regular history for customers
      if (user?.role === "Admin") {
        logger.info("Dashboard", "Fetching admin transaction history");
        txns = await getAdminTransactionHistoryRef.current();
      } else {
        logger.info("Dashboard", "Fetching customer transaction history");
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - 6);
        const format = (d: Date) => d.toISOString().slice(0, 10);
        txns = await getTransactionHistoryRef.current(
          format(startDate),
          format(endDate)
        );
      }

      if (txns) {
        logger.success("Dashboard", "Transactions loaded", {
          count: txns.length,
        });
        setTransactions(txns as Transaction[]);
      }
    };
    fetchTransactions();
  }, [user?.role]);

  // Load persisted funding records into state on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(FUNDING_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FundingTransaction[];
        setFundingRecords(parsed || []);
      }
    } catch (err) {
      logger.warn("Wallet", "Failed to read persisted funding records", err);
    }
  }, []);

  // Fetch admin dashboard stats for admin users
  React.useEffect(() => {
    const fetchAdminStats = async () => {
      if (user?.role === "Admin") {
        logger.info("Dashboard", "Fetching admin dashboard stats");
        const stats = await getAdminDashboardStats();
        if (stats) {
          logger.success("Dashboard", "Admin stats loaded", {
            totalBookings: stats.data.transactionStats.total,
          });
          setAdminStats(stats);
        }
      }
    };

    fetchAdminStats();
  }, [getAdminDashboardStats, user?.role]);

  // Log admin stats whenever they change
  React.useEffect(() => {
    if (adminStats && user?.role === "Admin") {
      logger.group("Dashboard", "Admin Stats Updated", () => {
        logger.info("Dashboard", "Transaction Stats", {
          total: adminStats.data.transactionStats.total,
          pending: adminStats.data.transactionStats.pending,
          completed: adminStats.data.transactionStats.completed,
          cancelled: adminStats.data.transactionStats.cancelled,
        });
        logger.info("Dashboard", "Wallet & Status", {
          walletBalance: adminStats.data.walletBalance,
          status: adminStats.status,
          statusCode: adminStats.statusCode,
          message: adminStats.message,
        });
      });
    }
  }, [adminStats, user?.role]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({
      message,
      type,
      isVisible: true,
    });
  };

  // Format numeric input with commas for display (e.g. 300000 -> "300,000")
  const formatNumberInput = (raw: string) => {
    const digits = String(raw).replace(/\D/g, "");
    if (!digits) return "";
    return Number(digits).toLocaleString("en-US");
  };

  const parseAmount = (formatted: string) => {
    const n = Number(String(formatted).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  // Generate a cryptographically-strong unique payment reference for ITEXPay
  const generatePaymentReference = (): string => {
    try {
      // Access the browser crypto API with a typed local variable to avoid `any`
      const webCrypto =
        typeof crypto !== "undefined"
          ? (crypto as Crypto & { randomUUID?: () => string })
          : undefined;

      // Prefer native UUID if available (modern browsers)
      if (webCrypto && typeof webCrypto.randomUUID === "function") {
        return `itex-${webCrypto.randomUUID()}`;
      }

      // Fallback to secure random bytes
      if (webCrypto && typeof webCrypto.getRandomValues === "function") {
        const arr = new Uint8Array(8);
        webCrypto.getRandomValues(arr);
        const hex = Array.from(arr)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        return `itex-${Date.now()}-${hex}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;
      }
    } catch {
      // ignore and fallback to timestamp+random
    }

    return `itex-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  };

  const handleOpenFundWallet = () => setShowFundWallet(true);
  const handleCloseFundWallet = () => {
    setShowFundWallet(false);
    setFundAmountDisplay("");
    setFundAmountNum(null);
    setShowFundLoading(false);
    setShowFundSuccess(false);
  };

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get minimum amount based on customer type
    const getMinimumAmount = () => {
      const customerType = user?.customerType;
      if (customerType === "INDIVIDUAL") {
        return 25000;
      } else if (customerType === "CORPORATE") {
        return 200000;
      }
      // Default fallback
      return 200000;
    };

    const minimumAmount = getMinimumAmount();
    const amount = fundAmountNum ?? parseAmount(fundAmountDisplay);
    if (!amount || amount < minimumAmount) {
      const formattedMin = minimumAmount.toLocaleString();
      showToast(`Minimum fundable amount is ₦${formattedMin}`, "error");
      return;
    }

    setShowFundLoading(true);
    // Close the modal when loading starts
    setShowFundWallet(false);

    try {
      // Prevent multiple payment windows
      if (paymentInitializedRef.current) {
        logger.warn(
          "Payment",
          "Payment already initialized, ignoring duplicate"
        );
        return;
      }

      // Log environment & readiness before attempting init
      try {
        const envKeyNow = (
          import.meta as unknown as { env?: { VITE_ITEX_API_KEY?: string } }
        )?.env?.VITE_ITEX_API_KEY;
        logger.debug("Payment", "Attempting ITEXPay init", {
          itexReady,
          hasApiKey: !!envKeyNow,
          hasItexPayNS: !!(window as WindowWithItex).ItexPayNS,
        });
      } catch (err) {
        logger.warn("Payment", "Could not read import.meta.env", err);
      }

      // Use ITEXPay inline checkout if available
      const win = window as WindowWithItex;
      const itexAvailable = !!(win && win.ItexPayNS);
      if (itexAvailable) {
        paymentInitializedRef.current = true;
        hasProcessedCompletionRef.current = false;
        if (!itexReady) {
          logger.warn(
            "Payment",
            "ITEXPay script not yet ready, waiting for load"
          );
        }

        const reference = generatePaymentReference();
        // NOTE: API key hardcoded for testing per request
        const apiKey =
          "ITXPUB_STAGING_N9OSLGOKR2WT6KNKMRPHI0TNDZF3FEMCFDUO2PFN-6011000252-04GPRVVTV0CPUVD";
        logger.debug("Payment", "Using ITEX API key: [REDACTED]");
        if (!apiKey) {
          logger.error("Payment", "ITEX API key is missing");
          setShowFundLoading(false);
          paymentInitializedRef.current = false;
          setShowFundWallet(true);
          showToast("Payment unavailable: missing API key.", "error");
          return;
        }

        // Validate required fields for ITEXPay
        const firstName = user?.firstName || "Customer";
        const lastName = user?.lastName || "User";
        const phoneNumber = user?.phoneNumber || "";
        const email = user?.email || "";

        // Check if we have minimum required information
        if (!firstName || !lastName || !phoneNumber || !email) {
          logger.error("Payment", "Missing required user information", {
            hasFirstName: !!firstName,
            hasLastName: !!lastName,
            hasPhone: !!phoneNumber,
            hasEmail: !!email,
          });
          setShowFundLoading(false);
          paymentInitializedRef.current = false;
          setShowFundWallet(true);
          showToast(
            "Please complete your profile information before funding wallet.",
            "error"
          );
          return;
        }

        const Pay = new win.ItexPayNS!.ItexPay({
          api_key: apiKey,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          email: email,
          amount: Math.round(amount),
          // redirecturl: window.location.origin + "/",
          currency: "NGN",
          reference,
          onCompleted: async (data: unknown) => {
            logger.success("Payment", "ITEXPay payment completed", data);
            if (hasProcessedCompletionRef.current) {
              logger.warn("Payment", "Duplicate completion trigger, ignoring");
              return;
            }
            hasProcessedCompletionRef.current = true;

            // Call backend to record the successful fund (include provider response)
            logger.info("Wallet", "Recording fund wallet transaction");
            const result = await fundWallet(amount, reference, data);
            setShowFundLoading(false);
            paymentInitializedRef.current = false;
            if (result) {
              setShowFundSuccess(true);
              setShowFundWallet(true);
              showToast("Wallet funded successfully!", "success");
              // Sync wallet from server to ensure accurate balance
              try {
                await refreshUserDetailsRef.current();
              } catch {
                // Ignore refresh errors - wallet balance will be updated on next page load
              }
              // Persist funding record locally so it shows up in Recent Funding Records
              try {
                const stored = localStorage.getItem(FUNDING_STORAGE_KEY);
                const existing: FundingTransaction[] = stored
                  ? JSON.parse(stored)
                  : [];
                const now = new Date().toISOString();
                const record: FundingTransaction = {
                  id: Date.now(),
                  reference,
                  paymentMethod: "ITEXPay",
                  method: "ITEXPay",
                  amount: Math.round(amount),
                  balanceBefore: localWalletBalance,
                  balanceAfter: localWalletBalance + Math.round(amount),
                  createdAt: now,
                };
                const updated = [record, ...existing].slice(0, 50); // keep recent 50
                localStorage.setItem(
                  FUNDING_STORAGE_KEY,
                  JSON.stringify(updated)
                );
                // update fundingRecords state so Recent Funding Records table updates
                setFundingRecords((prev) => [record, ...prev].slice(0, 50));
                // local wallet balance will be refreshed from server via refreshUserDetails
              } catch (err) {
                logger.warn("Wallet", "Failed to persist funding record", err);
              }
            } else {
              setShowFundWallet(true);
              showToast("Failed to record funding on server.", "error");
            }
          },
          onError: (err: unknown) => {
            logger.error("Payment", "ITEXPay error", err);
            setShowFundLoading(false);
            paymentInitializedRef.current = false;
            setShowFundWallet(true);
            showToast("Payment failed or was cancelled.", "error");
          },
          onClose: () => {
            logger.info("Payment", "ITEXPay closed by user");
            setShowFundLoading(false);
            paymentInitializedRef.current = false;
            setShowFundWallet(true);
          },
        });

        try {
          Pay.init();
        } catch (err) {
          logger.error("Payment", "Failed to init ITEXPay", err);
          setShowFundLoading(false);
          paymentInitializedRef.current = false;
          setShowFundWallet(true);
          showToast(
            "Payment system unavailable. Please try again later.",
            "error"
          );
        }
      } else {
        // Fallback: call backend fundWallet directly (useful for testing without ITEX)
        const success = await fundWallet(amount);

        if (success) {
          setShowFundLoading(false);
          setShowFundSuccess(true);
          // Reopen modal to show success state
          setShowFundWallet(true);
          showToast("Wallet funded successfully!", "success");
          // Persist funding record locally for fallback path as well
          try {
            const referenceFallback = `fund-${Date.now()}-fallback`;
            const stored = localStorage.getItem(FUNDING_STORAGE_KEY);
            const existing: FundingTransaction[] = stored
              ? JSON.parse(stored)
              : [];
            const now = new Date().toISOString();
            const record: FundingTransaction = {
              id: Date.now(),
              reference: referenceFallback,
              paymentMethod: "BACKEND",
              method: "BACKEND",
              amount: Math.round(amount),
              balanceBefore: localWalletBalance,
              balanceAfter: localWalletBalance + Math.round(amount),
              createdAt: now,
            };
            const updated = [record, ...existing].slice(0, 50);
            localStorage.setItem(FUNDING_STORAGE_KEY, JSON.stringify(updated));
            setTransactions((prev) => [record as Transaction, ...prev]);
            // local wallet balance will be refreshed from server via refreshUserDetails
          } catch (err) {
            logger.warn(
              "Wallet",
              "Failed to persist fallback funding record",
              err
            );
          }
        } else {
          setShowFundLoading(false);
          // Reopen modal to show error state
          setShowFundWallet(true);
          showToast("Failed to fund wallet. Please try again.", "error");
        }
      }
    } catch (error) {
      logger.error("Wallet", "Fund wallet error", error);
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

      {user?.role === "Customer" && (
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
            <SolidButton
              text="FUND WALLET"
              onClick={handleOpenFundWallet}
              size="medium"
              variant="primary"
            />
          </div>
        </div>
      )}
      {!showAllTransactions ? (
        <>
          <MetricsCards adminStats={adminStats} />
          <div className="dashboard-bottom-grid">
            <ChartSection adminStats={adminStats} transactions={transactions} />
            <TransactionsTable
              onSeeAll={() => setShowAllTransactions(true)}
              transactions={transactions}
            />
          </div>
          {/* Funding records section - shows recent wallet funding attempts */}
          <div className="funding-records-section">
            <DataTable
              header="Recent Funding Records"
              headers={
                user?.role === "Admin"
                  ? [
                      "Reference",
                      "Customer ID",
                      "Method",
                      "Amount",
                      "Balance Before",
                      "Balance After",
                      "Date",
                    ]
                  : [
                      "Reference",
                      "Method",
                      "Amount",
                      "Balance Before",
                      "Balance After",
                      "Date",
                    ]
              }
              data={fundingRecords.map((tx) =>
                user?.role === "Admin"
                  ? [
                      tx.reference || `TX-${tx.id}`,
                      tx.customerId || "-",
                      tx.paymentMethod || tx.method || "ITEX/OTHER",
                      tx.amount
                        ? `₦${tx.amount.toLocaleString()}`
                        : tx.price || "-",
                      typeof tx.balanceBefore === "number"
                        ? `₦${tx.balanceBefore.toLocaleString()}`
                        : "-",
                      typeof tx.balanceAfter === "number"
                        ? `₦${tx.balanceAfter.toLocaleString()}`
                        : "-",
                      tx.createdAt
                        ? new Date(tx.createdAt).toLocaleString()
                        : "-",
                    ]
                  : [
                      tx.reference || `TX-${tx.id}`,
                      tx.paymentMethod || tx.method || "ITEX/OTHER",
                      tx.amount
                        ? `₦${tx.amount.toLocaleString()}`
                        : tx.price || "-",
                      typeof tx.balanceBefore === "number"
                        ? `₦${tx.balanceBefore.toLocaleString()}`
                        : "-",
                      typeof tx.balanceAfter === "number"
                        ? `₦${tx.balanceAfter.toLocaleString()}`
                        : "-",
                      tx.createdAt
                        ? new Date(tx.createdAt).toLocaleString()
                        : "-",
                    ]
              )}
              className="funding-records-table"
            />
          </div>
        </>
      ) : (
        <div className="all-transactions-page">
          <div className="all-transactions-header">
            <SolidButton
              text="Back to Dashboard"
              onClick={() => setShowAllTransactions(false)}
              className="back-to-dashboard-btn"
              variant="secondary"
              size="medium"
            />
          </div>
          <DataTable
            header="All Transactions"
            headers={
              user?.role === "Admin"
                ? ["ID", "Customer ID", "Service", "Amount", "Status", "Date"]
                : ["ID", "Service", "Amount", "Status", "Date"]
            }
            data={transactions.map((txn) => {
              const baseData = [
                txn.id,
                txn.tariffName || txn.service || "N/A",
                txn.amount
                  ? `₦${txn.amount.toLocaleString()}`
                  : txn.price || "N/A",
                <span
                  key="status"
                  className={`status-badge ${
                    txn.status?.toLowerCase() || "pending"
                  }`}
                >
                  {txn.status || "PENDING"}
                </span>,
                txn.createdAt
                  ? new Date(txn.createdAt).toLocaleDateString()
                  : "N/A",
              ];

              // Insert customer name after ID for admin users
              if (user?.role === "Admin") {
                baseData.splice(
                  1,
                  0,
                  txn.customerName || txn.customerId || "Unknown Customer"
                );
              }

              return baseData;
            })}
            className="all-transactions-table"
          />
        </div>
      )}

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
            <SolidButton
              text="CLOSE"
              onClick={handleCloseFundWallet}
              fullWidth
            />
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
                  type="text"
                  value={fundAmountDisplay}
                  onChange={(e) => {
                    const digits = String(e.target.value).replace(/\D/g, "");
                    setFundAmountNum(digits ? Number(digits) : null);
                    setFundAmountDisplay(formatNumberInput(e.target.value));
                  }}
                  placeholder={
                    user?.customerType === "INDIVIDUAL" ? "25,000" : "200,000"
                  }
                  className="fund-wallet-input"
                  required
                />
              </div>
              <SolidButton
                text="FUND WALLET"
                type="submit"
                fullWidth
                disabled={
                  !fundAmountNum ||
                  (fundAmountNum ?? 0) <
                    (user?.customerType === "INDIVIDUAL" ? 25000 : 200000)
                }
              />
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardPage;
