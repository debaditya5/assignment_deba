export type RangeId = "7d" | "14d" | "30d";

export function daysForRange(range: RangeId): number {
  if (range === "7d") return 7;
  if (range === "14d") return 14;
  return 30;
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function formatDateYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getDateRange(range: RangeId): { from: Date; to: Date; days: string[] } {
  const to = startOfDay(new Date());
  const daysBack = daysForRange(range);
  const from = startOfDay(new Date(to));
  from.setDate(from.getDate() - (daysBack - 1));
  const days: string[] = [];
  const cursor = new Date(from);
  while (cursor <= to) {
    days.push(formatDateYYYYMMDD(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return { from, to, days };
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}


