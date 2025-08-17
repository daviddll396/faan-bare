import React, { useState, useEffect } from "react";
import { useLoading } from "../../../contexts/LoadingContext";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import SearchInput from "../../reusables/SearchInput/SearchInput";
import BorderButton from "../../reusables/BorderButton/BorderButton";
import DataTable from "../../reusables/DataTable/DataTable";
import MessageToast from "../../reusables/MessageToast/MessageToast";
import "./AuditTrailPage.css";

interface AuditLogItem {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failed" | "warning";
}

interface AuditTrailPageProps {
  role?: string;
}

const AuditTrailPage: React.FC<AuditTrailPageProps> = () => {
  const { showLoading, hideLoading } = useLoading();

  // State for audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  // Local loading is handled via LoadingContext; keep minimal local flag only if needed

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

  const showToast = (message: string, type: "success" | "error") => {
    setToast({
      message,
      type,
      isVisible: true,
    });
  };

  // Mock audit logs data (replace with actual API call)
  useEffect(() => {
    const fetchAuditLogs = async () => {
      showLoading("Loading audit logs...");

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data - replace with actual API call
        const mockAuditLogs: AuditLogItem[] = [
          {
            id: 1,
            action: "User Login",
            user: "admin@faan.gov.ng",
            timestamp: "2024-12-19 14:30:25",
            details: "Successful login from admin dashboard",
            ipAddress: "192.168.1.100",
            userAgent: "Chrome/120.0.0.0",
            status: "success",
          },
          {
            id: 2,
            action: "Service Creation",
            user: "admin@faan.gov.ng",
            timestamp: "2024-12-19 14:25:10",
            details: "Created new service: Airport VIP Service",
            ipAddress: "192.168.1.100",
            userAgent: "Chrome/120.0.0.0",
            status: "success",
          },
          {
            id: 3,
            action: "Customer Search",
            user: "admin@faan.gov.ng",
            timestamp: "2024-12-19 14:20:15",
            details: "Searched for customer: John Doe",
            ipAddress: "192.168.1.100",
            userAgent: "Chrome/120.0.0.0",
            status: "success",
          },
          {
            id: 4,
            action: "Payment Processing",
            user: "system",
            timestamp: "2024-12-19 14:15:30",
            details: "Payment processed for transaction #12345",
            ipAddress: "10.0.0.1",
            userAgent: "System/1.0",
            status: "success",
          },
          {
            id: 5,
            action: "User Logout",
            user: "admin@faan.gov.ng",
            timestamp: "2024-12-19 14:10:45",
            details: "User logged out from admin dashboard",
            ipAddress: "192.168.1.100",
            userAgent: "Chrome/120.0.0.0",
            status: "success",
          },
          {
            id: 6,
            action: "Failed Login Attempt",
            user: "unknown@example.com",
            timestamp: "2024-12-19 14:05:20",
            details: "Invalid credentials provided",
            ipAddress: "203.0.113.45",
            userAgent: "Firefox/119.0",
            status: "failed",
          },
          {
            id: 7,
            action: "Data Export",
            user: "admin@faan.gov.ng",
            timestamp: "2024-12-19 14:00:10",
            details: "Exported transaction report for Q4 2024",
            ipAddress: "192.168.1.100",
            userAgent: "Chrome/120.0.0.0",
            status: "success",
          },
          {
            id: 8,
            action: "System Backup",
            user: "system",
            timestamp: "2024-12-19 13:55:00",
            details: "Daily system backup completed successfully",
            ipAddress: "10.0.0.1",
            userAgent: "System/1.0",
            status: "success",
          },
          {
            id: 9,
            action: "Permission Update",
            user: "admin@faan.gov.ng",
            timestamp: "2024-12-19 13:50:25",
            details: "Updated user permissions for staff@faan.gov.ng",
            ipAddress: "192.168.1.100",
            userAgent: "Chrome/120.0.0.0",
            status: "success",
          },
          {
            id: 10,
            action: "Database Query",
            user: "admin@faan.gov.ng",
            timestamp: "2024-12-19 13:45:15",
            details: "Executed complex database query for analytics",
            ipAddress: "192.168.1.100",
            userAgent: "Chrome/120.0.0.0",
            status: "warning",
          },
        ];

        setAuditLogs(mockAuditLogs);
        setFilteredLogs(mockAuditLogs);
        showToast("Audit logs loaded successfully", "success");
      } catch (error) {
        console.error("Error fetching audit logs:", error);
        showToast("Failed to load audit logs", "error");
      } finally {
        hideLoading();
      }
    };

    fetchAuditLogs();
  }, [showLoading, hideLoading]);

  // Filter audit logs based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLogs(auditLogs);
    } else {
      const filtered = auditLogs.filter(
        (log) =>
          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.ipAddress.includes(searchQuery) ||
          log.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLogs(filtered);
    }
  }, [searchQuery, auditLogs]);

  const handleSearch = () => {
    // Search is handled automatically by useEffect
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Format status badge
  const getStatusBadge = (status: string) => {
    const statusClass = `status-badge ${status}`;
    return <span className={statusClass}>{status.toUpperCase()}</span>;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Prepare data for DataTable
  const tableData = filteredLogs.map((log) => [
    log.id,
    log.action,
    log.user,
    formatTimestamp(log.timestamp),
    log.details,
    log.ipAddress,
    getStatusBadge(log.status),
  ]);

  return (
    <div className="audit-trail-page">
      <MessageToast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />

      <div className="page-header">
        <PageTitle icon="/icons/audit-trail-icon.svg" title="Audit Trail" />
      </div>

      <div className="page-actions">
        <SearchInput
          placeholder="Search audit logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div style={{ display: "flex", gap: 12 }}>
          <BorderButton
            text="Search"
            onClick={handleSearch}
            className="border-button-audittrail"
          />
          <BorderButton
            text="Clear"
            onClick={handleClearSearch}
            className="border-button-audittrail"
          />
        </div>
      </div>

      <div className="audit-summary">
        <div className="summary-item">
          <div className="summary-label">Total Logs</div>
          <div className="summary-value">{filteredLogs.length}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Successful Actions</div>
          <div className="summary-value success">
            {filteredLogs.filter((log) => log.status === "success").length}
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Failed Actions</div>
          <div className="summary-value failed">
            {filteredLogs.filter((log) => log.status === "failed").length}
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Warnings</div>
          <div className="summary-value warning">
            {filteredLogs.filter((log) => log.status === "warning").length}
          </div>
        </div>
      </div>

      <DataTable
        headers={[
          "ID",
          "Action",
          "User",
          "Timestamp",
          "Details",
          "IP Address",
          "Status",
        ]}
        data={tableData}
        className="audit-trail-table"
      />
    </div>
  );
};

export default AuditTrailPage;
