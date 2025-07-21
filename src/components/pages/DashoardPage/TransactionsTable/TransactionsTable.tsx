import React from "react";

import "./transactionstable.css";
import AirplaneIcon from "/icons/airplane-icon.svg";

interface TransactionsTableProps {
  onSeeAll?: () => void;
  expanded?: boolean;
  hideTitle?: boolean;
  transactions?: Array<{
    id: number;
    tariffName?: string;
    service?: string;
    amount?: number;
    price?: string;
    status?: string;
    createdAt?: string;
  }>;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  onSeeAll,
  expanded,
  hideTitle,
  transactions,
}) => {
  const dummyTransactions = [
    {
      id: 1,
      service: "International Arrival",
      price: "₦50,000",
      status: "COMPLETED",
      createdAt: "2024-01-01T10:00:00",
    },
    {
      id: 2,
      service: "International Departure",
      price: "₦50,000",
      status: "PENDING",
      createdAt: "2024-01-02T11:00:00",
    },
    {
      id: 3,
      service: "Domestic Arrival",
      price: "₦50,000",
      status: "COMPLETED",
      createdAt: "2024-01-03T12:00:00",
    },
    {
      id: 4,
      service: "Prootocol Lounge PH.",
      price: "₦50,000",
      status: "CANCELLED",
      createdAt: "2024-01-04T13:00:00",
    },
    {
      id: 5,
      service: "Abuja International Oneoff",
      price: "₦50,000",
      status: "COMPLETED",
      createdAt: "2024-01-05T14:00:00",
    },
    {
      id: 6,
      service: "Protocol Car Park PH.",
      price: "₦50,000",
      status: "PENDING",
      createdAt: "2024-01-06T15:00:00",
    },
    {
      id: 7,
      service: "Port Harcourt Domestic Service",
      price: "₦50,000",
      status: "COMPLETED",
      createdAt: "2024-01-07T16:00:00",
    },
    {
      id: 8,
      service: "Abuja Domestic Service",
      price: "₦50,000",
      status: "CANCELLED",
      createdAt: "2024-01-08T17:00:00",
    },
  ];
  const hasRealData = transactions && transactions.length > 0;
  const visibleTransactions = hasRealData
    ? expanded
      ? transactions
      : transactions.slice(0, 5)
    : expanded
    ? dummyTransactions
    : dummyTransactions.slice(0, 5);
  const showStatusAndDate = hasRealData && expanded;

  // Helper to truncate service name
  const truncate = (str: string, n: number) =>
    str.length > n ? str.slice(0, n - 1) + "..." : str;

  // Helper to get service name safely
  const getServiceName = (transaction: any) => {
    return transaction.tariffName || transaction.service || "";
  };

  // Helper to get amount safely
  const getAmount = (transaction: any) => {
    if (hasRealData && transaction.amount) {
      return `₦${transaction.amount.toLocaleString()}`;
    }
    return transaction.price || "";
  };

  return (
    <div
      className={`transactions-table${hideTitle ? " no-top-padding" : ""}${
        expanded ? " expanded" : ""
      }`}
    >
      <div className="table-header">
        {!hideTitle && (
          <div className="table-title">
            <h3>Recent Transactions</h3>
          </div>
        )}
        {!expanded && (
          <button className="see-all-btn" onClick={onSeeAll}>
            See All
          </button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="table-container desktop-only">
        <table>
          <colgroup>
            <col style={{ width: "6%" }} />
            <col style={{ width: "6%" }} />
            <col style={{ width: hasRealData ? "30%" : "50%" }} />
            <col style={{ width: "6%" }} />
            <col style={{ width: hasRealData ? "20%" : "30%" }} />
            {showStatusAndDate && <col style={{ width: "18%" }} />}
            {showStatusAndDate && <col style={{ width: "20%" }} />}
          </colgroup>
          <thead>
            <tr>
              <th>#</th>
              <th className="gap-col"></th>
              <th>Service</th>
              <th className="gap-col"></th>
              <th>{hasRealData ? "Amount" : "Price"}</th>
              {showStatusAndDate && <th>Status</th>}
              {showStatusAndDate && <th>Date</th>}
            </tr>
          </thead>
          <tbody>
            {visibleTransactions.map((transaction, index) => (
              <tr key={transaction.id}>
                <td className="centered-col">{index + 1}.</td>
                <td className="gap-col"></td>
                <td>
                  <div className="service-cell">
                    <img
                      className="transaction-icon"
                      src={AirplaneIcon}
                      alt="Petrol"
                      width={24}
                      height={24}
                    />
                    {expanded ? (
                      <span>{getServiceName(transaction)}</span>
                    ) : (
                      <span title={getServiceName(transaction)}>
                        {truncate(getServiceName(transaction), 24)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="gap-col"></td>
                <td>{getAmount(transaction)}</td>
                {showStatusAndDate && (
                  <>
                    <td>
                      <span
                        style={{
                          color:
                            (transaction.status || "") === "COMPLETED"
                              ? "#007948"
                              : (transaction.status || "") === "PENDING"
                              ? "#CB5B00"
                              : (transaction.status || "") === "CANCELLED"
                              ? "#BA0104"
                              : "#222b45",
                          fontWeight: 600,
                        }}
                      >
                        {transaction.status || ""}
                      </span>
                    </td>
                    <td>
                      {transaction.createdAt && transaction.createdAt !== ""
                        ? new Date(transaction.createdAt).toLocaleString()
                        : "-"}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-transactions mobile-only">
        {visibleTransactions.map((transaction) => (
          <div key={transaction.id} className="transaction-card">
            <div className="transaction-icon-container">
              <img
                className="transaction-icon-mobile"
                src={AirplaneIcon}
                alt="Airplane"
                width={20}
                height={20}
              />
            </div>
            <div className="transaction-details">
              <div className="transaction-service">
                {getServiceName(transaction)}
              </div>
              <div className="transaction-date">
                {transaction.createdAt && transaction.createdAt !== ""
                  ? new Date(transaction.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )
                  : "Wed. Jun 11, 2025"}
              </div>
            </div>
            <div className="transaction-amount">{getAmount(transaction)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsTable;
