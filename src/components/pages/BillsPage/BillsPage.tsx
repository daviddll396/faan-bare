import React, { useState } from "react";
import "./billspage.css";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import BillTitleIcon from "/icons/bill-title-icon.svg";
import BorderButton from "../../reusables/BorderButton/BorderButton";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import AddIcon from "/icons/add-icon.svg";
import { useLoading } from "../../../contexts/LoadingContext";

import { Eye } from "lucide-react";
import BillsNinIcon from "/icons/bills-nin-icon.svg";
import BillsIdIcon from "/icons/bills-id-icon.svg";
import BillsFnIcon from "/icons/bills-fn-icon.svg";
import BillsEmailIcon from "/icons/bills-email-icon.svg";
import CurrencyDropdown from "../../reusables/CurrencyDropdown/CurrencyDropdown";
import ChevronDown from "/icons/chevron-down.svg";
import EditFormIcon from "/icons/edit-form-icon.svg";
import RemoveFormIcon from "/icons/remove-form-icon.svg";
import FaanLogo from "/images/faan-logo.svg";
import InvoiceFormIcon from "/icons/invoice-form-icon.svg";
import IdFormIcon from "/icons/id-form-icon.svg";
import InvoiceAmountFormIcon from "/icons/invoice-amount-form-icon.svg";
import CheckCircle from "/icons/check-circle.svg";

interface BillsPageProps {
  role?: string;
}

interface Bill {
  billNo: string;
  itemName: string;
  qty: number;
  amount: string;
  paid: string;
  outstanding: string;
  date: string;
}

const BillsPage: React.FC<BillsPageProps> = () => {
  const { showLoading, hideLoading } = useLoading();
  const [showResults, setShowResults] = useState(false);
  const [showBillCreation, setShowBillCreation] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = React.useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = React.useState(false);
  const [showReceiptModal, setShowReceiptModal] = React.useState(false);
  const [selectedBill, setSelectedBill] = React.useState<Bill | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showLoading("Searching for customer...");
    setShowResults(false);
    setTimeout(() => {
      hideLoading();
      setShowResults(true);
    }, 2000);
  };

  // Sample data for customer and bills
  const customer = {
    nin: "134789009",
    idNo: "2012365754",
    firstName: "Stephen",
    lastName: "Chukwuma",
    email: "Ogul@gmail.com",
  };
  const bills = [
    {
      billNo: "2189020",
      itemName: "Titanium",
      qty: 10,
      amount: "₦12,000",
      paid: "₦12,000",
      outstanding: "₦12,000",
      date: "12-08-2024 @11:32pm",
    },
    {
      billNo: "2189020",
      itemName: "Titanium",
      qty: 10,
      amount: "₦12,000",
      paid: "₦12,000",
      outstanding: "₦12,000",
      date: "12-08-2024 @11:32pm",
    },
    {
      billNo: "2189021",
      itemName: "Titanium",
      qty: 10,
      amount: "₦12,000",
      paid: "₦12,000",
      outstanding: "₦12,000",
      date: "12-08-2024 @11:32pm",
    },
    {
      billNo: "2189020",
      itemName: "Titanium",
      qty: 10,
      amount: "₦12,000",
      paid: "₦12,000",
      outstanding: "₦12,000",
      date: "12-08-2024 @11:32pm",
    },
    {
      billNo: "2189020",
      itemName: "Titanium",
      qty: 10,
      amount: "₦12,000",
      paid: "₦12,000",
      outstanding: "₦12,000",
      date: "12-08-2024 @11:32pm",
    },
  ];

  // Bill creation form state and helpers
  const billItemsList = [
    "Titanium",
    "Hanger Levy",
    "Boarding Bridge",
    "Jet A1 Fuel",
    "Parking Fees",
  ];
  const initialBillItem = {
    item: "",
    baseTariff: "",
    qty: "",
    amount: "",
    currency: "NGR",
  };
  const [billItems, setBillItems] = React.useState([{ ...initialBillItem }]);
  const [itemSelectOpen, setItemSelectOpen] = React.useState<number | null>(
    null
  );

  // Sample invoice data
  const invoiceNumber = "201564";
  const invoiceCustomerId = customer.idNo;
  const invoiceAmount = "54,400";
  const invoiceItems = [
    {
      id: "1001",
      name: "Bricks & Mortar",
      qty: 5,
      amount: "10,000",
      total: "50,000",
    },
    { id: "1002", name: "Titanium", qty: 2, amount: "5,000", total: "10,000" },
    {
      id: "1003",
      name: "Boarding Bridge",
      qty: 2,
      amount: "2,500",
      total: "5,000",
    },
    {
      id: "1004",
      name: "Bricks & Mortar",
      qty: 5,
      amount: "2,000",
      total: "10,000",
    },
  ];
  const invoiceTotal = "75,000";

  function formatNumberWithCommas(value: string) {
    const num = value.replace(/,/g, "");
    if (!num) return "";
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const handleBillItemChange = (
    idx: number,
    field: keyof typeof initialBillItem,
    value: string
  ) => {
    const updated = [...billItems];
    if (field === "baseTariff" || field === "amount" || field === "qty") {
      // Only allow numbers
      const raw = value.replace(/[^\d]/g, "");
      updated[idx][field] = raw;
    } else {
      updated[idx][field] = value;
    }
    setBillItems(updated);
  };

  const addMoreBillItem = () => {
    setBillItems([...billItems, { ...initialBillItem }]);
  };

  const removeBillItem = (idx: number) => {
    if (billItems.length === 1) return;
    setBillItems(billItems.filter((_, i) => i !== idx));
  };

  return (
    <div className="page-content">
      <div className="page-header">
        {!showResults ? (
          <PageTitle icon={BillTitleIcon} title="Bill Search" />
        ) : !showBillCreation ? (
          <PageTitle
            icon={BillTitleIcon}
            title="Bill Search"
            breadcrumb={[
              { label: "Bill Search", icon: BillTitleIcon },
              { label: "Customer Details" },
            ]}
            onBreadcrumbClick={(idx) => {
              if (idx === 0) setShowResults(false);
            }}
          />
        ) : (
          <PageTitle
            icon={BillTitleIcon}
            title="Bill Search"
            breadcrumb={[
              { label: "Bill Search", icon: BillTitleIcon },
              { label: "Customer Details" },
              { label: "Bill Creation" },
            ]}
            onBreadcrumbClick={(idx) => {
              if (idx === 0) {
                setShowResults(false);
                setShowBillCreation(false);
              } else if (idx === 1) {
                setShowBillCreation(false);
              }
            }}
          />
        )}
      </div>
      <div className="bill-search-center">
        {!showResults && (
          <div className="bill-search-card">
            <div className="bill-search-title">Bill Search</div>
            <div className="bill-search-subtitle">
              To create a Bill search for customer, input the Customer's ID, NIN
              and Name
            </div>
            <form className="bill-search-form" onSubmit={handleSubmit}>
              <div className="bill-form-group">
                <label>Customer Name</label>
                <input type="text" placeholder="" />
              </div>
              <div className="bill-form-group">
                <label>Customer ID</label>
                <input type="text" placeholder="" />
              </div>
              <div className="bill-form-group">
                <label>Customer NIN</label>
                <input type="text" placeholder="" />
              </div>
              <GradientButton type="submit" fullWidth>
                SEARCH
              </GradientButton>
            </form>
          </div>
        )}
        {showResults && !showBillCreation && (
          <div className="bill-results-wrapper">
            <div className="bill-results-title">Customer Details</div>
            <div className="bill-customer-details-row">
              <div className="bill-customer-card">
                <div className="bill-customer-icon-bg">
                  <img
                    src={BillsNinIcon}
                    alt="NIN"
                    className="bill-customer-icon"
                  />
                </div>
                <div className="bill-customer-info-col">
                  <div className="bill-customer-label">NIN</div>
                  <div className="bill-customer-value highlight">
                    {customer.nin}
                  </div>
                </div>
              </div>
              <div className="bill-customer-card">
                <div className="bill-customer-icon-bg">
                  <img
                    src={BillsIdIcon}
                    alt="ID No."
                    className="bill-customer-icon"
                  />
                </div>
                <div className="bill-customer-info-col">
                  <div className="bill-customer-label">ID No.</div>
                  <div className="bill-customer-value highlight">
                    {customer.idNo}
                  </div>
                </div>
              </div>
              <div className="bill-customer-card">
                <div className="bill-customer-icon-bg">
                  <img
                    src={BillsFnIcon}
                    alt="First Name"
                    className="bill-customer-icon"
                  />
                </div>
                <div className="bill-customer-info-col">
                  <div className="bill-customer-label">First Name</div>
                  <div className="bill-customer-value highlight">
                    {customer.firstName}
                  </div>
                </div>
              </div>
              <div className="bill-customer-card">
                <div className="bill-customer-icon-bg">
                  <img
                    src={BillsFnIcon}
                    alt="Last Name"
                    className="bill-customer-icon"
                  />
                </div>
                <div className="bill-customer-info-col">
                  <div className="bill-customer-label">Last Name</div>
                  <div className="bill-customer-value highlight">
                    {customer.lastName}
                  </div>
                </div>
              </div>
              <div className="bill-customer-card">
                <div className="bill-customer-icon-bg">
                  <img
                    src={BillsEmailIcon}
                    alt="Email"
                    className="bill-customer-icon"
                  />
                </div>
                <div className="bill-customer-info-col">
                  <div className="bill-customer-label">Email</div>
                  <div className="bill-customer-value highlight">
                    {customer.email}
                  </div>
                </div>
              </div>
            </div>
            <div className="bill-results-header-row">
              <div className="bill-results-title">Bill Transaction History</div>
              <BorderButton
                text="Create New Bill"
                icon={AddIcon}
                onClick={() => setShowBillCreation(true)}
                className="border-button-userspage"
              />
            </div>
            <div className="bill-results-table-card">
              <table className="bill-results-table">
                <thead>
                  <tr>
                    <th className="table-header-item">Bill No.</th>
                    <th className="table-header-item">Item Name</th>
                    <th className="table-header-item">Qty</th>
                    <th className="table-header-item">Amount</th>
                    <th className="table-header-item">Paid</th>
                    <th className="table-header-item">Outstanding</th>
                    <th className="table-header-item">Bill Date/Time</th>
                    <th className="table-header-item">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill, idx) => (
                    <tr key={idx}>
                      <td className="table-data-item">{bill.billNo}</td>
                      <td className="table-data-item">{bill.itemName}</td>
                      <td className="table-data-item">{bill.qty}</td>
                      <td className="table-data-item">{bill.amount}</td>
                      <td className="table-data-item">{bill.paid}</td>
                      <td className="table-data-item">{bill.outstanding}</td>
                      <td className="table-data-item">{bill.date}</td>
                      <td className="table-data-item">
                        <button
                          className="bill-view-receipt-btn"
                          onClick={() => {
                            setSelectedBill(bill);
                            setShowReceiptModal(true);
                          }}
                        >
                          <Eye size={18} /> View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {showBillCreation && (
          <div className="add-service-form-bill">
            <h2 className="add-user-title">Bill Creation</h2>
            <p className="add-user-helper">
              To create a Bill for a customer, input the Item, Base Tariff,
              Quantity and Amount.
            </p>
            <form
              className="user-form-list"
              onSubmit={(e) => {
                e.preventDefault();
                showLoading("Generating invoice...");
                setTimeout(() => {
                  hideLoading();
                  setShowInvoiceModal(true);
                }, 2000);
              }}
            >
              {billItems.map((bill, idx) => (
                <div
                  className="bill-form-row"
                  key={idx}
                  style={{ alignItems: "center" }}
                >
                  <div className="service-index-circle">{idx + 1}.</div>
                  <div
                    className="service-field-group service-name-group"
                    style={{ minWidth: 200, maxWidth: 200, width: 200 }}
                  >
                    <label>Choose Item:</label>
                    <div
                      className={`select-dropdown-wrapper${
                        itemSelectOpen === idx ? " open" : ""
                      }`}
                    >
                      <select
                        value={bill.item}
                        onFocus={() => setItemSelectOpen(idx)}
                        onBlur={() => setItemSelectOpen(null)}
                        onChange={(e) => {
                          handleBillItemChange(idx, "item", e.target.value);
                          setItemSelectOpen(null);
                        }}
                        style={{ minWidth: 200, maxWidth: 200, width: 200 }}
                      >
                        <option value="">Select item</option>
                        {billItemsList.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                      <img
                        src={ChevronDown}
                        alt="dropdown"
                        className="select-chevron"
                      />
                    </div>
                  </div>
                  <div
                    className="service-field-group price-group"
                    style={{ minWidth: 200, maxWidth: 200, width: 200 }}
                  >
                    <label>Base Tariff:</label>
                    <input
                      type="text"
                      value={formatNumberWithCommas(bill.baseTariff)}
                      onChange={(e) =>
                        handleBillItemChange(idx, "baseTariff", e.target.value)
                      }
                      placeholder=""
                      style={{ minWidth: 200, maxWidth: 200, width: 200 }}
                    />
                  </div>
                  <div
                    className="service-field-group price-group"
                    style={{ minWidth: 200, maxWidth: 200, width: 200 }}
                  >
                    <label>Qty:</label>
                    <input
                      type="text"
                      value={bill.qty}
                      onChange={(e) =>
                        handleBillItemChange(idx, "qty", e.target.value)
                      }
                      placeholder=""
                      style={{ minWidth: 200, maxWidth: 200, width: 200 }}
                    />
                  </div>
                  <div className="service-field-group price-group">
                    <label>Amount:</label>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <input
                        type="text"
                        value={formatNumberWithCommas(bill.amount)}
                        onChange={(e) =>
                          handleBillItemChange(idx, "amount", e.target.value)
                        }
                        placeholder=""
                        style={{ flex: 1 }}
                      />
                      <CurrencyDropdown
                        label=""
                        value={bill.currency}
                        options={["NGR"]}
                        onChange={(val: string) =>
                          handleBillItemChange(idx, "currency", val)
                        }
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          marginLeft: 8,
                        }}
                      >
                        <button
                          type="button"
                          className="action-btn-table edit"
                          tabIndex={-1}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <img src={EditFormIcon} alt="edit" />
                        </button>
                        <button
                          type="button"
                          className="action-btn-table delete"
                          tabIndex={-1}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => removeBillItem(idx)}
                        >
                          <img src={RemoveFormIcon} alt="delete" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="form-row form-row-full">
                <button
                  type="button"
                  className="add-more-items-btn"
                  onClick={addMoreBillItem}
                >
                  + Add More Items
                </button>
              </div>
              <div className="form-actions">
                <GradientButton type="submit" fullWidth>
                  GENERATE INVOICE
                </GradientButton>
              </div>
            </form>
          </div>
        )}
      </div>
      {/* Invoice Modal Overlay */}
      {showInvoiceModal && (
        <div className="customer-modal-backdrop">
          <div className="customer-modal-center">
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 4px 32px rgba(34, 43, 69, 0.1)",
                padding: 36,
                minWidth: 520,
                maxWidth: "95vw",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <button
                style={{
                  position: "absolute",
                  top: 18,
                  right: 18,
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#222",
                }}
                onClick={() => setShowInvoiceModal(false)}
                aria-label="Close"
              >
                ×
              </button>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 18,
                  justifyContent: "flex-start",
                }}
              >
                <img
                  src={FaanLogo}
                  alt="FAAN Logo"
                  style={{ width: 72, height: 72, borderRadius: 8 }}
                />
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#222b45",
                    letterSpacing: 0.2,
                    textAlign: "left",
                  }}
                >
                  FEDERAL AIRPORT AUTHORITY OF NIGERIA
                </div>
              </div>
              <div style={{ width: "100%", marginBottom: 8 }}>
                <div
                  style={{
                    color: "#222b45",
                    fontWeight: 600,
                    fontSize: 16,
                    marginBottom: 8,
                    textAlign: "left",
                  }}
                >
                  Invoice Details:
                </div>
              </div>
              <div
                style={{
                  width: "100%",
                  marginBottom: 18,
                  display: "flex",
                  gap: 18,
                  justifyContent: "center",
                }}
              >
                <div
                  className="bill-customer-card"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    minWidth: 140,
                    padding: "18px 24px",
                    gap: 16,
                  }}
                >
                  <div className="bill-customer-icon-bg">
                    <img
                      src={InvoiceFormIcon}
                      alt="Invoice Number"
                      className="bill-customer-icon"
                    />
                  </div>
                  <div
                    className="bill-customer-info-col"
                    style={{ alignItems: "center" }}
                  >
                    <div
                      className="bill-customer-label"
                      style={{
                        color: "#6c7278",
                        fontWeight: 500,
                        fontSize: 15,
                      }}
                    >
                      Invoice Number
                    </div>
                    <div
                      className="bill-customer-value highlight"
                      style={{
                        color: "#007948",
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      {invoiceNumber}
                    </div>
                  </div>
                </div>
                <div
                  className="bill-customer-card"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    minWidth: 140,
                    padding: "18px 24px",
                    gap: 16,
                  }}
                >
                  <div className="bill-customer-icon-bg">
                    <img
                      src={IdFormIcon}
                      alt="Customer ID"
                      className="bill-customer-icon"
                    />
                  </div>
                  <div
                    className="bill-customer-info-col"
                    style={{ alignItems: "center" }}
                  >
                    <div
                      className="bill-customer-label"
                      style={{
                        color: "#6c7278",
                        fontWeight: 500,
                        fontSize: 15,
                      }}
                    >
                      Customer ID
                    </div>
                    <div
                      className="bill-customer-value highlight"
                      style={{
                        color: "#009a34",
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      {invoiceCustomerId}
                    </div>
                  </div>
                </div>
                <div
                  className="bill-customer-card"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    minWidth: 140,
                    padding: "18px 24px",
                    gap: 16,
                  }}
                >
                  <div className="bill-customer-icon-bg">
                    <img
                      src={InvoiceAmountFormIcon}
                      alt="Invoice Amount"
                      className="bill-customer-icon"
                    />
                  </div>
                  <div
                    className="bill-customer-info-col"
                    style={{ alignItems: "center" }}
                  >
                    <div
                      className="bill-customer-label"
                      style={{
                        color: "#6c7278",
                        fontWeight: 500,
                        fontSize: 15,
                      }}
                    >
                      Invoice Amount
                    </div>
                    <div
                      className="bill-customer-value highlight"
                      style={{
                        color: "#009a34",
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      ₦{invoiceAmount}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ width: "100%", marginBottom: 18 }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 15,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      <th className="table-header-item">ID</th>
                      <th className="table-header-item">Item Name</th>
                      <th className="table-header-item">Qty</th>
                      <th className="table-header-item">Amount</th>
                      <th className="table-header-item">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item, idx) => (
                      <tr
                        key={item.id}
                        style={{
                          background: idx % 2 === 1 ? "#f7f7f7" : "#fff",
                        }}
                      >
                        <td
                          style={{ padding: "8px 8px" }}
                          className="table-data-item"
                        >
                          {item.id}
                        </td>
                        <td
                          style={{ padding: "8px 8px" }}
                          className="table-data-item"
                        >
                          {item.name}
                        </td>
                        <td
                          style={{ padding: "8px 8px" }}
                          className="table-data-item"
                        >
                          {item.qty}
                        </td>
                        <td
                          style={{ padding: "8px 8px" }}
                          className="table-data-item"
                        >
                          ₦{item.amount}
                        </td>
                        <td
                          style={{ padding: "8px 8px" }}
                          className="table-data-item"
                        >
                          ₦{item.total}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#222b45",
                          padding: "10px 8px",
                        }}
                      >
                        TOTAL
                      </td>
                      <td
                        style={{
                          fontWeight: 700,
                          color: "#070600",
                          padding: "10px 8px",
                        }}
                      >
                        ₦{invoiceTotal}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <GradientButton
                fullWidth
                onClick={() => {
                  showLoading("Processing payment...");
                  setTimeout(() => {
                    hideLoading();
                    setShowInvoiceModal(false);
                    setShowPaymentSuccess(true);
                  }, 2000);
                }}
              >
                PAY
              </GradientButton>
            </div>
          </div>
        </div>
      )}
      {/* Payment Success Modal Overlay */}
      {showPaymentSuccess && (
        <div className="customer-modal-backdrop">
          <div className="customer-modal-center">
            <div className="customer-success-modal">
              <div className="customer-success-icon-wrap">
                <img
                  src={CheckCircle}
                  alt="success"
                  className="customer-success-icon"
                />
              </div>
              <div className="customer-success-title">Payment Success!</div>
              <div className="customer-success-desc">
                Your payment has been successfully done.
              </div>
              <div className="customer-success-actions">
                <GradientButton onClick={() => setShowPaymentSuccess(false)}>
                  CLOSE
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Receipt Modal Overlay */}
      {showReceiptModal && (
        <div className="customer-modal-backdrop">
          <div className="customer-modal-center">
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 4px 32px rgba(34, 43, 69, 0.1)",
                padding: 36,
                minWidth: 520,
                maxWidth: "95vw",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <button
                style={{
                  position: "absolute",
                  top: 18,
                  right: 18,
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#222",
                }}
                onClick={() => setShowReceiptModal(false)}
                aria-label="Close"
              >
                ×
              </button>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 18,
                  justifyContent: "flex-start",
                }}
              >
                <img
                  src={FaanLogo}
                  alt="FAAN Logo"
                  style={{ width: 72, height: 72, borderRadius: 8 }}
                />
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#222b45",
                    letterSpacing: 0.2,
                    textAlign: "left",
                  }}
                >
                  FEDERAL AIRPORT AUTHORITY OF NIGERIA
                </div>
              </div>
              <div
                style={{
                  width: "100%",
                  marginBottom: 18,
                  display: "flex",
                  gap: 18,
                  justifyContent: "center",
                }}
              >
                <div
                  className="bill-customer-card"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    minWidth: 140,
                    padding: "18px 24px",
                    gap: 16,
                  }}
                >
                  <div className="bill-customer-icon-bg">
                    <img
                      src={InvoiceFormIcon}
                      alt="Receipt Number"
                      className="bill-customer-icon"
                    />
                  </div>
                  <div
                    className="bill-customer-info-col"
                    style={{ alignItems: "center" }}
                  >
                    <div
                      className="bill-customer-label"
                      style={{
                        color: "#6c7278",
                        fontWeight: 500,
                        fontSize: 15,
                      }}
                    >
                      Receipt Number
                    </div>
                    <div
                      className="bill-customer-value highlight"
                      style={{
                        color: "#007948",
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      {selectedBill?.billNo}
                    </div>
                  </div>
                </div>
                <div
                  className="bill-customer-card"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    minWidth: 140,
                    padding: "18px 24px",
                    gap: 16,
                  }}
                >
                  <div className="bill-customer-icon-bg">
                    <img
                      src={IdFormIcon}
                      alt="Customer ID"
                      className="bill-customer-icon"
                    />
                  </div>
                  <div
                    className="bill-customer-info-col"
                    style={{ alignItems: "center" }}
                  >
                    <div
                      className="bill-customer-label"
                      style={{
                        color: "#6c7278",
                        fontWeight: 500,
                        fontSize: 15,
                      }}
                    >
                      Customer ID
                    </div>
                    <div
                      className="bill-customer-value highlight"
                      style={{
                        color: "#009a34",
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      {customer.idNo}
                    </div>
                  </div>
                </div>
                <div
                  className="bill-customer-card"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    minWidth: 140,
                    padding: "18px 24px",
                    gap: 16,
                  }}
                >
                  <div className="bill-customer-icon-bg">
                    <img
                      src={InvoiceAmountFormIcon}
                      alt="Amount Paid"
                      className="bill-customer-icon"
                    />
                  </div>
                  <div
                    className="bill-customer-info-col"
                    style={{ alignItems: "center" }}
                  >
                    <div
                      className="bill-customer-label"
                      style={{
                        color: "#6c7278",
                        fontWeight: 500,
                        fontSize: 15,
                      }}
                    >
                      Amount Paid
                    </div>
                    <div
                      className="bill-customer-value highlight"
                      style={{
                        color: "#009a34",
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      {selectedBill?.paid}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ width: "100%", marginBottom: 18 }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 15,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      <th className="table-header-item">ID</th>
                      <th className="table-header-item">Item Name</th>
                      <th className="table-header-item">Qty</th>
                      <th className="table-header-item">Amount</th>
                      <th className="table-header-item">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill && (
                      <tr>
                        <td className="table-data-item">
                          {selectedBill.billNo}
                        </td>
                        <td className="table-data-item">
                          {selectedBill.itemName}
                        </td>
                        <td className="table-data-item">{selectedBill.qty}</td>
                        <td className="table-data-item">
                          {selectedBill.amount}
                        </td>
                        <td className="table-data-item">{selectedBill.paid}</td>
                      </tr>
                    )}
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#222b45",
                          padding: "10px 8px",
                        }}
                      >
                        TOTAL
                      </td>
                      <td
                        style={{
                          fontWeight: 700,
                          color: "#070600",
                          padding: "10px 8px",
                        }}
                      >
                        {selectedBill?.paid}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 8, width: "100%" }}>
                <GradientButton
                  onClick={() => setShowReceiptModal(false)}
                  fullWidth
                >
                  CLOSE
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillsPage;
