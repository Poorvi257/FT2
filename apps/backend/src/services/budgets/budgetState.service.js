const userRegistryService = require("../users/userRegistry.service");
const userSheetService = require("../sheets/userSheet.service");
const budgetConfigService = require("./budgetConfig.service");
const budgetEngineService = require("./budgetEngine.service");
const { formatLocalDate } = require("../../utils/date");

class BudgetStateService {
  async getBudgetState(appUserId, monthKey, options = {}) {
    const user = await userRegistryService.getRequiredConnectedUser(appUserId);
    const budget = await budgetConfigService.getBudgetByMonth(appUserId, monthKey);
    if (!budget) {
      return null;
    }

    const transactions = await userSheetService.getTransactionsByMonth(user.user_sheet_id, monthKey, options);

    return budgetEngineService.calculateBudgetState({
      monthKey,
      principalAmount: Number(budget.principal_amount),
      openingPiggyBank: Number(budget.opening_piggy_bank),
      transactions,
      budgetStartDate: budget.budget_start_date,
      budgetEndDate: budget.budget_end_date,
      asOfDate: formatLocalDate(new Date(), user.timezone)
    });
  }
}

module.exports = new BudgetStateService();
