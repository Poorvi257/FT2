const env = require("../../config/env");
const { USER_ONBOARDING_STATUS, TRANSACTION_TYPES } = require("../../config/constants");
const { createId } = require("../../utils/ids");
const { nowIso } = require("../../utils/date");
const userRegistryService = require("../users/userRegistry.service");
const userSheetService = require("../sheets/userSheet.service");

class OnboardingService {
  async getOrCreateTelegramUser({ telegramUserId, chatId, username, displayName }) {
    const existing = await userRegistryService.findByTelegramUserId(telegramUserId);
    if (existing) {
      return existing;
    }

    const timestamp = nowIso();
    const appUserId = createId("usr");

    const registryUser = {
      app_user_id: appUserId,
      telegram_user_id: String(telegramUserId),
      telegram_chat_id: String(chatId),
      telegram_username: username || "",
      web_login_email: "",
      user_sheet_id: "",
      user_sheet_url: "",
      timezone: env.DEFAULT_TIMEZONE,
      currency: env.DEFAULT_CURRENCY,
      default_month_start_day: "1",
      onboarding_status: USER_ONBOARDING_STATUS.PENDING,
      telegram_linked_at: timestamp,
      last_login_at: "",
      created_at: timestamp,
      updated_at: timestamp,
      version: "1"
    };

    await userRegistryService.appendUser(registryUser);

    return registryUser;
  }

  async completeGoogleSheetConnection({ appUserId, spreadsheetId, spreadsheetUrl, email }) {
    const user = await userRegistryService.getRequiredByAppUserId(appUserId);
    const timestamp = nowIso();

    await userRegistryService.updateUser(appUserId, {
      user_sheet_id: spreadsheetId,
      user_sheet_url: spreadsheetUrl,
      web_login_email: email || user.web_login_email || "",
      onboarding_status: USER_ONBOARDING_STATUS.ACTIVE,
      updated_at: timestamp
    });

    await userSheetService.upsertSetup(spreadsheetId, {
      app_user_id: appUserId,
      display_name: email || user.telegram_username || "",
      timezone: user.timezone,
      currency: user.currency,
      telegram_user_id: user.telegram_user_id,
      telegram_chat_id: user.telegram_chat_id,
      budgeting_enabled: "true",
      active_budget_id: "",
      created_at: user.created_at || timestamp,
      updated_at: timestamp
    });

    const existingCategories = await userSheetService.getCategories(spreadsheetId);
    if (!existingCategories.length) {
      await userSheetService.appendCategory(spreadsheetId, {
        category_id: createId("cat"),
        category_name: "food",
        transaction_type_default: TRANSACTION_TYPES.VARIABLE,
        is_active: "true",
        sort_order: "1",
        created_at: timestamp,
        updated_at: timestamp
      });

      await userSheetService.appendCategory(spreadsheetId, {
        category_id: createId("cat"),
        category_name: "rent",
        transaction_type_default: TRANSACTION_TYPES.FIXED,
        is_active: "true",
        sort_order: "2",
        created_at: timestamp,
        updated_at: timestamp
      });
    }

    return userRegistryService.getRequiredByAppUserId(appUserId);
  }
}

module.exports = new OnboardingService();
