import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner, ErrorDisplay } from "../../components/Charts";
import { api } from "../../services/api";
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [selectedRouter, setSelectedRouter] = useState('All routers');

  const { data: dashboardData, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      return api.get('/dashboard');
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

  if (isError) {
    return (
      <div className="dashboard">
        <ErrorDisplay message={error.message} />
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
          <div className="stat-card__value">{formatCurrency(1190)}</div>
          <div className="stat-card__footer">
            <div>72 Entries</div>
            <a href="#" className="stat-card__link">View Reports</a>
          </div>
        </div>

        <div className="stat-card stat-card--month">
          <div className="stat-card__title">INCOME THIS MONTH</div>
          <div className="stat-card__value">{formatCurrency(dashboardData?.monthlyIncome || 0)}</div>
          <div className="stat-card__footer">
            <div>Tap here to view</div>
            <a href="#" className="stat-card__link">View All</a>
          </div>
        </div>

        <div className="stat-card stat-card--users">
          <div className="stat-card__title">USERS ACTIVE</div>
          <div className="stat-card__value">41</div>
          <div className="stat-card__footer">
            <div>&nbsp;</div>
            <a href="#" className="stat-card__link">View All</a>
          </div>
        </div>

        <div className="stat-card stat-card--total">
          <div className="stat-card__title">TOTAL USERS</div>
          <div className="stat-card__value">2641</div>
          <div className="stat-card__footer">
            <div>&nbsp;</div>
            <a href="#" className="stat-card__link">View Reports</a>
          </div>
        </div>
      </div>

      <div className="tickets-card">
        <h2 className="tickets-card__title">TICKETS & ESCALATED ISSUES</h2>
        <div className="tickets-grid">
          <div className="ticket-stat">
            <div className="ticket-stat__value">0</div>
            <div className="ticket-stat__label">Open</div>
          </div>
          <div className="ticket-stat">
            <div className="ticket-stat__value">0</div>
            <div className="ticket-stat__label">Pending</div>
          </div>
          <div className="ticket-stat">
            <div className="ticket-stat__value">0</div>
            <div className="ticket-stat__label">Solved</div>
          </div>
          <div className="ticket-stat">
            <div className="ticket-stat__value">0</div>
            <div className="ticket-stat__label">Escalated</div>
          </div>
        </div>
      </div>

      <div className="clients-card">
        <h2 className="clients-card__title">CLIENTS CONNECTION OVERVIEW</h2>
        <div className="clients-grid">
          <div>
            <div className="client-stat">
              <div className="client-stat__value">0</div>
              <div className="client-stat__label">Online Clients</div>
            </div>
            <div className="client-stat">
              <div className="client-stat__value">21</div>
              <div className="client-stat__label">Online Hotspot</div>
            </div>
          </div>
          <div>
            <div className="client-stat">
              <div className="client-stat__value">41</div>
              <div className="client-stat__label">Active Clients</div>
            </div>
            <div className="client-stat">
              <div className="client-stat__value">2626</div>
              <div className="client-stat__label">Offline Hotspot</div>
            </div>
          </div>
          <div>
            <div className="client-stat">
              <div className="client-stat__value">0</div>
              <div className="client-stat__label">Disabled Clients</div>
            </div>
            <div className="client-stat">
              <div className="client-stat__value">3091</div>
              <div className="client-stat__label">Hotspot clients</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
