import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import HotspotModal from '../../components/HotspotModal';
import './Hotspots.css';

const Hotspots = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const queryClient = useQueryClient();

  // --- Data Fetching ---
  const { data: hotspots, isLoading } = useQuery({
    queryKey: ['hotspots'],
    queryFn: () => fetch('/api/hotspots').then(res => res.json())
  });

  // --- Mutations ---
  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotspots'] });
      setShowModal(false);
      setSelectedHotspot(null);
    },
    onError: (error) => {
      console.error('An error occurred:', error);
      alert(`Error: ${error.message || 'An unknown error occurred.'}`);
    },
  };

  const addHotspotMutation = useMutation({
    mutationFn: (hotspotData) => fetch('/api/hotspots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotspotData),
    }).then(res => res.json()),
    ...mutationOptions
  });

  const updateHotspotMutation = useMutation({
    mutationFn: (hotspotData) => fetch(`/api/hotspots/${hotspotData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotspotData),
    }).then(res => res.json()),
    ...mutationOptions
  });

  const deleteHotspotMutation = useMutation({
    mutationFn: (hotspotId) => fetch(`/api/hotspots/${hotspotId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hotspots'] }),
    onError: mutationOptions.onError,
  });

  // --- Event Handlers ---
  const handleFormSubmit = (hotspotData) => {
    if (selectedHotspot) {
      updateHotspotMutation.mutate(hotspotData);
    } else {
      addHotspotMutation.mutate(hotspotData);
    }
  };

  const handleDelete = (hotspot) => {
    if (window.confirm(`Are you sure you want to delete hotspot "${hotspot.name}"?`)) {
      deleteHotspotMutation.mutate(hotspot.id);
    }
  };

  const handleOpenModal = (hotspot = null) => {
    setSelectedHotspot(hotspot);
    setShowModal(true);
  };

  return (
    <div className="hotspots-page">
      <div className="hotspots-header">
        <h1>Hotspot Management</h1>
        <button className="add-hotspot-btn" onClick={() => handleOpenModal()}>Add New Hotspot</button>
      </div>
      {isLoading ? (
        <div className="loading-state">Loading hotspots...</div>
      ) : (
        <div className="hotspots-table-container">
          <table className="hotspots-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>IP Address</th>
                <th>MAC Address</th>
                <th>Status</th>
                <th>Last Seen</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotspots?.map(hotspot => (
                <tr key={hotspot.id}>
                  <td>{hotspot.name}</td>
                  <td>{hotspot.location || 'N/A'}</td>
                  <td>{hotspot.ip_address || 'N/A'}</td>
                  <td>{hotspot.mac_address || 'N/A'}</td>
                  <td>
                    <span className={`status-badge status-badge--${hotspot.status?.toLowerCase()}`}>
                      {hotspot.status}
                    </span>
                  </td>
                  <td>{hotspot.last_seen ? new Date(hotspot.last_seen).toLocaleString() : 'Never'}</td>
                  <td className="actions-cell">
                    <button className="action-btn" onClick={() => handleOpenModal(hotspot)}>Edit</button>
                    <button className="action-btn action-btn--danger" onClick={() => handleDelete(hotspot)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <HotspotModal
          hotspot={selectedHotspot}
          onClose={() => setShowModal(false)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default Hotspots;
