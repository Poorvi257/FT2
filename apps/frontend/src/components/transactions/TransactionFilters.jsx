export function TransactionFilters({ filters, onChange, categories }) {
  return (
    <div className="filters-grid">
      <label>
        <span>Month</span>
        <input type="month" value={filters.month} onChange={(e) => onChange("month", e.target.value)} />
      </label>
      <label>
        <span>Category</span>
        <select value={filters.category} onChange={(e) => onChange("category", e.target.value)}>
          <option value="">All</option>
          {categories.map((item) => (
            <option key={item.category_id} value={item.category_name}>{item.category_name}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Type</span>
        <select value={filters.type} onChange={(e) => onChange("type", e.target.value)}>
          <option value="">All</option>
          <option value="fixed">Fixed</option>
          <option value="variable">Variable</option>
        </select>
      </label>
      <label>
        <span>Search</span>
        <input value={filters.search} onChange={(e) => onChange("search", e.target.value)} placeholder="Search item" />
      </label>
    </div>
  );
}
