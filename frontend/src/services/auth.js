// src/services/auth.js
import { api } from "./api";

// Store auth token in localStorage
const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

export const auth = {
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  getUserRole: () => {
    const user = JSON.parse(localStorage.getItem(USER_KEY) || "{}");
    return user.role;
  },

  getUser: () => {
    return JSON.parse(localStorage.getItem(USER_KEY) || "{}");
  },

  async login(email, password) {
    try {
      // For development, simulate API call
      // TODO: Replace with actual API call
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            token: "mock_token",
            user: {
              id: 1,
              email,
              name: "Admin User",
              role: "admin",
            },
          });
        }, 500);
      });

      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      throw new Error(error.message || "Failed to login");
    }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = "/auth";
  },
};
