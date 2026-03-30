import { useState } from "react";
import { Card } from "../common/Card.jsx";

export function CategoryManager({ categories, onCreate }) {
  const [categoryName, setCategoryName] = useState("");
  const [transactionTypeDefault, setTransactionTypeDefault] = useState("variable");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!categoryName.trim()) return;
    await onCreate({ categoryName, transactionTypeDefault });
    setCategoryName("");
    setTransactionTypeDefault("variable");
  }

  return (
    <Card title="Categories" className="bg-white/[0.04]">
      <form className="inline-form" onSubmit={handleSubmit}>
        <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Category name" />
        <select value={transactionTypeDefault} onChange={(e) => setTransactionTypeDefault(e.target.value)}>
          <option value="variable">Variable</option>
          <option value="fixed">Fixed</option>
        </select>
        <button type="submit">Add category</button>
      </form>
      <div className="chip-list">
        {categories.map((item) => (
          <span key={item.category_id} className="chip">{item.category_name} · {item.transaction_type_default}</span>
        ))}
      </div>
    </Card>
  );
}
