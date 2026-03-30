import { apiClient } from "./apiClient.js";

export const categoriesApi = {
  list() {
    return apiClient.get("/api/categories");
  },
  create(body) {
    return apiClient.post("/api/categories", body);
  }
};
