function normalizeTimezone(value) {
  return String(value || "").trim();
}

function isValidIanaTimezone(value) {
  const timeZone = normalizeTimezone(value);
  if (!timeZone) {
    return false;
  }

  try {
    Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

function normalizeCurrency(value) {
  return String(value || "").trim().toUpperCase();
}

function isValidCurrencyCode(value) {
  const currency = normalizeCurrency(value);
  if (!/^[A-Z]{3}$/.test(currency)) {
    return false;
  }

  try {
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency
    });
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  normalizeTimezone,
  isValidIanaTimezone,
  normalizeCurrency,
  isValidCurrencyCode
};
