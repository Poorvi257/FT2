const sheetsClient = require("./sheetsClient.service");
const {
  SHEET_TABS,
  SETUP_HEADERS,
  CATEGORY_HEADERS,
  BUDGET_CONFIG_HEADERS,
  SYNC_AUDIT_HEADERS
} = require("../../config/constants");

class SheetTemplateService {
  async createUserSpreadsheet(title) {
    const spreadsheet = await sheetsClient.createSpreadsheet(title);
    const spreadsheetId = spreadsheet.spreadsheetId;

    await this.initializeUserSpreadsheet(spreadsheetId);

    return spreadsheet;
  }

  async initializeUserSpreadsheet(spreadsheetId) {
    await this.ensureTab(spreadsheetId, SHEET_TABS.SETUP, SETUP_HEADERS);
    await this.ensureTab(spreadsheetId, SHEET_TABS.CATEGORIES, CATEGORY_HEADERS);
    await this.ensureTab(spreadsheetId, SHEET_TABS.BUDGET_CONFIG, BUDGET_CONFIG_HEADERS);
    await this.ensureTab(spreadsheetId, SHEET_TABS.SYNC_AUDIT, SYNC_AUDIT_HEADERS);
  }

  async ensureTab(spreadsheetId, tabName, headers) {
    const spreadsheet = await sheetsClient.getSpreadsheet(spreadsheetId);
    const exists = spreadsheet.sheets.some((sheet) => sheet.properties.title === tabName);

    if (!exists) {
      await sheetsClient.batchUpdate(spreadsheetId, [{
        addSheet: { properties: { title: tabName } }
      }]);
    }

    await sheetsClient.updateValues(
      spreadsheetId,
      `${tabName}!A1:${String.fromCharCode(64 + headers.length)}1`,
      [headers]
    );
  }
}

module.exports = new SheetTemplateService();
