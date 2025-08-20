import React, { useState } from 'react';
import './PlanModal.css';

export const PlanModal = ({ plan, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(plan || {
    name: '',
    type: 'pppoe',
    price: '',
    billingPeriod: 30,
    speedDown: '',
    speedUp: '',
    gracePeriod: 3,
    fupPolicy: '',
    features: [],
  });

  const [feature, setFeature] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddFeature = () => {
    if (feature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), feature.trim()]
      }));
      setFeature('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: Number(formData.price),
      speedDown: Number(formData.speedDown),
      speedUp: Number(formData.speedUp),
      billingPeriod: Number(formData.billingPeriod),
      gracePeriod: Number(formData.gracePeriod),
    });
  };

  return (
    <div className="modal">
      <div className="modal__content">
        <h2 className="modal__title">{plan ? 'Edit Plan' : 'Add New Plan'}</h2>
        <form onSubmit={handleSubmit} className="plan-form">
          <div className="form-row">
            <div className="form-group">
              <label>Plan Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Premium Fiber"
                required
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="pppoe">PPPoE</option>
                <option value="hotspot">Hotspot</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (KES)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 2999"
                required
              />
            </div>
            <div className="form-group">
              <label>Billing Period (Days)</label>
              <input
                type="number"
                name="billingPeriod"
                value={formData.billingPeriod}
                onChange={handleChange}
                placeholder="e.g. 30"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Download Speed (Mbps)</label>
              <input
                type="number"
                name="speedDown"
                value={formData.speedDown}
                onChange={handleChange}
                placeholder="e.g. 10"
                required
              />
            </div>
            <div className="form-group">
              <label>Upload Speed (Mbps)</label>
              <input
                type="number"
                name="speedUp"
                value={formData.speedUp}
                onChange={handleChange}
                placeholder="e.g. 5"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Grace Period (Days)</label>
              <input
                type="number"
                name="gracePeriod"
                value={formData.gracePeriod}
                onChange={handleChange}
                placeholder="e.g. 3"
                required
              />
            </div>
            <div className="form-group">
              <label>FUP Policy (Optional)</label>
              <input
                type="text"
                name="fupPolicy"
                value={formData.fupPolicy}
                onChange={handleChange}
                placeholder="e.g. Speed reduced to 1Mbps after 100GB"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Features</label>
            <div className="feature-input">
              <input
                type="text"
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
                placeholder="e.g. Free installation"
              />
              <button 
                type="button"
                onClick={handleAddFeature}
                className="feature-add-btn"
              >
                Add
              </button>
            </div>
            <ul className="feature-list">
              {formData.features?.map((feat, index) => (
                <li key={index} className="feature-item">
                  {feat}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="feature-remove-btn"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="modal__actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">{plan ? 'Save Changes' : 'Create Plan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
