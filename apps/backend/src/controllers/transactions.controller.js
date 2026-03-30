const transactionWriteService = require("../services/transactions/transactionWrite.service");
const transactionQueryService = require("../services/transactions/transactionQuery.service");

async function createTransactionController(req, res) {
  const transaction = await transactionWriteService.createForUser(req.auth.appUserId, {
    ...req.body,
    source: "web"
  });
  res.status(201).json({ transaction });
}

async function listTransactionsController(req, res) {
  const result = await transactionQueryService.listByMonth(req.auth.appUserId, req.query);
  res.json(result);
}

async function last10TransactionsController(req, res) {
  const items = await transactionQueryService.getLast10(req.auth.appUserId, req.query.month);
  res.json({ items });
}

module.exports = {
  createTransactionController,
  listTransactionsController,
  last10TransactionsController
};
