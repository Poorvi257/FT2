const test = require("node:test");
const assert = require("node:assert/strict");
const budgetEngineService = require("../services/budgets/budgetEngine.service");

test("fixed transactions reduce the main budget without increasing today spent", () => {
  const result = budgetEngineService.calculateBudgetState({
    monthKey: "2026-03",
    principalAmount: 3000,
    openingPiggyBank: 0,
    budgetStartDate: "2026-03-29",
    budgetEndDate: "2026-03-31",
    asOfDate: "2026-03-29",
    transactions: [
      { entry_date: "2026-03-29", amount: 300, transaction_type: "fixed" }
    ]
  });

  assert.equal(result.budgetState.todayBaseLimit, 1000);
  assert.equal(result.budgetState.todaySpent, 0);
  assert.equal(result.budgetState.todayRemaining, 1000);
  assert.equal(result.budgetState.remainingMainBudget, 2700);
});

test("variable transactions reduce today spent and today remaining", () => {
  const result = budgetEngineService.calculateBudgetState({
    monthKey: "2026-03",
    principalAmount: 900,
    openingPiggyBank: 0,
    budgetStartDate: "2026-03-29",
    budgetEndDate: "2026-03-31",
    asOfDate: "2026-03-29",
    transactions: [
      { entry_date: "2026-03-29", amount: 120, transaction_type: "variable" }
    ]
  });

  assert.equal(result.budgetState.todayBaseLimit, 300);
  assert.equal(result.budgetState.todaySpent, 120);
  assert.equal(result.budgetState.todayRemaining, 180);
  assert.equal(result.budgetState.remainingMainBudget, 780);
});

test("closed-day underspend moves into piggy bank only after day close", () => {
  const activeDay = budgetEngineService.calculateBudgetState({
    monthKey: "2026-03",
    principalAmount: 900,
    openingPiggyBank: 0,
    budgetStartDate: "2026-03-29",
    budgetEndDate: "2026-03-31",
    asOfDate: "2026-03-29",
    transactions: [
      { entry_date: "2026-03-29", amount: 120, transaction_type: "variable" }
    ]
  });

  const nextDay = budgetEngineService.calculateBudgetState({
    monthKey: "2026-03",
    principalAmount: 900,
    openingPiggyBank: 0,
    budgetStartDate: "2026-03-29",
    budgetEndDate: "2026-03-31",
    asOfDate: "2026-03-30",
    transactions: [
      { entry_date: "2026-03-29", amount: 120, transaction_type: "variable" }
    ]
  });

  assert.equal(activeDay.budgetState.piggyBank, 0);
  assert.equal(nextDay.budgetState.piggyBank, 180);
  assert.equal(nextDay.budgetState.todayBaseLimit, 300);
});

test("overspend lowers future base limits by reducing the remaining main budget", () => {
  const result = budgetEngineService.calculateBudgetState({
    monthKey: "2026-03",
    principalAmount: 900,
    openingPiggyBank: 0,
    budgetStartDate: "2026-03-29",
    budgetEndDate: "2026-03-31",
    asOfDate: "2026-03-30",
    transactions: [
      { entry_date: "2026-03-29", amount: 360, transaction_type: "variable" }
    ]
  });

  assert.equal(result.budgetState.todayBaseLimit, 270);
  assert.equal(result.budgetState.remainingMainBudget, 540);
});

test("once the main budget reaches zero, further spend is deducted from piggy bank", () => {
  const result = budgetEngineService.calculateBudgetState({
    monthKey: "2026-03",
    principalAmount: 100,
    openingPiggyBank: 50,
    budgetStartDate: "2026-03-29",
    budgetEndDate: "2026-03-29",
    asOfDate: "2026-03-29",
    transactions: [
      { entry_date: "2026-03-29", amount: 150, transaction_type: "variable" }
    ]
  });

  assert.equal(result.budgetState.remainingMainBudget, 0);
  assert.equal(result.budgetState.piggyBank, 0);
  assert.equal(result.budgetState.todaySpent, 150);
});

test("deleted transactions are ignored", () => {
  const result = budgetEngineService.calculateBudgetState({
    monthKey: "2026-03",
    principalAmount: 500,
    openingPiggyBank: 0,
    budgetStartDate: "2026-03-29",
    budgetEndDate: "2026-03-30",
    asOfDate: "2026-03-29",
    transactions: [
      { entry_date: "2026-03-29", amount: 100, transaction_type: "fixed", deleted_flag: "true" }
    ]
  });

  assert.equal(result.budgetState.remainingMainBudget, 500);
  assert.equal(result.budgetState.todaySpent, 0);
});
