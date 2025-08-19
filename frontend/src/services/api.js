// src/api.js
export async function getClients() {
  return [
    { id: 1, name: "John Doe", email: "john@example.com", balance: 12000 },
    { id: 2, name: "Mary Wambui", email: "mary@example.com", balance: 8500 },
  ];
}

export async function getReports() {
  return [
    { name: "Income", value: 50000 },
    { name: "Expenses", value: 20000 },
    { name: "Savings", value: 15000 },
  ];
}

export async function getSettings() {
  return {
    currency: "KSh",
    theme: "light",
  };
}

export async function updateSettings(newSettings) {
  console.log("Settings updated:", newSettings);
  return newSettings;
}
