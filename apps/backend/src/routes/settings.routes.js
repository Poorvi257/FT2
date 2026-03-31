const express = require("express");
const { z } = require("zod");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { normalizeCurrency, normalizeTimezone, isValidCurrencyCode, isValidIanaTimezone } = require("../utils/preferences");
const { getSettingsController, updateSettingsController } = require("../controllers/settings.controller");

const router = express.Router();
const updateSettingsSchema = z.object({
  timezone: z.string().transform(normalizeTimezone).refine(isValidIanaTimezone, "Timezone must be a valid IANA timezone"),
  currency: z.string().transform(normalizeCurrency).refine(isValidCurrencyCode, "Currency must be a valid uppercase ISO-style code")
});

router.use(authMiddleware);
router.get("/", asyncHandler(getSettingsController));
router.patch("/", validate(updateSettingsSchema), asyncHandler(updateSettingsController));

module.exports = router;
module.exports.updateSettingsSchema = updateSettingsSchema;
