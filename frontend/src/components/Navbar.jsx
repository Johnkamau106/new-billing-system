// src/components/Navbar.jsx
import { Menu, Bell } from "lucide-react";
import "./Navbar.css";

function Navbar({ onMenuClick }) {
  return (
    <nav className="navbar">
      <button className="navbar__menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={24} color="#374151" />
      </button>

      <h1 className="navbar__title">Money App</h1>
      <div className="navbar__right">
        <button className="notification-btn" aria-label="Notifications">
          <Bell size={20} color="#374151" />
          <span className="notification-dot"></span>
        </button>
        <a className="profile-link" href="#/profile" onClick={(e) => { e.preventDefault(); window.location.href = "/profile"; }}>
          <span className="profile-avatar">U</span>
          <span>Profile</span>
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
