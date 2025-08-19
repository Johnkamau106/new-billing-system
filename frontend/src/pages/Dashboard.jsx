// src/pages/Dashboard.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import "./Dashboard.css";

const data = [
  { name: "Jan", value: 400, users: 240 },
  { name: "Feb", value: 300, users: 139 },
  { name: "Mar", value: 500, users: 280 },
  { name: "Apr", value: 200, users: 190 },
  { name: "May", value: 600, users: 350 },
];

export default function Dashboard() {
  return (
    <div className="page">
      <div className="page__header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here’s a quick overview of your data.</p>
      </div>

      {/* Cards */}
      <div className="grid-3">
        <div className="card">
          <h2 className="section-title">Revenue</h2>
          <p className="section-subtitle">$12,340</p>
        </div>
        <div className="card">
          <h2 className="section-title">Users</h2>
          <p className="section-subtitle">1,234</p>
        </div>
        <div className="card">
          <h2 className="section-title">Growth</h2>
          <p className="section-subtitle">+15%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts">
        <div className="card">
          <h2 className="section-title">Revenue Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#6366f1" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="section-title">Users Gained</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
