const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
const env = require("../../config/env");
const { AppError } = require("../../utils/errors");

class GoogleOAuthService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_OAUTH_CLIENT_ID,
      env.GOOGLE_OAUTH_CLIENT_SECRET,
      env.GOOGLE_OAUTH_REDIRECT_URI
    );
  }

  createStateToken(payload) {
    return jwt.sign(payload, env.MAGIC_LINK_SECRET, {
      expiresIn: "15m"
    });
  }

  verifyStateToken(token) {
    return jwt.verify(token, env.MAGIC_LINK_SECRET);
  }

  createConnectUrl(appUserId) {
    const state = this.createStateToken({ appUserId, type: "google_oauth" });
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file"
      ],
      state
    });
  }

  createSignInUrl() {
    const state = this.createStateToken({ type: "google_signin" });
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "select_account",
      scope: [
        "openid",
        "email",
        "profile"
      ],
      state
    });
  }

  async exchangeCode(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    if (!tokens.access_token) {
      throw new AppError(400, "Google OAuth did not return an access token");
    }

    const client = new google.auth.OAuth2(
      env.GOOGLE_OAUTH_CLIENT_ID,
      env.GOOGLE_OAUTH_CLIENT_SECRET,
      env.GOOGLE_OAUTH_REDIRECT_URI
    );
    client.setCredentials(tokens);
    return { client, tokens };
  }

  async getUserProfile(client) {
    const oauth2 = google.oauth2({ version: "v2", auth: client });
    const response = await oauth2.userinfo.get();
    return response.data;
  }

  async createUserOwnedSpreadsheet(client, title) {
    const sheets = google.sheets({ version: "v4", auth: client });
    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title }
      }
    });

    return response.data;
  }

  async shareSpreadsheetWithServiceAccount(client, spreadsheetId) {
    const drive = google.drive({ version: "v3", auth: client });
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: {
        type: "user",
        role: "writer",
        emailAddress: env.GOOGLE_SERVICE_ACCOUNT_EMAIL
      },
      sendNotificationEmail: false
    });
  }
}

module.exports = new GoogleOAuthService();
