const userRegistryService = require("../services/users/userRegistry.service");

async function getSettingsController(req, res) {
  const user = await userRegistryService.findByAppUserId(req.auth.appUserId);
  res.json({
    settings: {
      timezone: user.timezone,
      currency: user.currency,
      userSheetId: user.user_sheet_id,
      userSheetUrl: user.user_sheet_url,
      telegramLinked: Boolean(user.telegram_user_id)
    }
  });
}

module.exports = {
  getSettingsController
};
