import React from 'react';
import './CustomerModal.css';

export const AddCustomerModal = ({ onClose, onSubmit }) => {
  const [plans, setPlans] = React.useState([]);

  React.useEffect(() => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => setPlans(data));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  return (
    <div className="modal">
      <div className="modal__content">
        <h2 className="modal__title">Add New Customer</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" name="phone" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" required />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" required />
          </div>
          <div className="form-group">
            <label>KYC Document Number</label>
            <input type="text" name="kycDocument" required />
          </div>
          <div className="form-group">
            <label>Installation Notes</label>
            <textarea name="installationNotes" rows="3"></textarea>
          </div>
          <hr />
          <h3 className="modal__subtitle">Network Authentication</h3>
          <div className="form-group">
            <label>PPPoE/Hotspot Username</label>
            <input type="text" name="radius_username" />
          </div>
          <div className="form-group">
            <label>PPPoE/Hotspot Password</label>
            <input type="password" name="radius_password" />
          </div>
          <div className="form-group">
            <label>Data Plan</label>
            <select name="plan_id">
              <option value="">Select a plan</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Static IP Address</label>
            <input type="text" name="ip_address" />
          </div>
          <div className="modal__actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Add Customer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CustomerDetailsModal = ({ customer, onClose, onEdit }) => {
  return (
    <div className="modal">
      <div className="modal__content">
        <h2 className="modal__title">Customer Details</h2>
        <div className="customer-details">
          <div className="detail-group">
            <label>Name</label>
            <p>{customer.name}</p>
          </div>
          <div className="detail-group">
            <label>Contact</label>
            <p>{customer.phone}<br/>{customer.email}</p>
          </div>
          <div className="detail-group">
            <label>Address</label>
            <p>{customer.address}</p>
          </div>
          <div className="detail-group">
            <label>KYC Document</label>
            <p>{customer.kycDocument}</p>
          </div>
          <div className="detail-group">
            <label>Installation Notes</label>
            <p>{customer.installationNotes}</p>
          </div>
          <div className="detail-group">
            <label>Current Plan</label>
            <p>{customer.currentPlan?.name || 'No Plan'}</p>
          </div>
          <div className="detail-group">
            <label>Status</label>
            <p className={`status-badge status-badge--${customer.status.toLowerCase()}`}>
              {customer.status}
            </p>
          </div>
        </div>
        <hr />
        <h3 className="modal__subtitle">Network Authentication</h3>
        <div className="customer-details">
          <div className="detail-group">
            <label>PPPoE/Hotspot Username</label>
            <p>{customer.radius_username || 'Not set'}</p>
          </div>
          <div className="detail-group">
            <label>Static IP Address</label>
            <p>{customer.ip_address || 'Not set'}</p>
          </div>
        </div>
        <div className="modal__actions">
          <button onClick={onClose}>Close</button>
          <button onClick={() => onEdit(customer)}>Edit</button>
        </div>
      </div>
    </div>
  );
};
