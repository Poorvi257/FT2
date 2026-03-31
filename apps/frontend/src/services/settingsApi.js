import { apiClient } from "./apiClient.js";

export const settingsApi = {
  get() {
    return apiClient.get("/api/settings");
  },
  update(body) {
    return apiClient.patch("/api/settings", body);
  },
  getGoogleConnectUrl() {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
    return `${apiBaseUrl}/api/auth/google/connect`;
  },
  resync(month) {
    return apiClient.post(`/api/sync/resync?month=${month}`, {});
  }
};
