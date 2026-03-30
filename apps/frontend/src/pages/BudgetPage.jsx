import { useEffect, useState } from "react";
import { Card } from "../components/common/Card.jsx";
import { MonthPicker } from "../components/common/MonthPicker.jsx";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { ErrorState } from "../components/common/ErrorState.jsx";
import { BudgetSummaryCards } from "../components/budget/BudgetSummaryCards.jsx";
import { BudgetBreakdownPanel } from "../components/budget/BudgetBreakdownPanel.jsx";
import { EmptyState } from "../components/common/EmptyState.jsx";
import { useBudget } from "../hooks/useBudget.js";
import { budgetsApi } from "../services/budgetsApi.js";

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function currentDateKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function lastDateOfMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${monthKey}-${String(new Date(Date.UTC(year, month, 0)).getUTCDate()).padStart(2, "0")}`;
}

export function BudgetPage() {
  const [month, setMonth] = useState(currentMonthKey());
  const [principalAmount, setPrincipalAmount] = useState("");
  const [openingPiggyBank, setOpeningPiggyBank] = useState("");
  const [startDate, setStartDate] = useState(currentDateKey());
  const [endDate, setEndDate] = useState(lastDateOfMonth(currentMonthKey()));
  const [actionError, setActionError] = useState("");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data, loading, error, setData } = useBudget(month);

  useEffect(() => {
    if (data?.budget) {
      setPrincipalAmount(String(data.budget.principal_amount || ""));
      setOpeningPiggyBank(String(data.budget.opening_piggy_bank || ""));
      setStartDate(data.budget.budget_start_date || currentDateKey());
      setEndDate(data.budget.budget_end_date || lastDateOfMonth(month));
    }
  }, [data, month]);

  useEffect(() => {
    if (!data?.budget) {
      setStartDate(currentDateKey().startsWith(month) ? currentDateKey() : `${month}-01`);
      setEndDate(lastDateOfMonth(month));
    }
  }, [data, month]);

  async function handleCreateBudget(event) {
    event.preventDefault();
    setIsSaving(true);
    setActionError("");
    setStatus("");

    try {
      const response = await budgetsApi.create({
        monthKey: month,
        principalAmount: Number(principalAmount || 0),
        openingPiggyBank: Number(openingPiggyBank || 0),
        carryForwardMode: "piggy_bank_only",
        startDate,
        endDate,
        isLocked: false
      });
      setData(response);
      setPrincipalAmount(String(response.budget?.principal_amount || Number(principalAmount || 0)));
      setOpeningPiggyBank(String(response.budget?.opening_piggy_bank || Number(openingPiggyBank || 0)));
      setStatus(`Saved ${month} budget.`);
    } catch (err) {
      setActionError(err.message || "Failed to save budget");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteBudget() {
    if (!data?.budget) {
      return;
    }

    const confirmed = window.confirm(
      `Delete the ${data.budget.month_key} budget configuration for ${data.budget.budget_start_date} to ${data.budget.budget_end_date}? Transactions will be kept.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setActionError("");
    setStatus("");

    try {
      const result = await budgetsApi.delete(data.budget.budget_id);
      const nextStartDate = currentDateKey().startsWith(month) ? currentDateKey() : `${month}-01`;
      const nextEndDate = lastDateOfMonth(month);
      setData({ budget: null, budgetState: null, asOfDate: null });
      setPrincipalAmount("");
      setOpeningPiggyBank("");
      setStartDate(nextStartDate);
      setEndDate(nextEndDate);
      setStatus(`Deleted the ${result.monthKey} budget configuration. Transactions were kept.`);
    } catch (err) {
      setActionError(err.message || "Failed to delete budget");
    } finally {
      setIsDeleting(false);
    }
  }

  const budgetRangeLabel = data?.budget
    ? `${data.budget.budget_start_date} to ${data.budget.budget_end_date}`
    : `${startDate} to ${endDate}`;

  return (
    <div className="page-shell page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Budget</span>
          <h2>Current budget overview</h2>
          <p>Focus on the remaining balance, the saved piggy bank, and the budget window for the selected month.</p>
        </div>
        <MonthPicker value={month} onChange={setMonth} variant="dark" />
      </div>

      {status ? <LoadingState label={status} /> : null}
      {actionError ? <ErrorState message={actionError} /> : null}
      {loading ? <LoadingState label="Loading budget..." /> : null}
      {error ? <ErrorState message={error} /> : null}
      {data?.budgetState ? (
        <>
          <BudgetSummaryCards budget={data.budget} budgetState={data.budgetState} asOfDate={data.asOfDate} />
          <BudgetBreakdownPanel budget={data.budget} budgetState={data.budgetState} asOfDate={data.asOfDate} />
        </>
      ) : !loading && !error ? (
        <Card
          title="No budget configured"
          className="bg-white/[0.04]"
          titleClassName="font-display text-base font-semibold tracking-tight text-fg"
        >
          <EmptyState
            title="Create a budget for this month"
            description="Set the budget amount, optional opening piggy bank, and the start and end dates to begin tracking the daily limit."
            variant="dark"
          />
        </Card>
      ) : null}

      <Card
        title="Budget settings"
        className="bg-white/[0.04]"
        titleClassName="font-display text-base font-semibold tracking-tight text-fg"
        actions={data?.budget ? (
          <button
            type="button"
            className="border border-rose-400/20 bg-rose-500/10 text-rose-200 shadow-panel hover:bg-rose-500/15"
            disabled={isDeleting}
            onClick={handleDeleteBudget}
          >
            {isDeleting ? "Deleting budget..." : "Delete budget"}
          </button>
        ) : null}
      >
        <div className="mb-5 rounded-2xl border border-white/[0.06] bg-[#0b0b10]/60 px-4 py-4 shadow-soft">
          <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-muted">Budget window</span>
          <strong className="mt-2 block text-base text-fg">{budgetRangeLabel}</strong>
          {data?.asOfDate ? <p className="mt-2 text-sm text-fg-muted">Calculated as of {data.asOfDate}</p> : null}
        </div>
        <form className="inline-form" onSubmit={handleCreateBudget}>
          <label>
            <span>Budget amount</span>
            <input
              value={principalAmount}
              onChange={(e) => setPrincipalAmount(e.target.value)}
              placeholder="Budget amount"
            />
          </label>
          <label>
            <span>Opening piggy bank</span>
            <input
              value={openingPiggyBank}
              onChange={(e) => setOpeningPiggyBank(e.target.value)}
              placeholder="Opening piggy bank"
            />
          </label>
          <label>
            <span>Start date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setMonth(e.target.value.slice(0, 7));
              }}
            />
          </label>
          <label>
            <span>End date</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save budget"}</button>
        </form>
        {data?.budget ? (
          <p className="mt-4 text-sm leading-6 text-fg-muted">
            Deleting a budget removes only the budget configuration. Transactions remain the source of truth and are kept.
          </p>
        ) : null}
      </Card>
    </div>
  );
}
