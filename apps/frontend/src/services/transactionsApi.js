import { apiClient } from "./apiClient.js";

export const transactionsApi = {
  list(params) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null)
    );
    return apiClient.get(`/api/transactions?${search.toString()}`);
  },
  create(body) {
    return apiClient.post("/api/transactions", body);
  },
  getLast10(month) {
    return apiClient.get(`/api/transactions/last10?month=${month}`);
  }
};
