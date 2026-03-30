const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { listCategoriesController, createCategoryController } = require("../controllers/categories.controller");

const router = express.Router();

router.use(authMiddleware);
router.get("/", asyncHandler(listCategoriesController));
router.post("/", asyncHandler(createCategoryController));

module.exports = router;
