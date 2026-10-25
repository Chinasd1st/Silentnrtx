/**
 * Moon phase from the mean synodic month.
 *
 * Good to a few hours, which is plenty for a "how full is the moon tonight"
 * readout — no API needed, so it works offline and in the static export.
 */
const SYNODIC_MONTH = 29.530588853;
/** 2000-01-06 18:14 UTC — a known new moon. */
const NEW_MOON_EPOCH = Date.UTC(2000, 0, 6, 18, 14);

export interface MoonPhase {
  /** 0 = new, 0.5 = full, approaching 1 = new again. */
  fraction: number;
  /** Illuminated fraction, 0–1. */
  illumination: number;
  /** Days since the last new moon. */
  age: number;
}

export function getMoonPhase(date: Date = new Date()): MoonPhase {
  const elapsedDays = (date.getTime() - NEW_MOON_EPOCH) / 86_400_000;
  const age = ((elapsedDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const fraction = age / SYNODIC_MONTH;

  return {
    fraction,
    illumination: (1 - Math.cos(2 * Math.PI * fraction)) / 2,
    age,
  };
}
