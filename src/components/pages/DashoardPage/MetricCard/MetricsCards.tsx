import React from "react";

import "./metriccard.css";
import BillIcon from "/icons/bill-metric-icon.svg";
import PaymentIcon from "/icons/payment-metric-icon.svg";
import CancelledIcon from "/icons/dashboard-cancelled-bookings.svg";
import PendingIcon from "/icons/dashboard-pending-bookings.svg";

const MetricsCards: React.FC = () => {
  const metrics = [
    {
      title: "Total Bookings",
      value: "50",
      icon: BillIcon,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
    },
    {
      title: "Completed Bookings",
      value: "47",
      icon: PaymentIcon,
      color: "#10B981",
      bgColor: "#ECFDF5",
    },
    {
      title: "Cancelled Bookings",
      value: "1",
      icon: CancelledIcon,
      color: "#EF4444",
      bgColor: "#FEF2F2",
    },
    {
      title: "Pending Bookings",
      value: "2",
      icon: PendingIcon,
      color: "#8B5CF6",
      bgColor: "#F3E8FF",
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
