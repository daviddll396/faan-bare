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
  const { getAdminTransactionHistory, getTransactionHistory, user } = useAuth();

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
        if (role === "Admin") {
          const txns = await getAdminTransactionHistory();
          if (Array.isArray(txns)) {
            setTransactions(txns as AdminTransactionItem[]);
          } else {
            setTransactions([]);
          }
          return;
        }

        if (role === "Customer") {
          if (!getTransactionHistory) {
            setTransactions([]);
            return;
          }
          const txns = await getTransactionHistory(fromDate, toDate);
          if (!txns || !Array.isArray(txns)) {
            setTransactions([]);
            return;
          }
          const mapped = txns.map(
            (t) =>
              ({
                id: t.id,
                tariffId: t.tariffId,
                tariffName: t.tariffName,
                amount: t.amount,
                status: t.status,
                createdAt: t.createdAt,
                customerId: t.customerId || user?.customerId,
                customerName: user
                  ? `${user.firstName} ${user.lastName}`.trim()
                  : undefined,
              } as AdminTransactionItem)
          );
          setTransactions(mapped);
          return;
        }

        setTransactions([]);
      } catch (e) {
        console.error("Reports: failed to fetch transactions", e);
        showToast("Failed to load report data", "error");
      }
    };

    fetchData();
  }, [
    getAdminTransactionHistory,
    getTransactionHistory,
    role,
    fromDate,
    toDate,
    user,
  ]);

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

  // Dummy demo data for Active Customers (used when no real data)
  const demoActiveCustomers = [
    {
      id: "CUST-1001",
      name: "Alice Johnson",
      lastActivity: new Date().toISOString(),
      totalTxns: 3,
    },
    {
      id: "CUST-1002",
      name: "Bob Ade",
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      totalTxns: 2,
    },
    {
      id: "CUST-1003",
      name: "Christine Okoro",
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      totalTxns: 5,
    },
  ];

  const visibleActiveCustomers = activeCustomers.length
    ? activeCustomers
    : demoActiveCustomers;

  // Pending transactions in range
  const pendingTxns = transactions.filter(
    (t) => inRange(t.createdAt) && (t.status || "").toUpperCase() === "PENDING"
  );

  // Demo pending transactions (for admin demo purposes)
  const demoPendingTxns: AdminTransactionItem[] = [
    {
      id: 9001,
      tariffId: 1,
      tariffName: "International Arrival",
      amount: 7000,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      customerName: "Demo Customer",
      customerId: "DEMO-001",
    },
    {
      id: 9002,
      tariffId: 3,
      tariffName: "VIP lounge International",
      amount: 5000,
      status: "PENDING",
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      customerName: "Demo Customer 2",
      customerId: "DEMO-002",
    },
  ];

  const visiblePendingTxns = pendingTxns.length ? pendingTxns : demoPendingTxns;

  // Completed payments in range
  const completedTxns = transactions.filter(
    (t) =>
      inRange(t.createdAt) && (t.status || "").toUpperCase() === "COMPLETED"
  );

  // Single table tabs
  const [activeTab, setActiveTab] = React.useState<
    "active" | "pending" | "completed"
  >(role === "Customer" ? "pending" : "active");

  // Determine which tabs are available based on role
  const availableTabs =
    role === "Customer"
      ? ["pending", "completed"]
      : ["active", "pending", "completed"];

  const tableHeaders: string[] =
    activeTab === "active"
      ? ["S/N", "Customer ID", "Customer Name", "Last Activity", "Total Txns"]
      : ["ID", "Customer", "Service", "Amount", "Status", "Date"];

  const tableData: React.ReactNode[][] =
    activeTab === "active"
      ? visibleActiveCustomers.map((c, i) => [
          i + 1,
          c.id,
          c.name || "-",
          c.lastActivity ? new Date(c.lastActivity).toLocaleString() : "-",
          c.totalTxns,
        ])
      : activeTab === "pending"
      ? visiblePendingTxns.map((t) => [
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

  // Download as JSON
  const handleDownloadJson = () => {
    let rows: Array<Record<string, unknown>> = [];
    if (activeTab === "active") {
      rows = visibleActiveCustomers.map((c, i) => ({
        SN: i + 1,
        customerId: c.id,
        customerName: c.name,
        lastActivity: c.lastActivity,
        totalTransactions: c.totalTxns,
      }));
    } else if (activeTab === "pending") {
      rows = visiblePendingTxns.map((t) => ({
        id: t.id,
        customer: t.customerName || t.customerId,
        service: t.tariffName,
        amount: t.amount ?? 0,
        status: t.status,
        date: t.createdAt,
      }));
    } else {
      rows = completedTxns.map((t) => ({
        id: t.id,
        customer: t.customerName || t.customerId,
        service: t.tariffName,
        amount: t.amount ?? 0,
        status: t.status,
        date: t.createdAt,
      }));
    }

    if (!rows.length) {
      showToast("No data to download", "error");
      return;
    }

    const blob = new Blob([JSON.stringify(rows, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-report_${fromDate}_to_${toDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download as printable PDF (opens print dialog)
  const handleDownloadPdf = () => {
    let headers: string[] = [];
    let rows: Array<string[]> = [];
    if (activeTab === "active") {
      headers = [
        "S/N",
        "Customer ID",
        "Customer Name",
        "Last Activity",
        "Total Txns",
      ];
      rows = visibleActiveCustomers.map((c, i) => [
        String(i + 1),
        c.id,
        c.name || "",
        c.lastActivity ? new Date(c.lastActivity).toLocaleString() : "",
        String(c.totalTxns),
      ]);
    } else if (activeTab === "pending") {
      headers = ["ID", "Customer", "Service", "Amount", "Status", "Date"];
      rows = visiblePendingTxns.map((t) => [
        String(t.id),
        t.customerName || t.customerId || "",
        t.tariffName || "",
        t.amount ? `₦${t.amount.toLocaleString()}` : "₦0",
        t.status || "",
        t.createdAt ? new Date(t.createdAt).toLocaleString() : "",
      ]);
    } else {
      headers = ["ID", "Customer", "Service", "Amount", "Status", "Date"];
      rows = completedTxns.map((t) => [
        String(t.id),
        t.customerName || t.customerId || "",
        t.tariffName || "",
        t.amount ? `₦${t.amount.toLocaleString()}` : "₦0",
        t.status || "",
        t.createdAt ? new Date(t.createdAt).toLocaleString() : "",
      ]);
    }

    if (!rows.length) {
      showToast("No data to download", "error");
      return;
    }

    const title = `${activeTab.toUpperCase()} Report (${fromDate} to ${toDate})`;
    const style = `
      <style>
        body{font-family:Arial,Helvetica,sans-serif;color:#111827;padding:24px}
        table{width:100%;border-collapse:collapse}
        th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}
        th{background:#f8fafc}
        h1{font-size:18px}
      </style>`;

    const tableRows = rows
      .map(
        (r) =>
          `<tr>${r
            .map((c) => `<td>${String(c).replace(/</g, "&lt;")}</td>`)
            .join("")}</tr>`
      )
      .join("");

    const html = `<!doctype html><html><head><meta charset='utf-8'><title>${title}</title>${style}</head><body><h1>${title}</h1><table><thead><tr>${headers
      .map((h) => `<th>${h}</th>`)
      .join(
        ""
      )}</tr></thead><tbody>${tableRows}</tbody></table><script>window.onload=function(){setTimeout(function(){window.print();},200);};</script></body></html>`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
    }
  };

  if (role !== "Admin" && role !== "Customer") {
    return (
      <div className="reports-page">
        <div className="reports-guard">
          Reports are available to admin and customer users only.
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
          <BorderButton
            text="Download JSON"
            onClick={handleDownloadJson}
            className="border-button-reports"
          />
          <BorderButton
            text="Download PDF"
            onClick={handleDownloadPdf}
            className="border-button-reports"
          />
        </div>
      </div>

      <div className="reports-tabs-row">
        {availableTabs.map((key) => {
          const labelMap: Record<string, string> = {
            active: "Active Customers",
            pending: "Pending Transactions",
            completed: "Completed Payments",
          };
          return (
            <button
              key={key}
              className={`reports-tab${activeTab === key ? " active" : ""}`}
              onClick={() =>
                setActiveTab(key as "active" | "pending" | "completed")
              }
              type="button"
            >
              {labelMap[key]}
            </button>
          );
        })}
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
