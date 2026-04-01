"use client";

import { useUiPreferencesStore } from "@/store/ui-preferences-store";

export function PreferencesControls() {
  const { theme, density, setTheme, setDensity } = useUiPreferencesStore();
  const isLight = theme === "light";
  const activeClass = isLight ? "bg-slate-900 text-white" : "bg-white/18 text-white";
  const idleClass = isLight
    ? "text-slate-600 hover:text-slate-900"
    : "text-white/65 hover:text-white";
  const groupClass = isLight ? "prefs-pill bg-white/85" : "prefs-pill";

  return (
    <div
      className={`flex shrink-0 flex-nowrap items-center gap-1.5 md:gap-2 text-[10px] uppercase tracking-widest sm:text-[11px] ${
        isLight ? "text-slate-800" : "text-white"
      }`}
    >
      <div className={`${groupClass} flex rounded-full p-1`}>
        <button
          type="button"
          onClick={() => setDensity("compact")}
          className={`rounded-full px-2 py-1 transition sm:px-2.5 ${density === "compact" ? activeClass : idleClass}`}
        >
          Compact
        </button>
        <button
          type="button"
          onClick={() => setDensity("comfortable")}
          className={`rounded-full px-2 py-1 transition sm:px-2.5 ${
            density === "comfortable" ? activeClass : idleClass
          }`}
        >
          Comfortable
        </button>
      </div>
      <div className={`${groupClass} flex rounded-full p-1`}>
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`rounded-full px-2 py-1 transition sm:px-2.5 ${theme === "light" ? activeClass : idleClass}`}
        >
          Day
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`rounded-full px-2 py-1 transition sm:px-2.5 ${theme === "dark" ? activeClass : idleClass}`}
        >
          Night
        </button>
      </div>
    </div>
  );
}
