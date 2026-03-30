const monthlyReportService = require("../services/reports/monthlyReport.service");

async function dashboardReportController(req, res) {
  const report = await monthlyReportService.getDashboard(req.auth.appUserId, req.query.month);
  res.json(report);
}

async function monthlyReportController(req, res) {
  const report = await monthlyReportService.getDashboard(req.auth.appUserId, req.query.month);
  res.json(report);
}

async function historyReportController(req, res) {
  const history = await monthlyReportService.getHistory(req.auth.appUserId, req.query.from, req.query.to);
  res.json(history);
}

module.exports = {
  dashboardReportController,
  monthlyReportController,
  historyReportController
};
