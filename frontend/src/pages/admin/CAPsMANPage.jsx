import React from 'react';

const CAPsMANPage = () => {
  return (
    <div className="capsman-page">
      <h1>CAPsMAN Integration</h1>
      <p>This page will allow you to manage your Mikrotik Access Points using CAPsMAN v2.</p>
      <p>Features to be implemented:</p>
      <ul>
        <li>List adopted Access Points</li>
        <li>View AP details and status</li>
        <li>Push configurations to APs</li>
        <li>Manage CAPsMAN settings</li>
      </ul>
      <p>For more information, refer to <a href="https://mum.mikrotik.com" target="_blank" rel="noopener noreferrer">mum.mikrotik.com</a></p>
    </div>
  );
};

export default CAPsMANPage;
