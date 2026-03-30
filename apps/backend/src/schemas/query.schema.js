const { z } = require("zod");

const monthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/)
});

module.exports = {
  monthQuerySchema
};
