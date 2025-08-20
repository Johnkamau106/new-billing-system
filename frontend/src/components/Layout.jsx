// src/components/Layout.jsx
import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "./Layout.css";


// Mock function to get user role from localStorage or JWT (replace with real logic)
function getUserRole() {
  // Example: return localStorage.getItem('role') || 'client';
  // For demo, use URL path to infer role
  if (window.location.pathname.startsWith('/admin')) return 'admin';
  if (window.location.pathname.startsWith('/client')) return 'client';
  return 'client';
}

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const role = getUserRole();

  return (
    <div className="layout">
      <div className={`layout__sidebar-container ${isSidebarOpen ? "layout__sidebar-container--open" : ""}`}>
        <Sidebar onNavigate={() => setIsSidebarOpen(false)} role={role} />
      </div>

      <div
        className={`layout__overlay ${isSidebarOpen ? "layout__overlay--show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <div className="layout__main">
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="layout__content">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
