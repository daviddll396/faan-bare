import React from "react";
import "./chartsection.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ExportIcon from "/icons/charts-export-icon.svg";
import BorderButton from "../../../reusables/BorderButton/BorderButton";
import { useAuth } from "../../../../contexts/AuthContext";

const ChartSection: React.FC = () => {
  const { user } = useAuth();
  const transactionStats = user?.transactionStats || { total: 0, completed: 0 };
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
  const currentMonth = new Date().toLocaleString("default", { month: "short" });
  const data = months.map((month) =>
    month === currentMonth
      ? {
          month,
          Bills: transactionStats.total,
          Payment: transactionStats.completed,
        }
      : { month, Bills: 0, Payment: 0 }
  );

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
        <p>Total Bookings vs. Completed Services</p>
      </div>
      <div className="chart-section">
        <div className="chart-header">
          <h3>Total Bookings vs. Completed Services</h3>
          <BorderButton
            text="Export"
            icon={ExportIcon}
            onClick={handleExport}
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
              Completed Services
            </p>
          </div>
          <BorderButton
            text="Export"
            icon={ExportIcon}
            onClick={handleExport}
          />
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={windowWidth <= 768 ? 200 : 300}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#EFF1F3" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#7B91B0" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#7B91B0" }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  display: windowWidth <= 768 ? "none" : "flex",
                  justifyContent: "center",
                  gap: "9px",
                }}
                iconType="circle"
                iconSize={12}
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                formatter={(value) => (
                  <span
                    style={{
                      color: "#222B45",
                      fontSize: "12px",
                      fontWeight: "500",
                      marginLeft: "0px",
                    }}
                  >
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="Bills"
                fill="#0095FF"
                radius={[2, 2, 0, 0]}
                name="Bills"
                barSize={19}
              />
              <Bar
                dataKey="Payment"
                fill="#00E096"
                radius={[2, 2, 0, 0]}
                name="Payment"
                barSize={19}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default ChartSection;
