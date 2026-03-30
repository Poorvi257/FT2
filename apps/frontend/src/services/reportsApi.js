import { apiClient } from "./apiClient.js";

export const reportsApi = {
  getDashboard(month) {
    return apiClient.get(`/api/reports/dashboard?month=${month}`);
  },
  getMonthly(month) {
    return apiClient.get(`/api/reports/monthly?month=${month}`);
  },
  getHistory(from, to) {
    return apiClient.get(`/api/reports/history?from=${from}&to=${to}`);
  }
};
