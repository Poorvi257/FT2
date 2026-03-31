const test = require("node:test");
const assert = require("node:assert/strict");
const { updateSettingsController } = require("../controllers/settings.controller");
const { updateSettingsSchema } = require("../routes/settings.routes");
const settingsService = require("../services/settings/settings.service");
const userRegistryService = require("../services/users/userRegistry.service");
const userSheetService = require("../services/sheets/userSheet.service");
const { isValidCurrencyCode, isValidIanaTimezone, normalizeCurrency } = require("../utils/preferences");

test("settings validation accepts real IANA timezones and ISO currency codes", () => {
  assert.equal(isValidIanaTimezone("Asia/Kolkata"), true);
  assert.equal(isValidIanaTimezone("Mars/Olympus"), false);
  assert.equal(isValidCurrencyCode("USD"), true);
  assert.equal(isValidCurrencyCode("US"), false);
  assert.equal(isValidCurrencyCode("US1"), false);
  assert.equal(normalizeCurrency("inr"), "INR");
});

test("settings update schema rejects invalid timezone and currency values", () => {
  const result = updateSettingsSchema.safeParse({
    timezone: "Mars/Olympus",
    currency: "usd1"
  });

  assert.equal(result.success, false);
});

test("updateSettingsController returns normalized settings for an authenticated request", async (context) => {
  const originalUpdateSettings = settingsService.updateSettings;

  context.after(() => {
    settingsService.updateSettings = originalUpdateSettings;
  });

  settingsService.updateSettings = async (appUserId, input) => ({
    timezone: input.timezone,
    currency: input.currency,
    userSheetId: "",
    userSheetUrl: "",
    telegramLinked: false,
    appUserId
  });

  const parsedBody = updateSettingsSchema.parse({
    timezone: "America/New_York",
    currency: "usd"
  });
  const req = {
    auth: { appUserId: "usr_api" },
    body: parsedBody
  };
  let payload = null;
  const res = {
    json(value) {
      payload = value;
    }
  };

  await updateSettingsController(req, res);

  assert.equal(payload.settings.timezone, "America/New_York");
  assert.equal(payload.settings.currency, "USD");
});

test("updateSettings persists registry preferences and syncs linked sheet setup", async (context) => {
  const originalGetRequiredByAppUserId = userRegistryService.getRequiredByAppUserId;
  const originalUpdateUser = userRegistryService.updateUser;
  const originalGetSetup = userSheetService.getSetup;
  const originalUpsertSetup = userSheetService.upsertSetup;
  const originalReplaceTransactionsForMonth = userSheetService.replaceTransactionsForMonth;

  context.after(() => {
    userRegistryService.getRequiredByAppUserId = originalGetRequiredByAppUserId;
    userRegistryService.updateUser = originalUpdateUser;
    userSheetService.getSetup = originalGetSetup;
    userSheetService.upsertSetup = originalUpsertSetup;
    userSheetService.replaceTransactionsForMonth = originalReplaceTransactionsForMonth;
  });

  const user = {
    app_user_id: "usr_1",
    telegram_user_id: "tg_1",
    telegram_chat_id: "chat_1",
    telegram_username: "poorvi",
    web_login_email: "poorvi@example.com",
    user_sheet_id: "sheet_1",
    user_sheet_url: "https://docs.google.com/sheet/1",
    timezone: "Asia/Kolkata",
    currency: "INR",
    created_at: "2026-03-01T00:00:00.000Z"
  };

  let updatePatch = null;
  let syncedSetup = null;
  let getRequiredCalls = 0;
  let transactionsRewritten = false;

  userRegistryService.getRequiredByAppUserId = async () => {
    getRequiredCalls += 1;
    return {
      ...user,
      ...(getRequiredCalls > 1 ? { timezone: "America/New_York", currency: "USD" } : {})
    };
  };

  userRegistryService.updateUser = async (_appUserId, patch) => {
    updatePatch = patch;
    return {
      ...user,
      ...patch
    };
  };

  userSheetService.getSetup = async () => ({
    app_user_id: "usr_1",
    display_name: "Poorvi",
    timezone: "Asia/Kolkata",
    currency: "INR",
    telegram_user_id: "tg_1",
    telegram_chat_id: "chat_1",
    budgeting_enabled: "true",
    active_budget_id: "bud_1",
    created_at: "2026-03-01T00:00:00.000Z",
    updated_at: "2026-03-10T00:00:00.000Z"
  });

  userSheetService.upsertSetup = async (_spreadsheetId, setup) => {
    syncedSetup = setup;
  };

  userSheetService.replaceTransactionsForMonth = async () => {
    transactionsRewritten = true;
  };

  const result = await settingsService.updateSettings("usr_1", {
    timezone: "America/New_York",
    currency: "USD"
  });

  assert.equal(updatePatch.timezone, "America/New_York");
  assert.equal(updatePatch.currency, "USD");
  assert.equal(result.timezone, "America/New_York");
  assert.equal(result.currency, "USD");
  assert.equal(syncedSetup.timezone, "America/New_York");
  assert.equal(syncedSetup.currency, "USD");
  assert.equal(syncedSetup.active_budget_id, "bud_1");
  assert.equal(transactionsRewritten, false);
});

test("updateSettings skips sheet sync when no linked sheet exists", async (context) => {
  const originalGetRequiredByAppUserId = userRegistryService.getRequiredByAppUserId;
  const originalUpdateUser = userRegistryService.updateUser;
  const originalGetSetup = userSheetService.getSetup;
  const originalUpsertSetup = userSheetService.upsertSetup;

  context.after(() => {
    userRegistryService.getRequiredByAppUserId = originalGetRequiredByAppUserId;
    userRegistryService.updateUser = originalUpdateUser;
    userSheetService.getSetup = originalGetSetup;
    userSheetService.upsertSetup = originalUpsertSetup;
  });

  let getSetupCalled = false;
  let upsertSetupCalled = false;
  let getRequiredCalls = 0;

  userRegistryService.getRequiredByAppUserId = async () => {
    getRequiredCalls += 1;
    return {
      app_user_id: "usr_2",
      telegram_user_id: "",
      telegram_chat_id: "",
      telegram_username: "",
      web_login_email: "",
      user_sheet_id: "",
      user_sheet_url: "",
      timezone: getRequiredCalls > 1 ? "Europe/London" : "UTC",
      currency: getRequiredCalls > 1 ? "GBP" : "USD",
      created_at: "2026-03-01T00:00:00.000Z"
    };
  };

  userRegistryService.updateUser = async (_appUserId, patch) => ({
    app_user_id: "usr_2",
    user_sheet_id: "",
    user_sheet_url: "",
    telegram_user_id: "",
    timezone: patch.timezone,
    currency: patch.currency
  });

  userSheetService.getSetup = async () => {
    getSetupCalled = true;
    return null;
  };

  userSheetService.upsertSetup = async () => {
    upsertSetupCalled = true;
  };

  const result = await settingsService.updateSettings("usr_2", {
    timezone: "Europe/London",
    currency: "GBP"
  });

  assert.equal(result.timezone, "Europe/London");
  assert.equal(result.currency, "GBP");
  assert.equal(getSetupCalled, false);
  assert.equal(upsertSetupCalled, false);
});
