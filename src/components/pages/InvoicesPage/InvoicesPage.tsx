import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useLoading } from "../../../contexts/LoadingContext";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import BorderButton from "../../reusables/BorderButton/BorderButton";
import SearchInput from "../../reusables/SearchInput/SearchInput";
import Modal from "../../reusables/Modal/Modal";
import MessageToast from "../../reusables/MessageToast/MessageToast";
import "./InvoicesPage.css";

// Remita Payment Engine types
declare global {
  interface Window {
    RmPaymentEngine: {
      init: (config: RemitaPaymentConfig) => RemitaPaymentHandler;
    };
  }
}

interface RemitaPaymentConfig {
  key: string;
  customerId: string;
  transactionId: number;
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  narration: string;
  onSuccess: (response: Record<string, unknown>) => void;
  onError: (response: Record<string, unknown>) => void;
  onClose: () => void;
}

interface RemitaPaymentHandler {
  showPaymentWidget: () => void;
}

interface InvoiceService {
  id: number;
  name: string;
  description: string;
  amount: number;
  quantity: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  services: InvoiceService[];
  totalAmount: number;
  status: "pending" | "paid" | "cancelled";
  createdAt: Date;
  dueDate: Date;
  customerId: string;
  customerName: string;
}

interface InvoicesPageProps {
  role?: string;
}

const InvoicesPage: React.FC<InvoicesPageProps> = () => {
  const { getAllTariffs, user, makePayment, refreshUserDetails } = useAuth();
  const { showLoading, hideLoading } = useLoading();

  // Remita Payment Configuration
  const REMITA_PUBLIC_KEY =
    "QzAwMDAyNzEyNTl8MTEwNjE4NjF8OWZjOWYwNmMyZDk3MDRhYWM3YThiOThlNTNjZTE3ZjYxOTY5NDdmZWE1YzU3NDc0ZjE2ZDZjNTg1YWYxNWY3NWM4ZjMzNzZhNjNhZWZlOWQwNmJhNTFkMjIxYTRiMjYzZDkzNGQ3NTUxNDIxYWNlOGY4ZWEyODY3ZjlhNGUwYTY=";

  // State for available services (tariffs)
  const [availableServices, setAvailableServices] = useState<
    Array<{
      id: number;
      name: string;
      description: string;
      amount: number;
      quantity: number;
    }>
  >([]);

  // State for selected services in invoice
  const [selectedServices, setSelectedServices] = useState<InvoiceService[]>(
    []
  );

  // State for invoices list
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);

  // State for modals
  // deprecated modal (removed)
  // const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showCreateInvoicePage, setShowCreateInvoicePage] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  // Scroll control after generating invoice (returning to list)
  const shouldScrollToTopAfterGenerateRef = React.useRef(false);
  // Bottom sentinel for create-invoice subpage scrolling
  const createInvoiceBottomRef = React.useRef<HTMLDivElement | null>(null);
  // Top sentinel for scrolling precisely to top
  const invoicesTopRef = React.useRef<HTMLDivElement | null>(null);

  // State for payment method
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "remita">(
    "wallet"
  );

  // State for current time (for countdown timers)
  const [currentTime, setCurrentTime] = useState(new Date());

  // State for toast messages
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  // Receipt modal state for invoice payments
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    invoiceNumber: string;
    transactionId: number;
    amount: number;
    paymentDate: string;
    items: { name: string; amount: number; quantity: number }[];
    customerId?: string;
  } | null>(null);

  const openInvoiceReceipt = (invoice: Invoice, txId: number) => {
    setReceiptData({
      invoiceNumber: invoice.invoiceNumber,
      transactionId: txId,
      amount: invoice.totalAmount,
      paymentDate: new Date().toLocaleString(),
      items: invoice.services.map((s) => ({
        name: s.name,
        amount: s.amount,
        quantity: s.quantity,
      })),
      customerId: user?.customerId,
    });
    setShowReceiptModal(true);
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({
      message,
      type,
      isVisible: true,
    });
  };

  // Stable toast close handler to prevent timer resets on frequent re-renders
  const handleToastClose = React.useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  // Fetch available services (tariffs) on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        showLoading("Loading services...");
        const tariffsData = await getAllTariffs();

        if (tariffsData && tariffsData.status && tariffsData.data) {
          const services = tariffsData.data.map(
            (tariff: {
              id: number;
              name: string;
              description: string;
              amount: number;
            }) => ({
              id: tariff.id,
              name: tariff.name,
              description: tariff.description || "Service description",
              amount: tariff.amount,
              quantity: 1,
            })
          );
          setAvailableServices(services);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        showToast("Failed to load services", "error");
      } finally {
        hideLoading();
      }
    };

    fetchServices();
  }, [getAllTariffs, showLoading, hideLoading]);

  // Load invoices from localStorage on component mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem("invoices");
    if (savedInvoices) {
      try {
        const parsedInvoices = JSON.parse(savedInvoices).map(
          (invoice: {
            id: string;
            invoiceNumber: string;
            services: InvoiceService[];
            totalAmount: number;
            status: "pending" | "paid" | "cancelled";
            createdAt: string;
            dueDate: string;
            customerId: string;
            customerName: string;
          }) => ({
            ...invoice,
            createdAt: new Date(invoice.createdAt),
            dueDate: new Date(invoice.dueDate),
          })
        );
        setInvoices(parsedInvoices);
      } catch (error) {
        console.error("Error parsing saved invoices:", error);
        localStorage.removeItem("invoices");
      }
    }
  }, []);

  // Save invoices to localStorage whenever invoices change
  useEffect(() => {
    if (invoices.length > 0) {
      localStorage.setItem("invoices", JSON.stringify(invoices));
    } else {
      localStorage.removeItem("invoices");
    }
  }, [invoices]);

  // Auto-cancel pending invoices after 1 hour
  useEffect(() => {
    const checkPendingInvoices = () => {
      const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000); // 1 hour ago

      setInvoices((currentInvoices) => {
        const updatedInvoices = currentInvoices.map((invoice) => {
          if (invoice.status === "pending" && invoice.createdAt < oneHourAgo) {
            console.log(
              `🕐 Auto-cancelling invoice ${invoice.invoiceNumber} after 1 hour`
            );
            return { ...invoice, status: "cancelled" as const };
          }
          return invoice;
        });

        // Check if any invoices were updated
        const hasChanges = updatedInvoices.some(
          (invoice, index) => invoice.status !== currentInvoices[index]?.status
        );

        // Show toast only if there were actual changes, but don't depend on showToast
        if (hasChanges) {
          // Use setTimeout to avoid the dependency issue
          setTimeout(() => {
            setToast({
              message: "Some pending invoices have been auto-cancelled",
              type: "error",
              isVisible: true,
            });
          }, 100);
        }

        return updatedInvoices;
      });
    };

    // Check immediately on mount
    checkPendingInvoices();

    // Check every 5 minutes
    const interval = setInterval(checkPendingInvoices, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentTime]); // Removed showToast dependency

  // Real-time countdown timer for pending invoices
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter invoices based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredInvoices(invoices);
    } else {
      const filtered = invoices.filter(
        (invoice) =>
          invoice.invoiceNumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          invoice.customerName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          invoice.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredInvoices(filtered);
    }
  }, [searchQuery, invoices]);

  // Handle service selection for invoice
  const handleServiceSelection = (service: {
    id: number;
    name: string;
    description: string;
    amount: number;
    quantity: number;
  }) => {
    const existingService = selectedServices.find((s) => s.id === service.id);

    if (existingService) {
      // Update quantity if service already selected
      setSelectedServices(
        selectedServices.map((s) =>
          s.id === service.id ? { ...s, quantity: s.quantity + 1 } : s
        )
      );
    } else {
      // Add new service
      setSelectedServices([...selectedServices, { ...service, quantity: 1 }]);
    }

    // Scroll to bottom to show the newly added selection section
    requestAnimationFrame(() => {
      setTimeout(() => {
        const bottomEl = createInvoiceBottomRef.current;
        if (bottomEl) {
          bottomEl.scrollIntoView({ behavior: "smooth", block: "end" });
        } else {
          const maxScroll = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
          );
          window.scrollTo({ top: maxScroll, behavior: "smooth" });
        }
      }, 200);
    });
  };

  // Handle service quantity change
  const handleQuantityChange = (serviceId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setSelectedServices(selectedServices.filter((s) => s.id !== serviceId));
    } else {
      setSelectedServices(
        selectedServices.map((s) =>
          s.id === serviceId ? { ...s, quantity: newQuantity } : s
        )
      );
    }
  };

  // Generate invoice
  const handleGenerateInvoice = () => {
    if (selectedServices.length === 0) {
      showToast("Please select at least one service", "error");
      return;
    }

    const totalAmount = selectedServices.reduce(
      (sum, service) => sum + service.amount * service.quantity,
      0
    );

    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `INV-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`,
      services: [...selectedServices],
      totalAmount,
      status: "pending",
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      customerId: user?.customerId || "GUEST",
      customerName:
        user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : "Guest User",
    };

    setInvoices([newInvoice, ...invoices]);
    setSelectedServices([]);
    setShowCreateInvoicePage(false);
    showToast("Invoice generated successfully!", "success");
    // Flag to scroll to top after the list re-renders
    shouldScrollToTopAfterGenerateRef.current = true;
  };

  // After returning to the list, scroll to the top
  React.useEffect(() => {
    if (!showCreateInvoicePage && shouldScrollToTopAfterGenerateRef.current) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const topEl = invoicesTopRef.current;
          if (topEl) {
            topEl.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            const scrollingElement =
              document.scrollingElement || document.documentElement;
            scrollingElement.scrollTo({ top: 0, behavior: "smooth" });
          }
          shouldScrollToTopAfterGenerateRef.current = false;
        }, 200);
      });
    }
  }, [showCreateInvoicePage, invoices]);

  // Handle payment
  const handlePayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  // Handle view details
  const handleViewDetails = (invoice: Invoice) => {
    const statusUpper = String(invoice.status || "").toUpperCase();
    if (statusUpper === "PAID" || statusUpper === "PPAID") {
      const txId =
        Number(String(invoice.invoiceNumber).replace(/\D/g, "")) ||
        Math.floor(Math.random() * 1101233);
      openInvoiceReceipt(invoice, txId);
      return;
    }
    setViewingInvoice(invoice);
    setShowViewDetailsModal(true);
  };

  // Process payment
  const processPayment = async () => {
    if (!selectedInvoice) return;

    try {
      if (paymentMethod === "wallet") {
        // Handle wallet payment
        showLoading("Processing wallet payment...");

        // Process each service separately to handle quantities properly
        let allPaymentsSuccessful = true;
        const paymentResults = [];

        for (const service of selectedInvoice.services) {
          // Generate a unique reference for each service payment
          const reference = `INV-${selectedInvoice.invoiceNumber}-${
            service.id
          }-${service.quantity}-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 6)}`;

          console.log(`🚀 === PROCESSING SERVICE PAYMENT ===`);
          console.log(`📋 Service: ${service.name}`);
          console.log(`🔢 Quantity: ${service.quantity}`);
          console.log(`🔢 Reference: ${reference}`);
          console.log(`🎯 Tariff ID: ${service.id}`);
          console.log(`💰 Service Amount: ₦${service.amount.toLocaleString()}`);
          console.log(
            `💰 Total for this service: ₦${(
              service.amount * service.quantity
            ).toLocaleString()}`
          );

          // Log the exact request body being sent to the API
          const requestBody = {
            reference: reference,
            tariffId: service.id,
          };
          console.log(`📤 === PAYMENT REQUEST BODY ===`);
          console.log(`📋 Request Body:`, JSON.stringify(requestBody, null, 2));
          console.log(`📍 API Endpoint: /api/faan/transactions/make-payment`);
          console.log(`🔑 Method: POST`);

          // Make payment for this service (quantity will be handled by the API)
          const paymentResult = await makePayment(reference, service.id);

          if (paymentResult.success) {
            console.log(
              `✅ Payment successful for ${service.name} x${service.quantity}`
            );
            paymentResults.push({ service, success: true });
          } else {
            console.error(
              `❌ Payment failed for ${service.name} x${service.quantity}`
            );
            console.error(`❌ Error message: ${paymentResult.message}`);
            paymentResults.push({
              service,
              success: false,
              errorMessage: paymentResult.message,
            });
            allPaymentsSuccessful = false;
          }
        }

        if (allPaymentsSuccessful) {
          console.log("🎉 === ALL WALLET PAYMENTS SUCCESSFUL ===");

          // Update invoice status
          setInvoices(
            invoices.map((inv) =>
              inv.id === selectedInvoice.id ? { ...inv, status: "paid" } : inv
            )
          );

          setShowPaymentModal(false);
          // Build receipt before clearing selection
          const txId = Math.floor(Math.random() * 1101233);
          openInvoiceReceipt(selectedInvoice, txId);
          setSelectedInvoice(null);
          showToast("Wallet payment processed successfully!", "success");
          refreshUserDetails(); // Refresh user details after successful wallet payment
        } else {
          console.error("❌ === SOME WALLET PAYMENTS FAILED ===");

          // Show the first error message as the main toast message
          const firstError = paymentResults.find((result) => !result.success);
          const mainErrorMessage = firstError?.errorMessage || "Payment failed";

          showToast(`Payment failed: ${mainErrorMessage}`, "error");
        }
      } else if (paymentMethod === "remita") {
        // Handle Remita payment
        await handleRemitaPayment(selectedInvoice);
      }
    } catch (error) {
      console.error("💥 Payment processing error:", error);
      showToast("Payment failed. Please try again.", "error");
    } finally {
      hideLoading();
    }
  };

  // Handle Remita payment
  const handleRemitaPayment = async (invoice: Invoice) => {
    if (!selectedInvoice) return;

    // Check if Remita script is loaded
    if (typeof window.RmPaymentEngine === "undefined") {
      console.error("❌ Remita Payment Engine not loaded");
      showToast(
        "Payment engine not available. Please refresh the page.",
        "error"
      );
      return;
    }

    try {
      // Close the payment modal immediately when starting Remita payment
      setShowPaymentModal(false);
      setSelectedInvoice(null);

      // Reset payment success flag for new payment
      let isPaymentSuccessful = false;

      // Get user details for payment
      const firstName = user?.firstName || "Guest";
      const lastName = user?.lastName || "User";
      const email = user?.email || "guest@example.com";

      // Generate unique transaction ID
      const transactionId = Math.floor(Math.random() * 1101233);

      console.log("🚀 === STARTING REMITA PAYMENT FOR INVOICE ===");
      console.log("💰 Amount:", invoice.totalAmount);
      console.log("🔢 Invoice Number:", invoice.invoiceNumber);
      console.log("🔢 Transaction ID:", transactionId);

      // Initialize Remita payment engine
      const paymentEngine = window.RmPaymentEngine.init({
        key: REMITA_PUBLIC_KEY,
        transactionId: transactionId,
        customerId: user?.customerId || "GUEST",
        firstName: firstName,
        lastName: lastName,
        email: email,
        amount: invoice.totalAmount,
        narration: `Payment for Invoice ${invoice.invoiceNumber} - ${invoice.services.length} service(s)`,
        onSuccess: (response) => {
          console.log("🎉 === REMITA PAYMENT SUCCESSFUL ===");
          console.log("📄 Payment response:", response);
          console.log("🔢 Transaction ID:", transactionId);
          console.log("💰 Amount:", invoice.totalAmount);
          console.log("🔢 Invoice Number:", invoice.invoiceNumber);

          // Show success toast
          showToast("Remita payment successful!", "success");

          // Set payment success flag
          isPaymentSuccessful = true;

          // Update invoice status
          setInvoices(
            invoices.map((inv) =>
              inv.id === invoice.id ? { ...inv, status: "paid" } : inv
            )
          );

          // Refresh user details to update wallet balance and transaction history
          refreshUserDetails();

          // Show receipt modal
          openInvoiceReceipt(invoice, transactionId);
        },
        onError: (response) => {
          console.error("❌ === REMITA PAYMENT FAILED ===");
          console.error("📄 Error response:", response);
          console.error("🔢 Transaction ID:", transactionId);

          showToast("Remita payment failed. Please try again.", "error");
        },
        onClose: () => {
          console.log("🚪 === REMITA PAYMENT CLOSED ===");
          console.log("🔢 Transaction ID:", transactionId);
          console.log("✅ Payment was successful:", isPaymentSuccessful);

          // Only show "Payment was cancelled" if it wasn't successful
          if (!isPaymentSuccessful) {
            showToast("Payment was cancelled", "error");
          } else {
            console.log(
              "🎉 Payment was successful, not showing cancelled message"
            );
          }
        },
      });

      // Show the payment widget
      paymentEngine.showPaymentWidget();
    } catch (error) {
      console.error("💥 Remita payment initialization error:", error);
      showToast("Failed to initialize Remita payment", "error");
    }
  };

  // Calculate total for selected services
  const selectedServicesTotal = selectedServices.reduce(
    (sum, service) => sum + service.amount * service.quantity,
    0
  );

  // Helper function to check if invoice is about to expire (within 10 minutes)
  const isInvoiceExpiringSoon = (invoice: Invoice): boolean => {
    if (invoice.status !== "pending") return false;
    const oneHourFromCreation = new Date(
      invoice.createdAt.getTime() + 60 * 60 * 1000
    );
    const tenMinutesBeforeExpiry = new Date(
      oneHourFromCreation.getTime() - 10 * 60 * 1000
    );
    return (
      currentTime >= tenMinutesBeforeExpiry && currentTime < oneHourFromCreation
    );
  };

  // Helper function to get time remaining until expiry
  const getTimeUntilExpiry = (invoice: Invoice): string => {
    if (invoice.status !== "pending") return "";
    const oneHourFromCreation = new Date(
      invoice.createdAt.getTime() + 60 * 60 * 1000
    );
    const timeRemaining = oneHourFromCreation.getTime() - currentTime.getTime();

    if (timeRemaining <= 0) return "Expired";

    const minutes = Math.floor(timeRemaining / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="invoices-page">
      <MessageToast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={handleToastClose}
        duration={2500}
      />

      <div ref={invoicesTopRef} className="page-header">
        <PageTitle icon="/icons/nav-bill-icon.svg" title="Invoices" />
      </div>
      {!showCreateInvoicePage && (
        <div className="page-actions">
          <SearchInput
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <BorderButton
            text="Create New Invoice"
            onClick={() => setShowCreateInvoicePage(true)}
            className="border-button-invoicespage"
          />
        </div>
      )}
      {showCreateInvoicePage && (
        <div className="create-invoice-subpage">
          <div
            className="all-transactions-header"
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            {" "}
            <BorderButton
              text="Back to Invoices"
              onClick={() => {
                setShowCreateInvoicePage(false);
                setSelectedServices([]);
              }}
              className="back-to-dashboard-btn"
            />{" "}
            <h2 className="all-transactions-title">Create New Invoice</h2>
          </div>

          <div className="services-selection">
            <p className="services-selection-subtitle">
              Select Services to add to invoice.
            </p>
            <div className="available-services">
              {availableServices.map((service) => (
                <div key={service.id} className="service-option">
                  <div className="service-info">
                    <div className="service-name">{service.name}</div>
                    <div className="service-description">
                      {service.description}
                    </div>
                    <div className="service-price">
                      ₦{service.amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="service-actions">
                    <GradientButton
                      size={window.innerWidth <= 768 ? "tiny" : "small"}
                      onClick={() => handleServiceSelection(service)}
                    >
                      Add to Invoice
                    </GradientButton>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedServices.length > 0 && (
            <div className="selected-services">
              <h3>Selected Services</h3>
              {selectedServices.map((service) => (
                <div key={service.id} className="selected-service">
                  <div className="service-details">
                    <span className="service-name">{service.name}</span>
                    <span className="service-price">
                      ₦{service.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        handleQuantityChange(service.id, service.quantity - 1)
                      }
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity">{service.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(service.id, service.quantity + 1)
                      }
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <div className="invoice-total">
                <strong>
                  Total Amount: ₦{selectedServicesTotal.toLocaleString()}
                </strong>
              </div>

              <div className="modal-actions">
                <GradientButton onClick={handleGenerateInvoice} fullWidth>
                  Generate Invoice
                </GradientButton>
              </div>
            </div>
          )}
          {/* Bottom sentinel to ensure scroll reaches absolute bottom */}
          <div ref={createInvoiceBottomRef} style={{ height: 1 }} />
        </div>
      )}

      {!showCreateInvoicePage && (
        <div className="invoices-container">
          {filteredInvoices.length === 0 ? (
            <div className="no-invoices">
              <p>
                No invoices found. Create your first invoice to get started.
              </p>
            </div>
          ) : (
            <div className="invoices-grid">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className={`invoice-card ${
                    invoice.status === "pending" ? "pending" : ""
                  }`}
                >
                  <div className="invoice-content-area">
                    <div className="invoice-header">
                      <div className="invoice-number">
                        {invoice.invoiceNumber}
                      </div>
                      <div className={`invoice-status ${invoice.status}`}>
                        {invoice.status.toUpperCase()}
                      </div>
                    </div>

                    {/* Show expiration warning for pending invoices */}
                    {invoice.status === "pending" && (
                      <div className="invoice-expiry-warning">
                        {isInvoiceExpiringSoon(invoice) ? (
                          <div className="expiry-warning urgent">
                            ⚠️ Expires in: {getTimeUntilExpiry(invoice)}
                          </div>
                        ) : (
                          <div className="expiry-info">
                            ⏰ Expires in: {getTimeUntilExpiry(invoice)}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="invoice-details">
                      <div className="customer-info">
                        <strong>Customer:</strong> {invoice.customerName}
                      </div>
                      <div className="invoice-date">
                        <strong>Created:</strong>{" "}
                        {invoice.createdAt.toLocaleDateString()}
                      </div>
                      <div className="invoice-due">
                        <strong>Due:</strong>{" "}
                        {invoice.dueDate.toLocaleDateString()}
                      </div>
                    </div>

                    <div className="invoice-services">
                      <strong>Services:</strong>
                      {invoice.services.map((service, index) => (
                        <div key={index} className="service-item">
                          {service.name} x{service.quantity} - ₦
                          {service.amount.toLocaleString()}
                        </div>
                      ))}
                    </div>

                    <div className="invoice-total">
                      <strong>Total:</strong> ₦
                      {invoice.totalAmount.toLocaleString()}
                    </div>
                  </div>

                  <div className="invoice-actions">
                    {invoice.status === "pending" && (
                      <GradientButton
                        onClick={() => handlePayment(invoice)}
                        size="small"
                      >
                        Pay Now
                      </GradientButton>
                    )}
                    <button
                      className="view-details-btn"
                      onClick={() => handleViewDetails(invoice)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        className="payment-modal"
      >
        <div className="modal-content">
          <h2>Payment Options</h2>
          {selectedInvoice && (
            <div className="payment-summary">
              <h3>Invoice Summary</h3>
              <div className="invoice-summary-details">
                <div>
                  <strong>Invoice:</strong> {selectedInvoice.invoiceNumber}
                </div>
                <div>
                  <strong>Amount:</strong> ₦
                  {selectedInvoice.totalAmount.toLocaleString()}
                </div>
                <div>
                  <strong>Customer:</strong> {selectedInvoice.customerName}
                </div>
              </div>
            </div>
          )}

          <div className="payment-methods">
            <h3>Select Payment Method</h3>

            <div
              className="payment-option"
              onClick={() => setPaymentMethod("wallet")}
            >
              <input
                type="radio"
                id="wallet"
                name="paymentMethod"
                value="wallet"
                checked={paymentMethod === "wallet"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as "wallet" | "remita")
                }
              />
              <label htmlFor="wallet">Pay via Wallet</label>
            </div>

            <div
              className="payment-option"
              onClick={() => setPaymentMethod("remita")}
            >
              <input
                type="radio"
                id="remita"
                name="paymentMethod"
                value="remita"
                checked={paymentMethod === "remita"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as "wallet" | "remita")
                }
              />
              <label htmlFor="remita">Pay via Remita</label>
            </div>
          </div>

          <div className="modal-actions" style={{ width: "100%" }}>
            <GradientButton onClick={processPayment} fullWidth>
              Process Payment
            </GradientButton>
          </div>
        </div>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        showHeader={true}
        headerTitle="PAYMENT RECEIPT"
        className="invoice-receipt-modal"
      >
        {receiptData && (
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
                <span>Invoice Number</span>
                <span className="mono">{receiptData.invoiceNumber}</span>
              </div>
              <div className="meta-row">
                <span>Transaction ID</span>
                <span className="mono">{receiptData.transactionId}</span>
              </div>
              <div className="meta-row">
                <span>Payment Date</span>
                <span>{receiptData.paymentDate}</span>
              </div>
            </div>
            <div className="receipt-items">
              <div className="thead">
                <span>Item</span>
                <span className="right">Amount</span>
              </div>
              {receiptData.items.map((it, idx) => (
                <div key={idx} className="row">
                  <span>
                    {it.name} x{it.quantity}
                  </span>
                  <span className="right mono">
                    ₦{(it.amount * it.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="total">
                <span>Total</span>
                <span className="right mono">
                  ₦{receiptData.amount.toLocaleString()}
                </span>
              </div>
            </div>
            {receiptData.customerId && (
              <div className="receipt-foot">
                Customer ID: {receiptData.customerId}
              </div>
            )}
            <div className="receipt-download">
              <GradientButton
                fullWidth
                onClick={() => {
                  const html = `<!doctype html><html><head><meta charset='utf-8'><title>Receipt ${
                    receiptData.invoiceNumber
                  }</title>
                  <style>
                    @page { margin: 10mm; }
                    body{background:#eef2f7;margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#111827}
                    .receipt-paper{position:relative;max-width:720px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 2px 10px rgba(17,24,39,0.06);padding:24px;color:#111827}
                    .receipt-paper:before{content:"";position:absolute;left:0;right:0;top:-8px;height:16px;background:radial-gradient(circle at 8px 8px,#fff 8px,transparent 8px) left top/16px 16px repeat-x,linear-gradient(#e5e7eb,#e5e7eb)}
                    .receipt-head{text-align:center;margin:8px 0}
                    .receipt-brand{font-weight:700;color:#374151;font-size:14px}
                    .receipt-title{font-size:16px;font-weight:800;color:#111827;letter-spacing:0.06em;margin-top:2px}
                    .receipt-sub{font-size:12px;color:#6b7280;margin-top:2px}
                    .receipt-meta{border:1px dashed #e5e7eb;border-radius:10px;padding:12px 14px;margin:12px 0 16px 0}
                    .receipt-meta .meta-row{display:flex;justify-content:space-between;align-items:center;padding:8px 4px;border-bottom:1px dashed #e5e7eb}
                    .receipt-meta .meta-row:last-child{border-bottom:none}
                    .receipt-meta .meta-row span:first-child{color:#6b7280;font-size:12px}
                    .mono{font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;font-weight:700}
                    .receipt-items{border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb}
                    .receipt-items .thead,.receipt-items .row,.receipt-items .total{display:grid;grid-template-columns:1fr 160px;gap:12px;padding:10px 0}
                    .receipt-items .thead{color:#6b7280;font-size:12px}
                    .receipt-items .row{border-top:1px dashed #e5e7eb}
                    .right{text-align:right}
                    .receipt-items .total{border-top:2px solid #e5e7eb;font-weight:800}
                    .receipt-foot{margin-top:10px;color:#6b7280;font-size:12px;text-align:center}
                  </style>
                  </head><body>
                    <div class='receipt-paper'>
                      <div class='receipt-head'>
                        <div class='receipt-brand'>Federal Airports Authority of Nigeria</div>
                        <div class='receipt-title'>PAYMENT RECEIPT</div>
                        <div class='receipt-sub'>Thank you for your payment.</div>
                      </div>
                      <div class='receipt-meta'>
                        <div class='meta-row'><span>Invoice Number</span><span class='mono'>${
                          receiptData.invoiceNumber
                        }</span></div>
                        <div class='meta-row'><span>Transaction ID</span><span class='mono'>${
                          receiptData.transactionId
                        }</span></div>
                        <div class='meta-row'><span>Payment Date</span><span>${
                          receiptData.paymentDate
                        }</span></div>
                      </div>
                      <div class='receipt-items'>
                        <div class='thead'><span>Item</span><span class='right'>Amount</span></div>
                        ${receiptData.items
                          .map(
                            (it) =>
                              `<div class='row'><span>${it.name} x${
                                it.quantity
                              }</span><span class='right mono'>₦${(
                                it.amount * it.quantity
                              ).toLocaleString()}</span></div>`
                          )
                          .join("")}
                        <div class='total'><span>Total</span><span class='right mono'>₦${receiptData.amount.toLocaleString()}</span></div>
                      </div>
                      <div class='receipt-foot'>Customer ID: ${
                        user?.customerId || ""
                      }</div>
                    </div>
                    <script>
                      window.onload = function(){ setTimeout(function(){ window.print(); window.close(); }, 250); };
                    </script>
                  </body></html>`;
                  const win = window.open("", "_blank");
                  if (win) {
                    win.document.open();
                    win.document.write(html);
                    win.document.close();
                  }
                }}
              >
                Download PDF
              </GradientButton>
            </div>
          </div>
        )}
      </Modal>
      {/* View Details Modal */}
      <Modal
        isOpen={showViewDetailsModal}
        onClose={() => {
          setShowViewDetailsModal(false);
          setViewingInvoice(null);
        }}
        className="view-details-modal"
      >
        <div className="modal-content">
          <h2 className="invoice-details-title">Invoice Details</h2>
          {viewingInvoice && (
            <div className="invoice-details-content">
              <div>
                <strong>Invoice Number:</strong> {viewingInvoice.invoiceNumber}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <span className={`invoice-status ${viewingInvoice.status}`}>
                  {viewingInvoice.status.toUpperCase()}
                </span>
              </div>
              <div>
                <strong>Created At:</strong>{" "}
                {viewingInvoice.createdAt.toLocaleDateString()}
              </div>
              <div>
                <strong>Due Date:</strong>{" "}
                {viewingInvoice.dueDate.toLocaleDateString()}
              </div>
              <div>
                <strong>Customer:</strong> {viewingInvoice.customerName}
              </div>
              <div>
                <strong>Total Amount:</strong> ₦
                {viewingInvoice.totalAmount.toLocaleString()}
              </div>
              <div>
                <strong>Services:</strong>
                <ul>
                  {viewingInvoice.services.map((service, index) => (
                    <li key={index}>
                      {service.name} x{service.quantity} - ₦
                      {service.amount.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default InvoicesPage;
