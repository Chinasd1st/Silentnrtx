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
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    if (process.env.NODE_ENV === "development") console.warn("[settings] loadSettings error");
  }
  return { ...DEFAULTS };
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    if (process.env.NODE_ENV === "development") console.warn("[settings] saveSettings error");
  }
}
