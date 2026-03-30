const express = require("express");
const { z } = require("zod");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { monthQuerySchema } = require("../schemas/query.schema");
const asyncHandler = require("../utils/asyncHandler");
const { dashboardReportController, monthlyReportController, historyReportController } = require("../controllers/reports.controller");

const router = express.Router();

router.use(authMiddleware);
router.get("/dashboard", validate(monthQuerySchema, "query"), asyncHandler(dashboardReportController));
router.get("/monthly", validate(monthQuerySchema, "query"), asyncHandler(monthlyReportController));
router.get(
  "/history",
  validate(z.object({
    from: z.string().regex(/^\d{4}-\d{2}$/),
    to: z.string().regex(/^\d{4}-\d{2}$/)
  }), "query"),
  asyncHandler(historyReportController)
);

module.exports = router;
