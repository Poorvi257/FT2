const { createId } = require("../../utils/ids");
const { nowIso } = require("../../utils/date");
const userRegistryService = require("../users/userRegistry.service");
const userSheetService = require("../sheets/userSheet.service");

class CategoryService {
  #normalizeCategoryName(categoryName) {
    return String(categoryName || "").trim().toLowerCase();
  }

  #isActive(value) {
    return ["true", "1", "yes"].includes(String(value || "").trim().toLowerCase());
  }

  async listForUser(appUserId) {
    const user = await userRegistryService.getRequiredByAppUserId(appUserId);
    if (!user.user_sheet_id) {
      return [];
    }
    return userSheetService.getCategories(user.user_sheet_id);
  }

  async findByNameForUser(appUserId, categoryName) {
    const normalizedCategoryName = this.#normalizeCategoryName(categoryName);
    const categories = await this.listForUser(appUserId);

    return categories.find((entry) => {
      return this.#normalizeCategoryName(entry.category_name) === normalizedCategoryName && this.#isActive(entry.is_active);
    }) || null;
  }

  async createForUser(appUserId, input) {
    const user = await userRegistryService.getRequiredConnectedUser(appUserId);
    const normalizedCategoryName = this.#normalizeCategoryName(input.categoryName);
    const existing = await this.findByNameForUser(appUserId, normalizedCategoryName);

    if (existing) {
      return existing;
    }

    const timestamp = nowIso();
    const category = {
      category_id: createId("cat"),
      category_name: normalizedCategoryName,
      transaction_type_default: input.transactionTypeDefault,
      is_active: "true",
      sort_order: String(input.sortOrder || 999),
      created_at: timestamp,
      updated_at: timestamp
    };

    await userSheetService.appendCategory(user.user_sheet_id, category);
    return category;
  }

  async ensureForUser(appUserId, input) {
    const existing = await this.findByNameForUser(appUserId, input.categoryName);
    if (existing) {
      return existing;
    }

    return this.createForUser(appUserId, input);
  }
}

module.exports = new CategoryService();
