import React, { useState } from "react";
import "./billspage.css";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import BillTitleIcon from "/icons/bill-title-icon.svg";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import AddIcon from "/icons/add-icon.svg";
import { useLoading } from "../../../contexts/LoadingContext";
import FieldButton from "../../reusables/FieldButton/FieldButton";
import BorderButton from "../../reusables/BorderButton/BorderButton";
import Input from "../../reusables/Input/Input";
import DataTable from "../../reusables/DataTable/DataTable";
import ListBox, { type ListBoxOption } from "../../reusables/ListBox";

import { Eye, User, Mail } from "lucide-react";
import RemoveFormIcon from "/icons/trash-can-icon.svg";
import InvoiceFormIcon from "/icons/invoice-form-icon.svg";
import IdFormIcon from "/icons/id-form-icon.svg";
import InvoiceAmountFormIcon from "/icons/invoice-amount-form-icon.svg";
import CheckCircle from "/icons/check-circle.svg";

import SlideIndicator from "../../reusables/SlideIndicator/SlideIndicator";
import Modal from "../../reusables/Modal/Modal";
import SolidButton from "../../reusables/SolidButton";

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

  // Search form state
  const [searchForm, setSearchForm] = useState({
    customerName: "",
    customerId: "",
    customerNin: "",
  });

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
      outstanding: "₦0",
      date: "12-08-2024 @11:32pm",
    },
    {
      billNo: "2189020",
      itemName: "Titanium",
      qty: 10,
      amount: "₦12,000",
      paid: "₦12,000",
      outstanding: "₦0",
      date: "12-08-2024 @11:32pm",
    },
    {
      billNo: "2189021",
      itemName: "Titanium",
      qty: 10,
      amount: "₦12,000",
      paid: "₦12,000",
      outstanding: "₦0",
      date: "12-08-2024 @11:32pm",
    },
    {
      billNo: "2189020",
      itemName: "Titanium",
      qty: 10,
      amount: "₦12,000",
      paid: "₦12,000",
      outstanding: "₦0",
      date: "12-08-2024 @11:32pm",
    },
    {
      billNo: "2189020",
      itemName: "Titanium",
      qty: 10,
      amount: "₦12,000",
      paid: "₦12,000",
      outstanding: "₦0",
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

  // ListBox options
  const itemOptions: ListBoxOption[] = billItemsList.map((item, index) => ({
    id: index,
    name: item,
    value: item,
  }));

  const currencyOptions: ListBoxOption[] = [
    { id: "NGN", name: "NGN", value: "NGN" },
  ];

  const initialBillItem = {
    item: "",
    baseTariff: "",
    qty: "",
    amount: "",
    currency: "NGN",
  };
  const [billItems, setBillItems] = React.useState([{ ...initialBillItem }]);

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
    value: string | ListBoxOption
  ) => {
    const updated = [...billItems];
    const newValue = typeof value === "object" ? value.value : value;

    if (field === "baseTariff" || field === "amount" || field === "qty") {
      // Only allow numbers
      const raw = newValue.replace(/[^\d]/g, "");
      updated[idx][field] = raw;
    } else {
      updated[idx][field] = newValue;
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
          <PageTitle
            icon={BillTitleIcon}
            title="Bill Search"
            subtitle={
              "To create a bill, search for the customer using their ID, NIN, or name. Enter at least one field to search."
            }
          />
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
          <div className="bill-search-section">
            <form className="bill-search-form" onSubmit={handleSubmit}>
              <div
                className="bill-search-inputs"
                style={{ display: "flex", flexDirection: "row", gap: 12 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Input
                    placeholder="Customer Name"
                    value={searchForm.customerName}
                    onChange={(e) =>
                      setSearchForm((prev) => ({
                        ...prev,
                        customerName: e.target.value,
                      }))
                    }
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Input
                    placeholder="Customer ID"
                    value={searchForm.customerId}
                    onChange={(e) =>
                      setSearchForm((prev) => ({
                        ...prev,
                        customerId: e.target.value,
                      }))
                    }
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Input
                    placeholder="Customer NIN"
                    value={searchForm.customerNin}
                    onChange={(e) =>
                      setSearchForm((prev) => ({
                        ...prev,
                        customerNin: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="bill-search-actions">
                <GradientButton type="submit" fullWidth>
                  SEARCH CUSTOMER
                </GradientButton>
              </div>
            </form>
          </div>
        )}
        {showResults && !showBillCreation && (
          <div className="bills-customer-details">
            {/* Customer Header */}
            <div className="bills-customer-header">
              <div className="bills-customer-avatar">
                <User size={60} color="#007948" />
              </div>
              <div className="bills-customer-info">
                <h2 className="bills-customer-name">
                  {customer.firstName} {customer.lastName}
                </h2>
                <p className="bills-customer-id">ID: {customer.idNo}</p>
                <p className="bills-customer-nin">NIN: {customer.nin}</p>
              </div>
              <div className="bills-customer-actions">
                <SolidButton
                  text="Create New Bill"
                  variant="primary"
                  rounded={false}
                  size="medium"
                  onClick={() => setShowBillCreation(true)}
                />
              </div>
            </div>

            {/* Customer Information Grid */}
            <div className="bills-info-grid">
              {/* Personal Information */}
              <div className="bills-info-card">
                <div className="bills-info-card-header">
                  <User size={20} color="#007948" />
                  <h3>Personal Information</h3>
                </div>
                <div className="bills-info-card-content">
                  <div className="bills-info-row">
                    <span className="bills-info-label">First Name</span>
                    <span className="bills-info-value">
                      {customer.firstName}
                    </span>
                  </div>
                  <div className="bills-info-row">
                    <span className="bills-info-label">Last Name</span>
                    <span className="bills-info-value">
                      {customer.lastName}
                    </span>
                  </div>
                  <div className="bills-info-row">
                    <span className="bills-info-label">NIN</span>
                    <span className="bills-info-value">{customer.nin}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bills-info-card">
                <div className="bills-info-card-header">
                  <Mail size={20} color="#007948" />
                  <h3>Contact Information</h3>
                </div>
                <div className="bills-info-card-content">
                  <div className="bills-info-row">
                    <span className="bills-info-label">Email</span>
                    <span className="bills-info-value">{customer.email}</span>
                  </div>
                  <div className="bills-info-row">
                    <span className="bills-info-label">Phone</span>
                    <span className="bills-info-value">+234 801 234 5678</span>
                  </div>
                  <div className="bills-info-row">
                    <span className="bills-info-label">Address</span>
                    <span className="bills-info-value">
                      123 Main Street, Lagos
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}

            <div className="bills-transaction-content">
              <DataTable
                header="Recent Bill Records"
                headers={[
                  "Bill No.",
                  "Item Name",
                  "Qty",
                  "Amount",
                  "Paid",
                  "Outstanding",
                  "Bill Date/Time",
                  "Actions",
                ]}
                data={bills.map((bill) => [
                  bill.billNo,
                  bill.itemName,
                  bill.qty,
                  bill.amount,
                  bill.paid,
                  bill.outstanding,
                  bill.date,
                  <button
                    key={`action-${bill.billNo}`}
                    className="bills-view-receipt-btn"
                    onClick={() => {
                      setSelectedBill(bill);
                      setShowReceiptModal(true);
                    }}
                  >
                    <Eye size={16} /> View Receipt
                  </button>,
                ])}
                className="bills-transaction-table"
                itemsPerPage={8}
              />
            </div>

            {windowWidth <= 768 && <SlideIndicator />}
          </div>
        )}
        {showBillCreation && (
          <div className="bill-creation-section">
            <div className="bill-creation-header">
              {/* <h3 className="bill-creation-title">Bill Creation</h3> */}
              <p className="bill-creation-subtitle">
                Create a bill for the customer by adding items, setting tariffs,
                quantities, and amounts.
              </p>
            </div>

            <form
              className="bill-creation-form"
              onSubmit={(e) => {
                e.preventDefault();
                showLoading("Generating invoice...");
                setTimeout(() => {
                  hideLoading();
                  setShowInvoiceModal(true);
                }, 2000);
              }}
            >
              <div className="bill-items-container">
                {billItems.map((bill, idx) => (
                  <div className="bill-item-card" key={idx}>
                    <div className="bill-item-header">
                      <div className="bill-item-number">{idx + 1}</div>
                      <h4 className="bill-item-title">Item {idx + 1}</h4>
                      <button
                        type="button"
                        className="bill-item-remove"
                        onClick={() => removeBillItem(idx)}
                      >
                        <img src={RemoveFormIcon} alt="Remove item" />
                      </button>
                    </div>

                    <div className="bill-item-fields">
                      <div className="bill-field-group">
                        <ListBox
                          label="Item"
                          options={itemOptions}
                          selected={
                            itemOptions.find(
                              (option) => option.value === bill.item
                            ) || null
                          }
                          onChange={(option: ListBoxOption) =>
                            handleBillItemChange(idx, "item", option)
                          }
                          placeholder="Select item"
                          className="bill-item-listbox"
                        />
                      </div>

                      <Input
                        label="Base Tariff"
                        placeholder="Enter base tariff"
                        value={formatNumberWithCommas(bill.baseTariff)}
                        onChange={(e) =>
                          handleBillItemChange(
                            idx,
                            "baseTariff",
                            e.target.value
                          )
                        }
                      />

                      <Input
                        label="Quantity"
                        placeholder="Enter quantity"
                        value={bill.qty}
                        onChange={(e) =>
                          handleBillItemChange(idx, "qty", e.target.value)
                        }
                      />

                      <div className="bill-field-group bill-amount-group">
                        <div className="bill-amount-input-wrapper">
                          <Input
                            label="Amount"
                            placeholder="Enter amount"
                            value={formatNumberWithCommas(bill.amount)}
                            onChange={(e) =>
                              handleBillItemChange(
                                idx,
                                "amount",
                                e.target.value
                              )
                            }
                            className="bill-amount-input"
                          />
                          <div className="bill-currency-wrapper">
                            <ListBox
                              label="Currency"
                              options={currencyOptions}
                              selected={
                                currencyOptions.find(
                                  (option) => option.value === bill.currency
                                ) || currencyOptions[0]
                              }
                              onChange={(option: ListBoxOption) =>
                                handleBillItemChange(idx, "currency", option)
                              }
                              placeholder="Currency"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bill-creation-actions">
                <FieldButton
                  buttons={[
                    {
                      text: "+ Add More Items",
                      onClick: addMoreBillItem,
                      type: "button",
                    },
                  ]}
                  className="bill-add-items-fieldbutton"
                />
              </div>

              <div className="bill-submit-actions">
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
                    color: "#000",
                    padding: "10px 8px",
                  }}
                >
                  TOTAL
                </td>
                <td
                  style={{
                    fontWeight: 700,
                    color: "#000",
                    padding: "10px 8px",
                    textAlign: "right",
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
            <div className="bills-receipt-cards">
              <div className="bills-receipt-card">
                <div className="bills-receipt-card-icon">
                  <img src={InvoiceFormIcon} alt="Receipt Number" />
                </div>
                <div className="bills-receipt-card-content">
                  <div className="bills-receipt-card-label">Receipt Number</div>
                  <div className="bills-receipt-card-value">
                    {selectedBill.billNo}
                  </div>
                </div>
              </div>
              <div className="bills-receipt-card">
                <div className="bills-receipt-card-icon">
                  <img src={IdFormIcon} alt="Customer ID" />
                </div>
                <div className="bills-receipt-card-content">
                  <div className="bills-receipt-card-label">Customer ID</div>
                  <div className="bills-receipt-card-value">
                    {customer.idNo}
                  </div>
                </div>
              </div>
              <div className="bills-receipt-card">
                <div className="bills-receipt-card-icon">
                  <img src={InvoiceAmountFormIcon} alt="Amount Paid" />
                </div>
                <div className="bills-receipt-card-content">
                  <div className="bills-receipt-card-label">Amount Paid</div>
                  <div className="bills-receipt-card-value">
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
