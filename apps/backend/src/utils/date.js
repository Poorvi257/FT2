const { toMonthKey } = require("@ft2/shared");

function nowIso() {
  return new Date().toISOString();
}

function formatLocalDate(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(date);
}

function formatLocalDateTime(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  return formatter.format(date).replace(" ", "T");
}

function currentMonthKey(timeZone) {
  return toMonthKey(new Date(), timeZone);
}

module.exports = {
  nowIso,
  formatLocalDate,
  formatLocalDateTime,
  currentMonthKey
};
