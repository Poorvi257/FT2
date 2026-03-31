import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { categoriesApi } from "../services/categoriesApi.js";
import { settingsApi } from "../services/settingsApi.js";
import { CategoryManager } from "../components/settings/CategoryManager.jsx";
import { Card } from "../components/common/Card.jsx";
import { ProfileSettingsForm } from "../components/settings/ProfileSettingsForm.jsx";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { ErrorState } from "../components/common/ErrorState.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { currentMonthKey } from "../lib/userDate.js";

export function SettingsPage() {
  const { applySettings, refreshSettings } = useAuth();
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  async function handleSavePreferences(body) {
    setIsSaving(true);
    setError("");
    setStatus("");

    try {
      const response = await settingsApi.update(body);
      setSettings(response.settings);
      applySettings(response.settings);
      await refreshSettings();
      setStatus("Preferences updated.");
    } catch (err) {
      setError(err.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
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
            onSave={handleSavePreferences}
            onResync={handleResync}
            month={currentMonthKey(settings?.timezone || "UTC")}
            googleConnectUrl={settingsApi.getGoogleConnectUrl()}
            saving={isSaving}
          />
          {settings?.userSheetId ? (
            <CategoryManager categories={categories} onCreate={handleCreateCategory} />
          ) : (
            <Card title="Categories" className="bg-white/[0.04]">
              <p className="text-sm leading-6 text-fg-muted">
                Connect Google Sheets to manage categories for transaction capture and budgeting.
              </p>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
