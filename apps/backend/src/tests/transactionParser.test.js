const test = require("node:test");
const assert = require("node:assert/strict");
const transactionParserService = require("../services/transactions/transactionParser.service");

test("transaction parser extracts item amount category and type", () => {
  const parsed = transactionParserService.parse("milk 80 groceries fixed", [
    {
      category_id: "cat_1",
      category_name: "groceries",
      transaction_type_default: "variable",
      is_active: "true"
    }
  ]);

  assert.equal(parsed.item, "milk");
  assert.equal(parsed.amount, 80);
  assert.equal(parsed.categoryName, "groceries");
  assert.equal(parsed.transactionType, "fixed");
});
