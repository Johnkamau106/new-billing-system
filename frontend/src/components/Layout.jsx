// src/components/Layout.jsx
import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "./Layout.css";

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <div className={`layout__sidebar-container ${isSidebarOpen ? "layout__sidebar-container--open" : ""}`}>
        <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
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
