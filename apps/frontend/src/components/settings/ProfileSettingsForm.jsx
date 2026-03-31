import { useEffect, useMemo, useState } from "react";
import { Card } from "../common/Card.jsx";

function getTimezoneOptions() {
  if (typeof Intl.supportedValuesOf !== "function") {
    return [];
  }

  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return [];
  }
}

export function ProfileSettingsForm({ settings, onSave, onResync, month, googleConnectUrl, saving }) {
  const [timezone, setTimezone] = useState(settings?.timezone || "");
  const [currency, setCurrency] = useState(settings?.currency || "");
  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);

  useEffect(() => {
    setTimezone(settings?.timezone || "");
    setCurrency(settings?.currency || "");
  }, [settings?.timezone, settings?.currency]);

  return (
    <Card title="Profile and sync" className="bg-white/[0.04]">
      <div className="settings-grid">
        <label>
          <span className="settings-label">Timezone</span>
          <input
            list="timezone-options"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            placeholder="e.g. Asia/Kolkata"
            autoComplete="off"
          />
        </label>
        <label>
          <span className="settings-label">Currency</span>
          <input
            value={currency}
            onChange={(event) => setCurrency(event.target.value.toUpperCase())}
            placeholder="e.g. INR"
            autoComplete="off"
            maxLength={3}
          />
        </label>
        <div>
          <span className="settings-label">Linked sheet</span>
          <strong className="settings-value text-fg">{settings?.userSheetId || "Not connected"}</strong>
        </div>
        <div>
          <span className="settings-label">Telegram</span>
          <strong className="settings-value text-fg">{settings?.telegramLinked ? "Linked" : "Not linked"}</strong>
        </div>
      </div>
      {timezoneOptions.length ? (
        <datalist id="timezone-options">
          {timezoneOptions.map((option) => <option key={option} value={option} />)}
        </datalist>
      ) : null}
      <div className="inline-form">
        <button type="button" onClick={() => onSave({ timezone, currency })} disabled={saving}>
          {saving ? "Saving..." : "Save preferences"}
        </button>
        {!settings?.userSheetId ? (
          <a className="button-link" href={googleConnectUrl}>Connect Google Sheets</a>
        ) : (
          <>
            {settings?.userSheetUrl ? <a className="button-link secondary" href={settings.userSheetUrl} target="_blank" rel="noreferrer">Open linked sheet</a> : null}
            <button type="button" onClick={() => onResync(month)}>Resync current month</button>
          </>
        )}
      </div>
      <p className="mt-4 text-sm leading-6 text-fg-muted">
        Timezone changes affect only future defaults and calculations based on today or the current month. Historical transaction dates and stored amounts stay unchanged.
      </p>
    </Card>
  );
}
