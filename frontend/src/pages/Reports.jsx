// src/pages/Reports.jsx
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts";
import { getReports } from "../services/api";
import "./Reports.css";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

export default function Reports() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getReports().then(setData).catch(console.error);
  }, []);

  return (
    <div className="page">
      <div className="page__header">
        <h1>Reports</h1>
        <p>Here’s a breakdown of revenue (in KSh).</p>
      </div>

      <div className="card pie-wrapper">
        <h2 className="section-title">Department Revenue</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              outerRadius={120}
              fill="#8884d8"
              label={({ name, value }) => `${name}: KSh ${value.toLocaleString()}`}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `KSh ${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
