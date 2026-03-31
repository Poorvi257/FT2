import { Card } from "../common/Card.jsx";
import { formatCurrency } from "../../lib/formatCurrency.js";

export function PastBudgetTable({ items, onDelete, deletingBudgetId }) {
  return (
    <Card title="Past budgets" className="bg-white/[0.04]">
      <div className="table-shell overflow-x-auto">
        <table className="min-w-[720px] text-sm text-fg-muted sm:min-w-full">
          <thead className="table-head">
            <tr className="table-head-row">
              <th>Month</th>
              <th>Range</th>
              <th>Principal</th>
              <th>Opening piggy bank</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {items?.length ? items.map((item) => (
              <tr key={item.budget_id} className="table-row">
                <td className="table-cell-strong">{item.month_key}</td>
                <td>{item.budget_start_date} to {item.budget_end_date}</td>
                <td className="table-cell-strong">{formatCurrency(item.principal_amount)}</td>
                <td>{formatCurrency(item.opening_piggy_bank)}</td>
                <td className="text-right">
                  <button
                    type="button"
                    className="border border-rose-400/20 bg-rose-500/10 text-rose-200 shadow-panel hover:bg-rose-500/15"
                    disabled={deletingBudgetId === item.budget_id}
                    onClick={() => onDelete?.(item)}
                  >
                    {deletingBudgetId === item.budget_id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="py-6 text-center text-fg-muted">No budgets yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
