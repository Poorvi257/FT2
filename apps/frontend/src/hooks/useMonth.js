import { useMemo, useState } from "react";

function getCurrentMonthKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function useMonth() {
  const [month, setMonth] = useState(getCurrentMonthKey);
  const monthLabel = useMemo(() => month, [month]);

  return {
    month,
    setMonth,
    monthLabel
  };
}
