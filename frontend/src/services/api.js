// src/services/api.js
import axios from "axios";

// Create axios instance with default config
export const api = axios.create({
  baseURL: '/api',
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message;
    throw new Error(message);
  }
);

// Dashboard
export async function getDashboardData() {
  try {
    const response = await api.get("/portal/dashboard");
    return response;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      client: { balance: 0 },
      usage_24h: { download: 0, upload: 0, detailed: [] },
      unpaid_bills: [],
    };
  }
}

// Clients
export async function getClients() {
  const response = await api.get("/clients");
  return (
    response || [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        balance: 12000,
        status: "Active",
      },
      {
        id: 2,
        name: "Mary Wambui",
        email: "mary@example.com",
        balance: 8500,
        status: "Suspended",
      },
    ]
  );
}

// Reports
export async function getReports() {
  return [
    { name: "Income", value: 50000 },
    { name: "Expenses", value: 20000 },
    { name: "Savings", value: 15000 },
  ];
}

// Settings
export async function getSettings() {
  return {
    currency: "KSh",
    theme: "light",
    company: "Your ISP",
  };
}

export async function updateSettings(newSettings) {
  console.log("Settings updated:", newSettings);
  return newSettings;
}

// Plans
export async function getPlans() {
  return [
    {
      id: 1,
      name: "Home 10Mbps",
      price: 1500,
      cycle: "monthly",
      bandwidth: "10/10 Mbps",
    },
    {
      id: 2,
      name: "Business 50Mbps",
      price: 6000,
      cycle: "monthly",
      bandwidth: "50/50 Mbps",
    },
  ];
}

// Invoices
export async function getInvoices() {
  return [
    {
      id: 101,
      client_id: 1,
      period: "2025-08",
      amount: 1500,
      status: "Paid",
      due_date: "2025-08-05",
    },
    {
      id: 102,
      client_id: 2,
      period: "2025-08",
      amount: 6000,
      status: "Overdue",
      due_date: "2025-08-05",
    },
  ];
}

// Payments
export async function getPayments() {
  return [
    {
      id: 5001,
      client_id: 1,
      amount: 1500,
      method: "M-Pesa",
      reference: "STK1234",
      created_at: "2025-08-02",
    },
  ];
}
