export function getLocalDateParts(date = new Date(), timeZone = "UTC") {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});
}

export function currentMonthKey(timeZone = "UTC") {
  const parts = getLocalDateParts(new Date(), timeZone);
  return `${parts.year}-${parts.month}`;
}

export function currentDateKey(timeZone = "UTC") {
  const parts = getLocalDateParts(new Date(), timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}
