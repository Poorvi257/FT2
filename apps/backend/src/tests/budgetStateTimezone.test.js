const test = require("node:test");
const assert = require("node:assert/strict");
const budgetStateService = require("../services/budgets/budgetState.service");
const userRegistryService = require("../services/users/userRegistry.service");
const budgetConfigService = require("../services/budgets/budgetConfig.service");
const userSheetService = require("../services/sheets/userSheet.service");

test("budgetStateService uses the user's timezone to decide when a day has closed for piggy-bank transfers", async (context) => {
  const originalDate = global.Date;
  const originalGetRequiredConnectedUser = userRegistryService.getRequiredConnectedUser;
  const originalGetBudgetByMonth = budgetConfigService.getBudgetByMonth;
  const originalGetTransactionsByMonth = userSheetService.getTransactionsByMonth;

  context.after(() => {
    global.Date = originalDate;
    userRegistryService.getRequiredConnectedUser = originalGetRequiredConnectedUser;
    budgetConfigService.getBudgetByMonth = originalGetBudgetByMonth;
    userSheetService.getTransactionsByMonth = originalGetTransactionsByMonth;
  });

  const fixedNow = new originalDate("2026-03-29T23:30:00.000Z");
  class MockDate extends originalDate {
    constructor(value) {
      super(value ?? fixedNow);
    }

    static now() {
      return fixedNow.getTime();
    }
  }

  global.Date = MockDate;

  budgetConfigService.getBudgetByMonth = async () => ({
    principal_amount: "900",
    opening_piggy_bank: "0",
    budget_start_date: "2026-03-29",
    budget_end_date: "2026-03-31"
  });

  userSheetService.getTransactionsByMonth = async () => ([
    { entry_date: "2026-03-29", amount: 120, transaction_type: "variable", deleted_flag: "false" }
  ]);

  userRegistryService.getRequiredConnectedUser = async () => ({
    user_sheet_id: "sheet_1",
    timezone: "America/Los_Angeles"
  });

  const losAngeles = await budgetStateService.getBudgetState("usr_1", "2026-03");

  userRegistryService.getRequiredConnectedUser = async () => ({
    user_sheet_id: "sheet_1",
    timezone: "Asia/Kolkata"
  });

  const kolkata = await budgetStateService.getBudgetState("usr_1", "2026-03");

  assert.equal(losAngeles.asOfDate, "2026-03-29");
  assert.equal(losAngeles.budgetState.piggyBank, 0);
  assert.equal(kolkata.asOfDate, "2026-03-30");
  assert.equal(kolkata.budgetState.piggyBank, 180);
  assert.equal(kolkata.budgetState.dailySeries[0].dayType, "closed");
  assert.equal(losAngeles.budgetState.dailySeries[0].dayType, "active");
});
