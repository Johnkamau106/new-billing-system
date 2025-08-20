import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AddCustomerModal, CustomerDetailsModal } from '../../components/CustomerModal';
import './Customers.css';

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const handleAddCustomer = async (customerData) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });
      
      if (!response.ok) throw new Error('Failed to add customer');
      
      queryClient.invalidateQueries('customers');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding customer:', error);
      // Handle error (show notification, etc.)
    }
  };

  const handleEditCustomer = async (customerData) => {
    try {
      const response = await fetch(`/api/customers/${customerData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });
      
      if (!response.ok) throw new Error('Failed to update customer');
      
      queryClient.invalidateQueries('customers');
      setSelectedCustomer(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating customer:', error);
      // Handle error (show notification, etc.)
    }
  };

  const { data: customers, isLoading } = useQuery(
    ['customers', searchQuery, filterStatus],
    () => fetch(`/api/customers?search=${searchQuery}&status=${filterStatus}`)
      .then(res => res.json())
  );

  const suspendMutation = useMutation(
    (customerId) => fetch(`/api/customers/${customerId}/suspend`, {
      method: 'POST',
    }).then(res => res.json()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customers');
      },
    }
  );

  const activateMutation = useMutation(
    (customerId) => fetch(`/api/customers/${customerId}/activate`, {
      method: 'POST',
    }).then(res => res.json()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customers');
      },
    }
  );

  return (
    <div className="customers">
      <div className="customers__header">
        <h1 className="customers__title">Customer Management</h1>
        <button 
          className="customers__button customers__button--primary"
          onClick={() => setShowAddModal(true)}
        >
          Add New Customer
        </button>
      </div>

      <div className="customers__controls">
        <input
          type="text"
          className="customers__search"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <select
          className="customers__filter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="customers__table">
        {isLoading ? (
          <div className="customers__loading">Loading...</div>
        ) : !customers?.length ? (
          <div className="customers__empty">No customers found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Last Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>
                    {customer.phone}<br/>
                    {customer.email}
                  </td>
                  <td>{customer.currentPlan?.name || 'No Plan'}</td>
                  <td>
                    <span className={`status-badge status-badge--${customer.status.toLowerCase()}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>
                    {customer.lastPayment 
                      ? new Date(customer.lastPayment).toLocaleDateString()
                      : 'No payments'
                    }
                  </td>
                  <td>
                    <div className="customers__actions">
                      <button 
                        className="action-btn"
                        onClick={() => {
                          customer.status === 'Active' 
                            ? suspendMutation.mutate(customer.id)
                            : activateMutation.mutate(customer.id);
                        }}
                      >
                        {customer.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsEditing(true);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsEditing(false);
                        }}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCustomer}
        />
      )}

      {selectedCustomer && !isEditing && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onEdit={() => setIsEditing(true)}
        />
      )}

      {selectedCustomer && isEditing && (
        <AddCustomerModal
          customer={selectedCustomer}
          onClose={() => {
            setSelectedCustomer(null);
            setIsEditing(false);
          }}
          onSubmit={handleEditCustomer}
        />
      )}
    </div>
  );
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="5" className="text-center py-4">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Profile Modal/Drawer */}
      {showProfile && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowProfile(false)}>&times;</button>
            <h3 className="text-lg font-bold mb-2">Customer Profile</h3>
            <div className="mb-2"><b>Name:</b> {selected.name}</div>
            <div className="mb-2"><b>Phone:</b> {selected.phone}</div>
            <div className="mb-2"><b>Email:</b> {selected.email}</div>
            <div className="mb-2"><b>Status:</b> {selected.status}</div>
            <div className="mb-2"><b>Address:</b> {selected.address}</div>
            <div className="mb-2"><b>KYC:</b> {selected.kyc}</div>
            <div className="mb-2"><b>Notes:</b> {selected.notes}</div>
            <h4 className="font-semibold mt-4 mb-2">Subscriptions</h4>
            <table className="min-w-full border mb-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 border">Plan</th>
                  <th className="px-2 py-1 border">Status</th>
                  <th className="px-2 py-1 border">Next Bill</th>
                  <th className="px-2 py-1 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selected.subscriptions.map(s => (
                  <tr key={s.id}>
                    <td className="px-2 py-1 border">{s.plan}</td>
                    <td className="px-2 py-1 border">{s.status}</td>
                    <td className="px-2 py-1 border">{s.nextBill}</td>
                    <td className="px-2 py-1 border">
                      <button className="btn bg-yellow-400 px-2 py-1 rounded mr-2" onClick={() => handleToggleStatus(selected.id, s.id)}>
                        {s.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {selected.subscriptions.length === 0 && (
                  <tr><td colSpan="4" className="text-center py-2">No subscriptions</td></tr>
                )}
              </tbody>
            </table>
            <div className="flex gap-2 mt-2">
              <select className="input border px-2 py-1 rounded" defaultValue="" onChange={e => e.target.value && handleAttachPlan(selected.id, Number(e.target.value))}>
                <option value="" disabled>Attach Plan...</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
