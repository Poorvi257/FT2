const TRANSACTION_TYPES = {
  FIXED: "fixed",
  VARIABLE: "variable"
};

const USER_ONBOARDING_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  DISABLED: "disabled"
};

const SHEET_TABS = {
  REGISTRY: "users_registry",
  SETUP: "setup_config",
  CATEGORIES: "categories",
  BUDGET_CONFIG: "budget_config",
  SYNC_AUDIT: "sync_audit"
};

function padMonth(value) {
  return String(value).padStart(2, "0");
}

function toMonthKey(date, timeZone = "UTC") {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit"
  });
  const parts = formatter.formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  return `${parts.year}-${parts.month}`;
}

function listMonthDays(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const totalDays = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return Array.from({ length: totalDays }, (_, index) => {
    return `${year}-${padMonth(month)}-${String(index + 1).padStart(2, "0")}`;
  });
}

module.exports = {
  TRANSACTION_TYPES,
  USER_ONBOARDING_STATUS,
  SHEET_TABS,
  toMonthKey,
  listMonthDays
};
