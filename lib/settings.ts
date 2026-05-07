export interface Settings {
  weatherSource: "manual" | "auto";
  manualCity: string;
  customHue: number | null;
  hueEnabled: boolean;
}

const STORAGE_KEY = "md_settings";
const DEFAULTS: Settings = {
  weatherSource: "auto",
  manualCity: "",
  customHue: null,
  hueEnabled: false,
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULTS };
}

export function saveSettings(s: Settings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}
