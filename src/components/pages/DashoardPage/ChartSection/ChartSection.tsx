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

const ChartSection: React.FC = () => {
  const data = [
    { month: "Jan", Bills: 45, Payment: 30 },
    { month: "Feb", Bills: 52, Payment: 35 },
    { month: "Mar", Bills: 38, Payment: 42 },
    { month: "Apr", Bills: 65, Payment: 48 },
    { month: "May", Bills: 58, Payment: 52 },
    { month: "Jun", Bills: 42, Payment: 38 },
    { month: "Jul", Bills: 48, Payment: 35 },
    { month: "Aug", Bills: 72, Payment: 58 },
    { month: "Sep", Bills: 55, Payment: 45 },
    { month: "Oct", Bills: 38, Payment: 32 },
    { month: "Nov", Bills: 62, Payment: 48 },
    { month: "Dec", Bills: 58, Payment: 52 },
  ];

  return (
    <div className="chart-section">
      <div className="chart-header">
        <h3>Total Bookings vs. Completed Services</h3>
        <BorderButton text="Export" icon={ExportIcon} />
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
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
                display: "flex",
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
              radius={[2, 2, 2, 2]}
              name="Bills"
              barSize={19}
            />
            <Bar
              dataKey="Payment"
              fill="#00E096"
              radius={[2, 2, 2, 2]}
              name="Payment"
              barSize={19}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartSection;
