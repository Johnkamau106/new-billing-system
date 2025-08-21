// src/App.jsx
// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import AddClientPage from "./pages/admin/AddClientPage";
import ClientsListPage from "./pages/admin/ClientsListPage";
import CAPsMANPage from "./pages/admin/CAPsMANPage";
import HotspotClients from "./pages/admin/HotspotClients";
import PppoeClients from "./pages/admin/PppoeClients";
import StaticClients from "./pages/admin/StaticClients";

import Hotspots from "./pages/admin/Hotspots";

// Client panel pages
import ClientDashboard from "./pages/client/ClientDashboard";
import Invoices from "./pages/client/Invoices";
import History from "./pages/client/History";
import ClientProfile from "./pages/client/Profile";


import { auth } from "./services/auth";

const ProtectedRoute = ({ children, allowedRole }) => {
  if (!auth.isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  const userRole = auth.getUserRole();
  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/client'} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />
        {/* Admin Panel */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRole="admin">
              <Layout><AdminRoutes /></Layout>
            </ProtectedRoute>
          } 
        />
        {/* Client Panel */}
        <Route 
          path="/client/*" 
          element={
            <ProtectedRoute allowedRole="client">
              <Layout><ClientRoutes /></Layout>
            </ProtectedRoute>
          } 
        />
        {/* Default Dashboard for legacy route - redirect to appropriate dashboard */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <Layout><MainRoutes /></Layout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}


const MainRoutes = () => (
  <Routes>
    <Route path="" element={<Dashboard />} />
    <Route path="clients" element={<Clients />} />
    <Route path="reports" element={<Reports />} />
    <Route path="settings" element={<Settings />} />
    <Route path="profile" element={<Profile />} />
  </Routes>
);

const AdminRoutes = () => (
  <Routes>
    <Route path="" element={<AdminDashboard />} />
    <Route path="users" element={<Users />} />
    <Route path="plans" element={<Plans />} />
    <Route path="payments" element={<Payments />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="clients/new" element={<AddClientPage />} />
    <Route path="clients/list" element={<ClientsListPage />} />
    <Route path="clients/hotspot" element={<HotspotClients />} />
    <Route path="clients/pppoe" element={<PppoeClients />} />
    <Route path="clients/static" element={<StaticClients />} />
    <Route path="network/capsman" element={<CAPsMANPage />} />
    <Route path="network/hotspots" element={<Hotspots />} />
  </Routes>
);

const ClientRoutes = () => (
  <Routes>
    <Route path="" element={<ClientDashboard />} />
    <Route path="invoices" element={<Invoices />} />
    <Route path="history" element={<History />} />
    <Route path="profile" element={<ClientProfile />} />
  </Routes>
);

export default App;
