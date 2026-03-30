const { currentMonthKey, formatLocalDate, formatLocalDateTime, nowIso } = require("../../utils/date");
const { createId } = require("../../utils/ids");
const userRegistryService = require("../users/userRegistry.service");
const userSheetService = require("../sheets/userSheet.service");

class TransactionWriteService {
  async createForUser(appUserId, payload) {
    const user = await userRegistryService.getRequiredConnectedUser(appUserId);
    const now = new Date();
    const timestamp = nowIso();
    const timezone = user.timezone;
    const monthKey = payload.entryDate?.slice(0, 7) || currentMonthKey(timezone);

    const transaction = {
      txn_id: createId("txn"),
      entry_date: payload.entryDate || formatLocalDate(now, timezone),
      entry_ts_utc: now.toISOString(),
      entry_ts_local: formatLocalDateTime(now, timezone),
      month_key: monthKey,
      item: payload.item,
      amount: Number(payload.amount),
      category_id: payload.categoryId,
      category_name: payload.categoryName,
      transaction_type: payload.transactionType,
      source: payload.source || "web",
      telegram_message_id: payload.telegramMessageId || "",
      telegram_raw_text: payload.telegramRawText || "",
      notes: payload.notes || "",
      created_at: timestamp,
      updated_at: timestamp,
      deleted_flag: "false",
      schema_version: "1"
    };

    await userSheetService.appendTransaction(user.user_sheet_id, monthKey, transaction);
    return transaction;
  }
}

module.exports = new TransactionWriteService();
