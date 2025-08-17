import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import BorderButton from "../../reusables/BorderButton/BorderButton";
import DataTable from "../../reusables/DataTable/DataTable";
import MessageToast from "../../reusables/MessageToast/MessageToast";
import "./ReportsPage.css";

interface ReportsPageProps {
  role?: string;
}

interface AdminTransactionItem {
  id: number;
  tariffId?: number;
  tariffName?: string;
  amount?: number;
  status?: string; // PENDING | COMPLETED | CANCELLED
  createdAt?: string;
  customerName?: string;
  customerId?: string;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ role }) => {
  const { getAdminTransactionHistory } = useAuth();

  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  const [fromDate, setFromDate] = React.useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = React.useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  const [transactions, setTransactions] = React.useState<
    AdminTransactionItem[]
  >([]);
  const [toast, setToast] = React.useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({ message: "", type: "success", isVisible: false });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, isVisible: true });
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const txns = await getAdminTransactionHistory();
        if (Array.isArray(txns)) {
          setTransactions(txns as AdminTransactionItem[]);
        } else {
          setTransactions([]);
        }
      } catch (e) {
        console.error("Reports: failed to fetch admin transactions", e);
        showToast("Failed to load report data", "error");
      }
    };
    if (role === "Admin") fetchData();
  }, [getAdminTransactionHistory, role]);

  // Date filter helpers
  const inRange = (iso?: string) => {
    if (!iso) return false;
    const dt = new Date(iso).toISOString().slice(0, 10);
    return dt >= fromDate && dt <= toDate;
  };

  // Active customers: unique customers with any transaction in range
  const activeCustomerMap = new Map<
    string,
    { id: string; name: string; lastActivity: string; totalTxns: number }
  >();
  transactions.forEach((t) => {
    if (!inRange(t.createdAt)) return;
    const key = t.customerId || t.customerName || "UNKNOWN";
    const existing = activeCustomerMap.get(key);
    const name = t.customerName || "";
    const dateStr = t.createdAt || "";
    if (existing) {
      existing.totalTxns += 1;
      if (existing.lastActivity < dateStr) existing.lastActivity = dateStr;
    } else {
      activeCustomerMap.set(key, {
        id: key,
        name,
        lastActivity: dateStr,
        totalTxns: 1,
      });
    }
  });
  const activeCustomers = Array.from(activeCustomerMap.values()).sort((a, b) =>
    a.id > b.id ? 1 : -1
  );

  // Pending transactions in range
  const pendingTxns = transactions.filter(
    (t) => inRange(t.createdAt) && (t.status || "").toUpperCase() === "PENDING"
  );

  // Completed payments in range
  const completedTxns = transactions.filter(
    (t) =>
      inRange(t.createdAt) && (t.status || "").toUpperCase() === "COMPLETED"
  );

  // Single table tabs
  const [activeTab, setActiveTab] = React.useState<
    "active" | "pending" | "completed"
  >("active");

  const tableHeaders: string[] =
    activeTab === "active"
      ? ["S/N", "Customer ID", "Customer Name", "Last Activity", "Total Txns"]
      : ["ID", "Customer", "Service", "Amount", "Status", "Date"];

  const tableData: React.ReactNode[][] =
    activeTab === "active"
      ? activeCustomers.map((c, i) => [
          i + 1,
          c.id,
          c.name || "-",
          c.lastActivity ? new Date(c.lastActivity).toLocaleString() : "-",
          c.totalTxns,
        ])
      : activeTab === "pending"
      ? pendingTxns.map((t) => [
          t.id,
          t.customerName || t.customerId || "-",
          t.tariffName || "-",
          t.amount ? `₦${t.amount.toLocaleString()}` : "₦0",
          <span key={`p-${t.id}`} className={`status-badge pending`}>
            PENDING
          </span>,
          t.createdAt ? new Date(t.createdAt).toLocaleString() : "-",
        ])
      : completedTxns.map((t) => [
          t.id,
          t.customerName || t.customerId || "-",
          t.tariffName || "-",
          t.amount ? `₦${t.amount.toLocaleString()}` : "₦0",
          <span key={`c-${t.id}`} className={`status-badge success`}>
            COMPLETED
          </span>,
          t.createdAt ? new Date(t.createdAt).toLocaleString() : "-",
        ]);

  const downloadCsv = (
    rows: Array<Record<string, string | number>>,
    filename: string
  ) => {
    if (!rows.length) {
      showToast("No data to download", "error");
      return;
    }
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(",")]
      .concat(
        rows.map((r) =>
          headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")
        )
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadActiveCustomers = () => {
    const rows = activeCustomers.map((c, i) => ({
      SN: i + 1,
      customerId: c.id,
      customerName: c.name || "",
      lastActivity: c.lastActivity
        ? new Date(c.lastActivity).toLocaleString()
        : "",
      totalTransactions: c.totalTxns,
    }));
    downloadCsv(rows, `active-customers_${fromDate}_to_${toDate}.csv`);
  };

  const handleDownloadPending = () => {
    const rows = pendingTxns.map((t) => ({
      id: t.id,
      customer: t.customerName || t.customerId || "",
      service: t.tariffName || "",
      amount: t.amount ?? 0,
      status: t.status || "",
      date: t.createdAt ? new Date(t.createdAt).toLocaleString() : "",
    }));
    downloadCsv(rows, `pending-transactions_${fromDate}_to_${toDate}.csv`);
  };

  const handleDownloadCompleted = () => {
    const rows = completedTxns.map((t) => ({
      id: t.id,
      customer: t.customerName || t.customerId || "",
      service: t.tariffName || "",
      amount: t.amount ?? 0,
      status: t.status || "",
      date: t.createdAt ? new Date(t.createdAt).toLocaleString() : "",
    }));
    downloadCsv(rows, `completed-payments_${fromDate}_to_${toDate}.csv`);
  };

  const handleDownloadCurrent = () => {
    if (activeTab === "active") return handleDownloadActiveCustomers();
    if (activeTab === "pending") return handleDownloadPending();
    return handleDownloadCompleted();
  };

  if (role !== "Admin") {
    return (
      <div className="reports-page">
        <div className="reports-guard">
          Reports are available to admin users only.
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="reports-page">
        <div className="reports-guard">
          Reports are available on screens larger than 768px.
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <MessageToast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />

      <div className="page-header">
        <PageTitle icon="/icons/reports-icon.svg" title="Reports" />
      </div>

      <div className="reports-filter-row">
        <div className="reports-date-field">
          <label>From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="reports-date-field">
          <label>To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <div className="reports-actions">
          <BorderButton
            text="Download CSV"
            onClick={handleDownloadCurrent}
            className="border-button-reports"
          />
        </div>
      </div>

      <div className="reports-tabs-row">
        {[
          { key: "active", label: "Active Customers" },
          { key: "pending", label: "Pending Transactions" },
          { key: "completed", label: "Completed Payments" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`reports-tab${
              activeTab === (tab.key as any) ? " active" : ""
            }`}
            onClick={() => setActiveTab(tab.key as any)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="reports-table-wrap">
        <DataTable
          headers={tableHeaders}
          data={tableData}
          className="reports-table"
        />
      </div>
    </div>
  );
};

export default ReportsPage;
