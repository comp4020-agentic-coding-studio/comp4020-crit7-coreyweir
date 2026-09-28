// Due dates are stored as ISO 8601 strings in Canberra wall-clock time with
// their offset, exactly as the course publishes them: 2026-09-21T12:00:00+10:00.
// Extensions are counted in working days (Mon–Fri) on the Canberra calendar,
// keeping the original time of day. Public holidays are not skipped; the UI
// says so.

const ZONE = "Australia/Canberra";
const ISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?([+-]\d{2}:\d{2}|Z)$/;

const pad = (n: number) => String(n).padStart(2, "0");

/** The Canberra UTC offset ("+10:00" or "+11:00") in force at a wall-clock time. */
function canberraOffset(y: number, m: number, d: number, hh: number, mm: number): string {
  // Canberra is always UTC+10 or +11; probing at +10 lands within an hour of
  // the true instant, which only matters in the 2–3am changeover window.
  const probe = new Date(Date.UTC(y, m - 1, d, hh - 10, mm));
  const name = new Intl.DateTimeFormat("en-AU", { timeZone: ZONE, timeZoneName: "longOffset" })
    .formatToParts(probe)
    .find((p) => p.type === "timeZoneName")?.value;
  const match = name?.match(/GMT([+-]\d{2}:\d{2})/);
  return match ? match[1] : "+10:00";
}

export function addWorkingDays(iso: string, days: number): string {
  const m = ISO.exec(iso);
  if (!m) throw new Error(`not an ISO date-time: ${iso}`);
  if (!Number.isInteger(days) || days < 0) throw new Error(`bad day count: ${days}`);
  const [, y, mo, d, hh, mm, ss = "00"] = m;
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  let left = days;
  while (left > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    const dow = date.getUTCDay();
    if (dow !== 0 && dow !== 6) left--;
  }
  const Y = date.getUTCFullYear();
  const M = date.getUTCMonth() + 1;
  const D = date.getUTCDate();
  const offset = canberraOffset(Y, M, D, Number(hh), Number(mm));
  return `${Y}-${pad(M)}-${pad(D)}T${hh}:${mm}:${ss}${offset}`;
}

/** "Monday 28 September 2026, 12:00 pm" in Canberra time. */
export function formatDue(iso: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
