const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { monthQuerySchema } = require("../schemas/query.schema");
const { resyncController } = require("../controllers/sync.controller");

const router = express.Router();

router.use(authMiddleware);
router.post("/resync", validate(monthQuerySchema, "query"), asyncHandler(resyncController));

module.exports = router;
