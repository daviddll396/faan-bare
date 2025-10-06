import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { logger } from "../../../utils/logger";
import Modal from "../../reusables/Modal/Modal";
import SolidButton from "../../reusables/SolidButton/SolidButton";
import MessageToast from "../../reusables/MessageToast/MessageToast";
import Input from "../../reusables/Input/Input";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import SwitchingTabs from "../../reusables/SwitchingTabs/SwitchingTabs";
import ListBox from "../../reusables/ListBox/ListBox";
import FeedbackCard from "../../reusables/FeedbackCard/FeedbackCard";
import DisputeCard from "../../reusables/DisputeCard/DisputeCard";
import Grid from "../../reusables/Grid/Grid";
import FieldButton from "../../reusables/FieldButton/FieldButton";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
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
  category: string;
  comments?: string;
  attachment?: File;
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
  id: string;
  reference: string;
  invoiceId?: string;
  paymentId?: string;
  reason: string;
  category: string;
  comments?: string;
  status: "Pending" | "In Review" | "Resolved" | "Closed";
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  attachmentUrl?: string;
}

const FeedbackDisputesPage: React.FC = () => {
  const {
    user,
    submitFeedback,
    submitDispute,
    getCustomerDisputes,
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
  const [selectedFeedback, setSelectedFeedback] =
    useState<FeedbackHistory | null>(null);
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormData>({
    message: "",
    category: "General",
  });
  const [disputeForm, setDisputeForm] = useState<DisputeFormData>({
    reason: "",
    category: "Payment",
    comments: "",
  });
  const [formErrors, setFormErrors] = useState<{
    feedback?: { message?: string; category?: string };
    dispute?: {
      invoiceId?: string;
      paymentId?: string;
      reason?: string;
      category?: string;
      comments?: string;
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
  const [dateFilter, setDateFilter] = useState<string>("");
  const [invoiceFilter, setInvoiceFilter] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");

  const isAdmin = user?.role === "Admin";

  // Feedback categories
  const feedbackCategories = [
    "General",
    "Service Quality",
    "Technical Issues",
    "Payment Problems",
    "User Experience",
    "Suggestions",
    "Other",
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

  // Dispute categories
  const disputeCategories = ["Invoice", "Payment", "Others"];

  // Status options for admin
  const statusOptions = ["Pending", "In Review", "Resolved", "Closed"];

  // Mock data for admin feedback
  const mockAdminFeedback: FeedbackHistory[] = useMemo(
    () => [
      {
        id: "admin-feedback-1",
        message:
          "The payment process is very smooth and user-friendly. Great job on the interface design!",
        category: "User Experience",
        createdAt: "2024-01-20T14:30:00Z",
        status: "Submitted",
        customerId: "CUST-001",
        customerName: "John Doe",
      },
      {
        id: "admin-feedback-2",
        message:
          "I experienced some delays in receiving payment confirmations. Could you please look into this?",
        category: "Technical Issues",
        createdAt: "2024-01-18T10:15:00Z",
        status: "In Review",
        customerId: "CUST-002",
        customerName: "Jane Smith",
      },
      {
        id: "admin-feedback-3",
        message:
          "It would be helpful to have email notifications for all transaction updates.",
        category: "Suggestions",
        createdAt: "2024-01-15T16:45:00Z",
        status: "Resolved",
        customerId: "CUST-003",
        customerName: "Michael Johnson",
      },
      {
        id: "admin-feedback-4",
        message:
          "The mobile app works well, but the desktop version could use some improvements in navigation.",
        category: "User Experience",
        createdAt: "2024-01-12T09:20:00Z",
        status: "Submitted",
        customerId: "CUST-004",
        customerName: "Sarah Wilson",
      },
      {
        id: "admin-feedback-5",
        message:
          "Payment processing is fast, but I'd like to see more payment options available.",
        category: "Suggestions",
        createdAt: "2024-01-10T11:30:00Z",
        status: "In Review",
        customerId: "CUST-005",
        customerName: "David Brown",
      },
    ],
    []
  );

  // Mock data for customer disputes
  const mockCustomerDisputes: Dispute[] = useMemo(
    () => [
      {
        id: "cust-disp-1",
        reference: "DISP-2024-101",
        invoiceId: "INV-2024-101",
        reason: "Incorrect Amount",
        category: "Invoice",
        comments:
          "The amount charged was higher than expected. Please review the invoice.",
        status: "Pending",
        customerId: user?.customerId || "CUST-001",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "cust-disp-2",
        reference: "DISP-2024-102",
        paymentId: "PAY-2024-102",
        reason: "Service Not Received",
        category: "Payment",
        comments:
          "Payment was made but the service was not provided as promised.",
        status: "In Review",
        customerId: user?.customerId || "CUST-001",
        createdAt: "2024-01-14T14:20:00Z",
        updatedAt: "2024-01-16T09:15:00Z",
      },
      {
        id: "cust-disp-3",
        reference: "DISP-2024-103",
        invoiceId: "INV-2024-103",
        reason: "Duplicate Charge",
        category: "Others",
        comments:
          "I was charged twice for the same service. Please refund the duplicate payment.",
        status: "Resolved",
        resolutionNotes:
          "Duplicate charge confirmed. Refund processed successfully.",
        customerId: user?.customerId || "CUST-001",
        createdAt: "2024-01-12T16:45:00Z",
        updatedAt: "2024-01-18T11:30:00Z",
      },
    ],
    [user?.customerId]
  );

  // Mock data for admin disputes
  const mockAdminDisputes: Dispute[] = useMemo(
    () => [
      {
        id: "1",
        reference: "DISP-2024-001",
        invoiceId: "INV-2024-001",
        reason: "Incorrect Amount",
        category: "Invoice",
        comments:
          "The amount charged was higher than expected. Please review the invoice.",
        status: "Pending",
        customerId: "CUST-001",
        customerName: "John Doe",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        reference: "DISP-2024-002",
        paymentId: "PAY-2024-002",
        reason: "Service Not Received",
        category: "Payment",
        comments:
          "Payment was made but the service was not provided as promised.",
        status: "In Review",
        customerId: "CUST-002",
        customerName: "Jane Smith",
        createdAt: "2024-01-14T14:20:00Z",
        updatedAt: "2024-01-16T09:15:00Z",
      },
      {
        id: "3",
        reference: "DISP-2024-003",
        invoiceId: "INV-2024-003",
        reason: "Duplicate Charge",
        category: "Others",
        comments:
          "I was charged twice for the same service. Please refund the duplicate payment.",
        status: "Resolved",
        resolutionNotes:
          "Duplicate charge confirmed. Refund processed successfully.",
        customerId: "CUST-003",
        customerName: "Michael Johnson",
        createdAt: "2024-01-12T16:45:00Z",
        updatedAt: "2024-01-18T11:30:00Z",
      },
      {
        id: "4",
        reference: "DISP-2024-004",
        paymentId: "PAY-2024-004",
        reason: "Technical Error",
        category: "Payment",
        comments:
          "Payment was processed but the system shows it as failed. Please investigate.",
        status: "Closed",
        resolutionNotes:
          "Technical issue resolved. Payment status updated correctly.",
        customerId: "CUST-004",
        customerName: "Sarah Wilson",
        createdAt: "2024-01-10T08:15:00Z",
        updatedAt: "2024-01-20T13:45:00Z",
      },
      {
        id: "5",
        reference: "DISP-2024-005",
        invoiceId: "INV-2024-005",
        reason: "Refund Not Received",
        category: "Invoice",
        comments:
          "Requested refund 2 weeks ago but still haven't received it in my account.",
        status: "In Review",
        customerId: "CUST-005",
        customerName: "David Brown",
        createdAt: "2024-01-08T12:00:00Z",
        updatedAt: "2024-01-17T10:20:00Z",
      },
      {
        id: "6",
        reference: "DISP-2024-006",
        paymentId: "PAY-2024-006",
        reason: "Other",
        category: "Others",
        comments:
          "The service quality was below expectations. Requesting partial refund.",
        status: "Pending",
        customerId: "CUST-006",
        customerName: "Lisa Anderson",
        createdAt: "2024-01-05T15:30:00Z",
        updatedAt: "2024-01-05T15:30:00Z",
      },
    ],
    []
  );

  // Mock data for customer feedback history
  const mockFeedbackHistory: FeedbackHistory[] = useMemo(
    () => [
      {
        id: "1",
        message:
          "The payment process is very smooth and user-friendly. Great job on the interface design!",
        category: "User Experience",
        createdAt: "2024-01-20T14:30:00Z",
        status: "Submitted",
      },
      {
        id: "2",
        message:
          "I experienced some delays in receiving payment confirmations. Could you please look into this?",
        category: "Technical Issues",
        createdAt: "2024-01-18T10:15:00Z",
        status: "In Review",
      },
      {
        id: "3",
        message:
          "It would be helpful to have email notifications for all transaction updates.",
        category: "Suggestions",
        createdAt: "2024-01-15T16:45:00Z",
        status: "Resolved",
      },
      {
        id: "4",
        message:
          "The mobile app works well, but the desktop version could use some improvements in navigation.",
        category: "User Experience",
        createdAt: "2024-01-12T09:20:00Z",
        status: "Submitted",
      },
    ],
    []
  );

  // Load disputes data
  useEffect(() => {
    const loadDisputes = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          // Use mock data for admin since endpoint doesn't exist yet
          setDisputes(mockAdminDisputes);
          setFilteredDisputes(mockAdminDisputes);
        } else {
          // Use mock data for customers since endpoint doesn't exist yet
          setDisputes(mockCustomerDisputes);
          setFilteredDisputes(mockCustomerDisputes);

          // Load mock feedback history for customers
          setFeedbackHistory(mockFeedbackHistory);
          setFilteredFeedbackHistory(mockFeedbackHistory);
        }
      } catch (error) {
        logger.error("FeedbackDisputes", "Failed to load disputes", error);
        showToast("Failed to load disputes. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadDisputes();
  }, [
    isAdmin,
    user?.customerId,
    getCustomerDisputes,
    mockAdminDisputes,
    mockCustomerDisputes,
    mockAdminFeedback,
    mockFeedbackHistory,
  ]);

  // Filter disputes for admin using mock data
  useEffect(() => {
    if (!isAdmin) return;

    const filterDisputes = () => {
      let filtered = [...mockAdminDisputes];

      // Filter by status
      if (statusFilter) {
        filtered = filtered.filter(
          (dispute) => dispute.status === statusFilter
        );
      }

      // Filter by date
      if (dateFilter) {
        const filterDate = new Date(dateFilter).toDateString();
        filtered = filtered.filter((dispute) => {
          const disputeDate = new Date(dispute.createdAt).toDateString();
          return disputeDate === filterDate;
        });
      }

      // Filter by invoice ID
      if (invoiceFilter) {
        filtered = filtered.filter((dispute) =>
          dispute.invoiceId?.toLowerCase().includes(invoiceFilter.toLowerCase())
        );
      }

      // Filter by payment ID
      if (paymentFilter) {
        filtered = filtered.filter((dispute) =>
          dispute.paymentId?.toLowerCase().includes(paymentFilter.toLowerCase())
        );
      }

      setFilteredDisputes(filtered);
    };

    filterDisputes();
  }, [
    statusFilter,
    dateFilter,
    invoiceFilter,
    paymentFilter,
    isAdmin,
    mockAdminDisputes,
  ]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({
      message,
      type,
      isVisible: true,
    });
  };

  const validateFeedbackForm = (): boolean => {
    const errors: { message?: string; category?: string } = {};

    if (!feedbackForm.message.trim()) {
      errors.message = "Feedback message is required";
    } else if (feedbackForm.message.trim().length < 10) {
      errors.message = "Feedback message must be at least 10 characters long";
    } else if (feedbackForm.message.trim().length > 1000) {
      errors.message = "Feedback message must be less than 1000 characters";
    }

    if (!feedbackForm.category) {
      errors.category = "Please select a category";
    }

    setFormErrors((prev) => ({ ...prev, feedback: errors }));
    return Object.keys(errors).length === 0;
  };

  const validateDisputeForm = (): boolean => {
    const errors: {
      invoiceId?: string;
      paymentId?: string;
      reason?: string;
      category?: string;
      comments?: string;
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

    if (!disputeForm.category) {
      errors.category = "Please select a category";
    }

    // Validate comments if provided
    if (disputeForm.comments && disputeForm.comments.length > 500) {
      errors.comments = "Comments must be less than 500 characters";
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

    if (!validateFeedbackForm()) {
      showToast("Please fix the validation errors", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await submitFeedback({
        message: feedbackForm.message,
        category: feedbackForm.category,
      });

      if (result?.status) {
        // Add new feedback to history
        const newFeedback: FeedbackHistory = {
          id: Date.now().toString(),
          message: feedbackForm.message,
          category: feedbackForm.category,
          createdAt: new Date().toISOString(),
          status: "Submitted",
        };
        setFeedbackHistory((prev) => [newFeedback, ...prev]);
        setFilteredFeedbackHistory((prev) => [newFeedback, ...prev]);

        showToast("Feedback submitted successfully!", "success");
        setShowFeedbackModal(false);
        setFeedbackForm({ message: "", category: "General" });
        setFormErrors((prev) => ({ ...prev, feedback: {} }));
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
        category: disputeForm.category,
        comments: disputeForm.comments,
        attachment: disputeForm.attachment,
      });

      if (result?.status) {
        showToast(
          `Dispute submitted successfully! Reference: ${result.data?.reference}`,
          "success"
        );
        setShowDisputeModal(false);
        setDisputeForm({ reason: "", category: "Payment", comments: "" });
        setFormErrors((prev) => ({ ...prev, dispute: {} }));

        // Refresh disputes list
        if (isAdmin) {
          // For admin, just refresh the mock data (in real implementation, this would be an API call)
          setDisputes(mockAdminDisputes);
          setFilteredDisputes(mockAdminDisputes);
        } else {
          const disputesResult = await getCustomerDisputes();
          if (disputesResult?.data) {
            const disputesData: Dispute[] = disputesResult.data.map(
              (d: ApiCustomerDisputeData) => ({
                id: d.id,
                reference: d.reference,
                invoiceId: d.invoiceId,
                paymentId: d.paymentId,
                reason: d.reason,
                category: d.category,
                comments: d.comments,
                status: d.status,
                resolutionNotes: d.resolutionNotes,
                customerId: user?.customerId || "",
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
                attachmentUrl: d.attachmentUrl,
              })
            );
            setDisputes(disputesData);
            setFilteredDisputes(disputesData);
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
        // For customer, use real API
        const result = await updateDisputeStatus(disputeId, {
          status: newStatus as "In Review" | "Resolved" | "Closed",
          resolutionNotes,
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

  const getFeedbackStatusIcon = (status: string) => {
    switch (status) {
      case "Submitted":
        return <Clock size={16} className="status-icon pending" />;
      case "In Review":
        return <AlertCircle size={16} className="status-icon review" />;
      case "Resolved":
        return <CheckCircle size={16} className="status-icon resolved" />;
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
                  <FieldButton
                    inputs={[
                      {
                        placeholder: "Search feedback...",
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
                      {
                        text: "Submit Feedback",
                        onClick: () => setShowFeedbackModal(true),
                        variant: "primary",
                      },
                    ]}
                  />
                </div>
              </div>
            </div>

            {filteredFeedbackHistory.length > 0 && (
              <div className="feedback-history-section">
                <h3>Your Feedback:</h3>
                <Grid>
                  {filteredFeedbackHistory.map((feedback) => (
                    <FeedbackCard
                      key={feedback.id}
                      id={feedback.id}
                      category={feedback.category}
                      message={feedback.message}
                      status={feedback.status}
                      createdAt={feedback.createdAt}
                      onViewDetails={() => {
                        setSelectedFeedback(feedback);
                        setShowFeedbackDetailsModal(true);
                      }}
                    />
                  ))}
                </Grid>
              </div>
            )}
          </div>
        )}

        {activeTab === "disputes" && (
          <div className="disputes-section">
            <div className="page-actions">
              <div className="disputes-search-section">
                <div className="disputes-search-inputs disputes-action-buttons">
                  <FieldButton
                    inputs={[
                      {
                        placeholder: "Search disputes...",
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
                      {
                        text: "Raise New Dispute",
                        onClick: () => setShowDisputeModal(true),
                        variant: "primary",
                      },
                    ]}
                  />
                </div>
              </div>
            </div>

            {filteredDisputes.length > 0 && (
              <div className="disputes-history-section">
                <h3>Your Disputes:</h3>
                <Grid>
                  {filteredDisputes.map((dispute) => (
                    <DisputeCard
                      key={dispute.id}
                      reference={dispute.reference}
                      type={dispute.invoiceId ? "Invoice" : "Payment"}
                      reason={dispute.reason}
                      category={dispute.category}
                      status={dispute.status}
                      createdAt={dispute.createdAt}
                      onViewDetails={() => {
                        setSelectedDispute(dispute);
                        setShowDisputeDetailsModal(true);
                      }}
                    />
                  ))}
                </Grid>
              </div>
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
                    label="Date"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    placeholder="Select date"
                  />
                </div>

                <div className="filter-group">
                  <Input
                    label="Customer ID"
                    type="text"
                    value={invoiceFilter}
                    onChange={(e) => setInvoiceFilter(e.target.value)}
                    placeholder="Enter Customer ID"
                  />
                </div>

                <div className="filter-group">
                  <SolidButton
                    text="Clear Filters"
                    onClick={() => {
                      setStatusFilter("");
                      setDateFilter("");
                      setInvoiceFilter("");
                      setPaymentFilter("");
                    }}
                    variant="secondary"
                    size="medium"
                  />
                </div>
              </div>
            </div>

            <div className="admin-feedback-grid-section">
              <h3>All Feedback</h3>
              <Grid>
                {mockAdminFeedback.map((feedback) => (
                  <FeedbackCard
                    key={feedback.id}
                    id={feedback.id}
                    category={feedback.category}
                    message={feedback.message}
                    status={feedback.status}
                    createdAt={feedback.createdAt}
                    onViewDetails={() => {
                      setSelectedFeedback(feedback);
                      setShowFeedbackDetailsModal(true);
                    }}
                  />
                ))}
              </Grid>
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
                      ...statusOptions.map((status) => ({
                        value: status,
                        label: status,
                      })),
                    ]}
                    value={statusFilter}
                    onChange={(option) => setStatusFilter(option.value)}
                  />
                </div>

                <div className="filter-group">
                  <Input
                    label="Date"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    placeholder="Select date"
                  />
                </div>

                <div className="filter-group">
                  <Input
                    label="Invoice ID"
                    type="text"
                    value={invoiceFilter}
                    onChange={(e) => setInvoiceFilter(e.target.value)}
                    placeholder="Enter Invoice ID"
                  />
                </div>

                <div className="filter-group">
                  <Input
                    label="Payment ID"
                    type="text"
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    placeholder="Enter Payment ID"
                  />
                </div>

                <div className="filter-group">
                  <SolidButton
                    text="Clear Filters"
                    onClick={() => {
                      setStatusFilter("");
                      setDateFilter("");
                      setInvoiceFilter("");
                      setPaymentFilter("");
                    }}
                    variant="secondary"
                    size="medium"
                  />
                </div>
              </div>
            </div>

            <div className="admin-disputes-grid-section">
              <h3>All Disputes</h3>
              <Grid>
                {filteredDisputes.map((dispute) => (
                  <DisputeCard
                    key={dispute.id}
                    reference={dispute.reference}
                    type={dispute.invoiceId ? "Invoice" : "Payment"}
                    reason={dispute.reason}
                    category={dispute.category}
                    status={dispute.status}
                    createdAt={dispute.createdAt}
                    onViewDetails={() => {
                      setSelectedDispute(dispute);
                      setShowDisputeDetailsModal(true);
                    }}
                  />
                ))}
              </Grid>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
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

          <div className="form-group">
            <label
              htmlFor="feedback-message"
              className="reusable-input-label-text"
            >
              Message
            </label>
            <textarea
              id="feedback-message"
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
              className={`form-textarea ${
                formErrors.feedback?.message ? "error" : ""
              }`}
              rows={5}
              required
            />
            {formErrors.feedback?.message && (
              <div className="reusable-input-error">
                {formErrors.feedback.message}
              </div>
            )}
          </div>

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

          <ListBox
            label="Category"
            options={disputeCategories.map((category) => ({
              value: category,
              label: category,
            }))}
            value={disputeForm.category}
            onChange={(option) => {
              setDisputeForm((prev) => ({ ...prev, category: option.value }));
              // Clear category error when user selects
              if (formErrors.dispute?.category) {
                setFormErrors((prev) => ({
                  ...prev,
                  dispute: { ...prev.dispute, category: undefined },
                }));
              }
            }}
            placeholder="Select a category"
            error={formErrors.dispute?.category}
          />

          <div>
            <label
              htmlFor="dispute-comments"
              className="reusable-input-label-text"
            >
              Additional Comments
            </label>
            <textarea
              id="dispute-comments"
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
              className={`form-textarea ${
                formErrors.dispute?.comments ? "error" : ""
              }`}
              rows={4}
            />
            {formErrors.dispute?.comments && (
              <div className="reusable-input-error">
                {formErrors.dispute.comments}
              </div>
            )}
          </div>

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
                    className={`status-badge ${selectedDispute.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {getStatusIcon(selectedDispute.status)}
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
                  <span className="reusable-input-label-text">
                    Resolution Notes:
                  </span>
                  <span className="value">
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
                    options={statusOptions.map((status) => ({
                      value: status,
                      label: status,
                    }))}
                    value={selectedDispute.status}
                    onChange={(option) => {
                      // Store the selected status for later use
                      const statusSelect = document.getElementById(
                        "selectedStatus"
                      ) as HTMLInputElement;
                      if (statusSelect) statusSelect.value = option.value;
                    }}
                  />
                  {/* Hidden input to store selected status */}
                  <input
                    type="hidden"
                    id="selectedStatus"
                    defaultValue={selectedDispute.status}
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="resolutionNotes"
                    className="reusable-input-label-text"
                    style={{ marginTop: "10px", marginBottom: "0px" }}
                  >
                    Resolution Notes:
                  </label>
                  <textarea
                    id="resolutionNotes"
                    placeholder="Add resolution notes..."
                    className="form-textarea"
                    rows={3}
                    defaultValue={selectedDispute.resolutionNotes || ""}
                  />
                </div>

                <div className="form-actions">
                  <SolidButton
                    text="Update Status"
                    onClick={() => {
                      const newStatus =
                        (
                          document.getElementById(
                            "selectedStatus"
                          ) as HTMLInputElement
                        ).value || selectedDispute.status;
                      const resolutionNotes = (
                        document.getElementById(
                          "resolutionNotes"
                        ) as HTMLInputElement
                      ).value;
                      handleUpdateDisputeStatus(
                        selectedDispute.id,
                        newStatus,
                        resolutionNotes
                      );
                    }}
                    variant="primary"
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

              <div className="info-row">
                <span className="label">Status:</span>
                <span className="value status-value">
                  <span
                    className={`status-badge ${selectedFeedback.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {getFeedbackStatusIcon(selectedFeedback.status)}
                    {selectedFeedback.status}
                  </span>
                </span>
              </div>

              <div className="info-row">
                <span className="label">Submitted:</span>
                <span className="value">
                  {new Date(selectedFeedback.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="info-row">
                <span className="label">Message:</span>
                <div className="value feedback-full-message">
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
