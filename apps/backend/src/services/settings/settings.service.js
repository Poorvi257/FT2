const { nowIso } = require("../../utils/date");
const { AppError } = require("../../utils/errors");
const userRegistryService = require("../users/userRegistry.service");
const userSheetService = require("../sheets/userSheet.service");

class SettingsService {
  async getSettings(appUserId) {
    const user = await userRegistryService.getRequiredByAppUserId(appUserId);

    return {
      timezone: user.timezone,
      currency: user.currency,
      userSheetId: user.user_sheet_id,
      userSheetUrl: user.user_sheet_url,
      telegramLinked: Boolean(user.telegram_user_id)
    };
  }

  async updateSettings(appUserId, input) {
    const user = await userRegistryService.getRequiredByAppUserId(appUserId);
    const timestamp = nowIso();

    const updatedUser = await userRegistryService.updateUser(appUserId, {
      timezone: input.timezone,
      currency: input.currency,
      updated_at: timestamp
    });

    if (user.user_sheet_id) {
      const existingSetup = await userSheetService.getSetup(user.user_sheet_id).catch((error) => {
        throw new AppError(502, "Failed to load linked sheet setup", { cause: error.message });
      });

      await userSheetService.upsertSetup(user.user_sheet_id, {
        app_user_id: existingSetup?.app_user_id || updatedUser.app_user_id,
        display_name: existingSetup?.display_name || updatedUser.web_login_email || updatedUser.telegram_username || "",
        timezone: input.timezone,
        currency: input.currency,
        telegram_user_id: existingSetup?.telegram_user_id || updatedUser.telegram_user_id || "",
        telegram_chat_id: existingSetup?.telegram_chat_id || updatedUser.telegram_chat_id || "",
        budgeting_enabled: existingSetup?.budgeting_enabled || "true",
        active_budget_id: existingSetup?.active_budget_id || "",
        created_at: existingSetup?.created_at || updatedUser.created_at || timestamp,
        updated_at: timestamp
      });
    }

    return this.getSettings(appUserId);
  }
}

module.exports = new SettingsService();
