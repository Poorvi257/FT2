const BaseSheetService = require("./baseSheet.service");
const sheetsClient = require("./sheetsClient.service");
const env = require("../../config/env");
const { SHEET_TABS, REGISTRY_HEADERS } = require("../../config/constants");

class RegistrySheetService extends BaseSheetService {
  constructor() {
    super();
    this.spreadsheetId = env.GOOGLE_REGISTRY_SHEET_ID;
    this.cache = {
      users: null,
      expiresAt: 0
    };
  }

  async ensureRegistrySheet() {
    const spreadsheet = await sheetsClient.getSpreadsheet(this.spreadsheetId);
    const exists = spreadsheet.sheets.some((sheet) => sheet.properties.title === SHEET_TABS.REGISTRY);
    if (!exists) {
      await sheetsClient.batchUpdate(this.spreadsheetId, [{
        addSheet: { properties: { title: SHEET_TABS.REGISTRY } }
      }]);
      await sheetsClient.updateValues(this.spreadsheetId, `${SHEET_TABS.REGISTRY}!A1:P1`, [REGISTRY_HEADERS]);
    }
  }

  async getAllUsers() {
    if (this.cache.users && this.cache.expiresAt > Date.now()) {
      return this.cache.users;
    }

    await this.ensureRegistrySheet();
    const rows = await sheetsClient.getValues(this.spreadsheetId, `${SHEET_TABS.REGISTRY}!A2:P`);
    const users = this.mapRows(REGISTRY_HEADERS, rows);
    this.cache = {
      users,
      expiresAt: Date.now() + 15_000
    };
    return users;
  }

  async findByTelegramUserId(telegramUserId) {
    const users = await this.getAllUsers();
    return users.find((user) => String(user.telegram_user_id) === String(telegramUserId)) || null;
  }

  async findByAppUserId(appUserId) {
    const users = await this.getAllUsers();
    return users.find((user) => user.app_user_id === appUserId) || null;
  }

  async findByWebLoginEmail(email) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return null;
    }

    const users = await this.getAllUsers();
    return users.find((user) => String(user.web_login_email || "").trim().toLowerCase() === normalizedEmail) || null;
  }

  async appendUser(user) {
    await this.ensureRegistrySheet();
    const row = REGISTRY_HEADERS.map((header) => user[header] ?? "");
    await sheetsClient.appendValues(this.spreadsheetId, `${SHEET_TABS.REGISTRY}!A:P`, [row]);
    this.cache = {
      users: null,
      expiresAt: 0
    };
    return user;
  }

  async replaceAllUsers(users) {
    await this.ensureRegistrySheet();
    const values = [REGISTRY_HEADERS, ...users.map((user) => REGISTRY_HEADERS.map((header) => user[header] ?? ""))];
    await sheetsClient.updateValues(this.spreadsheetId, `${SHEET_TABS.REGISTRY}!A1:P${values.length}`, values);
    this.cache = {
      users: null,
      expiresAt: 0
    };
    return users;
  }
}

module.exports = new RegistrySheetService();
