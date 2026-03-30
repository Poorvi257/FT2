const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { transactionBodySchema, transactionQuerySchema } = require("../schemas/transaction.schema");
const { createTransactionController, listTransactionsController, last10TransactionsController } = require("../controllers/transactions.controller");
const { monthQuerySchema } = require("../schemas/query.schema");

const router = express.Router();

router.use(authMiddleware);
router.post("/", validate(transactionBodySchema), asyncHandler(createTransactionController));
router.get("/", validate(transactionQuerySchema, "query"), asyncHandler(listTransactionsController));
router.get("/last10", validate(monthQuerySchema, "query"), asyncHandler(last10TransactionsController));

module.exports = router;
