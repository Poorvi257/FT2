import { Card } from "../common/Card.jsx";

export function ProfileSettingsForm({ settings, onResync, month, googleConnectUrl }) {
  return (
    <Card title="Profile and sync" className="bg-white/[0.04]">
      <div className="settings-grid">
        <div>
          <span className="settings-label">Timezone</span>
          <strong className="text-fg">{settings?.timezone || "-"}</strong>
        </div>
        <div>
          <span className="settings-label">Currency</span>
          <strong className="text-fg">{settings?.currency || "-"}</strong>
        </div>
        <div>
          <span className="settings-label">Linked sheet</span>
          <strong className="settings-value text-fg">{settings?.userSheetId || "Not connected"}</strong>
        </div>
        <div>
          <span className="settings-label">Telegram</span>
          <strong className="settings-value text-fg">{settings?.telegramLinked ? "Linked" : "Not linked"}</strong>
        </div>
      </div>
      <div className="inline-form">
        {!settings?.userSheetId ? (
          <a className="button-link" href={googleConnectUrl}>Connect Google Sheets</a>
        ) : (
          <>
            {settings?.userSheetUrl ? <a className="button-link secondary" href={settings.userSheetUrl} target="_blank" rel="noreferrer">Open linked sheet</a> : null}
            <button onClick={() => onResync(month)}>Resync current month</button>
          </>
        )}
      </div>
    </Card>
  );
}
