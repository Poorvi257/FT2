const BaseSheetService = require("./baseSheet.service");
const sheetsClient = require("./sheetsClient.service");
const {
  MONTH_TAB_HEADERS,
  CATEGORY_HEADERS,
  SETUP_HEADERS,
  BUDGET_CONFIG_HEADERS,
  SYNC_AUDIT_HEADERS,
  SHEET_TABS
} = require("../../config/constants");

class UserSheetService extends BaseSheetService {
  constructor() {
    super();
    this.cache = new Map();
  }

  #cacheKey(spreadsheetId, scope) {
    return `${spreadsheetId}:${scope}`;
  }

  #readCache(spreadsheetId, scope) {
    const key = this.#cacheKey(spreadsheetId, scope);
    const entry = this.cache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.value;
    }
    return null;
  }

  #writeCache(spreadsheetId, scope, value) {
    this.cache.set(this.#cacheKey(spreadsheetId, scope), {
      value,
      expiresAt: Date.now() + 15_000
    });
  }

  #invalidate(spreadsheetId, scopePrefix = "") {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${spreadsheetId}:${scopePrefix}`)) {
        this.cache.delete(key);
      }
    }
  }

  async ensureMonthTab(spreadsheetId, monthKey) {
    const spreadsheet = await sheetsClient.getSpreadsheet(spreadsheetId);
    const exists = spreadsheet.sheets.some((sheet) => sheet.properties.title === monthKey);

    if (!exists) {
      await sheetsClient.batchUpdate(spreadsheetId, [{
        addSheet: { properties: { title: monthKey } }
      }]);
      await sheetsClient.updateValues(spreadsheetId, `${monthKey}!A1:R1`, [MONTH_TAB_HEADERS]);
    }
  }

  async getSetup(spreadsheetId) {
    const cached = this.#readCache(spreadsheetId, "setup");
    if (cached) return cached;
    const rows = await sheetsClient.getValues(spreadsheetId, `${SHEET_TABS.SETUP}!A2:J`);
    const setup = this.mapRows(SETUP_HEADERS, rows)[0] || null;
    this.#writeCache(spreadsheetId, "setup", setup);
    return setup;
  }

  async upsertSetup(spreadsheetId, setup) {
    await sheetsClient.updateValues(
      spreadsheetId,
      `${SHEET_TABS.SETUP}!A1:J2`,
      [SETUP_HEADERS, SETUP_HEADERS.map((header) => setup[header] ?? "")]
    );
    this.#invalidate(spreadsheetId, "setup");
  }

  async getCategories(spreadsheetId) {
    const cached = this.#readCache(spreadsheetId, "categories");
    if (cached) return cached;
    const rows = await sheetsClient.getValues(spreadsheetId, `${SHEET_TABS.CATEGORIES}!A2:G`);
    const categories = this.mapRows(CATEGORY_HEADERS, rows);
    this.#writeCache(spreadsheetId, "categories", categories);
    return categories;
  }

  async appendCategory(spreadsheetId, category) {
    await sheetsClient.appendValues(spreadsheetId, `${SHEET_TABS.CATEGORIES}!A:G`, [
      CATEGORY_HEADERS.map((header) => category[header] ?? "")
    ]);
    this.#invalidate(spreadsheetId, "categories");
  }

  async appendTransaction(spreadsheetId, monthKey, transaction) {
    await this.ensureMonthTab(spreadsheetId, monthKey);
    await sheetsClient.appendValues(spreadsheetId, `${monthKey}!A:R`, [
      MONTH_TAB_HEADERS.map((header) => transaction[header] ?? "")
    ]);
    this.#invalidate(spreadsheetId, monthKey);
  }

  async getTransactionsByMonth(spreadsheetId, monthKey, options = {}) {
    const { forceRefresh = false } = options;
    const cached = forceRefresh ? null : this.#readCache(spreadsheetId, monthKey);
    if (cached) return cached;
    await this.ensureMonthTab(spreadsheetId, monthKey);
    const rows = await sheetsClient.getValues(spreadsheetId, `${monthKey}!A2:R`);
    const transactions = this.mapRows(MONTH_TAB_HEADERS, rows).filter((row) => row.txn_id);
    this.#writeCache(spreadsheetId, monthKey, transactions);
    return transactions;
  }

  async replaceTransactionsForMonth(spreadsheetId, monthKey, transactions) {
    await this.ensureMonthTab(spreadsheetId, monthKey);
    const values = [MONTH_TAB_HEADERS, ...this.rowsFromObjects(MONTH_TAB_HEADERS, transactions)];
    await sheetsClient.clearValues(spreadsheetId, `${monthKey}!A:R`);
    await sheetsClient.updateValues(spreadsheetId, `${monthKey}!A1:R${values.length}`, values);
    this.#invalidate(spreadsheetId, monthKey);
  }

  async upsertBudgetConfig(spreadsheetId, budgets) {
    const values = [BUDGET_CONFIG_HEADERS, ...this.rowsFromObjects(BUDGET_CONFIG_HEADERS, budgets)];
    await sheetsClient.clearValues(spreadsheetId, `${SHEET_TABS.BUDGET_CONFIG}!A:J`);
    await sheetsClient.updateValues(spreadsheetId, `${SHEET_TABS.BUDGET_CONFIG}!A1:J${values.length}`, values);
    this.#invalidate(spreadsheetId, "budget_config");
  }

  async getBudgetConfigs(spreadsheetId) {
    const cached = this.#readCache(spreadsheetId, "budget_config");
    if (cached) return cached;
    const rows = await sheetsClient.getValues(spreadsheetId, `${SHEET_TABS.BUDGET_CONFIG}!A2:J`);
    const budgets = this.mapRows(BUDGET_CONFIG_HEADERS, rows).filter((row) => row.budget_id);
    this.#writeCache(spreadsheetId, "budget_config", budgets);
    return budgets;
  }

  async appendSyncAudit(spreadsheetId, audit) {
    await sheetsClient.appendValues(spreadsheetId, `${SHEET_TABS.SYNC_AUDIT}!A:H`, [
      SYNC_AUDIT_HEADERS.map((header) => audit[header] ?? "")
    ]);
  }
}

module.exports = new UserSheetService();
