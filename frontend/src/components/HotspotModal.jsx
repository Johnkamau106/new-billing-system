import React, { useState, useEffect } from 'react';
import './HotspotModal.css';

const HotspotModal = ({ hotspot, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    ip_address: '',
    mac_address: ''
  });

  useEffect(() => {
    if (hotspot) {
      setFormData({
        name: hotspot.name || '',
        location: hotspot.location || '',
        ip_address: hotspot.ip_address || '',
        mac_address: hotspot.mac_address || ''
      });
    } else {
      setFormData({
        name: '',
        location: '',
        ip_address: '',
        mac_address: ''
      });
    }
  }, [hotspot]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, id: hotspot?.id });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{hotspot ? 'Edit Hotspot' : 'Add Hotspot'}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="hotspot-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="ip_address">IP Address</label>
            <input
              type="text"
              id="ip_address"
              name="ip_address"
              value={formData.ip_address}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="mac_address">MAC Address</label>
            <input
              type="text"
              id="mac_address"
              name="mac_address"
              value={formData.mac_address}
              onChange={handleChange}
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">
              {hotspot ? 'Save Changes' : 'Add Hotspot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotspotModal;