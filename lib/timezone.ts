import { loadSettings } from "@/lib/settings";

export const TIMEZONE_OPTIONS = [
  { value: "", label: "System" },
  { value: "Pacific/Pago_Pago", label: "UTC-11 (Samoa)" },
  { value: "Pacific/Honolulu", label: "UTC-10 (Hawaii)" },
  { value: "America/Anchorage", label: "UTC-9 (Alaska)" },
  { value: "America/Los_Angeles", label: "UTC-8 (Pacific)" },
  { value: "America/Denver", label: "UTC-7 (Mountain)" },
  { value: "America/Chicago", label: "UTC-6 (Central)" },
  { value: "America/New_York", label: "UTC-5 (Eastern)" },
  { value: "America/Halifax", label: "UTC-4 (Atlantic)" },
  { value: "America/St_Johns", label: "UTC-3:30 (Newfoundland)" },
  { value: "America/Sao_Paulo", label: "UTC-3 (Brasilia)" },
  { value: "Atlantic/Azores", label: "UTC-1 (Azores)" },
  { value: "Europe/London", label: "UTC+0 (GMT)" },
  { value: "Europe/Paris", label: "UTC+1 (CET)" },
  { value: "Europe/Helsinki", label: "UTC+2 (EET)" },
  { value: "Europe/Moscow", label: "UTC+3 (MSK)" },
  { value: "Asia/Dubai", label: "UTC+4 (Gulf)" },
  { value: "Asia/Karachi", label: "UTC+5 (PKT)" },
  { value: "Asia/Kolkata", label: "UTC+5:30 (IST)" },
  { value: "Asia/Dhaka", label: "UTC+6 (BST)" },
  { value: "Asia/Bangkok", label: "UTC+7 (ICT)" },
  { value: "Asia/Shanghai", label: "UTC+8 (CST)" },
  { value: "Asia/Tokyo", label: "UTC+9 (JST)" },
  { value: "Australia/Sydney", label: "UTC+10 (AEDT)" },
  { value: "Pacific/Noumea", label: "UTC+11 (NCT)" },
  { value: "Pacific/Auckland", label: "UTC+12 (NZST)" },
  { value: "Pacific/Tongatapu", label: "UTC+13 (TOT)" },
  { value: "Pacific/Kiritimati", label: "UTC+14 (LINT)" },
] as const;

export function getEffectiveTimezone(): string {
  const settings = loadSettings();
  return settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getUtcOffset(tz: string): string {
  const found = new Intl.DateTimeFormat("en", {
    timeZone: tz,
    timeZoneName: "shortOffset",
  })
    .formatToParts(new Date())
    .find((p) => p.type === "timeZoneName");
  const offset = found?.value;
  if (offset?.startsWith("GMT")) return offset.replace("GMT", "UTC");
  return offset || "UTC";
}
