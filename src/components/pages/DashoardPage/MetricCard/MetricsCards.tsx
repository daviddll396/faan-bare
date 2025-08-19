import React from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import "./metriccard.css";
import BillIcon from "/icons/bill-metric-icon.svg";
import PaymentIcon from "/icons/payment-metric-icon.svg";
import CancelledIcon from "/icons/dashboard-cancelled-bookings.svg";
import PendingIcon from "/icons/dashboard-pending-bookings.svg";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricsCardsProps {
  adminStats?: {
    status: boolean;
    statusCode: number;
    data: {
      customerProfile: unknown | null;
      walletBalance: number | null;
      transactionStats: {
        total: number;
        completed: number;
        pending: number;
        cancelled: number;
      };
      // optional previous month stats (if backend provides them)
      previousTransactionStats?: {
        total: number;
        completed: number;
        pending: number;
        cancelled: number;
      };
    };
    message: string;
  } | null;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ adminStats }) => {
  const { user, getTransactionHistory } = useAuth();

  // convert hex color to rgba string with alpha
  const hexToRgba = (hex?: string, alpha = 0.08) => {
    if (!hex || typeof hex !== "string") return `rgba(16,24,40,${alpha})`;
    // normalize: allow '#RRGGBB' or '#RRGGBBAA'
    const cleaned = hex.trim();
    const m = cleaned.match(/^#?([a-fA-F0-9]{6})([a-fA-F0-9]{2})?$/);
    if (!m) return `rgba(16,24,40,${alpha})`;
    const hex6 = m[1];
    const r = parseInt(hex6.slice(0, 2), 16);
    const g = parseInt(hex6.slice(2, 4), 16);
    const b = parseInt(hex6.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  // Known counts shape
  type Counts = {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  };

  // prevStats may be populated if backend returns previous month stats
  // kept for potential future use
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [prevStats, setPrevStats] = React.useState<Counts | null>(null);
  /* eslint-enable @typescript-eslint/no-unused-vars */

  // Current and previous month computed counts (preferred source for comparisons)
  const [monthCounts, setMonthCounts] = React.useState<{
    current: Counts;
    prev: Counts;
  } | null>(null);

  // Minimal local transaction shape used for counting
  type Txn = { status?: string };

  // Fetch previous month counts if backend didn't provide them
  React.useEffect(() => {
    let mounted = true;
    const fetchPrev = async () => {
      try {
        const provided = adminStats?.data?.previousTransactionStats;
        if (provided) {
          if (mounted) setPrevStats(provided);
          return;
        }

        if (!getTransactionHistory) return;
        const now = new Date();
        const end = new Date(now.getFullYear(), now.getMonth(), 0); // last day previous month
        const start = new Date(end.getFullYear(), end.getMonth(), 1); // first day previous month
        const format = (d: Date) => d.toISOString().slice(0, 10);
        const txns = await getTransactionHistory(format(start), format(end));
        if (!mounted) return;
        if (Array.isArray(txns)) {
          const total = txns.length;
          const completed = txns.filter(
            (x: Txn) => (x.status || "").toUpperCase() === "COMPLETED"
          ).length;
          const pending = txns.filter(
            (x: Txn) => (x.status || "").toUpperCase() === "PENDING"
          ).length;
          const cancelled = txns.filter(
            (x: Txn) => (x.status || "").toUpperCase() === "CANCELLED"
          ).length;
          setPrevStats({ total, completed, pending, cancelled });
        }
      } catch (err) {
        console.warn("MetricsCards: failed to fetch previous month stats", err);
      }
    };
    fetchPrev();

    // Also fetch current month counts and previous month counts for accurate comparisons
    const fetchMonthCounts = async () => {
      try {
        if (!getTransactionHistory) return;
        const now = new Date();
        const currStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const format = (d: Date) => d.toISOString().slice(0, 10);

        const [currTxns, prevTxns] = await Promise.all([
          getTransactionHistory(format(currStart), format(currEnd)),
          getTransactionHistory(format(prevStart), format(prevEnd)),
        ]);

        if (!mounted) return;
        const buildCounts = (txns: Txn[] | null) => {
          if (!Array.isArray(txns))
            return { total: 0, completed: 0, pending: 0, cancelled: 0 };
          const total = txns.length;
          const completed = txns.filter(
            (x: Txn) => (x.status || "").toUpperCase() === "COMPLETED"
          ).length;
          const pending = txns.filter(
            (x: Txn) => (x.status || "").toUpperCase() === "PENDING"
          ).length;
          const cancelled = txns.filter(
            (x: Txn) => (x.status || "").toUpperCase() === "CANCELLED"
          ).length;
          return { total, completed, pending, cancelled };
        };

        const currentCounts = buildCounts(currTxns as Txn[] | null);
        const previousCounts = buildCounts(prevTxns as Txn[] | null);
        setMonthCounts({ current: currentCounts, prev: previousCounts });
      } catch (err) {
        console.warn("MetricsCards: failed to fetch month counts", err);
      }
    };
    fetchMonthCounts();
    return () => {
      mounted = false;
    };
  }, [adminStats, getTransactionHistory]);

  // Determine whether monthCounts has meaningful data (non-zero)
  const defaultStats = { total: 0, completed: 0, pending: 0, cancelled: 0 };
  const monthHasData =
    !!monthCounts &&
    Object.values(monthCounts.current || {}).some(
      (v) => typeof v === "number" && v > 0
    );
  const monthPrevHasData =
    !!monthCounts &&
    Object.values(monthCounts.prev || {}).some(
      (v) => typeof v === "number" && v > 0
    );

  const effectiveCurrent = monthHasData
    ? monthCounts!.current
    : adminStats?.data?.transactionStats ||
      user?.transactionStats ||
      defaultStats;

  // We don't use previous month values (per request we treat last month as 0),
  // but keep the computation here commented for future reference.
  // const effectivePrev = monthPrevHasData
  //   ? monthCounts!.prev
  //   : adminStats?.data?.previousTransactionStats || prevStats || defaultStats;

  // Debug logging to see which data source is being used
  console.log("🔍 MetricsCards - Data Source Debug:");
  console.log("📊 Admin Stats Available:", !!adminStats);
  console.log("👤 User Transaction Stats:", user?.transactionStats);
  console.log("🎯 Using monthCounts for current:", monthHasData);
  console.log("🎯 Using monthCounts for prev:", monthPrevHasData);

  const metrics = [
    {
      key: "total",
      title: "Total Bookings",
      icon: BillIcon,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
    },
    {
      key: "completed",
      title: "Completed Bookings",
      icon: PaymentIcon,
      color: "#10B981",
      bgColor: "#ECFDF5",
    },
    {
      key: "cancelled",
      title: "Cancelled/Abandoned Bookings",
      icon: CancelledIcon,
      color: "#EF4444",
      bgColor: "#FEF2F2",
    },
    {
      key: "pending",
      title: "Pending Bookings",
      icon: PendingIcon,
      color: "#CC52001A",
      bgColor: "#FEF3C7",
    },
  ];

  // Helper to get numeric stat value by key
  const getStatValue = (key: string): number => {
    const stats = (adminStats &&
      adminStats.data &&
      adminStats.data.transactionStats) ||
      user?.transactionStats || {
        total: 0,
        completed: 0,
        pending: 0,
        cancelled: 0,
      };
    switch (key) {
      case "total":
        return stats.total || 0;
      case "completed":
        return stats.completed || 0;
      case "pending":
        return stats.pending || 0;
      case "cancelled":
        return stats.cancelled || 0;
      default:
        return 0;
    }
  };

  // NOTE: differences are computed as (current month) - (previous month)

  return (
    <div className="metrics-cards">
      {metrics.map((metric, index) => {
        // current value (prefer computed current month)
        const mk = metric.key as keyof Counts;
        const val =
          effectiveCurrent && typeof effectiveCurrent[mk] === "number"
            ? (effectiveCurrent[mk] as number)
            : getStatValue(metric.key);

        // previous month value: treat last month as 0 for all metrics per request
        const prevValue = 0;

        // signed difference: current - previous
        const diffSigned = val - prevValue;
        const increase = diffSigned > 0;
        const cls =
          diffSigned === 0 ? "neutral" : increase ? "positive" : "negative";

        return (
          <div
            key={index}
            className="metric-card"
            style={{
              boxShadow: `0 10px 30px ${hexToRgba(metric.color, 0.08)}`,
            }}
          >
            <div className="metric-card-top">
              <div className="metric-card-title">{metric.title}</div>
              <div
                className="metric-card-icon"
                style={{ backgroundColor: metric.bgColor }}
                aria-hidden
              >
                <img
                  src={metric.icon}
                  alt={metric.title}
                  width={28}
                  height={28}
                />
              </div>
            </div>

            <div className="metric-card-value">{val.toLocaleString()}</div>

            <div className="metric-card-foot">
              <div className={`metric-trend-badge ${cls}`}>
                {diffSigned === 0 ? (
                  <Minus size={12} />
                ) : increase ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}
              </div>
              <span className={`metric-trend-text ${cls}`}>{`${
                diffSigned > 0 ? "+" : ""
              }${diffSigned} vs last month`}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsCards;
