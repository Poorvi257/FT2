const telegramCommandService = require("../services/telegram/telegramCommand.service");
const telegramBotService = require("../services/telegram/telegramBot.service");
const logger = require("../config/logger");

async function telegramWebhookController(req, res) {
  const chatId = req.body?.message?.chat?.id;
  try {
    const replyText = await telegramCommandService.handleUpdate(req.body);

    if (chatId && replyText) {
      await telegramBotService.sendMessage(chatId, replyText);
    }
  } catch (error) {
    logger.warn({
      err: error,
      chatId,
      text: req.body?.message?.text
    }, "Telegram command failed");

    if (chatId) {
      await telegramBotService.sendMessage(chatId, error.message || "Could not process that message.");
    }
  }

  res.status(200).json({ ok: true });
}

module.exports = {
  telegramWebhookController
};
