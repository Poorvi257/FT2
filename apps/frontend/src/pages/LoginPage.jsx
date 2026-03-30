import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../services/authApi.js";
import { useAuth } from "../hooks/useAuth.js";

const DEFAULT_TELEGRAM_BOT_URL = "https://t.me/finance_tracket_bot";

function getTelegramSignupUrl(rawValue) {
  const value = String(rawValue || DEFAULT_TELEGRAM_BOT_URL).trim();

  if (!value) {
    return `${DEFAULT_TELEGRAM_BOT_URL}?start=ft2_signup`;
  }

  const normalized = value
    .replace(/^https?:\/\/(www\.)?t\.me\//i, "")
    .replace(/^https?:\/\/web\.telegram\.org\/k\/#@/i, "")
    .replace(/^@/, "")
    .replace(/\?.*$/, "")
    .replace(/\/+$/, "");

  if (!normalized) {
    return `${DEFAULT_TELEGRAM_BOT_URL}?start=ft2_signup`;
  }

  return `https://t.me/${normalized}?start=ft2_signup`;
}

export function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading, setUser } = useAuth();
  const [message, setMessage] = useState("Choose how you want to access FT2.");
  const telegramSignupUrl = getTelegramSignupUrl(import.meta.env.VITE_TELEGRAM_BOT_URL);
  const token = params.get("token");
  const googleState = params.get("google");

  useEffect(() => {
    if (!loading && user && !token) {
      navigate(user.userSheetId ? "/" : "/settings");
      return;
    }

    if (!token) {
      if (googleState === "no_account") {
        setMessage("This Google account is not linked to FT2 yet. Start in Telegram first, then complete onboarding.");
        return;
      }

      setMessage("New users should start in Telegram. Existing onboarded users can sign in with Google.");
      return;
    }

    setMessage("Signing you in with your Telegram magic link...");
    authApi.consumeMagicLink(token)
      .then((result) => {
        setUser({
          appUserId: result.appUserId,
          onboardingStatus: result.onboardingStatus,
          userSheetId: result.userSheetId,
          webLoginEmail: result.webLoginEmail
        });
        navigate(result.userSheetId ? "/" : "/settings");
      })
      .catch((error) => setMessage(error.message));
  }, [googleState, loading, navigate, setUser, token, user]);

  return (
    <div className="login-page">
      <div className="login-card">
        <span className="brand-kicker">FT2</span>
        <h1>Finance Tracker Login</h1>
        <p>{message}</p>
        {!token ? (
          <div className="mt-8 grid gap-3">
            <a className="button-link" href={authApi.getGoogleSignInUrl()}>
              Sign in with Google
            </a>
            <a
              className="button-link secondary"
              href={telegramSignupUrl}
              target="_blank"
              rel="noreferrer"
            >
              Sign up with Telegram
            </a>
          </div>
        ) : null}
        {!token ? (
          <p className="mt-4 text-sm leading-6 text-fg-muted">
            Use Google sign-in only if your FT2 account is already onboarded and linked. For new accounts, open the FT2 bot in Telegram, tap Start, and use the login link it sends you.
          </p>
        ) : null}
      </div>
    </div>
  );
}
