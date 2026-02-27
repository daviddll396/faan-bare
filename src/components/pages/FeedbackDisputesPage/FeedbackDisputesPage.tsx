import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { logger } from "../../../utils/logger";
import Modal from "../../reusables/Modal/Modal";
import SolidButton from "../../reusables/SolidButton/SolidButton";
import FieldButton from "../../reusables/FieldButton/FieldButton";
import MessageToast from "../../reusables/MessageToast/MessageToast";
import Input from "../../reusables/Input/Input";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import SwitchingTabs from "../../reusables/SwitchingTabs/SwitchingTabs";
import ListBox from "../../reusables/ListBox/ListBox";
import DataTable from "../../reusables/DataTable/DataTable";
import SearchInput from "../../reusables/SearchInput/SearchInput";
import FileUpload from "../../reusables/FileUpload/FileUpload";
import TextArea from "../../reusables/TextArea/TextArea";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import EmptyState from "../../reusables/EmptyState/EmptyState";
import LoadingSpinner from "../../reusables/LoadingSpinner/LoadingSpinner";
import "./feedbackdisputes.css";

interface FeedbackFormData {
  message: string;
  category: string;
}

interface FeedbackHistory {
  id: string;
  message: string;
  category: string;
  createdAt: string;
  status: "Submitted" | "In Review" | "Resolved";
  customerId?: string;
  customerName?: string;
}

interface DisputeFormData {
  invoiceId?: string;
  paymentId?: string;
  reason: string;
  comments?: string;
  attachment?: string;
  attachmentFileName?: string;
}

interface Dispute {
  id: string;
  reference: string;
  invoiceId?: string;
  paymentId?: string;
  reason: string;
  category: string;
  comments?: string;
  status: "Pending" | "In Review" | "Resolved" | "Closed";
  resolutionNotes?: string;
  customerId: string;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
  attachmentUrl?: string;
}

interface ApiCustomerDisputeData {
  disputeId: number;
  customerId: string;
  paymentId?: string;
  invoiceId?: string;
  reason: string;
  comment?: string;
  attachment?: string;
  status: string;
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
}

const FeedbackDisputesPage: React.FC = () => {
  const {
    user,
    submitFeedback,
    getCustomerFeedback,
    getAdminFeedback,
    submitDispute,
    getCustomerDisputes,
    getAdminDisputes,
    updateDisputeStatus,
  } = useAuth();
  const [activeTab, setActiveTab] = useState<"feedback" | "disputes">(
    "feedback"
  );
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showDisputeDetailsModal, setShowDisputeDetailsModal] = useState(false);
  const [showFeedbackDetailsModal, setShowFeedbackDetailsModal] =
    useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [adminSelectedStatus, setAdminSelectedStatus] = useState<string>("");
  // keep local admin-selected status in sync when a dispute is selected
  useEffect(() => {
    setAdminSelectedStatus(selectedDispute?.status ?? "");
  }, [selectedDispute]);
  const [selectedFeedback, setSelectedFeedback] =
    useState<FeedbackHistory | null>(null);
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormData>({
    message: "",
    category: "GENERAL",
  });
  const [disputeForm, setDisputeForm] = useState<DisputeFormData>({
    reason: "",
    comments: "",
  });
  const [formErrors, setFormErrors] = useState<{
    feedback?: { message?: string; category?: string };
    dispute?: {
      invoiceId?: string;
      paymentId?: string;
      reason?: string;
      comments?: string;
      attachment?: string;
    };
  }>({});
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [filteredDisputes, setFilteredDisputes] = useState<Dispute[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackHistory[]>([]);
  const [filteredFeedbackHistory, setFilteredFeedbackHistory] = useState<
    FeedbackHistory[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  // Admin filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [customerIdFilter, setCustomerIdFilter] = useState<string>("");
  const [invoiceFilter, setInvoiceFilter] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const isAdmin = user?.role === "Admin";

  // Feedback categories
  const feedbackCategories = [
    "GENERAL",
    "PAYMENT",
    "FUNDING",
    "TECHNICAL",
    "OTHER",
  ];

  // Dispute reasons
  const disputeReasons = [
    "Incorrect Amount",
    "Service Not Received",
    "Payment Not Processed",
    "Duplicate Charge",
    "Refund Not Received",
    "Technical Error",
    "Other",
  ];

  // Load all data initially (without filters)
  const loadDisputes = React.useCallback(async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        // Load ALL admin feedback (no filters)
        const adminFeedbackResult = await getAdminFeedback({});

        if (adminFeedbackResult?.data) {
          const feedbackData: FeedbackHistory[] = adminFeedbackResult.data.map(
            (f) => ({
              id: f.id,
              message: f.message,
              category: f.category,
              createdAt: f.createdAt,
              status: f.status,
              customerId: f.customerId,
              customerName: f.customerName,
            })
          );
          // ensure most-recent first for admin view
          feedbackData.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setFeedbackHistory(feedbackData);
        } else {
          setFeedbackHistory([]);
        }

        // Load ALL admin disputes (no filters)
        const adminDisputesResult = await getAdminDisputes({});

        if (adminDisputesResult?.data) {
          const disputesData: Dispute[] = adminDisputesResult.data.map((d) => ({
            id: d.id,
            reference: d.reference,
            invoiceId: d.invoiceId,
            paymentId: d.paymentId,
            reason: d.reason,
            category: d.category || "Others",
            comments: d.comments,
            status: d.status,
            resolutionNotes: d.resolutionNotes,
            customerId: d.customerId,
            customerName: d.customerName,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
            attachmentUrl: d.attachmentUrl,
          }));
          // sort so newest disputes appear first
          disputesData.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setDisputes(disputesData);
        } else {
          setDisputes([]);
        }
      } else {
        // Use real API for customers
        const disputesResult = await getCustomerDisputes();
        if (disputesResult?.data) {
          const disputesData: Dispute[] = (
            disputesResult.data as unknown as ApiCustomerDisputeData[]
          ).map((d: ApiCustomerDisputeData) => ({
            id: d.disputeId.toString(),
            reference: `DISP-${d.disputeId}`,
            invoiceId: d.invoiceId || undefined,
            paymentId: d.paymentId || undefined,
            reason: d.reason,
            category: "Others",
            comments: d.comment || undefined,
            status:
              d.status === "CREATED"
                ? "Pending"
                : (d.status as "Pending" | "In Review" | "Resolved" | "Closed"),
            resolutionNotes: d.resolutionNote || undefined,
            customerId: d.customerId,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
            attachmentUrl: d.attachment || undefined,
          }));
          setDisputes(disputesData);
        } else {
          setDisputes([]);
        }

        // Load customer feedback using real API
        logger.info("FeedbackDisputes", "Loading customer feedback...");
        const feedbackResult = await getCustomerFeedback();
        logger.info("FeedbackDisputes", "Customer feedback result", {
          hasResult: !!feedbackResult,
          hasData: !!feedbackResult?.data,
          dataLength: feedbackResult?.data?.length,
          status: feedbackResult?.status,
          message: feedbackResult?.message,
        });

        if (feedbackResult?.data) {
          const feedbackData: FeedbackHistory[] = feedbackResult.data.map(
            (f) => ({
              id: f.id,
              message: f.message,
              category: f.category,
              createdAt: f.createdAt,
              status: f.status,
            })
          );
          logger.success("FeedbackDisputes", "Customer feedback loaded", {
            count: feedbackData.length,
          });
          setFeedbackHistory(feedbackData);
        } else {
          logger.warn("FeedbackDisputes", "No customer feedback data found");
          setFeedbackHistory([]);
        }
      }
    } catch (error) {
      logger.error("FeedbackDisputes", "Failed to load disputes", error);
      showToast("Failed to load disputes. Please try again.", "error");
      setDisputes([]);
      setFeedbackHistory([]);
    } finally {
      setLoading(false);
    }
  }, [
    isAdmin,
    getCustomerDisputes,
    getAdminDisputes,
    getAdminFeedback,
    getCustomerFeedback,
  ]);

  // Load all data on mount and when admin status changes
  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  // Client-side filtering function
  const applyFilters = React.useCallback(() => {
    if (activeTab === "feedback") {
      let filtered = [...feedbackHistory];

      // Filter by status
      if (statusFilter) {
        filtered = filtered.filter(
          (f) => (f.status || "").toLowerCase() === statusFilter.toLowerCase()
        );
      }

      // Filter by category
      if (categoryFilter) {
        filtered = filtered.filter(
          (f) =>
            (f.category || "").toUpperCase() === categoryFilter.toUpperCase()
        );
      }

      // Filter by customer ID
      if (customerIdFilter) {
        filtered = filtered.filter((f) =>
          (f.customerId || "")
            .toLowerCase()
            .includes(customerIdFilter.toLowerCase())
        );
      }

      // Filter by start date
      if (startDateFilter) {
        filtered = filtered.filter((f) => {
          const feedbackDate = new Date(f.createdAt);
          const startDate = new Date(startDateFilter);
          return feedbackDate >= startDate;
        });
      }

      // Filter by end date
      if (endDateFilter) {
        filtered = filtered.filter((f) => {
          const feedbackDate = new Date(f.createdAt);
          const endDate = new Date(endDateFilter);
          endDate.setHours(23, 59, 59, 999); // Include the entire end date
          return feedbackDate <= endDate;
        });
      }

      setFilteredFeedbackHistory(filtered);
    } else {
      // Disputes filtering
      let filtered = [...disputes];

      // Filter by status
      if (statusFilter) {
        // Convert API status format to display format for comparison
        const statusMap: { [key: string]: string } = {
          IN_REVIEW: "In Review",
          RESOLVED: "Resolved",
          CLOSED: "Closed",
        };
        const displayStatus = statusMap[statusFilter] || statusFilter;
        filtered = filtered.filter(
          (d) => (d.status || "").toLowerCase() === displayStatus.toLowerCase()
        );
      }

      // Filter by customer ID
      if (customerIdFilter) {
        filtered = filtered.filter((d) =>
          (d.customerId || "")
            .toLowerCase()
            .includes(customerIdFilter.toLowerCase())
        );
      }

      // Filter by invoice ID
      if (invoiceFilter) {
        filtered = filtered.filter((d) =>
          (d.invoiceId || "")
            .toLowerCase()
            .includes(invoiceFilter.toLowerCase())
        );
      }

      // Filter by payment ID
      if (paymentFilter) {
        filtered = filtered.filter((d) =>
          (d.paymentId || "")
            .toLowerCase()
            .includes(paymentFilter.toLowerCase())
        );
      }

      // Filter by start date
      if (startDateFilter) {
        filtered = filtered.filter((d) => {
          const disputeDate = new Date(d.createdAt);
          const startDate = new Date(startDateFilter);
          return disputeDate >= startDate;
        });
      }

      // Filter by end date
      if (endDateFilter) {
        filtered = filtered.filter((d) => {
          const disputeDate = new Date(d.createdAt);
          const endDate = new Date(endDateFilter);
          endDate.setHours(23, 59, 59, 999);
          return disputeDate <= endDate;
        });
      }

      setFilteredDisputes(filtered);
    }
  }, [
    activeTab,
    feedbackHistory,
    disputes,
    statusFilter,
    categoryFilter,
    customerIdFilter,
    invoiceFilter,
    paymentFilter,
    startDateFilter,
    endDateFilter,
  ]);

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Initialize filtered data when main data loads
  useEffect(() => {
    if (activeTab === "feedback") {
      setFilteredFeedbackHistory(feedbackHistory);
    } else {
      setFilteredDisputes(disputes);
    }
  }, [feedbackHistory, disputes, activeTab]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({
      message,
      type,
      isVisible: true,
    });
  };

  const validateFeedbackForm = (): boolean => {
    console.log("🔍 === VALIDATING FEEDBACK FORM ===");
    console.log("📝 Form data being validated:", {
      message: feedbackForm.message,
      category: feedbackForm.category,
      messageLength: feedbackForm.message?.length,
    });

    logger.info("FeedbackDisputes", "=== VALIDATING FEEDBACK FORM ===");
    logger.info("FeedbackDisputes", "Form data being validated", {
      message: feedbackForm.message,
      category: feedbackForm.category,
      messageLength: feedbackForm.message?.length,
    });

    const errors: { message?: string; category?: string } = {};

    if (!feedbackForm.message.trim()) {
      errors.message = "Feedback message is required";
      logger.warn("FeedbackDisputes", "Validation error: Message is empty");
    } else if (feedbackForm.message.trim().length < 10) {
      errors.message = "Feedback message must be at least 10 characters long";
      logger.warn("FeedbackDisputes", "Validation error: Message too short", {
        length: feedbackForm.message.trim().length,
      });
    } else if (feedbackForm.message.trim().length > 1000) {
      errors.message = "Feedback message must be less than 1000 characters";
      logger.warn("FeedbackDisputes", "Validation error: Message too long", {
        length: feedbackForm.message.trim().length,
      });
    }

    if (!feedbackForm.category) {
      errors.category = "Please select a category";
      logger.warn("FeedbackDisputes", "Validation error: No category selected");
    }

    console.log("✅ Validation result:", {
      errors,
      isValid: Object.keys(errors).length === 0,
    });

    logger.info("FeedbackDisputes", "Validation result", {
      errors,
      isValid: Object.keys(errors).length === 0,
    });

    setFormErrors((prev) => ({ ...prev, feedback: errors }));
    return Object.keys(errors).length === 0;
  };

  const validateDisputeForm = (): boolean => {
    const errors: {
      invoiceId?: string;
      paymentId?: string;
      reason?: string;
      comments?: string;
      attachment?: string;
    } = {};

    // At least one ID is required
    if (!disputeForm.invoiceId && !disputeForm.paymentId) {
      errors.invoiceId = "Either Invoice ID or Payment ID is required";
      errors.paymentId = "Either Invoice ID or Payment ID is required";
    }

    // Validate Invoice ID format if provided
    if (disputeForm.invoiceId && !/^INV-\d+$/.test(disputeForm.invoiceId)) {
      errors.invoiceId = "Invoice ID must be in format INV-001";
    }

    // Validate Payment ID format if provided
    if (disputeForm.paymentId && !/^PAY-\d+$/.test(disputeForm.paymentId)) {
      errors.paymentId = "Payment ID must be in format PAY-001";
    }

    if (!disputeForm.reason) {
      errors.reason = "Please select a reason for the dispute";
    }

    // Validate comments if provided
    if (disputeForm.comments && disputeForm.comments.length > 500) {
      errors.comments = "Comments must be less than 500 characters";
    }

    // Validate attachment if provided
    if (disputeForm.attachment) {
      // Check file size (10MB limit)
      const base64Data = disputeForm.attachment.split(",")[1];
      const fileSizeInBytes = (base64Data.length * 3) / 4;
      const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

      if (fileSizeInMB > 10) {
        errors.attachment = "File size must be less than 10MB";
      }
    }

    setFormErrors((prev) => ({ ...prev, dispute: errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSearch = () => {
    if (activeTab === "feedback") {
      const filtered = feedbackHistory.filter(
        (feedback) =>
          feedback.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          feedback.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFeedbackHistory(filtered);
    } else {
      const filtered = disputes.filter(
        (dispute) =>
          dispute.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dispute.reference.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDisputes(filtered);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (activeTab === "feedback") {
      setFilteredFeedbackHistory(feedbackHistory);
    } else {
      setFilteredDisputes(disputes);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🚀 === FEEDBACK SUBMIT FUNCTION CALLED ===");
    console.log("📝 Form event:", e);
    console.log("📋 Current form state:", feedbackForm);

    logger.info("FeedbackDisputes", "=== FEEDBACK SUBMIT FUNCTION CALLED ===");
    logger.info("FeedbackDisputes", "Form event", e);
    logger.info("FeedbackDisputes", "Current form state", feedbackForm);

    if (!validateFeedbackForm()) {
      logger.warn("FeedbackDisputes", "Form validation failed");
      showToast("Please fix the validation errors", "error");
      return;
    }

    logger.info(
      "FeedbackDisputes",
      "Form validation passed, proceeding with submission"
    );

    setLoading(true);
    try {
      // Log exactly what we're sending to the API
      const apiPayload = {
        category: feedbackForm.category,
        message: feedbackForm.message,
      };

      console.log("🚀 === SENDING TO API ENDPOINT ===");
      console.log("📍 Endpoint: POST /api/faan/feedbacks");
      console.log("📤 Payload being sent:", apiPayload);
      console.log("📋 Full form data:", feedbackForm);

      logger.info("FeedbackDisputes", "Submitting feedback", {
        category: feedbackForm.category,
        message: feedbackForm.message,
        formData: feedbackForm,
        apiPayload: apiPayload,
      });

      const result = await submitFeedback(apiPayload);

      logger.info("FeedbackDisputes", "Feedback submission result", {
        hasResult: !!result,
        status: result?.status,
        statusCode: result?.statusCode,
        message: result?.message,
        data: result?.data,
      });

      console.log("✅ === FEEDBACK SUBMISSION SUCCESS ===");
      console.log("📊 Result:", result);
      console.log("📋 Result status:", result?.status);
      console.log("📄 Result message:", result?.message);

      if (result?.status) {
        showToast("Feedback submitted successfully!", "success");
        setShowFeedbackModal(false);
        setFeedbackForm({ message: "", category: "GENERAL" });
        setFormErrors((prev) => ({ ...prev, feedback: {} }));

        // Refresh feedback list
        if (!isAdmin) {
          console.log("🔄 === REFRESHING FEEDBACK LIST ===");
          logger.info(
            "FeedbackDisputes",
            "Refreshing customer feedback after submission..."
          );
          const feedbackResult = await getCustomerFeedback();
          console.log("📥 === REFRESH RESULT ===");
          console.log("📊 Has result:", !!feedbackResult);
          console.log("📋 Has data:", !!feedbackResult?.data);
          console.log("📏 Data length:", feedbackResult?.data?.length);
          console.log("📄 Full result:", feedbackResult);

          logger.info("FeedbackDisputes", "Refresh feedback result", {
            hasResult: !!feedbackResult,
            hasData: !!feedbackResult?.data,
            dataLength: feedbackResult?.data?.length,
          });

          if (feedbackResult?.data) {
            const feedbackData: FeedbackHistory[] = feedbackResult.data.map(
              (f) => ({
                id: f.id,
                message: f.message,
                category: f.category,
                createdAt: f.createdAt,
                status: f.status,
              })
            );
            console.log("✅ === UPDATING FEEDBACK STATE ===");
            console.log("📊 Feedback data count:", feedbackData.length);
            console.log("📋 Feedback data:", feedbackData);
            setFeedbackHistory(feedbackData);
            setFilteredFeedbackHistory(feedbackData);
            console.log("✅ State updated successfully");
          } else {
            // No feedback found or API failed
            console.log("⚠️ === NO FEEDBACK DATA FOUND ===");
            console.log("📊 Setting empty arrays");
            logger.warn(
              "FeedbackDisputes",
              "No customer feedback data found after refresh"
            );
            setFeedbackHistory([]);
            setFilteredFeedbackHistory([]);
          }
        }
      } else {
        showToast(
          result?.message || "Failed to submit feedback. Please try again.",
          "error"
        );
      }
    } catch (error) {
      logger.error("Feedback", "Failed to submit feedback", error);
      showToast("Failed to submit feedback. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDisputeForm()) {
      showToast("Please fix the validation errors", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await submitDispute({
        invoiceId: disputeForm.invoiceId,
        paymentId: disputeForm.paymentId,
        reason: disputeForm.reason,
        comments: disputeForm.comments,
        attachment: disputeForm.attachment,
      });

      if (result?.status) {
        showToast(
          `Dispute submitted successfully! Reference: ${result.data?.reference}`,
          "success"
        );
        setShowDisputeModal(false);
        setDisputeForm({ reason: "", comments: "" });
        setFormErrors((prev) => ({ ...prev, dispute: {} }));

        // Clear file input
        const fileInput = document.getElementById(
          "dispute-attachment"
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }

        // Refresh disputes list
        if (isAdmin) {
          // For admin, refresh using real API with current filters
          const adminDisputesResult = await getAdminDisputes({
            startDate: startDateFilter || undefined,
            endDate: endDateFilter || undefined,
            customerId: customerIdFilter || undefined,
            status: statusFilter || undefined,
            invoiceId: invoiceFilter || undefined,
            paymentId: paymentFilter || undefined,
          });

          if (adminDisputesResult?.data) {
            const disputesData: Dispute[] = adminDisputesResult.data.map(
              (d) => ({
                id: d.id,
                reference: d.reference,
                invoiceId: d.invoiceId,
                paymentId: d.paymentId,
                reason: d.reason,
                category: d.category || "Others",
                comments: d.comments,
                status: d.status,
                resolutionNotes: d.resolutionNotes,
                customerId: d.customerId,
                customerName: d.customerName,
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
                attachmentUrl: d.attachmentUrl,
              })
            );
          disputesData.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setDisputes(disputesData);
            setFilteredDisputes(disputesData);
          } else {
            setDisputes([]);
            setFilteredDisputes([]);
          }
        } else {
          // For customers, refresh using real API
          const disputesResult = await getCustomerDisputes();
          if (disputesResult?.data) {
            const disputesData: Dispute[] = (
              disputesResult.data as unknown as ApiCustomerDisputeData[]
            ).map((d: ApiCustomerDisputeData) => ({
              id: d.disputeId.toString(),
              reference: `DISP-${d.disputeId}`,
              invoiceId: d.invoiceId || undefined,
              paymentId: d.paymentId || undefined,
              reason: d.reason,
              category: "Others", // API doesn't provide category, defaulting to "Others"
              comments: d.comment || undefined,
              status:
                d.status === "CREATED"
                  ? "Pending"
                  : (d.status as
                      | "Pending"
                      | "In Review"
                      | "Resolved"
                      | "Closed"),
              resolutionNotes: d.resolutionNote || undefined,
              customerId: d.customerId,
              createdAt: d.createdAt,
              updatedAt: d.updatedAt,
              attachmentUrl: d.attachment || undefined,
            }));
            setDisputes(disputesData);
            setFilteredDisputes(disputesData);
          } else {
            setDisputes([]);
            setFilteredDisputes([]);
          }
        }
      } else {
        showToast(
          result?.message || "Failed to submit dispute. Please try again.",
          "error"
        );
      }
    } catch (error) {
      logger.error("Dispute", "Failed to submit dispute", error);
      showToast("Failed to submit dispute. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDisputeStatus = async (
    disputeId: string,
    newStatus: string,
    resolutionNotes?: string
  ) => {
    try {
      // For admin with mock data, simulate the API call
      if (isAdmin) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Refresh admin disputes using real API with current filters
        const adminDisputesResult = await getAdminDisputes({
          startDate: startDateFilter || undefined,
          endDate: endDateFilter || undefined,
          customerId: customerIdFilter || undefined,
          status: statusFilter || undefined,
          invoiceId: invoiceFilter || undefined,
          paymentId: paymentFilter || undefined,
        });

        if (adminDisputesResult?.data) {
          const disputesData: Dispute[] = adminDisputesResult.data.map((d) => ({
            id: d.id,
            reference: d.reference,
            invoiceId: d.invoiceId,
            paymentId: d.paymentId,
            reason: d.reason,
            category: d.category || "Others",
            comments: d.comments,
            status: d.status,
            resolutionNotes: d.resolutionNotes,
            customerId: d.customerId,
            customerName: d.customerName,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
            attachmentUrl: d.attachmentUrl,
          }));
          setDisputes(disputesData);
          setFilteredDisputes(disputesData);
        } else {
          setDisputes([]);
          setFilteredDisputes([]);
        }

        showToast("Dispute status updated successfully!", "success");
        setShowDisputeDetailsModal(false);
        setSelectedDispute(null);
      } else {
        // For customer, use real API
        const result = await updateDisputeStatus(disputeId, {
          disputeId: disputeId,
          status: newStatus as "IN_REVIEW" | "RESOLVED" | "CLOSED",
        });

        if (result?.status) {
          // Update local state
          setDisputes((prev) =>
            prev.map((d) =>
              d.id === disputeId
                ? {
                    ...d,
                    status: newStatus as
                      | "Pending"
                      | "In Review"
                      | "Resolved"
                      | "Closed",
                    resolutionNotes,
                    updatedAt: new Date().toISOString(),
                  }
                : d
            )
          );

          setFilteredDisputes((prev) =>
            prev.map((d) =>
              d.id === disputeId
                ? {
                    ...d,
                    status: newStatus as
                      | "Pending"
                      | "In Review"
                      | "Resolved"
                      | "Closed",
                    resolutionNotes,
                    updatedAt: new Date().toISOString(),
                  }
                : d
            )
          );

          showToast("Dispute status updated successfully!", "success");
          setShowDisputeDetailsModal(false);
          setSelectedDispute(null);
        } else {
          showToast(
            result?.message ||
              "Failed to update dispute status. Please try again.",
            "error"
          );
        }
      }
    } catch (error) {
      logger.error("Dispute", "Failed to update dispute status", error);
      showToast("Failed to update dispute status. Please try again.", "error");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock size={16} className="status-icon pending" />;
      case "In Review":
        return <AlertCircle size={16} className="status-icon review" />;
      case "Resolved":
        return <CheckCircle size={16} className="status-icon resolved" />;
      case "Closed":
        return <XCircle size={16} className="status-icon closed" />;
      default:
        return <Clock size={16} className="status-icon" />;
    }
  };

  const renderCustomerView = () => (
    <div className="feedback-disputes-page">
      <div className="page-header">
        <PageTitle
          icon="/icons/feedback-disputes-icon.svg"
          title="Feedback & Disputes"
          subtitle="Share your feedback or raise disputes about transactions"
        />
      </div>

      <div className="feedback-disputes-tabs-row">
        <SwitchingTabs
          items={[
            {
              id: "feedback",
              label: "Submit Feedback",
            },
            {
              id: "disputes",
              label: "My Disputes",
            },
          ]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as "feedback" | "disputes")}
        />
      </div>

      <div className="tab-content">
        {activeTab === "feedback" && (
          <div className="feedback-section">
            <div className="page-actions">
              <div className="feedback-search-section">
                <div className="feedback-search-inputs feedback-action-buttons">
                  <div className="search-controls">
                    <FieldButton
                      inputs={[
                        {
                          placeholder: "Search feedback",
                          value: searchQuery,
                          onChange: (e) => {
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
                        {
                          text: "Submit Feedback",
                          onClick: () => setShowFeedbackModal(true),
                        },
                      ]}
                      className="feedback-fieldbutton"
                    />
                  </div>
                </div>
              </div>
            </div>

            {filteredFeedbackHistory.length > 0 ? (
              <div className="feedback-history-section">
                <h3>Your Feedback:</h3>
                <div style={{ paddingTop: '32px' }}>
                <DataTable
                  headers={["Feedback ID", "Category", "Message", "Status", "Date", "Action"]}
                  data={filteredFeedbackHistory.map((feedback) => [
                    <span className="reference-code">{feedback.id}</span>,
                    <span className={`category-badge ${(feedback.category || "").toLowerCase()}`}>
                      {feedback.category}
                    </span>,
                    <span className="message-preview" style={{ maxWidth: '300px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {feedback.message}
                    </span>,
                    <span className={`status-badge ${(feedback.status || "unknown").toLowerCase().replace(" ", "-")}`}>
                      {feedback.status || "Unknown"}
                    </span>,
                    new Date(feedback.createdAt).toLocaleDateString(),
                    <button
                      className="view-reason-btn"
                      onClick={() => {
                        setSelectedFeedback(feedback);
                        setShowFeedbackDetailsModal(true);
                      }}
                    >
                      View Details
                    </button>
                  ])}
                  itemsPerPage={10}
                />
                </div>
              </div>
            ) : (
              <EmptyState
                title="No Feedback Available"
                message="You haven't submitted any feedback yet. Click 'Submit Feedback' to get started."
              />
            )}
          </div>
        )}

        {activeTab === "disputes" && (
          <div className="disputes-section">
            <div className="page-actions">
              <div className="disputes-search-section">
                <div className="disputes-search-inputs disputes-action-buttons">
                  <div className="search-controls">
                    <FieldButton
                      inputs={[
                        {
                          placeholder: "Search disputes",
                          value: searchQuery,
                          onChange: (e) => {
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
                        {
                          text: "Raise New Dispute",
                          onClick: () => setShowDisputeModal(true),
                        },
                      ]}
                      className="disputes-fieldbutton"
                    />
                  </div>
                </div>
              </div>
            </div>

            {filteredDisputes.length > 0 ? (
              <div className="disputes-history-section">
                <h3>Your Disputes:</h3>
                <div style={{ paddingTop: '32px' }}>
                <DataTable
                  headers={["Dispute ID", "Reference", "Type", "Reason", "Status", "Date", "Action"]}
                  data={filteredDisputes.map((dispute) => [
                    <span className="reference-code">{dispute.id}</span>,
                    <span className="tx-ref">{dispute.reference}</span>,
                    <span className={`type-badge ${dispute.invoiceId ? 'invoice' : 'payment'}`}>
                      {dispute.invoiceId ? "Invoice" : "Payment"}
                    </span>,
                    dispute.reason,
                    <span className={`status-badge ${(dispute.status || "unknown").toLowerCase().replace(" ", "-")}`}>
                      {dispute.status || "Unknown"}
                    </span>,
                    new Date(dispute.createdAt).toLocaleDateString(),
                    <button
                      className="view-reason-btn"
                      onClick={() => {
                        setSelectedDispute(dispute);
                        setShowDisputeDetailsModal(true);
                      }}
                    >
                      View Details
                    </button>
                  ])}
                  itemsPerPage={10}
                />
                </div>
              </div>
            ) : (
              <EmptyState
                title="No Disputes Available"
                message="You haven't raised any disputes yet. Click 'Raise New Dispute' to get started."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderAdminView = () => (
    <div className="feedback-disputes-page">
      <div className="page-header">
        <PageTitle
          icon="/icons/feedback-disputes-icon.svg"
          title="Feedback & Disputes Management"
          subtitle="Manage customer feedback and resolve disputes"
        />
      </div>

      <div className="feedback-disputes-tabs-row">
        <SwitchingTabs
          items={[
            {
              id: "feedback",
              label: "All Feedback",
            },
            {
              id: "disputes",
              label: "All Disputes",
            },
          ]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as "feedback" | "disputes")}
        />
      </div>

      <div className="tab-content">
        {activeTab === "feedback" && (
          <div className="admin-feedback-section">
            <div className="feedback-disputes-filter-row">
              <div className="feedback-disputes-filters">
                <div className="filter-group">
                  <ListBox
                    label="Status"
                    placeholder="All Statuses"
                    options={[
                      { value: "", label: "All Statuses" },
                      { value: "Submitted", label: "Submitted" },
                      { value: "In Review", label: "In Review" },
                      { value: "Resolved", label: "Resolved" },
                    ]}
                    value={statusFilter}
                    onChange={(option) => setStatusFilter(option.value)}
                  />
                </div>

                <div className="filter-group">
                  <Input
                    label="Start Date"
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    placeholder="Select start date"
                  />
                </div>

                <div className="filter-group">
                  <Input
                    label="End Date"
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    placeholder="Select end date"
                  />
                </div>

                <div className="filter-group">
                  <SearchInput
                    placeholder="Customer ID"
                    value={customerIdFilter}
                    onChange={(e) => {
                      const value = (e.target as HTMLInputElement).value;
                      setCustomerIdFilter(value);
                    }}
                  />
                </div>

                <div className="filter-group">
                  <ListBox
                    label="Category"
                    placeholder="All Categories"
                    options={[
                      { value: "", label: "All Categories" },
                      ...feedbackCategories.map((category) => ({
                        value: category,
                        label: category,
                      })),
                    ]}
                    value={categoryFilter}
                    onChange={(option) => setCategoryFilter(option.value)}
                  />
                </div>

                <div className="filter-group">
                  <SolidButton
                    text="Clear Filters"
                    onClick={() => {
                      setStatusFilter("");
                      setStartDateFilter("");
                      setEndDateFilter("");
                      setCustomerIdFilter("");
                      setCategoryFilter("");
                      // Filters will auto-apply via useEffect
                    }}
                    variant="secondary"
                    size="medium"
                  />
                </div>
              </div>
            </div>

            <div className="admin-feedback-grid-section">
              <h3>All Feedback</h3>
              {filteredFeedbackHistory.length > 0 ? (
                <div style={{ paddingTop: '32px' }}>
                  <DataTable
                    headers={["Feedback ID", "Category", "Message", "Status", "Date", "Action"]}
                    data={filteredFeedbackHistory.map((feedback) => [
                    <span className="reference-code">{feedback.id}</span>,
                    <span className={`category-badge ${(feedback.category || "").toLowerCase()}`}>
                      {feedback.category}
                    </span>,
                    <span className="message-preview" style={{ maxWidth: '300px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {feedback.message}
                    </span>,
                    <span className={`status-badge ${(feedback.status || "unknown").toLowerCase().replace(" ", "-")}`}>
                      {feedback.status || "Unknown"}
                    </span>,
                    new Date(feedback.createdAt).toLocaleDateString(),
                    <button
                      className="view-reason-btn"
                      onClick={() => {
                        setSelectedFeedback(feedback);
                        setShowFeedbackDetailsModal(true);
                      }}
                    >
                      View Details
                    </button>
                  ])}
                  itemsPerPage={10}
                />
                </div>
              ) : (
                <EmptyState
                  title="No Feedback Available"
                  message="There are no feedback records to display at the moment."
                />
              )}
            </div>
          </div>
        )}

        {activeTab === "disputes" && (
          <div className="admin-disputes-section">
            <div className="feedback-disputes-filter-row">
              <div className="feedback-disputes-filters">
                <div className="filter-group">
                  <ListBox
                    label="Status"
                    placeholder="All Statuses"
                    options={[
                      { value: "", label: "All Statuses" },
                      { value: "IN_REVIEW", label: "In Review" },
                      { value: "RESOLVED", label: "Resolved" },
                      { value: "CLOSED", label: "Closed" },
                    ]}
                    value={statusFilter}
                    onChange={(option) => setStatusFilter(option.value)}
                  />
                </div>

                <div className="filter-group">
                  <Input
                    label="Start Date"
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    placeholder="Select start date"
                  />
                </div>

                <div className="filter-group">
                  <Input
                    label="End Date"
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    placeholder="Select end date"
                  />
                </div>

                <div className="filter-group">
                  <SearchInput
                    placeholder="Customer ID"
                    value={customerIdFilter}
                    onChange={(e) => {
                      const value = (e.target as HTMLInputElement).value;
                      setCustomerIdFilter(value);
                    }}
                  />
                </div>

                <div className="filter-group">
                  <SearchInput
                    placeholder="Invoice ID"
                    value={invoiceFilter}
                    onChange={(e) => {
                      const value = (e.target as HTMLInputElement).value;
                      setInvoiceFilter(value);
                    }}
                  />
                </div>

                <div className="filter-group">
                  <SearchInput
                    placeholder="Payment ID"
                    value={paymentFilter}
                    onChange={(e) => {
                      const value = (e.target as HTMLInputElement).value;
                      setPaymentFilter(value);
                    }}
                  />
                </div>

                <div className="filter-group">
                  <SolidButton
                    text="Clear Filters"
                    onClick={() => {
                      setStatusFilter("");
                      setStartDateFilter("");
                      setEndDateFilter("");
                      setCustomerIdFilter("");
                      setInvoiceFilter("");
                      setPaymentFilter("");
                      // Filters will auto-apply via useEffect
                    }}
                    variant="secondary"
                    size="medium"
                  />
                </div>
              </div>
            </div>

            <div className="admin-disputes-grid-section">
              <h3>All Disputes</h3>
              {filteredDisputes.length > 0 ? (
                <div style={{ paddingTop: '32px' }}>
                  <DataTable
                    headers={["Dispute ID", "Reference", "Type", "Reason", "Status", "Date", "Action"]}
                    data={filteredDisputes.map((dispute) => [
                    <span className="reference-code">{dispute.id}</span>,
                    <span className="tx-ref">{dispute.reference}</span>,
                    <span className={`type-badge ${dispute.invoiceId ? 'invoice' : 'payment'}`}>
                      {dispute.invoiceId ? "Invoice" : "Payment"}
                    </span>,
                    dispute.reason,
                    <span className={`status-badge ${(dispute.status || "unknown").toLowerCase().replace(" ", "-")}`}>
                      {dispute.status || "Unknown"}
                    </span>,
                    new Date(dispute.createdAt).toLocaleDateString(),
                    <button
                      className="view-reason-btn"
                      onClick={() => {
                        setSelectedDispute(dispute);
                        setShowDisputeDetailsModal(true);
                      }}
                    >
                      View Details
                    </button>
                  ])}
                  itemsPerPage={10}
                />
                </div>
              ) : (
                <EmptyState
                  title="No Disputes Available"
                  message="There are no dispute records to display at the moment."
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <LoadingSpinner
        isVisible={loading}
        message="Loading feedback and disputes..."
      />
      <MessageToast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />

      {isAdmin ? renderAdminView() : renderCustomerView()}

      {/* Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        showHeader={true}
        headerTitle="Submit Feedback"
      >
        <form onSubmit={handleFeedbackSubmit} className="feedback-form">
          <div className="form-group">
            <ListBox
              label="Category"
              options={feedbackCategories.map((category) => ({
                value: category,
                label: category,
              }))}
              value={feedbackForm.category}
              onChange={(option) => {
                setFeedbackForm((prev) => ({
                  ...prev,
                  category: option.value,
                }));
                // Clear category error when user selects
                if (formErrors.feedback?.category) {
                  setFormErrors((prev) => ({
                    ...prev,
                    feedback: { ...prev.feedback, category: undefined },
                  }));
                }
              }}
              error={formErrors.feedback?.category}
            />
          </div>

          <TextArea
            id="feedback-message"
            label="Message"
            value={feedbackForm.message}
            onChange={(e) => {
              setFeedbackForm((prev) => ({
                ...prev,
                message: e.target.value,
              }));
              // Clear message error when user types
              if (formErrors.feedback?.message) {
                setFormErrors((prev) => ({
                  ...prev,
                  feedback: { ...prev.feedback, message: undefined },
                }));
              }
            }}
            placeholder="Please share your feedback..."
            rows={5}
            error={formErrors.feedback?.message}
            required
          />

          <div className="form-actions">
            <SolidButton
              text="Cancel"
              onClick={() => setShowFeedbackModal(false)}
              variant="secondary"
              size="medium"
            />
            <SolidButton
              text="Submit Feedback"
              type="submit"
              variant="primary"
              size="medium"
              loading={loading}
              disabled={loading}
            />
          </div>
        </form>
      </Modal>

      {/* Dispute Modal */}
      <Modal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        showHeader={true}
        headerTitle="Raise New Dispute"
      >
        <form onSubmit={handleDisputeSubmit} className="dispute-form">
          <Input
            label="Invoice ID (optional)"
            type="text"
            value={disputeForm.invoiceId || ""}
            onChange={(e) => {
              setDisputeForm((prev) => ({
                ...prev,
                invoiceId: e.target.value,
              }));
              // Clear invoice ID error when user types
              if (formErrors.dispute?.invoiceId) {
                setFormErrors((prev) => ({
                  ...prev,
                  dispute: { ...prev.dispute, invoiceId: undefined },
                }));
              }
            }}
            placeholder="e.g., INV-001"
            error={formErrors.dispute?.invoiceId}
          />

          <Input
            label="Payment ID (optional)"
            type="text"
            value={disputeForm.paymentId || ""}
            onChange={(e) => {
              setDisputeForm((prev) => ({
                ...prev,
                paymentId: e.target.value,
              }));
              // Clear payment ID error when user types
              if (formErrors.dispute?.paymentId) {
                setFormErrors((prev) => ({
                  ...prev,
                  dispute: { ...prev.dispute, paymentId: undefined },
                }));
              }
            }}
            placeholder="e.g., PAY-001"
            error={formErrors.dispute?.paymentId}
          />

          <ListBox
            label="Reason"
            options={disputeReasons.map((reason) => ({
              value: reason,
              label: reason,
            }))}
            value={disputeForm.reason}
            onChange={(option) => {
              setDisputeForm((prev) => ({ ...prev, reason: option.value }));
              // Clear reason error when user selects
              if (formErrors.dispute?.reason) {
                setFormErrors((prev) => ({
                  ...prev,
                  dispute: { ...prev.dispute, reason: undefined },
                }));
              }
            }}
            placeholder="Select a reason"
            error={formErrors.dispute?.reason}
          />

          <TextArea
            id="dispute-comments"
            label="Additional Comments"
            value={disputeForm.comments || ""}
            onChange={(e) => {
              setDisputeForm((prev) => ({
                ...prev,
                comments: e.target.value,
              }));
              // Clear comments error when user types
              if (formErrors.dispute?.comments) {
                setFormErrors((prev) => ({
                  ...prev,
                  dispute: { ...prev.dispute, comments: undefined },
                }));
              }
            }}
            placeholder="Please provide additional details about your dispute..."
            rows={4}
            error={formErrors.dispute?.comments}
          />

          <FileUpload
            id="dispute-attachment"
            label="Attachment (optional)"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            value={disputeForm.attachment}
            fileName={disputeForm.attachmentFileName}
            onChange={(file) => {
              if (file) {
                // Convert file to base64 for API submission
                const reader = new FileReader();
                reader.onload = () => {
                  setDisputeForm((prev) => ({
                    ...prev,
                    attachment: reader.result as string,
                    attachmentFileName: file.name,
                  }));
                };
                reader.readAsDataURL(file);
              } else {
                setDisputeForm((prev) => ({
                  ...prev,
                  attachment: undefined,
                  attachmentFileName: undefined,
                }));
              }
              // Clear attachment error when user selects file
              if (formErrors.dispute?.attachment) {
                setFormErrors((prev) => ({
                  ...prev,
                  dispute: { ...prev.dispute, attachment: undefined },
                }));
              }
            }}
            hint="Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG, GIF (Max 10MB)"
            error={formErrors.dispute?.attachment}
          />

          <div className="form-actions">
            <SolidButton
              text="Cancel"
              onClick={() => setShowDisputeModal(false)}
              variant="secondary"
              size="medium"
            />
            <SolidButton
              text="Submit Dispute"
              type="submit"
              variant="primary"
              size="medium"
              loading={loading}
              disabled={loading}
            />
          </div>
        </form>
      </Modal>

      {/* Dispute Details Modal */}
      <Modal
        isOpen={showDisputeDetailsModal}
        onClose={() => {
          setShowDisputeDetailsModal(false);
          setSelectedDispute(null);
        }}
        showHeader={true}
        headerTitle={`Dispute ${selectedDispute?.reference || ""}`}
      >
        {selectedDispute && (
          <div className="dispute-details">
            <div className="dispute-info">
              <div className="info-row">
                <span className="label">Reference:</span>
                <span className="value">{selectedDispute.reference}</span>
              </div>

              <div className="info-row">
                <span className="label">Type:</span>
                <span className="value">
                  {selectedDispute.invoiceId ? "Invoice" : "Payment"}
                </span>
              </div>

              <div className="info-row">
                <span className="label">Category:</span>
                <span className="value">{selectedDispute.category}</span>
              </div>

              {selectedDispute.invoiceId && (
                <div className="info-row">
                  <span className="label">Invoice ID:</span>
                  <span className="value">{selectedDispute.invoiceId}</span>
                </div>
              )}

              {selectedDispute.paymentId && (
                <div className="info-row">
                  <span className="label">Payment ID:</span>
                  <span className="value">{selectedDispute.paymentId}</span>
                </div>
              )}

              <div className="info-row">
                <span className="label">Reason:</span>
                <span className="value">{selectedDispute.reason}</span>
              </div>

              <div className="info-row">
                <span className="label">Status:</span>
                <span className="value status-value">
                  <span
                    className={`status-badge ${(selectedDispute.status || "")
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {getStatusIcon(selectedDispute.status || "")}
                    {selectedDispute.status}
                  </span>
                </span>
              </div>

              <div className="info-row">
                <span className="label">Created:</span>
                <span className="value">
                  {new Date(selectedDispute.createdAt).toLocaleString()}
                </span>
              </div>

              {selectedDispute.comments && (
                <div className="info-row">
                  <span className="label">Comments:</span>
                  <span className="value">{selectedDispute.comments}</span>
                </div>
              )}

              {selectedDispute.resolutionNotes && (
                <div className="info-row">
                  <span className="label">Resolution Notes:</span>
                  <span className="value resolution-notes-value">
                    {selectedDispute.resolutionNotes}
                  </span>
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="admin-actions">
                <div className="form-group">
                  <ListBox
                    label="Update Status:"
                    options={[
                      { value: "IN_REVIEW", label: "In Review" },
                      { value: "RESOLVED", label: "Resolved" },
                      { value: "CLOSED", label: "Closed" },
                    ]}
                    value={adminSelectedStatus || selectedDispute.status}
                    onChange={(option) => {
                      // update local selected status for admin before saving
                      setAdminSelectedStatus(option.value);
                    }}
                  />
                  {/* local selected status is stored in `adminSelectedStatus` */}
                </div>

                <TextArea
                  id="resolutionNotes"
                  label="Resolution Notes"
                  placeholder="Add resolution notes..."
                  rows={3}
                  defaultValue={selectedDispute.resolutionNotes || ""}
                />

                <div className="form-actions">
                  <SolidButton
                    text="Update Status"
                    onClick={() => {
                      const newStatus =
                        adminSelectedStatus || selectedDispute.status;
                      const resolutionNotes = (
                        document.getElementById(
                          "resolutionNotes"
                        ) as HTMLInputElement
                      )?.value;
                      handleUpdateDisputeStatus(
                        selectedDispute.id,
                        newStatus,
                        resolutionNotes
                      );
                    }}
                    variant="secondary"
                    size="medium"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Feedback Details Modal */}
      <Modal
        isOpen={showFeedbackDetailsModal}
        onClose={() => {
          setShowFeedbackDetailsModal(false);
          setSelectedFeedback(null);
        }}
        showHeader={true}
        headerTitle="Feedback Details"
      >
        {selectedFeedback && (
          <div className="feedback-details">
            <div className="feedback-info">
              <div className="info-row">
                <span className="label">Category:</span>
                <span className="value">{selectedFeedback.category}</span>
              </div>

              {/* Status removed from feedback details per request */}

              <div className="info-row">
                <span className="label">Submitted:</span>
                <span className="value">
                  {new Date(selectedFeedback.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="info-row">
                <span className="label">Message:</span>
                <div
                  className="value feedback-full-message"
                 
                >
                  {selectedFeedback.message}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default FeedbackDisputesPage;
