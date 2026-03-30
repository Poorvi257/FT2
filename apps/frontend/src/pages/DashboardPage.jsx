import { MonthPicker } from "../components/common/MonthPicker.jsx";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { ErrorState } from "../components/common/ErrorState.jsx";
import { SummaryCards } from "../components/dashboard/SummaryCards.jsx";
import { DailySpendChart } from "../components/dashboard/DailySpendChart.jsx";
import { WeeklySummary } from "../components/dashboard/WeeklySummary.jsx";
import { CategorySplitChart } from "../components/dashboard/CategorySplitChart.jsx";
import { LastTransactionsTable } from "../components/dashboard/LastTransactionsTable.jsx";
import { useMonth } from "../hooks/useMonth.js";
import { useDashboard } from "../hooks/useDashboard.js";

export function DashboardPage() {
  const { month, setMonth } = useMonth();
  const { data, loading, error } = useDashboard(month);

  return (
    <div className="page-shell page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h2>Expense activity overview</h2>
          <p>Review monthly totals, category concentration, daily movement, and recent entries from one workspace.</p>
        </div>
        <MonthPicker value={month} onChange={setMonth} variant="dark" />
      </div>

      {loading ? <LoadingState label="Loading dashboard..." /> : null}
      {error ? <ErrorState message={error} /> : null}
      {data ? (
        <>
          <SummaryCards totals={data.totals} />
          <div className="content-grid two-col">
            <CategorySplitChart items={data.categorySplit} />
            <DailySpendChart items={data.dailySpend} />
          </div>
          <div className="content-grid two-col">
            <WeeklySummary items={data.weeklySummary} />
            <LastTransactionsTable items={data.last10} />
          </div>
        </>
      ) : null}
    </div>
  );
}
