// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, BarChart, Settings as SettingsIcon } from "lucide-react";
import "./Sidebar.css";

const menuItems = [
  { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/" },
  { name: "Clients", icon: <Users size={18} />, path: "/clients" },
  { name: "Reports", icon: <BarChart size={18} />, path: "/reports" },
  { name: "Settings", icon: <SettingsIcon size={18} />, path: "/settings" },
];

export default function Sidebar({ onNavigate }) {
  const location = useLocation();

  return (
    <div className="sidebar">
      <h1 className="sidebar__title">💰 Money App</h1>
      <ul className="sidebar__menu">
        {menuItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={`sidebar__link ${
                location.pathname === item.path ? "sidebar__link--active" : ""
              }`}
              onClick={onNavigate}
            >
              {item.icon}
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
