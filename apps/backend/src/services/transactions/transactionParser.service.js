const { TRANSACTION_TYPES } = require("../../config/constants");
const { AppError } = require("../../utils/errors");

class TransactionParserService {
  parse(rawText, categories = []) {
    const trimmed = String(rawText || "").trim();
    if (!trimmed) {
      throw new AppError(400, "Message is empty");
    }

    const tokens = trimmed.split(/\s+/);
    let explicitType;
    const lastToken = tokens[tokens.length - 1]?.toLowerCase();
    if ([TRANSACTION_TYPES.FIXED, TRANSACTION_TYPES.VARIABLE].includes(lastToken)) {
      explicitType = lastToken;
      tokens.pop();
    }

    const amountIndex = tokens.findIndex((token) => /^-?\d+(\.\d{1,2})?$/.test(token));
    if (amountIndex === -1) {
      throw new AppError(400, "Could not find amount. Use: item amount category [fixed|variable]");
    }

    const amount = Number(tokens[amountIndex]);
    if (amount <= 0) {
      throw new AppError(400, "Amount must be greater than 0");
    }

    const item = tokens.slice(0, amountIndex).join(" ").trim();
    const categoryName = tokens.slice(amountIndex + 1).join(" ").trim().toLowerCase();

    if (!item || !categoryName) {
      throw new AppError(400, "Could not parse message. Example: coffee 180 food variable");
    }

    const category = categories.find((entry) => {
      const normalizedName = String(entry.category_name || "").trim().toLowerCase();
      const isActive = String(entry.is_active || "").trim().toLowerCase();
      return normalizedName === categoryName && ["true", "1", "yes"].includes(isActive);
    });
    return {
      item,
      amount,
      categoryId: category?.category_id || "",
      categoryName: category?.category_name || categoryName,
      transactionType: explicitType || category?.transaction_type_default || TRANSACTION_TYPES.VARIABLE,
      categoryExists: Boolean(category)
    };
  }
}

module.exports = new TransactionParserService();
