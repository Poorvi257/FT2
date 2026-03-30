const express = require("express");
const { z } = require("zod");
const validate = require("../middleware/validate.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");
const {
  consumeMagicLinkController,
  logoutController,
  meController,
  googleConnectController,
  googleSignInController,
  googleCallbackController
} = require("../controllers/auth.controller");

const router = express.Router();

router.post(
  "/magic-link/consume",
  validate(z.object({ token: z.string().min(1) })),
  asyncHandler(consumeMagicLinkController)
);
router.get("/google/signin", asyncHandler(googleSignInController));
router.get("/google/connect", authMiddleware, asyncHandler(googleConnectController));
router.get(
  "/google/callback",
  validate(z.object({ code: z.string().min(1), state: z.string().min(1) }), "query"),
  asyncHandler(googleCallbackController)
);
router.post("/logout", authMiddleware, asyncHandler(logoutController));
router.get("/me", authMiddleware, asyncHandler(meController));

module.exports = router;
