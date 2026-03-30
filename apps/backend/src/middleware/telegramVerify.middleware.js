const env = require("../config/env");
const { AppError } = require("../utils/errors");

function telegramVerifyMiddleware(req, res, next) {
  if (!env.TELEGRAM_WEBHOOK_SECRET) {
    return next();
  }

  const headerValue = req.headers["x-telegram-bot-api-secret-token"];
  if (headerValue !== env.TELEGRAM_WEBHOOK_SECRET) {
    return next(new AppError(401, "Invalid Telegram webhook secret"));
  }

  return next();
}

module.exports = telegramVerifyMiddleware;
