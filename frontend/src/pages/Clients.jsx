// src/pages/Clients.jsx
import React, { useEffect, useState } from "react";
import { getClients } from "../services/api";
import "./Clients.css";

export default function Clients() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    getClients().then(setClients).catch(console.error);
  }, []);

  return (
    <div className="page">
      <div className="page__header">
        <h1>Clients</h1>
        <p>Manage your clients and their balances.</p>
      </div>
      <div className="card table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.name}</td>
                <td>{client.email}</td>
                <td style={{ fontWeight: 600, color: "#16a34a" }}>
                  KSh {client.balance.toLocaleString()}
                </td>
                <td>
                  <span className={`badge ${client.status === "Active" ? "badge-success" : "badge-danger"}`}>
                    {client.status || "Active"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
