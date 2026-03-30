const { createId } = require("../../utils/ids");
const { nowIso } = require("../../utils/date");
const userRegistryService = require("../users/userRegistry.service");
const userSheetService = require("../sheets/userSheet.service");
const budgetStateService = require("../budgets/budgetState.service");

class ResyncService {
  async resyncMonth(appUserId, monthKey) {
    const user = await userRegistryService.getRequiredConnectedUser(appUserId);
    const startedAt = nowIso();
    const rows = await userSheetService.getTransactionsByMonth(user.user_sheet_id, monthKey, { forceRefresh: true });
    const budget = await budgetStateService.getBudgetState(appUserId, monthKey, { forceRefresh: true });
    const completedAt = nowIso();

    await userSheetService.appendSyncAudit(user.user_sheet_id, {
      sync_id: createId("sync"),
      trigger_type: "manual",
      month_key: monthKey,
      status: "success",
      rows_scanned: String(rows.length),
      issues_found: "0",
      started_at: startedAt,
      completed_at: completedAt
    });

    return {
      month: monthKey,
      rowsScanned: rows.length,
      budgetRecomputed: Boolean(budget),
      completedAt
    };
  }
}

module.exports = new ResyncService();
