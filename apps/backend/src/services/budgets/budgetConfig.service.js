const { createId } = require("../../utils/ids");
const { nowIso, currentMonthKey, formatLocalDate } = require("../../utils/date");
const { AppError } = require("../../utils/errors");
const userRegistryService = require("../users/userRegistry.service");
const userSheetService = require("../sheets/userSheet.service");

function getLastDayOfMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${monthKey}-${String(new Date(Date.UTC(year, month, 0)).getUTCDate()).padStart(2, "0")}`;
}

function assertRangeMatchesMonth(monthKey, startDate, endDate) {
  if (startDate && !startDate.startsWith(monthKey)) {
    throw new AppError(400, "Budget start date must stay within the selected month");
  }

  if (endDate && !endDate.startsWith(monthKey)) {
    throw new AppError(400, "Budget end date must stay within the selected month");
  }

  if (startDate && endDate && startDate > endDate) {
    throw new AppError(400, "Budget end date must be on or after the start date");
  }
}

class BudgetConfigService {
  async upsertBudget(appUserId, input) {
    const user = await userRegistryService.getRequiredConnectedUser(appUserId);
    const existing = await userSheetService.getBudgetConfigs(user.user_sheet_id);
    const timestamp = nowIso();
    const current = existing.find((row) => row.month_key === input.monthKey);
    const isCurrentMonth = input.monthKey === currentMonthKey(user.timezone);
    const todayLocal = formatLocalDate(new Date(), user.timezone);
    const legacyDefaultStartDate = `${input.monthKey}-01`;
    const shouldResetLegacyCurrentMonthStartDate = Boolean(
      current
      && isCurrentMonth
      && current.budget_start_date === legacyDefaultStartDate
      && current.created_at
      && !String(current.created_at).startsWith(legacyDefaultStartDate)
    );
    const defaultStartDate = shouldResetLegacyCurrentMonthStartDate
      ? todayLocal
      : (current?.budget_start_date || (isCurrentMonth ? todayLocal : legacyDefaultStartDate));
    const startDate = input.startDate || defaultStartDate;
    const endDate = input.endDate || current?.budget_end_date || getLastDayOfMonth(input.monthKey);

    assertRangeMatchesMonth(input.monthKey, startDate, endDate);

    const nextRow = {
      budget_id: current?.budget_id || createId("bud"),
      month_key: input.monthKey,
      principal_amount: String(input.principalAmount),
      carry_forward_mode: input.carryForwardMode,
      opening_piggy_bank: String(input.openingPiggyBank),
      budget_start_date: startDate,
      budget_end_date: endDate,
      is_locked: String(input.isLocked),
      created_at: current?.created_at || timestamp,
      updated_at: timestamp
    };

    const updated = [...existing.filter((row) => row.month_key !== input.monthKey), nextRow]
      .sort((a, b) => a.month_key.localeCompare(b.month_key));

    await userSheetService.upsertBudgetConfig(user.user_sheet_id, updated);
    return nextRow;
  }

  async getBudgetByMonth(appUserId, monthKey) {
    const user = await userRegistryService.getRequiredConnectedUser(appUserId);
    const budgets = await userSheetService.getBudgetConfigs(user.user_sheet_id);
    return budgets.find((row) => row.month_key === monthKey) || null;
  }

  async deleteBudget(appUserId, budgetId) {
    const user = await userRegistryService.getRequiredConnectedUser(appUserId);
    const budgets = await userSheetService.getBudgetConfigs(user.user_sheet_id);
    const budget = budgets.find((row) => row.budget_id === budgetId);

    if (!budget) {
      throw new AppError(404, "Budget not found");
    }

    const remainingBudgets = budgets.filter((row) => row.budget_id !== budgetId);
    await userSheetService.upsertBudgetConfig(user.user_sheet_id, remainingBudgets);

    return {
      budgetId: budget.budget_id,
      monthKey: budget.month_key
    };
  }

  async listBudgets(appUserId) {
    const user = await userRegistryService.getRequiredConnectedUser(appUserId);
    return userSheetService.getBudgetConfigs(user.user_sheet_id);
  }
}

module.exports = new BudgetConfigService();
