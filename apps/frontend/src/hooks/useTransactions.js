import { useAsyncData } from "./useAsyncData.js";
import { transactionsApi } from "../services/transactionsApi.js";

export function useTransactions(params) {
  return useAsyncData(() => transactionsApi.list(params), [JSON.stringify(params)]);
}
