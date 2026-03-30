# FT2 Finance Tracker

Production-style personal finance tracker with Telegram bot input, Google Sheets storage, a React dashboard, and a strict additive budgeting layer.

## Repo structure

```text
apps/
  backend/   Express API, Telegram webhook, Google Sheets services
  frontend/  React + Vite dashboard
packages/
  shared/    shared enums and month helpers
```

## Stack

- Backend: Node.js + Express
- Frontend: React + Vite
- Storage: Google Sheets only
- Bot: Telegram webhook
- Backend hosting: Render
- Frontend hosting: Vercel

## Core design

- One app-owned Google Sheet acts as the user registry.
- Each user gets a separate Google Spreadsheet for financial data.
- Monthly transaction tabs are created lazily on first use.
- Budgeting is separate from core tracking and reads transaction history without mutating it.
- Resync recomputes budget snapshots and reports from sheet rows as source of truth.
- Telegram onboarding creates the app user first; Google OAuth then creates the user-owned sheet and shares it to the backend service account.

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure backend env

Copy [apps/backend/.env.example](/Users/poorvishrivastava/Desktop/FT2/apps/backend/.env.example) to `apps/backend/.env` and fill in:

- `FRONTEND_BASE_URL`
- `CORS_ORIGIN`
- `JWT_SECRET`
- `MAGIC_LINK_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_REGISTRY_SHEET_ID`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI`

### 3. Configure frontend env

Copy [apps/frontend/.env.example](/Users/poorvishrivastava/Desktop/FT2/apps/frontend/.env.example) to `apps/frontend/.env` and set:

- `VITE_API_BASE_URL=http://localhost:4000`
- `VITE_TELEGRAM_BOT_URL=https://t.me/<your_bot_username>`

### 4. Start the apps

Backend:

```bash
npm run dev:backend
```

Frontend:

```bash
npm run dev:frontend
```

## Google Sheets setup

### App registry sheet

Create a spreadsheet with a tab named `users_registry`, or let the app create it if the spreadsheet exists and the service account has editor access.

This registry stores:

- `app_user_id`
- `telegram_user_id`
- `telegram_chat_id`
- `user_sheet_id`
- `timezone`
- `currency`
- onboarding metadata

No financial transactions should live in the registry sheet.

### Google service account

1. Create a Google Cloud project.
2. Enable Google Sheets API and Google Drive API.
3. Create a service account.
4. Generate a JSON key.
5. Share the registry spreadsheet with the service account email as editor.

The backend uses the service account to:

- read/write the registry sheet
- append monthly transaction rows
- persist budget config and snapshots

User-owned spreadsheets are created via Google OAuth in the user's account, then shared with the service account for ongoing app access.

## Google OAuth setup

1. In the same Google Cloud project, configure the OAuth consent screen.
2. Create an OAuth 2.0 Web application client.
3. Add authorized redirect URIs:
   - `http://localhost:4000/api/auth/google/callback`
   - `https://<your-render-service>.onrender.com/api/auth/google/callback`
4. Copy the OAuth client ID and secret into backend env.

Use:

- `GOOGLE_OAUTH_REDIRECT_URI=http://localhost:4000/api/auth/google/callback` for local
- `GOOGLE_OAUTH_REDIRECT_URI=https://<your-render-service>.onrender.com/api/auth/google/callback` for production

## Telegram setup

1. Create a bot with BotFather.
2. Set `TELEGRAM_BOT_TOKEN`.
3. Choose a random `TELEGRAM_WEBHOOK_SECRET`.
4. Deploy the backend or expose it locally.
5. Register the webhook:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_BACKEND_URL>/api/telegram/webhook&secret_token=<YOUR_SECRET>"
```

Supported commands:

- `/start`
- `/help`
- `/add`
- `/report`
- `/last10`
- `/categories`
- `/budget`
- `/resync`

Free-form examples:

- `milk 80 groceries`
- `rent 15000 rent fixed`
- `coffee 180 food variable`

Note: after `/start`, the user must open the web app and connect Google Sheets in Settings before transaction logging is enabled.
Use a direct bot link such as `https://t.me/<your_bot_username>?start=ft2_signup` so new users land in the FT2 bot conversation with the Start button ready.

## Render deployment

[render.yaml](/Users/poorvishrivastava/Desktop/FT2/render.yaml) defines the backend service.

Recommended steps:

1. Push the repo to GitHub.
2. Create a new Render Blueprint or Web Service connected to the repo.
3. Use the root of the repo as the project root.
4. Render will run:

```bash
npm install
npm --workspace @ft2/backend run start
```

Set these env vars in Render:

- `APP_BASE_URL=https://<your-render-service>.onrender.com`
- `FRONTEND_BASE_URL=https://<your-vercel-app>.vercel.app`
- `CORS_ORIGIN=https://<your-vercel-app>.vercel.app`
- `JWT_SECRET`
- `MAGIC_LINK_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_REGISTRY_SHEET_ID`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI`
- `DEFAULT_TIMEZONE`
- `DEFAULT_CURRENCY`

After deployment, set the Telegram webhook to:

```text
https://<your-render-service>.onrender.com/api/telegram/webhook
```

## Vercel deployment

[apps/frontend/vercel.json](/Users/poorvishrivastava/Desktop/FT2/apps/frontend/vercel.json) configures the frontend deployment.

Recommended steps:

1. Import the GitHub repo into Vercel.
2. Set the root directory to the repo root.
3. Set `VITE_API_BASE_URL=https://<your-render-service>.onrender.com`
4. Deploy.

Vercel build settings from the file:

- install command: `npm install`
- build command: `npm --workspace @ft2/frontend run build`
- output directory: `apps/frontend/dist`

## CI

[ci.yml](/Users/poorvishrivastava/Desktop/FT2/.github/workflows/ci.yml) runs on push and PR.

It does:

- `npm install`
- backend tests
- frontend production build

This keeps CI simple and lets Render/Vercel handle deployments from GitHub.

## Environment variables

### Backend

- `NODE_ENV`
- `PORT`
- `APP_BASE_URL`
- `FRONTEND_BASE_URL`
- `CORS_ORIGIN`
- `JWT_SECRET`
- `MAGIC_LINK_SECRET`
- `MAGIC_LINK_TTL_MINUTES`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_REGISTRY_SHEET_ID`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI`
- `DEFAULT_TIMEZONE`
- `DEFAULT_CURRENCY`

### Frontend

- `VITE_API_BASE_URL`
- `VITE_TELEGRAM_BOT_URL`

## Operational notes

- The current scaffold does not yet include package-lock files.
- Telegram retries should eventually be guarded by a persisted idempotency strategy.
- Some Google Sheets write paths currently rewrite whole config/snapshot tabs, which is acceptable for personal or small multi-user scale but should be optimized if usage grows.
- The frontend currently uses simple SVG/CSS charts to stay dependency-light and free-tier friendly.

## Phase summary

This repo now includes:

- backend scaffold
- frontend scaffold
- Google Sheets storage layer
- Telegram webhook handler
- budget engine
- report APIs
- deployment manifests
- CI workflow

The next practical step is installing dependencies, supplying real env values, and doing an end-to-end dry run with a dev Telegram bot and dev Google registry sheet.
