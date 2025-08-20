// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, BarChart, Settings as SettingsIcon } from "lucide-react";
import "./Sidebar.css";


const adminMenu = [
  { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/admin" },
  { name: "Users", icon: <Users size={18} />, path: "/admin/users" },
  { name: "Plans", icon: <BarChart size={18} />, path: "/admin/plans" },
  { name: "Payments", icon: <BarChart size={18} />, path: "/admin/payments" },
  { name: "Analytics", icon: <BarChart size={18} />, path: "/admin/analytics" },
  { name: "Settings", icon: <SettingsIcon size={18} />, path: "/dashboard/settings" },
];

const clientMenu = [
  { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/client" },
  { name: "Invoices", icon: <BarChart size={18} />, path: "/client/invoices" },
  { name: "History", icon: <BarChart size={18} />, path: "/client/history" },
  { name: "Profile", icon: <Users size={18} />, path: "/client/profile" },
  { name: "Settings", icon: <SettingsIcon size={18} />, path: "/dashboard/settings" },
];


// Pass role as a prop: 'admin' or 'client'. Default to 'client'.
export default function Sidebar({ onNavigate, role = 'client' }) {
  const location = useLocation();
  const menuItems = role === 'admin' ? adminMenu : clientMenu;

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
