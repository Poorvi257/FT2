const { z } = require("zod");
const categoryService = require("../services/categories/category.service");

const categoryCreateSchema = z.object({
  categoryName: z.string().min(1),
  transactionTypeDefault: z.enum(["fixed", "variable"]),
  sortOrder: z.coerce.number().int().positive().optional()
});

async function listCategoriesController(req, res) {
  const items = await categoryService.listForUser(req.auth.appUserId);
  res.json({ items });
}

async function createCategoryController(req, res) {
  const input = categoryCreateSchema.parse(req.body);
  const category = await categoryService.createForUser(req.auth.appUserId, input);
  res.status(201).json({ category });
}

module.exports = {
  listCategoriesController,
  createCategoryController
};
