import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useLoading } from "../../../contexts/LoadingContext";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import FieldButton from "../../reusables/FieldButton/FieldButton";
import Modal from "../../reusables/Modal/Modal";
import MessageToast from "../../reusables/MessageToast/MessageToast";
import InvoiceCard from "../../reusables/InvoiceCard/InvoiceCard";
import "./InvoicesPage.css";
import ServicesGrid from "../../reusables/ServicesGrid/ServicesGrid";

// helper to map service names to images (reuses same assets as ServicesPage)
const getImageForService = (serviceName: string): string => {
  const imageMap: { [k: string]: string } = {
    "International Arrival": "/images/intl-arrival.svg",
    "International Departure": "/images/intl-departure.svg",
    "VIP lounge International": "/images/vip-lounge.svg",
    "Abuja International OneOff": "/images/abj-intl.svg",
    "One Year Protocol Service (Domestic operations PH)":
      "/images/one-year.svg",
    "Additional One(1) Unit(Domestic ODC PH)": "/images/add-one-unit.svg",
    "Extra ODC": "/images/add-one-unit.svg",
    "Protocol Car Park Porthacourt": "/images/ph-protocol.svg",
    "Protocol Lounge porthacourt": "/images/vip-lounge.svg",
    "Port Harcourt Domestic Service": "/images/ph-domestic.svg",
  };

  if (imageMap[serviceName]) return imageMap[serviceName];

  const availableImages = [
    "/images/intl-arrival.svg",
    "/images/intl-departure.svg",
    "/images/vip-lounge.svg",
    "/images/abj-intl.svg",
    "/images/one-year.svg",
    "/images/add-one-unit.svg",
    "/images/ph-protocol.svg",
    "/images/ph-domestic.svg",
  ];

  const hash = serviceName.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
  const idx = Math.abs(hash) % availableImages.length;
  return availableImages[idx];
};

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

  // Remita removed for invoices - wallet-only flow

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

  // Payment will always use wallet for invoices

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
    amount: number; // total
    subtotal: number;
    vatRate: number;
    vatAmount: number;
    paymentDate: string;
    items: { name: string; amount: number; quantity: number }[];
    customerId?: string;
    paymentChannel?: string; // e.g. Web, pos
    paymentMethod?: string; // e.g. Wallet
  } | null>(null);

  const openInvoiceReceipt = (
    invoice: Invoice,
    txId: number,
    paymentChannel: string = "Web",
    paymentMethod: string = "Wallet"
  ) => {
    const items = invoice.services.map((s) => ({
      name: s.name,
      amount: s.amount,
      quantity: s.quantity,
    }));
    const subtotal = items.reduce(
      (sum, it) => sum + it.amount * it.quantity,
      0
    );
    const vatRate = 0.075; // 7.5% VAT (adjust if needed)
    const vatAmount = Math.round(subtotal * vatRate);
    const total = subtotal + vatAmount;

    setReceiptData({
      invoiceNumber: invoice.invoiceNumber,
      transactionId: txId,
      amount: total,
      subtotal,
      vatRate,
      vatAmount,
      paymentDate: new Date().toLocaleString(),
      items,
      customerId: user?.customerId,
      paymentChannel,
      paymentMethod,
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

  // Explicit search and clear handlers (used by Search / Clear buttons)
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredInvoices(invoices);
      return;
    }

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
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredInvoices(invoices);
  };

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

  // quantities updated when adding services; no separate quantity control UI here

  // Generate invoice
  const handleGenerateInvoice = () => {
    if (selectedServices.length === 0) {
      showToast("Please select at least one service", "error");
      return;
    }

    // compute subtotal, VAT and total
    const subtotal = selectedServices.reduce(
      (sum, service) => sum + service.amount * service.quantity,
      0
    );
    const VAT_RATE = 0.075; // 7.5% VAT
    const totalAmount = subtotal + Math.round(subtotal * VAT_RATE);

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

  // Process payment (always wallet) - now includes VAT breakdown
  const processPayment = async () => {
    if (!selectedInvoice) return;

    try {
      showLoading("Processing wallet payment...");

      // compute subtotal/VAT handled in receipt generation; no local use here

      let allPaymentsSuccessful = true;
      const paymentResults: {
        service: InvoiceService;
        success: boolean;
        errorMessage?: string;
      }[] = [];

      // make payment per service (backend expects tariffId)
      for (const service of selectedInvoice.services) {
        const reference = `INV-${selectedInvoice.invoiceNumber}-${service.id}-${
          service.quantity
        }-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const paymentResult = await makePayment(reference, service.id);
        if (paymentResult.success)
          paymentResults.push({ service, success: true });
        else {
          paymentResults.push({
            service,
            success: false,
            errorMessage: paymentResult.message,
          });
          allPaymentsSuccessful = false;
        }
      }

      if (allPaymentsSuccessful) {
        setInvoices(
          invoices.map((inv) =>
            inv.id === selectedInvoice.id ? { ...inv, status: "paid" } : inv
          )
        );
        setShowPaymentModal(false);
        const txId = Math.floor(Math.random() * 1101233);
        // pass payment channel/method to receipt (defaults used inside)
        openInvoiceReceipt(selectedInvoice, txId, "Web", "Wallet");
        setSelectedInvoice(null);
        showToast("Wallet payment processed successfully!", "success");
        refreshUserDetails();
      } else {
        const firstError = paymentResults.find((r) => !r.success);
        showToast(
          `Payment failed: ${firstError?.errorMessage || "Unknown error"}`,
          "error"
        );
      }
    } catch (error) {
      console.error("💥 Payment processing error:", error);
      showToast("Payment failed. Please try again.", "error");
    } finally {
      hideLoading();
    }
  };

  // Handle Remita payment
  // remove old Remita handler (invoices now always use wallet)

  // Calculate total for selected services
  const selectedServicesTotal = selectedServices.reduce(
    (sum, service) => sum + service.amount * service.quantity,
    0
  );
  // VAT for create-invoice summary
  const VAT_RATE = 0.075; // 7.5%
  const selectedServicesVat = Math.round(selectedServicesTotal * VAT_RATE);
  const selectedServicesGrandTotal =
    selectedServicesTotal + selectedServicesVat;

  // Helper to compute subtotal/vat/total for a given invoice (used for modal/receipt)
  const computeInvoiceTotals = (invoice: Invoice) => {
    const subtotal = invoice.services.reduce(
      (sum, s) => sum + s.amount * s.quantity,
      0
    );
    const vatRate = 0.075;
    const vatAmount = Math.round(subtotal * vatRate);
    const total = subtotal + vatAmount;
    return { subtotal, vatRate, vatAmount, total };
  };

  // breakdown for currently selected invoice (used in modal)
  const invoiceBreakdown = selectedInvoice
    ? computeInvoiceTotals(selectedInvoice)
    : null;

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
        {showCreateInvoicePage ? (
          <PageTitle
            icon="/icons/nav-bill-icon.svg"
            title="Create Invoice"
            subtitle={
              "Create and manage invoices by selecting services and generating invoices for customers."
            }
            breadcrumb={[
              { label: "Invoices", icon: "/icons/nav-bill-icon.svg" },
              { label: "Create Invoice" },
            ]}
            onBreadcrumbClick={(idx) => {
              // clicking first crumb returns to invoices list
              if (idx === 0) {
                setShowCreateInvoicePage(false);
                setSelectedServices([]);
              }
            }}
          />
        ) : (
          <PageTitle
            icon="/icons/nav-bill-icon.svg"
            title="Invoices"
            subtitle={"Search & Manage Invoices"}
          />
        )}
      </div>
      {!showCreateInvoicePage && (
        <div className="page-actions">
          <div className="invoices-search-section">
            <div className="invoices-search-inputs invoices-action-buttons">
              <FieldButton
                inputs={[
                  {
                    placeholder: "Search invoices...",
                    value: searchQuery,
                    onChange: (
                      e:
                        | React.ChangeEvent<
                            HTMLInputElement | HTMLSelectElement
                          >
                        | { target: { value: string } }
                    ) => {
                      const change = e as React.ChangeEvent<
                        HTMLInputElement | HTMLSelectElement
                      >;
                      if (
                        change &&
                        (change.currentTarget || change.nativeEvent)
                      ) {
                        setSearchQuery(change.currentTarget.value);
                        return;
                      }
                      const fallback = e as { target: { value: string } };
                      setSearchQuery(fallback.target.value);
                    },
                  },
                ]}
                buttons={[
                  { text: "Search", onClick: handleSearch },
                  { text: "Clear", onClick: handleClearSearch },
                  ...(user?.role === "Admin"
                    ? []
                    : [
                        {
                          text: "Create New Invoice",
                          onClick: () => setShowCreateInvoicePage(true),
                          variant: "primary" as const,
                        },
                      ]),
                ]}
              />
            </div>
          </div>
        </div>
      )}
      {showCreateInvoicePage && (
        <div className="create-invoice-subpage">
          <div className="services-selection">
            <ServicesGrid
              className="available-services"
              items={availableServices.map((s) => ({
                id: s.id,
                image: getImageForService(s.name),
                name: s.name,
                price: s.amount,
                description: s.description,
              }))}
              actionText="Add to Invoice"
              onAction={(id) => {
                const svc = availableServices.find((a) => a.id === id);
                if (svc) handleServiceSelection(svc);
              }}
            />
          </div>

          {selectedServices.length > 0 && (
            <div className="booking-summary-card">
              <div className="booking-summary-title">SUMMARY</div>
              {/* list each service and qty */}
              {selectedServices.map((service) => (
                <div key={service.id} className="booking-summary-row">
                  <span>
                    {service.name} x{service.quantity}
                  </span>
                  <span>
                    ₦{(service.amount * service.quantity).toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="booking-summary-row">
                <span>SUB-TOTAL</span>
                <span>₦{selectedServicesTotal.toLocaleString()}</span>
              </div>
              <div className="booking-summary-row">
                <span>VAT ({(VAT_RATE * 100).toFixed(2)}%)</span>
                <span>₦{selectedServicesVat.toLocaleString()}</span>
              </div>
              <div className="booking-summary-row">
                <span>OTHER CHARGES</span>
                <span>₦0</span>
              </div>
              <div className="booking-summary-row total">
                <span>TOTAL</span>
                <span>₦{selectedServicesGrandTotal.toLocaleString()}</span>
              </div>

              <div style={{ width: "100%" }}>
                <GradientButton
                  onClick={handleGenerateInvoice}
                  fullWidth
                  className="booking-pay-btn"
                >
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
              <div className="no-invoices-icon">
                <img
                  src="/icons/airplane-icon.svg"
                  alt="No invoices"
                  width={48}
                  height={48}
                  className="desktop-icon"
                />
                <img
                  src="/icons/airplane-icon.svg"
                  alt="No invoices"
                  width={36}
                  height={36}
                  className="mobile-icon"
                />
              </div>

              <div className="no-invoices-title">No invoices found</div>
              <div className="no-invoices-message">
                Create your first invoice to get started.
              </div>
            </div>
          ) : (
            <div className="invoices-grid">
              {filteredInvoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  id={invoice.id}
                  invoiceNumber={invoice.invoiceNumber}
                  status={invoice.status}
                  customerName={invoice.customerName}
                  services={invoice.services.map((service) => ({
                    name: service.name,
                    price: service.amount,
                    quantity: service.quantity,
                  }))}
                  totalAmount={invoice.totalAmount}
                  createdAt={invoice.createdAt.toISOString()}
                  expiryWarning={
                    invoice.status === "pending"
                      ? {
                          message: isInvoiceExpiringSoon(invoice)
                            ? `⚠️ Expires in: ${getTimeUntilExpiry(invoice)}`
                            : `⏰ Expires in: ${getTimeUntilExpiry(invoice)}`,
                          isUrgent: isInvoiceExpiringSoon(invoice),
                        }
                      : undefined
                  }
                  onViewDetails={() => handleViewDetails(invoice)}
                  onPayNow={
                    invoice.status === "pending"
                      ? () => handlePayment(invoice)
                      : undefined
                  }
                  onDownloadReceipt={
                    invoice.status === "paid"
                      ? () => handleViewDetails(invoice)
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invoice Summary Modal (wallet payment pre-decided) */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        className="invoice-summary-modal"
      >
        <div className="modal-content">
          <h2 style={{ color: "#000" }}>Invoice Summary</h2>

          {selectedInvoice && (
            <div
              className="booking-summary-card invoice-modal-summary"
              aria-live="polite"
            >
              {selectedInvoice.services.map((s) => (
                <div key={s.id} className="booking-summary-row">
                  <span style={{ color: "#000" }}>
                    {s.name} x{s.quantity}
                  </span>
                  <span style={{ color: "#000" }}>
                    ₦{(s.amount * s.quantity).toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="booking-summary-row">
                <span style={{ color: "#969696" }}>SUB-TOTAL</span>
                <span style={{ color: "#000" }}>
                  ₦
                  {invoiceBreakdown
                    ? invoiceBreakdown.subtotal.toLocaleString()
                    : selectedInvoice.totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="booking-summary-row">
                <span style={{ color: "#969696" }}>
                  VAT{" "}
                  {invoiceBreakdown
                    ? `(${(invoiceBreakdown.vatRate * 100).toFixed(2)}%)`
                    : ""}
                </span>
                <span style={{ color: "#000" }}>
                  ₦
                  {invoiceBreakdown
                    ? invoiceBreakdown.vatAmount.toLocaleString()
                    : "0"}
                </span>
              </div>

              <div className="booking-summary-row">
                <span style={{ color: "#969696" }}>OTHER CHARGES</span>
                <span style={{ color: "#000" }}>₦0</span>
              </div>

              <div className="booking-summary-row total">
                <span style={{ color: "#000" }}>TOTAL</span>
                <span style={{ color: "#000" }}>
                  ₦
                  {invoiceBreakdown
                    ? invoiceBreakdown.total.toLocaleString()
                    : selectedInvoice.totalAmount.toLocaleString()}
                </span>
              </div>

              <div style={{ marginTop: 12, fontSize: 13, color: "#969696" }}>
                <strong style={{ color: "#000" }}>Invoice:</strong>{" "}
                {selectedInvoice.invoiceNumber}
              </div>

              <div style={{ marginTop: 6, fontSize: 13, color: "#969696" }}>
                <strong style={{ color: "#000" }}>Customer:</strong>{" "}
                {selectedInvoice.customerName}
              </div>

              <div style={{ marginTop: 6, fontSize: 13, color: "#969696" }}>
                <strong style={{ color: "#000" }}>Created:</strong>{" "}
                {selectedInvoice.createdAt.toLocaleDateString()}
                {/* •
                <strong style={{ color: "#000", marginLeft: 8 }}>
                  Due:
                </strong>{" "}
                {selectedInvoice.dueDate.toLocaleDateString()} */}
              </div>
            </div>
          )}

          <div className="modal-actions" style={{ width: "100%" }}>
            <GradientButton onClick={processPayment} fullWidth>
              Confirm & Pay
            </GradientButton>
          </div>

          {/* Notice about payment method (wallet-only) */}
          <div className="wallet-note" role="status">
            Your wallet will be used to pay this invoice automatically.
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
              <div className="meta-row">
                <span>Payment Channel</span>
                <span>{receiptData.paymentChannel || "Web"}</span>
              </div>
              <div className="meta-row">
                <span>Payment Method</span>
                <span>{receiptData.paymentMethod || "Wallet"}</span>
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
              <div className="row">
                <span>SUBTOTAL</span>
                <span className="right mono">
                  ₦{receiptData.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="row">
                <span>VAT ({(receiptData.vatRate * 100).toFixed(2)}%)</span>
                <span className="right mono">
                  ₦{receiptData.vatAmount.toLocaleString()}
                </span>
              </div>
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
                    body{background:#eef2f7;margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#000}
                    .receipt-paper{position:relative;max-width:720px;margin:0 auto;background:#fff;border:1px solid #f0f0f0;border-radius:14px;box-shadow:0 2px 10px rgba(17,24,39,0.06);padding:24px;color:#000}
                    .receipt-paper:before{content:"";position:absolute;left:0;right:0;top:-8px;height:16px;background:radial-gradient(circle at 8px 8px,#fff 8px,transparent 8px) left top/16px 16px repeat-x,linear-gradient(#f0f0f0,#f0f0f0)}
                    .receipt-head{text-align:center;margin:8px 0}
                    .receipt-brand{font-weight:700;color:#000;font-size:14px}
                    .receipt-title{font-size:16px;font-weight:800;color:#000;letter-spacing:0.06em;margin-top:2px}
                    .receipt-sub{font-size:12px;color:#969696;margin-top:2px}
                    .receipt-meta{border:1px dashed #f0f0f0;border-radius:10px;padding:12px 14px;margin:12px 0 16px 0}
                    .receipt-meta .meta-row{display:flex;justify-content:space-between;align-items:center;padding:8px 4px;border-bottom:1px dashed #f0f0f0}
                    .receipt-meta .meta-row:last-child{border-bottom:none}
                    .receipt-meta .meta-row span:first-child{color:#969696;font-size:12px}
                    .mono{font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;font-weight:700}
                    .receipt-items{border-top:1px solid #f0f0f0;border-bottom:1px solid #f0f0f0}
                    .receipt-items .thead,.receipt-items .row,.receipt-items .total{display:grid;grid-template-columns:1fr 160px;gap:12px;padding:10px 0}
                    .receipt-items .thead{color:#969696;font-size:12px}
                    .receipt-items .row{border-top:1px dashed #f0f0f0}
                    .right{text-align:right}
                    .receipt-items .total{border-top:2px solid #f0f0f0;font-weight:800}
                    .receipt-foot{margin-top:10px;color:#969696;font-size:12px;text-align:center}
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
                        <div class='meta-row'><span>Payment Channel</span><span>${
                          receiptData.paymentChannel || "Web"
                        }</span></div>
                        <div class='meta-row'><span>Payment Method</span><span>${
                          receiptData.paymentMethod || "Wallet"
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
                        <div class='row'><span>SUBTOTAL</span><span class='right mono'>₦${receiptData.subtotal.toLocaleString()}</span></div>
                        <div class='row'><span>VAT (${(
                          receiptData.vatRate * 100
                        ).toFixed(
                          2
                        )}%)</span><span class='right mono'>₦${receiptData.vatAmount.toLocaleString()}</span></div>
                        <div class='total'><span>Total</span><span class='right mono'>₦${receiptData.amount.toLocaleString()}</span></div>
                      </div>
                      <div class='receipt-foot'>Customer ID: ${
                        user?.customerId || ""
                      }</div>
                    </div>
                    <script>window.onload = function(){ setTimeout(function(){ window.print(); window.close(); }, 250); };</script>
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
        showHeader={true}
        headerTitle="INVOICE DETAILS"
        className="view-details-modal"
      >
        {viewingInvoice && (
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
                <span className="mono">{viewingInvoice.invoiceNumber}</span>
              </div>
              <div className="meta-row">
                <span>Status</span>
                <span
                  className={`status-indicator status-${viewingInvoice.status}`}
                >
                  {viewingInvoice.status.toUpperCase()}
                </span>
              </div>
              <div className="meta-row">
                <span>Customer</span>
                <span>{viewingInvoice.customerName}</span>
              </div>
              <div className="meta-row">
                <span>Created At</span>
                <span>{viewingInvoice.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="meta-row">
                <span>Due Date</span>
                <span>{viewingInvoice.dueDate.toLocaleDateString()}</span>
              </div>
            </div>
            <div className="invoice-details-items">
              <div className="thead">
                <span>Service</span>
                <span className="right">Amount</span>
              </div>
              {viewingInvoice.services.map((service, index) => (
                <div key={index} className="row">
                  <span>
                    {service.name} x{service.quantity}
                  </span>
                  <span className="right mono">
                    ₦{(service.amount * service.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="total">
                <span>Total</span>
                <span className="right mono">
                  ₦{viewingInvoice.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoicesPage;
