// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Mail, 
  MessageCircle,
  Users,
  Wifi,
  MonitorSmartphone,
  UserPlus,
  CreditCard,
  TicketIcon,
  ChevronDown
} from "lucide-react";
import "./Sidebar.css";

const menuItems = [
  { 
    name: "Dashboard", 
    icon: <LayoutDashboard size={18} />, 
    path: "/admin" 
  },
  {
    name: "Communication",
    icon: <MessageSquare size={18} />,
    submenu: [
      { name: "Emails", path: "/admin/communication/emails" },
      { name: "SMS", path: "/admin/communication/sms" },
      { name: "Whatsapp", path: "/admin/communication/whatsapp", isNew: true },
    ]
  },
  {
    name: "Clients",
    icon: <Users size={18} />,
    submenu: [
      { name: "Add new client", path: "/admin/clients/new" },
      { name: "Clients List", path: "/admin/clients/list" },
      { name: "PPPOE Clients", path: "/admin/clients/pppoe" },
      { name: "STATIC Clients", path: "/admin/clients/static" },
      { name: "Clients Lead", path: "/admin/clients/leads" },
    ]
  },
  {
    name: "Prepaid",
    icon: <CreditCard size={18} />,
    submenu: [
      { name: "Prepaid Users", path: "/admin/prepaid/users" },
      { name: "Prepaid Vouchers", path: "/admin/prepaid/vouchers" },
      { name: "Recharge Account", path: "/admin/prepaid/recharge" },
    ]
  },
  { 
    name: "Tickets", 
    icon: <TicketIcon size={18} />, 
    path: "/admin/tickets",
    isNew: true
  },
];


export default function Sidebar() {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleSubmenu = (itemName) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const isLinkActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="sidebar">
      <div className="sidebar__logo">
        <img src="/logo.svg" alt="Logo" />
      </div>
      <nav className="sidebar__menu">
        {menuItems.map((item) => (
          <div key={item.name} className="sidebar__item">
            {item.submenu ? (
              <>
                <button
                  className={`sidebar__link ${expandedItems[item.name] ? 'sidebar__link--expanded' : ''}`}
                  onClick={() => toggleSubmenu(item.name)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                  {item.isNew && <span className="sidebar__badge">New</span>}
                  <ChevronDown 
                    size={16} 
                    className={`sidebar__chevron ${expandedItems[item.name] ? 'sidebar__chevron--expanded' : ''}`} 
                  />
                </button>
                {expandedItems[item.name] && (
                  <ul className="sidebar__submenu">
                    {item.submenu.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`sidebar__sublink ${isLinkActive(subItem.path) ? 'sidebar__sublink--active' : ''}`}
                        >
                          {subItem.name}
                          {subItem.isNew && <span className="sidebar__badge">New</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                className={`sidebar__link ${isLinkActive(item.path) ? 'sidebar__link--active' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
                {item.isNew && <span className="sidebar__badge">New</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
