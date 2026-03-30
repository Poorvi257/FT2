const { google } = require("googleapis");
const env = require("../../config/env");
const logger = require("../../config/logger");
const { AppError } = require("../../utils/errors");

function formatGoogleError(error) {
  const status = error?.code || error?.response?.status || 500;
  const providerMessage =
    error?.response?.data?.error?.message ||
    error?.response?.data?.error_description ||
    error?.message ||
    "Google Sheets request failed";

  return {
    status,
    providerMessage
  };
}

class SheetsClientService {
  constructor() {
    this.auth = new google.auth.JWT({
      email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: env.GOOGLE_PRIVATE_KEY,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
      ]
    });

    this.sheets = google.sheets({ version: "v4", auth: this.auth });
    this.drive = google.drive({ version: "v3", auth: this.auth });
  }

  async getValues(spreadsheetId, range) {
    try {
      const response = await this.sheets.spreadsheets.values.get({ spreadsheetId, range });
      return response.data.values || [];
    } catch (error) {
      const { status, providerMessage } = formatGoogleError(error);
      logger.error({
        err: error,
        spreadsheetId,
        range,
        serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL
      }, "Google Sheets values.get failed");
      throw new AppError(status, providerMessage, {
        spreadsheetId,
        range,
        serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL
      });
    }
  }

  async appendValues(spreadsheetId, range, values) {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values }
    });
  }

  async updateValues(spreadsheetId, range, values) {
    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values }
    });
  }

  async clearValues(spreadsheetId, range) {
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId,
      range
    });
  }

  async batchUpdate(spreadsheetId, requests) {
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
  }

  async getSpreadsheet(spreadsheetId) {
    try {
      const response = await this.sheets.spreadsheets.get({ spreadsheetId });
      return response.data;
    } catch (error) {
      const { status, providerMessage } = formatGoogleError(error);
      logger.error({
        err: error,
        spreadsheetId,
        serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL
      }, "Google Sheets spreadsheets.get failed");
      throw new AppError(status, providerMessage, {
        spreadsheetId,
        serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL
      });
    }
  }

  async createSpreadsheet(title) {
    const response = await this.sheets.spreadsheets.create({
      requestBody: {
        properties: { title }
      }
    });
    return response.data;
  }
}

module.exports = new SheetsClientService();
