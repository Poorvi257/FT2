const { z } = require("zod");
const { TRANSACTION_TYPES } = require("@ft2/shared");

const transactionBodySchema = z.object({
  item: z.string().min(1),
  amount: z.coerce.number().positive(),
  categoryName: z.string().min(1),
  transactionType: z.enum([TRANSACTION_TYPES.FIXED, TRANSACTION_TYPES.VARIABLE]).optional(),
  notes: z.string().optional().default(""),
  entryDate: z.string().optional()
});

const transactionQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10),
  category: z.string().optional().transform((value) => value || undefined),
  type: z.preprocess((value) => value === "" ? undefined : value, z.enum([TRANSACTION_TYPES.FIXED, TRANSACTION_TYPES.VARIABLE]).optional()),
  search: z.string().optional().transform((value) => value || undefined)
});

module.exports = {
  transactionBodySchema,
  transactionQuerySchema
};
