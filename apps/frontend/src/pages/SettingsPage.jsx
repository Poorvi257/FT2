import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { categoriesApi } from "../services/categoriesApi.js";
import { settingsApi } from "../services/settingsApi.js";
import { CategoryManager } from "../components/settings/CategoryManager.jsx";
import { ProfileSettingsForm } from "../components/settings/ProfileSettingsForm.jsx";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { ErrorState } from "../components/common/ErrorState.jsx";

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function SettingsPage() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    setStatus("");

    try {
      const [categoriesResponse, settingsResponse] = await Promise.all([
        categoriesApi.list(),
        settingsApi.get()
      ]);

      setCategories(categoriesResponse.items);
      setSettings(settingsResponse.settings);
    } catch (err) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const googleStatus = params.get("google");

    if (googleStatus === "connected") {
      setStatus("Google Sheets connected successfully.");
      setError("");
    }

    if (googleStatus === "already_connected") {
      setError("A Google Sheet is already linked to this account. Reconnect is blocked to protect your existing data.");
      setStatus("");
    }

    if (googleStatus) {
      const nextParams = new URLSearchParams(params);
      nextParams.delete("google");
      setParams(nextParams, { replace: true });
    }
  }, [params, setParams]);

  async function handleCreateCategory(body) {
    await categoriesApi.create(body);
    await load();
  }

  async function handleResync(month) {
    try {
      const result = await settingsApi.resync(month);
      setStatus(`Resync completed for ${result.month}.`);
    } catch (err) {
      setError(err.message || "Resync failed");
    }
  }

  return (
    <div className="page-shell page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Settings</span>
          <h2>Categories and integration controls</h2>
          <p>Manage the connected sheet, category defaults, Telegram flow, and resync controls in one place.</p>
        </div>
      </div>

      {loading ? <LoadingState label="Loading settings..." /> : null}
      {error ? <ErrorState message={error} /> : null}
      {status ? <LoadingState label={status} /> : null}
      {!loading && !error ? (
        <>
          <ProfileSettingsForm
            settings={settings}
            onResync={handleResync}
            month={currentMonthKey()}
            googleConnectUrl={settingsApi.getGoogleConnectUrl()}
          />
          <CategoryManager categories={categories} onCreate={handleCreateCategory} />
        </>
      ) : null}
    </div>
  );
}
