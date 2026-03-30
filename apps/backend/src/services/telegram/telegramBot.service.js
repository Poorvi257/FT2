const env = require("../../config/env");

class TelegramBotService {
  async sendMessage(chatId, text) {
    if (!env.TELEGRAM_BOT_TOKEN) {
      return { ok: false, skipped: true };
    }

    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text
      })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Telegram API error: ${body}`);
    }

    return response.json();
  }
}

module.exports = new TelegramBotService();
