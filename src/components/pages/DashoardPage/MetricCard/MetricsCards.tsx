import React from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import "./metriccard.css";
import BillIcon from "/icons/bill-metric-icon.svg";
import PaymentIcon from "/icons/payment-metric-icon.svg";
import CancelledIcon from "/icons/dashboard-cancelled-bookings.svg";
import PendingIcon from "/icons/dashboard-pending-bookings.svg";

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
    };
    message: string;
  } | null;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ adminStats }) => {
  const { user } = useAuth();

  // Use admin stats if available, otherwise fall back to user transaction stats
  const transactionStats = adminStats?.data?.transactionStats ||
    user?.transactionStats || {
      total: 0,
      completed: 0,
      pending: 0,
      cancelled: 0,
    };

  // Debug logging to see which data source is being used
  console.log("🔍 MetricsCards - Data Source Debug:");
  console.log("📊 Admin Stats Available:", !!adminStats);
  console.log("👤 User Transaction Stats:", user?.transactionStats);
  console.log("🎯 Final Transaction Stats Used:", transactionStats);

  const metrics = [
    {
      title: "Total Bookings",
      value: transactionStats.total.toString(),
      icon: BillIcon,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
    },
    {
      title: "Completed Bookings",
      value: transactionStats.completed.toString(),
      icon: PaymentIcon,
      color: "#10B981",
      bgColor: "#ECFDF5",
    },
    {
      title: "Cancelled Bookings",
      value: transactionStats.cancelled.toString(),
      icon: CancelledIcon,
      color: "#EF4444",
      bgColor: "#FEF2F2",
    },
    {
      title: "Pending Bookings",
      value: transactionStats.pending.toString(),
      icon: PendingIcon,
      color: "#CC52001A",
      bgColor: "#FEF3C7",
    },
  ];

  return (
    <div className="metrics-cards">
      {metrics.map((metric, index) => (
        <div key={index} className="metric-card">
          <div className="metric-header">
            <div
              className="metric-icon"
              style={{
                backgroundColor: metric.bgColor,
                color: metric.color,
              }}
            >
              <img
                src={metric.icon}
                alt={metric.title}
                width={28}
                height={28}
              />
            </div>
            <div className="metric-text">
              <span className="metric-title">{metric.title}</span>
              <div
                className={`metric-value${
                  metric.title === "Outstanding" ? " outstanding-value" : ""
                }`}
              >
                {metric.value}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;
