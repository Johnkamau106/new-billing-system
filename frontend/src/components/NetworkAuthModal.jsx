import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import './NetworkAuthModal.css';

export const NetworkAuthModal = ({ type, onClose, onSubmit }) => {
  const { data: customers } = useQuery(
    ['customers'],
    () => fetch('/api/customers').then(res => res.json())
  );

  const { data: routers } = useQuery(
    ['routers'],
    () => fetch('/api/routers').then(res => res.json())
  );

  const [formData, setFormData] = useState({
    type: type,
    accountType: 'customer', // or 'voucher' for hotspot
    customerId: '',
    routerId: '',
    username: '',
    password: '',
    validityPeriod: 30, // for vouchers
    dataLimit: '', // for vouchers
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateCredentials = () => {
    // Generate random username/password
    const username = `user${Math.random().toString(36).substring(2, 8)}`;
    const password = Math.random().toString(36).substring(2, 10);
    
    setFormData(prev => ({
      ...prev,
      username,
      password,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal">
      <div className="modal__content">
        <h2 className="modal__title">
          Add New {type === 'pppoe' ? 'PPPoE' : 'Hotspot'} Account
        </h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {type === 'hotspot' && (
            <div className="form-group">
              <label>Account Type</label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                required
              >
                <option value="customer">Customer Account</option>
                <option value="voucher">Voucher</option>
              </select>
            </div>
          )}

          {formData.accountType === 'customer' && (
            <div className="form-group">
              <label>Customer</label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                required
              >
                <option value="">Select Customer</option>
                {customers?.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.phone})
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === 'pppoe' && (
            <div className="form-group">
              <label>Router</label>
              <select
                name="routerId"
                value={formData.routerId}
                onChange={handleChange}
                required
              >
                <option value="">Select Router</option>
                {routers?.map(router => (
                  <option key={router.id} value={router.id}>
                    {router.name} ({router.ipAddress})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Username</label>
              <div className="input-group">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="generate-btn"
                  onClick={generateCredentials}
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {formData.accountType === 'voucher' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Validity Period (Days)</label>
                  <input
                    type="number"
                    name="validityPeriod"
                    value={formData.validityPeriod}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Data Limit (GB)</label>
                  <input
                    type="number"
                    name="dataLimit"
                    value={formData.dataLimit}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    placeholder="Unlimited if empty"
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Optional notes about this account"
            />
          </div>

          <div className="modal__actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
