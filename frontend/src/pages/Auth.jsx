// src/pages/Auth.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/auth";
import "./Auth.css";

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Check if already authenticated
    if (auth.isAuthenticated()) {
      const role = auth.getUserRole();
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/client');
      }
    }
  }, [navigate]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Handle login
        const user = await auth.login(form.email, form.password);
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/client');
        }
      } else {
        // Handle registration
        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match!");
          return;
        }
        // TODO: Implement registration
        console.log("Register:", form);
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h2>{isLogin ? "Admin Login" : "Admin Registration"}</h2>
          {error && <div className="error-message">{error}</div>}
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
          <button 
            type="submit" 
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? "Please wait..." : (isLogin ? "Login" : "Register")}
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
