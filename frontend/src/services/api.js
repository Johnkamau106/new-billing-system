// src/services/api.js

// Clients
export async function getClients() {
  return [
    { id: 1, name: "John Doe", email: "john@example.com", balance: 12000, status: "Active" },
    { id: 2, name: "Mary Wambui", email: "mary@example.com", balance: 8500, status: "Suspended" },
  ];
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
    { id: 1, name: "Home 10Mbps", price: 1500, cycle: "monthly", bandwidth: "10/10 Mbps" },
    { id: 2, name: "Business 50Mbps", price: 6000, cycle: "monthly", bandwidth: "50/50 Mbps" },
  ];
}

// Invoices
export async function getInvoices() {
  return [
    { id: 101, client_id: 1, period: "2025-08", amount: 1500, status: "Paid", due_date: "2025-08-05" },
    { id: 102, client_id: 2, period: "2025-08", amount: 6000, status: "Overdue", due_date: "2025-08-05" },
  ];
}

// Payments
export async function getPayments() {
  return [
    { id: 5001, client_id: 1, amount: 1500, method: "M-Pesa", reference: "STK1234", created_at: "2025-08-02" },
  ];
}
