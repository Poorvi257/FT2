import { Card } from "../common/Card.jsx";
import { formatCurrency } from "../../lib/formatCurrency.js";

export function LastTransactionsTable({ items }) {
  return (
    <Card
      title="Latest transactions"
      className="bg-white/[0.04]"
      titleClassName="font-display text-lg font-semibold tracking-tight text-fg"
    >
      <div className="table-shell overflow-x-auto">
        <table className="min-w-[560px] text-sm text-fg-muted sm:min-w-full">
          <thead className="table-head">
            <tr className="table-head-row">
              <th>Date</th>
              <th>Item</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items?.length ? items.map((item) => (
              <tr key={item.txn_id} className="table-row">
                <td>{item.entry_date}</td>
                <td className="table-cell-strong">{item.item}</td>
                <td>{item.category_name}</td>
                <td>
                  <span className="table-pill">{item.transaction_type}</span>
                </td>
                <td className="table-cell-strong">{formatCurrency(item.amount)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="py-6 text-center text-fg-muted">No recent transactions.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
