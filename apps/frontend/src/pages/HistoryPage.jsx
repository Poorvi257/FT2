import { useState } from "react";
import { Card } from "../components/common/Card.jsx";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { ErrorState } from "../components/common/ErrorState.jsx";
import { MonthComparisonChart } from "../components/history/MonthComparisonChart.jsx";
import { PastBudgetTable } from "../components/history/PastBudgetTable.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { reportsApi } from "../services/reportsApi.js";
import { budgetsApi } from "../services/budgetsApi.js";

export function HistoryPage() {
  const [range, setRange] = useState({
    from: "2026-01",
    to: "2026-03"
  });
  const [deletingBudgetId, setDeletingBudgetId] = useState("");
  const [status, setStatus] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const reports = useAsyncData(() => reportsApi.getHistory(range.from, range.to), [range.from, range.to]);
  const budgets = useAsyncData(() => budgetsApi.getHistory(), []);

  async function handleDeleteBudget(item) {
    const confirmed = window.confirm(
      `Delete the ${item.month_key} budget configuration for ${item.budget_start_date} to ${item.budget_end_date}? Transactions will be kept.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingBudgetId(item.budget_id);
    setDeleteError("");
    setStatus("");

    try {
      const result = await budgetsApi.delete(item.budget_id);
      budgets.setData((current) => ({
        ...(current || {}),
        items: (current?.items || []).filter((budget) => budget.budget_id !== item.budget_id)
      }));
      setStatus(`Deleted the ${result.monthKey} budget configuration. Transactions were kept.`);
    } catch (err) {
      setDeleteError(err.message || "Failed to delete budget");
    } finally {
      setDeletingBudgetId("");
    }
  }

  return (
    <div className="page-shell page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">History</span>
          <h2>Past month reports and budgets</h2>
          <p>Compare monthly spend and manage old budget windows from a cleaner reporting view.</p>
        </div>
      </div>

      <Card title="Range" className="bg-white/[0.04]">
        <div className="filters-grid">
          <label>
            <span>From</span>
            <input type="month" value={range.from} onChange={(e) => setRange((current) => ({ ...current, from: e.target.value }))} />
          </label>
          <label>
            <span>To</span>
            <input type="month" value={range.to} onChange={(e) => setRange((current) => ({ ...current, to: e.target.value }))} />
          </label>
        </div>
      </Card>

      {status ? <LoadingState label={status} /> : null}
      {deleteError ? <ErrorState message={deleteError} /> : null}
      {reports.loading ? <LoadingState label="Loading report history..." /> : null}
      {reports.error ? <ErrorState message={reports.error} /> : null}
      {reports.data ? <MonthComparisonChart months={reports.data.months} /> : null}

      {budgets.loading ? <LoadingState label="Loading budget history..." /> : null}
      {budgets.error ? <ErrorState message={budgets.error} /> : null}
      {budgets.data ? (
        <PastBudgetTable
          items={budgets.data.items}
          deletingBudgetId={deletingBudgetId}
          onDelete={handleDeleteBudget}
        />
      ) : null}
    </div>
  );
}
