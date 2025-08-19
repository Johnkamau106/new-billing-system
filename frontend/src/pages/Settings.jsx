// src/pages/Settings.jsx
import React, { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../services/api";
import "./Settings.css";

export default function Settings() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    getSettings().then(setForm).catch(console.error);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(form);
      alert("Settings updated successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to update settings ❌");
    }
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1>Settings</h1>
        <p>Update your preferences below.</p>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="input" />
          </div>

          <div className="form-group">
            <label className="label">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="input" />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="input" />
          </div>

          <button type="submit" className="btn btn-primary">Save Changes</button>
        </form>
      </div>
    </div>
  );
}
