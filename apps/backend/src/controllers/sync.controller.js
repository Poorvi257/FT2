const resyncService = require("../services/sync/resync.service");

async function resyncController(req, res) {
  const result = await resyncService.resyncMonth(req.auth.appUserId, req.query.month);
  res.json(result);
}

module.exports = {
  resyncController
};
