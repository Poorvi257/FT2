const { SHEET_TABS, TRANSACTION_TYPES, USER_ONBOARDING_STATUS } = require("@ft2/shared");

const MONTH_TAB_HEADERS = [
  "txn_id",
  "entry_date",
  "entry_ts_utc",
  "entry_ts_local",
  "month_key",
  "item",
  "amount",
  "category_id",
  "category_name",
  "transaction_type",
  "source",
  "telegram_message_id",
  "telegram_raw_text",
  "notes",
  "created_at",
  "updated_at",
  "deleted_flag",
  "schema_version"
];

const CATEGORY_HEADERS = [
  "category_id",
  "category_name",
  "transaction_type_default",
  "is_active",
  "sort_order",
  "created_at",
  "updated_at"
];

const REGISTRY_HEADERS = [
  "app_user_id",
  "telegram_user_id",
  "telegram_chat_id",
  "telegram_username",
  "web_login_email",
  "user_sheet_id",
  "user_sheet_url",
  "timezone",
  "currency",
  "default_month_start_day",
  "onboarding_status",
  "telegram_linked_at",
  "last_login_at",
  "created_at",
  "updated_at",
  "version"
];

const SETUP_HEADERS = [
  "app_user_id",
  "display_name",
  "timezone",
  "currency",
  "telegram_user_id",
  "telegram_chat_id",
  "budgeting_enabled",
  "active_budget_id",
  "created_at",
  "updated_at"
];

const BUDGET_CONFIG_HEADERS = [
  "budget_id",
  "month_key",
  "principal_amount",
  "carry_forward_mode",
  "opening_piggy_bank",
  "budget_start_date",
  "budget_end_date",
  "is_locked",
  "created_at",
  "updated_at"
];

const SYNC_AUDIT_HEADERS = [
  "sync_id",
  "trigger_type",
  "month_key",
  "status",
  "rows_scanned",
  "issues_found",
  "started_at",
  "completed_at"
];

module.exports = {
  SHEET_TABS,
  TRANSACTION_TYPES,
  USER_ONBOARDING_STATUS,
  MONTH_TAB_HEADERS,
  CATEGORY_HEADERS,
  REGISTRY_HEADERS,
  SETUP_HEADERS,
  BUDGET_CONFIG_HEADERS,
  SYNC_AUDIT_HEADERS
};
