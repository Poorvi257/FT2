const { TRANSACTION_TYPES } = require("../../config/constants");
const { sum } = require("../../utils/math");
const { getWeekBucket } = require("../../utils/month");
const userRegistryService = require("../users/userRegistry.service");
const userSheetService = require("../sheets/userSheet.service");

class MonthlyReportService {
  async getDashboard(appUserId, monthKey) {
    const user = await userRegistryService.getRequiredConnectedUser(appUserId);
    const rows = await userSheetService.getTransactionsByMonth(user.user_sheet_id, monthKey);
    const transactions = rows.filter((row) => row.deleted_flag !== "true");

    const totalSpent = sum(transactions.map((row) => row.amount));
    const fixedTotal = sum(transactions.filter((row) => row.transaction_type === TRANSACTION_TYPES.FIXED).map((row) => row.amount));
    const variableTotal = sum(transactions.filter((row) => row.transaction_type === TRANSACTION_TYPES.VARIABLE).map((row) => row.amount));

    const categorySplit = Object.values(transactions.reduce((acc, row) => {
      acc[row.category_name] = acc[row.category_name] || { category: row.category_name, amount: 0 };
      acc[row.category_name].amount += Number(row.amount);
      return acc;
    }, {})).map((entry) => ({ ...entry, amount: sum([entry.amount]) }));

    const dailySpend = Object.values(transactions
      .filter((row) => row.transaction_type === TRANSACTION_TYPES.VARIABLE)
      .reduce((acc, row) => {
        acc[row.entry_date] = acc[row.entry_date] || { date: row.entry_date, amount: 0 };
        acc[row.entry_date].amount += Number(row.amount);
        return acc;
      }, {})).sort((a, b) => a.date.localeCompare(b.date)).map((entry) => ({
      ...entry,
      amount: sum([entry.amount])
    }));

    const weeklySummary = Object.values(transactions.reduce((acc, row) => {
      const bucket = getWeekBucket(row.entry_date);
      acc[bucket] = acc[bucket] || { week: bucket, amount: 0 };
      acc[bucket].amount += Number(row.amount);
      return acc;
    }, {})).map((entry) => ({ ...entry, amount: sum([entry.amount]) }));

    const last10 = transactions
      .sort((a, b) => `${b.entry_date}${b.entry_ts_local}`.localeCompare(`${a.entry_date}${a.entry_ts_local}`))
      .slice(0, 10);

    return {
      month: monthKey,
      totals: {
        totalSpent,
        fixedTotal,
        variableTotal
      },
      categorySplit,
      dailySpend,
      weeklySummary,
      last10,
      transactionCount: transactions.length
    };
  }

  async getHistory(appUserId, fromMonth, toMonth) {
    const months = this.#buildMonthRange(fromMonth, toMonth);
    const reports = [];

    for (const month of months) {
      reports.push(await this.getDashboard(appUserId, month));
    }

    return {
      from: fromMonth,
      to: toMonth,
      months: reports
    };
  }

  #buildMonthRange(fromMonth, toMonth) {
    const [fromYear, fromMonthNumber] = fromMonth.split("-").map(Number);
    const [toYear, toMonthNumber] = toMonth.split("-").map(Number);
    const cursor = new Date(Date.UTC(fromYear, fromMonthNumber - 1, 1));
    const end = new Date(Date.UTC(toYear, toMonthNumber - 1, 1));
    const months = [];

    while (cursor <= end) {
      months.push(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`);
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }

    return months;
  }
}

module.exports = new MonthlyReportService();
