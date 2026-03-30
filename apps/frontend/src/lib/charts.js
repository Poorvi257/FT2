export function getMaxValue(items, key = "amount") {
  return Math.max(...items.map((item) => Number(item[key] || 0)), 1);
}
