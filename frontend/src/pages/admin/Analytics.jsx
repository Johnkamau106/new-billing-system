import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import Card from '../../components/Card';
import './Analytics.css';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [metrics, setMetrics] = useState('bandwidth');

  const { data: analyticsData, isLoading } = useQuery(
    ['analytics', dateRange, metrics],
    () => fetch(`/api/analytics?range=${dateRange}&metrics=${metrics}`)
      .then(res => res.json())
  );

  const statsCards = [
    {
      title: 'Total Active Customers',
      value: analyticsData?.activeCustomers || 0,
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Monthly Recurring Revenue',
      value: analyticsData?.mrr ? `KES ${analyticsData.mrr.toLocaleString()}` : 'KES 0',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Average Uptime',
      value: analyticsData?.uptime ? `${analyticsData.uptime}%` : '0%',
      change: '+0.5%',
      changeType: 'positive'
    },
    {
      title: 'Open Support Tickets',
      value: analyticsData?.openTickets || 0,
      change: '-2',
      changeType: 'negative'
    }
  ];

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  const handleMetricsChange = (e) => {
    setMetrics(e.target.value);
  };

  return (
    <div className="analytics">
      <div className="analytics__header">
        <h1 className="analytics__title">Analytics Dashboard</h1>
        <div className="analytics__filters">
          <select 
            className="analytics__filter"
            value={dateRange}
            onChange={handleDateRangeChange}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <select
            className="analytics__filter"
            value={metrics}
            onChange={handleMetricsChange}
          >
            <option value="bandwidth">Bandwidth Usage</option>
            <option value="revenue">Revenue</option>
            <option value="customers">Customer Growth</option>
            <option value="uptime">Network Uptime</option>
          </select>
        </div>
      </div>

      <div className="analytics__grid">
        {statsCards.map((card, index) => (
          <Card
            key={index}
            title={card.title}
            value={card.value}
            change={card.change}
            changeType={card.changeType}
          />
        ))}
      </div>

      <div className="analytics__chart-container">
        <h2>Usage Trends</h2>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={analyticsData?.chartData || []}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
