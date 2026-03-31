const settingsService = require("../services/settings/settings.service");

async function getSettingsController(req, res) {
  const settings = await settingsService.getSettings(req.auth.appUserId);
  res.json({ settings });
}

async function updateSettingsController(req, res) {
  const settings = await settingsService.updateSettings(req.auth.appUserId, req.body);
  res.json({ settings });
}

module.exports = {
  getSettingsController,
  updateSettingsController
};
