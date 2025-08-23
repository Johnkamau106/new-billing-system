import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner, ErrorDisplay } from "../../components/Charts";
import { api } from "../../services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [selectedRouter, setSelectedRouter] = useState('All routers');

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      try {
        return await api.get('/dashboard');
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        return {
          income: { today: 0, thisMonth: 0, entries: 0, monthlyIncomeHistory: [] },
          users: { active: 0, total: 0 },
          tickets: { open: 0, pending: 0, solved: 0, escalated: 0 },
          connections: {
            online: { clients: 0, hotspot: 0 },
            active: { clients: 0, hotspot: 0 },
            overdue: { clients: 0, hotspot: 0 },
          },
        };
      }
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="dashboard">
        <LoadingSpinner />
      </div>
    );
  }

  const formatNumber = (num) => {
    return num?.toLocaleString('en-KE') || '0';
  };

  const formatCurrency = (num) => {
    return `KSH.${formatNumber(num)}`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__welcome">Welcome Back, John</h1>
        <div className="dashboard__router-select">
          <select 
            value={selectedRouter} 
            onChange={(e) => setSelectedRouter(e.target.value)}
            className="router-dropdown"
          >
            <option value="All routers">All routers</option>
            {/* Add more router options here */}
          </select>
          <button className="select-router-btn">Select router</button>
        </div>
      </div>

      <div className="dashboard__grid">
        <div className="stat-card stat-card--income">
          <div className="stat-card__title">INCOME TODAY ON</div>
          <div className="stat-card__value">{formatCurrency(dashboardData?.income?.today || 0)}</div>
          <div className="stat-card__footer">
            <div>{formatNumber(dashboardData?.income?.entries)} Entries</div>
            <a href="#" className="stat-card__link">View Reports</a>
          </div>
        </div>

        <div className="stat-card stat-card--month">
          <div className="stat-card__title">INCOME THIS MONTH</div>
          <div className="stat-card__value">{formatCurrency(dashboardData?.income?.thisMonth || 0)}</div>
          <div className="stat-card__footer">
            <div>Tap here to view</div>
            <a href="#" className="stat-card__link">View All</a>
          </div>
        </div>

        <div className="stat-card stat-card--users">
          <div className="stat-card__title">USERS ACTIVE</div>
          <div className="stat-card__value">{formatNumber(dashboardData?.users?.active)}</div>
          <div className="stat-card__footer">
            <div>&nbsp;</div>
            <a href="#" className="stat-card__link">View All</a>
          </div>
        </div>

        <div className="stat-card stat-card--total">
          <div className="stat-card__title">TOTAL USERS</div>
          <div className="stat-card__value">{formatNumber(dashboardData?.users?.total)}</div>
          <div className="stat-card__footer">
            <div>&nbsp;</div>
            <a href="#" className="stat-card__link">View Reports</a>
          </div>
        </div>
      </div>

      <div className="chart-card">
        <h2 className="chart-card__title">Monthly Income Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={dashboardData?.income?.monthlyIncomeHistory}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `KSH.${formatNumber(value)}`} />
            <Line type="monotone" dataKey="income" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="tickets-card">
        <h2 className="tickets-card__title">TICKETS & ESCALATED ISSUES</h2>
        <div className="tickets-grid">
          <div className="ticket-stat">
            <div className="ticket-stat__value">{formatNumber(dashboardData?.tickets?.open)}</div>
            <div className="ticket-stat__label">Open</div>
          </div>
          <div className="ticket-stat">
            <div className="ticket-stat__value">{formatNumber(dashboardData?.tickets?.pending)}</div>
            <div className="ticket-stat__label">Pending</div>
          </div>
          <div className="ticket-stat">
            <div className="ticket-stat__value">{formatNumber(dashboardData?.tickets?.solved)}</div>
            <div className="ticket-stat__label">Solved</div>
          </div>
          <div className="ticket-stat">
            <div className="ticket-stat__value">{formatNumber(dashboardData?.tickets?.escalated)}</div>
            <div className="ticket-stat__label">Escalated</div>
          </div>
        </div>
      </div>

      <div className="clients-card">
        <h2 className="clients-card__title">CLIENTS CONNECTION OVERVIEW</h2>
        <div className="clients-grid">
          <div>
            <div className="client-stat">
              <div className="client-stat__value">{formatNumber(dashboardData?.connections?.online?.clients)}</div>
              <div className="client-stat__label">Online Clients</div>
            </div>
            <div className="client-stat">
              <div className="client-stat__value">{formatNumber(dashboardData?.connections?.online?.hotspot)}</div>
              <div className="client-stat__label">Online Hotspot</div>
            </div>
          </div>
          <div>
            <div className="client-stat">
              <div className="client-stat__value">{formatNumber(dashboardData?.connections?.active?.clients)}</div>
              <div className="client-stat__label">Active Clients</div>
            </div>
            <div className="client-stat">
              <div className="client-stat__value">{formatNumber(dashboardData?.connections?.active?.hotspot)}</div>
              <div className="client-stat__label">Offline Hotspot</div>
            </div>
          </div>
          <div>
            <div className="client-stat">
              <div className="client-stat__value">{formatNumber(dashboardData?.connections?.overdue?.clients)}</div>
              <div className="client-stat__label">Disabled Clients</div>
            </div>
            <div className="client-stat">
              <div className="client-stat__value">{formatNumber(dashboardData?.connections?.overdue?.hotspot)}</div>
              <div className="client-stat__label">Hotspot clients</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;