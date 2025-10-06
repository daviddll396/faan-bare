import React from "react";
import "./chartsection.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import SolidButton from "../../../reusables/SolidButton/SolidButton";
import { Download } from "lucide-react";
import { useAuth } from "../../../../contexts/AuthContext";

interface Transaction {
  id: number;
  tariffName?: string;
  service?: string;
  amount?: number;
  price?: string;
  status?: string;
  createdAt?: string;
  customerName?: string;
  customerId?: string;
}

interface ChartSectionProps {
  adminStats?: {
    status: boolean;
    statusCode: number;
    data: {
      customerProfile: unknown | null;
      walletBalance: number | null;
      transactionStats: {
        total: number;
        completed: number;
        pending: number;
        cancelled: number;
      };
    };
    message: string;
  } | null;
  transactions?: Transaction[];
}

const ChartSection: React.FC<ChartSectionProps> = ({
  adminStats,
  transactions,
}) => {
  const { user } = useAuth();

  // Use admin stats if available, otherwise fall back to user transaction stats
  const transactionStats = adminStats?.data?.transactionStats ||
    user?.transactionStats || { total: 0, completed: 0 };

  // Debug logging to see which data source is being used
  // console.log("🔍 ChartSection - Data Source Debug:");
  // console.log("📊 Admin Stats Available:", !!adminStats);
  // console.log("👤 User Transaction Stats:", user?.transactionStats);
  // console.log("🎯 Final Transaction Stats Used:", transactionStats);
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // List of all months
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Function to get month name from date string
  const getMonthFromDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("default", { month: "short" });
    } catch {
      return "";
    }
  };

  // Function to check if transaction is completed
  const isCompletedTransaction = (status?: string): boolean => {
    return (
      status?.toLowerCase() === "completed" ||
      status?.toLowerCase() === "success" ||
      status?.toLowerCase() === "paid"
    );
  };

  // Process transaction data to distribute by actual months
  const processTransactionData = (): RawRow[] => {
    // Initialize all months with zero values
    const monthlyData: Record<string, { Bills: number; Payment: number }> = {};
    months.forEach((month) => {
      monthlyData[month] = { Bills: 0, Payment: 0 };
    });

    // If we have actual transaction data, use it
    if (transactions && transactions.length > 0) {
      transactions.forEach((transaction) => {
        if (transaction.createdAt) {
          const month = getMonthFromDate(transaction.createdAt);
          if (month && monthlyData[month]) {
            // Count all transactions as "Bills" (total bookings)
            monthlyData[month].Bills += 1;

            // Count completed transactions as "Payment" (completed bookings)
            if (isCompletedTransaction(transaction.status)) {
              monthlyData[month].Payment += 1;
            }
          }
        }
      });
    } else {
      // Fallback to aggregated stats for current month only
      const currentMonth = new Date().toLocaleString("default", {
        month: "short",
      });
      if (monthlyData[currentMonth]) {
        monthlyData[currentMonth].Bills = transactionStats.total;
        monthlyData[currentMonth].Payment = transactionStats.completed;
      }
    }

    // Convert to array format
    return months.map((month) => ({
      month,
      Bills: monthlyData[month].Bills,
      Payment: monthlyData[month].Payment,
    }));
  };

  type RawRow = { month: string; Bills: number; Payment: number };
  const rawData: RawRow[] = processTransactionData();

  // If Bills and Payment are exactly equal for a month, offset them slightly so both lines remain visible
  const data = rawData.map((row) => {
    const bills = Number(row.Bills) || 0;
    const payment = Number(row.Payment) || 0;
    if (bills === payment && bills !== 0) {
      // offset by a tiny amount (sub-pixel) to make both lines visible
      return { ...row, Bills: bills + 0.4 };
    }
    return row;
  });

  // Calculate appropriate Y-axis maximum based on the highest value in the data
  const getYAxisMax = (data: typeof rawData) => {
    const maxValue = Math.max(
      ...data.map((row) =>
        Math.max(Number(row.Bills) || 0, Number(row.Payment) || 0)
      )
    );

    if (maxValue === 0) return 10; // Default minimum
    if (maxValue <= 10) return 10;
    if (maxValue <= 50) return 50;
    if (maxValue <= 100) return 100;
    if (maxValue <= 500) return 500;
    if (maxValue <= 1000) return 1000;
    if (maxValue <= 10000) return 10000;
    if (maxValue <= 100000) return 100000;
    if (maxValue <= 500000) return 500000;
    if (maxValue <= 1000000) return 1000000;

    // For values above 1M, round up to the nearest power of 10
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)) + 1);
    return magnitude;
  };

  const yAxisMax = getYAxisMax(rawData);

  // Debug Y-axis calculation
  // console.log("📈 Y-Axis Max Calculation:");
  // console.log("📊 Raw Data:", rawData);
  // console.log("🎯 Calculated Y-Axis Max:", yAxisMax);

  // Export chart data as CSV
  const handleExport = () => {
    const csvRows = [
      ["Month", "Total Bookings", "Completed Bookings"],
      ...data.map((row) => [row.month, row.Bills, row.Payment]),
    ];
    const csvContent = csvRows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dashboard-bookings.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="chart-header-mobile mobile-only">
        <p>Total Bookings vs. Completed Bookings</p>
      </div>
      <div className="chart-section">
        <div className="chart-header">
          <h3>Total Bookings vs. Completed Bookings</h3>
          <SolidButton
            text="Export"
            icon={<Download size={18} color="#fff" />}
            onClick={handleExport}
            variant="primary"
            size={windowWidth <= 768 ? "small" : "medium"}
          />
        </div>
        <div className="inner-chart-header-mobile">
          <div className="chart-vs-mobile">
            <p>
              <span className="chart-dot chart-dot-total"></span>
              Total Bookings
            </p>
            <p>
              <span className="chart-dot chart-dot-completed"></span>
              Completed Bookings
            </p>
          </div>
          <SolidButton
            text="Export"
            icon={<Download size={16} color="#fff" />}
            onClick={handleExport}
            variant="primary"
            size={windowWidth <= 768 ? "small" : "medium"}
          />
        </div>
        <div className="chart-container">
          <ResponsiveContainer
            width="100%"
            height={windowWidth <= 768 ? 200 : 300}
          >
            <AreaChart
              data={data}
              margin={{ top: 12, right: 18, left: 12, bottom: 6 }}
            >
              <defs>
                <linearGradient id="gradBills" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0095FF" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#0095FF" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradPayment" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E096" stopOpacity={0.14} />
                  <stop offset="100%" stopColor="#00E096" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFF1F3" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#898989" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#898989" }}
                domain={[0, yAxisMax]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 6px 18px rgba(16,24,40,0.08)",
                }}
                labelStyle={{ color: "#969696" }}
                formatter={(value: unknown, name: unknown, props: unknown) => {
                  try {
                    const p = props as
                      | { payload?: Record<string, unknown> }
                      | undefined;
                    const month = p?.payload?.month as string | undefined;
                    const rawRow = rawData.find((r) => r.month === month) as
                      | RawRow
                      | undefined;
                    const label = String(name ?? "");
                    if (rawRow) {
                      if (
                        label.toLowerCase().includes("bill") ||
                        label.toLowerCase().includes("total")
                      ) {
                        return [String(rawRow.Bills) as React.ReactNode, label];
                      }
                      if (
                        label.toLowerCase().includes("payment") ||
                        label.toLowerCase().includes("completed")
                      ) {
                        return [
                          String(rawRow.Payment) as React.ReactNode,
                          label,
                        ];
                      }
                    }
                  } catch {
                    // fallback
                  }
                  return [
                    String(value ?? "") as React.ReactNode,
                    String(name ?? ""),
                  ];
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "8px",
                  display: windowWidth <= 768 ? "none" : "flex",
                  justifyContent: "center",
                  gap: "12px",
                }}
                iconType="circle"
                iconSize={12}
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                formatter={(value: string) => {
                  const label = String(value || "");

                  // Calculate totals across all months for legend
                  const totalBills = rawData.reduce(
                    (sum, row) => sum + row.Bills,
                    0
                  );
                  const totalPayments = rawData.reduce(
                    (sum, row) => sum + row.Payment,
                    0
                  );

                  if (
                    label.toLowerCase().includes("bill") ||
                    label.toLowerCase().includes("total")
                  ) {
                    return (
                      <span
                        style={{
                          color: "#000",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {label} ({totalBills})
                      </span>
                    );
                  }
                  if (
                    label.toLowerCase().includes("completed") ||
                    label.toLowerCase().includes("payment")
                  ) {
                    return (
                      <span
                        style={{
                          color: "#000",
                          fontSize:
                            windowWidth <= 768
                              ? 12
                              : windowWidth <= 1450
                              ? 14
                              : 12,
                          fontWeight: 500,
                        }}
                      >
                        {label} ({totalPayments})
                      </span>
                    );
                  }
                  return (
                    <span
                      style={{
                        color: "#000",
                        fontSize:
                          windowWidth <= 768
                            ? 12
                            : windowWidth <= 1450
                            ? 14
                            : 12,
                        fontWeight: 500,
                      }}
                    >
                      {label}
                    </span>
                  );
                }}
              />
              <Area
                type="linear"
                dataKey="Bills"
                stroke="#0095FF"
                strokeWidth={3}
                fill="url(#gradBills)"
                dot={{ fill: "#0095FF", strokeWidth: 2, r: 4 }}
                activeDot={{
                  r: 6,
                  stroke: "#0095FF",
                  strokeWidth: 2,
                  fill: "#fff",
                }}
                name="Total Bookings"
                animationDuration={800}
              />
              <Area
                type="linear"
                dataKey="Payment"
                stroke="#00E096"
                strokeWidth={3}
                fill="url(#gradPayment)"
                dot={{ fill: "#00E096", strokeWidth: 2, r: 4 }}
                activeDot={{
                  r: 6,
                  stroke: "#00E096",
                  strokeWidth: 2,
                  fill: "#fff",
                }}
                name="Completed Bookings"
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default ChartSection;
