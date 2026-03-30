import { useEffect, useState } from "react";
import { Card } from "../components/common/Card.jsx";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { ErrorState } from "../components/common/ErrorState.jsx";
import { TransactionFilters } from "../components/transactions/TransactionFilters.jsx";
import { TransactionTable } from "../components/transactions/TransactionTable.jsx";
import { Pagination } from "../components/transactions/Pagination.jsx";
import { categoriesApi } from "../services/categoriesApi.js";
import { useTransactions } from "../hooks/useTransactions.js";

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function TransactionsPage() {
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    month: getCurrentMonthKey(),
    category: "",
    type: "",
    search: "",
    page: 1,
    pageSize: 10
  });

  const { data, loading, error } = useTransactions(filters);

  useEffect(() => {
    categoriesApi.list().then((result) => setCategories(result.items)).catch(() => setCategories([]));
  }, []);

  function handleChange(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === "page" ? value : 1
    }));
  }

  return (
    <div className="page-shell page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Transactions</span>
          <h2>Paginated transaction listing</h2>
          <p>Filter by month, category, type, and search term to inspect individual entries without leaving the app.</p>
        </div>
      </div>

      <Card title="Filters" className="bg-white/[0.04]">
        <TransactionFilters filters={filters} onChange={handleChange} categories={categories} />
      </Card>

      {loading ? <LoadingState label="Loading transactions..." /> : null}
      {error ? <ErrorState message={error} /> : null}
      {data ? (
        <Card title="Transactions" className="bg-white/[0.04]">
          <TransactionTable items={data.items} />
          <Pagination
            page={data.pagination.page}
            pageSize={data.pagination.pageSize}
            total={data.pagination.total}
            disabled={loading}
            onPageChange={(page) => handleChange("page", page)}
          />
        </Card>
      ) : null}
    </div>
  );
}
