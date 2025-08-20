import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './NetworkAuth.css';

const NetworkAuth = () => {
  const [activeTab, setActiveTab] = useState('pppoe');
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: pppoeAccounts, isLoading: loadingPPPoE } = useQuery(
    ['pppoe-accounts'],
    () => fetch('/api/pppoe/accounts').then(res => res.json())
  );

  const { data: hotspotAccounts, isLoading: loadingHotspot } = useQuery(
    ['hotspot-accounts'],
    () => fetch('/api/hotspot/accounts').then(res => res.json())
  );

  const suspendAccountMutation = useMutation(
    ({ type, id }) => fetch(`/api/${type}/accounts/${id}/suspend`, {
      method: 'POST',
    }).then(res => res.json()),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries([`${variables.type}-accounts`]);
      },
    }
  );

  const resetPasswordMutation = useMutation(
    ({ type, id }) => fetch(`/api/${type}/accounts/${id}/reset-password`, {
      method: 'POST',
    }).then(res => res.json()),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries([`${variables.type}-accounts`]);
      },
    }
  );

  return (
    <div className="network-auth">
      <div className="network-auth__header">
        <h1 className="network-auth__title">Network Authentication</h1>
        <button 
          className="network-auth__add"
          onClick={() => setShowAddModal(true)}
        >
          Add New Account
        </button>
      </div>

      <div className="network-auth__tabs">
        <button
          className={`tab-btn ${activeTab === 'pppoe' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('pppoe')}
        >
          PPPoE Accounts
        </button>
        <button
          className={`tab-btn ${activeTab === 'hotspot' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('hotspot')}
        >
          Hotspot Accounts
        </button>
      </div>

      <div className="network-auth__content">
        {activeTab === 'pppoe' ? (
          loadingPPPoE ? (
            <div className="loading">Loading PPPoE accounts...</div>
          ) : (
            <div className="accounts-table">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Customer</th>
                    <th>Router</th>
                    <th>Status</th>
                    <th>Last Connected</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pppoeAccounts?.map((account) => (
                    <tr key={account.id}>
                      <td>{account.username}</td>
                      <td>{account.customerName}</td>
                      <td>{account.routerName}</td>
                      <td>
                        <span className={`status-badge status-badge--${account.status.toLowerCase()}`}>
                          {account.status}
                        </span>
                      </td>
                      <td>{account.lastConnected ? new Date(account.lastConnected).toLocaleString() : 'Never'}</td>
                      <td>
                        <div className="actions">
                          <button
                            className="action-btn"
                            onClick={() => suspendAccountMutation.mutate({ 
                              type: 'pppoe', 
                              id: account.id 
                            })}
                          >
                            {account.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            className="action-btn"
                            onClick={() => resetPasswordMutation.mutate({ 
                              type: 'pppoe', 
                              id: account.id 
                            })}
                          >
                            Reset Password
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          loadingHotspot ? (
            <div className="loading">Loading Hotspot accounts...</div>
          ) : (
            <div className="accounts-table">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Type</th>
                    <th>Customer/Voucher</th>
                    <th>Status</th>
                    <th>Expiry</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hotspotAccounts?.map((account) => (
                    <tr key={account.id}>
                      <td>{account.username}</td>
                      <td>{account.type}</td>
                      <td>{account.customerName || account.voucherCode}</td>
                      <td>
                        <span className={`status-badge status-badge--${account.status.toLowerCase()}`}>
                          {account.status}
                        </span>
                      </td>
                      <td>{account.expiryDate ? new Date(account.expiryDate).toLocaleString() : 'Never'}</td>
                      <td>
                        <div className="actions">
                          <button
                            className="action-btn"
                            onClick={() => suspendAccountMutation.mutate({ 
                              type: 'hotspot', 
                              id: account.id 
                            })}
                          >
                            {account.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            className="action-btn"
                            onClick={() => resetPasswordMutation.mutate({ 
                              type: 'hotspot', 
                              id: account.id 
                            })}
                          >
                            Reset Password
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {showAddModal && (
        <NetworkAuthModal
          type={activeTab}
          onClose={() => setShowAddModal(false)}
          onSubmit={(data) => {
            // Handle add account
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

export default NetworkAuth;
