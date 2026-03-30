const test = require("node:test");
const assert = require("node:assert/strict");
const budgetConfigService = require("../services/budgets/budgetConfig.service");
const userRegistryService = require("../services/users/userRegistry.service");
const userSheetService = require("../services/sheets/userSheet.service");

test("deleteBudget removes only the budget config and leaves transactions untouched", async (context) => {
  const originalGetRequiredConnectedUser = userRegistryService.getRequiredConnectedUser;
  const originalGetBudgetConfigs = userSheetService.getBudgetConfigs;
  const originalUpsertBudgetConfig = userSheetService.upsertBudgetConfig;

  context.after(() => {
    userRegistryService.getRequiredConnectedUser = originalGetRequiredConnectedUser;
    userSheetService.getBudgetConfigs = originalGetBudgetConfigs;
    userSheetService.upsertBudgetConfig = originalUpsertBudgetConfig;
  });

  let savedBudgets = null;
  let transactionsRead = false;
  let transactionsRewritten = false;

  userRegistryService.getRequiredConnectedUser = async () => ({
    user_sheet_id: "sheet_1"
  });

  userSheetService.getBudgetConfigs = async () => ([
    {
      budget_id: "bud_1",
      month_key: "2026-03",
      budget_start_date: "2026-03-10",
      budget_end_date: "2026-03-20"
    },
    {
      budget_id: "bud_2",
      month_key: "2026-04",
      budget_start_date: "2026-04-01",
      budget_end_date: "2026-04-30"
    }
  ]);

  userSheetService.upsertBudgetConfig = async (_spreadsheetId, budgets) => {
    savedBudgets = budgets;
  };

  userSheetService.getTransactionsByMonth = async () => {
    transactionsRead = true;
    return [];
  };

  userSheetService.replaceTransactionsForMonth = async () => {
    transactionsRewritten = true;
  };

  const result = await budgetConfigService.deleteBudget("app_1", "bud_1");

  assert.deepEqual(savedBudgets, [{
    budget_id: "bud_2",
    month_key: "2026-04",
    budget_start_date: "2026-04-01",
      budget_end_date: "2026-04-30"
  }]);
  assert.equal(transactionsRead, false);
  assert.equal(transactionsRewritten, false);
  assert.deepEqual(result, {
    budgetId: "bud_1",
    monthKey: "2026-03"
  });
});
