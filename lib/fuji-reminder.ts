/**
 * A calendar entry for the minutes Mt. Fuji is in view from a reader's train.
 *
 * Built in the browser from the timing model in lib/fuji-window.ts and handed
 * to the reader's own calendar, either as an .ics file (iPhone, Outlook, most
 * Android calendars) or as a Google Calendar link. Nothing is sent to or kept
 * by the site: no account, no email address, no server. The alarm five minutes
 * before the view opens is what makes it a reminder rather than a note.
 */

export type FujiReminder = {
  /** Asia/Tokyo date the view opens, "2026-03-28". */
  date: string;
  /** Asia/Tokyo times, "09:40". */
  first: string;
  peak: string;
  last: string;
  title: string;
  details: string;
  url: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** "2026-03-28" + "09:40" in Japan time → "20260328T004000Z". */
export function tokyoToUtcStamp(date: string, hhmm: string): string {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = hhmm.split(":").map(Number);
  // Japan has no daylight saving time, so UTC is always nine hours behind.
  const t = new Date(Date.UTC(y, mo - 1, d, h - 9, mi));
  return (
    `${t.getUTCFullYear()}${pad(t.getUTCMonth() + 1)}${pad(t.getUTCDate())}` +
    `T${pad(t.getUTCHours())}${pad(t.getUTCMinutes())}00Z`
  );
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Start and end stamps. The model gives clock times only, so a view that
 * straddles midnight would otherwise end before it starts.
 */
export function reminderSpan(r: Pick<FujiReminder, "date" | "first" | "last">) {
  const endDate = r.last < r.first ? addDays(r.date, 1) : r.date;
  return { start: tokyoToUtcStamp(r.date, r.first), end: tokyoToUtcStamp(endDate, r.last) };
}

/** RFC 5545 text escaping. */
function icsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

export function buildIcs(r: FujiReminder, now: Date = new Date()): string {
  const { start, end } = reminderSpan(r);
  const stamp = now.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//fujiseat.com//Mt Fuji reminder//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:fuji-${start}@fujiseat.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${icsText(r.title)}`,
    `DESCRIPTION:${icsText(`${r.details}\n${r.url}`)}`,
    `URL:${r.url}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT5M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsText(r.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

/** A data: URI rather than a blob, which iOS Safari hands straight to Calendar. */
export function icsDataUri(r: FujiReminder): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(r))}`;
}

export function googleCalendarUrl(r: FujiReminder): string {
  const { start, end } = reminderSpan(r);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: r.title,
    dates: `${start}/${end}`,
    details: `${r.details}\n${r.url}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Several views on one journey, one calendar file: an event per view, each
 * with its own alarm. Used by the route timeline; same rules as above.
 */
export type ViewEvent = FujiReminder & { alarmMinutes: number };

export function buildIcsEvents(events: ViewEvent[], now: Date = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const body = events.flatMap((e) => {
    const { start, end } = reminderSpan(e);
    return [
      "BEGIN:VEVENT",
      `UID:view-${start}-${icsText(e.title).replace(/[^a-z0-9]/gi, "").slice(0, 24)}@fujiseat.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${icsText(e.title)}`,
      `DESCRIPTION:${icsText(`${e.details}\n${e.url}`)}`,
      `URL:${e.url}`,
      "BEGIN:VALARM",
      `TRIGGER:-PT${e.alarmMinutes}M`,
      "ACTION:DISPLAY",
      `DESCRIPTION:${icsText(e.title)}`,
      "END:VALARM",
      "END:VEVENT",
    ];
  });
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//fujiseat.com//Window views//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...body,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function icsEventsDataUri(events: ViewEvent[]): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcsEvents(events))}`;
}
