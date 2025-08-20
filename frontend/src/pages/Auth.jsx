// src/pages/Auth.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      // Handle login
      console.log("Login:", form);
      navigate("/dashboard");
    } else {
      // Handle registration
      if (form.password !== form.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      console.log("Register:", form);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h2>{isLogin ? "Admin Login" : "Admin Registration"}</h2>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleFormChange}
              required
            />
          </div>
          {!isLogin && (
            <div className="form-group">
              <label className="label">Confirm Password</label>
              <input
                className="input"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleFormChange}
                required
              />
            </div>
          )}
          <button type="submit" className="btn btn-primary auth-btn">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <div className="auth-footer">
          <button className="btn btn-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
