const userRegistryService = require("../users/userRegistry.service");
const userSheetService = require("../sheets/userSheet.service");

function normalizeDeletedFlag(value) {
  return String(value || "").trim().toLowerCase() === "true";
}

function getSortTimestamp(row) {
  const utcTimestamp = Date.parse(row.entry_ts_utc || "");
  if (!Number.isNaN(utcTimestamp)) {
    return utcTimestamp;
  }

  const createdTimestamp = Date.parse(row.created_at || "");
  if (!Number.isNaN(createdTimestamp)) {
    return createdTimestamp;
  }

  const dateTimestamp = Date.parse(`${row.entry_date || ""}T00:00:00Z`);
  if (!Number.isNaN(dateTimestamp)) {
    return dateTimestamp;
  }

  return 0;
}

class TransactionQueryService {
  async listByMonth(appUserId, query) {
    const user = await userRegistryService.getRequiredConnectedUser(appUserId);
    const allRows = await userSheetService.getTransactionsByMonth(user.user_sheet_id, query.month);
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;

    const filtered = allRows.filter((row) => {
      if (normalizeDeletedFlag(row.deleted_flag)) return false;
      if (query.category && row.category_name !== query.category) return false;
      if (query.type && row.transaction_type !== query.type) return false;
      if (query.search && !row.item.toLowerCase().includes(query.search.toLowerCase())) return false;
      return true;
    });

    const sorted = filtered.sort((a, b) => {
      const timestampDiff = getSortTimestamp(b) - getSortTimestamp(a);
      if (timestampDiff !== 0) {
        return timestampDiff;
      }

      const createdDiff = (b.created_at || "").localeCompare(a.created_at || "");
      if (createdDiff !== 0) {
        return createdDiff;
      }

      return (b.txn_id || "").localeCompare(a.txn_id || "");
    });
    const total = sorted.length;
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    const items = sorted.slice(start, start + pageSize);

    return {
      items,
      pagination: {
        page: safePage,
        pageSize,
        total
      }
    };
  }

  async getLast10(appUserId, month) {
    const result = await this.listByMonth(appUserId, { month, page: 1, pageSize: 10 });
    return result.items;
  }
}

module.exports = new TransactionQueryService();
