// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

// Pages

import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";

// Admin panel pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import Plans from "./pages/admin/Plans";
import Payments from "./pages/admin/Payments";
import Analytics from "./pages/admin/Analytics";

// Client panel pages
import ClientDashboard from "./pages/client/ClientDashboard";
import Invoices from "./pages/client/Invoices";
import History from "./pages/client/History";
import ClientProfile from "./pages/client/Profile";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />
        {/* Admin Panel */}
        <Route path="/admin/*" element={<Layout><AdminRoutes /></Layout>} />
        {/* Client Panel */}
        <Route path="/client/*" element={<Layout><ClientRoutes /></Layout>} />
        {/* Default Dashboard for legacy route */}
        <Route path="/dashboard/*" element={<Layout><MainRoutes /></Layout>} />
      </Routes>
    </Router>
  );
}


const MainRoutes = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/clients" element={<Clients />} />
    <Route path="/reports" element={<Reports />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/profile" element={<Profile />} />
  </Routes>
);

const AdminRoutes = () => (
  <Routes>
    <Route path="/" element={<AdminDashboard />} />
    <Route path="/users" element={<Users />} />
    <Route path="/plans" element={<Plans />} />
    <Route path="/payments" element={<Payments />} />
    <Route path="/analytics" element={<Analytics />} />
  </Routes>
);

const ClientRoutes = () => (
  <Routes>
    <Route path="/" element={<ClientDashboard />} />
    <Route path="/invoices" element={<Invoices />} />
    <Route path="/history" element={<History />} />
    <Route path="/profile" element={<ClientProfile />} />
  </Routes>
);

export default App;
