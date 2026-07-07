export interface Settings {
  weatherSource: "manual" | "auto";
  manualCity: string;
  customHue: number | null;
  hueEnabled: boolean;
  timezone: string;
}

const STORAGE_KEY = "md_settings";
const DEFAULTS: Settings = {
  weatherSource: "auto",
  manualCity: "",
  customHue: null,
  hueEnabled: false,
  timezone: "",
};
export function loadSettings(): Settings {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch (e) {
    if (process.env.NODE_ENV === "development") console.warn("[settings] loadSettings error", e);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  return { ...DEFAULTS };
}

export function saveSettings(s: Settings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    if (process.env.NODE_ENV === "development") console.warn("[settings] saveSettings error");
  }
}
