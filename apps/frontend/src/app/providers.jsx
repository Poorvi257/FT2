import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/authApi.js";
import { settingsApi } from "../services/settingsApi.js";
import { clearStoredSessionToken } from "../lib/authSession.js";
import { setCurrencyDefaults } from "../lib/formatCurrency.js";

const AuthContext = createContext(null);

export function AppProviders({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settings, setSettings] = useState(null);

  function applySettings(nextSettings) {
    setSettings(nextSettings);
    setCurrencyDefaults(nextSettings?.currency || "SGD");
  }

  async function refreshSettings(nextUser = user) {
    if (!nextUser) {
      applySettings(null);
      return null;
    }

    setSettingsLoading(true);

    try {
      const settingsResponse = await settingsApi.get();
      applySettings(settingsResponse.settings);
      return settingsResponse.settings;
    } catch {
      return null;
    } finally {
      setSettingsLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await authApi.me();

        if (!active) {
          return;
        }

        setUser(response.user);
        if (response.user) {
          const settingsResponse = await settingsApi.get().catch(() => null);
          if (!active) {
            return;
          }

          applySettings(settingsResponse?.settings || null);
        } else {
          applySettings(null);
        }
      } catch {
        if (active) {
          clearStoredSessionToken();
          setUser(null);
          applySettings(null);
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
    setUser,
    setSettings: applySettings,
    applySettings,
    refreshSettings
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
