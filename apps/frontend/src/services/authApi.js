import { apiClient } from "./apiClient.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const authApi = {
  consumeMagicLink(token) {
    return apiClient.post("/api/auth/magic-link/consume", { token });
  },
  me() {
    return apiClient.get("/api/auth/me");
  },
  logout() {
    return apiClient.post("/api/auth/logout", {});
  },
  getGoogleSignInUrl() {
    return `${API_BASE_URL}/api/auth/google/signin`;
  }
};
