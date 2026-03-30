const { z } = require("zod");

const budgetCreateSchema = z.object({
  monthKey: z.string().regex(/^\d{4}-\d{2}$/),
  principalAmount: z.coerce.number().nonnegative(),
  openingPiggyBank: z.coerce.number().nonnegative().default(0),
  carryForwardMode: z.enum(["none", "piggy_bank_only"]).default("piggy_bank_only"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  isLocked: z.boolean().optional().default(false)
});

const budgetDeleteParamsSchema = z.object({
  budgetId: z.string().min(1)
});

module.exports = {
  budgetCreateSchema,
  budgetDeleteParamsSchema
};
