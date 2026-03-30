const { listMonthDays } = require("@ft2/shared");

function getWeekBucket(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  const first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const diff = Math.floor((date - first) / (24 * 60 * 60 * 1000));
  return `week-${Math.floor(diff / 7) + 1}`;
}

module.exports = {
  listMonthDays,
  getWeekBucket
};
