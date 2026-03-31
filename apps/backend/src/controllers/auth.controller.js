const magicLinkService = require("../services/auth/magicLink.service");
const sessionService = require("../services/auth/session.service");
const googleOAuthService = require("../services/auth/googleOAuth.service");
const onboardingService = require("../services/onboarding/onboarding.service");
const sheetTemplateService = require("../services/sheets/sheetTemplate.service");
const userRegistryService = require("../services/users/userRegistry.service");
const env = require("../config/env");

function getSessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

function createFrontendSessionRedirect(nextPath, user, sessionToken) {
  const params = new URLSearchParams({
    sessionToken,
    nextPath,
    appUserId: user.app_user_id,
    onboardingStatus: user.onboarding_status || "pending",
    userSheetId: user.user_sheet_id || "",
    webLoginEmail: user.web_login_email || ""
  });

  return `${env.FRONTEND_BASE_URL}/login#${params.toString()}`;
}

async function consumeMagicLinkController(req, res) {
  const { token } = req.body;
  const payload = magicLinkService.verifyToken(token);
  const sessionToken = sessionService.createSessionToken({ appUserId: payload.appUserId });
  const user = await userRegistryService.findByAppUserId(payload.appUserId);

  res.cookie("ft2_session", sessionToken, getSessionCookieOptions());

  res.json({
    token: sessionToken,
    appUserId: payload.appUserId,
    onboardingStatus: user?.onboarding_status || "pending",
    userSheetId: user?.user_sheet_id || "",
    webLoginEmail: user?.web_login_email || ""
  });
}

async function meController(req, res) {
  const user = await userRegistryService.findByAppUserId(req.auth.appUserId);
  res.json({
    user: {
      ...req.auth,
      onboardingStatus: user?.onboarding_status || "pending",
      userSheetId: user?.user_sheet_id || "",
      webLoginEmail: user?.web_login_email || ""
    }
  });
}

async function logoutController(req, res) {
  res.clearCookie("ft2_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });
  res.status(204).send();
}

async function googleConnectController(req, res) {
  const user = await userRegistryService.getRequiredByAppUserId(req.auth.appUserId);
  if (user.user_sheet_id) {
    res.redirect(`${env.FRONTEND_BASE_URL}/settings?google=already_connected`);
    return;
  }

  const url = googleOAuthService.createConnectUrl(req.auth.appUserId);
  res.redirect(url);
}

async function googleSignInController(req, res) {
  const url = googleOAuthService.createSignInUrl();
  res.redirect(url);
}

async function googleCallbackController(req, res) {
  const { code, state } = req.query;
  const statePayload = googleOAuthService.verifyStateToken(state);
  const { client } = await googleOAuthService.exchangeCode(code);
  const profile = await googleOAuthService.getUserProfile(client);

  if (statePayload.type === "google_signin") {
    const existingUser = await userRegistryService.findByWebLoginEmail(profile.email || "");

    if (!existingUser) {
      res.redirect(`${env.FRONTEND_BASE_URL}/login?google=no_account`);
      return;
    }

    const sessionToken = sessionService.createSessionToken({ appUserId: existingUser.app_user_id });

    res.cookie("ft2_session", sessionToken, getSessionCookieOptions());

    res.redirect(createFrontendSessionRedirect(existingUser.user_sheet_id ? "/" : "/settings", existingUser, sessionToken));
    return;
  }

  const user = await userRegistryService.getRequiredByAppUserId(statePayload.appUserId);

  if (user.user_sheet_id) {
    res.redirect(`${env.FRONTEND_BASE_URL}/settings?google=already_connected`);
    return;
  }
  const spreadsheet = await googleOAuthService.createUserOwnedSpreadsheet(
    client,
    `FT2 - ${profile.email || user.telegram_username || statePayload.appUserId}`
  );

  await googleOAuthService.shareSpreadsheetWithServiceAccount(client, spreadsheet.spreadsheetId);
  await sheetTemplateService.initializeUserSpreadsheet(spreadsheet.spreadsheetId);
  await onboardingService.completeGoogleSheetConnection({
    appUserId: statePayload.appUserId,
    spreadsheetId: spreadsheet.spreadsheetId,
    spreadsheetUrl: spreadsheet.spreadsheetUrl,
    email: profile.email || ""
  });

  res.redirect(`${env.FRONTEND_BASE_URL}/settings?google=connected`);
}

module.exports = {
  consumeMagicLinkController,
  meController,
  logoutController,
  googleConnectController,
  googleSignInController,
  googleCallbackController
};
