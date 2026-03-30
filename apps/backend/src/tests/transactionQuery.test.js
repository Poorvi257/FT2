const test = require("node:test");
const assert = require("node:assert/strict");
const transactionQueryService = require("../services/transactions/transactionQuery.service");
const userRegistryService = require("../services/users/userRegistry.service");
const userSheetService = require("../services/sheets/userSheet.service");

test("listByMonth paginates consistently without duplicating records across pages", async (context) => {
  const originalGetRequiredConnectedUser = userRegistryService.getRequiredConnectedUser;
  const originalGetTransactionsByMonth = userSheetService.getTransactionsByMonth;

  context.after(() => {
    userRegistryService.getRequiredConnectedUser = originalGetRequiredConnectedUser;
    userSheetService.getTransactionsByMonth = originalGetTransactionsByMonth;
  });

  userRegistryService.getRequiredConnectedUser = async () => ({
    user_sheet_id: "sheet_1"
  });

  userSheetService.getTransactionsByMonth = async () => ([
    { txn_id: "txn_01", entry_date: "2026-03-29", entry_ts_local: "2026-03-29 09:00:00", item: "One", deleted_flag: "false" },
    { txn_id: "txn_02", entry_date: "2026-03-29", entry_ts_local: "2026-03-29 09:00:00", item: "Two", deleted_flag: "false" },
    { txn_id: "txn_03", entry_date: "2026-03-29", entry_ts_local: "2026-03-29 09:00:00", item: "Three", deleted_flag: "false" },
    { txn_id: "txn_04", entry_date: "2026-03-29", entry_ts_local: "2026-03-29 09:00:00", item: "Four", deleted_flag: "false" },
    { txn_id: "txn_05", entry_date: "2026-03-29", entry_ts_local: "2026-03-29 09:00:00", item: "Five", deleted_flag: "false" },
    { txn_id: "txn_06", entry_date: "2026-03-29", entry_ts_local: "2026-03-29 09:00:00", item: "Six", deleted_flag: "false" },
    { txn_id: "txn_07", entry_date: "2026-03-29", entry_ts_local: "2026-03-29 09:00:00", item: "Seven", deleted_flag: "false" },
    { txn_id: "txn_08", entry_date: "2026-03-29", entry_ts_local: "2026-03-29 09:00:00", item: "Eight", deleted_flag: "false" },
    { txn_id: "txn_09", entry_date: "2026-03-29", entry_ts_local: "2026-03-29 09:00:00", item: "Nine", deleted_flag: "false" },
    { txn_id: "txn_10", entry_date: "2026-03-29", entry_ts_local: "2026-03-29 09:00:00", item: "Ten", deleted_flag: "false" },
    { txn_id: "txn_11", entry_date: "2026-03-29", entry_ts_local: "2026-03-29 09:00:00", item: "Eleven", deleted_flag: "false" }
  ]);

  const firstPage = await transactionQueryService.listByMonth("app_1", {
    month: "2026-03",
    page: 1,
    pageSize: 10
  });

  const secondPage = await transactionQueryService.listByMonth("app_1", {
    month: "2026-03",
    page: 2,
    pageSize: 10
  });

  assert.equal(firstPage.items.length, 10);
  assert.equal(secondPage.items.length, 1);
  assert.equal(firstPage.pagination.total, 11);
  assert.equal(secondPage.pagination.total, 11);

  const firstPageIds = firstPage.items.map((item) => item.txn_id);
  const secondPageIds = secondPage.items.map((item) => item.txn_id);

  assert.equal(new Set(firstPageIds).size, 10);
  assert.equal(secondPageIds[0], "txn_01");
  assert.equal(firstPageIds.includes(secondPageIds[0]), false);
});

test("listByMonth returns the same first page after navigating forward and back", async (context) => {
  const originalGetRequiredConnectedUser = userRegistryService.getRequiredConnectedUser;
  const originalGetTransactionsByMonth = userSheetService.getTransactionsByMonth;

  context.after(() => {
    userRegistryService.getRequiredConnectedUser = originalGetRequiredConnectedUser;
    userSheetService.getTransactionsByMonth = originalGetTransactionsByMonth;
  });

  userRegistryService.getRequiredConnectedUser = async () => ({
    user_sheet_id: "sheet_1"
  });

  userSheetService.getTransactionsByMonth = async () => Array.from({ length: 11 }, (_, index) => ({
    txn_id: `txn_${String(index + 1).padStart(2, "0")}`,
    entry_date: "2026-03-29",
    entry_ts_utc: `2026-03-29T09:${String(index).padStart(2, "0")}:00.000Z`,
    entry_ts_local: `2026-03-29 ${String(14 + Math.floor(index / 60)).padStart(2, "0")}:${String(index % 60).padStart(2, "0")}:00`,
    created_at: `2026-03-29T09:${String(index).padStart(2, "0")}:00.000Z`,
    item: `Item ${index + 1}`,
    deleted_flag: "FALSE"
  }));

  const firstLoad = await transactionQueryService.listByMonth("app_1", {
    month: "2026-03",
    page: 1,
    pageSize: 10
  });

  await transactionQueryService.listByMonth("app_1", {
    month: "2026-03",
    page: 2,
    pageSize: 10
  });

  const firstLoadAgain = await transactionQueryService.listByMonth("app_1", {
    month: "2026-03",
    page: 1,
    pageSize: 10
  });

  assert.deepEqual(
    firstLoadAgain.items.map((item) => item.txn_id),
    firstLoad.items.map((item) => item.txn_id)
  );
  assert.equal(firstLoadAgain.pagination.page, 1);
  assert.equal(firstLoadAgain.pagination.pageSize, 10);
  assert.equal(firstLoadAgain.pagination.total, 11);
});

test("listByMonth clamps oversized page requests to the final page size", async (context) => {
  const originalGetRequiredConnectedUser = userRegistryService.getRequiredConnectedUser;
  const originalGetTransactionsByMonth = userSheetService.getTransactionsByMonth;

  context.after(() => {
    userRegistryService.getRequiredConnectedUser = originalGetRequiredConnectedUser;
    userSheetService.getTransactionsByMonth = originalGetTransactionsByMonth;
  });

  userRegistryService.getRequiredConnectedUser = async () => ({
    user_sheet_id: "sheet_1"
  });

  userSheetService.getTransactionsByMonth = async () => Array.from({ length: 11 }, (_, index) => ({
    txn_id: `txn_${String(index + 1).padStart(2, "0")}`,
    entry_date: "2026-03-29",
    entry_ts_utc: `2026-03-29T09:${String(index).padStart(2, "0")}:00.000Z`,
    created_at: `2026-03-29T09:${String(index).padStart(2, "0")}:00.000Z`,
    item: `Item ${index + 1}`,
    deleted_flag: "FALSE"
  }));

  const result = await transactionQueryService.listByMonth("app_1", {
    month: "2026-03",
    page: 99,
    pageSize: 10
  });

  assert.equal(result.pagination.page, 2);
  assert.equal(result.pagination.pageSize, 10);
  assert.equal(result.pagination.total, 11);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].txn_id, "txn_01");
});
