const budgetConfigService = require("../services/budgets/budgetConfig.service");
const budgetStateService = require("../services/budgets/budgetState.service");

async function upsertBudgetController(req, res) {
  const budget = await budgetConfigService.upsertBudget(req.auth.appUserId, req.body);
  const calculation = await budgetStateService.getBudgetState(req.auth.appUserId, budget.month_key);
  res.status(201).json({
    budget,
    budgetState: calculation?.budgetState || null,
    asOfDate: calculation?.asOfDate || null
  });
}

async function currentBudgetController(req, res) {
  const budget = await budgetConfigService.getBudgetByMonth(req.auth.appUserId, req.query.month);
  let budgetState = null;
  let asOfDate = null;

  if (budget) {
    const calculation = await budgetStateService.getBudgetState(req.auth.appUserId, req.query.month);
    budgetState = calculation?.budgetState || null;
    asOfDate = calculation?.asOfDate || null;
  }

  res.json({ budget, budgetState, asOfDate });
}

async function budgetHistoryController(req, res) {
  const items = await budgetConfigService.listBudgets(req.auth.appUserId);
  res.json({ items });
}

async function deleteBudgetController(req, res) {
  const result = await budgetConfigService.deleteBudget(req.auth.appUserId, req.params.budgetId);
  res.json(result);
}

module.exports = {
  upsertBudgetController,
  currentBudgetController,
  budgetHistoryController,
  deleteBudgetController
};
