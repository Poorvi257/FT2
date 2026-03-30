import { apiClient } from "./apiClient.js";

export const budgetsApi = {
  create(body) {
    return apiClient.post("/api/budgets", body);
  },
  delete(budgetId) {
    return apiClient.delete(`/api/budgets/${budgetId}`);
  },
  getCurrent(month) {
    return apiClient.get(`/api/budgets/current?month=${month}`);
  },
  getHistory() {
    return apiClient.get("/api/budgets/history");
  }
};
