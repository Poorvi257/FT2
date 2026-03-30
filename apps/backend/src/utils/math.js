function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function sum(values) {
  return roundCurrency(values.reduce((acc, value) => acc + Number(value || 0), 0));
}

module.exports = {
  roundCurrency,
  sum
};
