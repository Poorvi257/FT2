const express = require("express");
const telegramVerifyMiddleware = require("../middleware/telegramVerify.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { telegramWebhookController } = require("../controllers/telegram.controller");

const router = express.Router();

router.post("/webhook", telegramVerifyMiddleware, asyncHandler(telegramWebhookController));

module.exports = router;
