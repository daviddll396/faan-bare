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
import ChevronDown from "/icons/chevron-down.svg";
import RemoveFormIcon from "/icons/trash-can-icon.svg";
import InvoiceFormIcon from "/icons/invoice-form-icon.svg";
import IdFormIcon from "/icons/id-form-icon.svg";
import InvoiceAmountFormIcon from "/icons/invoice-amount-form-icon.svg";
import CheckCircle from "/icons/check-circle.svg";

import SlideIndicator from "../../reusables/SlideIndicator/SlideIndicator";
import Modal from "../../reusables/Modal/Modal";

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

  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    currency: "NGN",
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
          <>
            {windowWidth <= 768 ? (
              <PageTitle icon={BillTitleIcon} title="Bill Search" />
            ) : (
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
            )}
          </>
        ) : (
          <>
            {windowWidth <= 768 ? (
              <PageTitle icon={BillTitleIcon} title="Bill Creation" />
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
          </>
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
          <>
            <div className="bill-results-wrapper">
              <div className="bill-results-title">Customer Details</div>
              <div className="bill-customer-details-row">
                <div className="bill-customer-card">
                  <img
                    src={BillsNinIcon}
                    alt="NIN"
                    className="bill-customer-icon"
                  />

                  <div className="bill-customer-info-col">
                    <div className="bill-customer-label">NIN</div>
                    <div className="bill-customer-value highlight">
                      {customer.nin}
                    </div>
                  </div>
                </div>
                <div className="bill-customer-card">
                  <img
                    src={BillsIdIcon}
                    alt="ID No."
                    className="bill-customer-icon"
                  />

                  <div className="bill-customer-info-col">
                    <div className="bill-customer-label">ID No.</div>
                    <div className="bill-customer-value highlight">
                      {customer.idNo}
                    </div>
                  </div>
                </div>
                <div className="bill-customer-card">
                  <img
                    src={BillsFnIcon}
                    alt="First Name"
                    className="bill-customer-icon"
                  />

                  <div className="bill-customer-info-col">
                    <div className="bill-customer-label">First Name</div>
                    <div className="bill-customer-value highlight">
                      {customer.firstName}
                    </div>
                  </div>
                </div>
                <div className="bill-customer-card">
                  <img
                    src={BillsFnIcon}
                    alt="Last Name"
                    className="bill-customer-icon"
                  />

                  <div className="bill-customer-info-col">
                    <div className="bill-customer-label">Last Name</div>
                    <div className="bill-customer-value highlight">
                      {customer.lastName}
                    </div>
                  </div>
                </div>
                <div className="bill-customer-card">
                  <img
                    src={BillsEmailIcon}
                    alt="Email"
                    className="bill-customer-icon"
                  />

                  <div className="bill-customer-info-col">
                    <div className="bill-customer-label">Email</div>
                    <div className="bill-customer-value highlight">
                      {customer.email}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bill-results-header-row">
                <div className="bill-results-title">
                  Bill Transaction History
                </div>
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
            {windowWidth <= 768 && <SlideIndicator />}
          </>
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
                      style={{
                        display: "flex",
                        alignItems: windowWidth <= 768 ? "stretch" : "center",
                        gap: 8,
                        width: "100%",
                      }}
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
                      <div className="select-dropdown-wrapper">
                        <select
                          value={bill.currency}
                          onChange={(e) =>
                            handleBillItemChange(
                              idx,
                              "currency",
                              e.target.value
                            )
                          }
                          style={{ minWidth: 100, maxWidth: 100, width: 100 }}
                        >
                          <option value="NGN">NGN</option>
                        </select>
                        <img
                          src={ChevronDown}
                          alt="dropdown"
                          className="select-chevron"
                        />
                      </div>
                      <div>
                        <div
                          className="bill-creation-option-icon "
                          tabIndex={-1}
                          onClick={() => removeBillItem(idx)}
                        >
                          <img src={RemoveFormIcon} alt="delete" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="form-row form-row-full">
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      windowWidth <= 768 ? "flex-end" : "flex-start",
                  }}
                >
                  <BorderButton
                    text="+ Add More Items"
                    onClick={addMoreBillItem}
                    type="button"
                  />
                </div>
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
      {/* Invoice Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        showHeader={true}
        headerTitle="FEDERAL AIRPORT AUTHORITY OF NIGERIA"
      >
        <div style={{ width: "100%", marginBottom: 8 }}>
          <div className="bill-invoice-title">Invoice Details:</div>
        </div>
        <div className="bill-invoice-cards">
          <div className="bill-customer-card">
            <img
              src={InvoiceFormIcon}
              alt="Invoice Number"
              className="bill-customer-icon"
            />

            <div
              className="bill-customer-info-col"
              style={{ alignItems: "center" }}
            >
              <div className="bill-customer-label">Invoice Number</div>
              <div className="bill-customer-value highlight">
                {invoiceNumber}
              </div>
            </div>
          </div>
          <div className="bill-customer-card">
            <img
              src={IdFormIcon}
              alt="Customer ID"
              className="bill-customer-icon"
            />

            <div
              className="bill-customer-info-col"
              style={{ alignItems: "center" }}
            >
              <div className="bill-customer-label">Customer ID</div>
              <div className="bill-customer-value highlight">
                {invoiceCustomerId}
              </div>
            </div>
          </div>
          <div className="bill-customer-card">
            <img
              src={InvoiceAmountFormIcon}
              alt="Invoice Amount"
              className="bill-customer-icon"
            />

            <div
              className="bill-customer-info-col"
              style={{ alignItems: "center" }}
            >
              <div className="bill-customer-label">Invoice Amount</div>
              <div className="bill-customer-value highlight">
                ₦{invoiceAmount}
              </div>
            </div>
          </div>
        </div>
        <div style={{ width: "100%", marginBottom: 18, overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 15,
            }}
            className="no-min-width-table"
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
      </Modal>
      {/* Payment Success Modal */}
      <Modal
        isOpen={showPaymentSuccess}
        onClose={() => setShowPaymentSuccess(false)}
        showHeader={false}
        className="bill-success-modal"
      >
        <div className="bill-success-content">
          <div className="customer-success-icon-wrap">
            <img
              src={CheckCircle}
              alt="success"
              className="customer-success-icon"
            />
          </div>
          <div className="customer-success-title">Payment Success!</div>
          <div className="customer-success-desc">
            Your payment has been made successfully.
          </div>
          <GradientButton onClick={() => setShowPaymentSuccess(false)}>
            CLOSE
          </GradientButton>
        </div>
      </Modal>
      {/* Receipt Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        showHeader={true}
        headerTitle="FEDERAL AIRPORT AUTHORITY OF NIGERIA"
        className="bill-receipt-modal"
      >
        {selectedBill && (
          <div className="bill-receipt-content">
            <div className="bill-receipt-cards">
              <div className="bill-customer-card">
                <img
                  src={InvoiceFormIcon}
                  alt="Receipt Number"
                  className="bill-customer-icon"
                />
                <div className="bill-customer-info-col">
                  <div className="bill-customer-label">Receipt Number</div>
                  <div className="bill-customer-value highlight">
                    {selectedBill.billNo}
                  </div>
                </div>
              </div>
              <div className="bill-customer-card">
                <img
                  src={IdFormIcon}
                  alt="Customer ID"
                  className="bill-customer-icon"
                />
                <div className="bill-customer-info-col">
                  <div className="bill-customer-label">Customer ID</div>
                  <div className="bill-customer-value highlight">
                    {customer.idNo}
                  </div>
                </div>
              </div>
              <div className="bill-customer-card">
                <img
                  src={InvoiceAmountFormIcon}
                  alt="Amount Paid"
                  className="bill-customer-icon"
                />
                <div className="bill-customer-info-col">
                  <div className="bill-customer-label">Amount Paid</div>
                  <div className="bill-customer-value highlight">
                    {selectedBill.paid}
                  </div>
                </div>
              </div>
            </div>
            <div className="bill-receipt-table">
              <table>
                <thead>
                  <tr>
                    <th className="table-header-item">ID</th>
                    <th className="table-header-item">Item Name</th>
                    <th className="table-header-item">Qty</th>
                    <th className="table-header-item">Amount</th>
                    <th className="table-header-item">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="table-data-item">{selectedBill.billNo}</td>
                    <td className="table-data-item">{selectedBill.itemName}</td>
                    <td className="table-data-item">{selectedBill.qty}</td>
                    <td className="table-data-item">{selectedBill.amount}</td>
                    <td className="table-data-item">{selectedBill.paid}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="bill-total-label">
                      TOTAL
                    </td>
                    <td className="bill-total-value">{selectedBill.paid}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bill-receipt-actions">
              <GradientButton
                onClick={() => setShowReceiptModal(false)}
                fullWidth
              >
                CLOSE
              </GradientButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BillsPage;
