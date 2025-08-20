// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import Card from "../components/Card";
import BandwidthGraph from "../components/BandwidthGraph";
import axios from "axios";
import "./Dashboard.css";

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/portal/dashboard');
        setDashboardData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!dashboardData) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Client Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card title="Current Balance" value={`$${dashboardData.client.balance}`} />
        <Card 
          title="Download Usage (24h)" 
          value={formatBytes(dashboardData.usage_24h.download)} 
        />
        <Card 
          title="Upload Usage (24h)" 
          value={formatBytes(dashboardData.usage_24h.upload)} 
        />
      </div>

      <div className="mb-8">
        <BandwidthGraph data={dashboardData.usage_24h.detailed} />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Unpaid Bills</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.unpaid_bills.map(bill => (
                <tr key={bill.id} className="border-b">
                  <td className="px-4 py-2">${bill.amount}</td>
                  <td className="px-4 py-2">{bill.description}</td>
                  <td className="px-4 py-2">
                    {new Date(bill.due_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {dashboardData.unpaid_bills.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-4 py-2 text-center">
                    No unpaid bills
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
