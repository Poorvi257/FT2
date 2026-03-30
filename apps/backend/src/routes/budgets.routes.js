const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { budgetCreateSchema, budgetDeleteParamsSchema } = require("../schemas/budget.schema");
const { monthQuerySchema } = require("../schemas/query.schema");
const { upsertBudgetController, currentBudgetController, budgetHistoryController, deleteBudgetController } = require("../controllers/budgets.controller");

const router = express.Router();

router.use(authMiddleware);
router.post("/", validate(budgetCreateSchema), asyncHandler(upsertBudgetController));
router.delete("/:budgetId", validate(budgetDeleteParamsSchema, "params"), asyncHandler(deleteBudgetController));
router.get("/current", validate(monthQuerySchema, "query"), asyncHandler(currentBudgetController));
router.get("/history", asyncHandler(budgetHistoryController));

module.exports = router;
