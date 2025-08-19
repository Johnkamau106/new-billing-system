// src/pages/Clients.jsx
import React, { useEffect, useState } from "react";
import { getClients } from "../services/api";
import "./Clients.css";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    balance: "0",
    status: "Active",
  });

  useEffect(() => {
    getClients()
      .then((data) => {
        // ensure fields exist for UI
        const normalized = data.map((c) => ({
          id: c.id,
          name: c.name || "",
          email: c.email || "",
          balance: typeof c.balance === "number" ? c.balance : Number(c.balance || 0),
          status: c.status || "Active",
        }));
        setClients(normalized);
        setFiltered(normalized);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFiltered(clients);
    } else {
      setFiltered(
        clients.filter(
          (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
        )
      );
    }
  }, [search, clients]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    const nextId = clients.length ? Math.max(...clients.map((c) => c.id)) + 1 : 1;
    const newClient = {
      id: nextId,
      name: form.name.trim(),
      email: form.email.trim(),
      balance: Number(form.balance || 0),
      status: form.status,
    };
    setClients((prev) => [newClient, ...prev]);
    setShowForm(false);
    setForm({ name: "", email: "", balance: "0", status: "Active" });
  };

  return (
    <div className="page">
      <div className="page__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Clients</h1>
          <p>Manage your clients and their balances.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Close" : "Add Client"}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ maxWidth: 900 }}>
          <form onSubmit={handleAddClient} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="label">Name</label>
              <input className="input" type="text" name="name" value={form.name} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" type="email" name="email" value={form.email} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label className="label">Balance (KSh)</label>
              <input className="input" type="number" step="0.01" name="balance" value={form.balance} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label className="label">Status</label>
              <select className="input" name="status" value={form.status} onChange={handleFormChange}>
                <option>Active</option>
                <option>Suspended</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12 }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <input
          className="input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
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
            {filtered.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.name}</td>
                <td>{client.email}</td>
                <td style={{ fontWeight: 600, color: "#16a34a" }}>
                  KSh {client.balance.toLocaleString()}
                </td>
                <td>
                  <span className={`badge ${client.status === "Active" ? "badge-success" : "badge-danger"}`}>
                    {client.status}
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
