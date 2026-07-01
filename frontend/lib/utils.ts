export const SESSION_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  gym:    { bg: "bg-blue-950",  text: "text-blue-400",  border: "border-blue-800", dot: "bg-blue-400" },
  walk:   { bg: "bg-green-950", text: "text-green-400", border: "border-green-800", dot: "bg-green-400" },
  cardio: { bg: "bg-cyan-950",  text: "text-cyan-400",  border: "border-cyan-800",  dot: "bg-cyan-400" },
  rest:   { bg: "bg-slate-900", text: "text-slate-400", border: "border-slate-700", dot: "bg-slate-500" },
};

export const SESSION_ICONS: Record<string, string> = {
  gym: "🏋️", walk: "🚶", cardio: "🏃", rest: "😴",
};

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "short", year: "numeric",
  });
}

export function getWeekDates(around?: string): string[] {
  const d = around ? new Date(around) : new Date();
  const monday = new Date(d);
  monday.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1));
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day.toISOString().split("T")[0];
  });
}

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function statusColor(actual: number | null, target: number): string {
  if (actual === null) return "text-slate-400";
  return actual <= target ? "text-green-400" : "text-red-400";
}

export function statusIcon(actual: number | null, target: number): string {
  if (actual === null) return "⏳";
  return actual <= target ? "✅" : "❌";
}
