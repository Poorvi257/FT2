import { useAsyncData } from "./useAsyncData.js";
import { budgetsApi } from "../services/budgetsApi.js";

export function useBudget(month) {
  return useAsyncData(() => budgetsApi.getCurrent(month), [month]);
}
