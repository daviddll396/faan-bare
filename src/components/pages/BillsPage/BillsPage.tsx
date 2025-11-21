import React, { useState } from "react";
import "./billspage.css";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import BillTitleIcon from "/icons/bill-title-icon.svg";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import { useLoading } from "../../../contexts/LoadingContext";
import Input from "../../reusables/Input/Input";
import DataTable from "../../reusables/DataTable/DataTable";
import ListBox, { type ListBoxOption } from "../../reusables/ListBox";

import { Eye, User, Mail } from "lucide-react";
import CheckCircle from "/icons/check-circle.svg";

import SlideIndicator from "../../reusables/SlideIndicator/SlideIndicator";
import Modal from "../../reusables/Modal/Modal";
import ReceiptModal from "../../reusables/ReceiptModal/ReceiptModal";
import SolidButton from "../../reusables/SolidButton";
import MessageToast from "../../reusables/MessageToast/MessageToast";

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
  const [showPrintableReceipt, setShowPrintableReceipt] = React.useState(false);
  const [selectedBill, setSelectedBill] = React.useState<Bill | null>(null);
  const [toast, setToast] = React.useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({ message: "", type: "success", isVisible: false });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, isVisible: true });
  };

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
  // Validation errors per bill item
  const [billItemErrors, setBillItemErrors] = React.useState<
    Array<{ [k: string]: string }>
  >(billItems.map(() => ({})));

  // Generated invoice data from bill items
  const [generatedInvoice, setGeneratedInvoice] = React.useState<{
    invoiceNumber: string;
    customerId: string;
    items: Array<{
      id: string;
      name: string;
      qty: number;
      amount: string;
      total: string;
    }>;
    total: string;
  } | null>(null);

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
    // clear error for this field
    setBillItemErrors((prev) => {
      const copy = [...prev];
      if (!copy[idx]) copy[idx] = {};
      delete copy[idx][field as string];
      return copy;
    });
  };

  const removeBillItem = (idx: number) => {
    if (billItems.length === 1) return;
    setBillItems(billItems.filter((_, i) => i !== idx));
    setBillItemErrors((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateBillItems = (): boolean => {
    const errors: Array<{ [k: string]: string }> = billItems.map(() => ({}));
    let hasError = false;

    billItems.forEach((b, i) => {
      if (!b.item || String(b.item).trim() === "") {
        errors[i].item = "Please select an item";
        hasError = true;
      }
      if (!b.baseTariff || Number(b.baseTariff) <= 0) {
        errors[i].baseTariff = "Enter a valid tariff";
        hasError = true;
      }
      if (!b.qty || Number(b.qty) <= 0) {
        errors[i].qty = "Enter quantity";
        hasError = true;
      }
      if (!b.amount || Number(b.amount) <= 0) {
        errors[i].amount = "Enter amount";
        hasError = true;
      }
    });

    setBillItemErrors(errors);
    return !hasError;
  };

  // Hook to keep errors array in sync when items length changes
  React.useEffect(() => {
    setBillItemErrors(billItems.map(() => ({})));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billItems.length]);

  return (
    <div className="page-content">
      <MessageToast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
      <div className="page-header">
        {!showResults ? (
          <PageTitle
            icon={BillTitleIcon}
            title="Bill Search"
            subtitle={
              "To create a bill, search for the customer using their ID, NIN, or name. Enter at least one field to search."
            }
          />
        ) : (
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
                    restrict="alpha"
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
                    restrict="numeric"
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
                    restrict="numeric"
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
        {showResults && (
          <div className="bills-customer-details">
            {/* Customer Header */}
            <div className="bills-customer-header">
              <div
                className="bills-customer-avatar"
                style={{ color: "var(--color-accent)" }}
              >
                <User size={60} color="currentColor" />
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
                <div
                  className="bills-info-card-header"
                  style={{ color: "var(--color-accent)" }}
                >
                  <User size={20} color="currentColor" />
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
                <div
                  className="bills-info-card-header"
                  style={{ color: "var(--color-accent)" }}
                >
                  <Mail size={20} color="currentColor" />
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
                    className="view-receipt-btn"
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
        {/* Bill Creation Modal */}
        {showBillCreation && (
          <Modal
            isOpen={showBillCreation}
            onClose={() => {
              setShowBillCreation(false);
              // Reset form when closing
              setBillItems([{ ...initialBillItem }]);
              setBillItemErrors([{}]);
            }}
            showHeader={true}
            showLogo={false}
            headerTitle="Create New Bill"
            className="add-bill-modal"
          >
            <div className="service-creation-section">
              <div className="modal-form-header">
                <p className="modal-form-helper">
                  Create a bill for the customer by adding items, setting
                  tariffs, quantities, and amounts.
                </p>
              </div>

              <form
                className="service-creation-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  // client-side validation
                  if (!validateBillItems()) {
                    showToast(
                      "Please fix validation errors in the bill items",
                      "error"
                    );
                    return;
                  }
                  showLoading("Generating invoice...");

                  // Generate invoice from bill items
                  const invoiceNumber = `INV-${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2, 8)}`;

                  const invoiceItems = billItems
                    .filter((item) => item.item && item.amount && item.qty)
                    .map((item, idx) => {
                      const amountNum =
                        parseFloat(item.amount.replace(/,/g, "")) || 0;
                      const qtyNum = parseFloat(item.qty) || 0;
                      const totalNum = amountNum * qtyNum;

                      return {
                        id: `${Date.now()}-${idx}`,
                        name: item.item,
                        qty: qtyNum,
                        amount: formatNumberWithCommas(String(amountNum)),
                        total: formatNumberWithCommas(String(totalNum)),
                      };
                    });

                  const totalAmount = invoiceItems.reduce(
                    (sum, item) =>
                      sum + parseFloat(item.total.replace(/,/g, "")),
                    0
                  );

                  setGeneratedInvoice({
                    invoiceNumber,
                    customerId: customer.idNo,
                    items: invoiceItems,
                    total: formatNumberWithCommas(String(totalAmount)),
                  });

                  setTimeout(() => {
                    hideLoading();
                    setShowBillCreation(false);
                    setShowInvoiceModal(true);
                    // Reset form after submission
                    setBillItems([{ ...initialBillItem }]);
                    setBillItemErrors([{}]);
                  }, 2000);
                }}
              >
                <div className="bill-items-container">
                  {billItems.map((bill, idx) => (
                    <div className="bill-item-card" key={idx}>
                      <div className="bill-item-header">
                        <h4 className="bill-item-title">Item {idx + 1}</h4>
                        {billItems.length > 1 && (
                          <button
                            type="button"
                            className="bill-item-remove"
                            onClick={() => removeBillItem(idx)}
                            aria-label={`Delete item ${idx + 1}`}
                          >
                            Delete
                          </button>
                        )}
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
                          {billItemErrors[idx]?.item && (
                            <div className="validation-error">
                              {billItemErrors[idx].item}
                            </div>
                          )}
                        </div>

                        <div className="bill-main-row">
                          <div className="bill-base-wrapper">
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
                              restrict="numeric"
                            />
                            {billItemErrors[idx]?.baseTariff && (
                              <div className="validation-error">
                                {billItemErrors[idx].baseTariff}
                              </div>
                            )}
                          </div>

                          <div className="bill-qty-wrapper">
                            <Input
                              label="Quantity"
                              placeholder="Qty"
                              value={bill.qty}
                              onChange={(e) =>
                                handleBillItemChange(idx, "qty", e.target.value)
                              }
                              restrict="numeric"
                            />
                            {billItemErrors[idx]?.qty && (
                              <div className="validation-error">
                                {billItemErrors[idx].qty}
                              </div>
                            )}
                          </div>

                          <div className="bill-amount-wrapper">
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
                              restrict="numeric"
                            />
                            {billItemErrors[idx]?.amount && (
                              <div className="validation-error">
                                {billItemErrors[idx].amount}
                              </div>
                            )}
                          </div>

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
                  ))}
                </div>

                <div className="service-actions-row">
                  <div className="service-submit-actions">
                    <GradientButton type="submit" fullWidth>
                      GENERATE INVOICE
                    </GradientButton>
                  </div>
                </div>
              </form>
            </div>
          </Modal>
        )}
      </div>
      {/* Invoice Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setGeneratedInvoice(null);
        }}
        showHeader={true}
        headerTitle="INVOICE DETAILS"
        className="view-details-modal"
      >
        {generatedInvoice && (
          <div className="invoice-details-paper">
            <div className="invoice-details-head">
              <div className="invoice-details-brand">
                Federal Airports Authority of Nigeria
              </div>
              <div className="invoice-details-title">INVOICE DETAILS</div>
              <div className="invoice-details-sub">Transaction Information</div>
            </div>
            <div className="invoice-details-meta">
              <div className="meta-row">
                <span>Invoice Number</span>
                <span className="mono">{generatedInvoice.invoiceNumber}</span>
              </div>
              <div className="meta-row">
                <span>Customer ID</span>
                <span className="mono">{generatedInvoice.customerId}</span>
              </div>
              <div className="meta-row">
                <span>Created At</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <div className="invoice-details-items">
              <div className="thead">
                <span>Item</span>
                <span className="right">Amount</span>
              </div>
              {generatedInvoice.items.map((item) => (
                <div key={item.id} className="row">
                  <span>
                    {item.name} x{item.qty}
                  </span>
                  <span className="right mono">₦{item.total}</span>
                </div>
              ))}
              <div className="total">
                <span>Total</span>
                <span className="right mono">₦{generatedInvoice.total}</span>
              </div>
            </div>
            <div style={{ width: "100%", marginTop: 16 }}>
              <GradientButton
                fullWidth
                onClick={() => {
                  showLoading("Processing payment...");
                  setTimeout(() => {
                    hideLoading();
                    setShowInvoiceModal(false);
                    setShowPaymentSuccess(true);
                    setGeneratedInvoice(null);
                  }, 2000);
                }}
              >
                PAY
              </GradientButton>
            </div>
          </div>
        )}
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
        headerTitle="PAYMENT RECEIPT"
        className="bill-receipt-modal"
      >
        {selectedBill && (
          <div className="receipt-paper">
            <div className="receipt-head">
              <div className="receipt-brand">
                Federal Airports Authority of Nigeria
              </div>
              <div className="receipt-title">PAYMENT RECEIPT</div>
              <div className="receipt-sub">Thank you for your payment.</div>
            </div>
            <div className="receipt-meta">
              <div className="meta-row">
                <span>Transaction ID</span>
                <span className="mono">{selectedBill.billNo}</span>
              </div>
              <div className="meta-row">
                <span>Payment Date</span>
                <span>{selectedBill.date}</span>
              </div>
              <div className="meta-row">
                <span>Payment Channel</span>
                <span>Web</span>
              </div>
              <div className="meta-row">
                <span>Payment Method</span>
                <span>Wallet</span>
              </div>
            </div>
            <div className="receipt-items">
              <div className="thead">
                <span>Item</span>
                <span className="right">Amount</span>
              </div>
              <div className="row">
                <span>
                  {selectedBill.itemName} (Qty: {selectedBill.qty})
                </span>
                <span className="right mono">{selectedBill.paid}</span>
              </div>
              <div className="total">
                <span>Total</span>
                <span className="right mono">{selectedBill.paid}</span>
              </div>
            </div>
            <div className="receipt-foot">Customer ID: {customer.idNo}</div>
            <div className="receipt-download" style={{ marginTop: 12 }}>
              <SolidButton
                text="Download PDF"
                fullWidth
                onClick={() => {
                  // open printable receipt modal (uses ReceiptModal component)
                  setShowPrintableReceipt(true);
                }}
              />
            </div>
          </div>
        )}
      </Modal>
      {/* Printable receipt modal */}
      <ReceiptModal
        isOpen={showPrintableReceipt}
        onClose={() => setShowPrintableReceipt(false)}
        receiptData={
          selectedBill
            ? {
                invoiceNumber: selectedBill.billNo,
                transactionId: selectedBill.billNo,
                amount:
                  Number(String(selectedBill.paid).replace(/[^0-9.-]+/g, "")) ||
                  0,
                serviceName: selectedBill.itemName,
                customerId: customer.idNo,
                paymentDate: selectedBill.date,
              }
            : null
        }
      />
    </div>
  );
};

export default BillsPage;
