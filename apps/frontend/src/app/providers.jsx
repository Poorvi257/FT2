import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/authApi.js";
import { settingsApi } from "../services/settingsApi.js";
import { setCurrencyDefaults } from "../lib/formatCurrency.js";

const AuthContext = createContext(null);

export function AppProviders({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await authApi.me();

        if (!active) {
          return;
        }

        setUser(response.user);

        if (response.user?.userSheetId) {
          setSettingsLoading(true);

          try {
            const settingsResponse = await settingsApi.get();

            if (!active) {
              return;
            }

            setSettings(settingsResponse.settings);
            setCurrencyDefaults(settingsResponse.settings?.currency || "SGD");
          } catch {
            if (active) {
              setSettings(null);
              setCurrencyDefaults("SGD");
            }
          } finally {
            if (active) {
              setSettingsLoading(false);
            }
          }
        } else {
          setSettings(null);
          setCurrencyDefaults("SGD");
        }
      } catch {
        if (active) {
          setUser(null);
          setSettings(null);
          setCurrencyDefaults("SGD");
        }
      } finally {
        if (active) {
          setLoading(false);
          setSettingsLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  const value = {
    user,
    loading,
    settings,
    settingsLoading,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
