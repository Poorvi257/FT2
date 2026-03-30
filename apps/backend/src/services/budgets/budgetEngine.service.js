const { listMonthDays } = require("../../utils/month");
const { roundCurrency } = require("../../utils/math");
const { TRANSACTION_TYPES } = require("../../config/constants");

function clampDate(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

class BudgetEngineService {
  calculateBudgetState({
    monthKey,
    principalAmount,
    openingPiggyBank = 0,
    transactions,
    budgetStartDate,
    budgetEndDate,
    asOfDate
  }) {
    const days = listMonthDays(monthKey).filter((day) => {
      if (budgetStartDate && day < budgetStartDate) return false;
      if (budgetEndDate && day > budgetEndDate) return false;
      return true;
    });

    if (!days.length) {
      return {
        asOfDate,
        budgetState: {
          status: "inactive",
          budgetAmount: roundCurrency(principalAmount),
          remainingMainBudget: roundCurrency(principalAmount),
          todayBaseLimit: 0,
          todaySpent: 0,
          todayRemaining: 0,
          piggyBank: roundCurrency(openingPiggyBank),
          dailySeries: []
        }
      };
    }

    const liveRows = transactions.filter((row) => {
      if (row.deleted_flag === "true") return false;
      if (row.entry_date < days[0] || row.entry_date > days[days.length - 1]) return false;
      return true;
    });

    const fixedByDay = new Map();
    const variableByDay = new Map();

    for (const row of liveRows) {
      const target = row.transaction_type === TRANSACTION_TYPES.FIXED ? fixedByDay : variableByDay;
      const current = target.get(row.entry_date) || 0;
      target.set(row.entry_date, roundCurrency(current + Number(row.amount || 0)));
    }

    const firstDay = days[0];
    const lastDay = days[days.length - 1];
    const resolvedAsOfDate = asOfDate || firstDay;
    const status = resolvedAsOfDate < firstDay ? "upcoming" : (resolvedAsOfDate > lastDay ? "complete" : "active");
    const activeDate = status === "complete" ? null : clampDate(resolvedAsOfDate, firstDay, lastDay);

    let remainingMainBudget = roundCurrency(principalAmount);
    let piggyBank = roundCurrency(openingPiggyBank);
    const dailySeries = [];

    for (const [index, day] of days.entries()) {
      const isFuture = status !== "complete" && day > activeDate;
      if (isFuture) {
        break;
      }

      const isActiveDay = status === "active" && day === activeDate;
      const isClosedDay = status === "complete" || day < activeDate;
      const remainingDays = days.length - index;
      const baseLimit = remainingDays > 0 ? roundCurrency(remainingMainBudget / remainingDays) : 0;
      const fixedSpend = roundCurrency(fixedByDay.get(day) || 0);
      const variableSpend = roundCurrency(variableByDay.get(day) || 0);
      const overspend = roundCurrency(Math.max(variableSpend - baseLimit, 0));
      const underspend = roundCurrency(Math.max(baseLimit - variableSpend, 0));

      const mainCost = roundCurrency(fixedSpend + variableSpend);
      let piggyUsed = 0;
      let piggyTransfer = 0;

      const coveredByMain = roundCurrency(Math.min(remainingMainBudget, mainCost));
      remainingMainBudget = roundCurrency(Math.max(remainingMainBudget - coveredByMain, 0));

      if (mainCost > coveredByMain) {
        piggyUsed = roundCurrency(Math.min(piggyBank, mainCost - coveredByMain));
        piggyBank = roundCurrency(Math.max(piggyBank - piggyUsed, 0));
      }

      if (isClosedDay && underspend > 0 && remainingMainBudget > 0) {
        piggyTransfer = roundCurrency(Math.min(remainingMainBudget, underspend));
        remainingMainBudget = roundCurrency(Math.max(remainingMainBudget - piggyTransfer, 0));
      }

      if (piggyTransfer > 0) {
        piggyBank = roundCurrency(piggyBank + piggyTransfer);
      }

      dailySeries.push({
        date: day,
        label: day.slice(8),
        dayType: isClosedDay ? "closed" : "active",
        baseLimit: String(baseLimit),
        fixedSpend: String(fixedSpend),
        variableSpend: String(variableSpend),
        overspend: String(overspend),
        piggyTransfer: String(piggyTransfer),
        piggyUsed: String(piggyUsed),
        piggyBank: String(piggyBank),
        remainingMainBudget: String(remainingMainBudget),
        todayRemaining: String(isActiveDay ? roundCurrency(Math.max(baseLimit - variableSpend, 0)) : 0)
      });
    }

    if (status === "upcoming") {
      const baseLimit = roundCurrency(remainingMainBudget / days.length);
      return {
        asOfDate: activeDate,
        budgetState: {
          status,
          budgetAmount: roundCurrency(principalAmount),
          remainingMainBudget: remainingMainBudget,
          todayBaseLimit: baseLimit,
          todaySpent: 0,
          todayRemaining: baseLimit,
          piggyBank: piggyBank,
          dailySeries
        }
      };
    }

    const currentDayState = status === "complete" ? null : dailySeries[dailySeries.length - 1] || null;

    return {
      asOfDate: activeDate || resolvedAsOfDate,
      budgetState: {
        status,
        budgetAmount: roundCurrency(principalAmount),
        remainingMainBudget: remainingMainBudget,
        todayBaseLimit: currentDayState ? Number(currentDayState.baseLimit) : 0,
        todaySpent: currentDayState ? Number(currentDayState.variableSpend) : 0,
        todayRemaining: currentDayState ? Number(currentDayState.todayRemaining) : 0,
        piggyBank: piggyBank,
        dailySeries
      }
    };
  }
}

module.exports = new BudgetEngineService();
