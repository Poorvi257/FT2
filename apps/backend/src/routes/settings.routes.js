const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { getSettingsController } = require("../controllers/settings.controller");

const router = express.Router();

router.use(authMiddleware);
router.get("/", asyncHandler(getSettingsController));

module.exports = router;
