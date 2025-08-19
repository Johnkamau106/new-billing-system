// src/components/Navbar.jsx
import { Menu } from "lucide-react";
import "./Navbar.css";

function Navbar({ onMenuClick }) {
  return (
    <nav className="navbar">
      <button className="navbar__menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={24} color="#374151" />
      </button>

      <h1 className="navbar__title">Money App</h1>
      <div className="navbar__right">
        <span>Welcome, User</span>
      </div>
    </nav>
  );
}

export default Navbar;
