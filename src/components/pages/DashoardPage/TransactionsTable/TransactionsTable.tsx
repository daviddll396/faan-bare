import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useLoading } from "../../../../contexts/LoadingContext";
import { logger } from "../../../../utils/logger";
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

// Transaction interface matching what AuthContext returns
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

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  onSeeAll,
  expanded,
  hideTitle,
  transactions: propTransactions,
}) => {
  const { getTransactionHistory, getAdminTransactionHistory, user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch transactions on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      showLoading("Loading transactions...");
      try {
        let fetchedTransactions;

        // Use admin transaction history for admin users, regular history for customers
        if (user?.role === "Admin") {
          logger.info("Transactions", "Fetching admin transaction history");
          fetchedTransactions = await getAdminTransactionHistory();
        } else {
          logger.info("Transactions", "Fetching customer transaction history");
          const endDate = new Date();
          const startDate = new Date();
          startDate.setMonth(endDate.getMonth() - 6);
          const format = (d: Date) => d.toISOString().slice(0, 10);
          fetchedTransactions = await getTransactionHistory(
            format(startDate),
            format(endDate)
          );
        }

        if (fetchedTransactions) {
          logger.success("Transactions", "Transactions loaded", {
            count: fetchedTransactions.length,
          });
          setTransactions(fetchedTransactions as Transaction[]);
        } else {
          logger.warn("Transactions", "No transactions found");
          setTransactions([]);
        }
      } catch (error) {
        logger.error("Transactions", "Failed to fetch transactions", error);
        setTransactions([]);
      } finally {
        hideLoading();
      }
    };

    fetchTransactions();
  }, [
    getTransactionHistory,
    getAdminTransactionHistory,
    user?.role,
    showLoading,
    hideLoading,
  ]);

  // Use propTransactions if provided (for backward compatibility), otherwise use fetched transactions
  const finalTransactions =
    propTransactions && propTransactions.length > 0
      ? propTransactions
      : transactions;
  // Show newest first: reverse order without mutating inputs
  const orderedTransactions = React.useMemo(
    () => [...finalTransactions].reverse(),
    [finalTransactions]
  );
  const hasRealData = finalTransactions && finalTransactions.length > 0;
  const isLargeScreen = window.innerWidth > 1800;
  const sliceCount = isLargeScreen ? 5 : 4;
  const visibleTransactions = hasRealData
    ? expanded
      ? orderedTransactions
      : orderedTransactions.slice(0, sliceCount)
    : [];
  const showStatusAndDate = hasRealData && expanded;

  // Helper to truncate service name
  const truncate = (str: string, n: number) =>
    str.length > n ? str.slice(0, n - 1) + "..." : str;

  // Helper to get service name safely
  const getServiceName = (transaction: Transaction) => {
    return transaction.tariffName || transaction.service || "";
  };

  // Helper to get amount safely
  const getAmount = (transaction: Transaction) => {
    if (hasRealData && typeof transaction.amount === "number") {
      return `₦${transaction.amount.toLocaleString()}`;
    }
    return transaction.price || "";
  };

  // Show no transactions state
  if (!hasRealData) {
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
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">
            <img
              src={AirplaneIcon}
              alt="No transactions"
              width={48}
              height={48}
            />
          </div>
          <div className="empty-state-content">
            <h4>No transactions yet</h4>
            <p>
              Your transaction history will appear here once you make your first
              booking or payment.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
            {/* <p className="table-sub">Latest bookings and payments</p> */}
          </div>
        )}
        <div className="table-header-actions">
          {!expanded && (
            <button className="see-all-btn" onClick={onSeeAll}>
              See All
            </button>
          )}
        </div>
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
              <th></th>
              <th className="gap-col"></th>
              <th>Service</th>
              <th className="gap-col"></th>
              <th style={{ textAlign: "right" }}>
                {hasRealData ? "Amount" : "Price"}
              </th>
              {showStatusAndDate && <th>Status</th>}
              {showStatusAndDate && <th>Date</th>}
            </tr>
          </thead>
          <tbody>
            {visibleTransactions.map((transaction, index) => (
              <tr key={transaction.id} className="transactions-row">
                <td className="centered-col">{index + 1}.</td>
                <td className="gap-col"></td>
                <td>
                  <div className="service-cell">
                    <div className="transaction-icon-wrap">
                      <img
                        className="transaction-icon"
                        src={AirplaneIcon}
                        alt="Icon"
                        width={24}
                        height={24}
                      />
                    </div>
                    <div className="service-meta">
                      {expanded ? (
                        <span className="service-name">
                          {getServiceName(transaction)}
                        </span>
                      ) : (
                        <span
                          title={getServiceName(transaction)}
                          className="service-name"
                        >
                          {truncate(getServiceName(transaction), 32)}
                        </span>
                      )}
                      <div className="service-sub">
                        {transaction.createdAt
                          ? new Date(transaction.createdAt).toLocaleDateString()
                          : "—"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="gap-col"></td>
                <td className="transaction-amount-cell">
                  {getAmount(transaction)}
                </td>
                {showStatusAndDate && (
                  <>
                    <td>
                      <span
                        className={`status-badge ${(
                          transaction.status || ""
                        ).toLowerCase()}`}
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
                  : "—"}
              </div>
            </div>
            <div className="transaction-amount-wrap">
              <div className="transaction-amount">{getAmount(transaction)}</div>
              <div
                className={`status-badge ${(
                  transaction.status || ""
                ).toLowerCase()}`}
              >
                {transaction.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsTable;
