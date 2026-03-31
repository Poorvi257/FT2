const test = require("node:test");
const assert = require("node:assert/strict");
const authController = require("../controllers/auth.controller");
const googleOAuthService = require("../services/auth/googleOAuth.service");
const userRegistryService = require("../services/users/userRegistry.service");
const sessionService = require("../services/auth/session.service");

test("googleCallbackController sets the cookie and redirects with a frontend session fragment for google sign-in", async (context) => {
  const originalVerifyStateToken = googleOAuthService.verifyStateToken;
  const originalExchangeCode = googleOAuthService.exchangeCode;
  const originalGetUserProfile = googleOAuthService.getUserProfile;
  const originalFindByWebLoginEmail = userRegistryService.findByWebLoginEmail;
  const originalCreateSessionToken = sessionService.createSessionToken;

  context.after(() => {
    googleOAuthService.verifyStateToken = originalVerifyStateToken;
    googleOAuthService.exchangeCode = originalExchangeCode;
    googleOAuthService.getUserProfile = originalGetUserProfile;
    userRegistryService.findByWebLoginEmail = originalFindByWebLoginEmail;
    sessionService.createSessionToken = originalCreateSessionToken;
  });

  googleOAuthService.verifyStateToken = () => ({ type: "google_signin" });
  googleOAuthService.exchangeCode = async () => ({ client: {} });
  googleOAuthService.getUserProfile = async () => ({ email: "user@example.com" });
  userRegistryService.findByWebLoginEmail = async () => ({
    app_user_id: "usr_1",
    onboarding_status: "active",
    user_sheet_id: "sheet_1",
    web_login_email: "user@example.com"
  });
  sessionService.createSessionToken = () => "session-token";

  let cookieArgs = null;
  let redirectUrl = "";
  const req = {
    query: {
      code: "code",
      state: "state"
    }
  };
  const res = {
    cookie(...args) {
      cookieArgs = args;
    },
    redirect(url) {
      redirectUrl = url;
    }
  };

  await authController.googleCallbackController(req, res);

  assert.equal(cookieArgs[0], "ft2_session");
  assert.equal(cookieArgs[1], "session-token");
  assert.match(redirectUrl, /\/login#sessionToken=session-token/);
  assert.match(redirectUrl, /nextPath=%2F/);
  assert.match(redirectUrl, /userSheetId=sheet_1/);
  assert.match(redirectUrl, /webLoginEmail=user%40example\.com/);
});
