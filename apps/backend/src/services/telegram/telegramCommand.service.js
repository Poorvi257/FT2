const magicLinkService = require("../auth/magicLink.service");
const onboardingService = require("../onboarding/onboarding.service");
const categoryService = require("../categories/category.service");
const transactionParserService = require("../transactions/transactionParser.service");
const transactionWriteService = require("../transactions/transactionWrite.service");
const transactionQueryService = require("../transactions/transactionQuery.service");
const monthlyReportService = require("../reports/monthlyReport.service");
const budgetConfigService = require("../budgets/budgetConfig.service");
const budgetStateService = require("../budgets/budgetState.service");
const resyncService = require("../sync/resync.service");
const userRegistryService = require("../users/userRegistry.service");
const { currentMonthKey } = require("../../utils/date");
const { AppError } = require("../../utils/errors");

function normalizeDateToken(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [day, month, year] = value.split("-");
    return `${year}-${month}-${day}`;
  }

  throw new AppError(400, "Budget dates must use DD-MM-YYYY or YYYY-MM-DD");
}

class TelegramCommandService {
  async handleUpdate(update) {
    const message = update.message;
    if (!message?.text) {
      return "Unsupported message type.";
    }

    const telegramUserId = message.from.id;
    const chatId = message.chat.id;
    const username = message.from.username;
    const displayName = [message.from.first_name, message.from.last_name].filter(Boolean).join(" ");
    const registryUser = await onboardingService.getOrCreateTelegramUser({
      telegramUserId,
      chatId,
      username,
      displayName
    });

    const text = message.text.trim();
    const monthKey = currentMonthKey(registryUser.timezone);
    const startCommandMatch = text.match(/^\/start(?:@\w+)?(?:\s+(.+))?$/i);

    if (startCommandMatch) {
      const startPayload = String(startCommandMatch[1] || "").trim();
      const action = registryUser.user_sheet_id
        ? "Your account is ready."
        : "Your Telegram account is linked to FT2. Open the login link below, then connect Google Sheets in Settings to finish setup.";
      const payloadLine = startPayload ? `Start flow: ${startPayload}\n` : "";
      return `${action}\n${payloadLine}Login: ${magicLinkService.createLoginUrl(registryUser.app_user_id)}`;
    }

    if (text === "/help") {
      return [
        "Use: item amount category [fixed|variable]",
        "Commands:",
        "/last10",
        "/report",
        "/categories",
        "/budget",
        "/resync"
      ].join("\n");
    }

    if (text === "/categories") {
      const categories = await categoryService.listForUser(registryUser.app_user_id);
      return `Categories:\n${categories.map((entry) => `- ${entry.category_name} (${entry.transaction_type_default})`).join("\n")}`;
    }

    if (text === "/last10") {
      const rows = await transactionQueryService.getLast10(registryUser.app_user_id, monthKey);
      if (!rows.length) return "No transactions found for this month.";
      return rows.map((row) => `${row.entry_date} | ${row.item} | ${row.amount} | ${row.category_name}`).join("\n");
    }

    if (text.startsWith("/report")) {
      const requestedMonth = text.split(/\s+/)[1] || monthKey;
      const report = await monthlyReportService.getDashboard(registryUser.app_user_id, requestedMonth);
      return [
        `Report ${requestedMonth}`,
        `Total: ${report.totals.totalSpent}`,
        `Fixed: ${report.totals.fixedTotal}`,
        `Variable: ${report.totals.variableTotal}`,
        `Count: ${report.transactionCount}`
      ].join("\n");
    }

    if (text.startsWith("/budget ")) {
      return this.#handleBudgetCreateCommand(text.replace(/^\/budget\s+/, ""), registryUser);
    }

    if (/^budget\s+/i.test(text)) {
      return this.#handleBudgetCreateCommand(text.replace(/^budget\s+/i, ""), registryUser);
    }

    if (text === "/budget") {
      const budget = await budgetConfigService.getBudgetByMonth(registryUser.app_user_id, monthKey);
      if (!budget) return `No budget configured for ${monthKey}.`;
      const calculation = await budgetStateService.getBudgetState(registryUser.app_user_id, monthKey);
      const state = calculation?.budgetState;
      return [
        `Budget ${monthKey}`,
        `Range: ${budget.budget_start_date} to ${budget.budget_end_date}`,
        `Principal: ${budget.principal_amount}`,
        `Today's base limit: ${state?.todayBaseLimit || "0"}`,
        `Today's remaining: ${state?.todayRemaining || "0"}`,
        `Remaining main budget: ${state?.remainingMainBudget || "0"}`,
        `Piggy bank: ${state?.piggyBank || "0"}`
      ].join("\n");
    }

    if (text.startsWith("/resync")) {
      const requestedMonth = text.split(/\s+/)[1] || monthKey;
      const result = await resyncService.resyncMonth(registryUser.app_user_id, requestedMonth);
      return `Resync complete for ${result.month}. Rows scanned: ${result.rowsScanned}.`;
    }

    if (text.startsWith("/add ")) {
      return this.#handleTransactionText(text.replace(/^\/add\s+/, ""), registryUser, message.message_id);
    }

    return this.#handleTransactionText(text, registryUser, message.message_id);
  }

  async #handleBudgetCreateCommand(text, registryUser) {
    const parts = text.trim().split(/\s+/);
    if (parts.length !== 3) {
      throw new AppError(400, "Use: budget DD-MM-YYYY DD-MM-YYYY amount");
    }

    const startDate = normalizeDateToken(parts[0]);
    const endDate = normalizeDateToken(parts[1]);
    const principalAmount = Number(parts[2]);

    if (!Number.isFinite(principalAmount) || principalAmount < 0) {
      throw new AppError(400, "Budget amount must be a valid positive number");
    }

    const monthKey = startDate.slice(0, 7);
    const budget = await budgetConfigService.upsertBudget(registryUser.app_user_id, {
      monthKey,
      principalAmount,
      openingPiggyBank: 0,
      carryForwardMode: "piggy_bank_only",
      startDate,
      endDate,
      isLocked: false
    });

    const calculation = await budgetStateService.getBudgetState(registryUser.app_user_id, monthKey);
    const state = calculation?.budgetState;

    return [
      `Budget saved for ${monthKey}`,
      `Range: ${budget.budget_start_date} to ${budget.budget_end_date}`,
      `Principal: ${budget.principal_amount}`,
      `Today's base limit: ${state?.todayBaseLimit || "0"}`,
      `Today's remaining: ${state?.todayRemaining || "0"}`,
      `Remaining main budget: ${state?.remainingMainBudget || "0"}`,
      `Piggy bank: ${state?.piggyBank || "0"}`
    ].join("\n");
  }

  async #handleTransactionText(text, registryUser, messageId) {
    if (!registryUser.user_sheet_id) {
      return `Finish setup first.\nOpen: ${magicLinkService.createLoginUrl(registryUser.app_user_id)}\nThen connect Google Sheets in Settings.`;
    }
    const categories = await categoryService.listForUser(registryUser.app_user_id);
    const parsed = transactionParserService.parse(text, categories);
    const category = parsed.categoryExists
      ? {
        category_id: parsed.categoryId,
        category_name: parsed.categoryName
      }
      : await categoryService.ensureForUser(registryUser.app_user_id, {
        categoryName: parsed.categoryName,
        transactionTypeDefault: parsed.transactionType
      });
    const transaction = await transactionWriteService.createForUser(registryUser.app_user_id, {
      ...parsed,
      categoryId: category.category_id,
      categoryName: category.category_name,
      source: "telegram",
      telegramMessageId: String(messageId),
      telegramRawText: text
    });

    return `Saved: ${transaction.item} | ${transaction.amount} | ${transaction.category_name} | ${transaction.transaction_type}`;
  }
}

module.exports = new TelegramCommandService();
