const test = require("node:test");
const assert = require("node:assert/strict");
const resyncService = require("../services/sync/resync.service");
const userRegistryService = require("../services/users/userRegistry.service");
const userSheetService = require("../services/sheets/userSheet.service");
const budgetStateService = require("../services/budgets/budgetState.service");

test("resync forces a fresh month read from sheets instead of using cached rows", async (context) => {
  const originalGetRequiredConnectedUser = userRegistryService.getRequiredConnectedUser;
  const originalGetTransactionsByMonth = userSheetService.getTransactionsByMonth;
  const originalGetBudgetState = budgetStateService.getBudgetState;
  const originalAppendSyncAudit = userSheetService.appendSyncAudit;

  context.after(() => {
    userRegistryService.getRequiredConnectedUser = originalGetRequiredConnectedUser;
    userSheetService.getTransactionsByMonth = originalGetTransactionsByMonth;
    budgetStateService.getBudgetState = originalGetBudgetState;
    userSheetService.appendSyncAudit = originalAppendSyncAudit;
  });

  let readOptions = null;
  let budgetOptions = null;
  let syncAudit = null;

  userRegistryService.getRequiredConnectedUser = async () => ({
    user_sheet_id: "sheet_1"
  });

  userSheetService.getTransactionsByMonth = async (_spreadsheetId, _monthKey, options) => {
    readOptions = options;
    return [
      { txn_id: "txn_1" },
      { txn_id: "txn_2" }
    ];
  };

  budgetStateService.getBudgetState = async (_appUserId, _monthKey, options) => {
    budgetOptions = options;
    return { budgetState: { status: "active" } };
  };

  userSheetService.appendSyncAudit = async (_spreadsheetId, audit) => {
    syncAudit = audit;
  };

  const result = await resyncService.resyncMonth("app_1", "2026-03");

  assert.deepEqual(readOptions, { forceRefresh: true });
  assert.deepEqual(budgetOptions, { forceRefresh: true });
  assert.equal(syncAudit.rows_scanned, "2");
  assert.equal(result.rowsScanned, 2);
  assert.equal(result.budgetRecomputed, true);
});
