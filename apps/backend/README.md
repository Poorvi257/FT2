# Backend

Node.js + Express backend for the FT2 finance tracker.

## What is included

- REST API for transactions, reports, budgets, categories, settings, auth
- Telegram webhook handler
- Google Sheets registry and per-user sheet services
- Month-wise transaction storage
- Deterministic budget engine with daily snapshots
- Manual resync endpoint

## Local setup

1. Copy [`.env.example`](/Users/poorvishrivastava/Desktop/FT2/apps/backend/.env.example) to `.env`.
2. Fill in Google service account, Google OAuth, registry sheet, and Telegram bot values.
3. Install dependencies:

```bash
npm install
```

4. Run backend:

```bash
npm run dev:backend
```

## Required Google setup

- Create one app-owned registry spreadsheet and share it with the service account email as editor.
- Enable Google Sheets API and Google Drive API.
- Put the registry spreadsheet ID in `GOOGLE_REGISTRY_SHEET_ID`.
- Configure a Google OAuth web client with callback `http://localhost:4000/api/auth/google/callback`.
- User spreadsheets are created through Google OAuth on the web app, then shared back to the service account.

## Telegram webhook

Expose the backend publicly, then configure:

```bash
https://api.telegram.org/bot<token>/setWebhook?url=<backend-url>/api/telegram/webhook&secret_token=<secret>
```

## Key implementation choices

- `users_registry` is the only shared app sheet.
- Each user gets a separate spreadsheet.
- Monthly transaction tabs are created lazily.
- Budgeting reads transaction history and stores snapshots separately.
- Resync recomputes snapshots from sheet rows instead of trusting cached state.

## Next phases

- Frontend React dashboard
- Deployment configs for Render and Vercel
- CI workflow and root README
