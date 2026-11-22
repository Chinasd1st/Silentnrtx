import { useEffect, useState } from "react";
import { MdBrightnessAuto, MdDarkMode, MdLightMode } from "react-icons/md";

type Mode = "system" | "light" | "dark";
const ORDER: Mode[] = ["system", "light", "dark"];

interface Props {
  labels: { prefix: string } & Record<Mode, string>;
}

function readStored(): Mode {
  try {
    const s = localStorage.getItem("theme");
    return s === "light" || s === "dark" ? s : "system";
  } catch {
    return "system";
  }
}

export default function ThemeToggle({ labels }: Props) {
  const [mode, setMode] = useState<Mode>(readStored);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const root = document.documentElement;
    const apply = () => {
      const dark = mode === "dark" || (mode === "system" && mq.matches);
      const next = dark ? "dark" : "light";
      if (root.dataset.theme === next) return;
      // Swap every color in the same frame: without this, elements with a
      // background-color transition (pills, nav) fade while the page snaps.
      root.setAttribute("data-theme-switching", "");
      root.dataset.theme = next;
      void root.offsetWidth;
      requestAnimationFrame(() => requestAnimationFrame(() => root.removeAttribute("data-theme-switching")));
    };
    apply();
    if (mode !== "system") return;
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [mode]);

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    setMode(next);
    try {
      if (next === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", next);
    } catch {
      /* storage unavailable — theme still applies for this visit */
    }
  };

  const Icon = mode === "light" ? MdLightMode : mode === "dark" ? MdDarkMode : MdBrightnessAuto;
  const label = `${labels.prefix}: ${labels[mode]}`;

  return (
    <button type="button" className="icon-btn state" onClick={cycle} aria-label={label} title={label}>
      <Icon aria-hidden="true" size={22} />
    </button>
  );
}
