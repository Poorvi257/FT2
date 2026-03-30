import { useAsyncData } from "./useAsyncData.js";
import { reportsApi } from "../services/reportsApi.js";

export function useDashboard(month) {
  return useAsyncData(() => reportsApi.getDashboard(month), [month]);
}
