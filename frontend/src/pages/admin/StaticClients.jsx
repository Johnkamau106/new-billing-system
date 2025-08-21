import React, { useState, useEffect } from 'react';
import { CustomerDetailsModal, AddCustomerModal } from '../../components/CustomerModal';
import '../Clients.css'; // Assuming a shared CSS for client-related pages

const StaticClients = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Fetch clients from API
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => {
        setClients(data);
        setFilteredClients(data.filter(client => client.type === 'static'));
      })
      .catch(error => console.error('Error fetching clients:', error));
  }, []);

  const handleAddClient = (newClientData) => {
    // Here you would typically send newClientData to your backend API
    console.log('Adding new client:', newClientData);
    // For now, simulate adding the client
    const newClients = [...clients, { id: clients.length + 1, ...newClientData }];
    setClients(newClients);
    setFilteredClients(newClients.filter(client => client.type === 'static'));
    setShowAddModal(false);
  };

  const handleEditClient = (clientToEdit) => {
    // Here you would typically send updated client data to your backend API
    console.log('Editing client:', clientToEdit);
    // For now, simulate editing the client
    const newClients = clients.map(client => client.id === clientToEdit.id ? clientToEdit : client);
    setClients(newClients);
    setFilteredClients(newClients.filter(client => client.type === 'static'));
    setSelectedClient(null);
  };

  return (
    <div className="clients-list-page">
      <div className="clients-list-page__header">
        <h1 className="clients-list-page__title">Static Clients</h1>
        <button 
          className="clients-list-page__add-btn"
          onClick={() => setShowAddModal(true)}
        >
          Add New Client
        </button>
      </div>

      {filteredClients.length === 0 ? (
        <p>No static clients found.</p>
      ) : (
        <div className="clients-list">
          {filteredClients.map(client => (
            <div key={client.id} className="client-card" onClick={() => setSelectedClient(client)}>
              <h3>{client.name}</h3>
              <p>{client.email}</p>
              <p>{client.phone}</p>
              <p>Type: {client.type}</p>
              <span className={`status-badge status-badge--${client.status?.toLowerCase() || 'inactive'}`}>
                {client.status || 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      )}

      {selectedClient && (
        <CustomerDetailsModal 
          customer={selectedClient} 
          onClose={() => setSelectedClient(null)}
          onEdit={handleEditClient}
        />
      )}

      {showAddModal && (
        <AddCustomerModal 
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddClient}
        />
      )}
    </div>
  );
};

export default StaticClients;
