// src/pages/Profile.jsx
import React from "react";
import "./Profile.css";

export default function Profile() {
  return (
    <div className="page">
      <div className="page__header">
        <h1>Profile</h1>
        <p>Manage your account information.</p>
      </div>

      <div className="card profile">
        <div className="profile__header">
          <div className="avatar">U</div>
          <div>
            <div className="profile__name">User Name</div>
            <div className="profile__email">user@example.com</div>
          </div>
        </div>

        <div className="profile__section">
          <div className="form-group">
            <label className="label">Full Name</label>
            <input className="input" type="text" defaultValue="User Name" />
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" type="email" defaultValue="user@example.com" />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" type="button">Save</button>
        </div>
      </div>
    </div>
  );
}
