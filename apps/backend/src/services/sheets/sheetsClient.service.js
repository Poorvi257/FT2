const { google } = require("googleapis");
const env = require("../../config/env");

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
    const response = await this.sheets.spreadsheets.values.get({ spreadsheetId, range });
    return response.data.values || [];
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
    const response = await this.sheets.spreadsheets.get({ spreadsheetId });
    return response.data;
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
