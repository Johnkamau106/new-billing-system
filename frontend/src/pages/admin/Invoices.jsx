import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import './Invoices.css';

const Invoices = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('current');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery(
    ['invoices', filterStatus, dateRange],
    () => fetch(`/api/invoices?status=${filterStatus}&range=${dateRange}`).then(res => res.json())
  );

  const markAsPaidMutation = useMutation(
    (invoiceId) => fetch(`/api/invoices/${invoiceId}/mark-paid`, {
      method: 'POST',
    }).then(res => res.json()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('invoices');
      },
    }
  );

  const generateInvoicesMutation = useMutation(
    () => fetch('/api/invoices/generate', {
      method: 'POST',
    }).then(res => res.json()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('invoices');
      },
    }
  );

  const sendReminderMutation = useMutation(
    (invoiceId) => fetch(`/api/invoices/${invoiceId}/send-reminder`, {
      method: 'POST',
    }).then(res => res.json())
  );

  const filteredInvoices = invoices?.filter(invoice => 
    invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'status-badge--success';
      case 'overdue': return 'status-badge--danger';
      case 'pending': return 'status-badge--warning';
      default: return '';
    }
  };

  const downloadInvoice = (invoiceId) => {
    window.open(`/api/invoices/${invoiceId}/download`, '_blank');
  };

  return (
    <div className="invoices">
      <div className="invoices__header">
        <h1 className="invoices__title">Invoices</h1>
        <button
          className="invoices__generate"
          onClick={() => generateInvoicesMutation.mutate()}
        >
          Generate New Invoices
        </button>
      </div>

      <div className="invoices__filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by customer or invoice number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="invoices__search"
          />
        </div>

        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="invoices__filter"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="invoices__filter"
          >
            <option value="current">Current Month</option>
            <option value="last">Last Month</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>
      </div>

      <div className="invoices__summary">
        <div className="summary-card">
          <span className="summary-label">Total Pending</span>
          <span className="summary-value">
            KES {invoices?.reduce((sum, inv) => 
              inv.status === 'pending' ? sum + inv.amount : sum, 0
            )?.toLocaleString() || '0'}
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total Overdue</span>
          <span className="summary-value summary-value--danger">
            KES {invoices?.reduce((sum, inv) => 
              inv.status === 'overdue' ? sum + inv.amount : sum, 0
            )?.toLocaleString() || '0'}
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total Collected</span>
          <span className="summary-value summary-value--success">
            KES {invoices?.reduce((sum, inv) => 
              inv.status === 'paid' ? sum + inv.amount : sum, 0
            )?.toLocaleString() || '0'}
          </span>
        </div>
      </div>

      <div className="invoices__table">
        {isLoading ? (
          <div className="loading">Loading invoices...</div>
        ) : !filteredInvoices?.length ? (
          <div className="empty">No invoices found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>
                    <div className="customer-info">
                      <span className="customer-name">{invoice.customerName}</span>
                      <span className="customer-phone">{invoice.customerPhone}</span>
                    </div>
                  </td>
                  <td>{invoice.planName}</td>
                  <td>KES {invoice.amount.toLocaleString()}</td>
                  <td>{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="action-btn"
                        onClick={() => downloadInvoice(invoice.id)}
                      >
                        Download
                      </button>
                      {invoice.status !== 'paid' && (
                        <>
                          <button
                            className="action-btn"
                            onClick={() => markAsPaidMutation.mutate(invoice.id)}
                          >
                            Mark Paid
                          </button>
                          <button
                            className="action-btn"
                            onClick={() => sendReminderMutation.mutate(invoice.id)}
                          >
                            Send Reminder
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Invoices;
