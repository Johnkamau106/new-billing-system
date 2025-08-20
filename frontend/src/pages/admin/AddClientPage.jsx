import React from 'react';
import { AddCustomerModal } from '../../components/CustomerModal';

const AddClientPage = () => {
  const handleSubmit = (formData) => {
    console.log('New client data:', formData);
    // Here you would typically send this data to your backend API
    // For now, we'll just log it.
    alert('Client added! Check console for data.');
  };

  return (
    <div className="add-client-page">
      <AddCustomerModal onClose={() => window.history.back()} onSubmit={handleSubmit} />
    </div>
  );
};

export default AddClientPage;
