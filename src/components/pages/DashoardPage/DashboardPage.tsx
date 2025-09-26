import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import MetricsCards from "./MetricCard/MetricsCards";
import ChartSection from "./ChartSection/ChartSection";
import TransactionsTable from "./TransactionsTable/TransactionsTable";
import MessageToast from "../../reusables/MessageToast/MessageToast";
import Modal from "../../reusables/Modal/Modal";
import "./dashboardpage.css";
import WalletIcon from "/icons/dashboard-wallet-icon.svg";
import SolidButton from "../../reusables/SolidButton/SolidButton";
import CheckCircle from "/icons/check-circle.svg";
import GradientButton from "../../reusables/GradientButton/GradientButton";
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

const DashboardPage: React.FC<DashboardPageProps> = ({ role }) => {
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
        console.log("Exported VITE_ITEX_API_KEY to window.ITEX_PUBLIC_API_KEY");
      } else {
        console.warn("VITE_ITEX_API_KEY not set in import.meta.env");
      }
    } catch (err) {
      console.warn("Failed to export VITE_ITEX_API_KEY to window", err);
    }
    let mounted = true;
    const onLoad = () => {
      if (!mounted) return;
      console.log("ITEXPay script loaded");
      setItexReady(true);
      // Log env key and window availability when script loads
      try {
        const envKey = (
          import.meta as unknown as { env?: { VITE_ITEX_API_KEY?: string } }
        )?.env?.VITE_ITEX_API_KEY;
        console.log("VITE_ITEX_API_KEY (env) on script load:", envKey);
        console.log(
          "window.ItexPayNS present:",
          !!(window as WindowWithItex).ItexPayNS
        );
      } catch (err) {
        console.warn("Could not read import.meta.env at script load", err);
      }
    };
    const onError = () => {
      if (!mounted) return;
      console.error("Failed to load ITEXPay script");
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
        console.log(
          "🔐 Admin user detected, fetching admin transaction history for dashboard"
        );
        txns = await getAdminTransactionHistoryRef.current();
      } else {
        console.log(
          "👤 Customer user detected, fetching regular transaction history for dashboard"
        );
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
        console.log("📄 Raw transaction data for dashboard:", txns);
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
      console.warn("Failed to read persisted funding records:", err);
    }
  }, []);

  // Fetch admin dashboard stats for admin users
  React.useEffect(() => {
    const fetchAdminStats = async () => {
      if (user?.role === "Admin") {
        console.log("🔐 Admin user detected, fetching dashboard stats");
        const stats = await getAdminDashboardStats();
        if (stats) {
          console.log("📊 Admin dashboard stats received:", stats);
          setAdminStats(stats);
        }
      }
    };

    fetchAdminStats();
  }, [getAdminDashboardStats, user?.role]);

  // Log admin stats whenever they change
  React.useEffect(() => {
    if (adminStats && user?.role === "Admin") {
      console.log("🎯 === ADMIN DASHBOARD STATS UPDATED ===");
      console.log("📊 Current Admin Stats:", adminStats);
      console.log(
        "📋 Total Bookings/Bills:",
        adminStats.data.transactionStats.total
      );
      console.log(
        "⏳ Pending Bookings/Bills:",
        adminStats.data.transactionStats.pending
      );
      console.log(
        "✅ Completed Bookings/Bills:",
        adminStats.data.transactionStats.completed
      );
      console.log(
        "❌ Cancelled Bookings/Bills:",
        adminStats.data.transactionStats.cancelled
      );
      console.log("💰 Wallet Balance:", adminStats.data.walletBalance);
      console.log("👤 Customer Profile:", adminStats.data.customerProfile);
      console.log("📋 API Status:", adminStats.status);
      console.log("🔢 Status Code:", adminStats.statusCode);
      console.log("💬 Message:", adminStats.message);

      // Additional context for clarity
      console.log("📊 === BOOKING & PAYMENT STATISTICS ===");
      console.log("🎫 Total Bookings:", adminStats.data.transactionStats.total);
      console.log("💳 Total Bills:", adminStats.data.transactionStats.total);
      console.log(
        "✅ Successful Payments:",
        adminStats.data.transactionStats.completed
      );
      console.log(
        "⏳ Pending Payments:",
        adminStats.data.transactionStats.pending
      );
      console.log(
        "❌ Failed/Cancelled Payments:",
        adminStats.data.transactionStats.cancelled
      );
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

    // Validate minimum amount
    const amount = fundAmountNum ?? parseAmount(fundAmountDisplay);
    if (!amount || amount < 200000) {
      showToast("Minimum fundable amount is ₦200,000", "error");
      return;
    }

    setShowFundLoading(true);
    // Close the modal when loading starts
    setShowFundWallet(false);

    try {
      // Prevent multiple payment windows
      if (paymentInitializedRef.current) {
        console.log("Payment already initialized, ignoring duplicate request");
        return;
      }

      // Log environment & readiness before attempting init
      try {
        const envKeyNow = (
          import.meta as unknown as { env?: { VITE_ITEX_API_KEY?: string } }
        )?.env?.VITE_ITEX_API_KEY;
        console.log(
          "Attempting ITEXPay init - itexReady:",
          itexReady,
          "envKey:",
          envKeyNow
        );
        console.log(
          "window.ItexPayNS present:",
          !!(window as WindowWithItex).ItexPayNS
        );
      } catch (err) {
        console.warn("Could not read import.meta.env", err);
      }

      // Use ITEXPay inline checkout if available
      const win = window as WindowWithItex;
      const itexAvailable = !!(win && win.ItexPayNS);
      if (itexAvailable) {
        paymentInitializedRef.current = true;
        hasProcessedCompletionRef.current = false;
        if (!itexReady) {
          console.log(
            "ITEXPay available but script not yet ready — waiting for load event."
          );
        }

        const reference = generatePaymentReference();
        // NOTE: API key hardcoded for testing per request
        const apiKey =
          "ITXPUB_STAGING_N9OSLGOKR2WT6KNKMRPHI0TNDZF3FEMCFDUO2PFN-6011000252-04GPRVVTV0CPUVD";
        console.log("Using ITEX API key: [REDACTED]");
        if (!apiKey) {
          console.error(
            "ITEX API key is missing. Set VITE_ITEX_API_KEY and restart dev server."
          );
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
          console.error("Missing required user information for ITEXPay:", {
            firstName,
            lastName,
            phoneNumber,
            email,
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
            console.log("ITEXPay success data:", data);
            if (hasProcessedCompletionRef.current) {
              console.log(
                "Payment completion already processed, ignoring duplicate trigger"
              );
              return;
            }
            hasProcessedCompletionRef.current = true;

            // Call backend to record the successful fund (include provider response)
            console.log("Calling fundWallet with provider response", data);
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
              } catch {}
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
                // also update local wallet balance optimistically
                setLocalWalletBalance((b) => b + Math.round(amount));
              } catch (err) {
                console.warn("Failed to persist funding record locally", err);
              }
            } else {
              setShowFundWallet(true);
              showToast("Failed to record funding on server.", "error");
            }
          },
          onError: (err: unknown) => {
            console.error("ITEXPay error:", err);
            setShowFundLoading(false);
            paymentInitializedRef.current = false;
            setShowFundWallet(true);
            showToast("Payment failed or was cancelled.", "error");
          },
          onClose: () => {
            console.log("ITEXPay closed by user");
            setShowFundLoading(false);
            paymentInitializedRef.current = false;
            setShowFundWallet(true);
          },
        });

        try {
          Pay.init();
        } catch (err) {
          console.error("Failed to init ITEXPay:", err);
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
            setLocalWalletBalance((b) => b + Math.round(amount));
          } catch (err) {
            console.warn("Failed to persist fallback funding record:", err);
          }
        } else {
          setShowFundLoading(false);
          // Reopen modal to show error state
          setShowFundWallet(true);
          showToast("Failed to fund wallet. Please try again.", "error");
        }
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
            <ChartSection adminStats={adminStats} />
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
                  type="text"
                  value={fundAmountDisplay}
                  onChange={(e) => {
                    const digits = String(e.target.value).replace(/\D/g, "");
                    setFundAmountNum(digits ? Number(digits) : null);
                    setFundAmountDisplay(formatNumberInput(e.target.value));
                  }}
                  placeholder="200,000"
                  className="fund-wallet-input"
                  required
                />
              </div>
              <GradientButton
                type="submit"
                fullWidth
                disabled={!fundAmountNum || (fundAmountNum ?? 0) < 200000}
                className="fund-wallet-submit-btn"
              >
                FUND WALLET
              </GradientButton>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardPage;
