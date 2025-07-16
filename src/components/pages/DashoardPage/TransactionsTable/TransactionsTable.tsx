import React from "react";

import "./transactionstable.css";
import AirplaneIcon from "/icons/airplane-icon.svg";

interface TransactionsTableProps {
  onSeeAll?: () => void;
  expanded?: boolean;
  hideTitle?: boolean;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  onSeeAll,
  expanded,
  hideTitle,
}) => {
  const transactions = [
    { id: 1, service: "International Arrival", price: "₦50,000" },
    { id: 2, service: "International Departure", price: "₦50,000" },
    { id: 3, service: "Domestic Arrival", price: "₦50,000" },
    { id: 4, service: "Prootocol Lounge PH.", price: "₦50,000" },
    { id: 5, service: "Abuja International Oneoff", price: "₦50,000" },
    { id: 6, service: "Protocol Car Park PH.", price: "₦50,000" },
    {
      id: 7,
      service: "Port Harcourt Domestic Service",

      price: "₦50,000",
    },
    { id: 8, service: "Abuja Domestic Service", price: "₦50,000" },
  ];
  const visibleTransactions = expanded
    ? transactions
    : transactions.slice(0, 5);
  return (
    <div className={`transactions-table${hideTitle ? " no-top-padding" : ""}`}>
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
      <div className="table-container">
        <table>
          <colgroup>
            <col style={{ width: "6%" }} />
            <col style={{ width: "6%" }} />
            <col style={{ width: "50%" }} />

            <col style={{ width: "6%" }} />
            <col style={{ width: "30%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>#</th>
              <th className="gap-col"></th>
              <th>Service</th>

              <th className="gap-col"></th>
              <th>Price</th>
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
                    <span>{transaction.service}</span>
                  </div>
                </td>
                <td className="gap-col"></td>

                <td>{transaction.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable;
