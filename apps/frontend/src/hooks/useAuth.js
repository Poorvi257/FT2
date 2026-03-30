import { useAuthContext } from "../app/providers.jsx";

export function useAuth() {
  return useAuthContext();
}
